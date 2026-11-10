"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { CorpusItem } from "@/lib/hooks";
import { CATEGORY_LABEL, CATEGORY_ORDER, normalizeTag } from "@/lib/topics";

/**
 * Knowledge constellation: inner ring = topic categories, outer ring = most frequent tags.
 * Edges only exist where a tag really appears on an item of that category.
 */
export default function Constellation({ items }: { items: CorpusItem[] }) {
  const router = useRouter();
  const [hover, setHover] = useState<string | null>(null);

  const graph = useMemo(() => {
    const cats = CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c));
    const tagCount = new Map<string, { label: string; n: number; cats: Set<string> }>();
    for (const it of items)
      for (const t of it.tags ?? []) {
        const k = normalizeTag(t);
        if (!k) continue;
        const cur = tagCount.get(k) ?? { label: t, n: 0, cats: new Set<string>() };
        cur.n++;
        cur.cats.add(it.category);
        tagCount.set(k, cur);
      }
    const tags = [...tagCount.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 18);
    const catNodes = cats.map((c, i) => {
      const a = (i / cats.length) * Math.PI * 2 - Math.PI / 2;
      return { id: c, label: CATEGORY_LABEL[c], x: Math.cos(a) * 110, y: Math.sin(a) * 110, n: items.filter((x) => x.category === c).length };
    });
    const tagNodes = tags.map(([k, v], i) => {
      const a = (i / tags.length) * Math.PI * 2 - Math.PI / 2;
      return { id: k, label: v.label, x: Math.cos(a) * 235, y: Math.sin(a) * 195, n: v.n, cats: v.cats };
    });
    return { catNodes, tagNodes };
  }, [items]);

  if (graph.tagNodes.length === 0) return <p className="text-sm text-muted-foreground">No tag metadata available to build a constellation yet.</p>;

  return (
    <svg viewBox="-330 -260 660 520" className="h-auto w-full" role="img" aria-label="Knowledge constellation connecting topics and tags">
      {graph.tagNodes.flatMap((t) =>
        graph.catNodes
          .filter((c) => t.cats.has(c.id))
          .map((c) => {
            const on = hover === t.id || hover === c.id;
            return <line key={`${t.id}-${c.id}`} x1={t.x} y1={t.y} x2={c.x} y2={c.y} stroke={on ? "var(--primary)" : "var(--border)"} strokeWidth={on ? 1.5 : 1} style={{ transition: "stroke .2s" }} />;
          })
      )}
      {graph.catNodes.map((c) => (
        <g key={c.id} onPointerEnter={() => setHover(c.id)} onPointerLeave={() => setHover(null)} onClick={() => router.push("/discover")} data-cursor="view" tabIndex={0} role="link" aria-label={`${c.label}, ${c.n} items`} onKeyDown={(e) => e.key === "Enter" && router.push("/discover")} className="outline-none">
          <motion.circle cx={c.x} cy={c.y} r={14 + Math.min(14, c.n)} fill="var(--primary)" fillOpacity={hover === c.id ? 0.9 : 0.75} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ transformOrigin: `${c.x}px ${c.y}px` }} transition={{ duration: 0.5 }} />
          <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff" pointerEvents="none">{c.label}</text>
        </g>
      ))}
      {graph.tagNodes.map((t) => (
        <g key={t.id} onPointerEnter={() => setHover(t.id)} onPointerLeave={() => setHover(null)} onClick={() => router.push(`/discover?tag=${encodeURIComponent(t.label)}`)} onKeyDown={(e) => e.key === "Enter" && router.push(`/discover?tag=${encodeURIComponent(t.label)}`)} tabIndex={0} role="link" aria-label={`${t.label}, ${t.n} items`} data-cursor="view" className="outline-none">
          <circle cx={t.x} cy={t.y} r={4 + Math.min(8, t.n * 1.5)} fill={hover === t.id ? "var(--primary)" : "var(--muted-foreground)"} fillOpacity={0.85} style={{ transition: "fill .2s" }} />
          <text x={t.x} y={t.y - 12 - Math.min(8, t.n * 1.5)} textAnchor="middle" fontSize={10} fill="var(--foreground)" fillOpacity={hover === t.id ? 1 : 0.7} pointerEvents="none">{t.label}</text>
        </g>
      ))}
    </svg>
  );
}
