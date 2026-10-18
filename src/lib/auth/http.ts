import "server-only";

import { NextResponse, type NextRequest } from "next/server";

export const AUTH_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
};

const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

export function getRequestOrigin(request: NextRequest) {
  const url = new URL(request.url);
  const host = request.headers.get("host");

  // NextURL normalizes loopback IPs to localhost. Preserve the browser's
  // actual local origin for PKCE cookies, CSRF checks, and the callback URL.
  if (!process.env.VERCEL && host) {
    const local = new URL(`${url.protocol}//${host}`);
    if (LOOPBACK_HOSTS.includes(local.hostname) && local.host === host) {
      return local.origin;
    }
  }

  return url.origin;
}

export function getAuthOrigin(request: NextRequest) {
  const incoming = new URL(getRequestOrigin(request));

  if (!process.env.VERCEL && LOOPBACK_HOSTS.includes(incoming.hostname)) {
    return incoming.origin;
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined);

  if (!configured) throw new Error("The application origin is not configured.");
  const site = new URL(configured);
  if (site.protocol !== "https:" || site.username || site.password || site.pathname !== "/" || site.search || site.hash) {
    throw new Error("The application origin is invalid.");
  }
  return site.origin;
}

export function isSameOriginRequest(request: NextRequest, origin: string) {
  return request.headers.get("origin") === origin &&
    getRequestOrigin(request) === origin &&
    request.headers.get("sec-fetch-site") !== "cross-site";
}

export function authJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: AUTH_NO_STORE_HEADERS });
}

export function authRedirect(origin: string, path: string) {
  // Every caller supplies a fixed application path, never a user-provided URL.
  return NextResponse.redirect(new URL(path, origin), {
    status: 303,
    headers: AUTH_NO_STORE_HEADERS,
  });
}
