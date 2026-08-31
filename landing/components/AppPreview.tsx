import Image from "next/image";

type PreviewKind = "inbox" | "capture" | "search" | "detail" | "review";

const previews = {
  inbox: {
    src: "/assets/screens/inbox.png",
    alt: "Generated preview of the Tuck Inbox with saved links, notes, and images",
  },
  capture: {
    src: "/assets/screens/quick-capture.png",
    alt: "Generated preview of Tuck Quick Capture with note, voice, photo, and link choices",
  },
  search: {
    src: "/assets/screens/search-results.png",
    alt: "Generated preview of Tuck Search Results with content type and date filters",
  },
  detail: {
    src: "/assets/screens/capture-detail.png",
    alt: "Generated preview of a Tuck voice-note detail with playback, note, and capture actions",
  },
  review: {
    src: "/assets/screens/review.png",
    alt: "Generated dark-mode preview of the Tuck Review queue with keep, archive, remind, and open actions",
  },
} satisfies Record<PreviewKind, { src: string; alt: string }>;

export function AppPreview({ kind, compact = false, priority = false }: { kind: PreviewKind; compact?: boolean; priority?: boolean }) {
  const preview = previews[kind];

  return (
    <Image
      className={`app-preview-image${compact ? " compact" : ""}`}
      src={preview.src}
      alt={preview.alt}
      width={768}
      height={1152}
      sizes={compact ? "(max-width: 720px) 65vw, 260px" : "(max-width: 720px) 76vw, 320px"}
      priority={priority}
    />
  );
}
