"use client";

import { use } from "react";
import { Newspaper } from "lucide-react";
import useSWR from "swr";
import { ApiError, getEdition, type NewsletterEdition } from "@/lib/api";
import { DigestReader } from "@/components/digest/digest-reader";
import { EmptyState, ErrorState } from "@/components/content/states";
import { PageContainer } from "@/components/layout/page-header";

export default function EditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const num = Number(id);
  const { data, error, isLoading, mutate } = useSWR<NewsletterEdition, ApiError>(Number.isFinite(num) ? ["edition", num] : null, () => getEdition(num), { revalidateOnFocus: false, shouldRetryOnError: false });

  if (!Number.isFinite(num) || error?.status === 404) {
    return (
      <PageContainer>
        <EmptyState icon={Newspaper} title="Edition not found" body="This edition doesn't exist or was removed." />
      </PageContainer>
    );
  }
  if (isLoading) {
    return (
      <PageContainer narrow>
        <div role="status" aria-label="Loading edition" className="space-y-4">
          <div className="bn-skeleton h-4 w-40" />
          <div className="bn-skeleton h-14 w-full" />
          <div className="bn-skeleton mt-10 h-40 w-full" />
        </div>
      </PageContainer>
    );
  }
  if (error || !data) {
    return (
      <PageContainer>
        <ErrorState error={error} onRetry={() => mutate()} />
      </PageContainer>
    );
  }
  return <DigestReader edition={data} />;
}
