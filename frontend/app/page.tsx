"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  BellRing,
} from "lucide-react";

import HeroText from "@/components/ui/hero-shutter-text";
import { UserCursor } from "@/components/ui/user-cursor";
import { BlobTextRevealButton } from "@/components/ui/blob-text-reveal";
import { IridescentSubscribeButton } from "@/components/ui/iridescent-subscribe-button";
import { SubscribeModal } from "@/components/subscribe-modal";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && (theme === "light" || resolvedTheme === "light");

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center select-none px-4 sm:px-6 cursor-default"
    >
      {/* ── 0. ORIGINKIT USER CURSOR (Velocity-Tilted Spring Tracker) ── */}
      <UserCursor
        name="Vibe Coder"
        color={isLight ? "#4f46e5" : "#6366f1"}
      />

      {/* ── 1. BACKGROUND VIDEO LOOP (High Transparency, Slight Overlay) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Dark Theme Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            isLight ? "opacity-0 pointer-events-none" : "opacity-90 dark:opacity-95"
          )}
          src="/videos/hero-dark.mp4"
        />

        {/* Light Theme Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            isLight ? "opacity-95" : "opacity-0 pointer-events-none"
          )}
          src="/videos/hero-light.mp4"
        />

        {/* High-transparency subtle glass wash (not covering the video) */}
        <div className="absolute inset-0 bg-background/20 dark:bg-background/30 [.cozy_&]:bg-[#dfebe5]/35 backdrop-blur-[3px] transition-colors duration-700" />

        {/* Soft edge vignette for focus */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.35)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      {/* ── 2. EDITORIAL HERO CARD (Replicating Latest Intel Layout faithfully) ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-4xl w-full mx-auto rounded-3xl p-6 sm:p-10 md:p-12 bg-card/75 dark:bg-card/70 [.cozy_&]:bg-[#dfebe5]/85 backdrop-blur-2xl border border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        {/* ── Top Meta Bar (Dispatch #3 · Date · Read time · Distilled items) ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
              DISPATCH #3
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              October 31, 2026
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 opacity-70" /> 4 min read
            </span>
            <span>·</span>
            <span>3 items distilled</span>
          </div>
        </div>

        {/* ── Main Text: BeingNotified - Skill Letter (Sleek font + Shutter Animation) ── */}
        <div className="mb-5">
          <HeroText
            text="BeingNotified - Skill Letter"
            align="left"
            sizeClassName="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.14]"
            showControl={false}
          />
        </div>

        {/* ── Subtitle (Anti-Doom Scrolling & High Signal Engineering Digest) ── */}
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed font-sans mb-8 max-w-3xl">
          A high-signal digest synthesized from this week&apos;s technical releases, code repositories, and local model checkpoints. Built for developers who want the insights without watching dozens of videos.
        </p>

        {/* ── Bottom Bar: Subscription Callout + Two Pills (Black & White) ── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-background/60 dark:bg-background/40 [.cozy_&]:bg-[#3c4a48]/10 border border-border/60 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-5">
          {/* Left info label */}
          <div className="flex items-center gap-3.5 text-left w-full lg:w-auto">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                Subscribe to this weekly digest
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Choose your frequency: Daily, 2x/week, 5x/week, or Weekly (Fridays 5PM IST).
              </p>
            </div>
          </div>

          {/* Right Two Pills: Black & White */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
            {/* Pill 1 (Black Pill): "Read Now!" with Blob Text Reveal animation */}
            <Link href="/latest" className="inline-block">
              <BlobTextRevealButton text="Read Now!" />
            </Link>

            {/* Pill 2 (White Pill): "Subscribe Free" with Chromatic Iridescent Glass orbit animation */}
            <SubscribeModal>
              <IridescentSubscribeButton text="Subscribe Free" />
            </SubscribeModal>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
