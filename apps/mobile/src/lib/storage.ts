import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useSyncExternalStore } from "react";

type Listener = () => void;

export type Store<T> = {
  key: string;
  get: () => T;
  set: (next: T) => void;
  update: (fn: (cur: T) => T) => void;
  subscribe: (l: Listener) => () => void;
  /** resolves once the saved value has been read from the device */
  ready: Promise<void>;
};

/**
 * A tiny persisted store: state lives in memory, is saved to AsyncStorage on every change,
 * and is read back at start-up. Stand-in for the backend until carts and accounts live on the server.
 */
export function createStore<T>(key: string, initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<Listener>();
  const notify = () => listeners.forEach((l) => l());
  let touched = false;

  const ready = AsyncStorage.getItem(key)
    .then((raw) => {
      if (raw !== null && !touched) {
        try {
          value = JSON.parse(raw) as T;
          notify();
        } catch {
          /* ignore a corrupt value and keep the default */
        }
      }
    })
    .catch(() => undefined);

  const set = (next: T) => {
    touched = true;
    value = next;
    AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => undefined);
    notify();
  };

  return {
    key,
    get: () => value,
    set,
    update: (fn) => set(fn(value)),
    subscribe: (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    ready,
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/** true once every given store has loaded its saved value */
export function useStoresReady(stores: { ready: Promise<void> }[]): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all(stores.map((s) => s.ready)).then(() => {
      if (alive) setOk(true);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ok;
}
