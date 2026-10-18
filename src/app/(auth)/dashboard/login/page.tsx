import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import AuthShell from "../../../../components/auth/AuthShell";
import { readAuthState } from "../../../../lib/auth/session";
import { hasSupabaseConfig } from "../../../../lib/supabase/config";
import { createClient } from "../../../../lib/supabase/server";

export const metadata: Metadata = { title: "Sign in | HUX" };
export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  cancelled: "Google sign-in was not completed. You can try again below.",
  callback: "This sign-in link is invalid or has expired. Please start again.",
  signin: "Google sign-in could not be started. Please try again.",
  configuration: "Sign-in is not configured yet. Please contact the site owner.",
  unavailable: "Sign-in is temporarily unavailable. Please try again.",
};

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const configured = hasSupabaseConfig();
  let signedIn = false;
  let sessionError = false;

  if (configured) {
    try {
      const state = await readAuthState(await createClient());
      signedIn = !!state.user;
    } catch {
      sessionError = true;
    }
  }
  if (signedIn) redirect("/account");

  const message = !configured
    ? errorMessages.configuration
    : sessionError
      ? errorMessages.unavailable
      : typeof params.error === "string" && Object.hasOwn(errorMessages, params.error)
        ? errorMessages[params.error]
        : undefined;

  return (
    <AuthShell
      eyebrow="Studio access"
      title="Welcome back."
      description="Sign in with your approved Google account to continue."
    >
      {message && <p className="auth-message" role="alert">{message}</p>}
      {params.signed_out === "1" && !message && (
        <p className="auth-message auth-message--success" role="status">You have signed out.</p>
      )}
      <form className="auth-form" action="/api/auth/google" method="post">
        <button className="auth-button" type="submit" disabled={!configured}>
          <LogIn size={18} aria-hidden="true" />
          Continue with Google
        </button>
      </form>
      <p className="auth-note">Access is limited to approved portfolio administrators.</p>
    </AuthShell>
  );
}
