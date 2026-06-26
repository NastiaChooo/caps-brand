"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT, inView } from "@/lib/motion";

/**
 * Reveal — a single, reusable scroll-entrance.
 *
 * Quiet rise + fade, transform/opacity only, fires once. Deliberately small in
 * travel: restraint reads as luxury. Used everywhere below the hero so every
 * section enters in the same voice.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: 1.05, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
