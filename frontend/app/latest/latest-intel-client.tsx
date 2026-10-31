"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Github,
  Cpu,
  ArrowUpRight,
  Calendar,
  Clock,
  BellRing,
  ExternalLink,
  Zap,
  Bookmark,
} from "lucide-react";

import { SubscribeModal } from "@/components/subscribe-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NewsletterEdition, VideoSummary } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LatestIntelClientProps {
  edition: NewsletterEdition | null;
  categories: Array<{
    id: string;
    title: string;
    badge: string;
    emoji: string;
    description: string;
    items: VideoSummary[];
  }>;
}

export function LatestIntelClient({ edition, categories }: LatestIntelClientProps) {
  // Temporary view toggle: "magazine" (New) vs "classic" (Original)
  const [view, setView] = useState<"magazine" | "classic">("magazine");

  const allItems = edition?.videos || [];
  const leadStory = allItems[0];
  const secondaryStories = allItems.slice(1);

  return (
    <div className="min-h-screen pb-24">
      {/* ── TEMPORARY PREVIEW TOGGLE BAR (Sticky below navbar) ── */}
      <div className="sticky top-20 z-40 w-full flex justify-center py-2 px-4 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-1.5 p-1 rounded-full bg-background/85 dark:bg-card/90 backdrop-blur-xl border border-primary/30 shadow-[0_8px_30px_rgba(0,0,0,0.15)] text-xs font-mono">
          <button
            type="button"
            onClick={() => setView("magazine")}
            className={cn(
              "px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
              view === "magazine"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>📰</span>
            <span>Magazine Edition</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold leading-tight">
              NEW
            </span>
          </button>
          <button
            type="button"
            onClick={() => setView("classic")}
            className={cn(
              "px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
              view === "classic"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>📋</span>
            <span>Classic Intel</span>
          </button>
        </div>
      </div>

      {view === "magazine" ? (
        /* ══════════════════════════════════════════════════════════════════ */
        /*  1. NEW MAGAZINE STYLE VIEW                                       */
        /* ══════════════════════════════════════════════════════════════════ */
        <div className="pt-20 sm:pt-24 max-w-5xl mx-auto px-4 sm:px-6">
          {/* Magazine Master Sheet */}
          <div className="rounded-3xl border border-border/60 bg-card/75 dark:bg-card/40 backdrop-blur-xl shadow-2xl p-6 sm:p-10 md:p-12 transition-all">
            
            {/* ── Top Double-Rule Metadata Bar ── */}
            <div className="border-t-2 border-b border-foreground/90 py-2.5 mb-8 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 tracking-wider">
                  VOL. 1 · ISSUE #{edition?.edition_number || 3}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {edition?.generated_at
                    ? format(new Date(edition.generated_at), "MMMM d, yyyy")
                    : "October 31, 2026"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 4 min read
                </span>
                <span>·</span>
                <span className="text-emerald-500 font-semibold">
                  {edition?.video_count || allItems.length} items distilled
                </span>
              </div>
            </div>

            {/* ── Editorial Masthead Title ── */}
            <div className="text-center pb-8 border-b border-border/50">
              <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-primary uppercase">
                THE CHRONICLE OF OPEN SOURCE, LOCAL AI &amp; VIBE CODING
              </span>
              <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground mt-2 mb-4 leading-none uppercase">
                NOTIFIED
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
                A high-signal weekly intelligence dossier synthesized from technical code releases, local LLM checkpoints, and developer workflows.
              </p>
            </div>

            {/* ── In This Issue: Category Pills Strip ── */}
            {categories.length > 0 && (
              <div className="py-4 border-b border-border/40 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
                <span className="text-muted-foreground font-semibold mr-1">Departments:</span>
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#mag-${cat.id}`}
                    className="px-3 py-1 rounded-full bg-muted/60 hover:bg-primary/15 hover:text-primary hover:border-primary/40 border border-border/50 transition-all flex items-center gap-1.5"
                  >
                    <span>{cat.emoji}</span>
                    <span className="font-semibold">{cat.badge}</span>
                    <span className="text-[10px] text-muted-foreground">({cat.items.length})</span>
                  </a>
                ))}
              </div>
            )}

            {/* ── 2. FEATURED COVER STORY (Lead Story Hero) ── */}
            {leadStory && (
              <section className="pt-10 pb-12 border-b border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Cover Story
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    ★ Editorial Spotlight
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Headline, TLDR, Pullquote, Links */}
                  <div className="lg:col-span-7 space-y-4">
                    <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                      <Link
                        href={`/drop/${leadStory.video_id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {leadStory.title}
                      </Link>
                    </h2>

                    <p className="text-base sm:text-lg text-foreground/90 font-sans leading-relaxed">
                      {leadStory.tldr}
                    </p>

                    {/* Pullquote Callout */}
                    {leadStory.why_it_matters && (
                      <div className="p-4 rounded-2xl bg-indigo-500/10 border-l-4 border-indigo-500 text-sm text-foreground/90 space-y-1">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">
                          Why It Matters To Developers:
                        </span>
                        <p className="italic font-serif text-sm sm:text-base leading-relaxed">
                          &ldquo;{leadStory.why_it_matters}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Action Pills */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <Link
                        href={`/drop/${leadStory.video_id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95"
                      >
                        <span>Full Dossier</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      {leadStory.repo_links?.[0] && (
                        <a
                          href={leadStory.repo_links[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-card border border-border/60 hover:border-primary/40 text-foreground transition-all"
                        >
                          <Github className="w-3.5 h-3.5 text-primary" />
                          <span>Inspect Code</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}

                      {leadStory.model_links?.[0] && (
                        <a
                          href={leadStory.model_links[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 transition-all"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Weights</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Key Takeaway Cards */}
                  <div className="lg:col-span-5 rounded-2xl bg-muted/40 border border-border/50 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-primary" />
                        Key Engineering Insights
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {leadStory.key_points?.length || 0} pts
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {leadStory.key_points?.map((pt, pidx) => (
                        <div key={pidx} className="flex items-start gap-2.5 text-xs text-foreground/85 leading-relaxed">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold shrink-0 mt-0.5">
                            {pidx + 1}
                          </span>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>

                    {leadStory.tags && leadStory.tags.length > 0 && (
                      <div className="pt-2 border-t border-border/30 flex flex-wrap gap-1.5 font-mono text-[10px]">
                        {leadStory.tags.map((t, tidx) => (
                          <span
                            key={tidx}
                            className="px-2 py-0.5 rounded-md bg-background/80 border border-border/40 text-muted-foreground"
                          >
                            #{t.toLowerCase().replace(/\s+/g, "")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── 3. SECONDARY MAGAZINE STORIES (2-Column Colored Grid) ── */}
            {secondaryStories.length > 0 && (
              <section className="pt-10 pb-12 border-b border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                      SECTION 02 · VERIFIED FIELD RELEASES
                    </span>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Engineering Dispatches
                    </h3>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {secondaryStories.length} reports
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {secondaryStories.map((story, idx) => {
                    // Vibrant category accent palette
                    const colorThemes = [
                      { badge: "bg-purple-500/10 text-purple-500 border-purple-500/30", bar: "bg-purple-500" },
                      { badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", bar: "bg-emerald-500" },
                      { badge: "bg-sky-500/10 text-sky-500 border-sky-500/30", bar: "bg-sky-500" },
                      { badge: "bg-amber-500/10 text-amber-500 border-amber-500/30", bar: "bg-amber-500" },
                    ];
                    const theme = colorThemes[idx % colorThemes.length];

                    return (
                      <article
                        key={story.video_id || idx}
                        className="group relative rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/40 transition-all p-5 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl"
                      >
                        {/* Top Color Accent Line */}
                        <div className={cn("absolute top-0 inset-x-0 h-1", theme.bar)} />

                        <div>
                          {/* Category Badge & Meta */}
                          <div className="flex items-center justify-between gap-2 mb-3 pt-1">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border",
                                theme.badge
                              )}
                            >
                              {story.category.replace("_", " ")}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {story.channel}
                            </span>
                          </div>

                          {/* Story Title */}
                          <h4 className="font-heading font-bold text-base sm:text-lg text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                            <Link href={`/drop/${story.video_id}`}>
                              {story.title}
                            </Link>
                          </h4>

                          {/* Summary */}
                          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans mb-4">
                            {story.tldr}
                          </p>

                          {/* Key Points */}
                          {story.key_points && story.key_points.length > 0 && (
                            <ul className="mb-4 space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/30 text-xs text-foreground/85">
                              {story.key_points.slice(0, 3).map((pt, pidx) => (
                                <li key={pidx} className="flex items-start gap-2">
                                  <span className="text-primary font-bold">›</span>
                                  <span className="line-clamp-2">{pt}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Action Buttons Row */}
                        <div className="pt-3 border-t border-border/30 flex items-center justify-between gap-2 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            {story.repo_links?.[0] && (
                              <a
                                href={story.repo_links[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                              >
                                <Github className="w-3.5 h-3.5" />
                                <span>Code</span>
                              </a>
                            )}
                            {story.model_links?.[0] && (
                              <a
                                href={story.model_links[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-500 hover:underline font-semibold"
                              >
                                <Cpu className="w-3.5 h-3.5" />
                                <span>Model</span>
                              </a>
                            )}
                          </div>

                          <Link
                            href={`/drop/${story.video_id}`}
                            className="text-foreground hover:text-primary font-semibold flex items-center gap-1"
                          >
                            <span>Read Report</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── 4. EXECUTIVE DIRECTORY INDEX (Magazine Table of Curated Artifacts) ── */}
            <section className="pt-10 pb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                    TABLE OF CONTENTS · REPRODUCIBILITY INDEX
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    Curated Artifacts Directory
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/50">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border/50 text-muted-foreground uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Item Title</th>
                      <th className="py-3 px-4">Domain</th>
                      <th className="py-3 px-4">Verified Links</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {allItems.map((item, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-sans font-semibold text-foreground max-w-xs truncate">
                          <Link href={`/drop/${item.video_id}`} className="hover:text-primary transition-colors">
                            {item.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-bold">
                            {item.category.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {item.repo_links?.[0] ? (
                              <a
                                href={item.repo_links[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                <Github className="w-3 h-3" />
                                <span>GitHub</span>
                              </a>
                            ) : null}
                            {item.model_links?.[0] ? (
                              <a
                                href={item.model_links[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-500 hover:underline flex items-center gap-1"
                              >
                                <Cpu className="w-3 h-3" />
                                <span>Weights</span>
                              </a>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/drop/${item.video_id}`}
                            className="text-foreground hover:text-primary inline-flex items-center gap-0.5 font-bold"
                          >
                            <span>Dossier</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── 5. MAGAZINE FOOTER CALLOUT ── */}
            <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-primary/15 via-purple-500/10 to-primary/10 border border-primary/25 text-center relative overflow-hidden">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary mb-2 block">
                DELIVERED DIRECT TO YOUR WORKFLOW
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-black mb-2 tracking-tight text-foreground">
                Get Next Week&apos;s Dispatch in Your Inbox
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-5 font-sans leading-relaxed">
                Zero YouTube rabbit holes. Handpicked open-source codebases and local weights every Friday at 5:00 PM IST.
              </p>
              <SubscribeModal>
                <Button size="lg" className="rounded-xl px-7 font-bold text-xs h-10 shadow-lg bg-primary text-primary-foreground hover:shadow-primary/30 transition-all">
                  Subscribe to Skill Letter Free
                </Button>
              </SubscribeModal>
            </div>

          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════ */
        /*  2. ORIGINAL CLASSIC INTEL VIEW (100% UNTOUCHED ORIGINAL)        */
        /* ══════════════════════════════════════════════════════════════════ */
        <div>
          {/* ── EDITORIAL HEADER ── */}
          <header className="pt-28 pb-12 sm:pt-36 sm:pb-16 border-b border-border/40 bg-card/20 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                    DISPATCH #{edition?.edition_number || 1}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {edition?.generated_at ? format(new Date(edition.generated_at), "MMMM d, yyyy") : "October 30, 2026"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 4 min read
                  </span>
                  <span>·</span>
                  <span>{edition?.video_count || 19} items distilled</span>
                </div>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-6">
                {edition?.title || "TechPulse: Weekly Technical Intel"}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans mb-8 max-w-3xl">
                A high-signal digest synthesized from this week&apos;s technical releases, code repositories, and local model checkpoints. Built for developers who want the insights without watching dozens of videos.
              </p>

              {/* Quick Subscribe Bar inline */}
              <div className="p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Subscribe to this weekly digest</p>
                    <p className="text-[11px] text-muted-foreground">Choose your frequency: Daily, 2x/week, 5x/week, or Weekly (Fridays 5PM IST).</p>
                  </div>
                </div>

                <SubscribeModal>
                  <Button size="sm" className="rounded-xl px-4 h-9 font-semibold text-xs shrink-0 bg-primary text-primary-foreground shadow-xs">
                    Subscribe Free
                  </Button>
                </SubscribeModal>
              </div>
            </div>
          </header>

          {/* ── EDITORIAL CONTENT BODY ── */}
          <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
            {/* Table of contents quick jumps */}
            {categories.length > 1 && (
              <nav className="mb-14 p-4 rounded-2xl bg-muted/30 border border-border/40 flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-muted-foreground font-sans font-semibold mr-2">In this issue:</span>
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className="px-2.5 py-1 rounded-lg bg-card/60 hover:bg-card border border-border/50 text-foreground transition-all hover:border-primary/40 flex items-center gap-1.5"
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.badge}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">({cat.items.length})</span>
                  </a>
                ))}
              </nav>
            )}

            {/* Categorized Technical Briefs */}
            <div className="space-y-16">
              {categories.map((category) => (
                <section key={category.id} id={category.id} className="scroll-mt-24 space-y-6">
                  {/* Category Header */}
                  <div className="pb-3 border-b border-border/40 flex items-end justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{category.emoji}</span>
                        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                          {category.title}
                        </h2>
                      </div>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {category.items.length} {category.items.length === 1 ? "entry" : "entries"}
                    </Badge>
                  </div>

                  {/* Items List (Article style) */}
                  <div className="space-y-6">
                    {category.items.map((item, idx) => (
                      <article
                        key={item.video_id || idx}
                        className="p-5 sm:p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/30 hover:bg-card/70 transition-all duration-200"
                      >
                        {/* Item Title & Direct Links */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                          <h3 className="font-heading font-bold text-base sm:text-lg text-foreground leading-snug">
                            <Link
                              href={`/drop/${item.video_id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {item.title}
                            </Link>
                          </h3>

                          <div className="flex items-center gap-2 shrink-0 pt-0.5">
                            <Link
                              href={`/drop/${item.video_id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                            >
                              <span>Breakdown</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>

                            {item.repo_links && item.repo_links.length > 0 && (
                              <a
                                href={item.repo_links[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-muted/80 hover:bg-primary/10 hover:text-primary transition-colors border border-border/40"
                              >
                                <Github className="w-3.5 h-3.5" />
                                <span>GitHub</span>
                                <ArrowUpRight className="w-3 h-3 opacity-60" />
                              </a>
                            )}

                            {item.model_links && item.model_links.length > 0 && (
                              <a
                                href={item.model_links[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-muted/80 hover:bg-primary/10 hover:text-primary transition-colors border border-border/40"
                              >
                                <Cpu className="w-3.5 h-3.5" />
                                <span>Weights</span>
                                <ArrowUpRight className="w-3 h-3 opacity-60" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Summary TLDR */}
                        <p className="text-sm text-foreground/90 leading-relaxed font-sans mb-4">
                          {item.tldr}
                        </p>

                        {/* Key Takeaways */}
                        {item.key_points && item.key_points.length > 0 && (
                          <div className="mb-4 p-3.5 rounded-xl bg-muted/30 border border-border/30 space-y-1.5">
                            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                              Key Insights &amp; Capabilities:
                            </p>
                            <ul className="space-y-1">
                              {item.key_points.map((pt, pidx) => (
                                <li key={pidx} className="flex items-start gap-2 text-xs text-foreground/80 leading-normal">
                                  <span className="text-primary font-bold">›</span>
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Why this matters callout */}
                        {item.why_it_matters && (
                          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-foreground/90 font-sans mb-3">
                            <span className="font-semibold text-primary font-mono text-[11px] uppercase tracking-wide mr-1.5">
                              Why it matters:
                            </span>
                            {item.why_it_matters}
                          </div>
                        )}

                        {/* Bottom Meta & Reference Footnote */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/20 text-[11px] text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-1.5 font-mono">
                            {item.tags?.map((t, tidx) => (
                              <span key={tidx} className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/30">
                                #{t.toLowerCase().replace(/\s+/g, "")}
                              </span>
                            ))}
                          </div>

                          <Link
                            href={`/drop/${item.video_id}`}
                            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-mono transition-colors font-semibold"
                          >
                            <span>Read full breakdown</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* ── FOOTER CALLOUT ── */}
            <div className="mt-20 p-8 rounded-3xl bg-gradient-to-b from-card/80 to-card/30 border border-border/50 text-center relative overflow-hidden">
              <h3 className="font-heading text-xl sm:text-2xl font-bold mb-2 tracking-tight">
                Want next week&apos;s briefing in your inbox?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-5 font-sans">
                Every Friday at 5:00 PM IST. Direct repository links, no algorithmic noise.
              </p>
              <SubscribeModal>
                <Button size="lg" className="rounded-xl px-7 font-semibold text-xs h-10 shadow-md">
                  Subscribe to Newsletter
                </Button>
              </SubscribeModal>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
