# Veya Marketing Site

Founding Family early-access marketing funnel with Stripe Checkout ($1 once).

## Run

```bash
cd marketing
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

The product app stays on port 3000 in the repo root.

## Routes

- `/` — homepage
- `/founding-family` — checkout (Stripe Checkout, $1 once)
- `/welcome/founding-family` — confirmation after paid session
- `/faq`, `/privacy`, `/terms`, `/refunds`, `/contact`, `/parent-support`

## Deploy (separate from the Badge Journey app)

This app is meant to be its **own** Vercel project — do not change the Root Directory of `badge-tracker`.

1. Import GitHub repo `AriahC/badge-tracker` as a **new** Vercel project named e.g. `veya-marketing`
2. Set **Root Directory** to `marketing`
3. Framework: Next.js
4. Add env vars (Production + Preview):
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL` = the Vercel URL for this marketing project (e.g. `https://veya-marketing.vercel.app`)
5. Deploy — Git pushes to `main` will auto-update this project only for the `marketing/` folder when Root Directory is set

Local Stripe setup still uses `.env.local` (see `.env.example`).

## Source docs

See `../docs/veya/` for North Star, build guide, and copy.
App screen assets live in `public/veya/` (copied from the product pack).
