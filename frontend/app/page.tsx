import { getLatestEdition } from "@/lib/api";
import { SubscribeModal } from "@/components/subscribe-modal";
import { format } from "date-fns";
import { 
  Sparkles, 
  Terminal, 
  Github, 
  ExternalLink, 
  Cpu, 
  Layers, 
  BookOpen, 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  Share2, 
  BellRing,
  BookmarkCheck,
  Check
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export default async function HomePage() {
  const edition = await getLatestEdition().catch(() => null);

  // Group videos/items by category
  const categories = [
    {
      id: "github_repo",
      title: "Open Source Gems & Frameworks",
      badge: "Repositories",
      emoji: "🛠",
      description: "Direct links to production-ready open source codebases, UI kits, and developer tools.",
      items: (edition?.videos || []).filter((v) => v.category === "github_repo"),
    },
    {
      id: "llm_model",
      title: "Local Weights & Quantized Models",
      badge: "LLM Drops",
      emoji: "🤖",
      description: "Small footprint models you can run locally on your laptop without cloud GPUs.",
      items: (edition?.videos || []).filter((v) => v.category === "llm_model"),
    },
    {
      id: "skill_tool",
      title: "Agentic Skills & Cursor/Claude Prompts",
      badge: "Workflows",
      emoji: "✨",
      description: "Cursor rules, Claude instructions, and AntiGravity skill files to automate vibe-coding.",
      items: (edition?.videos || []).filter((v) => v.category === "skill_tool"),
    },
    {
      id: "ui_ux",
      title: "UI / UX & Component Libraries",
      badge: "Design Engineering",
      emoji: "🎨",
      description: "Shadcn expansions, micro-interactions, and high-craft web components.",
      items: (edition?.videos || []).filter((v) => v.category === "ui_ux"),
    },
    {
      id: "other",
      title: "Architectures & Technical Insights",
      badge: "Deep Dives",
      emoji: "📦",
      description: "Engineering concepts, system designs, and productivity hacks.",
      items: (edition?.videos || []).filter((v) => v.category === "other"),
    },
  ].filter((c) => c.items.length > 0);

  return (
    <div className="min-h-screen pb-24">
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
            A high-signal digest synthesized from this week's technical releases, code repositories, and local model checkpoints. Built for developers who want the insights without watching dozens of videos.
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
                          Key Insights & Capabilities:
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
            Want next week's briefing in your inbox?
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
  );
}
