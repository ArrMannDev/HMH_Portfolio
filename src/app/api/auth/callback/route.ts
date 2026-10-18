import type { NextRequest } from "next/server";
import { authJson, authRedirect, getAuthOrigin, getRequestOrigin } from "../../../../lib/auth/http";
import { createClient } from "../../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const origin = getAuthOrigin(request);
    if (getRequestOrigin(request) !== origin) {
      return authJson({ error: "This callback origin is not allowed." }, 400);
    }

    if (request.nextUrl.searchParams.has("error")) {
      return authRedirect(origin, "/dashboard/login?error=cancelled");
    }

    const code = request.nextUrl.searchParams.get("code");
    if (!code) return authRedirect(origin, "/dashboard/login?error=callback");

    const supabase = await createClient({ writable: true });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return authRedirect(origin, "/dashboard/login?error=callback");

    // Deliberately ignore any next/returnTo parameter to prevent open redirects.
    return authRedirect(origin, "/dashboard");
  } catch {
    return authJson({ error: "Sign-in could not be completed. Please try again." }, 503);
  }
}
