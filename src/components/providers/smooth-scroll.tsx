"use client";

import { ReactLenis } from "lenis/react";
import type { LenisOptions } from "lenis";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * SmoothScroll
 * Wraps the app in a single root Lenis instance. Lenis keeps the *real* scroll
 * position (it just smooths the delta), which is what lets us pin sections with
 * plain CSS `position: sticky` and read progress with Framer Motion's
 * `useScroll` — no GSAP ScrollTrigger, no scroll hijacking hacks.
 *
 * Tuning note: `lerp` is the whole game. Too high and fast flicks feel abrupt;
 * too low and it feels floaty and laggy under a scrub. ~0.1 is the Apple-ish
 * sweet spot — responsive, but it irons out trackpad/mouse-wheel jitter so the
 * frame sequence advances smoothly regardless of input device.
 */
const SMOOTH: LenisOptions = {
  lerp: 0.1,
  smoothWheel: true,
  wheelMultiplier: 1,
  // Native touch scrolling already feels right on phones; syncing it tends to
  // add lag. We smooth the wheel, not the finger.
  syncTouch: false,
  anchors: true,
};

// Accessibility: when the user asks for reduced motion, hand scrolling back to
// the browser entirely.
const REDUCED: LenisOptions = {
  lerp: 1,
  smoothWheel: false,
  syncTouch: false,
  anchors: true,
};

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();

  return (
    <ReactLenis root options={reduced ? REDUCED : SMOOTH}>
      {children}
    </ReactLenis>
  );
}
