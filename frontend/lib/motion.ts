/**
 * BeingNotified motion design system.
 * One set of easings, durations and variants — import from here instead of
 * hand-tuning values in components. Only transform + opacity are animated.
 */
import type { Transition, Variants } from "framer-motion";

export const EASE = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
};

export const DUR = { fast: 0.18, base: 0.32, slow: 0.6, cinematic: 0.9 };

export const SPRING = {
  soft: { type: "spring", stiffness: 260, damping: 28, mass: 0.8 } as Transition,
  snappy: { type: "spring", stiffness: 420, damping: 32 } as Transition,
  layout: { type: "spring", stiffness: 380, damping: 34 } as Transition,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base + 0.1, ease: EASE.out } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.base, ease: EASE.out } },
};

export const stagger = (step = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.base, ease: EASE.out } },
};
