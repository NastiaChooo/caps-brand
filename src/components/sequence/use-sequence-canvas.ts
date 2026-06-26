"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SequenceManifest } from "./use-image-sequence";

/**
 * Owns the <canvas>: device-pixel-ratio sizing, `cover`-fit drawing, resize
 * handling, and a single stable `paint(index)` entry point.
 *
 * The painter and the resize handler are built once inside an effect and read
 * everything they need (manifest, frames, context, last frame) through refs, so
 * they're always current without being re-created on every render — no
 * dependency churn, no stale closures. The public `paint` just forwards to the
 * live painter.
 *
 * Two performance rules live here:
 *  1. `paint` is a no-op when the requested frame is already on screen — the
 *     caller fires on every scroll tick, but we only touch the GPU when the
 *     rounded frame index actually changes.
 *  2. `drawImage` is the only per-frame work. No layout reads, no allocations,
 *     no React state — this is what keeps the scrub pinned at 60fps.
 */
export function useSequenceCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  frames: React.RefObject<HTMLImageElement[]>,
  manifest: SequenceManifest | null,
  // `cover` fills the stage (crops overflow); `contain` shows the whole frame.
  // alignX/alignY (0..1) bias placement — only matters where there's margin.
  fit: "cover" | "contain" = "cover",
  alignX = 0.5,
  alignY = 0.5,
  // Fill behind `contain` margins — set to the footage's backdrop colour so the
  // frame bleeds seamlessly into the section instead of sitting on a visible box.
  bgFill = "#060607"
) {
  const manifestRef = useRef<SequenceManifest | null>(manifest);
  const painterRef = useRef<(index: number, force?: boolean) => void>(() => {});

  useEffect(() => {
    manifestRef.current = manifest;
  }, [manifest]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";

    let backW = 0;
    let backH = 0;
    let lastIndex = -1;

    // Closest decoded frame to `i` — so a not-yet-loaded frame never flashes
    // an empty canvas mid-scrub.
    const nearestReady = (i: number): HTMLImageElement | null => {
      const imgs = frames.current;
      if (imgs[i]?.complete && imgs[i].naturalWidth) return imgs[i];
      for (let r = 1; r < imgs.length; r++) {
        const a = imgs[i - r];
        if (a?.complete && a.naturalWidth) return a;
        const b = imgs[i + r];
        if (b?.complete && b.naturalWidth) return b;
      }
      return null;
    };

    const paint = (index: number, force = false) => {
      const m = manifestRef.current;
      if (!m || (index === lastIndex && !force)) return;

      const img = nearestReady(index);
      if (!img) return;

      const iw = img.naturalWidth || m.width;
      const ih = img.naturalHeight || m.height;

      // `background-size: cover|contain` math.
      const scale =
        fit === "contain"
          ? Math.min(backW / iw, backH / ih)
          : Math.max(backW / iw, backH / ih);
      const dw = iw * scale;
      const dh = ih * scale;

      // `contain` leaves margins — paint the backdrop behind so they read
      // seamless with the footage's own studio background.
      if (fit === "contain") {
        ctx.fillStyle = bgFill;
        ctx.fillRect(0, 0, backW, backH);
      }
      ctx.drawImage(img, (backW - dw) * alignX, (backH - dh) * alignY, dw, dh);

      lastIndex = index;
    };

    const resize = () => {
      // Cap DPR at 2 — beyond that the cost isn't worth the invisible sharpness.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(parent.clientWidth * dpr);
      const h = Math.round(parent.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      backW = w;
      backH = h;
      if (lastIndex >= 0) paint(lastIndex, true);
    };

    painterRef.current = paint;
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => {
      ro.disconnect();
      painterRef.current = () => {};
    };
  }, [canvasRef, frames, fit, alignX, alignY, bgFill]);

  const paint = useCallback((index: number, force?: boolean) => {
    painterRef.current(index, force);
  }, []);

  return { paint };
}
