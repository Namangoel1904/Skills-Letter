"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface RibbonGlowProps {
  className?: string;
  speed?: number;
  intensity?: number;
  interactive?: boolean;
}

export default function RibbonGlow({
  className,
  speed = 1,
  intensity = 0.8,
  interactive = true,
}: RibbonGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.3);

  const smoothX = useSpring(mouseX, { stiffness: 45, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 45, damping: 20 });

  useEffect(() => {
    setMounted(true);
    if (!interactive) return;

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [interactive, mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none z-0",
        className
      )}
      style={{ opacity: intensity }}
      aria-hidden="true"
    >
      {/* ── Atmospheric Primary Ribbon Beam ── */}
      <motion.div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1200px] h-[550px] rounded-full blur-[110px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99, 102, 241, 0.28) 0%, rgba(139, 92, 246, 0.18) 45%, rgba(16, 185, 129, 0.10) 75%, transparent 100%)",
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          scale: [1, 1.08, 0.96, 1],
          rotate: [0, 2.5, -2, 0],
        }}
        transition={{
          duration: 18 / speed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ── Secondary Counter-Curve Aurora ── */}
      <motion.div
        className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[900px] h-[350px] rounded-full blur-[90px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 30% at 50% 50%, rgba(168, 85, 247, 0.25) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 100%)",
        }}
        animate={{
          scale: [1, 0.94, 1.06, 1],
          x: ["-50%", "-48%", "-52%", "-50%"],
          y: ["0%", "4%", "-3%", "0%"],
        }}
        transition={{
          duration: 14 / speed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ── Elegant Flowing Vector Ribbon SVG ── */}
      {mounted && (
        <svg
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full object-cover opacity-60 dark:opacity-85 mix-blend-plus-lighter"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ribbonGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
              <stop offset="25%" stopColor="#818cf8" stopOpacity="0.75" />
              <stop offset="55%" stopColor="#c084fc" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#34d399" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="ribbonGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="35%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#2dd4bf" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>

            <filter id="ribbonBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Core Ribbon Wave 1 */}
          <path
            d="M -100 280 C 260 140, 520 440, 840 240 C 1140 40, 1380 340, 1600 200"
            stroke="url(#ribbonGrad1)"
            strokeWidth="2.5"
            strokeDasharray="6 8"
            filter="url(#ribbonBlur)"
            className="animate-pulse"
            style={{ animationDuration: "8s" }}
          />

          {/* Counter Wave 2 */}
          <path
            d="M -100 220 C 300 380, 620 160, 960 360 C 1220 520, 1420 120, 1600 260"
            stroke="url(#ribbonGrad2)"
            strokeWidth="1.8"
            strokeOpacity="0.75"
            filter="url(#ribbonBlur)"
          />

          {/* Accent Flow Path 3 */}
          <path
            d="M -50 250 C 380 200, 720 320, 1100 180 C 1320 80, 1500 280, 1600 220"
            stroke="url(#ribbonGrad1)"
            strokeWidth="1"
            strokeOpacity="0.45"
          />
        </svg>
      )}

      {/* Grid Canvas Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-70" />
    </div>
  );
}
