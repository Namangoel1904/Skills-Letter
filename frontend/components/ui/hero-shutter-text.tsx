"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface HeroTextProps {
  text?: string;
  className?: string;
  sizeClassName?: string;
  showControl?: boolean;
}

export default function HeroText({
  text = "BeingNotified",
  className = "",
  sizeClassName = "text-4xl sm:text-6xl md:text-7xl lg:text-8xl",
  showControl = false,
}: HeroTextProps) {
  const [count, setCount] = useState(0);
  const characters = text.split("");

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full transition-colors duration-700 select-none",
        className
      )}
    >
      {/* Main Text Container */}
      <div className="relative z-10 w-full px-2 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            className="flex flex-wrap justify-center items-center w-full"
          >
            {characters.map((char, i) => (
              <div
                key={i}
                className="relative px-[0.05em] overflow-hidden group"
              >
                {/* Main Character */}
                <motion.span
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ delay: i * 0.03 + 0.2, duration: 0.7 }}
                  className={cn(
                    "inline-block leading-none font-black text-foreground tracking-tight drop-shadow-sm",
                    sizeClassName
                  )}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>

                {/* Top Slice Layer */}
                <motion.span
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: "100%", opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.65,
                    delay: i * 0.03,
                    ease: "easeInOut",
                  }}
                  className={cn(
                    "absolute inset-0 leading-none font-black text-indigo-600 dark:text-emerald-400 [.cozy_&]:text-[#3c4a48] z-10 pointer-events-none",
                    sizeClassName
                  )}
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)" }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>

                {/* Middle Slice Layer */}
                <motion.span
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: "-100%", opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.65,
                    delay: i * 0.03 + 0.08,
                    ease: "easeInOut",
                  }}
                  className={cn(
                    "absolute inset-0 leading-none font-black text-zinc-700 dark:text-zinc-200 [.cozy_&]:text-[#5a6e6b] z-10 pointer-events-none",
                    sizeClassName
                  )}
                  style={{
                    clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>

                {/* Bottom Slice Layer */}
                <motion.span
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: "100%", opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.65,
                    delay: i * 0.03 + 0.16,
                    ease: "easeInOut",
                  }}
                  className={cn(
                    "absolute inset-0 leading-none font-black text-indigo-600 dark:text-emerald-400 [.cozy_&]:text-[#3c4a48] z-10 pointer-events-none",
                    sizeClassName
                  )}
                  style={{
                    clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Optional Floating Refresh Control */}
      {showControl && (
        <div className="mt-4 flex flex-col items-center gap-2 z-20">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCount((c) => c + 1)}
            className="p-2.5 bg-card/80 backdrop-blur-md border border-border/50 text-foreground rounded-full shadow-lg transition-colors"
            title="Re-shutter typography"
          >
            <RefreshCw size={16} />
          </motion.button>
        </div>
      )}
    </div>
  );
}
