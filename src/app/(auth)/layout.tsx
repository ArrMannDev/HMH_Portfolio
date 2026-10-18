import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../../components/auth/Auth.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
