/**
 * Shared motion language.
 *
 * One easing vocabulary across every component so the whole page feels authored
 * by a single hand — the difference between "a site with animations" and a
 * designed experience. Import these instead of hand-typing bezier values.
 */
import type { Transition, Variants } from "framer-motion";

/** Apple-ish soft deceleration — the house easing. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** Symmetric ease for crossfades / camera-like moves. */
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** Default entrance transition for editorial reveals. */
export const reveal: Transition = {
  duration: 1.1,
  ease: EASE_OUT,
};

/**
 * Reveal variants — a quiet rise + fade. Distance is intentionally small;
 * restraint reads as luxury, big travel reads as a template.
 */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reveal,
  },
};

/** Staggered container for lists of revealed children. */
export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: gap, delayChildren: delay },
  },
});

/** Shared viewport config — fire once, a bit before fully in view. */
export const inView = { once: true, margin: "0px 0px -15% 0px" } as const;
