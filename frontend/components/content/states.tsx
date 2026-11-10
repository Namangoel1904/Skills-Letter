"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";

export function CardSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="bn-skeleton aspect-video w-full" />
      <div className="bn-skeleton h-4 w-3/4" />
      <div className="bn-skeleton h-3 w-full" />
      <div className="bn-skeleton h-3 w-2/3" />
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading content" className="grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function ErrorState({ error, onRetry, className }: { error?: Error; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn("mx-auto flex max-w-md flex-col items-center rounded-2xl border border-border bg-card px-6 py-10 text-center", className)}>
      <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </div>
      <h3 className="mt-4 font-semibold">Couldn&apos;t load this</h3>
      <p className="mt-1 text-sm text-muted-foreground">{error?.message || "The server didn't respond. Check your connection and try again."}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-5 inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90">
          <RefreshCw className="size-4" /> Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: React.ComponentType<{ className?: string }>; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {body && <p className="mt-1 text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
