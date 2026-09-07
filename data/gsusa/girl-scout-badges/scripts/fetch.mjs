#!/usr/bin/env node
// Builds the Girl Scout badge index.
//   node scripts/fetch.mjs            fetch feed, normalize, download missing images
//   node scripts/fetch.mjs --offline  reuse data/raw/model.json, skip network
//   node scripts/fetch.mjs --no-images
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, 'data', 'raw', 'model.json');
const OUT = path.join(ROOT, 'data', 'badges.json');
const CSV = path.join(ROOT, 'data', 'badges.csv');
const IMG_DIR = path.join(ROOT, 'images');
const ORIGIN = 'https://www.girlscouts.org';
const FEED = ORIGIN + '/en/members/for-girl-scouts/badges-journeys-awards/badge-explorer/jcr:content/root/container/badge_explorer.model.json';
const EXPLORER = ORIGIN + '/en/members/for-girl-scouts/badges-journeys-awards/badge-explorer.html';

const args = new Set(process.argv.slice(2));
const OFFLINE = args.has('--offline');
const NO_IMAGES = args.has('--no-images');

// ---------- http ----------
function get(url, redirects = 3) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (badge-index)', Accept: '*/*' } }, (r) => {
      if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location && redirects > 0) {
        r.resume();
        const next = new URL(r.headers.location, url).toString();
        return resolve(get(next, redirects - 1));
      }
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => resolve({ status: r.statusCode, type: r.headers['content-type'] || '', buf: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

// ---------- text helpers ----------
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', reg: '®', trade: '™', copy: '©', hellip: '…', ndash: '–', mdash: '—' };
function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, e) => (e.toLowerCase() in ENTITIES ? ENTITIES[e.toLowerCase()] : m));
}
function clean(html) {
  return decode(html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function slugify(s) {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------- description parser ----------
// Returns { summary, requirements[], outcome }.
// Format A (268): <p>intro</p><ol><li>..</li></ol><p>outcome</p>
// Format B (95):  <p>intro<br>1. step<br>2. step</p><p>outcome</p>
function parseDescription(html) {
  const notes = [];
  if (!html || !html.trim()) return { summary: '', requirements: [], outcome: '', notes: ['no description in source'] };
  const h = html.replace(/\r?\n/g, ' ');

  const olMatch = h.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
  if (olMatch) {
    const before = h.slice(0, olMatch.index);
    const after = h.slice(olMatch.index + olMatch[0].length);
    const items = [...olMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => clean(m[1])).filter(Boolean);
    return { summary: clean(before), requirements: items.map((text, i) => ({ step: i + 1, text })), outcome: clean(after), notes };
  }

  // Format B: find "<n>. " markers (also tolerates "2.Set" with no space).
  // A marker is a 1-2 digit number, a period, optional space, then a letter.
  const markerRe = /(?:^|<br\s*\/?>|\s)(\d{1,2})\.\s*(?=[A-Za-z(“"'])/g;
  const paras = [...h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1]);
  const blocks = paras.length ? paras : [h];
  const markersIn = (b) => [...b.matchAll(markerRe)].map((m) => ({
    num: +m[1],
    start: m.index + m[0].indexOf(m[1]),
    end: m.index + m[0].length,
  }));
  const idx = blocks.findIndex((b) => markersIn(b).some((m) => m.num === 1));
  if (idx === -1) {
    return { summary: clean(h), requirements: [], outcome: '', notes: ['no numbered steps in source'] };
  }
  const block = blocks[idx];
  const markers = markersIn(block);
  const first = markers.findIndex((m) => m.num === 1);
  const steps = markers.slice(first);
  const summaryParts = [...blocks.slice(0, idx), block.slice(0, steps[0].start)];
  const requirements = [];
  steps.forEach((m, i) => {
    const text = clean(block.slice(m.end, i + 1 < steps.length ? steps[i + 1].start : block.length));
    if (text) requirements.push({ step: requirements.length + 1, text });
    if (m.num !== i + 1) notes.push(`source numbering irregular at "${m.num}."`);
  });
  return { summary: clean(summaryParts.join(' ')), requirements, outcome: clean(blocks.slice(idx + 1).join(' ')), notes: [...new Set(notes)] };
}

// ---------- classification ----------
const LEVELS = {
  daisy: { name: 'Daisy', grades: 'K-1', order: 1 },
  brownie: { name: 'Brownie', grades: '2-3', order: 2 },
  junior: { name: 'Junior', grades: '4-5', order: 3 },
  cadette: { name: 'Cadette', grades: '6-8', order: 4 },
  senior: { name: 'Senior', grades: '9-10', order: 5 },
  ambassador: { name: 'Ambassador', grades: '11-12', order: 6 },
};
function levelOf(b) {
  const key = (b.filter || '').split(/\s+/).find((t) => LEVELS[t]) || Object.keys(LEVELS).find((k) => (b.rank || '').toLowerCase().startsWith(k));
  if (!key) throw new Error(`no level for ${b.title}`);
  return { key, ...LEVELS[key], color: b.backGroundColor || null };
}
function typeOf(b) {
  const t = (b.title || '').toLowerCase();
  const tags = (b.otherTags || []).map((x) => x.toLowerCase());
  const f = (b.filter || '').toLowerCase();
  if (/\/daisypetals\//i.test(b.image || '')) return 'petal';
  if (/^journey:/.test(t) || tags.includes('journey') || /\bjourney\b/.test(f)) return 'journey';
  if (/\bpin\b/.test(t)) return 'pin';
  if (tags.some((x) => /awards?$/.test(x)) || /\bawards?\b/.test(f) || /\baward\b/.test(t)) return 'award';
  return 'badge';
}

// ---------- main ----------
async function main() {
  let raw;
  if (OFFLINE && fs.existsSync(RAW)) {
    raw = fs.readFileSync(RAW, 'utf8');
  } else {
    const r = await get(FEED);
    if (r.status !== 200) throw new Error(`feed HTTP ${r.status}`);
    raw = r.buf.toString('utf8');
    fs.mkdirSync(path.dirname(RAW), { recursive: true });
    fs.writeFileSync(RAW, raw);
  }
  const model = JSON.parse(raw);
  const src = model.badges;

  // topic lookup from the site's own dropdown (key -> title)
  const topicByName = {};
  const topics = [];
  for (const s of model.selectors?.['2'] || []) {
    topicByName[s.title.trim().toLowerCase()] = s.name;
    topics.push({ key: s.name, name: s.title.trim() });
  }

  // slugs, with --2/--3 for same title at same level (source order)
  const seen = new Map();
  const badges = src.map((b) => {
    const level = levelOf(b);
    const base = `${level.key}--${slugify(b.title)}`;
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    const slug = n === 1 ? base : `${base}--${n}`;
    const parsed = parseDescription(b.description || '');
    const notes = [...parsed.notes];
    if (n > 1) notes.push(`duplicate title at this level in source; variant ${n} (different product image)`);
    const tags = (b.filter || '').split(/\s+/).filter(Boolean);
    const topicList = (b.otherTags || [])
      .map((name) => ({ key: topicByName[name.trim().toLowerCase()] || slugify(name), name: name.trim() }));
    const sourceFilename = path.basename(b.image || '');
    return {
      id: b.uniqueId,
      slug,
      title: b.title.trim(),
      level,
      type: typeOf(b),
      topics: topicList,
      tags,
      summary: parsed.summary,
      requirements: parsed.requirements,
      outcome: parsed.outcome,
      descriptionHtml: b.description || '',
      image: {
        file: `images/${level.key}/${slug}.png`,
        sourceUrl: b.image ? ORIGIN + b.image : null,
        sourceFilename,
      },
      shopUrl: b.link || null,
      cta: (b.badgeCTA || '').trim(),
      notes,
    };
  });

  // images
  let downloaded = 0, skipped = 0, failed = [];
  if (!NO_IMAGES) {
    const queue = badges.filter((b) => b.image.sourceUrl);
    const workers = Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const b = queue.shift();
        const dest = path.join(ROOT, b.image.file);
        if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { skipped++; continue; }
        try {
          const r = await get(b.image.sourceUrl);
          if (r.status !== 200 || !/image/.test(r.type)) throw new Error(`HTTP ${r.status} ${r.type}`);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.writeFileSync(dest, r.buf);
          downloaded++;
        } catch (e) {
          failed.push({ slug: b.slug, url: b.image.sourceUrl, error: String(e.message || e) });
        }
      }
    });
    await Promise.all(workers);
  }
  for (const b of badges) {
    const f = failed.find((x) => x.slug === b.slug);
    if (f) b.notes.push(`image download failed: ${f.error}`);
  }

  const count = (fn) => badges.reduce((o, b) => { const k = fn(b); o[k] = (o[k] || 0) + 1; return o; }, {});
  const out = {
    meta: {
      source: FEED,
      explorerPage: EXPLORER,
      fetchedAt: new Date().toISOString(),
      total: badges.length,
      byLevel: count((b) => b.level.key),
      byType: count((b) => b.type),
      withRequirements: badges.filter((b) => b.requirements.length).length,
      imageNaming: 'images/<level>/<level>--<slug>.png; slug == badge.slug',
      note: 'Requirement text is the step list shown in the Badge Explorer modal. Full step instructions are only in the printed badge booklets.',
    },
    levels: Object.entries(LEVELS).map(([key, v]) => ({ key, ...v, color: badges.find((b) => b.level.key === key)?.level.color || null })),
    topics,
    badges,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

  // flat CSV for spreadsheets / quick eyeballing (same rows, fewer fields)
  const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const rows = [['slug', 'id', 'title', 'level', 'grades', 'type', 'topics', 'stepCount', 'requirements', 'summary', 'outcome', 'imageFile', 'shopUrl'].join(',')];
  for (const b of badges) {
    rows.push([
      b.slug, b.id, b.title, b.level.name, b.level.grades, b.type,
      b.topics.map((t) => t.name).join('; '),
      b.requirements.length,
      b.requirements.map((r) => r.step + '. ' + r.text).join(' | '),
      b.summary, b.outcome, b.image.file, b.shopUrl,
    ].map(q).join(','));
  }
  fs.writeFileSync(CSV, rows.join('\n') + '\n');

  console.log(`badges: ${badges.length}`);
  console.log(`by level:`, out.meta.byLevel);
  console.log(`by type:`, out.meta.byType);
  console.log(`with requirements: ${out.meta.withRequirements}`);
  console.log(`images: downloaded ${downloaded}, already present ${skipped}, failed ${failed.length}`);
  if (failed.length) console.log(failed);
  console.log(`wrote ${path.relative(process.cwd(), OUT)} and ${path.relative(process.cwd(), CSV)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
