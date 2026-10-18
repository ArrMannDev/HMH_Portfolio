import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import portrait from "../assets/images/HMH.png";
import "../index.css";

export const metadata: Metadata = {
  title: "Han Myo Htet | Graphic Designer",
  description:
    "Han Myo Htet is a graphic designer based in Bangkok, Thailand. Explore social media, advertising, poster and branding design.",
};

export const viewport: Viewport = {
  themeColor: "#030d1d",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href={portrait.src} fetchPriority="high" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
