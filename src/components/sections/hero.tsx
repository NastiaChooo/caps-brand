"use client";

import { ScrollSequence } from "@/components/sequence/scroll-sequence";
import { StaticHero } from "@/components/sequence/static-hero";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * Hero — picks the experience. Motion users get the pinned canvas scrub;
 * reduced-motion users get the climax as a static poster on a normal,
 * un-pinned page. The choice is known on the first client render, so there's
 * no flash and the scrub never mounts for users who opted out.
 */
export function Hero() {
  const reduced = usePrefersReducedMotion();
  return reduced ? <StaticHero /> : <ScrollSequence />;
}
