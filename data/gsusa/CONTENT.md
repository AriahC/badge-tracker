# GSUSA badge pack (reference)

Source extract lives in `girl-scout-badges/` (from Badge Explorer).

## What we use in production

| Asset | Status |
| --- | --- |
| Official badge **titles** + **levels** | OK — identification only |
| Stable UUID `id` values | OK — progress keys |
| Topics → Veya categories | OK |
| Requirement step titles / booklet text | **Not used verbatim** — rewritten as short Veya action summaries via `scripts/transform-gsusa-badges.mjs` |
| Official badge PNGs under `images/` | **Reference only** — gitignored; never copied to `public/` |

## Rights posture (North Star)

- `rights_status`: referential
- `art_status`: original (Veya HQ icons via `icon_slug` → `src/lib/assets.ts`)
- Veya does **not** award official Girl Scout badges
- Families should consult official materials for full activities and award decisions

## Refresh

```bash
# If you refresh the pack, keep images local only, then:
npm run transform:gsusa
```

Output: `data/badges.seed.json` (consumed by `src/lib/badges.ts`).
