"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, Search, SearchX, X } from "lucide-react";
import type { CorpusItem } from "@/lib/hooks";
import { CATEGORY_LABEL, CATEGORY_ORDER, normalizeTag } from "@/lib/topics";
import { cn } from "@/lib/utils";
import { stagger } from "@/lib/motion";
import { CategoryChips } from "./category-chips";
import { ContentCard } from "./content-card";
import { EmptyState, ErrorState, GridSkeleton } from "./states";

type Sort = "newest" | "oldest" | "title";

/** Search + topic + tag filtering, sorting and grid/list toggle over real corpus items. */
export function LibraryView({
  items,
  loading,
  error,
  onRetry,
  initialQuery = "",
  initialTag = "",
  initialCategory = "all",
  empty,
  idPrefix = "lib",
}: {
  items: CorpusItem[];
  loading?: boolean;
  error?: Error;
  onRetry?: () => void;
  initialQuery?: string;
  initialTag?: string;
  initialCategory?: string;
  empty: { icon: React.ComponentType<{ className?: string }>; title: string; body?: string; action?: React.ReactNode };
  idPrefix?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [tag, setTag] = useState(initialTag);
  const [cat, setCat] = useState(initialCategory);
  const [sort, setSort] = useState<Sort>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");

  // keep in sync when the URL changes (e.g. navbar search while already on the page)
  useEffect(() => setQ(initialQuery), [initialQuery]);
  useEffect(() => setTag(initialTag), [initialTag]);
  useEffect(() => setCat(initialCategory), [initialCategory]);

  const chips = useMemo(
    () => [
      { id: "all", label: "All", count: items.length },
      ...CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c)).map((c) => ({ id: c, label: CATEGORY_LABEL[c], count: items.filter((i) => i.category === c).length })),
    ],
    [items]
  );

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const wantTag = normalizeTag(tag);
    const out = items.filter((v) => {
      if (cat !== "all" && v.category !== cat) return false;
      if (wantTag && !(v.tags ?? []).some((x) => normalizeTag(x) === wantTag)) return false;
      if (!t) return true;
      return [v.title, v.channel, v.tldr, v.why_it_matters ?? "", ...(v.tags ?? []), ...(v.key_points ?? [])].join(" ").toLowerCase().includes(t);
    });
    const time = (v: CorpusItem) => new Date(v.published_at || v.edition_date).getTime() || 0;
    return out.sort((a, b) => (sort === "title" ? a.title.localeCompare(b.title) : sort === "oldest" ? time(a) - time(b) : time(b) - time(a)));
  }, [items, q, tag, cat, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Filter results</span>
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by title, channel, insight or tag"
            className="h-10 w-full rounded-full border border-border bg-elevated pl-10 pr-4 text-sm outline-none transition-shadow focus:border-primary/70 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
          />
        </label>
        <div className="flex items-center gap-2">
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-10 rounded-full border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/70">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title A–Z</option>
          </select>
          <div className="flex rounded-full border border-border bg-elevated p-0.5" role="group" aria-label="Layout">
            {(["grid", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} aria-pressed={view === v} aria-label={`${v} view`} className={cn("grid size-9 place-items-center rounded-full transition-colors", view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                {v === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <CategoryChips chips={chips} active={cat} onChange={setCat} id={idPrefix} />
      </div>

      {tag && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
          Tag: {tag}
          <button onClick={() => setTag("")} aria-label="Clear tag filter" className="rounded-full hover:bg-primary/20"><X className="size-3.5" /></button>
        </p>
      )}

      <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">{loading ? "Loading…" : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}</p>

      <div className="mt-4">
        {loading ? (
          <GridSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : items.length === 0 ? (
          <EmptyState {...empty} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="No matches" body="Try a different keyword or clear the filters." action={<button onClick={() => { setQ(""); setTag(""); setCat("all"); }} className="h-9 rounded-full bg-foreground px-4 text-sm font-medium text-background">Clear filters</button>} />
        ) : (
          <motion.div
            key={`${view}-${cat}-${tag}-${q}-${sort}`}
            variants={stagger(0.04)}
            initial="hidden"
            animate="show"
            className={view === "grid" ? "grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-7"}
          >
            {filtered.slice(0, 60).map((item) => (
              <ContentCard key={item.video_id} item={item} view={view} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
