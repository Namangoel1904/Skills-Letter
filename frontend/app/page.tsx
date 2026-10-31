"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Check as CheckIcon,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
} from "lucide-react";

import HeroText from "@/components/ui/hero-shutter-text";
import { DiaText } from "@/components/ui/dia-text";
import { AnimatedSubscribeButton } from "@/components/ui/animated-subscribe-button";
import HoverSlatButton from "@/components/ui/hover-button";
import { SubscribeModal } from "@/components/subscribe-modal";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && (theme === "light" || resolvedTheme === "light");

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center select-none">
      {/* ── 1. BACKGROUND VIDEO LOOP (Dual Light/Dark with Glassmorphism Overlay) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Dark Theme Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            isLight ? "opacity-0 pointer-events-none" : "opacity-95 dark:opacity-100"
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
            isLight ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          src="/videos/hero-light.mp4"
        />

        {/* Glassmorphic Frosted Blur Overlay */}
        <div className="absolute inset-0 bg-background/55 dark:bg-background/65 [.cozy_&]:bg-[#dfebe5]/75 backdrop-blur-md transition-colors duration-700" />

        {/* Subtle Radial Vignette for Contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.35)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.65)_100%)]" />
      </div>

      {/* ── 2. HERO CONTENT LAYER (Centered, Non-Scrollable) ── */}
      <div className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-6 sm:space-y-8">
        {/* Top Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/latest"
            className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-card/60 hover:bg-card/90 backdrop-blur-xl shadow-lg transition-all hover:scale-105 active:scale-95 text-xs font-mono"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground tracking-wide">
              LATEST DISPATCH IS LIVE
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-primary font-medium flex items-center gap-1 group-hover:underline">
              Read Takeaways <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.div>

        {/* ── 3. MAIN TEXT: BeingNotified - Skill Letter (Hero Shutter Animation) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="w-full flex flex-col items-center"
        >
          <HeroText
            text="BeingNotified - Skill Letter"
            sizeClassName="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
            showControl={false}
          />
        </motion.div>

        {/* ── 4. SUBLINE: Eliminate Doom Scrolling & DiaText Animation ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-3xl text-center px-4"
        >
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground/85 dark:text-zinc-200 [.cozy_&]:text-[#3c4a48] font-normal leading-relaxed">
            Eliminate doom-scrolling. We test 100+ weekly releases to deliver the most handpicked, verified tech intelligence on{" "}
            <DiaText
              repeat
              repeatDelay={1.2}
              colors={["#6366f1", "#a855f7", "#ec4899", "#10b981", "#38bdf8"]}
              text={[
                "open-source gems.",
                "local AI weights.",
                "vibe-coding skills.",
                "production tools.",
              ]}
              className="font-bold text-primary dark:text-emerald-400 [.cozy_&]:text-[#3c4a48]"
            />{" "}
            straight to your inbox in under 4 minutes.
          </p>
        </motion.div>

        {/* ── 5. BUTTONS ROW: "Explore" (Hover Slat) & "Subscribe to Skill Letter" ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          {/* Explore Button (HoverSlatButton: "Explore" -> "Now!") */}
          <Link href="/latest" className="inline-block" title="Explore Latest Technical Intel">
            <HoverSlatButton
              initialText="Explore"
              hoverText="Now!"
              className="rounded-xl shadow-lg ring-1 ring-white/10 hover:ring-primary/40 transition-all"
            />
          </Link>

          {/* Subscribe to Skill Letter Button */}
          <SubscribeModal>
            <div className="inline-block cursor-pointer" title="Subscribe to Skill Letter">
              <AnimatedSubscribeButton
                buttonColor="#4f46e5"
                buttonTextColor="#ffffff"
                subscribeStatus={false}
                initialText={
                  <span className="group inline-flex items-center text-xs font-semibold">
                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                    Subscribe to Skill Letter
                    <ChevronRight className="ml-1 w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                }
                changeText={
                  <span className="group inline-flex items-center text-xs font-semibold">
                    <CheckIcon className="mr-1.5 w-3.5 h-3.5" />
                    Subscribed!
                  </span>
                }
              />
            </div>
          </SubscribeModal>
        </motion.div>

        {/* ── 6. MICRO SOCIAL PROOF BAR ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 pt-2 text-[11px] font-mono text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            100% Verified Open Source
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            150,000+ GitHub Stars Curated
          </span>
          <span>·</span>
          <span>1-Click Unsubscribe</span>
        </motion.div>
      </div>
    </div>
  );
}
