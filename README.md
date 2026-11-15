# Urban Men Apparel

Ghana-market menswear e-commerce — single-brand storefront, web + mobile, built solo.
Full plan: open `build-plan.html` in a browser (or the published artifact).
**Documentation: [docs/](docs/README.md)** (overview, setup, API, roles, going live, running the shop, status).

## Structure

```
apps/
  backend/   Medusa commerce engine (Node/TypeScript) — products, orders, inventory, admin dashboard
  web/       Next.js storefront (customer-facing website)
  mobile/    Expo (React Native) app — iOS + Android
Original_logo.png   Source brand mark (crop/resize from this as needed; don't re-derive by hand)
build-plan.html      Full build plan / roadmap
```

All three apps talk to the same Medusa backend, so a product uploaded once through the
Medusa Admin sells on both web and mobile.

## Prerequisites

- Node.js 18+ (this repo was scaffolded on Node 22)
- A free [Neon](https://neon.tech) Postgres database (connection string)
- A free [Upstash](https://upstash.com) Redis database (connection string) — for reservation holds
- A free [Paystack](https://paystack.com) account in test mode (API keys)
- A free [Cloudinary](https://cloudinary.com) account (for product media)

None of these cost anything to set up — see the "Now — building" cost table in the build plan.

## Getting started

### 1. Backend (`apps/backend`)

Copy `.env.example` to `.env` and fill in your Neon/Upstash/Paystack values, then:

```
cd apps/backend
npm install
npx medusa db:migrate
npx medusa user -e you@example.com -p yourpassword   # create an admin login
npm run dev
```

Admin dashboard: http://localhost:9000/app

### 2. Web storefront (`apps/web`)

```
cd apps/web
npm install
npm run dev
```

Runs at http://localhost:3000 — point it at the backend via `.env.local`
(`NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000`).

### 3. Mobile app (`apps/mobile`)

```
cd apps/mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a`/`i` for an emulator.

## Notes

- Nothing in this repo is committed automatically — commits are done manually.
- Real secrets (`.env`, `.env.local`) are gitignored; only `.env.example` files are tracked.

## Android build (pendrive "STORE N GO")

The Android SDK and Gradle live on the pendrive (`E:\Android\Sdk`, `E:\.gradle`). It must be plugged in to build. In a new terminal
`ANDROID_HOME`, `GRADLE_USER_HOME` and `PATH` already point there. Build a debug APK:

```
cd apps/mobile
npx expo prebuild --platform android --no-install
cd android
gradlew.bat assembleDebug -PreactNativeArchitectures=arm64-v8a --max-workers=2
```

The APK is `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`. A debug build loads its JavaScript from `npx expo start`
(phone and PC on the same Wi-Fi). A standalone APK for sharing is `gradlew.bat assembleRelease`.

## Who can do what

See `apps/backend/ARCHITECTURE.md`: the root owner (kkwesi956@gmail.com), the administrators, inventory managers, notifications
and Google sign-in are described there.
