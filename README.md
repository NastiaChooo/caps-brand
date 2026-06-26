# BRAND — Apple-style scroll hero

A single-page hero for an ultra-premium, "stealth wealth" caps brand. The
centerpiece is an **Apple-style, scroll-driven product scrub**: a matte-black
cap emerges from the dark, rotates in lock-step with the scroll, and stops on
the reveal of its hidden neon-orange underbrim.

> `BRAND` is a placeholder identity built to demonstrate taste and voice — the
> structure is designed to drop in real brand assets without touching the
> animation code.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Framer Motion ·
Lenis.

---

## The core idea: scrub a canvas, never a `<video>`

The rotation isn't a video playing — it's an **image sequence drawn to a
`<canvas>`**, one frame per scroll position. This is the technique Apple uses on
its product pages, and the reason is performance:

- Scrubbing `video.currentTime` snaps to the codec's keyframes and **stutters**,
  worst on Safari/iOS. You can feel it.
- Drawing a pre-decoded still with `drawImage` is **instant and deterministic** —
  the only way to hold 60fps while the user controls the timeline with the
  scroll wheel.

The source footage is turned into a numbered WebP sequence + a manifest
([`scripts/extract-frames.mjs`](scripts/extract-frames.mjs)), and the hero reads
that manifest at runtime.

### How 60fps is actually held

Performance here is a series of deliberate choices, not a happy accident:

- **Transforms off the main thread.** Every animated property is `transform` or
  `opacity` only — never a layout-triggering one. The wordmark dissolve, the
  caption, the section reveals: all compositor work.
- **One draw per frame change.** Scroll fires constantly; the canvas only
  redraws when the *rounded frame index* actually changes
  ([`use-sequence-canvas.ts`](src/components/sequence/use-sequence-canvas.ts)).
- **One source of truth.** The cap frame and the overlay states are written in a
  single scroll pass, so the wordmark can never desync from the cap.
- **Linear, not over-smoothed.** Lenis already smooths the scroll input; the
  frame index is mapped to it *linearly*, so rotation stays tied "directly and
  proportionately" to scroll position rather than lagging behind it.
- **DPR capped at 2**, decode warmed in batches, and the second sequence
  preloads only when it's ~1.5 screens away so it never fights the hero.

### Smooth scrolling (Lenis)

A single root [`<ReactLenis>`](src/components/providers/smooth-scroll.tsx) irons
out trackpad/mouse-wheel jitter so the scrub feels buttery regardless of input
device. Modern Lenis keeps the *real* scroll position, which means sections pin
with plain CSS `position: sticky` and progress is read with Framer Motion's
`useScroll` — **no GSAP ScrollTrigger, no scroll hijacking.**

### Accessibility

`prefers-reduced-motion` is fully respected: Lenis smoothing is disabled and the
hero renders as a static climax poster on a normal, un-pinned page. The choice is
made on the first client render (`useSyncExternalStore`), so the scrub never even
mounts for users who opted out.

---

## Reusable by design

The brief asked for structure that could "later be reused for our real brand
assets." Adding a sequence is a **data change, not a code change**:

```bash
# Drop your footage in, point the script at it, choose the trim window:
npm run frames -- --src assets/source/your-footage.mp4 --start 1.1 --end 8.0 \
  --width 1280 --out public/sequence
```

That writes the WebP frames and a self-describing `manifest.json`
(frame count, dimensions, base path). Every scrubbing surface — the pinned hero
([`ScrollSequence`](src/components/sequence/scroll-sequence.tsx)) and the
full-height turntable in the Spec section
([`Specs`](src/components/sections/specs.tsx)) — is just the same two hooks
(`useImageSequence` + `useSequenceCanvas`) pointed at a different manifest. This
project ships two sequences from two different videos to prove it.

---

## Structure

```
src/
  app/
    layout.tsx                 fonts, metadata, providers, grain
    page.tsx                   section composition
    globals.css                design tokens · grain · primitives
  lib/
    motion.ts                  shared easing / reveal variants
    use-prefers-reduced-motion.ts
  components/
    providers/smooth-scroll.tsx   root Lenis + reduced-motion
    layout/site-nav.tsx           glass-island nav (morphs on scroll)
    layout/site-footer.tsx
    sequence/
      scroll-sequence.tsx         the pinned hero act
      use-image-sequence.ts       manifest-driven preloader
      use-sequence-canvas.ts      DPR + cover-fit canvas painter
      sequence-loader.tsx
      static-hero.tsx             reduced-motion / no-JS hero
    sections/                     hero · craft · specs (full-height scrub) · drop
    ui/                           reveal · grain · waitlist-form
scripts/extract-frames.mjs        ffmpeg → sharp → WebP + manifest
```

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # production build
npm run lint         # eslint (incl. react-hooks/compiler rules) — clean
```

The committed `public/sequence*` frames mean the site runs immediately; you only
need `npm run frames` (and `ffmpeg` on PATH) to regenerate from new footage.

---

## Notes

- **Design direction:** near-black stage, warm "bone" foreground (never pure
  white), one electric ember accent (`#FF5412`, the underbrim). An animated film
  grain hides dark-gradient banding and doubles as a premium texture. Type pairs
  a tight grotesque (Geist) with an editorial serif italic (Instrument Serif) and
  a mono register (Geist Mono) for the technical labels.
- **Placeholder assets** are AI-generated rotation clips; the brief explicitly
  invited any rotating placeholder. Swap in the real cap and rerun the pipeline.
