"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Mail,
  CheckCircle2,
  Terminal,
  Github,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Star,
  Users,
  Clock,
  BookOpen,
} from "lucide-react";

import { subscribe, type NewsletterEdition, type FrequencyOption } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { SubscribeModal } from "@/components/subscribe-modal";

import VectorWordmark from "@/components/originkit/ui/vector-wordmark";
import RibbonGlow from "@/components/originkit/ui/ribbon-glow";

interface HeroLandingProps {
  latestEdition?: NewsletterEdition | null;
}

export function HeroLanding({ latestEdition }: HeroLandingProps) {
  const { theme } = useTheme();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<FrequencyOption>("2x_week");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleInlineSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid developer email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await subscribe({
        email: email.trim(),
        frequency,
      });
      setSubscribed(true);
      toast({
        title: "Welcome to Notified!",
        description: "A confirmation email has been dispatched to your inbox.",
      });
    } catch (err: unknown) {
      toast({
        title: "Subscription failed",
        description: err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const editionNumber = latestEdition?.edition_number || 3;
  const isCozy = theme === "cozy";
  const isDark = theme === "dark" || !theme;

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden pt-20 pb-20 px-4 sm:px-6">
      {/* ── 1. BACKGROUND: ORIGINKIT RIBBON GLOW & AMBIENCE ── */}
      <RibbonGlow
        className="opacity-75 dark:opacity-90 [.cozy_&]:opacity-40"
        speed={0.9}
        intensity={isCozy ? 0.35 : 0.85}
      />

      {/* Decorative radial vignettes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl w-full mx-auto flex flex-col items-center text-center space-y-8">
        {/* ── 2. TOP PILL ANNOUNCEMENT BADGE (21st.dev Style) ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Link
            href={`/edition/${latestEdition?.id || 3}`}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-background/80 hover:bg-background/95 backdrop-blur-xl shadow-[0_2px_15px_rgba(99,102,241,0.15)] transition-all hover:scale-[1.02] active:scale-95 text-xs font-mono"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground tracking-wide">
              DISPATCH #{editionNumber} IS LIVE
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-primary font-medium flex items-center gap-1 group-hover:underline">
              Read Latest Drops <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.div>

        {/* ── 3. HERO WORDMARK & CENTERPIECE (Vector Wordmark) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="w-full flex flex-col items-center"
        >
          {/* Subtle Top Monospaced Marker */}
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80 mb-2 select-none">
            [ 01 · THE CHRONICLE OF OPEN SOURCE, LOCAL AI & VIBE CODING ]
          </div>

          {/* Interactive Vector Wordmark Container */}
          <div className="w-full max-w-4xl h-[160px] sm:h-[220px] md:h-[280px] relative flex items-center justify-center overflow-hidden rounded-3xl cursor-crosshair">
            <VectorWordmark
              text="NOTIFIED"
              textColor={isCozy ? "#3c4a48" : isDark ? "#ffffff" : "#0f172a"}
              accent={isCozy ? "#a1c1b4" : "#818cf8"}
              shade={isCozy ? "rgba(161,193,180,0.3)" : "rgba(99,102,241,0.3)"}
              background="transparent"
              reach={320}
              speed={45}
              damping={40}
              font={{
                fontFamily: "var(--font-heading), 'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 900,
                fontSize: "170px",
                letterSpacing: "0.02em",
              }}
              handles={{
                size: 95,
                labels: true,
                spread: 26,
              }}
              style={{
                minWidth: 0,
                minHeight: 0,
                width: "100%",
                height: "100%",
                background: "transparent",
              }}
            />

            {/* Subtle Gradient Glow Ring Around Canvas */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-border/40 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_60%,transparent_100%)]" />
          </div>

          {/* Subheading & Mission Pitch */}
          <p className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground font-normal leading-relaxed">
            The developer intelligence digest for active builders. Every week, we scan 100+ developer releases, test local weights, and distill breakthrough open-source repositories into zero-fluff 4-minute briefs.
          </p>
        </motion.div>

        {/* ── 4. HIGH-CONVERSION INLINE SUBSCRIPTION CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-xl"
        >
          {subscribed ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">
                  You are officially on the radar!
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  A confirmation email has been dispatched to <strong>{email}</strong>. Check your inbox to confirm your delivery frequency.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubscribed(false)}
                className="mt-2 text-xs font-mono"
              >
                Register another email
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleInlineSubscribe}
              className="p-2 sm:p-2.5 rounded-2xl bg-card/70 border border-border/70 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_50px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row items-center gap-2 transition-all hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/30"
            >
              <div className="relative flex-1 w-full">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  required
                  className="pl-10 h-11 border-0 bg-transparent shadow-none text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0"
                />
              </div>

              {/* Cadence frequency selector pill */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs font-mono shrink-0">
                <button
                  type="button"
                  onClick={() => setFrequency("2x_week")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    frequency === "2x_week"
                      ? "bg-background text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Mondays & Thursdays"
                >
                  2× / wk
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency("weekly")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    frequency === "weekly"
                      ? "bg-background text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Every Friday"
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency("5x_week")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    frequency === "5x_week"
                      ? "bg-background text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Monday - Friday"
                >
                  5× / wk
                </button>
              </div>

              {/* Subscribe CTA Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-11 px-5 rounded-xl font-semibold text-xs bg-primary text-primary-foreground shadow-[0_2px_14px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_22px_rgba(99,102,241,0.55)] transition-all active:scale-95 shrink-0"
              >
                {loading ? "Joining..." : "Get Dispatches"}
                {!loading && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
              </Button>
            </form>
          )}

          {/* Micro-guarantee */}
          <div className="flex items-center justify-center gap-4 mt-2.5 text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Free forever
            </span>
            <span>·</span>
            <span>Zero spam, 1-click unsubscribe</span>
            <span>·</span>
            <SubscribeModal>
              <button type="button" className="underline hover:text-foreground">
                All preferences
              </button>
            </SubscribeModal>
          </div>
        </motion.div>

        {/* ── 5. SOCIAL PROOF & ACTIVE BUILDERS METRICS BAR ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4 text-xs font-mono text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/80 ring-2 ring-background flex items-center justify-center text-[10px] text-white font-bold">
                JD
              </div>
              <div className="w-6 h-6 rounded-full bg-violet-500/80 ring-2 ring-background flex items-center justify-center text-[10px] text-white font-bold">
                AK
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-500/80 ring-2 ring-background flex items-center justify-center text-[10px] text-white font-bold">
                NG
              </div>
            </div>
            <span>
              Joined by <strong className="text-foreground">1,250+ engineers</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>
              <strong className="text-foreground">150,000+</strong> GitHub Stars Indexed
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>
              <strong className="text-foreground">4 Min</strong> Average Read Time
            </span>
          </div>
        </motion.div>

        {/* ── 6. THREE VALUE PILLARS (Preview Grid) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full pt-6 text-left"
        >
          {/* Pillar 1: Open Source */}
          <Link
            href={`/edition/${latestEdition?.id || 3}`}
            className="p-4 rounded-2xl bg-card/40 border border-border/50 hover:border-emerald-500/40 backdrop-blur-md transition-all hover:bg-card/70 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Github className="w-4 h-4" />
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-500">
                01 · Open Source
              </Badge>
            </div>
            <h4 className="font-heading font-bold text-sm text-foreground group-hover:text-emerald-500 transition-colors">
              Breakthrough Repositories
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              Curated GitHub repositories with verifiable utility, production stars, and clean developer ergonomics.
            </p>
          </Link>

          {/* Pillar 2: Local AI Weights */}
          <Link
            href={`/edition/${latestEdition?.id || 3}`}
            className="p-4 rounded-2xl bg-card/40 border border-border/50 hover:border-indigo-500/40 backdrop-blur-md transition-all hover:bg-card/70 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-indigo-500/30 text-indigo-400">
                02 · Local AI
              </Badge>
            </div>
            <h4 className="font-heading font-bold text-sm text-foreground group-hover:text-indigo-400 transition-colors">
              Quantized Local Weights
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              Models you can run locally on your Mac or laptop via Ollama & GGUF with zero cloud GPU billing.
            </p>
          </Link>

          {/* Pillar 3: Agentic Skills */}
          <Link
            href={`/edition/${latestEdition?.id || 3}`}
            className="p-4 rounded-2xl bg-card/40 border border-border/50 hover:border-violet-500/40 backdrop-blur-md transition-all hover:bg-card/70 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-violet-500/30 text-violet-400">
                03 · Agentics
              </Badge>
            </div>
            <h4 className="font-heading font-bold text-sm text-foreground group-hover:text-violet-400 transition-colors">
              Cursor & Claude Skills
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              Drop-in .cursorrules, Claude skills, and AntiGravity prompts to accelerate your vibe-coding workflows.
            </p>
          </Link>
        </motion.div>

        {/* ── 7. SECONDARY ACTION BAR ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href={`/edition/${latestEdition?.id || 3}`}>
            <Button variant="outline" className="rounded-xl h-10 px-5 text-xs font-mono border-border/60">
              <BookOpen className="w-3.5 h-3.5 mr-2 text-primary" />
              Explore Issue #{editionNumber} (Full Web Drop)
            </Button>
          </Link>
          <Link href="/archive">
            <Button variant="ghost" className="rounded-xl h-10 px-4 text-xs font-mono text-muted-foreground hover:text-foreground">
              Browse All Editions →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
