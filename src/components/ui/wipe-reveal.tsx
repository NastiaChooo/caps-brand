"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT, inView } from "@/lib/motion";

/**
 * WipeReveal — content materialises behind a moving mask instead of a plain
 * fade. A `clip-path` edge sweeps across (left → right) while a short blur
 * sharpens, so the block resolves into place like it's being printed. Fires
 * once on enter; stagger via `delay` for a cascade across a row.
 */
export function WipeReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0, filter: "blur(6px)" }}
      whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1, filter: "blur(0px)" }}
      viewport={inView}
      transition={{ duration: 0.85, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
