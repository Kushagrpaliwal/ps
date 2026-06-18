"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

interface UseJsonDataOptions {
  /** Refresh interval in milliseconds. Default 30000 (30s). */
  refreshInterval?: number;
  /** Whether to enable auto-refresh. Default true. */
  autoRefresh?: boolean;
}

interface UseJsonDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

interface StoreSnapshot<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

function createJsonStore<T>(path: string, refreshInterval: number, autoRefresh: boolean) {
  let snapshot: StoreSnapshot<T> = {
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
  };
  const listeners = new Set<() => void>();
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let initialized = false;

  function emit() {
    for (const listener of listeners) {
      listener();
    }
  }

  async function fetchData() {
    try {
      const cacheBust = `?t=${Date.now()}`;
      const res = await fetch(`${path}${cacheBust}`);
      if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
      const json = await res.json();
      snapshot = { data: json, loading: false, error: null, lastUpdated: new Date() };
    } catch (err) {
      snapshot = {
        ...snapshot,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
    emit();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    if (!initialized) {
      initialized = true;
      fetchData();
      if (autoRefresh && refreshInterval > 0) {
        intervalId = setInterval(fetchData, refreshInterval);
      }
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        initialized = false;
      }
    };
  }

  function getSnapshot(): StoreSnapshot<T> {
    return snapshot;
  }

  return { subscribe, getSnapshot, refresh: fetchData };
}

export function useJsonData<T>(
  path: string,
  options: UseJsonDataOptions = {}
): UseJsonDataReturn<T> {
  const { refreshInterval = 30000, autoRefresh = true } = options;

  // useMemo is safe here — the store is a stable external value, not a ref
  const store = useMemo(
    () => createJsonStore<T>(path, refreshInterval, autoRefresh),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path]
  );

  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const refresh = useCallback(async () => {
    await store.refresh();
  }, [store]);

  return {
    data: snap.data,
    loading: snap.loading,
    error: snap.error,
    refresh,
    lastUpdated: snap.lastUpdated,
  };
}
