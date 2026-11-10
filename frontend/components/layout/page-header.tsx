"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <motion.header variants={fadeUp} initial="hidden" animate="show" className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </motion.header>
  );
}

export function PageContainer({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) {
  return <div className={`mx-auto w-full px-4 pb-20 pt-8 sm:px-6 ${narrow ? "max-w-3xl" : "max-w-[1500px]"}`}>{children}</div>;
}
