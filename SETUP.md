# Supabase setup (when you're ready)

We are using **mock localStorage** for onboarding right now so the app works without accounts. When you want real parent magic-link login, follow these steps.

## Solana badge minting (hackathon demo)

Badges mint as **Metaplex Bubblegum compressed NFTs on Solana devnet**. The app pays fees; kids never sign.

1. Install deps (`npm install`) if you haven’t.
2. Run one-time tree setup (writes `.env.local` for you):

```bash
npm run setup:badge-tree
```

3. If the public airdrop is rate-limited, open the printed faucet URL (GitHub sign-in helps), then:

```bash
npm run setup:badge-tree:wait
```

4. For production demos, copy the same vars into Vercel and set `NEXT_PUBLIC_APP_URL=https://badge-tracker-two.vercel.app`.
   The mint + Swig API routes must be **committed and deployed** first (`/api/mint`, `/api/swig/wallet`). Until then production returns 404 and the UI shows “Minting isn’t set up yet.”
5. Restart `npm run dev`, then smoke-test:

```bash
npm run mint:smoke
```

Earn a badge → **Create Swig wallet** (or paste a Solana address) → **Make it permanent** → open the Solana Explorer **tx** link.

### Swig parent wallet (hackathon)

Badge Journey uses the [Swig](https://onswig.com) protocol SDK (`@swig-wallet/classic`) so the parent gets a smart-wallet address as the cNFT `leafOwner`. Minting stays server-side (app pays with `BADGE_MINTER_SECRET`); kids never sign.

1. Ensure `BADGE_MINTER_SECRET` is set **and funded on devnet** (Swig create + Bubblegum mint both need SOL). Faucet: https://faucet.solana.com
2. Ensure `BADGE_TREE` is set (`npm run setup:badge-tree` / `setup:badge-tree:wait`).
3. Restart `npm run dev`.
4. Optional protocol check: `npm run swig:smoke`
5. On a completed badge, tap **Create Swig wallet**. The app:
   - generates a parent authority keypair in `localStorage` (demo only)
   - creates the on-chain Swig account (app pays rent)
   - stores the Swig **wallet-address PDA** via `saveMintWallet`
6. Tap **Make it permanent** to mint to that address.

Fallback: **Or paste a Solana address** / `NEXT_PUBLIC_DEMO_OWNER` still works if Swig create isn’t available.

No Swig API key / Para / Developer Portal setup is required for this MVP path.

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New project**
3. Name it something like `badge-tracker`
4. Set a database password (save it somewhere safe)
5. Choose a region close to you
6. Wait until the project is ready

## 2. Copy your API keys

In Supabase: **Project Settings → API**

Copy:

- **Project URL**
- **anon / public** key

## 3. Add them to this app

1. Copy `.env.example` to `.env.local`
2. Paste your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Restart the dev server (`npm run dev`)

## 4. What we'll add next with Supabase

- `profiles`, `badges`, `requirements`, `progress`, `notebook_entries` tables
- Row Level Security so a parent only sees their child’s data
- Magic-link email sent to the **parent’s** email
- Private photo storage bucket

No need to do this before trying onboarding today.
