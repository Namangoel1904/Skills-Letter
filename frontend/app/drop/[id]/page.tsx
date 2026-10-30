import { getDropDetail, CATEGORY_META } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Github, 
  Cpu, 
  Box, 
  Sparkles, 
  Layers, 
  Calendar, 
  Clock, 
  ExternalLink, 
  ArrowUpRight, 
  Play, 
  Share2, 
  CheckCircle2, 
  ChevronRight 
} from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubscribeModal } from "@/components/subscribe-modal";
import { format } from "date-fns";

interface DropPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DropPageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = await getDropDetail(id).catch(() => null);
  if (!detail || !detail.item) {
    return { title: "Drop Not Found" };
  }
  return {
    title: `${detail.item.title} — TechPulse`,
    description: detail.item.tldr,
  };
}

export const revalidate = 60;

export default async function DropDetailPage({ params }: DropPageProps) {
  const { id } = await params;
  const detail = await getDropDetail(id).catch(() => null);

  if (!detail || !detail.item) {
    notFound();
  }

  const { item, edition_id, edition_number, edition_title, edition_date } = detail;
  const meta = CATEGORY_META[item.category] || CATEGORY_META.other;

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link
            href={`/edition/${edition_id}`}
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Edition #{edition_number}
          </Link>
          <span>/</span>
          <Link href="/" className="hover:text-foreground transition-colors">
            All Dispatches
          </Link>
          <span>/</span>
          <span className="text-foreground/80 font-mono truncate max-w-xs">{item.title}</span>
        </div>

        {/* Header Hero Area */}
        <div className="space-y-6 pb-8 border-b border-border/40 mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className="px-3 py-1 text-xs font-mono tracking-wider uppercase font-semibold bg-primary/10 text-primary border border-primary/20"
            >
              {meta.emoji} {meta.label}
            </Badge>

            <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              {edition_date ? format(new Date(edition_date), "MMMM d, yyyy") : "October 2026"}
            </span>

            <span className="text-border">·</span>

            <span className="text-xs text-muted-foreground font-mono">
              From Edition #{edition_number}
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.18]">
            {item.title}
          </h1>

          {/* Quick Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {item.repo_links && item.repo_links.length > 0 && (
              <a
                href={item.repo_links[0]}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="h-10 px-5 rounded-xl font-semibold text-xs bg-foreground text-background hover:bg-foreground/90 transition-all shadow-sm">
                  <Github className="w-4 h-4 mr-2" />
                  View GitHub Repository
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-70" />
                </Button>
              </a>
            )}

            {item.model_links && item.model_links.length > 0 && (
              <a
                href={item.model_links[0]}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="h-10 px-5 rounded-xl font-semibold text-xs border-border/70">
                  <Cpu className="w-4 h-4 mr-2 text-violet-500" />
                  Download Model Weights
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-70" />
                </Button>
              </a>
            )}

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" className="h-10 px-4 rounded-xl text-xs text-muted-foreground hover:text-foreground">
                <Play className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Watch on YouTube
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </a>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-10">
          {/* Executive Summary (TLDR) */}
          <div className="p-6 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-xl shadow-xs space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
              Executive Summary
            </span>
            <p className="text-base sm:text-lg text-foreground font-sans leading-relaxed">
              {item.tldr}
            </p>
          </div>

          {/* Full Key Insights & Capabilities (Uncut) */}
          {item.key_points && item.key_points.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Key Capabilities & Technical Takeaways
              </h2>

              <div className="grid gap-3">
                {item.key_points.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border/40 bg-card/40 flex items-start gap-3 text-sm text-foreground/90 leading-relaxed font-sans"
                  >
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why It Matters for Developers (Uncut) */}
          {item.why_it_matters && (
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                Why It Matters For Builders
              </h3>
              <p className="text-sm sm:text-base text-foreground/90 font-sans leading-relaxed">
                {item.why_it_matters}
              </p>
            </div>
          )}

          {/* Extracted Links & Open Source Resources */}
          {((item.repo_links && item.repo_links.length > 0) || (item.model_links && item.model_links.length > 0)) && (
            <div className="space-y-4 pt-2">
              <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                <Github className="w-4 h-4 text-primary" />
                Referenced Codebases & Downloadable Artifacts
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                {item.repo_links?.map((link, idx) => (
                  <a
                    key={`repo-${idx}`}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/40 transition-all group flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        <Github className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">GitHub Repository</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                        {link.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                  </a>
                ))}

                {item.model_links?.map((link, idx) => (
                  <a
                    key={`model-${idx}`}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-violet-500/40 transition-all group flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground group-hover:text-violet-400 transition-colors">
                        <Cpu className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                        <span className="truncate">Model Weights / Checkpoint</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                        {link}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-400 shrink-0 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Direct Embedded Player Reference */}
          <div className="space-y-3 pt-6 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Original Source Recording
                </h3>
                <p className="text-xs text-muted-foreground">
                  Referenced from channel: <span className="font-medium text-foreground">{item.channel}</span>
                </p>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium font-mono"
              >
                <span>Open on YouTube</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Embedded responsive YouTube video */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border/50 bg-black/60 shadow-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${item.video_id}`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-4">
              <span className="text-xs text-muted-foreground mr-1">Tags:</span>
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-muted/60 text-muted-foreground border border-border/30"
                >
                  #{tag.toLowerCase().replace(/\s+/g, "")}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Newsletter Subscription CTA */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-b from-card/80 to-card/30 border border-border/50 text-center relative overflow-hidden">
            <h3 className="font-heading text-xl sm:text-2xl font-bold mb-2 tracking-tight">
              Get drops like this every week.
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mb-5 font-sans">
              Stay on top of local LLMs, developer skills, and top open-source tools.
            </p>
            <SubscribeModal>
              <Button size="lg" className="rounded-xl px-7 font-semibold text-xs h-10 shadow-md">
                Subscribe to TechPulse
              </Button>
            </SubscribeModal>
          </div>
        </div>
      </div>
    </div>
  );
}
