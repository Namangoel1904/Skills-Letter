"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Bookmark, BookmarkCheck, Clock, Play } from "lucide-react";
import { readingMinutes, useSaved, type CorpusItem } from "@/lib/hooks";
import { categoryLabel } from "@/lib/topics";
import { cn, formatDate, youtubeThumb } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";
import { toast } from "@/components/ui/toaster";

export function SaveButton({ item, className, label }: { item: CorpusItem; className?: string; label?: boolean }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(item.video_id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save for later"}
      onClick={() => {
        const now = toggle(item);
        toast({ title: now ? "Saved" : "Removed from saved", description: item.title });
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full text-sm transition-colors",
        label ? "h-9 border border-border px-3 hover:bg-muted" : "size-8 justify-center hover:bg-muted",
        saved ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <motion.span key={String(saved)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
        {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
      </motion.span>
      {label && (saved ? "Saved" : "Save")}
    </button>
  );
}

export function ContentCard({ item, view = "grid" }: { item: CorpusItem; view?: "grid" | "list" }) {
  const thumb = item.thumbnail_url || youtubeThumb(item.video_id);
  const mins = readingMinutes(item);
  const date = formatDate(item.published_at);
  const href = `/drop/${item.video_id}`;
  const list = view === "list";

  return (
    <motion.article
      variants={fadeUp}
      data-cursor="view"
      className={cn("group relative flex gap-4", list ? "flex-col sm:flex-row" : "flex-col")}
    >
      <Link
        href={href}
        data-cursor="play"
        aria-label={`Open breakdown: ${item.title}`}
        className={cn("relative block shrink-0 overflow-hidden rounded-xl bg-muted outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring", list ? "aspect-video w-full sm:w-64" : "aspect-video w-full")}
      >
        <Image
          src={thumb}
          alt=""
          fill
          sizes={list ? "(max-width: 640px) 100vw, 256px" : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"}
          loading="lazy"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">{categoryLabel(item.category)}</span>
        <span className="absolute bottom-2.5 right-2.5 grid size-9 translate-y-1 place-items-center rounded-full bg-primary text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Play className="size-4 fill-current" />
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={href} className="block outline-none">
          <p className="mb-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{item.channel}</span>
            {date && <span>· {date}</span>}
            <span className="inline-flex items-center gap-1">· <Clock className="size-3" />{mins} min read</span>
          </p>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">{item.title}</h3>
          {item.tldr && <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.tldr}</p>}
        </Link>

        {item.tags?.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((t) => (
              <Link key={t} href={`/discover?tag=${encodeURIComponent(t)}`} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary">
                {t}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-1.5 pt-0.5">
          <Link href={href} className="inline-flex h-8 items-center gap-1 rounded-full bg-muted px-3.5 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground">
            Read breakdown
          </Link>
          <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label="Open on YouTube (new tab)" className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ArrowUpRight className="size-4" />
          </a>
          <SaveButton item={item} className="ml-auto" />
        </div>
      </div>
    </motion.article>
  );
}
