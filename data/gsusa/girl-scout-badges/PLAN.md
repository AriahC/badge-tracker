# Girl Scout Badge Index: plan

## What the site actually is

The Badge Explorer page is a Vue app. It does not have one page per badge.
Clicking a badge opens a modal that renders fields from a single JSON feed:

    https://www.girlscouts.org/en/members/for-girl-scouts/badges-journeys-awards/badge-explorer/jcr:content/root/container/badge_explorer.model.json

That one file holds every badge (365 as of 2026-09-07). Each record has:

| field | what it is |
|---|---|
| `title` | badge name |
| `rank` | level, e.g. `Daisy (Grades K-1)` |
| `filter` | space-separated tags, first is the level key |
| `otherTags` | topic names as shown in the Topics dropdown |
| `description` | HTML shown in the modal: intro, numbered steps, "when you've earned" line |
| `image` | PNG path on girlscouts.org, 600x600 |
| `link` | girlscoutshop.com purchase link |
| `uniqueId` | stable UUID |

The "More" button at the bottom of the grid is client-side only: the page
loads the whole array once and `displayMore()` just raises a display cap by 16.
Nothing is fetched on click, so the feed is the complete list.

So there is no need to click 365 badges. Pull the JSON once, normalize it, and
download the 365 images.

## Caveat to know before building on this

The modal text lists the **step titles** for each badge (typically 3 to 5
lines like "1. Be an animal observer"). The full, detailed requirement text for
each step lives in the paid badge booklets on girlscoutshop.com, not on the
website. This index captures everything the site exposes. If the app needs
full step-by-step instructions, that is a second data source and a separate job.

Two records are odd in the source and are kept as-is with a `notes` field:
- Daisy "GlobalActionAward" has no description at all.
- "Cookie Entrepreneur Family Pin" appears twice per level (three times for
  Cadette) with different product images. These are the year-1 / year-2 pins.

## Deliverables

```
girl-scout-badges/
  PLAN.md                  this file
  README.md                schema + naming convention for the app
  scripts/fetch.mjs        one command: download JSON, normalize, save images
  data/raw/model.json      untouched snapshot of the source feed
  data/badges.json         normalized index the app reads
  images/<level>/<level>--<slug>.png   one PNG per badge
```

## Normalized record shape

```json
{
  "id": "7881126c-...",                     // source uniqueId, stable
  "slug": "daisy--animal-observer",         // level + kebab title, unique
  "title": "Animal Observer",
  "level": { "key": "daisy", "name": "Daisy", "grades": "K-1", "order": 1, "color": "#1496D4" },
  "type": "badge",                          // badge | petal | journey | award | pin
  "topics": [{ "key": "nature", "name": "Animals and Nature" }],
  "tags": ["daisy", "nature"],              // every raw tag from the source
  "summary": "Find out how to learn about animals by watching them.",
  "requirements": [
    { "step": 1, "text": "Be an animal observer" },
    { "step": 2, "text": "Play an animal observation game" },
    { "step": 3, "text": "Focus on one animal" }
  ],
  "outcome": "When you've earned this badge, you'll know more about observing animals.",
  "descriptionHtml": "<p>...</p>",          // raw, in case the parse misses something
  "image": {
    "file": "images/daisy/daisy--animal-observer.png",
    "sourceUrl": "https://www.girlscouts.org/content/dam/...png",
    "sourceFilename": "DaisyBadge_AnimalObserver.png"
  },
  "shopUrl": "https://www.girlscoutshop.com/...",
  "cta": "GET THIS BADGE",
  "notes": []
}
```

## Image naming convention

`images/<level>/<level>--<slug>.png`

- `<level>` is one of `daisy brownie junior cadette senior ambassador`.
- `<slug>` is the badge title in kebab-case, ASCII only.
- If two badges at the same level share a title, the second gets `--2`, the
  third `--3`, in source order.
- The same string is the `slug` field in `badges.json`, so an app can go
  from record to file and back without a lookup table.

## Steps

1. Fetch the JSON feed, save raw snapshot.
2. Parse each description into summary / requirements / outcome.
   Two formats exist: `<ol><li>` (268 badges) and `1. ... <br>2. ...` (95 badges).
3. Derive level, type, topics, slug.
4. Download images with 6 parallel connections, skip files already present.
5. Write `badges.json` with a `meta` block (source URL, fetch time, counts).
6. Validate: 365 records, 365 files, every record has an image on disk,
   requirement counts by format.

Re-run `node scripts/fetch.mjs` any time to refresh.
