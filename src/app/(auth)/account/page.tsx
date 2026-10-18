import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "../../../components/auth/AuthShell";
import { readAuthState } from "../../../lib/auth/session";
import { hasSupabaseConfig } from "../../../lib/supabase/config";
import { createClient } from "../../../lib/supabase/server";

export const metadata: Metadata = { title: "Account access | HUX" };
export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (!hasSupabaseConfig()) redirect("/dashboard/login?error=configuration");

  let state;
  try {
    state = await readAuthState(await createClient());
  } catch {
    return (
      <AuthShell eyebrow="Account access" title="Please try again." description="We couldn't check your account access right now.">
        <p className="auth-message" role="alert">Your access has not been confirmed. Please retry in a moment.</p>
        <div className="auth-actions">
          <a className="auth-button" href="/account">Check access again</a>
          <form className="auth-form" action="/api/auth/logout" method="post">
            <button className="auth-button auth-button--secondary" type="submit">Sign out</button>
          </form>
        </div>
      </AuthShell>
    );
  }

  if (!state.user) redirect("/dashboard/login");

  return (
    <AuthShell
      eyebrow="Account access"
      title={state.isAdmin ? "You're signed in." : "Approval pending."}
      description={state.isAdmin
        ? "Your account has administrator access."
        : "Your Google account is signed in. Administrator access has not been granted yet."}
    >
      {params.error === "signout" && <p className="auth-message" role="alert">Sign-out could not be completed. Please try again.</p>}
      <dl className="auth-details">
        <div><dt>Signed in as</dt><dd>{state.user.email || "Google account"}</dd></div>
        <div><dt>Account access</dt><dd>{state.isAdmin ? "Administrator" : "Pending approval"}</dd></div>
        <div><dt>User ID</dt><dd><code>{state.user.id}</code></dd></div>
      </dl>
      <div className="auth-actions">
        {state.isAdmin && <a className="auth-button" href="/dashboard">Open artwork dashboard</a>}
        {!state.isAdmin && <a className="auth-button" href="/account">Check access again</a>}
        <form className="auth-form" action="/api/auth/logout" method="post">
          <button className="auth-button auth-button--secondary" type="submit">Sign out</button>
        </form>
      </div>
    </AuthShell>
  );
}
