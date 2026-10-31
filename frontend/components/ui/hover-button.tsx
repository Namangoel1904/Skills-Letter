"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface HoverSlatButtonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  initialText: string;
  hoverText: string;
}

const HoverSlatButton = React.forwardRef<
  HTMLDivElement,
  HoverSlatButtonProps
>(({ initialText, hoverText, className, ...props }, ref) => {
  // Normalize lengths so varying length phrases (e.g. "Explore" & "Now!") animate smoothly
  const maxLen = Math.max(initialText.length, hoverText.length);
  const normInitial = initialText.padEnd(maxLen, " ");
  const normHover = hoverText.padEnd(maxLen, " ");

  return (
    <div
      ref={ref}
      className={cn(
        "group inline-flex cursor-pointer select-none overflow-hidden rounded-xl shadow-md border border-primary/20",
        className
      )}
      {...props}
    >
      {normInitial.split("").map((char, index) => (
        <div
          key={index}
          className="relative flex h-11 w-8 sm:w-9 items-center justify-center overflow-hidden bg-primary text-primary-foreground text-xs sm:text-sm font-bold transition-all duration-700"
        >
          <div
            className={`absolute inset-0 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-black font-extrabold transition-transform duration-300 ${
              index % 2 === 0 ? "translate-y-full" : "-translate-y-full"
            } group-hover:translate-y-0`}
          >
            {normHover[index] === " " ? "\u00A0" : normHover[index]}
          </div>
          {char === " " ? "\u00A0" : char}
        </div>
      ))}
    </div>
  );
});

HoverSlatButton.displayName = "HoverSlatButton";

export default HoverSlatButton;
