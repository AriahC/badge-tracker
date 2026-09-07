# UI Designer Prompt — Badge Journey

Paste everything below the line into ChatGPT (or another design AI) when you start UI work.

---

You are helping me redesign the UI for **Badge Journey**, a mobile-first web app for individual Girl Scouts (not troops). The product is already partially built in Next.js; your job is to propose clearer, warmer, more polished UI/UX while keeping the same features and flows.

## Audience

- Kids roughly ages 5–17 (Daisy through Ambassador), with a parent involved only for signup/login
- Must be readable by a younger child with a 🔊 read-aloud button
- Must not feel babyish to a 12-year-old
- Warm, bright, playful, big touch targets (min 48px), rounded shapes, generous whitespace
- One accent color per badge category so groups feel distinct
- Dark mode is not required

## Product goal

Help a Girl Scout:
1. Track badge progress
2. Log what they did to earn each requirement
3. Keep a daily notebook
4. Keep an automatic journal of badge activity
5. Make a fully earned badge “permanent” as an NFT on Solana **devnet** (practice network)

## Top-level navigation (bottom bar)

1. **Home** — browse badges for the child’s level
2. **Notebook** — free-form daily writing
3. **Journal** — read-only record of badge activity

Also:
- **Gallery** (reachable from Notebook and Journal)
  - From Notebook: past notebook days
  - From Journal: badge activity grouped by date
  - Gallery has tabs to switch Notebook ↔ Journal views

## Onboarding (one screen per step)

Every screen has a 🔊 read-aloud button and a large Next button.

1. Language (chips + optional free-text language)
2. Child first name
3. Grade K–12 → app derives Girl Scout level (Daisy, Brownie, Junior, etc.)
4. Parent name
5. Parent email (login identity via magic link)
6. Bot check puzzle (tap the three daisies)
7. Parent confirms magic link (currently simulated in demo)
8. Short 3-card “how this app works” explainer → Home

Data stored: language, child first name, grade, derived level, parent name, parent email. Minimal data; children’s product; no ads; no public profiles.

## Home

- Shows only badges for the child’s Girl Scout level
- Badges grouped into **categories** (Nature, Animals, Cooking, First Aid, STEM, Art, Outdoors…)
- Each category is a visual **clump**: a loosely scattered cluster of round badge icons — not a rigid grid, not random scatter across the whole page
- Category label above/near each clump
- Clumps scroll vertically
- On Home, badge icons should look **colorful**
- Tap a badge → Badge Detail

## Badge Detail

- Badge name, category, big icon, short description, 🔊
- Checklist of requirements (usually 3–5)
- On this screen, the big badge icon starts **grey** and fills with color as requirements are completed; full color + soft glow when earned
- Tapping an incomplete requirement opens a sheet: **“Tell us what you did”**
  - Required short note
  - Optional photo (upload UI exists; cloud save later)
  - Note must meaningfully match the requirement (not random text)
- Completing the last requirement → celebration → **Make it permanent**
  - Mints (or mock-mints) an NFT to a custodial wallet
  - Child never sees seed phrases/private keys
  - Success copy like “Your badge is now permanent ✨” + explorer link
  - If mint fails, earned status must not be lost

## Notebook

- Free-form writing (keyboard only; no pencil/drawing in MVP)
- Optional title
- Big friendly font
- One entry per day; a day can have multiple pages (“+ New page”)
- Autosave
- Gallery button → list of past days, newest first → tap to reopen

## Journal (read-only)

- No free typing
- Chronological list of earned badges and in-progress badges with notes
- Expand a badge to see:
  - Each requirement
  - “What I did” note
  - Date
  - Photo placeholder/name if present
  - NFT / explorer link if minted
- Gallery button → date-sorted journal events (steps finished, badges earned, permanent mints)

## Design constraints / preferences

- Mobile-first (phone / iPad portrait)
- Feels like one cohesive product, not a generic dashboard
- Avoid generic AI-looking UI clichés (overused purple gradients, bland card grids, tiny text)
- Keep interactions obvious for kids
- Preserve accessibility basics: large tap targets, clear focus, readable type, 🔊 support
- Do not invent brand-new major features; improve layout, hierarchy, illustration, motion, and component polish of what exists
- Official Girl Scout badge names/art/requirements are **not** used; placeholders are original invented badges

## What I want from you

1. A clear UI direction (visual mood, typography ideas, color system, category accents)
2. Wireframe-level structure for: Onboarding, Home clumps, Badge Detail, Notebook, Journal, Gallery
3. Specific suggestions for empty states, success/celebration, and error states (especially rejected notes)
4. Component inventory (buttons, chips, badge orb, clump, sheets/modals, bottom nav, gallery rows)
5. A prioritized UI polish checklist for a hackathon teammate implementing in Next.js + Tailwind

Ask me clarifying questions only if needed; otherwise propose a strong default direction and show example screen layouts in text/ASCII or structured sections.
