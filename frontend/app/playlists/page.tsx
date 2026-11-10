"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, CheckCircle2, Copy, ExternalLink, ListVideo, Loader2, Lock, Play } from "lucide-react";
import useSWR from "swr";
import { getAdminDashboard, triggerGeneration, type AdminDashboardData } from "@/lib/api";
import { useCorpus } from "@/lib/hooks";
import { cn, youtubeThumb } from "@/lib/utils";
import { EASE } from "@/lib/motion";
import { ADMIN_TOKEN_KEY } from "@/components/layout/nav-config";
import { EmptyState, ErrorState } from "@/components/content/states";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { toast } from "@/components/ui/toaster";

/** Extracts a YouTube playlist ID from a URL or a bare ID. Returns null when it doesn't look valid. */
function parsePlaylistId(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    if (/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(u.hostname)) {
      const list = u.searchParams.get("list");
      return list && /^[A-Za-z0-9_-]{10,}$/.test(list) ? list : null;
    }
    return null;
  } catch {
    return /^(PL|UU|LL|FL|OL|RD)[A-Za-z0-9_-]{8,}$/.test(v) ? v : null;
  }
}

const STAGES = ["Playlist connected", "Fetching videos", "Analyzing content", "Extracting insights", "Generating digest", "Ready"] as const;
type RunState = { phase: "idle" } | { phase: "running"; startedAt: number } | { phase: "done"; message: string; videos?: number; seconds?: number } | { phase: "error"; message: string };

