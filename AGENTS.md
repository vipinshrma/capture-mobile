# Tuck Project Brief

## What we are building

Tuck is a production-quality React Native app built with Expo and TypeScript. It is a universal, low-friction inbox where users save links, screenshots, photos, notes, PDFs, documents, and voice notes without organizing them first.

Core product flow:

**Tuck → Inbox → Search → Review**

## Product requirements

- Saving content must not require titles, folders, tags, or an account.
- Saved content must remain searchable and available offline.
- Users can favourite, archive, review, and delete captures.
- Important actions must provide visible toast or confirmation feedback.
- Light and dark appearances must remain usable and accessible.

## Current implementation status

Implemented:

- Unified cross-platform design system derived from the Tuck landing previews: semantic light/dark palettes, standardized typography, spacing and radii, reusable headers, buttons, chips, sheets and empty states, richer standard/compact capture cards, and consistent navigation and toast feedback across every app surface.
- Redesigned onboarding, Inbox, Search, Search Results and filters, Quick Capture, incoming Share Capture, Capture Detail, Review and reminders, Settings, Privacy, Archive, Favourites, and completion/empty states without changing their existing routes or behaviors.
- Expo 55 app shell, typed stack/tab navigation, all required UI surfaces, dark mode across primary screens, and animated toast feedback.
- SQLite persistence for onboarding, appearance, captures, timestamps, user notes, local attachments, favourites, archive state, reminders, and review position, including additive migrations and legacy AsyncStorage migration.
- Inbox filters for links, images, notes, and documents; Search Results type/date filters; in-memory search across capture, metadata, and user-note fields; quick capture for notes, links, photos, and recorded audio; capture detail, review, archive, favourites, and destructive confirmations.
- Incoming single-item sharing on iOS and Android through `expo-sharing`; text, URLs, images, PDFs/files, and audio are saved with the correct kind, and attachments are copied to durable local storage.
- Capture Detail note editing, clipboard copy, native sharing, favourite feedback, local Review notifications with tap-through navigation, and confirmed Delete All with attachment cleanup.
- Security hardening for durable and staging-file deletion, 100 MB attachment and 1 MB shared-text limits, generic lock-screen reminder copy, Android backup/overlay restrictions, production signing safeguards, and an audited dependency graph with no known vulnerabilities.
- Static Next.js landing page with light/dark themes, reduced-motion-safe entrance and scroll animations, Formspree waitlist forms, Vercel Web Analytics, truthful feature/privacy copy, five generated raster feature previews, production canonical and social metadata, JSON-LD, crawlable robots and sitemap routes, a 1200×630 social preview, and a noindex waitlist confirmation route.

Known remaining work:

- Add task creation, native OCR, direct document import, optional cloud sync, and backend services only when requested.
- Complete physical-device photo-picker and microphone-permission checks on both iOS and Android.
- Complete physical-device share-sheet and notification checks on both iOS and Android before release.
- Configure and verify production Android signing credentials before distributing a release build.
- Replace the landing page’s labelled interface previews with sanitized, same-size physical-device screenshots before public launch. Search Console setup, sitemap submission, and a real Formspree submission check require owner access or approval.

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
- Create and persist quick notes, links, selected photos, and voice recordings.
- Search titles, saved text, user notes, URLs, categories, and available metadata.
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

- Cross-platform premium productivity interface with native-safe iOS and Android behavior
- Light background: `#F3F1ED`; light surface: `#FDFDFC`
- Dark background: `#0D0D0F`; dark surface: `#1A1A1D`
- Primary accent: `#423F91`; dark accent text: `#AAA5F0`
- Semantic theme tokens for every background, surface, text, border, feedback, and interaction state
- Spacing scale: `4, 8, 12, 16, 20, 24, 32`; radii: `12, 16, 22`, and fully rounded controls
- System/SF Pro-style typography with `28–34` large titles and readable `15–17` content
- Restrained shadows in light mode; tonal borders and surface separation in dark mode
- Native-feeling stack, tab, sheet, alert, and toast transitions with minimum 44-point touch targets

## Integration boundaries

The native iOS Share Extension and Android share intents are configured through `expo-sharing`; direct photo selection and voice recording use Expo's native picker and audio modules. Native OCR, direct document import, optional cloud sync, and backend services remain future integrations. Keep their boundaries clear, and do not invent implementations until requested.

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
