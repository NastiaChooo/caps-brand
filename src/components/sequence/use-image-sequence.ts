"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The shape written by `scripts/extract-frames.mjs`. Treating the sequence as
 * data (not hardcoded numbers) is what makes it reusable for the real brand
 * footage: re-run the script on new video, ship the folder, change nothing here.
 */
export type SequenceManifest = {
  basePath: string;
  prefix: string;
  ext: string;
  pad: number;
  frames: number;
  width: number;
  height: number;
  fps: number;
  source: string;
};

function frameUrl(m: SequenceManifest, i: number): string {
  const n = String(i + 1).padStart(m.pad, "0");
  return `${m.basePath}/${m.prefix}${n}.${m.ext}`;
}

const CONCURRENCY = 8;

export type ImageSequence = {
  manifest: SequenceManifest | null;
  /** Decoded frames, indexed 0..frames-1. Stable ref — never re-allocated. */
  frames: React.RefObject<HTMLImageElement[]>;
  /** 0..1 preload progress, for the loading screen. */
  progress: number;
  /** All frames decoded and ready to scrub without hitches. */
  ready: boolean;
};

/**
 * Preloads the full image sequence up front so scrubbing never stalls.
 *
 * Memory discipline (the trap with this technique): we keep plain
 * `HTMLImageElement`s and let the browser's own decode cache manage bitmaps. We
 * deliberately do NOT `createImageBitmap` every frame — decoded RGBA is ~3.7 MB
 * each, and pinning all of them would blow past 600 MB+. `decode()` warms the
 * cache in small batches; the browser re-decodes the tiny WebPs on demand if it
 * needs to reclaim memory, which is imperceptible at this frame size.
 */
export function useImageSequence(
  manifestUrl = "/sequence/manifest.json",
  enabled = true
): ImageSequence {
  const [manifest, setManifest] = useState<SequenceManifest | null>(null);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const frames = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    // `enabled` lets a secondary sequence defer its (multi-MB) preload until the
    // viewer is near the viewport, so it never competes with the hero.
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      let m: SequenceManifest;
      try {
        const res = await fetch(manifestUrl);
        if (!res.ok) throw new Error(`manifest ${res.status}`);
        m = await res.json();
      } catch (err) {
        // Degrade gracefully: clear the loader rather than hang on it.
        if (!cancelled) {
          console.warn(`[sequence] failed to load ${manifestUrl}:`, err);
          setReady(true);
        }
        return;
      }
      if (cancelled) return;
      setManifest(m);

      const images: HTMLImageElement[] = new Array(m.frames);
      frames.current = images;

      let cursor = 0;
      let done = 0;

      // Pull frames in order across a fixed worker pool — bounds the number of
      // in-flight decodes while still loading the early (visible) frames first.
      const worker = async () => {
        while (!cancelled) {
          const i = cursor++;
          if (i >= m.frames) return;
          const img = new Image();
          img.decoding = "async";
          img.src = frameUrl(m, i);
          images[i] = img;
          try {
            await img.decode();
          } catch {
            // A failed decode shouldn't deadlock the loader; the frame will
            // simply re-decode at draw time.
          }
          done++;
          if (!cancelled) setLoaded(done);
        }
      };

      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, m.frames) }, worker)
      );
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [manifestUrl, enabled]);

  const progress = manifest ? loaded / manifest.frames : 0;
  return { manifest, frames, progress, ready };
}
