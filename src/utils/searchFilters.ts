import type { Capture, CaptureKind } from "../types";

export type ContentFilter = "Links" | "Screenshots" | "Documents" | "Notes" | "Audio" | "Tasks";
export type DateFilter = "Today" | "This week" | "This month";

const kinds: Record<ContentFilter, CaptureKind> = {
  Links: "link",
  Screenshots: "image",
  Documents: "document",
  Notes: "note",
  Audio: "voice",
  Tasks: "task",
};

export function matchesSearchFilters(capture: Capture, content?: ContentFilter, date?: DateFilter, now = new Date()) {
  if (content && capture.kind !== kinds[content]) return false;
  if (!date) return true;
  const captured = capture.capturedAt ? new Date(capture.capturedAt) : null;
  if (!captured || Number.isNaN(captured.getTime())) return false;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (date === "This week") start.setDate(start.getDate() - start.getDay());
  if (date === "This month") start.setDate(1);
  return captured >= start && captured <= now;
}
