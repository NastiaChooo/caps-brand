"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to the user's reduced-motion preference the idiomatic way — as an
 * external store, not setState-in-an-effect. `useSyncExternalStore` reads the
 * real value on the very first client render (no flash, no extra commit) and
 * assumes motion-on for SSR.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
