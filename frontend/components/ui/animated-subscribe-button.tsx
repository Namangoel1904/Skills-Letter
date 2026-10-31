"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedSubscribeButtonProps {
  buttonColor?: string;
  buttonTextColor?: string;
  subscribeStatus?: boolean;
  initialText: React.ReactElement | string;
  changeText: React.ReactElement | string;
  className?: string;
  onClick?: () => void;
}

export const AnimatedSubscribeButton: React.FC<
  AnimatedSubscribeButtonProps
> = ({
  buttonColor = "#4f46e5",
  subscribeStatus = false,
  buttonTextColor = "#ffffff",
  changeText,
  initialText,
  className,
  onClick,
}) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(subscribeStatus);

  const handleClick = (e: React.MouseEvent) => {
    setIsSubscribed(!isSubscribed);
    if (onClick) {
      onClick();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isSubscribed ? (
        <motion.button
          type="button"
          className={cn(
            "relative flex h-11 min-w-[210px] items-center justify-center overflow-hidden rounded-xl bg-card border border-emerald-500/50 text-foreground px-5 text-xs font-semibold shadow-md transition-all active:scale-95",
            className
          )}
          onClick={handleClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            key="action"
            className="relative flex items-center justify-center h-full w-full font-semibold text-emerald-600 dark:text-emerald-400"
            initial={{ y: -30 }}
            animate={{ y: 0 }}
          >
            {changeText}
          </motion.span>
        </motion.button>
      ) : (
        <motion.button
          type="button"
          className={cn(
            "relative flex h-11 min-w-[210px] cursor-pointer items-center justify-center rounded-xl px-5 text-xs font-semibold shadow-[0_2px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.55)] transition-all active:scale-95",
            className
          )}
          style={{ backgroundColor: buttonColor, color: buttonTextColor }}
          onClick={handleClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            key="reaction"
            className="relative flex items-center justify-center font-semibold"
            initial={{ x: 0 }}
            exit={{ x: 50, transition: { duration: 0.1 } }}
          >
            {initialText}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
