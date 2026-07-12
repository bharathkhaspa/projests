import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const apiCalls = [];
page.on('response', r => {
  if (r.url().includes('/api/catalog/products')) {
    apiCalls.push({ url: r.url(), status: r.status() });
  }
});
const consoleErrors = [];
page.on('pageerror', e => consoleErrors.push(e.message));
page.on('console', m => { if (m.type() === 'error') consoleErrors.push('console.error: ' + m.text()); });

await page.goto('http://localhost:5174/shop', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);

const cards = await page.$$('a[href*="/products/"]');
const body = await page.evaluate(() => document.body.innerText.slice(0, 300).replace(/\n/g, ' '));

console.log('=== SHOP PAGE (5s wait) ===');
console.log('Product cards:', cards.length);
console.log('API calls made:', apiCalls.length, JSON.stringify(apiCalls));
console.log('JS errors:', consoleErrors.length === 0 ? 'none' : consoleErrors.slice(0,5).join(' | '));
console.log('Body:', body);

if (cards.length > 0) {
  for (const card of cards.slice(0, 3)) {
    const href = await card.getAttribute('href');
    const text = await card.evaluate(el => el.innerText.slice(0,50).replace(/\n/g,' '));
    console.log(`  card: ${href} | "${text}"`);
  }
}

// Also check with a direct product link
await page.goto('http://localhost:5174/products/oversized-cotton-tshirt', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
const detailBody = await page.evaluate(() => document.body.innerText.slice(0, 200).replace(/\n/g, ' '));
const detailErrors = consoleErrors.filter(e => !e.includes('duplicate'));
console.log('\n=== PRODUCT DETAIL ===');
console.log('Content:', detailBody);
console.log('Errors:', detailErrors.length > 0 ? detailErrors.join(' | ') : 'none');

await browser.close();
