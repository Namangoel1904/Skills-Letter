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
  align?: "left" | "center";
}

export default function HeroText({
  text = "BeingNotified - Skill Letter",
  className = "",
  sizeClassName = "font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]",
  showControl = false,
  align = "left",
}: HeroTextProps) {
  const [count, setCount] = useState(0);
  const words = text.split(" ");

  return (
    <div
      className={cn(
        "relative select-none",
        align === "center" ? "flex flex-col items-center text-center" : "text-left",
        className
      )}
    >
      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            className={cn(
              "flex flex-wrap items-baseline gap-x-3 gap-y-1",
              align === "center" ? "justify-center" : "justify-start"
            )}
          >
            {words.map((word, wordIdx) => {
              const chars = word.split("");
              return (
                <span key={wordIdx} className="inline-flex items-baseline whitespace-nowrap">
                  {chars.map((char, charIdx) => {
                    const globalIdx = wordIdx * 10 + charIdx;
                    return (
                      <span
                        key={charIdx}
                        className="relative inline-block overflow-hidden group"
                      >
                        {/* Main Crisp Character */}
                        <motion.span
                          initial={{ opacity: 0, filter: "blur(6px)", y: 4 }}
                          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                          transition={{ delay: globalIdx * 0.02 + 0.1, duration: 0.55 }}
                          className={cn("inline-block", sizeClassName)}
                        >
                          {char}
                        </motion.span>

                        {/* Top Slice Layer */}
                        <motion.span
                          initial={{ x: "-100%", opacity: 0 }}
                          animate={{ x: "100%", opacity: [0, 0.9, 0] }}
                          transition={{
                            duration: 0.6,
                            delay: globalIdx * 0.02,
                            ease: "easeInOut",
                          }}
                          className={cn(
                            "absolute inset-0 leading-none text-primary dark:text-emerald-400 [.cozy_&]:text-[#3c4a48] z-10 pointer-events-none",
                            sizeClassName
                          )}
                          style={{ clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)" }}
                        >
                          {char}
                        </motion.span>

                        {/* Middle Slice Layer */}
                        <motion.span
                          initial={{ x: "100%", opacity: 0 }}
                          animate={{ x: "-100%", opacity: [0, 0.9, 0] }}
                          transition={{
                            duration: 0.6,
                            delay: globalIdx * 0.02 + 0.06,
                            ease: "easeInOut",
                          }}
                          className={cn(
                            "absolute inset-0 leading-none text-zinc-500 dark:text-zinc-300 [.cozy_&]:text-[#5a6e6b] z-10 pointer-events-none",
                            sizeClassName
                          )}
                          style={{
                            clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)",
                          }}
                        >
                          {char}
                        </motion.span>

                        {/* Bottom Slice Layer */}
                        <motion.span
                          initial={{ x: "-100%", opacity: 0 }}
                          animate={{ x: "100%", opacity: [0, 0.9, 0] }}
                          transition={{
                            duration: 0.6,
                            delay: globalIdx * 0.02 + 0.12,
                            ease: "easeInOut",
                          }}
                          className={cn(
                            "absolute inset-0 leading-none text-primary dark:text-emerald-400 [.cozy_&]:text-[#3c4a48] z-10 pointer-events-none",
                            sizeClassName
                          )}
                          style={{
                            clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)",
                          }}
                        >
                          {char}
                        </motion.span>
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {showControl && (
        <div className="mt-3 flex items-center gap-2 z-20">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCount((c) => c + 1)}
            className="p-1.5 bg-card/80 backdrop-blur-md border border-border/50 text-foreground rounded-full shadow-xs hover:border-primary/40 transition-colors"
            title="Re-shutter typography"
          >
            <RefreshCw size={13} />
          </motion.button>
        </div>
      )}
    </div>
  );
}
