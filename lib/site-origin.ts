const PRODUCTION_SITE_ORIGIN = "https://www.diokacraft.com";

export function siteOrigin() {
  return process.env.VERCEL_ENV === "production"
    ? PRODUCTION_SITE_ORIGIN
    : new URL(process.env.DIOKA_SITE_URL || "http://localhost:3000").origin;
}
