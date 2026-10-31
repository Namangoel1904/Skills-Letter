"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useVelocity, useTransform } from "framer-motion";

interface UserCursorProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  name?: string;
  color?: string;
}

export function UserCursor({
  containerRef,
  name = "Vibe Coder",
  color = "#6366f1",
}: UserCursorProps) {
  const [isVisible, setIsVisible] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Smooth springs for cursor position
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const cursorX = useSpring(rawX, springConfig);
  const cursorY = useSpring(rawY, springConfig);

  // Velocity-driven rotation for the trailing pill
  const xVelocity = useVelocity(rawX);
  const rotatePill = useTransform(xVelocity, [-1500, 0, 1500], [-12, 0, 12]);

  useEffect(() => {
    const target = containerRef?.current || window;

    const handleMouseMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    target.addEventListener("mousemove", handleMouseMove as EventListener);
    target.addEventListener("mouseleave", handleMouseLeave as EventListener);
    target.addEventListener("mouseenter", handleMouseEnter as EventListener);

    return () => {
      target.removeEventListener("mousemove", handleMouseMove as EventListener);
      target.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      target.removeEventListener("mouseenter", handleMouseEnter as EventListener);
    };
  }, [containerRef, rawX, rawY, isVisible]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50 select-none hidden md:block"
      style={{
        x: cursorX,
        y: cursorY,
        opacity: isVisible ? 1 : 0,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ opacity: { duration: 0.2 } }}
    >
      {/* 1. Vector Pointer Arrow */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] -translate-x-[2px] -translate-y-[2px]"
      >
        <path
          d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
          fill={color}
          stroke="#ffffff"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* 2. Trailing User Pill (Velocity-Tilted) */}
      <motion.div
        style={{ rotate: rotatePill, backgroundColor: color }}
        className="absolute left-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] border border-white/20 backdrop-blur-md transition-transform"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
        <span className="tracking-tight">{name}</span>
      </motion.div>
    </motion.div>
  );
}
