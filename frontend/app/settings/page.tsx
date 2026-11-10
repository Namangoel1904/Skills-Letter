"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Play, Sun, Trash2 } from "lucide-react";
import { useSaved } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { toast } from "@/components/ui/toaster";

function Row({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5 last:border-b-0">
      <div className="max-w-md">
        <h2 className="font-medium">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { saved, clear } = useSaved();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme !== "light";

  return (
    <PageContainer narrow>
      <PageHeader eyebrow="Settings" title="Preferences" description="These settings live in this browser only." />
      <div className="rounded-2xl border border-border bg-card px-5 sm:px-6">
        <Row title="Theme" body="Dark is the default. Switch to light if you prefer.">
          <div className="flex rounded-full border border-border p-0.5" role="group" aria-label="Theme">
            {([["dark", Moon], ["light", Sun]] as const).map(([t, Icon]) => (
              <button key={t} onClick={() => setTheme(t)} aria-pressed={mounted && (t === "dark") === dark} className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm capitalize", mounted && (t === "dark") === dark ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                <Icon className="size-3.5" />{t}
              </button>
            ))}
          </div>
        </Row>
        <Row title="Replay intro" body="Watch the “from noise to signal” introduction again.">
          <button
            onClick={() => {
              try {
                sessionStorage.removeItem("bn:intro-seen");
              } catch {
                /* ignore */
              }
              window.location.assign("/");
            }}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm hover:bg-muted"
          >
            <Play className="size-3.5" /> Replay
          </button>
        </Row>
        <Row title="Saved breakdowns" body={`${saved.length} item${saved.length === 1 ? "" : "s"} saved in this browser.`}>
          <button
            disabled={saved.length === 0}
            onClick={() => {
              clear();
              toast({ title: "Saved items cleared" });
            }}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm hover:bg-muted disabled:opacity-50"
          >
            <Trash2 className="size-3.5" /> Clear
          </button>
        </Row>
        <Row title="Admin console" body="Manage the pipeline, subscribers and analytics (password required).">
          <Link href="/admin" className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background">Open</Link>
        </Row>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">Motion and the custom cursor automatically turn off when your system requests reduced motion, and on touch devices.</p>
    </PageContainer>
  );
}
