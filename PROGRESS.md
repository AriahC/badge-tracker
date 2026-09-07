# Progress

## What works now

- Warm adventure-notebook UI + Nunito / Atkinson fonts
- **GSUSA referential badge pack** (365 badges, all levels Daisy → Ambassador)
  - Seed: `data/badges.seed.json` from `npm run transform:gsusa`
  - Source extract: `data/gsusa/girl-scout-badges/` (see `data/gsusa/CONTENT.md`)
  - Official titles/levels kept; step summaries are Veya-original
  - Official Explorer artwork **not** shipped — Veya HQ icons only
  - Independent-companion note on badge detail
- Home groups by topic category for the child’s level (clumps scale for larger packs)
- Notebook / Journal / Gallery / Onboarding + bottom nav

## How to test

```bash
npm run transform:gsusa   # optional refresh from data/gsusa pack
npm run dev
```

Open **http://localhost:3000** — onboarding → pick a level → Home clumps → badge detail → note → Journal.

Reset demo progress after this content swap (old demo badge ids no longer exist).

## Positioning

- **Now:** Girl Scout families only (see `docs/veya/POSITIONING.md`)
- **Later:** open to more people / programs — keep packs reversible

## Still later

- Real Solana minting
- Supabase accounts / cloud save
- Remote content-pack switch (disable GSUSA pack without App Store release)
- Licensed official art only if/when authorized
- Non–Girl Scout content packs + onboarding
