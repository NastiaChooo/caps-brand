"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { useImageSequence } from "@/components/sequence/use-image-sequence";
import { useSequenceCanvas } from "@/components/sequence/use-sequence-canvas";
import { SequenceLoader } from "@/components/sequence/sequence-loader";
import { Reveal } from "@/components/ui/reveal";

const SPEC = [
  ["Silhouette", "Structured six-panel"],
  ["Profile", "Mid · curved brim"],
  ["Shell", "Coated cotton-poly twill"],
  ["Underbrim", "Neon ember · #FF5412"],
  ["Closure", "Antique-brass strap"],
  ["Weight", "92 g"],
  ["Edition", "Drop 001 — 200 pieces"],
  ["Origin", "Made in Ukraine"],
] as const;

// Tall pinned track → a long, deliberate rotation. The frame index is spread
// across most of this distance so the cap turns slowly, never in a rush.
const SCROLL_VH = 320;
// Exact backdrop colour baked into the footage — the section and the `contain`
// margins are painted the same, so the whole stage is one seamless field.
const FIELD = "#070808";
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Spec — a second, scroll-scrubbed turntable.
 *
 * The whole cap stays in frame (`contain`, never cropped) and floats in a
 * single seamless dark field: the section background matches the footage
 * backdrop exactly, so the cap dissolves into the page on every side and the
 * spec sheet sits in the same field — no hard edges. Cap left / sheet right on
 * desktop; cap top / sheet below on mobile. Turns slowly across a tall track.
 */
export function Specs() {
  const track = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef(-1);
  const [active, setActive] = useState(false);

  const { manifest, frames, progress, ready } = useImageSequence(
    "/sequence-2/manifest.json",
    active
  );
  // Bias the cap left of centre so the spotlight (which fills the full stage)
  // sits left, leaving the dark right of the field for the spec sheet.
  const { paint } = useSequenceCanvas(
    canvas,
    frames,
    manifest,
    "contain",
    0.32,
    0.5,
    FIELD
  );
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "150% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const render = useCallback(
    (v: number) => {
      if (!manifest) return;
      const fp = clamp01((v - 0.05) / (0.9 - 0.05));
      const index = Math.round(fp * (manifest.frames - 1));
      if (index === last.current) return;
      last.current = index;
      paint(index);
    },
    [manifest, paint]
  );

  useMotionValueEvent(scrollYProgress, "change", render);
  useEffect(() => {
    last.current = -1;
    render(scrollYProgress.get());
  }, [ready, render, scrollYProgress]);

  return (
    <section
      id="spec"
      ref={track}
      style={{ height: `${SCROLL_VH}vh` }}
      className="relative border-t border-line"
    >
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{ background: FIELD }}
      >
        {/* Cap — full-bleed stage on desktop (no region boundary, so the
            studio spotlight reads as one field, not a seam); top region on
            mobile with the sheet below. `contain` keeps the whole cap and the
            margins are painted the exact backdrop colour. */}
        <div className="absolute left-0 top-0 h-[52%] w-full md:h-full">
          <canvas
            ref={canvas}
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          />
          {/* Desktop: ease the right of the field to solid for legible type */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block"
            style={{
              background:
                "linear-gradient(to left, #070808 0%, rgba(7,8,8,0.65) 38%, transparent 100%)",
            }}
          />
          <SequenceLoader progress={progress} done={ready} />
        </div>

        {/* Spec sheet — below the cap on mobile, right of it on desktop */}
        <div className="absolute inset-x-0 bottom-0 top-[52%] flex flex-col justify-center px-6 md:inset-y-0 md:left-auto md:right-0 md:top-0 md:w-[44%] md:px-12 lg:px-16">
          <div className="w-full md:max-w-md">
            <Reveal>
              <span className="eyebrow">02 — Spec</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="display mt-4 text-[clamp(2.4rem,4.4vw,4.4rem)] md:mt-6">
                The whole truth,{" "}
                <span className="font-serif font-normal italic">
                  in eight lines.
                </span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <dl className="mt-6 border-t border-line md:mt-8">
                {SPEC.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-2.5 md:py-3"
                  >
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mute md:text-xs">
                      {k}
                    </dt>
                    <dd className="text-right text-sm text-bone">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
