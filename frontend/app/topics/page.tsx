"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Hash, Orbit } from "lucide-react";
import { useCorpus } from "@/lib/hooks";
import { CATEGORY_BLURB, CATEGORY_LABEL, CATEGORY_ORDER, normalizeTag } from "@/lib/topics";
import { EmptyState, ErrorState } from "@/components/content/states";
import { PageContainer, PageHeader } from "@/components/layout/page-header";

const Constellation = dynamic(() => import("@/components/content/constellation"), { ssr: false, loading: () => <div className="bn-skeleton aspect-[4/3] w-full" aria-hidden /> });

export default function TopicsPage() {
  const { items, isLoading, error, retry } = useCorpus();
  const [showMap, setShowMap] = useState(false);

  const tags = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    for (const it of items)
      for (const t of it.tags ?? []) {
        const k = normalizeTag(t);
        if (!k) continue;
        const c = m.get(k) ?? { label: t, n: 0 };
        c.n++;
        m.set(k, c);
      }
    return [...m.values()].sort((a, b) => b.n - a.n);
  }, [items]);

  return (
    <PageContainer>
      <PageHeader eyebrow="Topics" title="Browse by topic" description="Topic collections built from the categories and tags the AI assigned to each video." />
      {error ? (
        <ErrorState error={error} onRetry={retry} />
      ) : !isLoading && items.length === 0 ? (
        <EmptyState icon={Hash} title="No topics yet" body="Topics are derived from generated digests." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {CATEGORY_ORDER.map((c) => {
              const n = items.filter((i) => i.category === c).length;
              if (!isLoading && n === 0) return null;
              return (
                <div key={c} className="rounded-2xl border border-border bg-card p-5">
                  <p className="font-mono text-xs text-primary">{isLoading ? "…" : `${n} breakdown${n === 1 ? "" : "s"}`}</p>
                  <h2 className="mt-1 text-lg font-semibold"><Link href={`/discover?cat=${c}`} className="hover:text-primary">{CATEGORY_LABEL[c]}</Link></h2>
                  <p className="mt-1 text-sm text-muted-foreground">{CATEGORY_BLURB[c]}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {items.filter((i) => i.category === c).flatMap((i) => i.tags ?? []).filter((t, idx, a) => a.findIndex((x) => normalizeTag(x) === normalizeTag(t)) === idx).slice(0, 5).map((t) => (
                      <Link key={t} href={`/discover?tag=${encodeURIComponent(t)}`} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-primary/15 hover:text-primary">{t}</Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="mb-4 mt-12 text-xl font-semibold">All tags</h2>
          <div className="flex flex-wrap gap-2">
            {isLoading && Array.from({ length: 10 }, (_, i) => <span key={i} className="bn-skeleton h-8 w-24 rounded-full" aria-hidden />)}
            {tags.map((t) => (
              <Link key={t.label} href={`/discover?tag=${encodeURIComponent(t.label)}`} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-sm hover:border-primary hover:text-primary">
                {t.label}<span className="text-xs text-muted-foreground">{t.n}</span>
              </Link>
            ))}
          </div>

          <section className="mt-12 rounded-3xl border border-border bg-elevated p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold"><Orbit className="size-5 text-primary" />Knowledge constellation</h2>
                <p className="mt-1 text-sm text-muted-foreground">Topics and tags linked only where they co-occur in your digests.</p>
              </div>
              <button onClick={() => setShowMap((s) => !s)} aria-expanded={showMap} className="h-9 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted">{showMap ? "Hide" : "Explore"}</button>
            </div>
            {showMap && <div className="mt-6"><Constellation items={items} /></div>}
          </section>
        </>
      )}
    </PageContainer>
  );
}
