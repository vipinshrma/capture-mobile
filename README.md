# Tuck

Expo React Native implementation of the Tuck iOS inbox prototype.

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

Captures, local attachments, reminders, and settings are persisted locally with SQLite. Navigation uses typed React Navigation stacks and tabs. Quick Capture supports notes, links, selected photos, and voice recordings; incoming text, URLs, images, PDFs/files, and audio are also supported through the iOS Share Extension and Android share intents.

Local Android release builds are unsigned unless `TUCK_ANDROID_KEYSTORE`, `TUCK_ANDROID_KEYSTORE_PASSWORD`, `TUCK_ANDROID_KEY_ALIAS`, and `TUCK_ANDROID_KEY_PASSWORD` are set. EAS production builds should use managed production credentials.

Native OCR, direct document import, and cloud sync remain future integrations.
