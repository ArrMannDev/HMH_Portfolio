import { authJson } from "../../../../lib/auth/http";
import { AuthAccessError, readAuthState } from "../../../../lib/auth/session";
import { createClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient({ writable: true });
    const { user, isAdmin } = await readAuthState(supabase);
    if (!user) return authJson({ user: null, isAdmin: false }, 401);

    return authJson({ user: { id: user.id, email: user.email }, isAdmin });
  } catch (error) {
    return authJson({ error: error instanceof AuthAccessError ? error.message : "Account access is temporarily unavailable." }, 503);
  }
}
