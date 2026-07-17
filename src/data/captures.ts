import type { Capture } from "../types";

export const seedCaptures: Capture[] = [
  {
    id: "offline-link",
    kind: "link",
    title: "Building reliable offline-first applications",
    body: "Patterns for local storage, sync and conflict handling.",
    source: "github.com",
    category: "Development",
    createdAt: "12 minutes ago",
    favourite: true,
  },
  {
    id: "offline-shot",
    kind: "image",
    title: "Local-first is the new offline-first",
    body: "Offline-first apps should treat the local database as the primary source of truth.",
    source: "Safari",
    category: "Screenshot",
    createdAt: "25 minutes ago",
  },
  {
    id: "idea",
    kind: "note",
    title: "Let users save information immediately and organize it after the moment has passed.",
    category: "Idea",
    createdAt: "Today, 9:14 AM",
  },
  {
    id: "task",
    kind: "task",
    title: "Review PR #482 before standup",
    source: "Slack",
    createdAt: "Tomorrow, 9:00 AM",
  },
  {
    id: "research",
    kind: "document",
    title: "Mobile Capture Product Research",
    body: "18 pages · 3.2 MB",
    createdAt: "Yesterday, 6:40 PM",
  },
  {
    id: "voice",
    kind: "voice",
    title: "Explore whether daily resurfacing should use a card stack or a simple list.",
    body: "0:42",
    createdAt: "Yesterday",
  },
  {
    id: "archived-note",
    kind: "note",
    title: "Try daily resurfacing at 8am instead of on open.",
    createdAt: "Archived 3 days ago",
    archived: true,
  },
];
