# 07 Status and roadmap

Last updated 13 October 2026.

## Connected to the backend (website)

| Area | State |
|---|---|
| Products, prices, local names, stock, pre-order flags | Read from the backend (falls back to built-in data if it is down) |
| Guest checkout | Creates a real order on the backend, reserves stock, sends the confirmation email and admin alerts. Verified end to end against the live dev database. |
| Payment | "Confirm on WhatsApp" now. Paystack Mobile Money is built but **not yet tested** (needs a test key). |
| Customer accounts | Email sign-up and sign-in are real (server accounts, 7-day sign-in). Signed-in orders are attached to the customer. |
| Google sign-in | Wired end to end: the button opens Google, `/auth/google/callback` finishes the sign-in. Verified up to Google's own screen; the last step needs a real Google account, so it still has to be tried once in a browser. |
| Team alerts | Opt-in per person (email, phone, or both) on the Medusa admin page My notifications. Verified live. |
| Roles | Built and tested on the backend |

## Still running on browser storage (demo) in the website

Wishlist, saved addresses and measurements, reviews, custom-style requests, contact and corporate enquiries,
returns, order lookup after the first visit, vouchers and the whole web admin panel. These move to the backend next, in this order:

1. Saved addresses, MoMo numbers, measurements, wishlist and order history from the server (accounts exist; these extras are still kept on the device).
2. Custom-style requests, reviews, contact and corporate enquiries (the backend routes already exist).
3. Vouchers as Medusa promotions; "Track your order" from the server.
4. Retire the browser admin panel in favour of the Medusa admin (plus pages for style requests, reviews and the inbox).

## Mobile app

Built (shop, pre-order, cart, checkout, orders, wishlist, custom style, notifications, light and dark). It still uses built-in data.
Connecting it repeats the website work with the **Mobile app** key; the debug APK runs only with a development server, so the real APK
needs a release build (about an hour on the pendrive setup).

## Not built yet

- Backend deployment files and hosting ([05](05-going-live.md))
- Pre-order deposit and balance workflow on the server
- Delivery fee from a picked map location (Yango, Uber, Bolt rates) and delivery time
- SMS updates; WhatsApp Business API
- Image uploads for products and style requests (Cloudinary or R2 file provider)
- Corporate quotes workflow; cost per design for margin reports

## Waiting on the owner

- Confirm the proposed Twi names and meanings
- Confirm the 50% pre-order deposit and the pre-order ready dates
- Real prices, stock and photos
- Backend host choice and a domain (see [05](05-going-live.md))
- Paystack, Resend, Upstash and Firebase accounts
