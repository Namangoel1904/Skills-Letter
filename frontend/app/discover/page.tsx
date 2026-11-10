"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Compass } from "lucide-react";
import { useCorpus } from "@/lib/hooks";
import { LibraryView } from "@/components/content/library-view";
import { PageContainer, PageHeader } from "@/components/layout/page-header";

function DiscoverInner() {
  const params = useSearchParams();
  const { items, isLoading, error, retry } = useCorpus();
  return (
    <LibraryView
      items={items}
      loading={isLoading}
      error={error}
      onRetry={retry}
      initialQuery={params.get("q") ?? ""}
      initialTag={params.get("tag") ?? ""}
      initialCategory={params.get("cat") ?? "all"}
      idPrefix="discover"
      empty={{ icon: Compass, title: "Nothing to discover yet", body: "Curated breakdowns appear here after the first digest is generated." }}
    />
  );
}

export default function DiscoverPage() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Discover" title="Everything we've distilled" description="Search every AI-curated breakdown across all digests." />
      <Suspense fallback={null}>
        <DiscoverInner />
      </Suspense>
    </PageContainer>
  );
}
