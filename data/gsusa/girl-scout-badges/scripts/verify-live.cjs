// Cross-check: drive the live Badge Explorer, click "More" until it disappears, count cards + titles.
const { chromium } = require(process.env.PLAYWRIGHT_DIR || '/Users/brittanymieryteran/edventures-track/node_modules/playwright') // any repo with playwright installed; Chrome must be in /Applications;
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto('https://www.girlscouts.org/en/members/for-girl-scouts/badges-journeys-awards/badge-explorer.html', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForSelector('.badge_list', { timeout: 60000 });
  let clicks = 0;
  for (;;) {
    const more = page.locator('a.badge_list_more');
    if (!(await more.count()) || !(await more.first().isVisible())) break;
    await more.first().click();
    clicks++;
    await page.waitForTimeout(150);
    if (clicks > 60) break;
  }
  const cards = await page.locator('.badge_list > *').count();
  const titles = await page.locator('.badge_list').evaluate((el) =>
    [...el.children].map((c) => (c.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean)[0] || ''));
  fs.writeFileSync(__dirname + '/../data/raw/rendered-titles.json', JSON.stringify(titles, null, 1));
  console.log(JSON.stringify({ clicks, cards, uniqueTitles: new Set(titles).size, first: titles[0], last: titles[titles.length - 1] }));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
