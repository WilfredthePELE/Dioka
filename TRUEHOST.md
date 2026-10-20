# Truehost deployment for diokacraft.com

The domain currently returns an OLITT page. Do not overwrite its existing files or change DNS until the replacement is built, backed up and tested in your Truehost account.

## Confirm the hosting plan

Open Truehost cPanel and find **Setup Node.js App** (or the newer **Web Apps**). This application requires Node.js 22.13 or later; Node.js 24 is recommended. Ordinary static-only hosting cannot run the admin panel, chat or checkout. If your plan lacks Node support, use a Truehost VPS or ask Truehost to enable a suitable Node plan.

## cPanel / Passenger

1. Back up the existing website and database. Create an application root outside public_html, such as /home/YOUR_ACCOUNT/dioka.
2. Upload the source archive and extract it into that root. Do not upload Windows node_modules, local databases or private environment files.
3. Create a production Node app, select Node 24, set the application URL to diokacraft.com and the startup file to **server.cjs**.
4. Activate the environment using the command displayed by cPanel. In the application root run npm ci --legacy-peer-deps, npm run typecheck and npm run build. Build requires development dependencies. If cPanel does not offer a terminal, ask Truehost support to run these commands in the selected Node environment.
5. Set environment variables from .env.example in cPanel. Set DIOKA_SITE_URL=https://diokacraft.com. For a single server, set DIOKA_DATA_DIR to an absolute persistent directory outside public_html, such as /home/YOUR_ACCOUNT/dioka-data. Alternatively configure Supabase as described in DEPLOYMENT.md.
6. Set DIOKA_ADMIN_EMAILS=contactus@diokacraft.com and a one-time bootstrap secret, restart the application and provision the owner at /admin. Remove the bootstrap secret afterward.
7. Enable a valid HTTPS certificate for the domain. Choose one canonical hostname and redirect the other at the host. Connect Stripe and its signed webhook only after a test purchase succeeds.
8. Review the catalogue, available stock, delivery and returns policies in /admin before enabling checkout. Before switching visitors, verify /api/health returns healthy, log in to /admin, update one product and website text, exchange customer/admin chat replies, and restart the app to confirm those changes survive. Test mobile layouts and a Stripe test payment, including the paid order in /admin.

The archive contains source, not a preconfigured live account. Real administrator, storage and payment settings must be entered privately in Truehost. No passwords or payment keys belong in GitHub.

## Truehost VPS

Use the Dockerfile with a persistent volume at /app/data and DIOKA_DATA_DIR=/app/data, or use Node 24 with a process manager. Put an HTTPS reverse proxy in front of the app. Follow DEPLOYMENT.md for storage, payments and owner provisioning.

Official host instructions: https://truehost.com/support/knowledge-base/how-to-deploy-nextjs-on-cpanel/ and https://truehost.com/support/knowledge-base/how-to-setup-node-js-app-in-cpanel/ . Their sample older Node versions do not meet this application's minimum.
