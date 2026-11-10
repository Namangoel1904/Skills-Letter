"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellRing, Menu, Moon, Search, Sun } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Magnetic } from "@/components/animation/magnetic";
import { useSubscribe } from "@/components/subscribe-modal";
import { useCorpus } from "@/lib/hooks";
import { cn, formatDate } from "@/lib/utils";
import { EASE } from "@/lib/motion";

const SEEN_KEY = "bn:last-seen-edition";

function SearchBox() {
  const router = useRouter();
  const { items } = useCorpus();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return items
      .filter((v) => [v.title, v.channel, v.tldr, ...(v.tags ?? [])].join(" ").toLowerCase().includes(t))
      .slice(0, 5);
  }, [q, items]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    inputRef.current?.blur();
    router.push(t ? `/discover?q=${encodeURIComponent(t)}` : "/discover");
  };

  return (
    <form onSubmit={submit} role="search" className="relative mx-auto w-full max-w-xl">
      <div
        className={cn(
          "flex h-10 items-center gap-2 rounded-full border bg-elevated px-4 transition-all duration-200",
          focused ? "border-primary/70 shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_18%,transparent)]" : "border-border"
        )}
      >
        <Search className={cn("size-4 shrink-0 transition-colors", focused ? "text-primary" : "text-muted-foreground")} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder="Search insights, channels, topics"
          aria-label="Search curated insights"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground sm:block">/</kbd>
      </div>
      <AnimatePresence>
        {focused && matches.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: EASE.out }}
            className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl"
          >
            {matches.map((m) => (
              <li key={m.video_id}>
                <Link href={`/drop/${m.video_id}`} className="block rounded-lg px-3 py-2 hover:bg-muted">
                  <span className="line-clamp-1 text-sm font-medium">{m.title}</span>
                  <span className="text-xs text-muted-foreground">{m.channel}</span>
                </Link>
              </li>
            ))}
            <li>
              <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-xs text-primary hover:bg-muted">
                See all results for &ldquo;{q.trim()}&rdquo;
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </form>
  );
}

function Notifications() {
  const { editions } = useCorpus();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<string | null>("init");
  const ref = useRef<HTMLDivElement>(null);
  const latest = editions[0];

  useEffect(() => {
    try {
      setSeen(localStorage.getItem(SEEN_KEY));
    } catch {
      setSeen(null);
    }
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const unread = !!latest && seen !== "init" && seen !== String(latest.id);
  const toggle = () => {
    setOpen((o) => !o);
    if (latest) {
      try {
        localStorage.setItem(SEEN_KEY, String(latest.id));
      } catch {
        /* ignore */
      }
      window.setTimeout(() => setSeen(String(latest.id)), 600);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={toggle} aria-label={unread ? "Notifications, new digest available" : "Notifications"} aria-expanded={open} className="relative grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <Bell className="size-[18px]" />
        {unread && <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: EASE.out }}
            className="absolute right-0 top-11 z-50 w-72 origin-top-right rounded-xl border border-border bg-popover p-2 shadow-xl"
          >
            <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Recent digests</p>
            {editions.length === 0 && <p className="px-2 py-3 text-sm text-muted-foreground">No digests have been generated yet.</p>}
            {editions.slice(0, 3).map((e) => (
              <Link key={e.id} href={`/edition/${e.id}`} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2 hover:bg-muted">
                <span className="line-clamp-1 text-sm font-medium">{e.title}</span>
                <span className="text-xs text-muted-foreground">
                  Edition #{e.edition_number} · {formatDate(e.generated_at)} · {e.video_count} videos
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme !== "light";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-9 place-items-center overflow-hidden rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={dark ? "moon" : "sun"} initial={{ y: 14, rotate: -40, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} exit={{ y: -14, rotate: 40, opacity: 0 }} transition={{ duration: 0.18 }}>
          {dark ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Topbar({ onMenu, onToggleCollapse }: { onMenu: () => void; onToggleCollapse: () => void }) {
  const { open } = useSubscribe();
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-xl sm:gap-4 sm:px-4">
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button onClick={onMenu} aria-label="Open navigation" className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden">
          <Menu className="size-5" />
        </button>
        <button onClick={onToggleCollapse} aria-label="Collapse or expand sidebar" className="hidden size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground lg:grid">
          <Menu className="size-5" />
        </button>
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="BeingNotified home">
          <span id="nav-logo-mark" className="inline-block transition-opacity duration-300 [html[data-intro=play]_&]:opacity-0">
            <motion.span whileHover={{ rotate: -8, scale: 1.06 }} transition={{ duration: 0.2 }} className="block">
              <BrandMark size={28} />
            </motion.span>
          </span>
          <span className="hidden text-[15px] sm:block">
            Being<span className="text-primary">Notified</span>
          </span>
        </Link>
      </div>

      <div className="min-w-0 flex-1">
        <SearchBox />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Notifications />
        <ThemeToggle />
        <Magnetic>
          <button onClick={open} className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent-hover sm:px-4">
            <BellRing className="size-4" />
            <span className="hidden sm:inline">Subscribe</span>
          </button>
        </Magnetic>
      </div>
    </header>
  );
}
