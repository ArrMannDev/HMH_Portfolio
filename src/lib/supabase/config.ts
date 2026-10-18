import "server-only";

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.Project_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.Publishable_API_Key;

  if (!url || !key) {
    throw new Error("Supabase configuration is missing.");
  }

  if (key.startsWith("sb_secret_")) {
    throw new Error("Authentication requires a publishable key, not a secret key.");
  }

  // Also reject the legacy service-role JWT if it was pasted into this field.
  if (key.startsWith("eyJ")) {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString());
    if (payload.role !== "anon") {
      throw new Error("Authentication requires an anonymous/publishable key.");
    }
  }

  const parsed = new URL(url);
  if (!["https:", "http:"].includes(parsed.protocol)) {
    throw new Error("Supabase URL must use HTTP or HTTPS.");
  }

  return { url, key };
}

export function hasSupabaseConfig() {
  try {
    getSupabaseConfig();
    return true;
  } catch {
    return false;
  }
}

// Authentication is handled exclusively by server routes. No browser SDK
// needs to read session cookies.
export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
