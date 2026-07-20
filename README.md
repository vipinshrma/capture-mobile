# Capture

Expo React Native implementation of the Capture iOS inbox prototype.

## Run

```bash
npm install
npm run ios
```

## Structure

```text
src/
  components/  shared UI, cards, sheets and toast feedback
  data/        seed content
  navigation/  typed stack and bottom tabs
  screens/     one file per app screen
  store/       persisted application state and actions
  theme.ts     design tokens
  types.ts     navigation and domain types
```

Captures and settings are persisted locally with SQLite. Navigation uses typed React Navigation stacks and tabs.

Native OCR, a real iOS Share Extension, audio recording and cloud sync are service integrations and are intentionally outside this UI codebase.
