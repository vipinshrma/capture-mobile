import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { RevealMotion } from "../components/RevealMotion";
import { SITE_URL, SOCIAL_IMAGE_URL } from "../lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Tuck: Save it now. Find it when it matters.",
  description:
    "Tuck is a private read-later and capture app for links, screenshots, PDFs, notes, and voice, stored locally on iOS and Android.",
  alternates: { canonical: "/" },
  icons: { icon: "/assets/favicon.svg" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Tuck: Save it now. Find it when it matters.",
    description: "A private read-later and capture app for links, screenshots, PDFs, notes, and voice.",
    images: [{ url: SOCIAL_IMAGE_URL, width: 1200, height: 630, alt: "Tuck, a private local inbox for links, files, notes, and voice" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuck: Save it now. Find it when it matters.",
    description: "A private read-later and capture app for links, screenshots, PDFs, notes, and voice.",
    images: [SOCIAL_IMAGE_URL],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f1ed" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

const softwareApplication = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Tuck",
  url: SITE_URL,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "iOS, Android",
  description: "A private local inbox for links, screenshots, notes, PDFs, supported files, and voice notes.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var saved=localStorage.getItem("tuck-theme");var theme=saved||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme}catch(e){}})()` }} />
      </head>
      <body>
        <RevealMotion />
        {children}
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }} />
      </body>
    </html>
  );
}
