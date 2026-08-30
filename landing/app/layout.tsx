import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

if (!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL is required");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tuck: Save it now. Find it when it matters.",
  description:
    "Tuck is one private inbox for links, screenshots, notes, documents, and voice notes, without folders, tags, or setup.",
  alternates: { canonical: "/" },
  icons: { icon: "/assets/favicon.svg" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Tuck: Save it now. Find it when it matters.",
    description: "A private inbox for everything worth remembering.",
    images: [{ url: "/assets/social-preview.svg", width: 1200, height: 630, alt: "Tuck, a private inbox for everything" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuck: Save it now. Find it when it matters.",
    description: "A private inbox for everything worth remembering.",
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
  url: siteUrl,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "iOS, Android",
  description: "A private, local-first inbox for links, screenshots, notes, documents, and voice notes.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var saved=localStorage.getItem("tuck-theme");var theme=saved||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme}catch(e){}})()` }} />
      </head>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }} />
      </body>
    </html>
  );
}
