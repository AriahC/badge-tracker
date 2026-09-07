# Badge Journey

Mobile-friendly web app for **Girl Scout families** to track badge progress, keep a notebook, and earn permanent digital badges. (Broader audiences are planned later — see `docs/veya/POSITIONING.md`.)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- npm
- Deploy target: Vercel
- Supabase + Solana (coming in later phases)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Marketing site

Founding Family early-access site lives in `marketing/` (separate Next.js app on port 3001):

```bash
cd marketing && npm install && npm run dev
```

## Docs in this repo

- `PROGRESS.md` — what works now + how to test
- `SETUP.md` — Supabase setup when ready
- `BACKLOG.md` — ideas for after the MVP
- `docs/veya/` — Founding Family briefs + copy
