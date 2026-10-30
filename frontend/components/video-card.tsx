import Image from "next/image";
import { Github, Cpu, Box, Sparkles, Layers, ArrowUpRight, Play, ExternalLink } from "lucide-react";
import { type VideoSummary, CATEGORY_META } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
        {/* Constrained thumbnail container with fixed height */}
        <div className="relative h-44 w-full overflow-hidden rounded-xl bg-muted/40 border border-border/30">
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
              <Play className="w-8 h-8 text-muted-foreground/40" />
            </div>
          )}

          {/* Category pill */}
          <div className="absolute top-2.5 left-2.5">
            <Badge
              variant="secondary"
              className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase font-semibold backdrop-blur-md bg-background/85 border border-border/50 text-foreground shadow-xs"
            >
              <Icon className="w-3 h-3 mr-1 text-primary" />
              {meta.label}
            </Badge>
          </div>

          {/* Quick YouTube direct link overlay */}
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
          >
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </a>
        </div>

        {/* Card info */}
        <div className="pt-3.5 space-y-2.5">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-heading font-semibold text-sm sm:text-base leading-snug tracking-tight text-foreground hover:text-primary transition-colors line-clamp-2 block"
          >
            {video.title}
          </a>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {video.tldr || "Curated and extracted from this week's technical sessions."}
          </p>

          {/* Key Insights bullet list */}
          {video.key_points && video.key_points.length > 0 && (
            <div className="space-y-1 pt-1">
              {video.key_points.slice(0, 2).map((point, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-foreground/80 leading-tight">
                  <span className="text-primary font-bold text-xs">›</span>
                  <span className="line-clamp-1">{point}</span>
                </div>
              ))}
            </div>
          )}

          {/* Why it matters callout */}
          {video.why_it_matters && (
            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 text-[11px] text-foreground/90 font-medium">
              <span className="font-semibold text-primary">Why it matters: </span>
              <span className="line-clamp-2">{video.why_it_matters}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="pt-3 mt-3 border-t border-border/30 flex items-center justify-between gap-2">
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
              className="p-1 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors"
              title="GitHub Repo"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 transition-colors font-medium"
          >
            Watch
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
