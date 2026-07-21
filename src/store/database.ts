import AsyncStorage from "@react-native-async-storage/async-storage";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import type { Capture, CaptureKind } from "../types";

export type PersistedState = {
  onboarded: boolean;
  dark: boolean;
  captures: Capture[];
  reviewIndex: number;
};

type CaptureRow = {
  id: string;
  kind: CaptureKind;
  title: string;
  body: string | null;
  source: string | null;
  category: string | null;
  metadata_title: string | null;
  metadata_description: string | null;
  metadata_image: string | null;
  metadata_site_name: string | null;
  local_file_uri: string | null;
  created_at: string;
  favourite: number;
  archived: number;
};

const LEGACY_STORAGE_KEY = "capture.app-state.v1";
const CAPTURE_KINDS: CaptureKind[] = ["link", "image", "note", "document", "task", "voice"];

export async function initializeDatabase(fallback: PersistedState) {
  const database = await openDatabaseAsync("capture.db");
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS captures (
      id TEXT PRIMARY KEY NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('link', 'image', 'note', 'document', 'task', 'voice')),
      title TEXT NOT NULL,
      body TEXT,
      source TEXT,
      category TEXT,
      metadata_title TEXT,
      metadata_description TEXT,
      metadata_image TEXT,
      metadata_site_name TEXT,
      local_file_uri TEXT,
      created_at TEXT NOT NULL,
      favourite INTEGER NOT NULL DEFAULT 0,
      archived INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS captures_position_idx ON captures(position);
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  await addColumn(database, "captures", "metadata_title TEXT");
  await addColumn(database, "captures", "metadata_description TEXT");
  await addColumn(database, "captures", "metadata_image TEXT");
  await addColumn(database, "captures", "metadata_site_name TEXT");
  await addColumn(database, "captures", "local_file_uri TEXT");

  const initialized = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'initialized'",
  );

  if (!initialized) {
    const legacy = normalizeLegacyState(await AsyncStorage.getItem(LEGACY_STORAGE_KEY), fallback);
    await saveState(database, legacy);
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch((error) => {
      console.warn("SQLite migration succeeded, but legacy storage could not be removed", error);
    });
    return { database, state: legacy };
  }

  const [rows, settings] = await Promise.all([
    database.getAllAsync<CaptureRow>("SELECT * FROM captures ORDER BY position"),
    database.getAllAsync<{ key: string; value: string }>("SELECT key, value FROM settings"),
  ]);
  const values = Object.fromEntries(settings.map(({ key, value }) => [key, value]));

  return {
    database,
    state: {
      onboarded: values.onboarded === "1",
      dark: values.dark === "1",
      reviewIndex: Math.max(0, Number.parseInt(values.reviewIndex || "0", 10) || 0),
      captures: rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        title: row.title,
        body: row.body || undefined,
        source: row.source || undefined,
        category: row.category || undefined,
        metadataTitle: row.metadata_title || undefined,
        metadataDescription: row.metadata_description || undefined,
        metadataImage: row.metadata_image || undefined,
        metadataSiteName: row.metadata_site_name || undefined,
        localFileUri: row.local_file_uri || undefined,
        createdAt: row.created_at,
        favourite: Boolean(row.favourite),
        archived: Boolean(row.archived),
      })),
    },
  };
}

export async function saveState(database: SQLiteDatabase, state: PersistedState) {
  // ponytail: full-state writes keep one persistence path; use row-level writes when capture volume makes this measurable.
  await database.withTransactionAsync(async () => {
    await database.runAsync("DELETE FROM captures");
    for (const [position, capture] of state.captures.entries()) {
      await database.runAsync(
        `INSERT INTO captures
          (id, kind, title, body, source, category, metadata_title, metadata_description, metadata_image, metadata_site_name, local_file_uri, created_at, favourite, archived, position)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        capture.id,
        capture.kind,
        capture.title,
        capture.body ?? null,
        capture.source ?? null,
        capture.category ?? null,
        capture.metadataTitle ?? null,
        capture.metadataDescription ?? null,
        capture.metadataImage ?? null,
        capture.metadataSiteName ?? null,
        capture.localFileUri ?? null,
        capture.createdAt,
        capture.favourite ? 1 : 0,
        capture.archived ? 1 : 0,
        position,
      );
    }
    for (const [key, value] of Object.entries({
      initialized: "1",
      onboarded: state.onboarded ? "1" : "0",
      dark: state.dark ? "1" : "0",
      reviewIndex: String(state.reviewIndex),
    })) {
      await database.runAsync(
        "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        key,
        value,
      );
    }
  });
}

async function addColumn(database: SQLiteDatabase, table: string, column: string) {
  try {
    await database.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column}`);
  } catch {
    // Existing installs already have this migration.
  }
}

function normalizeLegacyState(value: string | null, fallback: PersistedState): PersistedState {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value) as Partial<PersistedState>;
    return {
      onboarded: typeof parsed.onboarded === "boolean" ? parsed.onboarded : fallback.onboarded,
      dark: typeof parsed.dark === "boolean" ? parsed.dark : fallback.dark,
      captures: Array.isArray(parsed.captures) ? parsed.captures.filter(isCapture) : fallback.captures,
      reviewIndex: typeof parsed.reviewIndex === "number" && parsed.reviewIndex >= 0
        ? parsed.reviewIndex
        : fallback.reviewIndex,
    };
  } catch {
    return fallback;
  }
}

function isCapture(value: unknown): value is Capture {
  if (!value || typeof value !== "object") return false;
  const capture = value as Partial<Capture>;
  return typeof capture.id === "string"
    && typeof capture.title === "string"
    && CAPTURE_KINDS.includes(capture.kind as CaptureKind);
}