function ControlRoom({ run }: { run: RunState }) {
  const active = run.phase === "running";
  const done = run.phase === "done";
  const failed = run.phase === "error";
  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 sm:p-6" aria-live="polite">
      <ol className="relative grid gap-5 sm:grid-cols-6 sm:gap-2">
        <div aria-hidden className="absolute left-[8.33%] right-[8.33%] top-[15px] hidden h-px bg-border sm:block">
          <motion.div className={cn("h-full origin-left", failed ? "bg-destructive" : "bg-primary")} initial={false} animate={{ scaleX: done ? 1 : failed ? 0.5 : 0 }} transition={{ duration: 0.8, ease: EASE.out }} />
          {active && <motion.div className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-primary to-transparent" animate={{ left: ["-25%", "100%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />}
        </div>
        {STAGES.map((s, i) => (
          <li key={s} className="relative z-10 flex items-center gap-3 sm:flex-col sm:text-center">
            <span className={cn("grid size-[30px] place-items-center rounded-full border text-xs transition-colors", done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary/60 bg-card text-primary" : failed ? "border-destructive/50 bg-card text-destructive" : "border-border bg-card text-muted-foreground")}>
              {done ? <Check className="size-3.5" /> : active ? <Loader2 className="size-3.5 animate-spin" style={{ animationDelay: `${i * 90}ms` }} /> : i + 1}
            </span>
            <span className={cn("text-xs", done || active ? "text-foreground" : "text-muted-foreground")}>{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
        {run.phase === "idle" && "Run the pipeline to process the configured playlists into a new digest. The backend runs all stages in a single job and reports the outcome when finished."}
        {active && "Working… the backend processes every stage in one request and doesn't report per-stage progress, so stages complete together when it responds."}
        {done && (
          <span className="text-foreground">
            {run.message}
            {run.videos != null && ` · ${run.videos} videos`}
            {run.seconds != null && ` · ${Math.round(run.seconds)}s`}
          </span>
        )}
        {failed && <span className="text-destructive">{run.message}</span>}
      </p>
    </div>
  );
}

function AdminSection() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [run, setRun] = useState<RunState>({ phase: "idle" });
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    try {
      setToken(localStorage.getItem(ADMIN_TOKEN_KEY));
    } catch {
      setToken(null);
    }
    return () => {
      abortRef.current = true;
    };
  }, []);

  const { data, error, isLoading, mutate } = useSWR<AdminDashboardData>(token ? ["admin-dash", token] : null, () => getAdminDashboard(token!), { revalidateOnFocus: false, shouldRetryOnError: false });

  const parsed = useMemo(() => (input.trim() ? parsePlaylistId(input) : undefined), [input]);
  const envValue = useMemo(() => {
    if (!parsed) return "";
    const ids = data?.pipeline.playlist_ids ?? [];
    return [...ids.filter((i) => i !== parsed), parsed].join(",");
  }, [parsed, data]);

  if (token === undefined) return null;
  if (!token) {
    return (
      <section className="rounded-2xl border border-dashed border-border p-6" aria-labelledby="manage-h">
        <h2 id="manage-h" className="flex items-center gap-2 font-semibold"><Lock className="size-4 text-primary" />Manage sources</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Playlists are configured on the server (<code className="font-mono text-foreground">YOUTUBE_PLAYLIST_IDS</code>) using a YouTube Data API key, so only public or unlisted playlist URLs can be processed. Private playlists and Watch Later aren&apos;t reachable with an API key. Sign in to the admin console to view the configured sources and run the pipeline.
        </p>
        <Link href="/admin" className="mt-4 inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background">Open admin console</Link>
      </section>
    );
  }

  const start = async () => {
    setRun({ phase: "running", startedAt: Date.now() });
    try {
      const res = await triggerGeneration(token, { send_email: false, allow_reprocess: false });
      if (abortRef.current) return;
      if (res.success) {
        setRun({ phase: "done", message: res.message || "Digest generated", videos: res.video_count, seconds: res.duration_seconds });
        toast({ title: "Digest generated", description: res.title });
        mutate();
      } else {
        setRun({ phase: "error", message: res.message || "The pipeline finished without producing a digest." });
      }
    } catch (e) {
      if (abortRef.current) return;
      const message = e instanceof Error ? e.message : "Pipeline failed";
      setRun({ phase: "error", message });
      toast({ title: "Pipeline failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-10">
      <section aria-labelledby="cfg-h">
        <h2 id="cfg-h" className="mb-3 text-lg font-semibold">Configured playlists</h2>
        {isLoading ? (
          <div className="bn-skeleton h-24 w-full" role="status" aria-label="Loading playlists" />
        ) : error ? (
          <ErrorState error={error as Error} onRetry={() => mutate()} />
        ) : data && data.pipeline.playlist_ids.length === 0 ? (
          <EmptyState icon={ListVideo} title="No playlists configured" body="Add a playlist ID below, then set it on the server." />
        ) : (
          data && (
            <>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data.pipeline.playlist_ids.map((id, i) => (
                  <li key={id} className="rounded-xl border border-border bg-card p-4">
                    <p className="font-semibold">{data.pipeline.playlist_names[i] || `Playlist ${i + 1}`}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{id}</p>
                    <a href={`https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"><ExternalLink className="size-3.5" />Open on YouTube</a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                Look-back {data.pipeline.lookback_days}d · max {data.pipeline.max_videos_per_edition} videos/edition · schedule: {data.pipeline.cron_human}
              </p>
            </>
          )
        )}
      </section>

      <section aria-labelledby="add-h" className="rounded-2xl border border-border bg-card p-5">
        <h2 id="add-h" className="font-semibold">Add a playlist</h2>
        <p className="mt-1 text-sm text-muted-foreground">Paste a playlist URL or ID to validate it. The server reads playlists from its environment, so copy the resulting value into <code className="font-mono text-foreground">YOUTUBE_PLAYLIST_IDS</code> and redeploy.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">Playlist URL or ID</span>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://www.youtube.com/playlist?list=PL…" aria-invalid={parsed === null} className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary/70" />
          </label>
        </div>
        <AnimatePresence mode="wait">
          {parsed === null && (
            <motion.p key="bad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="alert" className="mt-3 flex items-center gap-2 text-sm text-destructive"><AlertCircle className="size-4" />That doesn&apos;t look like a YouTube playlist URL or ID.</motion.p>
          )}
          {parsed && (
            <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
              <div className="flex items-center gap-2 text-sm text-primary sm:col-span-2"><CheckCircle2 className="size-4" />Valid playlist ID: <span className="font-mono">{parsed}</span></div>
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2 pl-3 font-mono text-xs">
                  <span className="min-w-0 flex-1 truncate">YOUTUBE_PLAYLIST_IDS={envValue}</span>
                  <button
                    onClick={() => {
                      void navigator.clipboard?.writeText(`YOUTUBE_PLAYLIST_IDS=${envValue}`);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1500);
                    }}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-muted px-3 font-sans text-xs font-medium hover:bg-border"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section aria-labelledby="run-h">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="run-h" className="text-lg font-semibold">Intelligence pipeline</h2>
          <button onClick={start} disabled={run.phase === "running"} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-accent-hover disabled:opacity-60">
            {run.phase === "running" ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4 fill-current" />}
            {run.phase === "running" ? "Processing…" : "Run pipeline now"}
          </button>
        </div>
        <ControlRoom run={run} />
      </section>
    </div>
  );
}

export default function PlaylistsPage() {
  const { items, isLoading, error, retry } = useCorpus();

  const sources = useMemo(() => {
    const m = new Map<string, { name: string; count: number; channels: Set<string>; thumb: string }>();
    for (const it of items) {
      const key = it.source_playlist || "Unlabelled source";
      const cur = m.get(key) ?? { name: key, count: 0, channels: new Set<string>(), thumb: it.thumbnail_url || youtubeThumb(it.video_id) };
      cur.count++;
      cur.channels.add(it.channel);
      m.set(key, cur);
    }
    return [...m.values()].sort((a, b) => b.count - a.count);
  }, [items]);

  return (
    <PageContainer>
      <PageHeader eyebrow="My playlists" title="My intelligence sources" description="The playlists feeding your digests, and how their videos are processed." />

      <section aria-labelledby="src-h" className="mb-12">
        <h2 id="src-h" className="mb-3 text-lg font-semibold">Sources in your digests</h2>
        {error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : isLoading ? (
          <div role="status" aria-label="Loading sources" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="bn-skeleton h-44" />)}</div>
        ) : sources.length === 0 ? (
          <EmptyState icon={ListVideo} title="No ingested content yet" body="Once a digest is generated, the playlists it drew from are listed here." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sources.map((s) => (
              <li key={s.name}>
                <Link href={`/discover?q=${encodeURIComponent(s.name)}`} data-cursor="view" className="group block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50">
                  <span className="relative block aspect-[16/7] bg-muted">
                    <Image src={s.thumb} alt="" fill sizes="(max-width: 640px) 100vw, 400px" loading="lazy" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  </span>
                  <span className="block p-4">
                    <span className="block font-semibold">{s.name}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{s.count} processed video{s.count === 1 ? "" : "s"} · {s.channels.size} channel{s.channels.size === 1 ? "" : "s"}</span>
                    <span className="mt-3 block text-sm font-medium text-primary">View ingested content →</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminSection />
    </PageContainer>
  );
}
