import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedCaptures } from "../data/captures";
import type { Capture } from "../types";

type PersistedState = {
  onboarded: boolean;
  dark: boolean;
  captures: Capture[];
  reviewIndex: number;
};

type AppStore = PersistedState & {
  hydrated: boolean;
  finishOnboarding: () => void;
  setDark: (value: boolean) => void;
  addCapture: (title: string) => void;
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
const STORAGE_KEY = "capture.app-state.v1";

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => value && setState({ ...initial, ...JSON.parse(value) }))
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const value = useMemo<AppStore>(() => ({
    ...state,
    hydrated,
    finishOnboarding: () => setState((current) => ({ ...current, onboarded: true })),
    setDark: (dark) => setState((current) => ({ ...current, dark })),
    addCapture: (title) => setState((current) => ({
      ...current,
      captures: [{
        id: `note-${Date.now()}`,
        kind: "note",
        title: title.trim() || "Untitled note",
        createdAt: "Just now",
      }, ...current.captures],
    })),
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
