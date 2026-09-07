# Girl Scout badge index

Every badge, petal, journey, award, and pin from the official
[Badge Explorer](https://www.girlscouts.org/en/members/for-girl-scouts/badges-journeys-awards/badge-explorer.html),
with level, topics, the requirement steps shown when you click a badge, and the
badge image. Built for an app to load and track progress against.

```
data/badges.json     the index (read this)
data/badges.csv      same rows, flat, for spreadsheets
data/raw/model.json  untouched copy of the site's feed
images/<level>/      365 PNGs, 600x600
scripts/fetch.mjs    rebuilds everything
```

## Refresh

```
node scripts/fetch.mjs              # fetch feed, rebuild JSON/CSV, download missing images
node scripts/fetch.mjs --offline    # rebuild from data/raw/model.json, no network
node scripts/fetch.mjs --no-images  # skip image downloads
```

No dependencies. Node 18 or newer.

## badges.json

```
{
  meta:   { source, fetchedAt, total, byLevel, byType, ... },
  levels: [ { key, name, grades, order, color } ],          // 6, in program order
  topics: [ { key, name } ],                                // 13, the site's Topics dropdown
  badges: [ Badge ]                                          // 365
}
```

### Badge

| field | type | notes |
|---|---|---|
| `id` | string | UUID from the source feed. Stable across refreshes. Use this as the primary key. |
| `slug` | string | `<level>--<kebab-title>`, unique. Same string as the image filename. |
| `title` | string | |
| `level` | object | `{ key, name, grades, order, color }`. `key` is one of `daisy brownie junior cadette senior ambassador`. |
| `type` | string | `badge`, `petal`, `journey`, `award`, or `pin`. Derived from title, tags, and image path. |
| `topics` | array | `[{ key, name }]` matching the site's Topics dropdown. May be empty. |
| `tags` | array | Every raw tag from the source `filter` field, including ones the dropdown does not show (`stem`, `lifeskills`, ...). |
| `summary` | string | Intro paragraph shown in the modal. |
| `requirements` | array | `[{ step, text }]`. The numbered list from the modal. See caveat below. |
| `outcome` | string | The "When you've earned this badge..." line. |
| `descriptionHtml` | string | Raw modal HTML, kept in case the parse misses something. |
| `image.file` | string | Relative path, e.g. `images/daisy/daisy--animal-observer.png`. |
| `image.sourceUrl` | string | Original URL on girlscouts.org. |
| `image.sourceFilename` | string | Original filename, often carries the shop SKU. |
| `shopUrl` | string | girlscoutshop.com link from the modal button. |
| `cta` | string | Button label from the modal. |
| `notes` | array | Parse or source oddities. Empty for 361 of 365 records. |

### Image naming

`images/<level>/<level>--<slug>.png`

- Filename stem equals `badge.slug`, so `badge.image.file` and the slug are interchangeable.
- Same title twice at one level gets `--2`, `--3` in source order. Only the
  Cookie Entrepreneur Family Pin does this (year-1 / year-2 pins).

### Caveat: what "requirements" means here

The Badge Explorer shows the step **titles** for each badge, typically three
or five lines such as "1. Be an animal observer". The full instructions for
each step are in the printed badge booklets sold on girlscoutshop.com and are
not on the website. This index has everything the site exposes.

### Known source gaps

- `daisy--promise-center` has a one-line description and no steps.
- `daisy--globalactionaward` has no description at all in the feed.

## Verifying against the live page

`scripts/verify-live.cjs` opens the real Badge Explorer in Chrome, clicks
"More" until it disappears, and writes every rendered card title to
`data/raw/rendered-titles.json`. Last run (2026-09-07): 22 clicks, 365 cards,
matching `badges.json` title for title. It needs Playwright from another repo:

```
PLAYWRIGHT_DIR=/path/to/repo/node_modules/playwright node scripts/verify-live.cjs
```
