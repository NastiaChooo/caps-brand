<!-- BEGIN:project-rules -->

# BRAND — Caps Hero · Coding Standards

> **Descriptive, not aspirational.** This document describes how *this* codebase
> is actually built. The code is the source of truth; if you change a pattern,
> update this file in the same change. Don't introduce a convention here that the
> code doesn't follow.

**Stack:** Next.js 16 (App Router, React 19) · Tailwind CSS v4 · Framer Motion 12 ·
Lenis · TypeScript (strict) · Vercel.

The site is a single scroll-driven landing page for a matte-black cap with a hidden
neon ("ember") underbrim. The centrepiece is a **canvas image-sequence scrub**: the
cap rotates frame-by-frame in lock-step with scroll. Everything is graded on feeling
like one continuous, 60fps shot.

---

## 1. File & Folder Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout — fonts, metadata, viewport, providers
│   ├── page.tsx              # The single page — composes sections only
│   ├── globals.css           # Tokens (@theme), base, components, utilities, grain
│   └── icon.svg
├── components/
│   ├── layout/               # Site chrome — site-nav.tsx, site-footer.tsx
│   ├── providers/            # Client providers — smooth-scroll (Lenis),
│   │                         #   sequence-preload (all frames, one shared loader)
│   ├── sections/             # Page sections — hero, craft, specs, drop
│   ├── sequence/             # Canvas image-sequence engine + its hooks
│   │   ├── scroll-sequence.tsx     # Hero turntable (pinned scrub)
│   │   ├── static-hero.tsx         # Reduced-motion / no-JS poster
│   │   ├── sequence-loader.tsx     # "Calibrating" preloader overlay
│   │   ├── use-image-sequence.ts   # Preload + decode frames
│   │   └── use-sequence-canvas.ts  # DPR sizing + cover/contain paint
│   └── ui/                   # Leaf primitives — reveal, wipe-reveal, grain,
│                             #   scroll-progress, waitlist-form
└── lib/
    ├── motion.ts             # Shared easings, reveal variants, inView config
    ├── range.ts              # clamp01 / range — scroll-math primitives
    └── use-prefers-reduced-motion.ts
```

**Rules**

- `app/` only routes and composes. [page.tsx](src/app/page.tsx) wires sections
  together; [layout.tsx](src/app/layout.tsx) wires fonts, metadata, and providers.
  No animation or business logic in `app/`.
- **Organise by domain, not by type.** A new feature gets a folder under
  `components/` (`sections/`, `sequence/`, …). Don't create a flat dumping ground.
- **Co-locate hooks with the component that owns them.** The sequence hooks live in
  `components/sequence/`, not a global `hooks/`. Only genuinely cross-cutting helpers
  go in `lib/`.
- A value used in more than one file goes in `lib/` (see `range.ts`, `motion.ts`) or
  a token in `globals.css`. Don't duplicate scroll math or easings.
- Lenis is initialised **once**, in [smooth-scroll.tsx](src/components/providers/smooth-scroll.tsx),
  mounted in the root layout. Never per-component.

---

## 2. Component Conventions

### Anatomy

```tsx
"use client";                       // only if the component needs it (see §6)
// 1. External imports (react, next, framer-motion, lenis)
// 2. Internal absolute imports (@/lib, @/components/...)
// 3. Internal relative imports (./sibling)
// 4. Module-level constants (data arrays as `as const`, tuning numbers)
// 5. Local types (inline, or imported from a shared module)
// 6. The component — a named `export function`
```

### Rules

- Components are **named `export function` declarations** — `export function Hero()`.
  No anonymous default exports. The one exception is `app/` route files
  (`page.tsx`, `layout.tsx`), which use Next's required `export default function`.
- **One exported component per file.** Helpers/types may share the file.
- **File names are `kebab-case`** for everything: `scroll-sequence.tsx`,
  `use-image-sequence.ts`, `range.ts`. (This is intentional and consistent across
  the repo — match it.)
- Props types are declared **inline** for small leaf components
  (`{ progress, done }: { progress: number; done: boolean }`). Promote to a named
  type only when a shape is shared across files. Don't over-formalise a 2-prop leaf.
- **No magic numbers in JSX.** Tuning values become named module constants
  (`SCROLL_VH`, `FRAME_START`, `CRAFT_VH`). Animation tuning lives next to the
  animation it drives — co-location beats a distant constants file when the numbers
  are meaningless without the component.
- Data sets are `const … as const` arrays (`PILLARS`, `SPEC`, `LINKS`), never `enum`.

---

## 3. TypeScript

- `strict: true`. `tsc --noEmit` and `eslint src` must stay green.
- Never `any` — use `unknown` and narrow.
- `enum` is forbidden — use `const` objects / arrays with `as const`.
- `React.FC` / `React.FunctionComponent` are forbidden.
- Prefer `as const` and explicit types over `as` assertions.

---

## 4. Styling — Tailwind v4

### Tokens (the only colour source)

All colours are tokens, defined once in [`globals.css`](src/app/globals.css)'s
`@theme` block and consumed as Tailwind utilities (`bg-void`, `text-bone`,
`text-ember`, `bg-field`, …). The palette is a restrained "stealth wealth" dark
system:

| Token group | Tokens |
| ----------- | ------ |
| Stage       | `void` `stage` `field` `ink` `surface` `line` `line-strong` |
| Foreground  | `bone` (warm off-white, never pure `#fff`) `mute` `faint` |
| Accent      | `ember` `ember-soft` `ember-deep` (the hidden underbrim) |

