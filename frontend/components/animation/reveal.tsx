"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

/** Scroll-triggered section reveal (one animation per block, never per paragraph). */
export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container: children using `variants={fadeUp}` animate in sequence. */
export function StaggerGroup({
  children,
  className,
  step = 0.06,
  delay = 0,
  animate = "show",
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
  delay?: number;
  animate?: "show" | "hidden";
}) {
  return (
    <motion.div className={className} variants={stagger(step, delay)} initial="hidden" animate={animate}>
      {children}
    </motion.div>
  );
}
