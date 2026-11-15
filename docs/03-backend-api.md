# 03 Backend API

The backend is Medusa v2. Standard commerce (products, carts, checkout, orders, customers, promotions) uses Medusa's own
[Store API](https://docs.medusajs.com/api/store); the routes below are the ones we added.

Every store request carries the header `x-publishable-api-key: <key>`. The website key is tied to the **Website** channel and the app key to the **Mobile app** channel.

## Our routes

| Route | Who | What |
|---|---|---|
| `POST /store/style-requests` | anyone | send a custom-style request |
| `GET /store/style-requests` | customer | my requests and conversations |
| `POST /store/style-requests/:id/messages` | customer | reply on my request |
| `GET /store/products/:id/reviews` | anyone | approved reviews, average, star breakdown |
| `POST /store/products/:id/reviews` | customer | add a review (held for approval) |
| `POST /store/push-tokens` | app | register a phone for notifications |
| `GET/POST /store/customers/me/notification-preferences` | customer | email and news preferences |
| `GET /admin/style-requests`, `GET/POST /admin/style-requests/:id`, `POST /admin/style-requests/:id/messages` | staff | list, update status, quote, note, reply |
| `GET /admin/reviews`, `POST/DELETE /admin/reviews/:id` | staff | moderate reviews |
| `GET /admin/staff`, `POST /admin/staff/:id/role` | admin, owner | list staff with roles; change a role |
| `POST /admin/push-tokens` | staff | register a staff phone |
| `GET/POST /admin/notification-preferences` `{ email, push, areas }` | staff (own only) | choose how, and about what, I am alerted |
| Customer sign-in: `POST /auth/customer/emailpass/register`, `/auth/customer/emailpass`, `/auth/customer/google`, `/auth/customer/google/callback`, then `POST /store/customers`, `GET /store/customers/me` | customers | Medusa's own routes, used by the website |
| `POST /admin/announcements` `{ title, body, url? }` | admin, owner | email opted-in customers and push to phones (batches of 25) |

Every `/admin/*` call is checked against the caller's role (see [04](04-roles-and-access.md)).

## Placing an order from a storefront (what the website does)

1. `GET /store/regions` → the Ghana region id and its payment providers.
2. `POST /store/carts` with `region_id`, `email`, `items` (variant ids), `shipping_address`, `metadata` (delivery details, pre-order timing).
3. `GET /store/shipping-options?cart_id=…` then `POST /store/carts/:id/shipping-methods`.
4. `POST /store/payment-collections` then `…/payment-sessions` with the region's provider:
   `pp_system_default` (payment confirmed with the customer on WhatsApp) or `pp_paystack_momo` (real Mobile Money prompt, data `{ phone, network, email }`).
5. `POST /store/carts/:id/complete` → the order. With Paystack the website repeats this call until the customer approves on their phone.

Placing the order reserves stock, sends the customer's confirmation email and alerts the administrators.

## Product data contract

Standard Medusa fields: `title` (descriptive English name), `subtitle` (local Twi name), `handle` (the slug), `description`, `images`,
one variant per size (S to XXL) with a GHS price and stock per location. Extra fields live in `product.metadata`:

| Key | Meaning |
|---|---|
| `local_name`, `local_meaning` | Twi name and what it means |
| `note` | short line for cards |
| `sleeve` | `"Long sleeve"` or `"Short sleeve"` |
| `colour` | one of White, Cream, Black, Navy, Blue, Charcoal |
| `includes_trousers` | boolean (false shows "Shirt only") |
| `badge` | `"New"`, `"Best seller"`, `"Limited"` or null |
| `features` | list of strings |
| `preorder`, `ready_by` | open for pre-order, and the date text customers see |
| `image_kinds` | `"photo"` or `"flat"` for each image, same order |

Pre-order designs have inventory management switched off on their variants, so stock never limits them.
The website mapping is in [`apps/web/src/lib/catalogue.ts`](../apps/web/src/lib/catalogue.ts).

## Notifications

- **Email** (Resend): order placed, order updates, announcements, admin alerts. Without `RESEND_API_KEY` the emails are only logged.
- **App push** (Expo): phones register with `POST /store/push-tokens`. Android push also needs Firebase (see [05](05-going-live.md)).
- Everything runs from Medusa events in `apps/backend/src/subscribers`, so a new notification is one new subscriber.
- **The team opts in.** Staff choose, in Medusa admin under **My notifications**, whether they are told by email, on their phone, or both, and about which things: new orders and pre-orders, custom-style requests, reviews to approve, and a daily 08:00 low-stock list. Nothing is sent to anyone who has not chosen; the time of consent is stored. An inventory manager can only choose stock alerts.
