# Supabase backend — setup

The admin back office (CRM, inquiries, notes, AI-generation capture) runs on Supabase.
This folder holds the schema as one migration per feature. Follow these steps once.

## 1. Create a project

Create a project at [supabase.com](https://supabase.com). Note the **Project URL** and,
under **Project Settings → API**, the **anon public** key and the **service_role** key.

## 2. Environment variables

Add to `.env.local` (and to your host, e.g. Vercel → Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key      # server-only, never exposed to the browser
ADMIN_EMAILS=you@yourdomain.com                       # comma-separated allowlist
RATE_LIMIT_SALT=any-long-random-string                # used to hash IPs before storage
```

The `service_role` key bypasses row-level security — keep it server-side only. It is
read exclusively by API routes and server actions; it is never bundled into client code.

## 3. Run the migrations

**Option A — Supabase CLI** (recommended):

```
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

**Option B — SQL editor:** open each file in `supabase/migrations/` in numeric order
(`0001` → `0007`) and run it in the project's SQL editor.

## 4. Lock down Auth

In **Authentication → Providers → Email**, keep email/password enabled but **disable
public sign-ups** (Authentication → Sign In / Providers → "Allow new users to sign up" → off).
The dashboard is a single-admin tool; only the account you create below should exist.

## 5. Create your admin user

1. **Authentication → Users → Add user** — create the admin with an email + password.
   (Set "Auto Confirm User" so it can log in immediately.)
2. Add that email to the allowlist so RLS recognises it. In the SQL editor:

   ```sql
   insert into public.admins (email) values ('you@yourdomain.com');
   ```

   Use the **same** email here, in `ADMIN_EMAILS`, and for the Auth user.

## 6. Restart

Restart `next dev` (or redeploy) so the new env vars load. Sign in at `/admin/login`.

---

### How data flows

- **Atelier** (`/atelier`): the visitor enters name + phone + email before designing →
  a `leads` row (`source='atelier'`, `stage='new'`). As they design and render, the
  lead is enriched with `config` and `generations` (image in the `ring-generations` bucket).
- **Contact form** (`/contact`): submissions become `inquiries` (status `new`) — **not**
  CRM leads. Promote the good ones from **Admin → Inquiries → Send to CRM**.
- **CRM** (`/admin/crm`): Kanban across New → Contacted → Qualified → Quoted → Won → Lost.

### Security notes

- The public site never talks to the database directly. Every public write goes through
  a server API route using the service role, after validation + rate limiting. All tables
  have RLS enabled with policies that grant access only to allow-listed admins (`is_admin()`).
- Image generation is lead-gated and rate-limited per IP and per lead via the durable
  `rate_limit_hit()` counter (survives serverless cold starts). Client IPs are stored only
  as a salted hash.
