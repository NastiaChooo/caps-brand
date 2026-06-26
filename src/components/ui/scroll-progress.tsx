"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";

/**
 * A hairline ember progress bar pinned to the top of the viewport. Driven
 * straight off the Lenis scroll callback and written to the DOM by hand
 * (transform only), so it tracks the real scroll position without a flake.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useLenis((lenis) => {
    if (bar.current) bar.current.style.transform = `scaleX(${lenis.progress || 0})`;
  });

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[2px]">
      <div
        ref={bar}
        style={{ transform: "scaleX(0)" }}
        className="h-full w-full origin-left bg-ember shadow-[0_0_10px_var(--color-ember)]"
      />
    </div>
  );
}
