import test from "node:test";
import assert from "node:assert/strict";
import { isAttachmentSizeAllowed, mapSharedPayload } from "../src/utils/sharePayload.ts";
import { matchesSearchFilters } from "../src/utils/searchFilters.ts";
import { getReminderDate } from "../src/utils/reminders.ts";
import { normalizeWebUrl } from "../src/utils/capture.ts";

test("maps incoming payloads to capture kinds", () => {
  assert.equal(mapSharedPayload({ shareType: "url", value: "https://example.com" }).kind, "link");
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
});

test("normalizes quick-capture web links", () => {
  assert.equal(normalizeWebUrl("example.com/article"), "https://example.com/article");
  assert.throws(() => normalizeWebUrl("not a link"));
});
