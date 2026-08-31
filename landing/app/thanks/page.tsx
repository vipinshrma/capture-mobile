import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "You’re on the Tuck beta list",
  description: "Your Tuck private beta waitlist registration is confirmed.",
  alternates: { canonical: "/thanks" },
  robots: { index: false, follow: true },
};

export default function Thanks() {
  return (
    <main className="thanks-main">
      <section className="thanks-card" aria-labelledby="thanks-title">
        <Image src="/assets/logo.svg" alt="" width={64} height={64} priority />
        <p className="eyebrow">Registration confirmed</p>
        <h1 id="thanks-title">You’re on the Tuck beta list.</h1>
        <p>We’ll email you when access is ready for your selected platform. No spam—only beta access and important launch updates.</p>
        <a className="button" href="/">Return to Tuck</a>
      </section>
    </main>
  );
}
