import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrlValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();

if (!siteUrlValue) throw new Error("NEXT_PUBLIC_SITE_URL is required");

const siteUrl = new URL(siteUrlValue);

if (siteUrl.protocol !== "https:" && siteUrl.protocol !== "http:") {
  throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) URL");
}

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Tuck: Save it now. Find it when it matters.",
  description:
    "Tuck is a private local inbox for links, screenshots, notes, PDFs, and voice notes, with no folders, tags, or account required.",
  alternates: { canonical: "/" },
  icons: { icon: "/assets/favicon.svg" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Tuck: Save it now. Find it when it matters.",
    description: "A private local inbox for links, files, notes, and voice.",
    images: [{ url: "/assets/social-preview.svg", width: 1200, height: 630, alt: "Tuck, a private local inbox for links, files, notes, and voice" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuck: Save it now. Find it when it matters.",
    description: "A private local inbox for links, files, notes, and voice.",
    images: ["/assets/social-preview.svg"],
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
  url: siteUrl.href,
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
        {children}
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }} />
      </body>
    </html>
  );
}
