import { NextRequest, NextResponse } from "next/server";
import { siteOrigin } from "@/lib/site-origin";

const DIOKA_HOSTS = new Set(["diokacraft.com", "www.diokacraft.com"]);

/** Keep OAuth start, callback, and the resulting session on one host. */
export function proxy(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return NextResponse.next();
  const canonical = new URL(siteOrigin());

  const canonicalHost = canonical.hostname.toLowerCase();
  const incomingHost = request.nextUrl.hostname.toLowerCase();
  const isDiokaDomain = DIOKA_HOSTS.has(incomingHost);
  const isVercelProjectHost = incomingHost.endsWith(".vercel.app");
  if (!DIOKA_HOSTS.has(canonicalHost) || incomingHost === canonicalHost || (!isDiokaDomain && !isVercelProjectHost)) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.protocol = canonical.protocol;
  destination.host = canonical.host;
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
