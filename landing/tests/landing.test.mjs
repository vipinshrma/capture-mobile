import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const productionUrl = "https://capture-mobile.vercel.app/";
const html = readFileSync(new URL("../out/index.html", import.meta.url), "utf8");
const thanksHtml = readFileSync(new URL("../out/thanks/index.html", import.meta.url), "utf8");
const robots = readFileSync(new URL("../out/robots.txt", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../out/sitemap.xml", import.meta.url), "utf8");
const socialImage = readFileSync(new URL("../out/assets/social-preview.png", import.meta.url));
const formSource = readFileSync(new URL("../components/WaitlistForm.tsx", import.meta.url), "utf8");
const motionSource = readFileSync(new URL("../components/RevealMotion.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const vercelConfig = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));

test("metadata uses one production canonical and production sharing URLs", () => {
  assert.equal(html.match(/rel="canonical"/g)?.length, 1);
  assert.match(html, new RegExp(`<link rel="canonical" href="${productionUrl}"`));
  assert.match(html, new RegExp(`<meta property="og:url" content="${productionUrl}"`));
  assert.match(html, new RegExp(`${productionUrl}assets/social-preview\\.png`));
  assert.doesNotMatch(html, /capture-mobile-git-main-vipinshrmas-projects/);
  assert.doesNotMatch(html, /capture-mobile-mn5h8y8ti-vipinshrmas-projects/);
  assert.doesNotMatch(html, /social-preview\.svg/);

  const structuredData = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1];
  assert.ok(structuredData);
  assert.equal(JSON.parse(structuredData).url, productionUrl);
});

test("malformed links to the retired preview deployment return home", () => {
  assert.deepEqual(vercelConfig.redirects, [{
    source: "/:prefix/:host(capture-mobile-mn5h8y8ti-vipinshrmas-projects\\.vercel\\.app)/:path*",
    destination: "/",
    permanent: true,
  }]);
});

test("robots and sitemap expose only the production homepage", () => {
  assert.match(robots, /User-Agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, new RegExp(`Sitemap: ${productionUrl}sitemap\\.xml`));
  assert.match(sitemap, new RegExp(`<loc>${productionUrl}</loc>`));
  assert.doesNotMatch(sitemap, /#|<loc>.*thanks/);
});

test("the social preview is a 1200 by 630 PNG", () => {
  assert.equal(socialImage.subarray(1, 4).toString(), "PNG");
  assert.equal(socialImage.readUInt32BE(16), 1200);
  assert.equal(socialImage.readUInt32BE(20), 630);
});

test("the thanks page confirms registration without being indexed", () => {
  assert.match(thanksHtml, /You’re on the Tuck beta list/);
  assert.match(thanksHtml, /name="robots" content="noindex, follow"/);
  assert.doesNotMatch(thanksHtml, /name="email"|name="consent"/);
});

test("the static landing export includes the complete waitlist experience", () => {
  assert.equal(html.match(/<form/g)?.length, 2);
  assert.equal(html.match(/<details/g)?.length, 6);
  for (const field of ["email", "platform", "consent", "_gotcha", "_subject"]) {
    assert.match(html, new RegExp(`name="${field}"`));
  }
  assert.equal(html.match(/name="_next"/g)?.length, 2);
  for (const anchor of ["how-it-works", "privacy", "faq", "waitlist"]) {
    assert.match(html, new RegExp(`id="${anchor}"`));
    assert.match(html, new RegExp(`href="#${anchor}"`));
  }
  assert.match(html, /Toggle color theme/);
  assert.match(html, /tuck-theme/);
});

test("the public page avoids unsupported or misleading product promises", () => {
  for (const claim of ["end-to-end encryption", "automatic tagging", "cloud sync", "OCR", "millions of users", "simple tasks", "without titles", "current app UI", "protected local app storage", "hello@example.com"]) {
    assert.doesNotMatch(html, new RegExp(claim, "i"));
  }
  assert.match(html, /generated interface previews based on current Tuck features, not physical-device screenshots/i);
  assert.match(html, /uses Vercel Web Analytics/i);
});

test("generated raster previews replace HTML-built demo screens", () => {
  for (const asset of ["inbox", "quick-capture", "search-results", "capture-detail", "review"]) {
    assert.match(html, new RegExp(`/assets/screens/${asset}\\.png`));
  }
  assert.doesNotMatch(html, /preview-card|status-bar|home-indicator/);
  assert.doesNotMatch(html, /_next\/image/);
});

test("motion uses an observed, reduced-motion-safe reveal layer", () => {
  assert.match(motionSource, /IntersectionObserver/);
  assert.match(motionSource, /observer\.disconnect\(\)/);
  assert.match(motionSource, /removeEventListener\("hashchange"/);
  assert.doesNotMatch(motionSource, /addEventListener\(["']scroll/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(styles, /\.motion-ready \[data-reveal\]/);
});

test("waitlist failures stay on the form and only successful requests navigate", () => {
  assert.match(formSource, /if \(!response\.ok\) throw/);
  assert.match(formSource, /window\.location\.assign\("\/thanks"\)/);
  assert.ok(formSource.indexOf("if (!response.ok)") < formSource.indexOf("window.location.assign"));
  assert.match(formSource, /catch \{[\s\S]*setState\("error"\)/);
  assert.doesNotMatch(formSource, /form\.reset\(\)/);
});
