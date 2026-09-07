# Supabase setup (when you're ready)

We are using **mock localStorage** for onboarding right now so the app works without accounts. When you want real parent magic-link login, follow these steps.

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
