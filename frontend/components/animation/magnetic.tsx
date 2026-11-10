"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const SPRING_CFG = { stiffness: 260, damping: 28, mass: 0.8 };

/** Wraps a control and pulls it a few pixels toward the pointer. Fine pointers only. */
export function Magnetic({ children, strength = 0.18, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING_CFG);
  const sy = useSpring(y, SPRING_CFG);

  const enabled = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <motion.div
      ref={ref}
      className={className ?? "inline-block"}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (!enabled() || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const max = 8;
        x.set(Math.max(-max, Math.min(max, (e.clientX - (r.left + r.width / 2)) * strength)));
        y.set(Math.max(-max, Math.min(max, (e.clientY - (r.top + r.height / 2)) * strength)));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