**Rules**

- **No raw hex/rgba in TSX.** Use token utilities (`bg-field`) or, where a property
  has no utility (gradients, shadows), reference the token via `var(--color-…)` and
  build alpha with `color-mix(in srgb, var(--color-ember) 60%, transparent)` — see
  `.glow-ember`. Never hand-type a *coloured* `rgba(255, 84, 18, …)` in a component.
  (Neutral black/white shadow alphas like `rgba(0,0,0,0.7)` in a `shadow-[…]` are
  fine — they're depth, not brand colour.)
- **One unavoidable exception:** `<canvas>` `fillStyle` can't read a CSS variable, so
  the sequence backdrop is a single literal constant (`FIELD` in
  [specs.tsx](src/components/sections/specs.tsx), `bgFill` in
  [use-sequence-canvas.ts](src/components/sequence/use-sequence-canvas.ts)) that
  mirrors a token. Comment it as such; don't scatter more literals.
- Raw hex is allowed only where tokens are *defined* — inside `@theme` and one-off
  gradient stops in `globals.css`.

### Fonts

Loaded via `next/font` in the root layout, exposed as CSS variables and wired into
Tailwind as `font-sans` / `font-mono` / `font-serif`:

- **Geist Sans** (`--font-geist-sans`) — body and the `.display` wordmark/headings.
- **Geist Mono** (`--font-geist-mono`) — `.eyebrow` micro-labels, technical readouts.
- **Instrument Serif** (`--font-instrument`) — the single italic accent (the "A" in
  BRAND, the italic clause in each heading). The one note of warmth.

Use Tailwind utilities (`font-serif`) or the `.display` / `.eyebrow` component
classes — never `style={{ fontFamily }}`.

### Shared CSS primitives (in `globals.css`)

`.eyebrow` (mono uppercase label) · `.hairline` · `.display` (editorial setting) ·
`.glow-ember` (static ember halo) · `.stage-vignette` · `.grain`. Reuse these
instead of re-deriving the same type/treatment inline.

### Class composition

There is no `cn()` helper and no `clsx`/`tailwind-merge` dependency — the project is
small enough that template-literal class toggles are fine
([site-nav.tsx](src/components/layout/site-nav.tsx)). If conditional class logic ever
grows beyond a couple of branches, add `cn()` then — don't pre-emptively.

---

## 5. Motion & Animation

This project *is* the animation. Two patterns, used deliberately:

### A. Scroll-scrubbed acts (pinned canvas / clip reveals)

Each pinned section owns its **own** scroll binding — there is no single global
scrub hook, because every act maps a different track to different values:

```tsx
const track = useRef<HTMLElement>(null);
const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

const render = useCallback((v: number) => {
  // read once, write transform/opacity for the whole stage in one pass
}, [deps]);

useMotionValueEvent(scrollYProgress, "change", render);
useEffect(() => { render(scrollYProgress.get()); }, [render, scrollYProgress]);
```

- Map scroll → values with `clamp01` / `range` from [lib/range.ts](src/lib/range.ts).
  Never inline a fresh clamp.
- Write styles **by hand through refs**, all in one `render` pass — one source of
  truth, one paint. The wordmark can't desync from the cap.
- **Only `transform` and `opacity`** during a scroll tick. Composited `clip-path`
  insets are acceptable (the craft wipe). **Never** write `filter: blur()`,
  `text-shadow`, `width/height/top/left`, or `margin/padding` per tick — those
  repaint. (The climax glow is a *static* `.glow-ember` that rides the caption's
  opacity fade; that's how to get a "glow-in" without per-tick `text-shadow`.)
- Put `will-change: transform` on scroll-animated elements (`will-change-transform`).

### B. One-shot entrances

For content that just needs to arrive once, use the Framer Motion components
[`Reveal`](src/components/ui/reveal.tsx) (rise + fade) and
[`WipeReveal`](src/components/ui/wipe-reveal.tsx) (clip-path wipe), driven by
`whileInView` + the shared `inView` config. Stagger with `delay`.

### Shared motion vocabulary

All easings/variants live in [lib/motion.ts](src/lib/motion.ts): `EASE_OUT`
(`--ease-out-soft`, the house easing), `EASE_IN_OUT`, `reveal`, `riseIn`, `stagger`,
`inView`. CSS transitions reference the same curve via `ease-[var(--ease-out-soft)]`.

### Lenis & reduced motion

- One root Lenis instance in the `SmoothScroll` provider; `lerp ≈ 0.1`.
- [`usePrefersReducedMotion`](src/lib/use-prefers-reduced-motion.ts) is a
  `useSyncExternalStore` read (no setState-in-effect, no flash). When reduced:
  Lenis hands scrolling back to the browser, and the hero renders the static poster
  ([static-hero.tsx](src/components/sequence/static-hero.tsx)) instead of the scrub.

### Image sequence & loading

- Frames are **data**: `scripts/extract-frames.mjs` writes a `manifest.json`; the
  hook reads it. Re-run on new footage, ship the folder, change no code.
- [`use-image-sequence.ts`](src/components/sequence/use-image-sequence.ts) preloads
  via a bounded worker pool and `img.decode()`; it keeps plain `HTMLImageElement`s
  (lets the browser manage bitmaps — do **not** `createImageBitmap` every frame).
- [`use-sequence-canvas.ts`](src/components/sequence/use-sequence-canvas.ts) is the
  only place that touches the canvas: DPR-capped sizing, cover/contain math,
  `paint(index)` is a no-op when the frame is unchanged, nearest-ready fallback.
- **Loading is part of the experience, and happens once, up front.** *Every* canvas
  sequence is preloaded at first page load by the `SequencePreload` provider
  ([sequence-preload.tsx](src/components/providers/sequence-preload.tsx)), behind a
  single shared `SequenceLoader` ("Calibrating") whose bar spans the combined frame
  count of all sequences. Sections never load their own frames — they read them via
  `useHeroSequence` / `useDetailSequence`, so **reaching any section is instant and
  no second loader ever appears mid-scroll.** Reduced-motion visitors skip the
  blocking overlay (static hero) and don't download the hero footage.

### Forbidden

- `transition: all` — always name the properties (`transition-[max-width,padding,…]`).
- Raw `window.addEventListener('scroll', …)` — use `useScroll` / `useLenis`.
- `setTimeout` for animation *sequencing* — use Framer Motion / scroll progress.
  (A short `setTimeout`/`requestIdleCallback` to *defer a preload* is fine.)
- Animating `filter`, `text-shadow`, or layout properties on every scroll tick.
- A second image-sequence loader appearing mid-scroll.

---

## 6. Server vs. Client Components

| Server (default)              | Client (`"use client"`)                       |
| ----------------------------- | --------------------------------------------- |
| Static markup, no interaction | `useScroll` / `useRef` / `useLenis` / state   |
| `page.tsx`, `site-footer`, `drop`, `grain` | `hero`, `craft`, `specs`, all `sequence/*`, `nav`, `reveal`, `waitlist` |

- Mark `"use client"` at the **lowest** boundary that needs it. `Drop` is a server
  component that simply renders the client `WaitlistForm` leaf.
- A root client **provider** that passes `children` through (`SmoothScroll`) is the
  canonical exception to "client = leaf" — server children still render server-side.

---

## 7. Forbidden Patterns (quick list)

- `any` · `enum` · `React.FC`
- Anonymous default exports (except Next `app/` route files)
- Raw hex/rgba in TSX (use tokens / `var()` / `color-mix`)
- Hardcoded clamp/range math or easings duplicated across files
- `transition: all`
- Animating `filter` / `text-shadow` / `width` / `height` / `padding` / `margin`
  per scroll tick
- `useEffect` + `addEventListener('scroll')` for scroll reading
- Lenis initialised more than once
- More than one exported component per file

<!-- END:project-rules -->
