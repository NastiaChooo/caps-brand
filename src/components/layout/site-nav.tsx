"use client";

import { useState } from "react";
import { useLenis } from "lenis/react";

const LINKS = [
  { href: "#craft", label: "Craft" },
  { href: "#spec", label: "Spec" },
] as const;

/**
 * Fixed navigation that morphs on scroll.
 *
 * At the top it's a full-bleed, transparent bar floating over the hero. Once you
 * leave the hero it contracts into a centered glass "island" — narrower,
 * rounded, blurred, hairline-bordered. The whole transform is one eased
 * transition on a single container (max-width / padding / radius / background),
 * so it stays buttery and never reflows the page.
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  // React bails on identical state, so this only commits when the flag flips.
  useLenis(({ scroll }) => setScrolled(scroll > 64));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex justify-center transition-[padding] duration-500 ease-[var(--ease-out-soft)] ${
        scrolled ? "px-3 pt-3 sm:px-4 sm:pt-4" : "px-0 pt-0"
      }`}
    >
      <div
        className={`flex w-full items-center justify-between gap-6 transition-[max-width,padding,border-radius,background-color,border-color,box-shadow] duration-500 ease-[var(--ease-out-soft)] ${
          scrolled
            ? "max-w-3xl rounded-full border border-line bg-void/60 px-5 py-3 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:px-6"
            : "max-w-7xl rounded-none border border-transparent bg-transparent px-6 py-5 lg:px-10"
        }`}
      >
        <a
          href="#top"
          className="text-sm font-semibold tracking-[0.32em] text-bone"
          aria-label="BRAND — back to top"
        >
          BRAND
        </a>

        <nav className="hidden items-center gap-10 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs uppercase tracking-[0.2em] text-mute transition-colors hover:text-bone"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#drop"
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-bone"
        >
          <span className="size-1.5 rounded-full bg-ember shadow-[0_0_12px_var(--color-ember)]" />
          The Drop
        </a>
      </div>
    </header>
  );
}
