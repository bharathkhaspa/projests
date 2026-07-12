import { chromium } from 'playwright';

const BASE = 'http://localhost:5174';
const API  = 'http://localhost:8000';
const issues = [];

async function check(name, url, fn) {
  const page = await browser.newPage();
  page.on('pageerror', e => issues.push(`[${name}] JS: ${e.message.slice(0,120)}`));
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
    await page.waitForTimeout(2000);
    const body = await page.evaluate(() => document.body?.innerText ?? '');
    const finalUrl = page.url();
    console.log(`\n=== ${name.toUpperCase()} ===`);
    if (!body.trim()) {
      console.log('  BLANK PAGE !!!');
    } else {
      console.log(`  snippet: "${body.slice(0,80).replace(/\n/g,' ')}"`);
    }
    if (fn) await fn(body, finalUrl, page);
  } catch(e) {
    console.log(`\n=== ${name.toUpperCase()} ===`);
    console.log(`  ERROR: ${e.message.slice(0,100)}`);
  }
  await page.close();
}

const browser = await chromium.launch({ headless: true });

await check('home', BASE+'/', async (b) => {
  console.log('  JunOber logo:', b.includes('JunOber') ? 'OK' : 'MISSING');
  console.log('  Scrolling ad strip:', b.includes('Free Shipping') ? 'OK' : 'MISSING');
  console.log('  Shop link:', b.includes('Shop') ? 'OK' : 'MISSING');
  console.log('  Customize link:', b.includes('Customize') ? 'OK' : 'MISSING');
  console.log('  Footer:', b.includes('Hyderabad') ? 'OK' : 'MISSING');
});

await check('shop', BASE+'/shop', async (b, url, page) => {
  const cards = await page.$$('a[href*="/products/"]');
  console.log('  Product cards:', cards.length);
  console.log('  Filter sidebar:', b.includes('T-Shirt') || b.includes('Garment') ? 'OK' : 'MISSING');
  console.log('  Sort dropdown:', b.includes('Sort') ? 'OK' : 'MISSING');
  if (cards.length > 0) {
    const href = await cards[0].getAttribute('href');
    console.log('  First product link:', href);
  }
});

const shopPage = await browser.newPage();
await shopPage.goto(BASE+'/shop', { waitUntil: 'domcontentloaded', timeout: 10000 });
await shopPage.waitForTimeout(1500);
const productLinks = await shopPage.$$eval('a[href*="/products/"]', els => els.slice(0,1).map(e=>e.getAttribute('href')));
await shopPage.close();

if (productLinks.length > 0) {
  await check('product_detail', BASE + productLinks[0], async (b, url, page) => {
    console.log('  Price shown:', b.includes('₹') ? 'OK' : 'MISSING');
    console.log('  Add to Cart btn:', b.includes('Add to Cart') ? 'OK' : 'MISSING');
    console.log('  Color selector:', b.includes('Color') ? 'OK' : 'MISSING');
    console.log('  Size selector:', b.includes('Size') ? 'OK' : 'MISSING');
    console.log('  Print type:', b.includes('Print') ? 'OK' : 'MISSING');
    console.log('  Reviews section:', b.includes('Review') ? 'OK' : 'MISSING');
  });
} else {
  console.log('\n=== PRODUCT_DETAIL === SKIPPED - no products in DB yet');
}

await check('login', BASE+'/login', async (b) => {
  console.log('  Email/password fields:', b.includes('Email') && b.includes('Password') ? 'OK' : 'MISSING');
  console.log('  Forgot password:', b.includes('Forgot') ? 'OK' : 'MISSING');
  console.log('  Create account link:', b.includes('Create account') ? 'OK' : 'MISSING');
});

await check('register', BASE+'/register', async (b) => {
  console.log('  Register form:', b.includes('Create') || b.includes('first name') ? 'OK' : 'MISSING');
});

await check('cart_guest', BASE+'/cart', async (b) => {
  console.log('  Sign-in prompt:', b.includes('Sign in') ? 'OK' : 'MISSING - got: '+b.slice(0,50));
});

await check('orders_guest', BASE+'/orders', async (b) => {
  console.log('  Auth prompt:', b.includes('Sign in') ? 'OK' : 'MISSING');
});

await check('checkout_guest', BASE+'/checkout', async (b, url) => {
  console.log('  Redirected/prompt:', url.includes('/login') || b.includes('Log in') ? 'OK' : 'at '+url+': '+b.slice(0,50));
});

await check('admin_unauth', BASE+'/admin-panel', async (b, url) => {
  console.log('  Redirected to login:', url.includes('/login') ? 'OK' : 'at '+url);
  console.log('  Auth UI shown:', b.includes('Log in') || b.includes('Admin Access') ? 'OK' : '?? '+b.slice(0,60));
});

await check('not_found', BASE+'/xyz-does-not-exist', async (b) => {
  console.log('  404 content:', b.includes('404') || b.includes('Not Found') ? 'OK' : 'MISSING - got: '+b.slice(0,60));
  console.log('  Has Navbar:', b.includes('JunOber') ? 'OK' : 'MISSING');
});

console.log('\n=== DJANGO API HEALTH ===');
const api = await browser.newPage();
for (const [name, path] of [
  ['products',    '/api/catalog/products/'],
  ['categories',  '/api/catalog/categories/'],
  ['banners',     '/api/catalog/banners/'],
  ['colors',      '/api/catalog/colors/'],
  ['sizes',       '/api/catalog/sizes/'],
  ['print-types', '/api/catalog/print-types/'],
  ['django-admin','/admin/'],
]) {
  try {
    const r = await api.goto(API + path, { timeout: 5000 });
    const txt = (await api.evaluate(() => document.body?.innerText ?? '')).slice(0,60).replace(/\n/g,' ');
    console.log(`  [${r.status()}] ${name}: ${txt}`);
  } catch(e) {
    console.log(`  [ERR] ${name}: ${e.message.slice(0,50)}`);
  }
}
await api.close();

console.log('\n=== JS ERRORS ===');
const real = issues.filter(i => !i.includes('favicon') && !i.includes('ResizeObserver'));
if (real.length === 0) console.log('  None detected');
else real.forEach(i => console.log(' ', i));

await browser.close();
console.log('\nDone.');
