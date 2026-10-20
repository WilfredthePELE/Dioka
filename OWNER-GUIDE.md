# Your Dioka website and admin

## Open the local build

Storefront: http://127.0.0.1:3080/
Admin: http://127.0.0.1:3080/admin
Email: contactus@diokacraft.com
Preview password: outputs/preview-access.txt (local preview only; excluded from GitHub and upload archives). There is an Administration link in the website footer and in the account profile.

## Make changes

- Products: create, edit and remove pieces, images, descriptions, sizes, materials, care, price and available stock. Changes are saved on the server.
- Website: publish the announcement, homepage introduction and support details; edit 383 registered text, image, video and navigation fields across the main pages, header, footer and splash. Search by page or text, reset fields to their defaults, hide sections and change section order. Edit delivery, returns, privacy, terms and warranty policies.
- Conversations: read customer messages and send real replies, then resolve or reopen the thread.
- Orders: review verified paid purchases and update progress and tracking references.
- Subscribers: view newsletter email signups.

Use Products for catalogue entries and Media for uploaded images/documents. Publish changes in Website to make content edits visible. The editor controls registered site content and sections; custom page code, currency/shipping-country rules and security/payment configuration remain developer or hosting settings. It does not run arbitrary HTML or scripts.

Orders includes Check pending payments: it reviews the latest 10 checkout records and only returns stock when Stripe confirms that a checkout expired unpaid. Unknown payments retain stock. Overview totals cover the full database; business lists currently show the latest 100 records. See SCALABILITY.md for operational limits.

## What is ready and what remains

The local folder contains the complete source and deployment instructions, and the GitHub review branch contains the committed build. Public domain diokacraft.com still serves the Truehost Coming Soon page until hosting is configured and the app deployed. See TRUEHOST.md. Live owner provisioning, real inventory/policy review and payment-provider configuration are launch steps. Google sign-in additionally needs the owner's Google OAuth client configuration; see GOOGLE-SIGN-IN.md.

Changes made in this local preview use outputs/preview-data. They do not automatically update a future Truehost database. Use the live /admin after launch to manage the live website.

## Supabase files

The admin Media tab and product-image uploader become available when the Supabase server environment and migrations are configured. Images are public; uploaded PDF documents are private. See SUPABASE-SETUP.md for the database/bucket setup and preview-data transfer.

## Launch traffic

The architecture has been hardened for concurrent purchases, but 10,000 simultaneous production buyers have not been certified on your Truehost hosting. Read SCALABILITY.md before a large launch. Infrastructure sizing, a waiting room and a staging load test remain necessary.
