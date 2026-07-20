import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { SQLiteDatabase } from "expo-sqlite";
import { seedCaptures } from "../data/captures";
import type { Capture, CaptureKind } from "../types";
import { inferCaptureKind } from "../utils/capture";
import { initializeDatabase, saveState, type PersistedState } from "./database";

type AppStore = PersistedState & {
  hydrated: boolean;
  finishOnboarding: () => void;
  setDark: (value: boolean) => void;
  addCapture: (title: string, kind?: CaptureKind, source?: string) => void;
  toggleFavourite: (id: string) => void;
  archiveCapture: (id: string) => void;
  deleteCapture: (id: string) => void;
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
    addCapture: (title, kind = "note", source) => setState((current) => {
      const captureKind = inferCaptureKind(kind, source);
      return {
        ...current,
        captures: [{
          id: `${captureKind}-${Date.now()}`,
          kind: captureKind,
          title: title.trim() || source || "Untitled note",
          source,
          createdAt: "Just now",
        }, ...current.captures],
      };
    }),
    toggleFavourite: (id) => setState((current) => ({
      ...current,
      captures: current.captures.map((item) => item.id === id ? { ...item, favourite: !item.favourite } : item),
    })),
    archiveCapture: (id) => setState((current) => ({
      ...current,
      captures: current.captures.map((item) => item.id === id ? { ...item, archived: true } : item),
    })),
    deleteCapture: (id) => setState((current) => ({
      ...current,
      captures: current.captures.filter((item) => item.id !== id),
    })),
    advanceReview: () => setState((current) => ({ ...current, reviewIndex: current.reviewIndex + 1 })),
  }), [hydrated, state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore must be used inside AppStoreProvider");
  return store;
}
