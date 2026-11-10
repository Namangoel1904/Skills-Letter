"use client";

import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { useSaved } from "@/lib/hooks";
import { LibraryView } from "@/components/content/library-view";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { toast } from "@/components/ui/toaster";

export default function SavedPage() {
  const { saved, clear } = useSaved();
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Saved"
        title="Your saved breakdowns"
        description="Bookmarks are stored in this browser. They don't need an account and aren't synced across devices."
        actions={
          saved.length > 0 ? (
            <button
              onClick={() => {
                clear();
                toast({ title: "Saved items cleared" });
              }}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm hover:bg-muted"
            >
              <Trash2 className="size-4" /> Clear all
            </button>
          ) : undefined
        }
      />
      <LibraryView
        items={saved}
        idPrefix="saved"
        empty={{
          icon: Bookmark,
          title: "Nothing saved yet",
          body: "Tap the bookmark on any breakdown to keep it here.",
          action: (
            <Link href="/discover" className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
              Discover content
            </Link>
          ),
        }}
      />
    </PageContainer>
  );
}
