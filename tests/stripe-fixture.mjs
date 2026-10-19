import './google-fixture.mjs';
// Explicit test preload only. Never imported by application or production code.
import { randomUUID } from 'node:crypto';
if (process.env.DIOKA_TEST_STRIPE !== '1') throw new Error('Stripe fixture is test-only.');
const originalFetch = globalThis.fetch;
const sessions = new Map();
globalThis.fetch = async function(input, init) {
  const url = String(input instanceof Request ? input.url : input);
  if (!url.startsWith('https://api.stripe.com/v1/checkout/sessions')) return originalFetch(input, init);
  if (init?.method === 'POST') {
    const params = new URLSearchParams(init.body);
    let total = 0;
    for (let index = 0; params.has(`line_items[${index}][quantity]`); index++) total += Number(params.get(`line_items[${index}][price_data][unit_amount]`)) * Number(params.get(`line_items[${index}][quantity]`));
    const id = `cs_test_${randomUUID().replaceAll('-', '')}`;
    const session = { id, url: `https://checkout.stripe.com/c/pay/${id}`, currency: 'usd', amount_total: total, payment_status: 'paid', metadata: { dioka_reservation: params.get('metadata[dioka_reservation]') }, customer_details: { name: 'Test Customer', email: params.get('customer_email') || 'guest@example.test', address: { city: 'Lagos', country: 'NG' } } };
    sessions.set(id, session); return Response.json(session);
  }
  const id = url.split('/').at(-1);
  return sessions.has(id) ? Response.json(sessions.get(id)) : Response.json({ error: 'Unknown checkout' }, { status: 404 });
};
