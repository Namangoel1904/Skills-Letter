import { getEditions } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import { Sparkles, ArrowRight, Calendar, Video, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Archive — All Editions" };
export const revalidate = 60;

export default async function ArchivePage() {
  const editions = await getEditions(0, 50).catch(() => []);

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Latest Edition
        </Link>

        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-widest text-primary border-primary/20 mb-3">
            Archives
          </Badge>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            All Published Dispatches
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete repository of historical AI-distilled tech recommendations.
          </p>
        </div>

        {/* Editions list */}
        {editions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 p-16 text-center">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4 opacity-40" />
            <p className="text-sm text-muted-foreground">No editions published yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {editions.map((edition) => (
              <Link key={edition.id} href={`/edition/${edition.id}`} className="block group">
                <Card className="rounded-2xl border-border/40 bg-card/40 backdrop-blur-xl hover:border-primary/40 hover:bg-card/70 transition-all duration-300 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-heading font-bold text-sm text-primary group-hover:scale-105 transition-transform">
                      #{edition.edition_number}
                    </div>

                    <div>
                      <h2 className="font-heading font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                        {edition.title}
                      </h2>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(edition.generated_at), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {edition.video_count} videos
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform sm:self-center">
                    <span>Read edition</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
