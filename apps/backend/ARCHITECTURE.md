# Urban Men backend: decision and design

## What kind of shop this is

A single-brand menswear shop for Ghana (Accra and Kumasi first). About 10 to 15 designs, sizes S to XXL, matching trousers
with every shirt, customers who pay with Mobile Money, orders confirmed by WhatsApp, pre-orders for new designs, custom-style
requests, and later corporate (bulk) orders. One catalogue must serve the website and the mobile app. The owner needs a proper
admin (products, stock, prices, orders, staff roles), and the team is small, so running costs and maintenance must stay low.

## Decision: Medusa v2 (already in the repo)

| Option | Why not / why |
|---|---|
| **Medusa v2 (chosen)** | Open-source headless commerce engine in TypeScript. Products with variants (Size), inventory per size, carts, orders, customers, regions and currencies (GHS), promotions (vouchers), returns/exchanges, an admin dashboard, roles via the admin, and a clean way to add our own modules (style requests, reviews). One API for web and mobile. Free to self-host. |
| Shopify | Fast to start, but the monthly cost is in dollars, Ghana Mobile Money checkout is awkward, and the web and app designs we already built would be thrown away. |
| WooCommerce | WordPress hosting and plugin upkeep; weak fit for a custom Next.js site and an Expo app. |
| Saleor / Vendure | Capable, but heavier (Python/GraphQL or a larger Nest stack) with no advantage for a catalogue this size. |
| Fully custom (Supabase + own code) | Cheapest to start but we would rebuild carts, inventory, orders, discounts, returns and the admin ourselves. Not worth it. |

Medusa needs two services: **Postgres** (Neon, free) and **Redis** (local in development, Upstash in production).
The server is long-running Node, so it deploys to a host such as Railway, Render or Fly. It cannot run on Vercel's serverless functions.
The Next.js site stays on Vercel.

## What exists now

- `src/modules/paystack-payment`: a Paystack payment provider for **Ghana Mobile Money**. If the storefront sends a phone number and
  network (MTN MoMo, Telecel Cash, AT Money), it charges through Paystack's Charge API and the customer approves on their phone.
  Without a phone it opens Paystack's hosted page (MoMo + card). The webhook (`charge.success`, signature checked with HMAC SHA-512)
  confirms the payment. Registered only when `PAYSTACK_SECRET_KEY` is set. Provider id in a region: `pp_paystack_momo`.
- `src/modules/style-request`: custom-style requests with a two-way conversation (the "Request a custom style" feature).
- `src/modules/review`: ratings and reviews, held for approval, with a "verified purchase" flag.
- `src/scripts/seed.ts`: creates the Ghana shop (cedi store, Ghana region and tax, an Accra stock location, delivery, Shirts category,
  Size option, the 9 launch designs with 10 per size, local names in metadata). Safe to run twice. It also creates one publishable
  key per app, each tied to a single sales channel (Medusa needs exactly one channel per key to calculate stock), and switches the
  Ghana region to Paystack once `PAYSTACK_SECRET_KEY` is set.
- `src/scripts/cancel-test-orders.ts`: cancels open orders placed with `@example.com` addresses (pre-launch cleanup).
- Day-to-day documentation lives in the repo's `docs/` folder.

### API added

| Route | Who | What |
|---|---|---|
| `POST /store/style-requests` | anyone | send a custom-style request |
| `GET /store/style-requests` | customer | my requests and conversations |
| `POST /store/style-requests/:id/messages` | customer | reply on my request |
| `GET /admin/style-requests`, `GET/POST /admin/style-requests/:id`, `POST /admin/style-requests/:id/messages` | staff | list, update status/quote/note, reply |
| `GET /store/products/:id/reviews` | anyone | approved reviews, average, star breakdown |
| `POST /store/products/:id/reviews` | customer | add a review (pending approval) |
| `GET /admin/reviews`, `POST/DELETE /admin/reviews/:id` | staff | moderate |

Everything else (products, carts, checkout, orders, customers, vouchers) is Medusa's standard API.

## Product data contract (what the apps read)

Standard Medusa fields: `title` (descriptive English name), `subtitle` (the local Twi name), `handle` (slug), `description`, `images`,
variants per size with GHS prices and stock. Extra fields live in `product.metadata`:

