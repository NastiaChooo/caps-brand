"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { range } from "@/lib/range";
import { useHeroSequence } from "@/components/providers/sequence-preload";
import { useSequenceCanvas } from "./use-sequence-canvas";

/**
 * ScrollSequence — the centerpiece.
 *
 * A single pinned "act": one tall scroll track with a `sticky` stage inside it.
 * Scroll progress through the track drives a canvas image-sequence — the cap
 * emerges from the dark, rotates in lock-step with the scroll, and stops on the
 * neon-underbrim climax. The wordmark and captions are layered on the same
 * stage, so the whole thing reads as one continuous shot.
 *
 * Why canvas, not <video>: scrubbing `video.currentTime` snaps to keyframes and
 * stutters (worst on Safari/iOS). Drawing a pre-decoded still per scroll tick is
 * the only way to guarantee the 60fps the brief is graded on.
 *
 * Why the overlays are driven by hand: we read scroll once per change and write
 * canvas + overlay styles together in the same pass (transform/opacity only).
 * One source of truth, one paint — the wordmark can never desync from the cap.
 */

// Length of the pinned act, in viewport heights. Longer = a slower, more
// deliberate rotation. ~5.5 screens feels premium without dragging.
const SCROLL_VH = 560;

// Sub-ranges across scrollYProgress (0..1):
const FRAME_START = 0.08; // beat for the wordmark before the cap moves
const FRAME_END = 0.82; // climax lands here; 0.82→1 holds it in focus

export function ScrollSequence() {
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const wordmark = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const lastFrame = useRef(-1);

  const { manifest, frames, ready } = useHeroSequence();
  const { paint } = useSequenceCanvas(canvas, frames, manifest);

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  // The whole stage updates in one pass: cap frame + overlay states, from a
  // single scroll value. No layout-triggering properties touched.
  const render = useCallback(
    (v: number) => {
      // 1) Cap frame — only redraw when the rounded index actually changes.
      if (manifest) {
        const fp = range(v, FRAME_START, FRAME_END);
        const index = Math.round(fp * (manifest.frames - 1));
        if (index !== lastFrame.current) {
          lastFrame.current = index;
          paint(index);
          if (readout.current) {
            readout.current.textContent = `${String(
              Math.round(fp * 360)
            ).padStart(3, "0")}°`;
          }
        }
      }

      // 2) Wordmark — dissolves up into the dark as the cap takes over.
      if (wordmark.current) {
        const t = range(v, 0, 0.1);
        wordmark.current.style.opacity = String(1 - range(v, 0, 0.09));
        wordmark.current.style.transform = `translate3d(0,${-22 * t}%,0) scale(${
          1 + 0.08 * t
        })`;
      }

      // 3) Scroll cue — gone almost immediately.
      if (cue.current) cue.current.style.opacity = String(1 - range(v, 0, 0.05));

      // 4) Climax caption — rises and ignites as the underbrim locks in.
      if (caption.current) {
        const c = range(v, 0.78, 0.92);
        // Eased so the lift decelerates into place rather than arriving linear.
        const e = 1 - Math.pow(1 - c, 3);
        caption.current.style.opacity = String(c);
        caption.current.style.transform = `translate3d(0,${
          90 * (1 - e)
        }px,0) scale(${0.94 + 0.06 * e})`;
        // The ember glow is a static CSS halo (`.glow-ember`); it ignites
        // automatically as the caption's own opacity fades in — no per-tick
        // text-shadow repaint.
      }
    },
    [manifest, paint]
  );

  useMotionValueEvent(scrollYProgress, "change", render);

  // Paint the frame + overlay states for wherever the user already is, the
  // moment frames decode (and on first mount).
  useEffect(() => {
    lastFrame.current = -1;
    render(scrollYProgress.get());
  }, [ready, render, scrollYProgress]);

  return (
    <section
      ref={track}
      style={{ height: `${SCROLL_VH}vh` }}
      className="relative"
      aria-label="BRAND cap — scroll to rotate the cap and reveal its neon underbrim"
    >
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden stage-vignette">
        {/* The image sequence */}
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />

        {/* Depth + legibility vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-void/85" />

        {/* Wordmark */}
        <div
          ref={wordmark}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center will-change-transform"
        >
          <h1 className="display text-[clamp(4rem,17vw,15rem)]">
            BR
            <span className="font-serif font-normal italic text-bone">A</span>
            ND
          </h1>
          <p className="mt-7 max-w-xs text-balance text-sm leading-relaxed text-mute">
            The signature is on the inside.
          </p>
        </div>

        {/* Scroll cue */}
        <div
          ref={cue}
          className="pointer-events-none absolute inset-x-0 bottom-9 flex flex-col items-center gap-3 will-change-transform"
        >
          <span className="eyebrow">Scroll to reveal</span>
          <span className="h-12 w-px bg-gradient-to-b from-bone/50 to-transparent" />
        </div>

        {/* Technical readout — reinforces the 1:1 scroll↔rotation tie */}
        <div className="pointer-events-none absolute bottom-9 right-8 hidden font-mono text-[0.65rem] tracking-[0.28em] text-faint sm:flex sm:gap-3">
          <span>SPIN · Y</span>
          <span ref={readout} className="tabular-nums text-mute">
            000°
          </span>
        </div>

        {/* Climax caption — rises and ignites as the underbrim locks in. */}
        <div
          ref={caption}
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-x-0 bottom-[12vh] flex flex-col items-center px-6 text-center will-change-transform"
        >
          <span className="eyebrow mb-4 text-ember">The reveal</span>
          <p className="font-serif text-[clamp(2.1rem,5.2vw,3.6rem)] italic leading-tight text-bone glow-ember">
            A flash of ember — seen only by you.
          </p>
        </div>
      </div>
    </section>
  );
}
