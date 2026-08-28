"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { Reveal } from "@/components/ui/reveal";
import { range } from "@/lib/range";

const PILLARS = [
  {
    no: "i",
    title: "Matte-coated shell",
    body: "A tight cotton-poly twill, vacuum-coated to swallow light. No sheen, no logo, no tell.",
  },
  {
    no: "ii",
    title: "Six-panel architecture",
    body: "Laser-cut panels, tonal stitching at 9 SPI, a structured front that holds its line for years.",
  },
  {
    no: "iii",
    title: "Ember underlay",
    body: "A single neon panel bonded beneath the brim — the only color on the entire piece.",
  },
] as const;

// Pinned act: the plate holds while the pillars are scrubbed in, then a short
// fade hands off to the next section.
const CRAFT_VH = 220;

/**
 * Craft — a pinned plate. The photo stays fixed while you scroll; each pillar
 * wipes open in turn, tied directly to scroll position (staggered). Only once
 * all three have resolved does a fade dissolve the plate into the next section.
 * Driven by hand (refs + one scroll subscription) so the reveal can't stall.
 */
export function Craft() {
  const track = useRef<HTMLDivElement>(null);
  const pillars = useRef<Array<HTMLDivElement | null>>([]);
  const fade = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  const render = useCallback((v: number) => {
    for (let i = 0; i < PILLARS.length; i++) {
      const el = pillars.current[i];
      if (!el) continue;
      const start = 0.12 + i * 0.18; // staggered across the pin
      const p = range(v, start, start + 0.17);
      el.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
      el.style.opacity = String(p);
    }
    // Dissolve to the dark once the text has fully resolved.
    if (fade.current) fade.current.style.opacity = String(range(v, 0.86, 1));
  }, []);

  useMotionValueEvent(scrollYProgress, "change", render);
  useEffect(() => {
    render(scrollYProgress.get());
  }, [render, scrollYProgress]);

  return (
    <section
      id="craft"
      className="relative scroll-mt-24 border-t border-line pt-32 lg:pt-44"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <Reveal>
            <span className="eyebrow">01 — Craft</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display mt-8 text-[clamp(2.4rem,5vw,4.4rem)]">
              Engineered{" "}
              <span className="font-serif font-normal italic">
                to disappear.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-balance leading-relaxed text-mute">
              Every decision serves restraint. What you notice is the silhouette.
              What you don&apos;t notice is the work that made it look like
              nothing at all.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Pinned plate */}
      <div
        ref={track}
        style={{ height: `${CRAFT_VH}vh` }}
        className="relative mt-14 md:mt-20"
      >
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <Image
            src="/stills/back.webp"
            alt="The BRAND cap emerging from darkness under a single spotlight."
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/30 to-void/15" />

          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-7xl px-6 pb-14 lg:px-10 lg:pb-20">
              <div className="grid gap-8 border-t border-line/70 pt-8 sm:grid-cols-3 lg:gap-14 lg:pt-10">
                {PILLARS.map((p, i) => (
                  <div
                    key={p.no}
                    ref={(el) => {
                      pillars.current[i] = el;
                    }}
                    style={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
                    className="will-change-transform"
                  >
                    <span className="font-mono text-xs uppercase tracking-[0.3em] text-ember">
                      {p.no}
                    </span>
                    <h3 className="mt-5 text-lg font-medium text-bone">
                      {p.title}
                    </h3>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-mute">
                      {p.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* End-of-act dissolve for a clean handoff to the next section */}
          <div
            ref={fade}
            style={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 bg-void"
          />
        </div>
      </div>
    </section>
  );
}
