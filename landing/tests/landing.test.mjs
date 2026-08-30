import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../out/index.html", import.meta.url), "utf8");

test("the static landing export includes the complete waitlist experience", () => {
  assert.equal(html.match(/<form/g)?.length, 2);
  assert.equal(html.match(/<details/g)?.length, 6);
  for (const field of ["email", "platform", "consent", "_gotcha", "_subject"]) {
    assert.match(html, new RegExp(`name="${field}"`));
  }
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
  assert.match(html, /simplified interface previews, not device screenshots/i);
  assert.match(html, /uses Vercel Web Analytics/i);
});
