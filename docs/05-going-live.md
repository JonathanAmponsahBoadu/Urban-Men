# 05 Going live

## Where each piece runs

| Piece | Where | Cost |
|---|---|---|
| Website | Vercel (already live at https://urban-men.vercel.app/) | free |
| Database | Neon Postgres, Frankfurt (`eu-central-1`) | free plan |
| Redis | Not needed at first (one backend instance runs everything). Upstash later, when more than one instance is needed | free plan |
| Backend (Medusa) | **Google Cloud Run, region `europe-west3` (Frankfurt)**, next to the database | free allowance, needs a billing card |
| Emails | Resend | free: 3,000 a month |
| App push | Expo push service | free |
| Mobile Money | Paystack Ghana | per-transaction fees |

### Why the backend is the hard one

Medusa is a long-running Node server, so it cannot run on Vercel's serverless functions. It also wants about 1 GB of memory
(512 MB is tight). That narrows the free options:

| Host | Free plan | Wake after idle | Verdict |
|---|---|---|---|
| **Google Cloud Run** | about 2M requests, 180k vCPU-seconds, 360k GiB-seconds a month; choose 1 GiB or more | seconds (Medusa takes longer than a tiny API) | **Recommended.** Needs a card. Keep the CPU "always allocated" or ping it with Cloud Scheduler so emails and the 08:00 digest are not delayed. |
| Render | 750 hours, 512 MB, 0.1 CPU, no card | about 1 minute after 15 minutes idle | Fallback if no card. Slow and tight on memory. |
| Koyeb | 1 free service, 512 MB, card hold | 1 to 5 seconds | Memory too small. |
| Railway | $5 one-off credit | n/a | Not really free. |
| Fly.io | no free tier for new users | n/a | Pay as you go. |
| Cloudflare | Workers are free but cannot run Medusa; **Containers need the $5 a month Workers plan** | n/a | Not for the backend. Useful elsewhere (below). |

Free options were checked in October 2026 and change often; re-check before signing up.

### Where Cloudflare does help

- DNS, CDN and free HTTPS for your own domain in front of Vercel and the backend.
- R2 (S3-compatible storage) for product and style-request photos, through Medusa's S3 file provider, instead of Cloudinary.
- It is not needed to run the shop; add it when you buy a domain.

## Launch checklist

Do these in order. Items marked **you** need your own accounts.

1. **Backend host**: Google Cloud Run. The Dockerfile and step-by-step guide are ready: [08 Deploying on Cloud Run](08-cloud-run.md).
2. **Redis**: skip for now. One instance (`--max-instances 1`) needs none; add Upstash and `REDIS_URL` when traffic needs more instances.
3. **Production secrets**: new long random `JWT_SECRET`, `COOKIE_SECRET`, `AUTH_MFA_ENCRYPTION_KEY`; never reuse the development ones.
4. **Deploy the backend** with the environment variables from [02](02-local-setup.md). Set `STORE_CORS`, `AUTH_CORS`, `ADMIN_CORS` to the real addresses.
5. **Owner and administrators**: create the owner login, then run `npm run invite-admins` against the live backend.
6. **Point the website at it**: on Vercel add `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (the backend address) and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (the Website key), then redeploy. Also set `NEXT_PUBLIC_ADMIN_PASSWORD` while the preview admin still exists.
7. **Google sign-in** (**you**): in Google Cloud, OAuth consent screen, set the app to **In production** and fill the branding links (home page, privacy policy, terms, authorised domain). Set `GOOGLE_CALLBACK_URL` to `https://<your-site>/auth/google/callback`. The redirect URIs for `urban-men.vercel.app` and `localhost:3000` are already registered. A new domain means adding its address in Google, and nothing else is lost.
8. **Paystack** (**you**): create a Ghana account, use **test keys** first (`sk_test_…`), set the webhook URL to `<backend>/hooks/payment/paystack_momo`, test MTN, Telecel and AT, then switch to live keys. With the key set, run `npm run seed` again: it adds `pp_paystack_momo` to the Ghana region and the website then offers the real Mobile Money prompt. Without a key checkout stays on "confirm payment on WhatsApp".
9. **Resend** (**you**): create an account, verify your domain, set `RESEND_API_KEY` and `NOTIFICATION_FROM`.
10. **Android app** (**you** and me): build a release APK or AAB with the **Mobile app** key and the live backend address; Android push needs a Firebase project (`google-services.json`) and the FCM credentials uploaded to EAS.
11. **Real content** (**you**): real prices, stock, photos, confirmed Twi names, pre-order dates and the deposit percentage.
12. **Clean up**: run `npx medusa exec ./src/scripts/cancel-test-orders.ts`; consider starting from a fresh database so order numbers begin at 1.

## Domain

Buying a domain later is fine. Things that change: `STORE_CORS`/`AUTH_CORS`, `GOOGLE_CALLBACK_URL` and the Google authorised domain/redirect, the
Vercel domain, Paystack's webhook (if the backend address changes), and `SITE_URL` in the website.

## Backups and safety

- Neon keeps point-in-time history on the free plan for a short window; take a manual copy (`pg_dump`) before big changes.
- Never put `.env`, API secrets or Google `client_secret*.json` in the repository. They are listed in `.gitignore`.
