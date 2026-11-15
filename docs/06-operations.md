# 06 Running the shop

Everyday jobs once the website is connected to the backend. Sign in to the admin at `<backend address>/app` (locally http://localhost:9000/app).
What you see depends on your role ([04](04-roles-and-access.md)).

## Products and prices

- Medusa admin → **Products**. Each design has five variants (S, M, L, XL, XXL). Edit the title, description, images and the price per variant.
- Local (Twi) name: put it in **Subtitle** and in metadata `local_name`; its meaning in `local_meaning`. The other metadata keys are listed in [03](03-backend-api.md).
- The website refreshes its product data about once a minute, so a change appears within a minute without redeploying.
- To hide a design, set it to **Draft**.

## Stock (inventory)

- Medusa admin → **Inventory**. Stock is kept per size at the **Accra** location. Add Kumasi as a second location when it opens.
- Placing an order reserves stock; cancelling an order puts it back.
- Inventory managers (role `inventory`) can only reach this area. A daily 08:00 alert (to those who opted in) lists what is low or sold out (threshold `LOW_STOCK_THRESHOLD`, default 3).

## Orders

- Medusa admin → **Orders**. New orders email the customer (confirmation) and alert the team members who opted in under **My notifications**.
- Until Paystack is connected, payment is confirmed with the customer on WhatsApp or by phone, and the order is marked paid in the admin.
- Order numbers on the website are `UM-0001`, `UM-0002`, and so on, matching Medusa's order numbers.

## Pre-orders

- Mark a design as pre-order with metadata `preorder = true` and a `ready_by` text such as "Mid-February".
- Pre-order variants do not track stock, so customers can always order them.
- With the backend connected, pre-orders are currently paid in full. The pay-a-deposit-now, balance-later model (draft: 50%) exists in the demo and is the next backend job.

## Custom styles, reviews and announcements

- Style requests: `/admin/style-requests` (API today; a Medusa admin page is on the roadmap).
- Reviews are held for approval; staff approve or delete them through `/admin/reviews`.
- Announcements: `POST /admin/announcements { title, body, url? }` emails customers who opted in to news and pushes to phones that allowed it.

## Before launch and after tests

- `npx medusa exec ./src/scripts/cancel-test-orders.ts` cancels open test orders (addresses ending `@example.com`) and restores stock.
- `npx medusa exec ./src/scripts/remove-test-accounts.ts` removes customer accounts made with `@example.com` addresses (run it after cancelling test orders).
- `npm run seed` adds missing designs and channels and never overwrites existing ones.
- Take a database copy (`pg_dump`) before bulk changes.
