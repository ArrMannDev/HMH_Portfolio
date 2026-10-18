import Link from "next/link";
import { ArrowUpRight, Images, LogOut } from "lucide-react";
import type { ReactNode } from "react";

export default function DashboardShell({ email, children }: { email: string; children: ReactNode }) {
  return (
    <div className="studio">
      <a className="studio-skip" href="#studio-content">Skip to content</a>
      <header className="studio-header">
        <Link className="studio-brand" href="/dashboard" aria-label="HUX artwork dashboard">HUX<span>.</span><small>Studio manager</small></Link>
        <nav aria-label="Dashboard navigation">
          <Link className="studio-nav-current" href="/dashboard"><Images size={17} aria-hidden="true" /> Artwork</Link>
          <a href="/#work" target="_blank" rel="noopener noreferrer">View website <ArrowUpRight size={16} aria-hidden="true" /></a>
        </nav>
        <div className="studio-account">
          <span title={email}>{email}</span>
          <form method="post" action="/api/auth/logout"><button className="studio-icon" aria-label="Sign out" title="Sign out"><LogOut size={18} aria-hidden="true" /></button></form>
        </div>
      </header>
      <main id="studio-content" className="studio-main">{children}</main>
      <footer className="studio-footer">HUX Studio manager <span>Private administrator access</span></footer>
    </div>
  );
}
