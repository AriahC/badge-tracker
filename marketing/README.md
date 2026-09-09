# Veya Marketing Site

Founding Family early-access marketing funnel with Solana payments ($1+ USD in SOL).

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
- `/founding-family` — Solana checkout ($1+ in SOL to treasury)
- `/welcome/founding-family` — confirmation after on-chain verify
- `/faq`, `/privacy`, `/terms`, `/refunds`, `/contact`, `/parent-support`

## Payments

- Treasury: `R9wEoz95MmM5uqgn1iuxqcgxeqakyeMnRVaXY1xEh9P` (overridable via `NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS`)
- Minimum: $1 USD equivalent in SOL (live quote via CoinGecko)
- Copy promise: **$1 gets early access to the app once it's available**

## Deploy (separate from the Badge Journey app)

This app is meant to be its **own** Vercel project — do not change the Root Directory of `badge-tracker`.

1. Import GitHub repo `AriahC/badge-tracker` as a **new** Vercel project named e.g. `veya-marketing`
2. Set **Root Directory** to `marketing`
3. Framework: Next.js
4. Add env vars (Production + Preview):
   - `NEXT_PUBLIC_APP_URL` = the Vercel URL for this marketing project
   - Optional: `SOLANA_RPC_URL` / `NEXT_PUBLIC_SOLANA_RPC_URL` for a dedicated RPC
5. Deploy — Git pushes to `main` will auto-update this project only for the `marketing/` folder when Root Directory is set

See `.env.example` for local setup.

## Source docs

See `../docs/veya/` for North Star, build guide, and copy.
App screen assets live in `public/veya/` (copied from the product pack).
