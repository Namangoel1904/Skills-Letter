import { getEdition } from "@/lib/api";
import { VideoCard } from "@/components/video-card";
import { CATEGORY_META } from "@/lib/api";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Video, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const edition = await getEdition(Number(id)).catch(() => null);
  if (!edition) return { title: "Edition Not Found" };
  return {
    title: `${edition.title} — TechPulse`,
    description: `${edition.video_count} AI-summarised tech videos in Edition #${edition.edition_number}`,
  };
}

export const revalidate = 60;

export default async function EditionPage({ params }: PageProps) {
  const { id } = await params;
  const edition = await getEdition(Number(id)).catch(() => null);
  if (!edition) notFound();

  const categories = Object.keys(CATEGORY_META)
    .map((cat) => ({
      key: cat,
      meta: CATEGORY_META[cat as keyof typeof CATEGORY_META],
      videos: (edition.videos || []).filter((v) => v.category === cat),
    }))
    .filter((c) => c.videos.length > 0);

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <Link
          href="/archive"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Archives
        </Link>

        {/* Header Hero */}
        <div className="p-8 sm:p-12 rounded-3xl bg-card/40 border border-border/40 backdrop-blur-2xl relative overflow-hidden mb-16">
          <div className="absolute inset-0 bg-radial-[at_top_right] from-primary/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
              EDITION #{edition.edition_number}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(edition.generated_at), "MMMM d, yyyy")}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Video className="w-3 h-3" />
              {edition.video_count} Curated Drops
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {edition.title}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Everything extracted, synthesized, and tagged from this week's technical sessions.
          </p>
        </div>

        {/* Video Categories Grid */}
        <div className="space-y-16">
          {categories.map((cat) => (
            <div key={cat.key} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm">
                  {cat.meta.emoji}
                </div>
                <div>
                  <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    {cat.meta.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">{cat.meta.description}</p>
                </div>
                <Badge variant="secondary" className="ml-auto font-mono text-[11px]">
                  {cat.videos.length} drops
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.videos.map((video) => (
                  <VideoCard key={video.video_id} video={video} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
