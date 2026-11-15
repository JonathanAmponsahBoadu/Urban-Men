# 01 Overview

## The three apps

```
 Customers                                   Staff
 ─────────                                   ─────
 Website (Next.js, Vercel)                   Medusa admin  (backend /app)
 Android app (Expo / React Native)           Web admin preview (localStorage, being retired)
        │                                          │
        └───────────── Store API ──────────────────┤
                                                   ▼
                          Shop backend (Medusa v2, Node)  ──►  Neon Postgres (data)
                                   │                     ──►  Redis (events and queues)
                                   ├─► Paystack  (Mobile Money payments)
                                   ├─► Resend    (emails)
                                   └─► Expo push (app notifications)
```

| Folder | What it is |
|---|---|
| `apps/web` | The storefront (shop, pre-order, custom style, corporate orders, account, checkout) and the preview admin |
| `apps/mobile` | The Android app, same catalogue, local names and pre-orders |
| `apps/backend` | Medusa: products, stock per size, carts, orders, customers, vouchers, staff roles, plus our own modules (style requests, reviews, push tokens, Paystack, email, push) |
| `apps/Business Plans` | The business plan and the website update brief the work follows |
| `docs` | This documentation |

## How the website decides where its data comes from

One switch: the two variables `NEXT_PUBLIC_MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

- **Both set**: products, prices and live stock come from the backend; checkout creates a real order on the backend.
- **Either empty**: the site runs on its built-in demo data and the browser's storage, exactly like the first prototype.
  The live site at https://urban-men.vercel.app/ is in this mode until the backend is deployed.
- **Set but the backend is down**: the product pages fall back to the built-in list; checkout shows a clear error instead of pretending to work.

Code: [`apps/web/src/lib/api.ts`](../apps/web/src/lib/api.ts) (client), [`catalogue.ts`](../apps/web/src/lib/catalogue.ts) (products),
[`checkout.ts`](../apps/web/src/lib/checkout.ts) (orders).

## Key business rules (built in)

- Matching trousers come with every shirt unless the product says "Shirt only".
- Prices are in Ghana cedis (GH₵). The prices (300) and stock (10 per size) are **placeholders** until the owner supplies the real ones.
- Every design has a local (Twi) name shown first, with its meaning. The names are proposals until confirmed.
- Pre-order designs are made after ordering, so stock never limits them.
- Guests can buy without an account. An account is optional and can use Google sign-in.
- Delivery cost and time are confirmed with the customer for now.
- One sales channel per route to market (Website, Mobile app, WhatsApp Business, Instagram & Facebook, TikTok, Corporate orders),
  so reports can be split by channel. The website and the app each have their own publishable key tied to one channel.
