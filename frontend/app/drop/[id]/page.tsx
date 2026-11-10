"use client";

import { use, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Calendar, Clock, Cpu, ExternalLink, FileSearch, Github, Play } from "lucide-react";
import { ApiError, getDropDetail, trackWebClick, type DropDetail } from "@/lib/api";
import { readingMinutes, useCorpus, type CorpusItem } from "@/lib/hooks";
import { categoryLabel, normalizeTag } from "@/lib/topics";
import { cn, formatDate, youtubeThumb } from "@/lib/utils";
import { fadeUp, stagger } from "@/lib/motion";
import { ReadingProgress } from "@/components/digest/reading-progress";
import { Reveal } from "@/components/animation/reveal";
import { SaveButton } from "@/components/content/content-card";
import { EmptyState, ErrorState } from "@/components/content/states";
import { PageContainer } from "@/components/layout/page-header";

function RelatedList({ title, items }: { title: string; items: CorpusItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.video_id}>
            <Link href={`/drop/${r.video_id}`} data-cursor="play" className="group flex gap-3">
              <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={r.thumbnail_url || youtubeThumb(r.video_id)} alt="" fill sizes="128px" loading="lazy" className="object-cover transition-transform duration-300 group-hover:scale-105" />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">{r.title}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{r.channel}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DropPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading, mutate } = useSWR<DropDetail, ApiError>(["drop", id], () => getDropDetail(id), { revalidateOnFocus: false, shouldRetryOnError: false });
  const { items } = useCorpus();
  const [mode, setMode] = useState<"read" | "watch">("read");

  const item = data?.item;
  const related = useMemo(() => {
    if (!item) return { playlist: [], topic: [], edition: [] };
    const others = items.filter((i) => i.video_id !== item.video_id);
    const tagSet = new Set((item.tags ?? []).map(normalizeTag));
    return {
      playlist: others.filter((i) => item.source_playlist && i.source_playlist === item.source_playlist).slice(0, 4),
      topic: others
        .map((i) => ({ i, score: (i.tags ?? []).filter((t) => tagSet.has(normalizeTag(t))).length + (i.category === item.category ? 0.5 : 0) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map((x) => x.i),
      edition: data ? others.filter((i) => i.edition_id === data.edition_id).slice(0, 4) : [],
    };
  }, [items, item, data]);

  if (error?.status === 404) {
    return (
      <PageContainer>
        <EmptyState icon={FileSearch} title="Breakdown not found" body="This video isn't part of any generated digest." action={<Link href="/discover" className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">Browse breakdowns</Link>} />
      </PageContainer>
    );
  }
  if (error) {
    return (
      <PageContainer>
        <ErrorState error={error} onRetry={() => mutate()} />
      </PageContainer>
    );
  }
  if (isLoading || !item || !data) {
    return (
      <PageContainer>
        <div role="status" aria-label="Loading breakdown" className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="bn-skeleton aspect-video w-full" />
            <div className="bn-skeleton h-9 w-3/4" />
            <div className="bn-skeleton h-24 w-full" />
          </div>
          <div className="bn-skeleton hidden h-80 lg:block" />
        </div>
      </PageContainer>
    );
  }

  const full: CorpusItem = { ...item, edition_id: data.edition_id, edition_number: data.edition_number, edition_title: data.edition_title, edition_date: data.edition_date };
  const mins = readingMinutes(item);
  const track = (url: string, gh = false) => void trackWebClick({ url, edition_id: data.edition_id, is_github: gh, tag: gh ? "github" : "source" });

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-6 sm:px-6">
        <Link href={`/edition/${data.edition_id}`} className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Edition #{data.edition_number}
        </Link>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <motion.article variants={stagger(0.08)} initial="hidden" animate="show" className="min-w-0">
            {/* Thumbnail / embed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted"
            >
              {mode === "watch" ? (
                <iframe
                  title={item.title}
                  src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.video_id)}?rel=0`}
                  className="absolute inset-0 size-full"
                  allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <>
                  <Image src={item.thumbnail_url || youtubeThumb(item.video_id)} alt={item.title} fill priority sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" />
                  <button onClick={() => setMode("watch")} data-cursor="play" aria-label="Watch the video here" className="absolute inset-0 grid place-items-center bg-black/20 transition-colors hover:bg-black/35">
                    <span className="grid size-16 place-items-center rounded-full bg-primary text-white shadow-xl"><Play className="ml-1 size-7 fill-current" /></span>
                  </button>
                </>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6">
              <p className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="rounded-md bg-primary/15 px-2 py-0.5 font-medium text-primary">{categoryLabel(item.category)}</span>
                <span className="font-medium text-foreground/80">{item.channel}</span>
                {item.published_at && <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{formatDate(item.published_at)}</span>}
                <span className="inline-flex items-center gap-1"><Clock className="size-3" />{mins} min read</span>
              </p>
              <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{item.title}</h1>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <div className="flex rounded-full border border-border p-0.5" role="group" aria-label="View mode">
                  {([["read", "Read", BookOpen], ["watch", "Watch", Play]] as const).map(([m, label, Icon]) => (
                    <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors", mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                      <Icon className="size-3.5" />{label}
                    </button>
                  ))}
                </div>
                <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={() => track(item.url)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm hover:bg-muted"><ExternalLink className="size-4" />Original video</a>
                <SaveButton item={full} label />
              </div>
            </motion.div>

            {/* TL;DR */}
            {item.tldr && (
              <motion.section variants={fadeUp} className="mt-8 rounded-2xl border border-primary/30 bg-primary/[0.06] p-5 sm:p-6" aria-labelledby="tldr-h">
                <h2 id="tldr-h" className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">TL;DR</h2>
                <p className="mt-2 text-xl leading-relaxed sm:text-[22px]">{item.tldr}</p>
              </motion.section>
            )}

            {/* Key insights */}
            {item.key_points?.length > 0 && (
              <section className="mt-10" aria-labelledby="insights-h">
                <h2 id="insights-h" className="text-xl font-semibold tracking-tight">Key insights</h2>
                <motion.ol variants={stagger(0.1, 0.15)} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-4 space-y-4">
                  {item.key_points.map((p, i) => (
                    <motion.li key={i} variants={fadeUp} className="flex gap-4">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted font-mono text-xs font-semibold text-primary">{i + 1}</span>
                      <p className="text-[17px] leading-[1.7] text-foreground/90">{p}</p>
                    </motion.li>
                  ))}
                </motion.ol>
              </section>
            )}

            {item.why_it_matters && (
              <Reveal className="mt-10">
                <section aria-labelledby="why-h">
                  <h2 id="why-h" className="text-xl font-semibold tracking-tight">Why it matters</h2>
                  <p className="mt-3 border-l-2 border-primary pl-5 text-[17px] leading-[1.75] text-foreground/90">{item.why_it_matters}</p>
                </section>
              </Reveal>
            )}

            {(item.repo_links?.length > 0 || item.model_links?.length > 0) && (
              <Reveal className="mt-10">
                <section aria-labelledby="refs-h">
                  <h2 id="refs-h" className="text-xl font-semibold tracking-tight">References</h2>
                  <ul className="mt-3 space-y-2">
                    {item.repo_links?.map((l) => (
                      <li key={l}><a href={l} target="_blank" rel="noopener noreferrer" onClick={() => track(l, true)} className="inline-flex items-center gap-2 break-all font-mono text-sm text-primary hover:underline"><Github className="size-4 shrink-0" />{l}</a></li>
                    ))}
                    {item.model_links?.map((l) => (
                      <li key={l}><a href={l} target="_blank" rel="noopener noreferrer" onClick={() => track(l)} className="inline-flex items-center gap-2 break-all font-mono text-sm text-primary hover:underline"><Cpu className="size-4 shrink-0" />{l}</a></li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            {item.tags?.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <Link key={t} href={`/discover?tag=${encodeURIComponent(t)}`} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-primary/15 hover:text-primary">{t}</Link>
                ))}
              </div>
            )}
          </motion.article>

          <aside className="space-y-8 lg:sticky lg:top-20 lg:self-start">
            <RelatedList title="More from this playlist" items={related.playlist} />
            <RelatedList title="Similar topics" items={related.topic} />
            <RelatedList title={`From Edition #${data.edition_number}`} items={related.edition} />
          </aside>
        </div>
      </div>
    </>
  );
}
