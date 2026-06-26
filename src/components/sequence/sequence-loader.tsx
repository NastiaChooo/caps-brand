"use client";

import { AnimatePresence, motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

/**
 * The preloader shown over the stage until every frame is decoded. It is part
 * of the experience, not an afterthought: a held black frame, a hairline that
 * fills, a monospace count. Letting the sequence pop in half-loaded would be the
 * tell of an amateur scrub.
 */
export function SequenceLoader({
  progress,
  done,
}: {
  progress: number;
  done: boolean;
}) {
  const pct = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-void"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        >
          <span className="eyebrow mb-6">Calibrating</span>

          <div className="relative h-px w-48 overflow-hidden bg-line">
            <motion.div
              className="absolute inset-y-0 left-0 bg-bone"
              style={{ width: `${pct}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          <div className="mt-5 font-mono text-xs tracking-[0.3em] text-mute tabular-nums">
            {String(pct).padStart(3, "0")}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
