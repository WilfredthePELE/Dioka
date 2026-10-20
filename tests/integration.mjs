import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomBytes, randomUUID, createHmac } from 'node:crypto';
const directory = await mkdtemp(join(tmpdir(), 'dioka-integration-'));
const port = Number(process.env.TEST_PORT || 3079);
const origin = `http://127.0.0.1:${port}`;
const bootstrap = randomBytes(32).toString('hex'); const webhookSecret = randomBytes(32).toString('hex');
const password = randomBytes(18).toString('base64url');
let server; let output = ''; let checks = 0;
const env = { ...process.env, NODE_ENV: 'production', DIOKA_ADMIN_EMAILS: 'owner@example.test', DIOKA_BOOTSTRAP_SECRET: bootstrap, DIOKA_DATA_DIR: directory, SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', DIOKA_SITE_URL: origin, DIOKA_TRUST_PROXY: 'true', STRIPE_SECRET_KEY: 'sk_test_fixture', STRIPE_WEBHOOK_SECRET: webhookSecret, DIOKA_STORE_LIVE: 'true', DIOKA_TEST_STRIPE: '1', DIOKA_CHECKOUT_RATE: '1000', PORT: String(port), GOOGLE_CLIENT_ID: 'dioka-fixture.apps.googleusercontent.com', GOOGLE_CLIENT_SECRET: 'fixture-only', NODE_OPTIONS: `--import=${pathToFileURL(resolve('tests/stripe-fixture.mjs')).href}` };
async function start() {
  server = spawn(process.execPath, process.env.DIOKA_CUSTOM_SERVER === '1' ? ['server.cjs'] : ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'], { cwd: process.cwd(), env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', value => { output += value; }); server.stderr.on('data', value => { output += value; });
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) { try { const response = await fetch(`${origin}/api/checkout`); if (response.ok) return; } catch {} if (server.exitCode !== null) throw new Error(`Server exited: ${output}`); await new Promise(r => setTimeout(r, 500)); }
  throw new Error(`Server did not start: ${output}`);
}
async function stop() { if (!server || server.exitCode !== null) return; const exited = new Promise(r => server.once('exit', r)); server.kill(); await exited; }
function client(address) {
  let cookie = '';
  return { get cookie() { return cookie; }, async call(path, method = 'GET', body, extras = {}) {
    const response = await fetch(origin + path, { method, headers: { Origin: origin, 'X-Forwarded-For': address, ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}), ...extras }, body: body ? JSON.stringify(body) : undefined });
    const set = response.headers.getSetCookie?.() || []; const jar = new Map(cookie.split('; ').filter(Boolean).map(c => [c.split('=')[0], c]));
    for (const value of set) { const item = value.split(';')[0]; jar.set(item.split('=')[0], item); } cookie = [...jar.values()].join('; ');
    const data = await response.json(); return { status: response.status, data, response };
  } };
}
function checked(title) { checks++; console.log(`PASS ${checks}: ${title}`); }
try {
  await start();
  const guest = client('10.0.0.1'), otherGuest = client('10.0.0.2'), admin = client('10.0.0.3'), customer = client('10.0.0.4');
  assert.equal((await guest.call('/api/admin')).status, 401);
  assert.equal((await guest.call('/api/admin/reconcile','POST')).status,401);
  for (const method of ['POST', 'PATCH', 'DELETE']) assert.equal((await guest.call('/api/products', method, {})).status, 401);
  checked('Anonymous users cannot read administration or edit products');
  assert.equal((await guest.call('/api/auth/register', 'POST', { name: 'Owner impostor', email: 'owner@example.test', password })).status, 403);
  assert.equal((await guest.call('/api/admin/bootstrap', 'POST', { email: 'owner@example.test', name: 'Owner', password, secret: 'x'.repeat(64) })).status, 403);
  assert.equal((await admin.call('/api/admin/bootstrap', 'POST', { email: 'owner@example.test', name: 'Atelier Owner', password, secret: bootstrap })).status, 200);
  const login = await admin.call('/api/auth/login', 'POST', { email: 'owner@example.test', password });
  assert.equal(login.status, 200); assert.equal(login.data.admin, true); assert.ok(!('passwordHash' in login.data.user)); assert.ok(!('token' in login.data)); assert.match(login.response.headers.get('set-cookie'), /HttpOnly/i);
  checked('Owner provisioning, session cookies and sensitive-field protection');
  const signup = await customer.call('/api/auth/register', 'POST', { name: 'Test Customer', email: 'shopper@example.test', password });
  assert.equal(signup.status, 200); assert.equal((await customer.call('/api/admin')).status, 403);
  assert.equal((await admin.call('/api/products', 'POST', {}, { Origin: 'https://evil.example' })).status, 403);
  checked('Customer roles and cross-origin write protection');
  assert.equal((await guest.call('/api/admin/media')).status,401);
  assert.equal((await guest.call('/api/admin/media','POST',{})).status,401);
  assert.equal((await customer.call('/api/admin/media')).status,403);
  assert.equal((await admin.call('/api/admin/media')).data.enabled,false);
  assert.equal((await admin.call('/api/admin/media','POST',{})).status,503);
  await import('./media.mjs').then(m => m.mediaValidationChecks());
  checked('Protected media access, honest unconfigured state and upload validation');
  const product = { id: 'test-atelier-bag', name: 'Test Atelier Bag', category: 'Bags', bagType: 'Shoulder Bags', price: 125, stockQuantity: 3, image: '/dioka-brown-bag.webp', position: 'center', color: 'Cognac', sizes: ['One size'], description: 'A test of the real catalogue and checkout flow.' };
  assert.equal((await admin.call('/api/products', 'POST', product)).status, 200);
  assert.equal((await admin.call('/api/products', 'POST', { ...product, price: -1 })).status, 400);
  assert.equal((await guest.call('/api/products')).data.products.find(p => p.id === product.id).price, 125);
  assert.match((await guest.call('/api/products')).response.headers.get('cache-control'),/public/);
  assert.match((await admin.call('/api/admin')).response.headers.get('cache-control'),/no-store/);
  checked('Validated product CRUD, public catalogue caching and private administration responses');
  const initial = await admin.call('/api/admin'); const content = { ...initial.data.content, headline: 'An updated atelier.' };
  assert.equal((await admin.call('/api/admin', 'PATCH', { action: 'content', content })).status, 200);
  assert.equal((await guest.call('/api/content')).data.content.headline, content.headline);
  assert.equal((await guest.call('/api/newsletter', 'POST', { email: 'subscriber@example.test' })).status, 200);
  const registry=JSON.parse(await (await import('node:fs/promises')).readFile('lib/site-editable.json','utf8')); const managed=registry.find(f=>f.kind==='text'&&f.defaultValue==='TRENDING COLLECTIONS'); const section=registry.find(f=>f.kind==='section'&&f.page==='Home');const link=registry.find(f=>f.kind==='link');
  const fullContent=(await admin.call('/api/admin')).data.content;const controlled={...fullContent,controls:{...fullContent.controls,texts:{[managed.id]:'CURATED FOR YOU'},assets:{[link.id]:'/bags'},sections:{[section.id]:false},order:{}}};
  assert.equal((await admin.call('/api/admin','PATCH',{action:'content',content:controlled})).status,200);assert.equal((await guest.call('/api/content')).data.content.controls.texts[managed.id],'CURATED FOR YOU');assert.equal((await admin.call('/api/admin','PATCH',{action:'content',content:{...controlled,controls:{...controlled.controls,assets:{[link.id]:'javascript:alert(1)'}}}})).status,400);assert.equal((await admin.call('/api/admin','PATCH',{action:'content',content:fullContent})).status,200);
  checked('Published website fields, visibility, safe links and newsletter persistence');
  const message = { id: randomUUID(), text: 'Can you help me with sizing?', name: 'Test Guest', email: 'guest@example.test' };
  const sent = await guest.call('/api/chat', 'POST', message); assert.equal(sent.status, 200);
  const duplicate = await guest.call('/api/chat', 'POST', message); assert.equal(duplicate.data.conversation.messages.filter(m => m.id === message.id).length, 1);
  assert.equal((await otherGuest.call('/api/chat')).data.conversation, null);
  const conversationId = sent.data.conversation.id;
  assert.equal((await admin.call('/api/admin', 'PATCH', { action: 'reply', conversationId, text: 'Of course. Which size do you normally wear?', messageId: randomUUID() })).status, 200);
  assert.equal((await guest.call('/api/chat')).data.conversation.messages.at(-1).sender, 'team');
  checked('Customer-to-admin chat, private conversations, real replies and duplicate-send protection');
  const cartItem = { id: product.id, size: 'One size', quantity: 2, price: 0.01, monogram: 'ABC', color: 'Cognac' };
  assert.equal((await customer.call('/api/cart', 'POST', { items: [cartItem] })).status, 200);
  const me = await customer.call('/api/auth/me'); assert.equal(me.data.user.cart[0].price, 125);
  const checkout = await customer.call('/api/checkout', 'POST', { items: [cartItem], total: 0.01 }); assert.equal(checkout.status, 200);
  const sessionId = checkout.data.sessionId; assert.ok(sessionId.startsWith('cs_test_'));
  assert.equal((await guest.call('/api/products')).data.products.find(p => p.id === product.id).stockQuantity, 1);
  assert.equal((await admin.call('/api/products', 'POST', product)).status, 409, 'Stale editor must not overwrite reserved inventory');
  assert.equal((await otherGuest.call('/api/checkout', 'POST', { items: [{ ...cartItem, quantity: 2 }] })).status, 400);
  checked('Server-authoritative pricing and atomic inventory reservations prevent overselling');
  await import('./google.mjs').then(m => m.googleChecks({ origin, password }));
  checked('Google sign-in security and cart continuity');
  const event = { id: `evt_${randomUUID()}`, type: 'checkout.session.completed', data: { object: { id: sessionId, payment_status: 'paid', amount_total: 25000, currency: 'usd', customer_details: { name: 'Test Customer', email: 'shopper@example.test' } } } };
  const payload = JSON.stringify(event); const timestamp = String(Math.floor(Date.now() / 1000)); const signature = createHmac('sha256', webhookSecret).update(`${timestamp}.${payload}`).digest('hex');
  const webhook = async (header) => fetch(origin + '/api/webhooks/stripe', { method: 'POST', headers: { 'Content-Type': 'application/json', 'stripe-signature': header }, body: payload });
  assert.equal((await webhook('t=1,v1=bad')).status, 400);
  assert.equal((await webhook(`t=${timestamp},v1=${signature}`)).status, 200);
  assert.equal((await webhook(`t=${timestamp},v1=${signature}`)).status, 200);
  const orders = (await admin.call('/api/admin')).data.orders; assert.equal(orders.length, 1); assert.equal(orders[0].total, 250); assert.equal(orders[0].paymentStatus, 'paid'); assert.equal(orders[0].items[0].monogram, 'ABC');
  assert.equal((await customer.call('/api/orders')).data.orders.length, 1);
  assert.equal((await customer.call('/api/auth/me')).data.user.cart.length, 0, 'Paid selections must leave the saved bag');
  await customer.call('/api/cart', 'POST', { items: [{ ...cartItem, quantity: 1 }] });
  await webhook(`t=${timestamp},v1=${signature}`);
  assert.equal((await customer.call('/api/auth/me')).data.user.cart.length, 1, 'A retried webhook must preserve a new bag');
  assert.equal((await guest.call('/api/orders')).status, 401);
  checked('Signed payment fulfillment, duplicate webhook safety and customer order ownership');
  assert.equal((await admin.call('/api/admin', 'PATCH', { action: 'order', sessionId, status: 'Dispatched', trackingCode: '' })).status, 400);
  assert.equal((await admin.call('/api/admin', 'PATCH', { action: 'order', sessionId, status: 'Dispatched', trackingCode: 'TEST-TRACKING-001' })).status, 200);
  assert.equal((await customer.call('/api/orders')).data.orders[0].trackingCode, 'TEST-TRACKING-001');
  const receipt = await fetch(origin + '/order-confirmation?order_id=FORGED'); assert.ok(!(await receipt.text()).includes('PAYMENT VERIFIED'));
  assert.equal((await guest.call('/api/orders', 'POST', { total: 0 })).status, 405);
  checked('Real shipment updates and rejection of forged order confirmations');
  await import('./checkout-concurrency.mjs').then(m=>m.checkoutConcurrency({origin,admin}));
  assert.equal((await admin.call('/api/admin/reconcile','POST')).status,200);
  checked('Overlapping checkouts, no overselling, payment timeout recovery and protected reconciliation');
  if(process.env.DIOKA_RUN_LOAD==='1')await import('./load-checkout.mjs').then(m=>m.loadCheckout({origin,admin}));
  await stop(); await start();
  assert.equal((await admin.call('/api/admin')).data.products.find(p => p.id === product.id).stockQuantity, 1);
  assert.equal((await guest.call('/api/chat')).data.conversation.messages.at(-1).sender, 'team');
  assert.equal((await customer.call('/api/orders')).data.orders.length, 1);
  checked('Accounts, sessions, inventory, messages and orders survive a server restart');
  if (process.env.DIOKA_BROWSER_PACKAGE) {
    await import('./browser.mjs').then(m => m.browserChecks({ origin, password }));
    checked('Browser workflows and responsive visual checks');
  }
  assert.equal((await admin.call('/api/products?id=' + product.id, 'DELETE')).status, 200);
  await admin.call('/api/auth/logout', 'POST'); assert.equal((await admin.call('/api/admin')).status, 401);
  checked('Product removal and session revocation');
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/integration.json', JSON.stringify({ checks, passed: true, paymentProvider: 'deterministic Stripe test fixture; live credentials not tested', timestamp: new Date().toISOString() }, null, 2));
  console.log(`All ${checks} integration checks passed.`);
} catch (error) { console.error(error); console.error(output.slice(-12000)); process.exitCode = 1; }
finally { await stop(); }
