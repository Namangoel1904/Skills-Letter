"use client";

import React, { forwardRef, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BlobTextRevealProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export const BlobTextRevealButton = forwardRef<
  HTMLButtonElement,
  BlobTextRevealProps
>(({ text = "Read Now!", className = "", ...props }, forwardedRef) => {
  const innerRef = useRef<HTMLButtonElement>(null);
  const [blobPos, setBlobPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = innerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBlobPos({ x, y });
    props.onMouseMove?.(e);
  };

  const setRefs = (node: HTMLButtonElement | null) => {
    (innerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  return (
    <button
      ref={setRefs}
      type="button"
      onMouseEnter={(e) => {
        setIsHovered(true);
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        props.onMouseLeave?.(e);
      }}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative group inline-flex items-center justify-center h-11 px-6 rounded-full overflow-hidden select-none cursor-pointer",
        "bg-zinc-950 text-white dark:bg-zinc-900 border border-white/20 shadow-md",
        "transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_25px_rgba(99,102,241,0.35)]",
        className
      )}
      {...props}
    >
      {/* 1. Dynamic Liquid Gooey Blob Layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 0.95 : 0.35,
          background: `radial-gradient(circle 55px at ${blobPos.x}% ${blobPos.y}%, rgba(99, 102, 241, 0.85) 0%, rgba(168, 85, 247, 0.65) 40%, rgba(16, 185, 129, 0.35) 70%, transparent 100%)`,
          filter: "blur(14px)",
        }}
      />

      {/* 2. Secondary Ambient Drifting Blob for Idle Vitality */}
      <motion.div
        animate={{
          x: [0, 18, -18, 0],
          y: [0, -8, 8, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-20 h-20 -top-4 -left-4 rounded-full bg-indigo-500/30 blur-xl pointer-events-none"
      />

      {/* 3. Button Foreground Content */}
      <span className="relative z-10 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-white">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
        <span className="relative">
          {text}
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 transition-all duration-300 group-hover:w-full" />
        </span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-white/80 group-hover:text-white" />
      </span>
    </button>
  );
});

BlobTextRevealButton.displayName = "BlobTextRevealButton";
