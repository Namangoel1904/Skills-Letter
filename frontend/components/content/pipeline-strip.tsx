"use client";

import { motion } from "framer-motion";
import { Inbox, Layers, Send, Sparkles } from "lucide-react";
import { EASE } from "@/lib/motion";

const STEPS = [
  { icon: Inbox, title: "Collect", body: "Videos are pulled from your playlists." },
  { icon: Sparkles, title: "Analyze", body: "Gemini reads each video's content." },
  { icon: Layers, title: "Distill", body: "Insights are extracted and ranked." },
  { icon: Send, title: "Deliver", body: "A digest lands in your inbox." },
];

/** Collect → Analyze → Distill → Deliver. */
export function PipelineStrip() {
  return (
    <ol className="relative grid gap-4 sm:grid-cols-4" aria-label="How BeingNotified works">
      <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-px bg-border sm:block">
        <motion.div className="h-full origin-left bg-primary" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASE.out }} />
      </div>
      {STEPS.map((s, i) => (
        <motion.li key={s.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.12, ease: EASE.out }} className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
          <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-primary">
            <s.icon className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">{s.title}</p>
            <p className="text-xs text-muted-foreground">{s.body}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
