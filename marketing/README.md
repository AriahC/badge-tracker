# Veya Marketing Site

Founding Family early-access marketing funnel (UI-only; Stripe next).

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

## Stripe setup

1. Copy `.env.example` → `.env.local`
2. Paste your Stripe **secret** and **publishable** keys (test keys first)
3. Set `NEXT_PUBLIC_APP_URL=http://127.0.0.1:3001` locally
4. Restart `npm run dev`
5. Use Stripe test card `4242 4242 4242 4242` to complete a $1 payment

Live charges require live keys (`sk_live_…`) and a real domain in `NEXT_PUBLIC_APP_URL`.

## Source docs

See `../docs/veya/` for North Star, build guide, and copy.
App screen assets live in `public/veya/` (copied from the product pack).
