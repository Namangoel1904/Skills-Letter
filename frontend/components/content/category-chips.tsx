"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPRING } from "@/lib/motion";

export interface Chip {
  id: string;
  label: string;
  count?: number;
}

/** Horizontally scrollable topic chips with an animated active pill. */
export function CategoryChips({ chips, active, onChange, id = "chips" }: { chips: Chip[]; active: string; onChange: (id: string) => void; id?: string }) {
  return (
    <div role="tablist" aria-label="Filter by topic" className="bn-scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0">
      {chips.map((c) => {
        const on = c.id === active;
        return (
          <button
            key={c.id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(c.id)}
            className={cn(
              "relative h-9 shrink-0 rounded-lg px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              on ? "text-background" : "bg-muted text-foreground hover:bg-border"
            )}
          >
            {on && <motion.span layoutId={`${id}-pill`} transition={SPRING.layout} className="absolute inset-0 rounded-lg bg-foreground" aria-hidden />}
            <span className="relative">
              {c.label}
              {typeof c.count === "number" && <span className={cn("ml-1.5 text-xs", on ? "opacity-70" : "text-muted-foreground")}>{c.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
