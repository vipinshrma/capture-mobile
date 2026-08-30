import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { SQLiteDatabase } from "expo-sqlite";
import * as Notifications from "expo-notifications";
import { clearSharedPayloads } from "expo-sharing";
import { seedCaptures } from "../data/captures";
import type { Capture, CaptureKind } from "../types";
import { getSourceUrl, inferCaptureKind } from "../utils/capture";
import { deleteAllLocalFiles, deleteLocalFile } from "../utils/files";
import { initializeDatabase, saveState, type PersistedState } from "./database";

type AppStore = PersistedState & {
  hydrated: boolean;
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
  setCaptureReminder: (id: string, reminderNotificationId: string) => void;
  toggleFavourite: (id: string) => void;
  archiveCapture: (id: string) => void;
  deleteCapture: (id: string) => Promise<boolean>;
  deleteAllCaptures: () => Promise<boolean>;
  advanceReview: () => void;
};

const initial: PersistedState = {
  onboarded: false,
  dark: false,
  captures: seedCaptures,
  reviewIndex: 0,
};

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initial);
  const [hydrated, setHydrated] = useState(false);
  const database = useRef<SQLiteDatabase | null>(null);
  const writeQueue = useRef(Promise.resolve());

  useEffect(() => {
    initializeDatabase(initial)
      .then((result) => {
        database.current = result.database;
        setState(result.state);
      })
      .catch((error) => console.error("Failed to initialize Capture database", error))
      .finally(() => setHydrated(true));
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
    },
    updateCaptureNote: (id, userNote) => setState((current) => ({
      ...current,
      captures: current.captures.map((item) => item.id === id ? { ...item, userNote: userNote.trim() || undefined } : item),
    })),
    setCaptureReminder: (id, reminderNotificationId) => setState((current) => ({
      ...current,
      captures: current.captures.map((item) => item.id === id ? { ...item, reminderNotificationId } : item),
    })),
    toggleFavourite: (id) => setState((current) => ({
      ...current,
      captures: current.captures.map((item) => item.id === id ? { ...item, favourite: !item.favourite } : item),
    })),
    archiveCapture: (id) => {
      cancelReminder(state.captures.find((item) => item.id === id)?.reminderNotificationId);
      setState((current) => ({
        ...current,
        captures: current.captures.map((item) => item.id === id ? { ...item, archived: true, reminderNotificationId: undefined } : item),
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
  }), [hydrated, state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
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
