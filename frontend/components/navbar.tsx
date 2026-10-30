"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles, Terminal, BellRing, ArrowUpRight, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SubscribeModal } from "@/components/subscribe-modal";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/70 backdrop-blur-2xl border-b border-border/40 shadow-[0_2px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_25px_rgba(0,0,0,0.4)]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-b from-primary/80 to-primary text-primary-foreground shadow-[0_1px_12px_rgba(99,102,241,0.35)] ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
              TechPulse
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 leading-none">
                PRO
              </span>
            </span>
          </div>
        </Link>

        {/* Center navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-muted/40 border border-border/50 backdrop-blur-md text-xs font-medium text-muted-foreground">
          <Link
            href="/"
            className="px-4 py-1.5 rounded-full text-foreground hover:bg-background/80 transition-all shadow-xs"
          >
            Latest Intel
          </Link>
          <Link
            href="/archive"
            className="px-4 py-1.5 rounded-full hover:text-foreground hover:bg-background/50 transition-all"
          >
            All Editions
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full hover:text-foreground hover:bg-background/50 transition-all inline-flex items-center gap-1"
          >
            GitHub Gems
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>
          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-full hover:text-primary hover:bg-background/50 transition-all inline-flex items-center gap-1.5 font-mono text-[11px] text-foreground/80 font-semibold"
          >
            <Shield className="w-3 h-3 text-primary" />
            Console
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {/* Theme switcher */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}

          {/* Subscribe CTA */}
          <SubscribeModal>
            <Button
              size="sm"
              className="rounded-xl px-4 font-semibold text-xs h-9 bg-primary text-primary-foreground shadow-[0_2px_14px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.5)] transition-all active:scale-95"
            >
              <BellRing className="w-3.5 h-3.5 mr-1.5" />
              Subscribe
            </Button>
          </SubscribeModal>
        </div>
      </div>
    </header>
  );
}
