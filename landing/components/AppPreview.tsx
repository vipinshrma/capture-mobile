type PreviewKind = "inbox" | "capture" | "search" | "detail" | "review";

const content = {
  inbox: { title: "Inbox", eyebrow: "Good morning", cards: ["Building reliable offline-first applications", "Save immediately. Organize later.", "Mobile Capture Product Research"] },
  capture: { title: "Quick Capture", eyebrow: "Save something", cards: ["Write a note", "Record voice", "Choose photo", "Paste link"] },
  search: { title: "Search", eyebrow: "3 results", cards: ["Links · This week", "Local-first is the new offline-first", "Building reliable offline-first applications"] },
  detail: { title: "Voice note", eyebrow: "Capture detail", cards: ["▶  00:32", "Add a note", "Share     Favourite"] },
  review: { title: "Review", eyebrow: "1 of 4", cards: ["Review PR #482 before standup", "Keep", "Archive     Remind"] },
} satisfies Record<PreviewKind, { title: string; eyebrow: string; cards: string[] }>;

export function AppPreview({ kind, compact = false }: { kind: PreviewKind; compact?: boolean }) {
  const screen = content[kind];
  return (
    <div className={`app-preview preview-${kind}${compact ? " compact" : ""}`} role="img" aria-label={`${screen.title} screen in Tuck`}>
      <div className="status-bar"><span>10:03</span><span>5G</span></div>
      <div className="preview-heading"><small>{screen.eyebrow}</small><strong>{screen.title}</strong></div>
      {kind === "inbox" && <div className="preview-filters"><span>All</span><span>Links</span><span>Notes</span></div>}
      {kind === "search" && <div className="preview-search">Search your captures</div>}
      <div className="preview-cards">
        {screen.cards.map((card, index) => <div className={`preview-card card-${index}`} key={card}><span>{card}</span>{index > 0 && <small>{index === 1 ? "Today" : "Saved in Tuck"}</small>}</div>)}
      </div>
      {kind === "review" && <button type="button" tabIndex={-1}>Open capture</button>}
      <div className="home-indicator" />
    </div>
  );
}
