# 08 Deploying the backend on Google Cloud Run

The steps to put the shop backend (Medusa) on the internet. About 45 minutes the first time. Commands are for **Windows PowerShell**.
The files it needs are already in `apps/backend`: `Dockerfile`, `.dockerignore`, `.gcloudignore`.

> Not yet run end to end: there is no Google Cloud account here, and Docker is not installed on this PC.
> The pieces were checked separately (the build works without a `.env` file; the built server starts, serves the admin and the API,
> and listens on the `PORT` it is given). Expect to fix small things on the first deploy and tell me what you see.

## What you are creating

- One Cloud Run service `urban-men-backend` in **europe-west3 (Frankfurt)**, next to the Neon database.
- It stops when idle (costs nothing) and starts again on the next visit. Starting takes **30 to 60 seconds**, because Medusa loads a lot.
  The website wakes it as soon as someone opens the cart or sign-in page, so it is usually ready by checkout. Browsing the shop never waits for it.
- No Redis for now: one instance runs everything (`--max-instances 1`). Add Upstash Redis later when you need more than one instance.

## Costs, honestly

- Cloud Run has a monthly free allowance. With "CPU always on while awake" (needed so emails and the morning stock list are not delayed)
  and 2 GiB of memory, the free allowance covers roughly 50 hours of awake time a month in Frankfurt; after that it is a few cents per hour.
  A small shop that wakes the server a few times a day should stay inside it. Figures change: check
  [Cloud Run pricing](https://cloud.google.com/run/pricing).
- Frankfurt is a "Tier 2" region (slightly higher rates, the free allowance still applies). Belgium (`europe-west1`) or the Netherlands
  (`europe-west4`) are cheaper but a few milliseconds further from the database, which Medusa feels because it asks the database many small questions.
- **Set a budget alert** (step 1) so nothing surprises you.

## 1. Google Cloud account, project, billing

1. Open https://console.cloud.google.com with your Google account and accept the terms.
2. Create a project named `urban-men-shop` (top bar, project picker, New project). Note the **Project ID** it shows (for example `urban-men-shop-123456`) and the **Project number**.
3. Billing: Menu, Billing, link a billing account (a card is required; many Ghana Visa and Mastercard cards and virtual dollar cards work, but Google decides).
4. Budget alert: Billing, Budgets & alerts, Create budget, amount `5` USD, alerts at 50% and 100%, your email.

## 2. Install the tools

1. Install the Google Cloud CLI: https://cloud.google.com/sdk/docs/install (Windows installer). Open a **new** PowerShell window afterwards.
2. Sign in and choose the project:

```powershell
gcloud auth login
gcloud config set project YOUR-PROJECT-ID
gcloud config set run/region europe-west3
```

3. Turn on the services used:

```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com cloudscheduler.googleapis.com
```

## 3. Create the secrets

Make three long random values (do this once, keep them in a password manager, never commit them):

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run it three times: one for `JWT_SECRET`, one for `COOKIE_SECRET`, one for `AUTH_MFA_ENCRYPTION_KEY`. Then store them in Secret Manager.
This small helper saves a value exactly as typed (piping text straight into gcloud would add a hidden line break to it). Replace each `PASTE-...`;
the Neon string is the same `DATABASE_URL` as in `apps/backend/.env` (the direct, non-pooled one):

```powershell
function New-Secret($name, $value) { $f = "$env:TEMP\um-secret.txt"; [IO.File]::WriteAllText($f, $value); gcloud secrets create $name --data-file=$f; Remove-Item $f }

New-Secret JWT_SECRET "PASTE-VALUE"
New-Secret COOKIE_SECRET "PASTE-VALUE"
New-Secret AUTH_MFA_ENCRYPTION_KEY "PASTE-VALUE"
New-Secret DATABASE_URL "PASTE-NEON-URL"
New-Secret GOOGLE_CLIENT_ID "PASTE-GOOGLE-CLIENT-ID"
New-Secret GOOGLE_CLIENT_SECRET "PASTE-GOOGLE-CLIENT-SECRET"
```

(Prefer clicking? Menu, Security, Secret Manager, Create secret does the same.)

Let Cloud Run read them (replace `PROJECT-NUMBER` with the project number from step 1):

```powershell
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID --member="serviceAccount:PROJECT-NUMBER-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

## 4. Make sure the database is ready

The Neon database already has the tables and the nine designs. After any future change to the backend's data models, run this **from your PC** before deploying:

```powershell
cd "C:\Users\USER\Documents\Personl Projects\Urban Men\apps\backend"
npx medusa db:migrate
```

(Migrations are not run when the container starts: start-up must be quick and two instances must never migrate at once.)

## 5. First deploy

Cloud Run addresses are predictable: `https://urban-men-backend-PROJECT-NUMBER.europe-west3.run.app`. Use it below as `SERVICE-URL`
(with your real project number). The `^@^` at the start of the last line tells gcloud to separate the settings with `@`, because some values contain commas.

```powershell
cd "C:\Users\USER\Documents\Personl Projects\Urban Men\apps\backend"

gcloud run deploy urban-men-backend `
  --source . `
  --region europe-west3 `
  --allow-unauthenticated `
  --memory 2Gi --cpu 1 --cpu-boost --no-cpu-throttling `
  --min-instances 0 --max-instances 1 `
  --timeout 300 `
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,COOKIE_SECRET=COOKIE_SECRET:latest,AUTH_MFA_ENCRYPTION_KEY=AUTH_MFA_ENCRYPTION_KEY:latest,GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest" `
  --set-env-vars "^@^STORE_CORS=https://urban-men.vercel.app@ADMIN_CORS=SERVICE-URL@AUTH_CORS=https://urban-men.vercel.app,SERVICE-URL@BACKEND_URL=SERVICE-URL@STOREFRONT_URL=https://urban-men.vercel.app@GOOGLE_CALLBACK_URL=https://urban-men.vercel.app/auth/google/callback"
```

Notes:
- `--source .` uploads the folder to Google Cloud Build, which uses the `Dockerfile`. `.gcloudignore` keeps `.env` and other secrets out of the upload.
  The first build takes about 5 to 10 minutes. It may ask to create an Artifact Registry repository: answer `Y`.
- When it finishes it prints the real **Service URL**. If it differs from the `SERVICE-URL` you typed, fix the three settings that contain it:

```powershell
gcloud run services update urban-men-backend --region europe-west3 `
  --update-env-vars "^@^ADMIN_CORS=REAL-URL@AUTH_CORS=https://urban-men.vercel.app,REAL-URL@BACKEND_URL=REAL-URL"
```

## 6. Check it works

```powershell
curl.exe -s SERVICE-URL/health
curl.exe -s "SERVICE-URL/store/products?limit=1&fields=handle" -H "x-publishable-api-key: YOUR-WEBSITE-KEY"
```

The first call after idle takes 30 to 60 seconds. Then open `SERVICE-URL/app` for the admin. If the sign-in page loads but signing in fails
or loops, tell me: it usually means the cookie settings behind Google's proxy need one more line in `medusa-config.ts`.

Create your owner login (this runs on your PC against the same database, so nothing about it is stored in Google Cloud):

```powershell
cd "C:\Users\USER\Documents\Personl Projects\Urban Men\apps\backend"
npx medusa user -e kkwesi956@gmail.com -p YOUR-PASSWORD
```

Then ask me for the invite links for the two administrators (`npm run invite-admins`, with `BACKEND_URL` set to the Service URL).
**Each administrator then opens Medusa admin, My notifications, and chooses how they want to be told about orders** (email, phone or both). Nobody is sent alerts until they choose.

## 7. Keep the morning stock list working

The daily 08:00 low-stock job only runs while the server is awake. A tiny scheduled visit at 07:55 wakes it (Cloud Scheduler: 3 jobs free):

```powershell
gcloud scheduler jobs create http wake-urban-men --location europe-west3 `
  --schedule "55 7 * * *" --time-zone "Africa/Accra" `
  --uri "SERVICE-URL/health" --http-method GET
```

## 8. Connect the website

In Vercel, project settings, Environment Variables (Production), add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | the Service URL |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | the **Website** publishable key (`pk_7a5d52…`) |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | a password of your own, while the preview admin still exists |

Redeploy the website (Deployments, the three dots, Redeploy). The shop now shows live products, checkout places real orders, and sign-in is real.

## 9. Google sign-in for everyone

In Google Cloud, APIs & Services, OAuth consent screen (it may be called Google Auth Platform):
1. Branding: app name `Urban Men Apparel`, home page `https://urban-men.vercel.app`, privacy policy `https://urban-men.vercel.app/privacy`, terms `https://urban-men.vercel.app/terms`, authorised domain `urban-men.vercel.app`.
2. Audience: change **Testing** to **In production**. Until you do, only the test users you list can sign in with Google.
3. The redirect address `https://urban-men.vercel.app/auth/google/callback` is already in your OAuth client. A new domain later means adding its callback there and updating `GOOGLE_CALLBACK_URL`.

(The privacy and terms pages are still drafts: have them reviewed before launch.)

## Updating later

Change code, run migrations if models changed (step 4), then repeat the `gcloud run deploy` line from step 5 with only `--source .`, `--region`
and nothing else: Cloud Run keeps the settings and secrets from the last deploy.

```powershell
gcloud run deploy urban-men-backend --source . --region europe-west3
```

## Looking at logs and problems

```powershell
gcloud run services logs read urban-men-backend --region europe-west3 --limit 50
```

Or in the console: Cloud Run, urban-men-backend, Logs. Common causes: a wrong `DATABASE_URL` (the service fails to start), a missing website in `STORE_CORS`
(the browser blocks calls), or a secret the service account cannot read (step 3, last command).

## When to move off the free setup

- More than one instance needed (busy campaigns): add Upstash Redis (`REDIS_URL`) and raise `--max-instances`.
- Cold starts bother customers: `--min-instances 1` keeps one instance always on (paid, roughly the cost of a small server).
- Real payments and emails: add `PAYSTACK_SECRET_KEY` and `RESEND_API_KEY` as secrets (`--update-secrets`), then run `npm run seed` once from your PC so the Ghana region switches to Paystack.
