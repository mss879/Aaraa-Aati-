# The AI Concierge — "Amara"

The maison's chat agent: answers visitors, books meetings, and puts qualified
people into the CRM by herself. Built into this codebase — there is no
third-party widget and nothing to configure in an external dashboard.

> Supersedes `ai-concierge-brief.md`, which was written when we expected the
> agent to be a third-party script.

---

## 1. What she does

| Job | How |
| --- | --- |
| Answers questions | System prompt generated from the site's own data — see §3 |
| Books meetings | Hands over `BOOKING_URL` (Calendly), never invents slots |
| Captures leads | `captureLead` tool → a row in `leads` with `source='ai'` |
| Leaves a record | Every message written to `ai_messages`, shown in **Admin → AI Inbox** |

She is **not** a triage queue. A visitor who has held a conversation and
volunteered a phone number goes **straight into the CRM pipeline** — unlike the
Inquiries and Crafting inboxes, which a human promotes by hand:

```
/contact  → inquiries      → promote by hand → leads (source='inquiry')
/atelier  → craft_requests → promote by hand → leads (source='craft')
AI chat   → leads (source='ai')                            ← straight in
```

---

## 2. File map

| File | Purpose |
| --- | --- |
| `src/lib/ai/agent-context.ts` | Personality, rules, and the generated knowledge base |
| `src/app/api/chat/route.ts` | The brain: model call, `captureLead` tool, transcript writes |
| `src/components/AiConcierge.tsx` | The floating chat widget |
| `src/app/admin/(app)/ai-inbox/page.tsx` | The AI Inbox page |
| `src/app/admin/_components/AiInboxView.tsx` | Conversation list + transcript reader |
| `supabase/migrations/0014_ai_concierge.sql` | `ai_conversations`, `ai_messages`, `leads.source='ai'` |

---

## 3. The knowledge base generates itself

This is the part worth understanding before editing anything.

`agent-context.ts` does **not** contain a hand-typed list of stones, metals,
settings or prices. It imports them from the same modules the website renders
from — `ring-options.ts`, `faq.ts`, `services.ts`, `contact.ts` — and formats
them into the prompt at request time.

**So: add a gemstone, change a per-carat rate, add a setting, or edit the FAQ,
and Amara knows on the next message. No edit here.** A hand-written prompt goes
stale the first time someone changes a price, and an agent quoting last month's
prices to a client is worse than no agent at all.

What *is* hand-written in that file is her character, her manner of speaking,
and the hard rules — the things that have no other source.

---

## 4. Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `OPENAI_API_KEY` | **yes** | Without it `/api/chat` returns 503 and the widget says so |
| `OPENAI_CHAT_MODEL` | no | Defaults to `gpt-4.1-mini` |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Without it she still answers; nothing is recorded |

**Model choice.** `gpt-4.1-mini` is the default: this job is latency-sensitive
(someone is watching a typing indicator) and it follows instructions and calls
tools far more reliably than the cheaper tier — which matters because a missed
tool call is a lost lead. To change it, set `OPENAI_CHAT_MODEL`; no code change.

Restart `npm run dev` after editing `.env.local` — Next does not hot-reload it.

---

## 5. Lead capture, and why it can't be talked into nonsense

`captureLead` runs the details through `src/lib/lead-validation.ts` — the exact
rules the contact form, checkout and atelier prompt use. A model can be talked
into accepting "Mickey Mouse, 1234567890"; a CRM full of that is worse than an
empty one.

When validation refuses, the failure is returned to her as a normal tool result
so she asks the visitor to check the number — it does not throw, and the
conversation is never derailed. She is instructed never to mention systems or
errors.

Two deliberate behaviours:

- **Phone is the priority.** Name + phone is what the maison works from. Email
  is accepted alone, in which case `leads.phone` gets a `—` placeholder (the
  column is `NOT NULL`).
- **Calling twice updates, never duplicates.** If the conversation already has a
  `lead_id`, a second call corrects the existing card. This is what a visitor
  fixing a typo actually looks like.

If Supabase is unreachable the tool still reports success to her. That is
intentional: our outage must not make a visitor recite their phone number twice.

---

## 6. Migration

`supabase/migrations/0014_ai_concierge.sql` — run it in the Supabase SQL editor.
It depends on `set_updated_at()` and `is_admin()` from `0001_init.sql`, both
already present.

Until it is run, **the agent still works**: she answers normally and lead capture
reports success. Only the transcript and the CRM row are skipped. The AI Inbox
will simply be empty.

---

## 7. Prompt-injection posture

Visitor messages are data, not instructions. The prompt tells her never to adopt
a new role or repeat her instructions, and the tool layer is the real guard: the
only thing she can change in the world is inserting one validated lead row. She
cannot read other conversations, cannot query the database, and cannot send
email. The blast radius of a successful jailbreak is a rude reply.
