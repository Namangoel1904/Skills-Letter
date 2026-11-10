"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Calendar, ChevronDown, Clock, ExternalLink, Github, Link2, Cpu } from "lucide-react";
import type { NewsletterEdition } from "@/lib/api";
import { flattenEditions, readingMinutes, type CorpusItem } from "@/lib/hooks";
import { CATEGORY_BLURB, CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/topics";
import { cn, formatDate } from "@/lib/utils";
import { EASE } from "@/lib/motion";
import { Reveal } from "@/components/animation/reveal";
import { useSubscribe } from "@/components/subscribe-modal";
import { SaveButton } from "@/components/content/content-card";
import { toast } from "@/components/ui/toaster";
import { ReadingProgress } from "./reading-progress";

function Story({ item, index }: { item: CorpusItem; index: number }) {
  const [open, setOpen] = useState(false);
  const mins = readingMinutes(item);
  const hasMore = (item.key_points?.length ?? 0) > 0;
  return (
    <article id={`story-${item.video_id}`} className="border-t border-border py-7 first:border-t-0">
      <div className="flex items-start gap-4">
        <span className="mt-1 font-mono text-sm text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
        <div className="min-w-0 flex-1">
          <p className="mb-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{item.channel}</span>
            {item.published_at && <span>· {formatDate(item.published_at)}</span>}
            <span className="inline-flex items-center gap-1">· <Clock className="size-3" />{mins} min</span>
          </p>
          <h3 className="text-xl font-semibold leading-snug tracking-tight">
            <Link href={`/drop/${item.video_id}`} className="transition-colors hover:text-primary">{item.title}</Link>
          </h3>
          <p className="mt-2 text-[17px] leading-[1.7] text-foreground/85">{item.tldr}</p>

          {item.why_it_matters && (
            <p className="mt-3 border-l-2 border-primary pl-4 text-[15px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Why it matters. </span>
              {item.why_it_matters}
            </p>
          )}

          {hasMore && (
            <>
              <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                {open ? "Hide" : "Show"} {item.key_points.length} insight{item.key_points.length === 1 ? "" : "s"}
                <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: EASE.out }} className="overflow-hidden">
                    {item.key_points.map((p, i) => (
                      <li key={i} className="flex gap-3 pt-3 text-[15px] leading-relaxed text-foreground/85">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        {p}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link href={`/drop/${item.video_id}`} className="inline-flex h-8 items-center rounded-full bg-muted px-3.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground">Read breakdown</Link>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs hover:bg-muted"><ExternalLink className="size-3.5" />Source</a>
            {item.repo_links?.[0] && <a href={item.repo_links[0]} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs hover:bg-muted"><Github className="size-3.5" />Repo</a>}
            {item.model_links?.[0] && <a href={item.model_links[0]} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs hover:bg-muted"><Cpu className="size-3.5" />Model</a>}
            <SaveButton item={item} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function DigestReader({ edition }: { edition: NewsletterEdition }) {
  const { open } = useSubscribe();
  const items = useMemo(() => flattenEditions([edition]), [edition]);
  const sections = useMemo(
    () => CATEGORY_ORDER.map((c) => ({ id: c, label: CATEGORY_LABEL[c], blurb: CATEGORY_BLURB[c], items: items.filter((i) => i.category === c) })).filter((s) => s.items.length > 0),
    [items]
  );
  const minutes = items.reduce((n, v) => n + readingMinutes(v), 0);
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(`section-${s.id}`)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id.replace("section-", ""));
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const copyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#section-${id}`;
    navigator.clipboard?.writeText(url).then(() => toast({ title: "Link copied" }), () => undefined);
  };

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <header className="max-w-3xl">
          <p className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
            <span className="text-primary">EDITION #{edition.edition_number}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" />{formatDate(edition.generated_at, { month: "long", day: "numeric", year: "numeric" })}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" />{minutes} min read</span>
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">{edition.title}</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            {items.length} breakdowns across {sections.length} topic{sections.length === 1 ? "" : "s"}, distilled from your playlists.
          </p>
        </header>

        {items.length === 0 ? (
          <p className="mt-16 text-muted-foreground">This edition has no curated stories.</p>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-[200px_1fr]">
            <aside className="hidden lg:block">
              <nav aria-label="Digest sections" className="sticky top-24">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">In this issue</p>
                <ul className="space-y-0.5 border-l border-border">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#section-${s.id}`} className={cn("-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors", active === s.id ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
                        {s.label} <span className="text-xs opacity-60">{s.items.length}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <button onClick={open} className="mt-6 inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-accent-hover">
                  <BellRing className="size-4" /> Subscribe
                </button>
              </nav>
            </aside>

            <div className="min-w-0 max-w-3xl">
              {sections.map((s) => (
                <Reveal key={s.id} className="mb-14">
                  <section id={`section-${s.id}`} aria-labelledby={`h-${s.id}`}>
                    <div className="group mb-2 flex items-baseline gap-3">
                      <h2 id={`h-${s.id}`} className="text-2xl font-semibold tracking-tight">{s.label}</h2>
                      <button onClick={() => copyLink(s.id)} aria-label={`Copy link to ${s.label}`} className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"><Link2 className="size-4" /></button>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">{s.blurb}</p>
                    <div>{s.items.map((it, i) => <Story key={it.video_id} item={it} index={i} />)}</div>
                  </section>
                </Reveal>
              ))}

              <div className="rounded-2xl border border-border bg-elevated p-6 text-center sm:p-8">
                <h2 className="text-xl font-semibold">Get the next issue in your inbox</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Daily, weekdays, twice a week or weekly — your choice.</p>
                <button onClick={open} className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-accent-hover"><BellRing className="size-4" />Subscribe</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
