import Image from "next/image";

/**
 * StaticHero — the reduced-motion (and no-JS) experience. The climax still,
 * delivering the reveal without any scroll choreography, under the same
 * wordmark and spacing as the motion stage.
 */
export function StaticHero() {
  return (
    <section className="relative flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden stage-vignette px-6 text-center">
      <Image
        src="/stills/climax.webp"
        alt="The BRAND cap, its neon underbrim caught in the light."
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/15 to-void/90" />

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="display text-[clamp(4rem,17vw,15rem)]">
          BR
          <span className="font-serif font-normal italic text-bone">A</span>
          ND
        </h1>
        <p className="mt-7 max-w-xs text-balance text-sm leading-relaxed text-mute">
          The signature is on the inside.
        </p>
      </div>
    </section>
  );
}
