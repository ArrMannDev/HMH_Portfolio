import type { NextRequest } from "next/server";
import { authJson, authRedirect, getAuthOrigin, isSameOriginRequest } from "../../../../lib/auth/http";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const origin = getAuthOrigin(request);
    if (!isSameOriginRequest(request, origin)) {
      return authJson({ error: "This request is not allowed." }, 403);
    }

    const supabase = await createClient({ writable: true });
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return authRedirect(origin, "/account?error=signout");

    return authRedirect(origin, "/dashboard/login?signed_out=1");
  } catch {
    return authJson({ error: "Sign-out could not be completed. Please try again." }, 503);
  }
}
