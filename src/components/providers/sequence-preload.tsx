"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  useImageSequence,
  type ImageSequence,
} from "@/components/sequence/use-image-sequence";
import { SequenceLoader } from "@/components/sequence/sequence-loader";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * SequencePreload
 *
 * Loads *every* canvas image-sequence up front, at first page load, behind one
 * shared "Calibrating" overlay whose bar spans the combined frame count. This is
 * deliberate: the cap turntables must be fully decoded before the user reaches
 * them, so scrolling to a section never kicks off a second load. One calibration,
 * once — then the whole page scrubs instantly.
 *
 * Sections read their frames through `useHeroSequence` / `useDetailSequence`
 * rather than loading their own, so there is a single source of truth (and a
 * single loader).
 *
 * Reduced-motion visitors skip the blocking overlay — the hero is a static poster
 * for them and the hero footage is never downloaded; the detail frames still warm
 * in the background for the spec turntable.
 */
const HERO_MANIFEST = "/sequence/manifest.json";
const DETAIL_MANIFEST = "/sequence-2/manifest.json";

type SequenceStore = {
  hero: ImageSequence;
  detail: ImageSequence;
};

const SequenceContext = createContext<SequenceStore | null>(null);

const useSequenceStore = (): SequenceStore => {
  const store = useContext(SequenceContext);
  if (!store) {
    throw new Error("Sequence hooks must be used within <SequencePreload>.");
  }
  return store;
};

export const useHeroSequence = (): ImageSequence => useSequenceStore().hero;
export const useDetailSequence = (): ImageSequence => useSequenceStore().detail;

export function SequencePreload({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();

  // The hero turntable is the motion experience only; reduced-motion gets a still,
  // so its footage isn't fetched for those visitors.
  const hero = useImageSequence(HERO_MANIFEST, !reduced);
  const detail = useImageSequence(DETAIL_MANIFEST, true);

  // One progress bar across exactly the sequences this visitor loads, weighted by
  // real frame counts so it reads a true 0→100%.
  const active = reduced ? [detail] : [hero, detail];
  const totalFrames = active.reduce(
    (sum, seq) => sum + (seq.manifest?.frames ?? 0),
    0
  );
  const loadedFrames = active.reduce(
    (sum, seq) => sum + (seq.manifest ? seq.progress * seq.manifest.frames : 0),
    0
  );
  const progress = totalFrames ? loadedFrames / totalFrames : 0;
  const ready = active.every((seq) => seq.ready);

  return (
    <SequenceContext.Provider value={{ hero, detail }}>
      {children}
      {/* Reduced-motion users meet the static hero immediately — no gate. */}
      {!reduced && <SequenceLoader progress={progress} done={ready} />}
    </SequenceContext.Provider>
  );
}
