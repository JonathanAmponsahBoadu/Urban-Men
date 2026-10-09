"use client";

// Tiny persistent store on top of localStorage, readable with useSyncExternalStore.
// FRONTEND-ONLY STAND-IN for a backend: data lives in this browser only.
import { useSyncExternalStore } from "react";

type Listener = () => void;

export type Store<T> = {
  subscribe: (l: Listener) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  /** Returns false if the browser refused to save (e.g. storage full). */
  set: (value: T) => boolean;
  update: (fn: (current: T) => T) => boolean;
};

export function createStore<T>(key: string, initial: T, persist = true): Store<T> {
  let snapshot: T = initial;
  let hydrated = !persist;
  const listeners = new Set<Listener>();

  const emit = () => listeners.forEach((l) => l());

  const load = () => {
    try {
      const raw = window.localStorage.getItem(key);
      snapshot = raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      snapshot = initial;
    }
    hydrated = true;
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key === key) {
      hydrated = false;
      emit();
    }
  };

  const set = (value: T) => {
    snapshot = value;
    hydrated = true;
    let ok = true;
    if (persist) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        ok = false;
      }
    }
    emit();
    return ok;
  };

  return {
    subscribe(l) {
      listeners.add(l);
      if (persist && listeners.size === 1) window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(l);
        if (persist && listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot() {
      if (typeof window === "undefined") return initial;
      if (!hydrated) load();
      return snapshot;
    },
    getServerSnapshot: () => initial,
    set,
    update(fn) {
      const current = typeof window === "undefined" ? initial : (hydrated ? snapshot : (load(), snapshot));
      return set(fn(current));
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

const noop = () => () => {};
/** false on the server and during hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