`local_name`, `local_meaning`, `note` (short line for cards), `sleeve` ("Long sleeve" | "Short sleeve"), `colour`,
`includes_trousers` (boolean), `badge` ("New" | "Best seller" | "Limited" | null), `features` (string list),
`preorder` (boolean), `ready_by` (text shown to customers), `image_kinds` (list of "photo" | "flat", same order as the images).

Pre-order designs have `manage_inventory = false` on their variants, so stock never limits them.

## Pre-orders and the deposit (planned next, needs the running backend to test)

Version 1 sells pre-orders as normal orders paid in full, flagged by the product metadata. The deposit model on the website
and app (pay a share now, the rest before delivery) is built in the apps as a demo. The server side comes next:
a workflow that creates the first payment collection for the deposit amount and a second one for the balance
(Medusa supports additional payment collections on an order), with the balance requested from the admin when the pieces are ready.
The deposit percentage is a draft setting (50) until the owner confirms it.

## Roles, administrators and the root owner

Rules from the owner, enforced by the backend (`src/lib/rbac.ts`, `src/lib/enforce-role.ts`, wired in `src/api/middlewares.ts`) and mirrored in the web admin:

| Role | Access |
|---|---|
| **owner** (root) | Everything. The account **kkwesi956@gmail.com**. The only one who can change its own email or credentials; nobody else can edit, demote or remove it. |
| **admin** | Every area, including settings and staff. Can add, change or remove any staff member except the root owner. The two named administrators are **mandyemefa@gmail.com** and **nagbrand@gmail.com**. |
| **manager** | Products, inventory, orders, requests, inbox, reviews, customers, vouchers. No settings or staff. |
| **inventory** | Inventory (stock) only, plus read-only catalogue so names and sizes show. |
| **support** | Orders, requests, inbox, reviews, customers. Cannot change products. |

Roles live in `user.metadata.role`. The root email is always **owner** (metadata cannot override it), `ADMIN_EMAILS` are **admin** from their first sign-in, and an unknown account gets **support**, the least access. Every `/admin/*` request is checked: the role must be allowed to reach that area, and changes to `/admin/users/:id` are refused when the target is the root owner unless the caller is the root owner.
`GET /admin/staff` lists staff with roles; `POST /admin/staff/:id/role { role }` changes one (admin and owner only, never the root, never "owner"). Unit tests: `npm run test:unit` (16 tests, including the alert opt-in rules).

Medusa 2.20 also ships a beta RBAC module (`@medusajs/rbac`). We use this thin layer instead because it is fully unit-tested and states the root-owner rule explicitly; moving to the native module later is possible.

Setting up the people:
1. `npx medusa user -e kkwesi956@gmail.com -p <your-password>` (you run it, so only you know the password).
2. `npm run invite-admins` prints an invite link for each administrator; they open it and choose their own password.

## Customers: guests, optional accounts, Google

Shoppers never have to sign in: guest checkout stays. An account is optional (links their Gmail, keeps orders and wishlist). Sign up and log in with Google use Medusa's `auth-google` provider: set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `GOOGLE_CALLBACK_URL` (and add the callback to `AUTH_CORS`) and the provider registers itself (see `medusa-config.ts`). Until then the website and app show a clearly labelled preview button.

## Notifications (email and in the app)

- **Email** (Resend, free plan 3,000 a month): `src/modules/resend-notification`, branded navy and gold templates in `templates.ts` (order placed, order update, announcement, admin alert). Without `RESEND_API_KEY` emails are only logged. Verify a sending domain in Resend and set `NOTIFICATION_FROM`.
- **In-app push** (Expo push service, free): `src/modules/expo-push`. Phones register with `POST /store/push-tokens`; staff phones with `POST /admin/push-tokens`. Tokens are stored in `src/modules/push-token`. On Android real pushes also need a Firebase project (`google-services.json` in the app) and the FCM key uploaded to EAS; until then the app still shows local alerts and its notification centre.
- **Customers** choose what they get (order updates default on, news default off): `GET/POST /store/customers/me/notification-preferences`, and push opt-ins per phone.
- **The team opts in.** Alerts for new orders and pre-orders, custom style requests, reviews to approve and the daily 08:00 low-stock digest (`src/jobs/low-stock-digest.ts`) go only to staff who chose them, by the channel they chose (email, phone, or both) and only for areas their role covers. The choice is stored on the staff user (`metadata.alerts`, with the time consent was given) and set on the Medusa admin page **My notifications** (`src/admin/routes/my-notifications`, API `GET/POST /admin/notification-preferences`). Rules and tests: `src/lib/admin-alerts.ts`. If nobody has opted in, the alert is not sent and a warning is logged. Corporate enquiries and returns are next.
- **Announcements:** `POST /admin/announcements { title, body, url? }` emails customers who opted in to news and pushes to phones that allowed it, in batches of 25.
- Everything runs from Medusa events (`order.placed`, shipment and delivery events, plus our own `style_request.created`, `review.created`, `announcement.created`) in `src/subscribers`, so adding a new notification means adding one subscriber.

