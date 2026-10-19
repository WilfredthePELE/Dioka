# Google sign-in for Dioka

The customer account screen and /admin include Continue with Google. Existing signed-in customers can choose Connect Google in their profile. The button stays disabled with an explanation until the server is configured; no demo Google identity is accepted in production.

## Owner setup

1. In Google Cloud Console, create or select a project. Configure the Google Auth Platform app branding, audience and contact email, using diokacraft.com as the website. Request only openid, email and profile.
2. Create an OAuth client of type Web application. Register this exact authorized redirect URI: https://diokacraft.com/api/auth/google/callback . If using the local preview too, add http://127.0.0.1:3080/api/auth/google/callback as a separate URI.
3. Enter GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET privately in Truehost's environment settings, alongside DIOKA_SITE_URL=https://diokacraft.com, and restart the app. Keep the secret out of GitHub and customer-facing variables.
4. While the Google app is in Testing, add the intended Google accounts as test users. Complete Google's publishing requirements before offering it to everyone.
5. Test sign-in, sign-out, returning-user sign-in and a bag carried through sign-in on the actual domain. A real Google consent flow has not been tested without your client configuration.

## Administrator identity

Only emails in DIOKA_ADMIN_EMAILS can enter /admin. For contactus@diokacraft.com, first sign in with the existing Dioka password, open the storefront account profile, and choose Connect Google with the matching email. This proves ownership before linking a third-party email address that Google does not host. Google Workspace and Gmail identities can be linked automatically when their verified email matches. Connecting an unrelated Google email does not grant administrator access.

The flow uses an authorization code, PKCE, a one-use server transaction and an HttpOnly browser state cookie. ID tokens are checked against Google's signing keys for issuer, audience, nonce, expiry and verified email. Google access/refresh tokens are not retained. Guest bags are preserved across sign-in.

Official setup and protocol reference: https://developers.google.com/identity/openid-connect/openid-connect .
