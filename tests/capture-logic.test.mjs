import test from "node:test";
import assert from "node:assert/strict";
import { isAttachmentSizeAllowed, mapSharedPayload } from "../src/utils/sharePayload.ts";
import { matchesSearchFilters } from "../src/utils/searchFilters.ts";
import { formatReminderLabel, getReminderDate } from "../src/utils/reminders.ts";
import { formatCaptureTime, getPlatform, normalizeWebUrl, parseLinkMetadata } from "../src/utils/capture.ts";

test("maps incoming payloads to capture kinds", () => {
  assert.equal(mapSharedPayload({ shareType: "url", value: "https://example.com" }).kind, "link");
  assert.equal(mapSharedPayload({ shareType: "text", value: "https://youtu.be/example" }).kind, "link");
  assert.deepEqual(mapSharedPayload({ shareType: "text", value: "Check out this video\nhttps://youtu.be/example?si=123" }), {
    kind: "link",
    title: "https://youtu.be/example?si=123",
    source: "https://youtu.be/example?si=123",
  });
  assert.equal(mapSharedPayload({ shareType: "audio", value: "file:///audio.m4a", contentUri: "file:///audio.m4a", originalName: "audio.m4a" }).kind, "voice");
  assert.deepEqual(mapSharedPayload({ shareType: "image", value: "file:///photo.jpg", contentUri: "file:///photo.jpg", originalName: "photo.jpg", contentMimeType: "image/jpeg" }), {
    kind: "image",
    title: "photo.jpg",
    localFileUri: "file:///photo.jpg",
    mimeType: "image/jpeg",
  });
  assert.equal(isAttachmentSizeAllowed(100 * 1024 * 1024), true);
  assert.equal(isAttachmentSizeAllowed(100 * 1024 * 1024 + 1), false);
  assert.throws(() => mapSharedPayload({ shareType: "text", value: "x".repeat(1_000_001) }));
});

test("filters captures by type and local calendar boundary", () => {
  const now = new Date("2026-08-29T12:00:00");
  const capture = { id: "1", kind: "note", title: "Today", createdAt: "Today", capturedAt: "2026-08-29T09:00:00" };
  assert.equal(matchesSearchFilters(capture, "Notes", "Today", now), true);
  assert.equal(matchesSearchFilters(capture, "Links", "Today", now), false);
  assert.equal(matchesSearchFilters({ ...capture, capturedAt: "2026-07-01T09:00:00" }, undefined, "This month", now), false);
});

test("creates local 9am reminder dates", () => {
  const now = new Date("2026-08-29T20:30:00");
  assert.equal(getReminderDate("tomorrow", now).getTime(), new Date("2026-08-30T09:00:00").getTime());
  assert.equal(getReminderDate("next-week", now).getTime(), new Date("2026-09-05T09:00:00").getTime());
  assert.match(formatReminderLabel("2026-08-30T09:00:00", now), /^Reminded: Tomorrow, /);
  assert.equal(formatReminderLabel("2026-08-29T19:00:00", now), "Reminder due");
});

test("normalizes quick-capture web links", () => {
  assert.equal(normalizeWebUrl("example.com/article"), "https://example.com/article");
  assert.throws(() => normalizeWebUrl("not a link"));
});

test("formats capture timestamps relative to the current time", () => {
  const now = new Date("2026-09-05T12:00:00Z");
  assert.equal(formatCaptureTime("2026-09-05T11:59:40Z", "", now), "Just now");
  assert.equal(formatCaptureTime("2026-09-05T11:59:00Z", "", now), "1 minute ago");
  assert.equal(formatCaptureTime("2026-09-05T10:00:00Z", "", now), "2 hours ago");
  assert.equal(formatCaptureTime("2026-09-04T12:00:00Z", "", now), "Yesterday");
  assert.equal(formatCaptureTime("2026-08-30T12:00:00Z", "", now), "6 days ago");
});

test("extracts link previews and recognizes platform categories", () => {
  assert.deepEqual(parseLinkMetadata(`
    <html><head>
      <meta content="Tuck &amp; save" property="og:title">
      <meta name="description" content="A useful page">
      <meta property="og:image" content="/preview.jpg">
      <meta property="og:site_name" content="Example">
    </head></html>
  `, "https://example.com/article"), {
    title: "Tuck & save",
    description: "A useful page",
    image: "https://example.com/preview.jpg",
    siteName: "Example",
  });
  assert.equal(getPlatform("https://www.youtube.com/watch?v=1")?.name, "YouTube");
  assert.equal(getPlatform("https://instagram.com/p/example")?.name, "Instagram");
  assert.equal(getPlatform("https://dev.to/example/article")?.name, "DEV Community");
  assert.equal(getPlatform("https://news.example.org/article")?.name, "news.example.org");
});
