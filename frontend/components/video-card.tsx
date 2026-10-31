import Image from "next/image";
import Link from "next/link";
import { Github, Cpu, Box, Sparkles, Layers, ArrowRight, ExternalLink } from "lucide-react";
import { type VideoSummary, CATEGORY_META } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface VideoCardProps {
  video: VideoSummary;
}

const CATEGORY_ICONS = {
  github_repo: Github,
  llm_model: Cpu,
  skill_tool: Sparkles,
  ui_ux: Layers,
  other: Box,
};

export function VideoCard({ video }: VideoCardProps) {
  const meta = CATEGORY_META[video.category] || CATEGORY_META.other;
  const Icon = CATEGORY_ICONS[video.category as keyof typeof CATEGORY_ICONS] || Box;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 transition-all duration-300 hover:border-primary/50 hover:bg-card/90 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      <div>
        {/* Constrained thumbnail container - clicking navigates to the dedicated breakdown page */}
        <Link
          href={`/drop/${video.video_id}`}
          className="relative block h-44 w-full overflow-hidden rounded-xl bg-muted/40 border border-border/30 cursor-pointer"
        >
          {video.thumbnail_url ? (
            <Image
              src={video.thumbnail_url}
              alt={video.title}
              fill
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/20">
              <Icon className="w-8 h-8 text-muted-foreground/40" />
            </div>
          )}

          {/* Category pill */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge
              variant="secondary"
              className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase font-semibold backdrop-blur-md bg-background/85 border border-border/50 text-foreground shadow-xs"
            >
              <Icon className="w-3 h-3 mr-1 text-primary" />
              {meta.label}
            </Badge>
          </div>

          {/* Breakdown hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
            <div className="px-3.5 py-1.5 rounded-xl bg-background/90 text-foreground text-xs font-semibold shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
              <span>Read Full Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        </Link>

        {/* Card info */}
        <div className="pt-3.5 space-y-2.5">
          {/* Card Title - links to dedicated drop page */}
          <Link
            href={`/drop/${video.video_id}`}
            className="font-heading font-semibold text-sm sm:text-base leading-snug tracking-tight text-foreground hover:text-primary transition-colors line-clamp-2 block cursor-pointer"
          >
            {video.title}
          </Link>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {video.tldr || "Curated and extracted from this week's technical sessions."}
          </p>

          {/* Key Insights bullet list - clean wrap without premature clipping */}
          {video.key_points && video.key_points.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {video.key_points.slice(0, 2).map((point, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-foreground/80 leading-snug">
                  <span className="text-primary font-bold text-xs shrink-0 mt-0.5">›</span>
                  <span className="line-clamp-2">{point}</span>
                </div>
              ))}
            </div>
          )}

          {/* Why it matters callout */}
          {video.why_it_matters && (
            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 text-[11px] text-foreground/90 font-medium">
              <span className="font-semibold text-primary">Why it matters: </span>
              <span className="line-clamp-3">{video.why_it_matters}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action & Footer */}
      <div className="pt-3 mt-3 border-t border-border/30 space-y-2.5">
        <Link
          href={`/drop/${video.video_id}`}
          className="flex items-center justify-between w-full py-1.5 px-2.5 rounded-lg bg-muted/40 hover:bg-primary/10 hover:text-primary text-xs font-medium text-foreground/80 transition-colors border border-border/20 group/btn"
        >
          <span>Read Full Breakdown</span>
          <ArrowRight className="w-3.5 h-3.5 text-primary group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {video.tags?.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/20"
              >
                #{tag.toLowerCase().replace(/\s+/g, "")}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {video.repo_links && video.repo_links.length > 0 && (
              <a
                href={video.repo_links[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors inline-flex items-center gap-1 text-[11px] font-mono"
                title="GitHub Repo"
              >
                <Github className="w-3.5 h-3.5" />
                <span className="sr-only sm:not-sr-only">Repo</span>
              </a>
            )}
            {video.model_links && video.model_links.length > 0 && (
              <a
                href={video.model_links[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors inline-flex items-center gap-1 text-[11px] font-mono"
                title="Model Weights"
              >
                <Cpu className="w-3.5 h-3.5 text-violet-500" />
                <span className="sr-only sm:not-sr-only">Weights</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
