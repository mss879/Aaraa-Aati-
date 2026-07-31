# Supabase backend — setup

The admin back office runs on Supabase: the CRM pipeline, the two inboxes that feed it
(contact **Inquiries** and atelier **Crafting** requests), notes, AI-generation capture,
and the shop (**Products** and **Orders**). This folder holds the schema as one migration
per feature. Follow these steps once.

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

# Order email (Resend) — see "Order email" below
RESEND_API_KEY=re_...
RESEND_FROM="Ceylon Gem Maison <orders@ceylongemmaison.com>"
RESEND_REPLY_TO=support@ceylongemmaison.com
ORDERS_NOTIFY_EMAIL=                                  # optional internal copy of new orders
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
(`0001` → `0012`) and run it in the project's SQL editor. Order matters — later files
depend on the helpers and tables created by earlier ones.

| Migration | What it adds |
| --- | --- |
| `0001_init` | extensions, `set_updated_at()`, `admins` + `is_admin()` |
| `0002_leads` | CRM pipeline |
| `0003_inquiries` | contact-form inbox |
| `0004_notes` | dashboard scratchpad |
| `0005_generations` | AI render records |
| `0006_rate_limits` | durable rate limiting |
| `0007_storage` | private `ring-generations` bucket |
| `0008_craft_requests` | **Crafting inbox** — atelier commissions, and the links from `leads` / `generations` |
| `0009_shop` | `product_categories`, `products`, `product_images` (max 5 each) |
| `0010_orders` | `orders` + `order_items`, and the `CGM-…` order-number sequence |
| `0011_shop_storage` | public `product-images` bucket + policies |
| `0012_seed_categories` | seeds Rings, Earrings and Bracelets (the home-page categories) |
| `0013_order_emails` | the `out_for_delivery` step, courier + tracking columns, and the `order_emails` outbox log |

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

Two inboxes feed one pipeline. Nothing reaches the CRM until the admin sends it there.

- **Contact form** (`/contact`) → `inquiries` (status `new`) → **Admin → Inquiries →
  Send to CRM** → `leads` (`source='inquiry'`).
- **Atelier** (`/atelier`) → `craft_requests` (status `new`) → **Admin → Crafting →
  Send to CRM** → `leads` (`source='craft'`). The request is enriched with the visitor's
  `config` as they design, and every AI render (`generations`, image in the private
  `ring-generations` bucket) hangs off it. Promoting re-points those renders at the new
  lead, so the CRM card opens with the visitor's own images.
- **CRM** (`/admin/crm`): Kanban across New → Contacted → Qualified → Quoted → Won → Lost.

The shop is the other half of the back office:

- **Products** (`/admin/products`): each piece carries a title, description, optional
  price (leave it empty for "price upon request"), a category, and up to **five**
  photographs. Photographs upload straight from your browser session into the public
  `product-images` bucket; the five-per-piece cap is enforced by a database trigger.
  A piece is only visible in the shop when its status is **Live**.
- **Shop** (`/shop`): "Shop All" plus one crawlable URL per category
  (`/shop?category=rings`), and a page per piece at `/shop/<slug>`.
- **Orders** (`/admin/orders`): an order from `/shop/<slug>` lands as `pending` /
  `unpaid` with its line item snapshotted (title, price and thumbnail as they were at
  order time). Fulfilment (`status`) and money (`payment_status`) move independently —
  there is no payment gateway, the concierge confirms and invoices by hand.

Categories are seeded by migration `0012`. To add another (e.g. Necklaces), write a new
migration with the same `insert … on conflict (slug) do nothing` shape.

### Order email

Transactional email goes out through [Resend](https://resend.com). Create an account, add
`ceylongemmaison.com` under **Domains** and publish the DNS records it gives you, then put
the API key in `RESEND_API_KEY` and a sender on that domain in `RESEND_FROM`. (For a first
test before the domain is verified, `onboarding@resend.dev` works as the sender.)

The customer is written to at each step:

| When | Email |
| --- | --- |
| Order placed | "Your order is with us" — confirmation, nothing charged |
| Status → Confirmed | "Your order is confirmed" — piece reserved, invoice follows |
| Status → Shipped | "It has left the atelier" — with courier + tracking, if given |
| Status → Out for delivery | "Out for delivery today" — with courier + tracking, if given |
| Status → Completed | "Delivered — wear it well" |
| Status → Cancelled | "Your order has been cancelled" |

Marking an order **Shipped** or **Out for delivery** opens a dialog first, asking for the
courier, the tracking number and an optional tracking link; whatever you enter is saved on
the order and appears in that email. Leave it blank for a hand-delivered piece — the email
simply omits the tracking block. Re-opening the dialog and changing the tracking sends the
customer an updated email.

The **Email the customer** switch above the status pills turns notification off for a
single change (correcting a mis-click, back-dating an old order). Every attempt — sent or
failed — is listed under **Emails sent** on the order, so a bounce is visible rather than
silent. Without `RESEND_API_KEY` the switch is disabled and orders behave exactly as before.

### Security notes

- The public site never writes to the database directly. Every public write goes through
  a server API route using the service role, after validation + rate limiting. The only
  thing the anonymous role may read is the published catalogue (active categories, active
  products and their images); everything else is gated on `is_admin()`.
- Order prices are read from the `products` table on the server. The browser sends a
  product id and a quantity — never a price.
- Image generation is gated on an open craft request and rate-limited per IP and per
  request via the durable `rate_limit_hit()` counter (survives serverless cold starts).
  Client IPs are stored only as a salted hash.
- `product-images` is public-read (it is the storefront's photography, served from the
  CDN) and admin-write. `ring-generations` stays private — the dashboard reads it through
  short-lived signed URLs.
