import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "../../types/database";
import { AUTH_NO_STORE_HEADERS } from "../auth/http";
import { authCookieOptions, getSupabaseConfig, hasSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (hasSupabaseConfig()) {
    const { url, key } = getSupabaseConfig();
    const supabase = createServerClient<Database>(url, key, {
      cookieOptions: authCookieOptions,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, cacheHeaders) {
          const previousCookies = response.cookies.getAll();
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          previousCookies.forEach((cookie) => response.cookies.set(cookie));
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(cacheHeaders).forEach(([name, value]) => response.headers.set(name, value));
        },
      },
    });

    // Refresh cookies here. Authorization is repeated in pages and API routes.
    await supabase.auth.getClaims();
  }

  Object.entries(AUTH_NO_STORE_HEADERS).forEach(([name, value]) => response.headers.set(name, value));
  return response;
}
