"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Saves and restores any serialisable state for a given page key.
 *
 * Usage in CollegesPage:
 *   const [state, setState] = usePageState("colleges", { query: "", page: 1, filters: {} });
 *
 * `state` is hydrated from sessionStorage on mount so the user's last
 * search/filter/page position is restored when they navigate back.
 * Every call to `setState` immediately persists to sessionStorage.
 */
export function usePageState<T extends object>(
  key: string,
  defaultValue: T,
): [T, (updater: T | ((prev: T) => T)) => void] {
  const storageKey = `page_state__${key}`;

  const [state, setStateRaw] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return defaultValue;
      return { ...defaultValue, ...(JSON.parse(raw) as Partial<T>) };
    } catch {
      return defaultValue;
    }
  });

  // Keep a ref so the persist callback always sees the latest value
  const stateRef = useRef(state);
  stateRef.current = state;

  const setState = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setStateRaw((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (p: T) => T)(prev)
            : updater;
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // sessionStorage quota exceeded — silently ignore
        }
        return next;
      });
    },
    [storageKey],
  );

  // Persist on unmount as a safety net
  useEffect(() => {
    return () => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(stateRef.current));
      } catch {
        // ignore
      }
    };
  }, [storageKey]);

  return [state, setState];
}