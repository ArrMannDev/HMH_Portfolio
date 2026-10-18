import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import "../../../components/dashboard/Dashboard.css";
import { createClient } from "../../../lib/supabase/server";
import { hasSupabaseConfig } from "../../../lib/supabase/config";
import { readAuthState } from "../../../lib/auth/session";

export const metadata: Metadata = { title: "Artwork dashboard | HUX", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!hasSupabaseConfig()) redirect("/dashboard/login?error=configuration");
  let state;
  try { state = await readAuthState(await createClient()); }
  catch { redirect("/account"); }
  if (!state.user) redirect("/dashboard/login");
  if (!state.isAdmin) redirect("/account");
  return <DashboardShell email={state.user.email || "Google account"}>{children}</DashboardShell>;
}
