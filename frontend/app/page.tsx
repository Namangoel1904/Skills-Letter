"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  BellRing,
  ShieldCheck,
  Star,
} from "lucide-react";

import HeroText from "@/components/ui/hero-shutter-text";
import { UserCursor } from "@/components/ui/user-cursor";
import { BlobTextRevealButton } from "@/components/ui/blob-text-reveal";
import { IridescentSubscribeButton } from "@/components/ui/iridescent-subscribe-button";
import {
  PixelRippleTransition,
  type PixelRippleHandle,
} from "@/components/ui/pixel-ripple-transition";
import { SubscribeModal } from "@/components/subscribe-modal";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<PixelRippleHandle>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && (theme === "light" || resolvedTheme === "light");

  const handleReadNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;

    if (rippleRef.current) {
      rippleRef.current.trigger(x, y, () => {
        router.push("/latest");
      });
    } else {
      router.push("/latest");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center select-none px-4 sm:px-8 lg:px-12 cursor-default"
    >
      {/* ── 0. HARDWARE ACCELERATED PIXEL RIPPLE TRANSITION OVERLAY ── */}
      <PixelRippleTransition ref={rippleRef} />

      {/* ── 0. ORIGINKIT USER CURSOR (Velocity-Tilted Spring Tracker) ── */}
      <UserCursor
        name="Vibe Coder"
        color={isLight ? "#4f46e5" : "#6366f1"}
      />

      {/* ── 1. BACKGROUND VIDEO LOOP (High Transparency, Subtle Overlay) ── */}
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

        {/* High-transparency subtle glass wash (video remains clearly visible) */}
        <div className="absolute inset-0 bg-background/25 dark:bg-background/35 [.cozy_&]:bg-[#dfebe5]/40 backdrop-blur-[2px] transition-colors duration-700" />

        {/* Soft edge radial vignette for crisp text contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.3)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* ── 2. HERO CONTENT LAYER (No Box Card — Directly Over Glassmorphism Overlay) ── */}
      <div className="relative z-10 max-w-4xl w-full mx-auto flex flex-col justify-center items-start text-left space-y-6 sm:space-y-7">
        {/* Top Metadata Pill Bar (Dispatch #3 · Date · Read time · Distilled items) */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-4 w-full"
        >
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/15 text-primary border border-primary/25 backdrop-blur-md shadow-xs">
              DISPATCH #3
            </span>
            <span className="text-xs text-foreground/80 dark:text-zinc-300 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 opacity-80" />
              October 31, 2026
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-foreground/80 dark:text-zinc-300 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 opacity-80" /> 4 min read
            </span>
            <span>·</span>
            <span>3 items distilled</span>
          </div>
        </motion.div>

        {/* Main Text: BeingNotified - Skill Letter (Sleek font + Shutter Animation) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="w-full"
        >
          <HeroText
            text="BeingNotified - Skill Letter"
            align="left"
            sizeClassName="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.12] drop-shadow-sm"
            showControl={false}
          />
        </motion.div>

        {/* Updated Subtitle: Explaining BeingNotified & Eliminating YouTube Doom-Scrolling */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-foreground/90 dark:text-zinc-200 [.cozy_&]:text-[#3c4a48] font-normal leading-relaxed max-w-3xl drop-shadow-xs"
        >
          Stop YouTube doom-scrolling. <strong className="font-semibold text-foreground dark:text-white">BeingNotified</strong> filters through 100+ weekly developer releases, trending open-source repositories, and local AI model weights to deliver handpicked, high-signal engineering intelligence straight to your workflow in a verified 4-minute read. No algorithmic traps, no clickbait—pure code &amp; weights.
        </motion.p>

        {/* Bottom Bar: Subscription Callout + Two Action Pills (Black & White) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full p-4 sm:p-5 rounded-2xl bg-background/55 dark:bg-zinc-950/50 [.cozy_&]:bg-[#3c4a48]/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-5"
        >
          {/* Left info label */}
          <div className="flex items-center gap-3.5 text-left w-full lg:w-auto">
            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 border border-primary/25">
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

          {/* Right Two Pills: Black (Read Now! with Pixelated Ripple) & White (Iridescent Subscribe) */}
          <div className="flex flex-wrap items-center gap-3.5 shrink-0 w-full sm:w-auto justify-end">
            {/* Pill 1 (Black Pill): "Read Now!" with Blob Text Reveal & Transitioning Pixelated Ripple */}
            <div onClick={handleReadNowClick} className="inline-block cursor-pointer">
              <BlobTextRevealButton text="Read Now!" />
            </div>

            {/* Pill 2 (White Pill): "Subscribe Free" with Chromatic Iridescent Orbit Animation from video */}
            <SubscribeModal>
              <IridescentSubscribeButton text="Subscribe Free" />
            </SubscribeModal>
          </div>
        </motion.div>

        {/* Micro Credibility Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center gap-5 text-[11px] font-mono text-muted-foreground pt-1"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            100% Tested Open Source
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            150k+ Stars Curated
          </span>
          <span>·</span>
          <span>Zero Clickbait Guarantee</span>
        </motion.div>
      </div>
    </div>
  );
}
