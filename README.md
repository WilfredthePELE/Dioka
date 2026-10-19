# Dioka Atelier

A Next.js storefront with a matching administration panel and persistent customer chat.

- **Storefront:** managed catalogue, product details, sizes, customization, saved bags, customer accounts and verified Stripe Checkout.
- **Customer care:** a private browser-bound conversation, durable messages, delivery errors and replies from the admin inbox.
- **Administration at `/admin`:** overview, product creation/editing/removal, available inventory, conversations, paid orders, shipment references, website copy and newsletter subscribers.
- **Storage:** Supabase with server-only access, or SQLite on a persistent disk for a single Node server. Database errors never fall back to pretend success.
- **Operations:** Dockerfile, health endpoint, production setup guide and integration checks.

## Development

Use Node.js 22.13+ (24 recommended).

```sh
npm ci --legacy-peer-deps
npm run dev
```

Create an untracked `.env.local` from `.env.example` and set your administrator allowlist and random setup secret. Local development without remote storage uses `data/dioka.sqlite`; no demo user is created.

## Verification

```sh
npm run typecheck
npm run build
npm run test:integration
```

The integration checks use temporary data and a deterministic Stripe fixture. Actual Stripe test-mode and live payments need your own credentials and webhook endpoint.

See [DEPLOYMENT.md](DEPLOYMENT.md) for storage migration, owner provisioning, payments, backups, Docker and hosting compatibility. The legacy Sites identity is retained, but this standalone Node build is not a Cloudflare Worker bundle.

For **diokacraft.com on Truehost**, follow [TRUEHOST.md](TRUEHOST.md). The cPanel startup file is `server.cjs`; the owner allowlist example uses `contactus@diokacraft.com`.

See [OWNER-GUIDE.md](OWNER-GUIDE.md) for admin access and editable areas, and [GOOGLE-SIGN-IN.md](GOOGLE-SIGN-IN.md) to enable Google customer/admin sign-in.
