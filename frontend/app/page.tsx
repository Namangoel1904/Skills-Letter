"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BellRing, Calendar, Clock, Film, Lightbulb, Newspaper } from "lucide-react";
import { useCorpus, readingMinutes, flattenEditions } from "@/lib/hooks";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/topics";
import { formatDate } from "@/lib/utils";
import { fadeUp, stagger } from "@/lib/motion";
import { useIntroReady } from "@/components/intro/intro";
import { useSubscribe } from "@/components/subscribe-modal";
import { Magnetic } from "@/components/animation/magnetic";
import { Reveal } from "@/components/animation/reveal";
import { CategoryChips } from "@/components/content/category-chips";
import { ContentCard } from "@/components/content/content-card";
import { PipelineStrip } from "@/components/content/pipeline-strip";
import { EmptyState, ErrorState, GridSkeleton } from "@/components/content/states";

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-lg bg-muted text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="font-mono text-lg font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const ready = useIntroReady();
  const { editions, items, error, isLoading, retry } = useCorpus();
  const { open } = useSubscribe();
  const [cat, setCat] = useState("all");
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 40]);
  const glowOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  const latest = editions[0];
  const latestItems = useMemo(() => (latest ? flattenEditions([latest]) : []), [latest]);
  const insights = latestItems.reduce((n, v) => n + (v.key_points?.length ?? 0), 0);
  const minutes = latestItems.reduce((n, v) => n + readingMinutes(v), 0);
  const sources = new Set(latestItems.map((v) => v.source_playlist).filter(Boolean)).size;

  const chips = useMemo(
    () => [
      { id: "all", label: "All", count: items.length },
      ...CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c)).map((c) => ({ id: c, label: CATEGORY_LABEL[c], count: items.filter((i) => i.category === c).length })),
    ],
    [items]
  );
  const shown = cat === "all" ? items : items.filter((i) => i.category === cat);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 pb-20 pt-6 sm:px-6">
      {/* Hero */}
      <motion.section variants={stagger(0.09)} initial="hidden" animate={ready ? "show" : "hidden"} className="relative overflow-hidden rounded-3xl border border-border bg-elevated px-6 py-10 sm:px-10 sm:py-14">
        <motion.div aria-hidden style={{ opacity: glowOpacity }} className="pointer-events-none absolute -right-24 -top-32 size-[420px] rounded-full bg-primary/20 blur-[110px]" />
        <motion.div style={{ y: heroY }} className="relative max-w-3xl">
          <motion.p variants={fadeUp} className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
            {latest ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-primary"><span className="size-1.5 animate-pulse rounded-full bg-primary" />EDITION #{latest.edition_number}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" />{formatDate(latest.generated_at, { month: "long", day: "numeric", year: "numeric" })}</span>
              </>
            ) : (
              <span>BEINGNOTIFIED</span>
            )}
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {latest ? "Your intelligence digest is ready." : "Your playlists. Distilled into intelligence."}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            All the insights that matter, extracted from the videos you didn&apos;t have time to watch.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Link href="/latest" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent-hover">
                Read digest <ArrowRight className="size-4" />
              </Link>
            </Magnetic>
            <Magnetic>
              <button onClick={open} className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-semibold transition-colors hover:bg-muted">
                <BellRing className="size-4" /> Subscribe
              </button>
            </Magnetic>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-x-9 gap-y-4 border-t border-border pt-6">
            {isLoading ? (
              Array.from({ length: 3 }, (_, i) => <div key={i} className="bn-skeleton h-10 w-32" aria-hidden />)
            ) : latest ? (
              <>
                <Metric icon={Film} label="videos processed" value={String(latest.video_count || latestItems.length)} />
                <Metric icon={Lightbulb} label="insights generated" value={String(insights)} />
                <Metric icon={Clock} label="min to read it all" value={String(minutes)} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Metrics appear once the first digest has been generated.</p>
            )}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Discovery */}
      <section className="mt-8" aria-labelledby="discover-h">
        <h2 id="discover-h" className="sr-only">Curated content</h2>
        <div className="sticky top-14 z-20 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6">
          <CategoryChips chips={chips} active={cat} onChange={setCat} id="home" />
        </div>

        <div className="mt-6">
          {isLoading ? (
            <GridSkeleton />
          ) : error ? (
            <ErrorState error={error} onRetry={retry} />
          ) : shown.length === 0 ? (
            <EmptyState icon={Newspaper} title="Nothing here yet" body="Once a digest is generated, curated videos and their AI breakdowns appear here." />
          ) : (
            <motion.div key={cat} variants={stagger(0.05)} initial="hidden" animate="show" className="grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
              {shown.slice(0, 18).map((item) => (
                <ContentCard key={item.video_id} item={item} />
              ))}
            </motion.div>
          )}
          {shown.length > 18 && (
            <div className="mt-10 text-center">
              <Link href="/discover" className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium hover:bg-muted">
                Browse all {items.length} breakdowns <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Signal meter + recap */}
      {latest && (
        <Reveal className="mt-16 grid gap-6 rounded-3xl border border-border bg-elevated p-6 sm:p-8 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Weekly intelligence recap</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">From {latest.video_count || latestItems.length} videos to {insights} insights.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {sources} playlist source{sources === 1 ? "" : "s"} · {new Set(latestItems.map((v) => v.category)).size} topic areas · digest generated {formatDate(latest.generated_at)}.
            </p>
            <div className="mt-5" role="img" aria-label={`Signal meter: ${insights} insights distilled from ${latestItems.length} videos`}>
              <div className="flex h-8 items-end gap-[3px]">
                {latestItems.slice(0, 32).map((v, i) => (
                  <motion.span key={v.video_id} className="w-full rounded-sm bg-primary" initial={{ height: 0 }} whileInView={{ height: `${20 + Math.min(80, (v.key_points?.length ?? 1) * 18)}%` }} viewport={{ once: true }} transition={{ delay: i * 0.03, duration: 0.5 }} />
                ))}
              </div>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">Bar height = insights extracted per video</p>
            </div>
          </div>
          <PipelineStrip />
        </Reveal>
      )}
    </div>
  );
}
