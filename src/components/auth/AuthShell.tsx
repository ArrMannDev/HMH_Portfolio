import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="auth-page" aria-labelledby="auth-title">
      <div className="auth-shell">
        <header className="auth-brand">
          <Link href="/" aria-label="Han Myo Htet portfolio">
            HUX<span>.</span>
          </Link>
          <p>Han Myo Htet<br /><span>Graphic Designer</span></p>
        </header>

        <div className="auth-layout">
          <aside className="auth-intro" aria-label="Portfolio access">
            <p className="auth-eyebrow">Behind the work</p>
            <h2>A space for<br /><span>what&apos;s next.</span></h2>
            <p>Private access to Han Myo Htet&apos;s portfolio.</p>
          </aside>

          <section className="auth-content" aria-labelledby="auth-title">
            <p className="auth-eyebrow">{eyebrow}</p>
            <h1 id="auth-title">{title}</h1>
            <p className="auth-description">{description}</p>
            {children}
          </section>
        </div>

        <footer className="auth-footer">
          <Link href="/">Back to the portfolio <ArrowUpRight size={16} aria-hidden="true" /></Link>
          <span>HUX Studio access</span>
        </footer>
      </div>
    </main>
  );
}
