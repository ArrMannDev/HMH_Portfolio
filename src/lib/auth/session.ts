import "server-only";

import { isAuthSessionMissingError, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database";
import { createClient } from "../supabase/server";

export class AuthAccessError extends Error {
  constructor(public status: 401 | 403 | 503, message: string) {
    super(message);
    this.name = "AuthAccessError";
  }
}

export async function readAuthState(supabase: SupabaseClient<Database>) {
  // Revalidate identity with Supabase Auth, including session revocation.
  // Do not authorize using an unverified getSession() result or user metadata.
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    const invalidSession = isAuthSessionMissingError(error) ||
      (error.status !== undefined && [400, 401, 403].includes(error.status));
    if (invalidSession) return { user: null, isAdmin: false };
    throw new AuthAccessError(503, "Sign-in is temporarily unavailable. Please try again.");
  }

  if (!user) return { user: null, isAdmin: false };

  const { data: membership, error: membershipError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    throw new AuthAccessError(503, "Account access could not be checked. Please try again.");
  }

  return { user, isAdmin: membership?.user_id === user.id };
}

export async function requireAdmin() {
  const supabase = await createClient({ writable: true });
  const state = await readAuthState(supabase);
  if (!state.user) throw new AuthAccessError(401, "Sign in to continue.");
  if (!state.isAdmin) throw new AuthAccessError(403, "Administrator access is required.");
  return { supabase, user: state.user };
}
