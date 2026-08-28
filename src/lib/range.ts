/**
 * Scroll-math primitives shared by every pinned, scroll-scrubbed act.
 * One definition so the sections can't drift apart on rounding behaviour.
 */

/** Clamp to the unit interval [0, 1]. */
export const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Map `v` from the range [a, b] onto 0..1 (clamped). */
export const range = (v: number, a: number, b: number): number =>
  clamp01((v - a) / (b - a));
