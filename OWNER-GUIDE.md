# Your Dioka website and admin

## Open the local build

Storefront: http://127.0.0.1:3080/
Admin: http://127.0.0.1:3080/admin
Email: contactus@diokacraft.com
Preview password: outputs/preview-access.txt (local preview only; excluded from GitHub and upload archives). There is an Administration link in the website footer and in the account profile.

## Make changes

- Products: create, edit and remove pieces, images, descriptions, sizes, materials, care, price and available stock. Changes are saved on the server.
- Website: publish announcement text, homepage headline/introduction, support email, delivery policy and returns policy.
- Conversations: read customer messages and send real replies, then resolve or reopen the thread.
- Orders: review verified paid purchases and update progress and tracking references.
- Subscribers: view newsletter email signups.

This is a storefront admin, not a visual page builder. Page layout, navigation, editorial sections, films and some marketing text still live in the source files. Those can be changed in the project; the admin does not expose every line of the site.

## What is ready and what remains

The local folder contains the complete source and deployment instructions, and the GitHub review branch contains the committed build. Public domain diokacraft.com still serves the Truehost Coming Soon page until hosting is configured and the app deployed. See TRUEHOST.md. Live owner provisioning, real inventory/policy review and payment-provider configuration are launch steps. Google sign-in additionally needs the owner's Google OAuth client configuration; see GOOGLE-SIGN-IN.md.

Changes made in this local preview use outputs/preview-data. They do not automatically update a future Truehost database. Use the live /admin after launch to manage the live website.

## Supabase files

The admin Media tab and product-image uploader become available when the Supabase server environment and migrations are configured. Images are public; uploaded PDF documents are private. See SUPABASE-SETUP.md for the database/bucket setup and preview-data transfer.