## Built to scale (from the business plan)

The plan goes from 10 to 15 sample designs and the first 100 pieces, to ad-driven growth, TikTok, corporate bulk orders and more locations. How the design copes:
- **Channels:** one Medusa sales channel per route to market (Website, Mobile app, WhatsApp Business, Instagram & Facebook, TikTok, Corporate orders), created by the seed. Orders, stock and reports can be split by channel; adding one is a row, not a rebuild.
- **Catalogue:** variants per size with inventory per stock location. The seed creates Accra; add Kumasi as a second location without code changes.
- **Events and queues:** emails and pushes are sent from subscribers and jobs on Redis, so slow providers never slow checkout. Announcements go out in batches.
- **Stateless API:** Medusa servers can run as several instances behind a load balancer; state is in Neon (Postgres) and Redis. Product photos move to a CDN (Cloudinary) before launch.
- **Corporate orders:** a bulk-enquiry flow exists on the website (`/corporate`); next is quotes and a "Corporate orders" sales channel workflow.
- **KPIs from the plan** (units sold, revenue, margin, repeat-customer rate, WhatsApp enquiries, conversion): orders and customers give most of these; margin needs a cost per design (planned as variant metadata `cost`), and WhatsApp enquiries need the WhatsApp Business API or a manual log.
- **Pagination everywhere:** shop and admin lists page their data; the apps cache the catalogue.

## Environment (`apps/backend/.env`, never committed)

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon direct (non-pooled) connection string for the `urbanmen` database |
| `REDIS_URL` | `redis://localhost:6379` in development |
| `JWT_SECRET`, `COOKIE_SECRET`, `AUTH_MFA_ENCRYPTION_KEY` | long random values; replace the placeholders before any shared deploy |
| `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` | allowed origins (add the Vercel URL and the Expo dev URL) |
| `PAYSTACK_SECRET_KEY` | test key (sk_test_...) from the Paystack dashboard; enables MoMo |
| `ROOT_ADMIN_EMAIL`, `ADMIN_EMAILS` | who is the root owner and who are the administrators (alert recipients are chosen by each person, see Notifications) |
| `RESEND_API_KEY`, `NOTIFICATION_FROM` | email sending (optional in development) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Sign in with Google for customers |
| `STOREFRONT_URL` | where product photos are served from while seeding (default https://urban-men.vercel.app) |

## Commands

```
cd apps/backend
npm run db:migrate     # create / update tables (Medusa + our modules)
npm run seed           # create the Ghana shop, sales channels and products (safe to repeat)
npm run invite-admins  # invite link for each named administrator
npm run test:unit      # role and root-owner rules
npm run dev            # API on http://localhost:9000, admin on http://localhost:9000/app
npx medusa user -e you@example.com -p a-strong-password   # first admin login
```

After changing a model in `src/modules/*/models`, generate a migration with `npx medusa db:generate <module>` and run `npm run db:migrate`.

## Roadmap

1. Run migrations + seed on Neon; create the admin user; connect the web and mobile apps to the store API.
2. Paystack test keys; MoMo checkout end to end (webhook URL on the deployed backend).
3. Pre-order deposit and balance workflow.
4. Custom admin pages for style requests and reviews; image uploads (Cloudinary file provider) for products and style requests.
5. Delivery fee from a picked map location (Google Maps) using Yango / Uber / Bolt rates; delivery time; email and SMS updates.
6. Corporate (bulk) order enquiries and quotes; roles for owner / manager / support using Medusa's admin users.
7. Deploy: backend on Railway/Render/Fly, Redis on Upstash, Neon production branch.
