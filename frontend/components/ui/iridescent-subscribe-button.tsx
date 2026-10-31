"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { BellRing, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IridescentSubscribeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export const IridescentSubscribeButton = forwardRef<
  HTMLButtonElement,
  IridescentSubscribeButtonProps
>(({ text = "Subscribe to Skill Letter", className = "", ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "relative group inline-flex items-center justify-center h-11 px-6 rounded-full overflow-hidden select-none cursor-pointer",
        "bg-white dark:bg-white text-zinc-950 shadow-[0_8px_25px_rgba(0,0,0,0.12)] border border-black/10",
        "transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_12px_30px_rgba(255,255,255,0.25)]",
        className
      )}
      {...props}
    >
      {/* ── 1. IRIDESCENT CHROMATIC BORDER BEAM (Exact match to video 7f966f408564928438be69864e941e2b.mp4) ── */}
      <span className="absolute -inset-[3px] rounded-full pointer-events-none overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -inset-[100%] m-auto aspect-square w-[250%]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, transparent 55%, #38bdf8 68%, #818cf8 76%, #c084fc 84%, #f472b6 90%, #facc15 96%, transparent 100%)",
            filter: "blur(3px)",
          }}
        />
      </span>

      {/* ── 2. FROSTED PILL SURFACE MASK ── */}
      <span className="absolute inset-[1.5px] rounded-full bg-white dark:bg-white/95 backdrop-blur-xl pointer-events-none" />

      {/* ── 3. PRISMATIC SPECULAR TOP REFLECTION ── */}
      <span className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

      {/* ── 4. BUTTON CONTENT ── */}
      <span className="relative z-10 inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-tight text-zinc-950">
        <BellRing className="w-3.5 h-3.5 text-zinc-800 group-hover:rotate-12 transition-transform duration-300" />
        <span>{text}</span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </button>
  );
});

IridescentSubscribeButton.displayName = "IridescentSubscribeButton";
