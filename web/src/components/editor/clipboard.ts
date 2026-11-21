// Schranka prvkov editora platna: plati, kym je aplikacia otvorena, a stranka sa po kopirovani prekresli.
import { useSyncExternalStore } from "react";

export interface Clipboard<T> {
  copy: (items: readonly T[]) => void;
  /** Prvky v schranke (hook). */
  use: () => readonly T[];
}

export function createClipboard<T>(): Clipboard<T> {
  let copied: readonly T[] = [];
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return {
    copy(items) {
      copied = [...items];
      for (const listener of listeners) listener();
    },
    use: () => useSyncExternalStore(subscribe, () => copied),
  };
}
