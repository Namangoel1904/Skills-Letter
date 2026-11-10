"use client";

/**
 * Shared client data hooks.
 *  - useCorpus: every curated item across editions (real backend data, deduped by video_id)
 *  - useSaved: persisted bookmarks (browser localStorage — the backend has no user accounts)
 */
import { useCallback, useMemo, useSyncExternalStore } from "react";
import useSWR from "swr";
import { getAllEditions, type NewsletterEdition, type VideoSummary } from "@/lib/api";

export interface CorpusItem extends VideoSummary {
  edition_id: number;
  edition_number: number;
  edition_title: string;
  edition_date: string;
}

export function flattenEditions(editions: NewsletterEdition[]): CorpusItem[] {
  const seen = new Set<string>();
  const out: CorpusItem[] = [];
  // editions arrive newest-first, so the newest copy of a video wins
  for (const e of editions) {
    for (const v of e.videos ?? []) {
      if (!v?.video_id || seen.has(v.video_id)) continue;
      seen.add(v.video_id);
      out.push({ ...v, edition_id: e.id, edition_number: e.edition_number, edition_title: e.title, edition_date: e.generated_at });
    }
  }
  return out;
}

export function useCorpus() {
  const { data, error, isLoading, mutate } = useSWR<NewsletterEdition[]>("corpus", () => getAllEditions(100), {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
  const items = useMemo(() => (data ? flattenEditions(data) : []), [data]);
  return { editions: data ?? [], items, error: error as Error | undefined, isLoading, retry: () => mutate() };
}

export function readingMinutes(item: Pick<VideoSummary, "tldr" | "key_points" | "why_it_matters">): number {
  const words = [item.tldr, item.why_it_matters ?? "", ...(item.key_points ?? [])].join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

// ── Saved items ──────────────────────────────────────────────────────────
const SAVED_KEY = "bn:saved:v1";
const listeners = new Set<() => void>();
let cache: { raw: string | null; parsed: CorpusItem[] } = { raw: null, parsed: [] };

function readSaved(): CorpusItem[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (raw === cache.raw) return cache.parsed;
    cache = { raw, parsed: raw ? (JSON.parse(raw) as CorpusItem[]) : [] };
    return cache.parsed;
  } catch {
    return cache.parsed;
  }
}
const EMPTY: CorpusItem[] = [];

export function useSaved() {
  const saved = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    readSaved,
    () => EMPTY
  );
  const write = useCallback((next: CorpusItem[]) => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — ignore */
    }
    listeners.forEach((l) => l());
  }, []);
  const isSaved = useCallback((id: string) => saved.some((s) => s.video_id === id), [saved]);
  const toggle = useCallback(
    (item: CorpusItem) => {
      const cur = readSaved();
      const exists = cur.some((s) => s.video_id === item.video_id);
      write(exists ? cur.filter((s) => s.video_id !== item.video_id) : [item, ...cur]);
      return !exists;
    },
    [write]
  );
  const clear = useCallback(() => write([]), [write]);
  return { saved, isSaved, toggle, clear };
}
