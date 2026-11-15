# 02 Local setup

Windows, Node 20+ and Git are assumed. Redis is needed locally (the backend works with Redis 5 and prints a warning; 6.2+ is recommended).

## 1. Backend

```
cd apps/backend
npm install
copy .env.example .env      # then fill in the values below
npm run db:migrate          # creates the tables on the Neon database
npm run seed                # Ghana region, Accra stock location, channels, the 9 designs, the website and app keys
npm run dev                 # API http://localhost:9000, admin http://localhost:9000/app
```

`npm run seed` is safe to repeat. It prints two keys: **Website publishable key** and **Mobile app publishable key**.

Create the owner login yourself so only you know the password:

```
npx medusa user -e kkwesi956@gmail.com -p <your-password>
```

After the backend is on the internet run `npm run invite-admins` once to get an invite link for each administrator
(mandyemefa@gmail.com, nagbrand@gmail.com).

### Backend `.env`

| Variable | What to put |
|---|---|
| `DATABASE_URL` | Neon connection string (direct host, database `urbanmen`) |
| `REDIS_URL` | `redis://localhost:6379` locally. Optional: with no value the backend keeps events in memory (fine for a single instance) |
| `JWT_SECRET`, `COOKIE_SECRET`, `AUTH_MFA_ENCRYPTION_KEY` | long random values (change the placeholders before any shared deploy) |
| `STORE_CORS` | websites allowed to call the store API, comma separated, e.g. `http://localhost:3000,https://urban-men.vercel.app` |
| `AUTH_CORS` | same list plus `http://localhost:9000` (the admin) |
| `ADMIN_CORS` | `http://localhost:9000` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google sign-in for customers; callback is the website's `/auth/google/callback` |
| `PAYSTACK_SECRET_KEY` | turns on real Mobile Money; leave empty to use "confirm payment on WhatsApp" |
| `RESEND_API_KEY`, `NOTIFICATION_FROM` | real emails; leave empty and emails are only written to the log |
| `EXPO_ACCESS_TOKEN` | optional, higher push limits |
| `STOREFRONT_URL` | where the seed fetches product photos from (default `https://urban-men.vercel.app`) |

## 2. Website

```
cd apps/web
npm install
copy .env.example .env.local   # set the two NEXT_PUBLIC_MEDUSA_* values to connect, or leave empty for demo data
npm run dev                    # http://localhost:3000
```

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `http://localhost:9000` (or the deployed backend) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | the **Website publishable key** from the seed |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | later, with Paystack |
| `NEXT_PUBLIC_ADMIN_EMAIL`, `NEXT_PUBLIC_ADMIN_PASSWORD` | sign-in of the preview admin panel only |

Restart `npm run dev` after changing `.env.local`.

## 3. Mobile app

```
cd apps/mobile
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_PUBLISHABLE_KEY` (the **Mobile app** key) before starting to connect it.
Building the Android file: see "Android build" in the root [README](../README.md) (SDK and Gradle live on the STORE N GO pendrive).

## Useful checks

```
cd apps/backend && npm run test:unit      # role and root-owner rules
cd apps/web && npx tsc --noEmit && npx eslint src
```

## Good to know

- Locally the database is in Frankfurt, so each backend call is slow from Ghana (a full checkout takes more than a minute).
  A deployed backend next to the database answers in well under a second per call.
- `npx medusa exec ./src/scripts/cancel-test-orders.ts` cancels every open order placed with an `@example.com` address and puts the stock back.
