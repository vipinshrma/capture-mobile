# Tuck Project Brief

## What we are building

Tuck is a production-quality React Native iOS app built with Expo and TypeScript. It is a universal, low-friction inbox where users save links, screenshots, photos, notes, PDFs, voice notes, and tasks without organizing them first.

Core product flow:

**Tuck → Inbox → Search → Review**

## Product requirements

- Saving content must not require titles, folders, tags, or an account.
- Saved content must remain searchable and available offline.
- Users can favourite, archive, review, and delete captures.
- Important actions must provide visible toast or confirmation feedback.
- Light and dark appearances must remain usable and accessible.

## Required screens

Every route must have its own file under `src/screens/`.

1. Three-step onboarding
2. Empty Inbox
3. Populated Inbox
4. Share Capture
5. Quick Capture sheet
6. Capture Detail
7. Search
8. Search Results
9. Filters sheet
10. Review queue
11. Review completion state
12. Settings
13. Privacy
14. Archive
15. Favourites
16. Delete confirmation

## Required interactions

- Open captures from Inbox, Search, Review, Archive, and Favourites.
- Create and persist quick notes.
- Search titles, bodies, categories, and extracted text.
- Filter Inbox content by type.
- Favourite, archive, and delete captures.
- Review actions: Keep, Archive, Remind, and Open.
- Capture Detail must return to Review when opened from Review.
- Toggle dark mode from Settings.
- Show confirmation alerts before destructive actions.
- Display animated toast feedback.

## Architecture

```text
src/
  components/  shared UI, cards, sheets, and feedback
  data/        seed and fixture content
  navigation/  typed native-stack and bottom-tab navigation
  screens/     one file per route
  store/       SQLite database, migration, application state, and actions
  theme.ts     design tokens
  types.ts     domain and navigation types
```

Rules:

- Keep `App.tsx` limited to providers and application initialization.
- Use typed React Navigation routes.
- Persist captures and application settings with Expo SQLite.
- Reuse shared components and design tokens.
- Do not place multiple full screens in one file.
- Avoid speculative abstractions and unnecessary dependencies.
- Preserve safe areas, accessibility labels, input validation, and destructive-action safeguards.

## Design direction

- Premium, softly layered iOS interface
- Background: `#F3F1ED`
- Primary accent: `#423F91`
- Card surface: `#FFFFFF`
- Dark background: `#000000`
- Dark card: `#1C1C1E`
- Content card radius: `22`
- Horizontal screen spacing: `16–20`
- System/SF Pro-style typography
- Large titles: `32`, bold
- Pill-shaped search fields, filters, and primary controls
- Native-feeling stack, tab, sheet, alert, and toast transitions

## Integration boundaries

Native OCR, the real iOS Share Extension, audio recording, file import, optional cloud sync, and backend services are future integrations. Keep their boundaries clear, but do not invent implementations until requested.

## Validation

Before considering a change complete:

```bash
npm run typecheck
npx expo export --platform ios --output-dir /tmp/capture-mobile-production
```

Run locally with:

```bash
npm run ios
```
