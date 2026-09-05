import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { SQLiteDatabase } from "expo-sqlite";
import * as Notifications from "expo-notifications";
import { clearSharedPayloads } from "expo-sharing";
import type { Capture, CaptureKind } from "../types";
import { fetchLinkMetadata, getPlatform, getSourceUrl, inferCaptureKind } from "../utils/capture";
import { deleteAllLocalFiles, deleteLocalFile } from "../utils/files";
import { initializeDatabase, saveState, type PersistedState } from "./database";

type AppStore = PersistedState & {
  hydrated: boolean;
  now: number;
  finishOnboarding: () => void;
  setDark: (value: boolean) => void;
  addCapture: (input: {
    title?: string;
    kind?: CaptureKind;
    source?: string;
    localFileUri?: string;
    userNote?: string;
    mimeType?: string;
  }) => void;
  updateCaptureNote: (id: string, userNote: string) => void;
  setCaptureReminder: (id: string, reminderNotificationId: string, reminderAt: string) => void;
  clearCaptureReminder: (id: string) => void;
  toggleFavourite: (id: string) => void;
  archiveCapture: (id: string) => void;
  deleteCapture: (id: string) => Promise<boolean>;
  deleteAllCaptures: () => Promise<boolean>;
  advanceReview: () => void;
};

const initial: PersistedState = {
  onboarded: false,
  dark: false,
  captures: [],
  reviewIndex: 0,
};

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initial);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(Date.now());
  const database = useRef<SQLiteDatabase | null>(null);
  const writeQueue = useRef(Promise.resolve());

  useEffect(() => {
    initializeDatabase(initial)
      .then((result) => {
        database.current = result.database;
        const captures = result.state.captures.map(addPlatformCategory);
        setState({ ...result.state, captures });
        captures.forEach((capture) => {
          if (capture.kind === "link" && capture.source && !capture.metadataTitle) enrichLink(capture.id, capture.source, setState);
        });
      })
      .catch((error) => console.error("Failed to initialize Capture database", error))
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hydrated || !database.current) return;
    const currentDatabase = database.current;
    writeQueue.current = writeQueue.current
      .then(() => saveState(currentDatabase, state))
      .catch((error) => console.error("Failed to save Capture database", error));
  }, [hydrated, state]);

  const value = useMemo<AppStore>(() => ({
    ...state,
    hydrated,
    now,
    finishOnboarding: () => setState((current) => ({ ...current, onboarded: true })),
    setDark: (dark) => setState((current) => ({ ...current, dark })),
    addCapture: ({ title = "", kind = "note", source, localFileUri, userNote, mimeType }) => {
      const sourceUrl = getSourceUrl(source, title);
      const captureKind = inferCaptureKind(kind, sourceUrl);
      const capture: Capture = {
        id: `${captureKind}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        kind: captureKind,
        title: title.trim() || source || "Untitled note",
        source: sourceUrl,
        category: getPlatform(sourceUrl)?.name,
        localFileUri,
        userNote: userNote?.trim() || undefined,
        mimeType,
        capturedAt: new Date().toISOString(),
        createdAt: "Just now",
      };
      setState((current) => ({
        ...current,
        captures: [capture, ...current.captures],
      }));
      if (captureKind === "link" && sourceUrl) enrichLink(capture.id, sourceUrl, setState);
    },
    updateCaptureNote: (id, userNote) => setState((current) => ({
      ...current,
      captures: current.captures.map((item) => item.id === id ? { ...item, userNote: userNote.trim() || undefined } : item),
    })),
    setCaptureReminder: (id, reminderNotificationId, reminderAt) => setState((current) => ({
      ...current,
      captures: current.captures.map((item) => item.id === id ? { ...item, reminderNotificationId, reminderAt } : item),
    })),
    clearCaptureReminder: (id) => setState((current) => ({
      ...current,
      captures: current.captures.map((item) => item.id === id ? { ...item, reminderNotificationId: undefined } : item),
    })),
    toggleFavourite: (id) => setState((current) => ({
      ...current,
      captures: current.captures.map((item) => item.id === id ? { ...item, favourite: !item.favourite } : item),
    })),
    archiveCapture: (id) => {
      cancelReminder(state.captures.find((item) => item.id === id)?.reminderNotificationId);
      setState((current) => ({
        ...current,
        captures: current.captures.map((item) => item.id === id ? { ...item, archived: true, reminderNotificationId: undefined, reminderAt: undefined } : item),
      }));
    },
    deleteCapture: async (id) => {
      const capture = state.captures.find((item) => item.id === id);
      if (!capture || !database.current) return false;
      const next = { ...state, captures: state.captures.filter((item) => item.id !== id) };
      try {
        writeQueue.current = writeQueue.current.then(() => saveState(database.current!, next));
        await writeQueue.current;
        deleteLocalFile(capture.localFileUri);
        cancelReminder(capture.reminderNotificationId);
        setState(next);
        return true;
      } catch (error) {
        console.error("Failed to delete capture", error);
        return false;
      }
    },
    deleteAllCaptures: async () => {
      if (!database.current) return false;
      const next = { ...state, captures: [], reviewIndex: 0 };
      try {
        writeQueue.current = writeQueue.current.then(() => saveState(database.current!, next));
        await writeQueue.current;
        deleteAllLocalFiles();
        clearSharedPayloads();
        state.captures.forEach((capture) => cancelReminder(capture.reminderNotificationId));
        setState(next);
        return true;
      } catch (error) {
        console.error("Failed to delete all captures", error);
        return false;
      }
    },
    advanceReview: () => setState((current) => ({ ...current, reviewIndex: current.reviewIndex + 1 })),
  }), [hydrated, now, state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function addPlatformCategory(capture: Capture): Capture {
  const sharedSource = capture.source || (capture.kind === "note" && getPlatform(undefined, capture.title)
    ? getSourceUrl(undefined, capture.title)
    : undefined);
  if (!sharedSource) return capture;
  return {
    ...capture,
    kind: capture.kind === "note" ? "link" : capture.kind,
    source: sharedSource,
    category: capture.category || getPlatform(sharedSource)?.name,
  };
}

function enrichLink(id: string, source: string, setState: React.Dispatch<React.SetStateAction<PersistedState>>) {
  fetchLinkMetadata(source).then((metadata) => {
    if (!Object.values(metadata).some(Boolean)) return;
    setState((current) => ({
      ...current,
      captures: current.captures.map((capture) => capture.id === id ? {
        ...capture,
        title: metadata.title || capture.title,
        metadataTitle: metadata.title,
        metadataDescription: metadata.description,
        metadataImage: metadata.image,
        metadataSiteName: metadata.siteName || getPlatform(source)?.name,
        category: metadata.siteName || capture.category || getPlatform(source)?.name,
      } : capture),
    }));
  }).catch(() => undefined);
}

function cancelReminder(identifier?: string) {
  if (identifier) Notifications.cancelScheduledNotificationAsync(identifier).catch((error) => {
    console.warn("Failed to cancel capture reminder", error);
  });
}

export function useAppStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore must be used inside AppStoreProvider");
  return store;
}
