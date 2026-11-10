"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Archive, ArrowUpRight, LayoutGrid, List, Search, SearchX } from "lucide-react";
import { useCorpus } from "@/lib/hooks";
import type { NewsletterEdition } from "@/lib/api";
import { cn, formatDate, youtubeThumb } from "@/lib/utils";
import { fadeUp, stagger } from "@/lib/motion";
import { categoryLabel } from "@/lib/topics";
import { EmptyState, ErrorState, GridSkeleton } from "@/components/content/states";
import { PageContainer, PageHeader } from "@/components/layout/page-header";

function EditionCard({ e, view }: { e: NewsletterEdition; view: "grid" | "list" }) {
  const cats = Array.from(new Set((e.videos ?? []).map((v) => v.category)));
  const cover = e.videos?.[0];
  return (
    <motion.div variants={fadeUp} data-cursor="view">
      <Link href={`/edition/${e.id}`} className={cn("group flex gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/50", view === "grid" ? "flex-col" : "flex-col sm:flex-row sm:items-center")}>
        <span className={cn("relative block shrink-0 overflow-hidden rounded-xl bg-muted", view === "grid" ? "aspect-video w-full" : "aspect-video w-full sm:w-56")}>
          {cover && <Image src={cover.thumbnail_url || youtubeThumb(cover.video_id)} alt="" fill sizes="(max-width: 640px) 100vw, 400px" loading="lazy" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />}
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/70 px-2 py-0.5 font-mono text-[11px] text-white">#{e.edition_number}</span>
        </span>
        <span className="min-w-0 flex-1 px-1 pb-1">
          <span className="block font-mono text-xs text-muted-foreground">{formatDate(e.generated_at, { month: "long", day: "numeric", year: "numeric" })} · {e.video_count} videos</span>
          <span className="mt-1 line-clamp-2 flex items-start gap-1 text-lg font-semibold leading-snug tracking-tight group-hover:text-primary">
            {e.title}
            <ArrowUpRight className="mt-1 size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
          <span className="mt-2 flex flex-wrap gap-1.5">
            {cats.slice(0, 4).map((c) => (
              <span key={c} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">{categoryLabel(c)}</span>
            ))}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

export default function ArchivePage() {
  const { editions, isLoading, error, retry } = useCorpus();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [view, setView] = useState<"grid" | "list">("grid");

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = editions.filter((e) => !t || [e.title, `#${e.edition_number}`, ...(e.videos ?? []).flatMap((v) => [v.title, v.channel])].join(" ").toLowerCase().includes(t));
    return list.sort((a, b) => (sort === "newest" ? b.edition_number - a.edition_number : a.edition_number - b.edition_number));
  }, [editions, q, sort]);

  return (
    <PageContainer>
      <PageHeader eyebrow="Archive" title="Every edition, in one place" description="Browse previous digests. Open one to read it as an issue." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Search editions</span>
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search editions, videos or channels" className="h-10 w-full rounded-full border border-border bg-elevated pl-10 pr-4 text-sm outline-none focus:border-primary/70 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_18%,transparent)]" />
        </label>
        <div className="flex items-center gap-2">
          <select aria-label="Sort editions" value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")} className="h-10 rounded-full border border-border bg-elevated px-3 text-sm outline-none">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <div className="flex rounded-full border border-border bg-elevated p-0.5" role="group" aria-label="Layout">
            {(["grid", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} aria-pressed={view === v} aria-label={`${v} view`} className={cn("grid size-9 place-items-center rounded-full", view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                {v === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <GridSkeleton count={6} />
        ) : error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : editions.length === 0 ? (
          <EmptyState icon={Archive} title="No editions yet" body="Generated digests will be archived here." />
        ) : shown.length === 0 ? (
          <EmptyState icon={SearchX} title="No matching editions" body="Try a different search." />
        ) : (
          <motion.div key={`${view}-${sort}-${q}`} variants={stagger(0.05)} initial="hidden" animate="show" className={view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
            {shown.map((e) => (
              <EditionCard key={e.id} e={e} view={view} />
            ))}
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}
