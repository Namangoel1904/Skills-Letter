"use client";

import { Newspaper } from "lucide-react";
import useSWR from "swr";
import { ApiError, getLatestEdition, type NewsletterEdition } from "@/lib/api";
import { DigestReader } from "@/components/digest/digest-reader";
import { EmptyState, ErrorState } from "@/components/content/states";
import { PageContainer } from "@/components/layout/page-header";

export default function LatestDigestPage() {
  const { data, error, isLoading, mutate } = useSWR<NewsletterEdition, ApiError>("latest-edition", () => getLatestEdition(), { revalidateOnFocus: false, shouldRetryOnError: false });

  if (isLoading) {
    return (
      <PageContainer narrow>
        <div role="status" aria-label="Loading digest" className="space-y-4">
          <div className="bn-skeleton h-4 w-40" />
          <div className="bn-skeleton h-14 w-full" />
          <div className="bn-skeleton h-14 w-2/3" />
          <div className="bn-skeleton mt-10 h-40 w-full" />
        </div>
      </PageContainer>
    );
  }
  if (error?.status === 404) {
    return (
      <PageContainer>
        <EmptyState icon={Newspaper} title="No digest yet" body="The first edition hasn't been generated. Check back after the next scheduled run." />
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
