import { Reveal } from "@/components/ui/reveal";
import { WaitlistForm } from "@/components/ui/waitlist-form";

/**
 * Drop — the close. A held black field, the edition stated, one quiet ask.
 */
export function Drop() {
  return (
    <section
      id="drop"
      className="relative scroll-mt-24 border-t border-line py-36 lg:py-52"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <span className="eyebrow text-ember">Drop 001</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display mt-8 text-[clamp(2.4rem,5vw,4.4rem)]">
            Two hundred,
            <br />
            <span className="font-serif font-normal italic">
              then never again.
            </span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-md text-balance leading-relaxed text-mute">
            The first release is numbered and final. Join the list for early
            access — no spam, one note when it opens.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-12 max-w-md">
            <WaitlistForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
