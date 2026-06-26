"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

/**
 * Waitlist capture. No backend wired (this is a hero test), but the
 * micro-interaction is fully considered — validation, an in-place success
 * state, motion that matches the rest of the page. The taste lives in the
 * small things.
 */
export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="relative h-14">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="absolute inset-0 flex items-center gap-3 text-sm text-bone"
          >
            <span className="size-1.5 rounded-full bg-ember shadow-[0_0_12px_var(--color-ember)]" />
            You&apos;re on the list. We&apos;ll be in touch before the drop.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            onSubmit={(e) => {
              e.preventDefault();
              if (valid) setDone(true);
            }}
            className="absolute inset-0 flex items-center gap-4 border-b border-line focus-within:border-bone"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              aria-label="Email address"
              className="h-full flex-1 bg-transparent text-sm text-bone placeholder:text-faint focus:outline-none"
            />
            <button
              type="submit"
              disabled={!valid}
              className="shrink-0 text-xs uppercase tracking-[0.25em] text-mute transition-colors hover:text-ember disabled:cursor-not-allowed disabled:opacity-40"
            >
              Request access →
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
