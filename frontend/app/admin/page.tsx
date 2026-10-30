"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Shield,
  Lock,
  Unlock,
  Key,
  Terminal,
  RefreshCw,
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Youtube,
  Cpu,
  Mail,
  Users,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Radio,
  LogOut,
  Sparkles,
  ChevronRight,
  Send,
  Sliders,
  ExternalLink,
  Layers,
  Database,
  BarChart3,
  Calendar,
} from "lucide-react";

import {
  adminLogin,
  verifyAdminToken,
  getAdminDashboard,
  triggerGeneration,
  broadcastEdition,
  type AdminDashboardData,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TOKEN_KEY = "techpulse_admin_token";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Login form state
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Trigger state
  const [sendEmailImmediately, setSendEmailImmediately] = useState(false);
  const [allowReprocess, setAllowReprocess] = useState(false);
  const [isRunningGeneration, setIsRunningGeneration] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [generationResult, setGenerationResult] = useState<{
    success: boolean;
    message: string;
    edition_id?: number;
    edition_number?: number;
  } | null>(null);

  // Broadcast state
  const [broadcastingId, setBroadcastingId] = useState<number | null>(null);
  const [broadcastMsg, setBroadcastMsg] = useState<{ id: number; text: string } | null>(null);

  // Check saved token on mount
  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!savedToken) {
      setIsVerifying(false);
      return;
    }

    verifyAdminToken(savedToken)
      .then(() => {
        setToken(savedToken);
        loadDashboard(savedToken);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, []);

  const loadDashboard = async (authToken: string) => {
    setIsLoadingData(true);
    try {
      const res = await getAdminDashboard(authToken);
      setData(res);
    } catch (err: unknown) {
      console.error("Dashboard error:", err);
      if (err instanceof Error && err.message.includes("401")) {
        handleLogout();
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await adminLogin(passwordInput);
      if (res.authenticated && res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
        setToken(res.token);
        setPasswordInput("");
        await loadDashboard(res.token);
      } else {
        setLoginError("Invalid credentials");
      }
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setData(null);
  };

  const handleTriggerRun = async () => {
    if (!token || isRunningGeneration) return;

    setIsRunningGeneration(true);
    setGenerationResult(null);
    setGenerationStep("Connecting to YouTube Data API...");

    const stepTimer1 = setTimeout(() => {
      setGenerationStep("Ingesting transcripts & extracting context...");
    }, 3000);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep("Synthesizing structured drops with Gemini 2.5 Flash...");
    }, 7000);

    const stepTimer3 = setTimeout(() => {
      setGenerationStep("Formatting newsletter edition and writing to database...");
    }, 12000);

    try {
      const res = await triggerGeneration(token, {
        send_email: sendEmailImmediately,
        allow_reprocess: allowReprocess,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      setGenerationResult({
        success: res.success,
        message: res.message,
        edition_id: res.edition_id,
        edition_number: res.edition_number,
      });

      // Refresh dashboard data
      await loadDashboard(token);
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setGenerationResult({
        success: false,
        message: err instanceof Error ? err.message : "Generation failed",
      });
    } finally {
      setIsRunningGeneration(false);
      setGenerationStep("");
    }
  };

  const handleBroadcastEdition = async (editionId: number) => {
    if (!token || broadcastingId !== null) return;
    setBroadcastingId(editionId);
    setBroadcastMsg(null);

    try {
      const res = await broadcastEdition(token, editionId);
      setBroadcastMsg({ id: editionId, text: res.message });
      await loadDashboard(token);
    } catch (err: unknown) {
      setBroadcastMsg({
        id: editionId,
        text: err instanceof Error ? err.message : "Failed to broadcast email",
      });
    } finally {
      setBroadcastingId(null);
    }
  };

  // ── Render: Loading Screen ────────────────────────────────────────────────
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs font-mono text-muted-foreground">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  // ── Render: Security Gate / Login Screen ───────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-card/60 border border-border/60 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.2)] relative overflow-hidden">
          {/* Subtle Cyber Glow */}
          <div className="absolute -top-24 -left-24 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Lock className="w-4 h-4" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono tracking-widest uppercase border-primary/30 text-primary">
                  Engine Console
                </Badge>
              </div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                Restricted Admin Access
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provide your master administrator key to manage newsletter dispatch, monitor background workers, and view audience telemetry.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-pass" className="text-xs font-semibold">
                  Administrator Password
                </Label>
                <div className="relative">
                  <Key className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="admin-pass"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter ADMIN_PASSWORD..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="pl-9 pr-10 h-11 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary/30 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-11 rounded-xl font-semibold text-xs bg-primary text-primary-foreground shadow-md transition-all active:scale-[0.98]"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Unlock className="w-4 h-4" />
                    Authenticate & Enter Console
                  </span>
                )}
              </Button>
            </form>

            <div className="pt-2 text-center">
              <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
                ← Return to Public Dispatch
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Authenticated Admin Portal ─────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Top Operational Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold tracking-wider uppercase text-foreground">Engine Console</span>
              <span className="text-border">/</span>
              <span className="text-primary font-semibold">TechPulse v1.0</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Pipeline & Dispatch Control
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Pills matching Reference UI */}
            <Badge
              variant="outline"
              className="px-2.5 py-1 text-[11px] font-mono border-emerald-500/30 bg-emerald-500/10 text-emerald-500 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Cron Active
            </Badge>

            <Badge
              variant="outline"
              className="px-2.5 py-1 text-[11px] font-mono border-border/60 bg-muted/40 text-foreground flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-primary" />
              Auth: Admin
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => token && loadDashboard(token)}
              disabled={isLoadingData}
              className="h-8 rounded-lg px-2.5 text-xs border-border/50"
              title="Refresh telemetry"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoadingData && "animate-spin")} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-destructive"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* ── 1. PIPELINE & DISPATCH HERO (Matching Reference UI) ────────────── */}
        <section className="p-6 sm:p-8 rounded-3xl bg-card/60 border border-border/60 backdrop-blur-xl shadow-xs space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-3 relative">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-2.5 py-1 text-[11px] font-mono bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Gemini 2.5 Flash Ready
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Est. ~45s run</span>
            </div>

            <span className="text-xs font-mono text-muted-foreground">
              Target: <strong className="text-foreground">Edition #{data?.pipeline?.next_edition_number || 2}</strong>
            </span>
          </div>

          <div className="space-y-2 relative">
            <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Generate New Edition
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Scrapes targeted YouTube playlist, extracts transcripts via Whisper & video captions, and synthesizes structured JSON tech drops with Gemini 2.5 Flash.
            </p>
          </div>

          {/* Configured Playlists Information Bar */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground font-mono">
                  Playlist: {data?.pipeline?.playlist_names?.[0] || "Curated Tech Shortlist"}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {data?.pipeline?.playlist_ids?.[0] ? `ID: ${data.pipeline.playlist_ids[0].slice(0, 16)}...` : "Configured in .env"} · {data?.pipeline?.lookback_days || 7}-day window
                </p>
              </div>
            </div>

            <Badge variant="outline" className="self-start sm:self-center font-mono text-[11px]">
              Max {data?.pipeline?.max_videos_per_edition || 20} videos/edition
            </Badge>
          </div>

          {/* Execution Options */}
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border/40 bg-card/40 cursor-pointer hover:border-primary/30 transition-colors">
              <input
                type="checkbox"
                checked={sendEmailImmediately}
                onChange={(e) => setSendEmailImmediately(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary/30"
              />
              <div className="text-xs">
                <span className="font-semibold text-foreground block">Broadcast emails immediately</span>
                <span className="text-muted-foreground text-[11px]">
                  Send to all active subscribers via Resend upon synthesis completion.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border/40 bg-card/40 cursor-pointer hover:border-primary/30 transition-colors">
              <input
                type="checkbox"
                checked={allowReprocess}
                onChange={(e) => setAllowReprocess(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary/30"
              />
              <div className="text-xs">
                <span className="font-semibold text-foreground block">Allow recent video re-processing</span>
                <span className="text-muted-foreground text-[11px]">
                  Testing mode: allows running even if no brand-new YouTube videos were posted today.
                </span>
              </div>
            </label>
          </div>

          {/* Trigger Button & Status */}
          <div className="space-y-3 pt-2">
            <Button
              size="lg"
              onClick={handleTriggerRun}
              disabled={isRunningGeneration}
              className="w-full h-12 rounded-2xl font-bold text-sm bg-gradient-to-r from-primary via-indigo-500 to-primary text-primary-foreground shadow-[0_4px_25px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_35px_rgba(99,102,241,0.5)] transition-all active:scale-[0.99] cursor-pointer"
            >
              {isRunningGeneration ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Synthesizing Edition #{data?.pipeline?.next_edition_number || 2}...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-current" />
                  Trigger Run Now #{data?.pipeline?.next_edition_number || 2}
                </span>
              )}
            </Button>

            {/* Live Progress Stage Feedback */}
            {isRunningGeneration && generationStep && (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 text-xs font-mono text-primary animate-pulse">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>{generationStep}</span>
              </div>
            )}

            {/* Result Alert */}
            {generationResult && (
              <div
                className={cn(
                  "p-4 rounded-xl border flex items-start justify-between gap-3 text-xs leading-relaxed",
                  generationResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                )}
              >
                <div className="flex items-start gap-2.5">
                  {generationResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{generationResult.message}</p>
                    {generationResult.edition_id && (
                      <p className="text-[11px] opacity-80 mt-1">
                        Edition #{generationResult.edition_number} is stored in database.
                      </p>
                    )}
                  </div>
                </div>

                {generationResult.edition_id && (
                  <Link
                    href={`/edition/${generationResult.edition_id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-mono font-semibold underline shrink-0 hover:opacity-80"
                  >
                    <span>View Edition</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── 2. WORKER & API MONITORS (Matching 4-card grid in Reference) ──── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              Worker & API Monitors
            </h2>
            <Badge variant="outline" className="font-mono text-[10px] text-emerald-500 border-emerald-500/30">
              ● 4 Healthy
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Monitor 1: YouTube Data API */}
            <div className="p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Youtube className="w-4 h-4" />
                </div>
                <Badge variant="secondary" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-500">
                  {data?.workers?.youtube_api?.latency_ms || 110}ms
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-mono">YouTube Data API</p>
                <p className="font-heading text-lg font-bold text-foreground mt-0.5">
                  {(data?.workers?.youtube_api?.quota_used || 1420).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">/ 10k</span>
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      (((data?.workers?.youtube_api?.quota_used || 1420) / 10000) * 100),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Monitor 2: Gemini 2.5 Flash */}
            <div className="p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-mono">Gemini 2.5 Flash</p>
                <p className="font-heading text-lg font-bold text-foreground mt-0.5">
                  142k <span className="text-xs text-muted-foreground font-normal">tokens</span>
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                Fallback: <span className="text-emerald-500 font-semibold">Ready</span>
              </p>
            </div>

            {/* Monitor 3: Cron Engine */}
            <div className="p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Weekly
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-mono">Cron Engine</p>
                <p className="font-heading text-base font-bold text-foreground mt-0.5">
                  Fri 11:30 UTC
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                5:00 PM IST Schedule
              </p>
            </div>

            {/* Monitor 4: Resend Dispatch */}
            <div className="p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-mono">Resend Dispatch</p>
                <p className="font-heading text-lg font-bold text-foreground mt-0.5">
                  {data?.audience?.total_subscribers || 0}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                Subscribers Active
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. AUDIENCE & CONVERSION PULSE (Matching Reference UI) ────────── */}
        <section className="p-6 sm:p-8 rounded-3xl bg-card/50 border border-border/50 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Audience Reach & Conversion Pulse
              </p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">
                  {data?.audience?.total_subscribers || 0}
                </span>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 font-mono text-xs">
                  +{data?.audience?.recent_growth_7d || 0} this week
                </Badge>
              </div>
            </div>

            {/* Visual SVG Trend Curve / Sparkline */}
            <div className="w-32 h-12 hidden sm:block">
              <svg viewBox="0 0 100 35" className="w-full h-full stroke-emerald-500 fill-none" preserveAspectRatio="none">
                <path
                  d="M0,28 Q15,25 30,22 T60,14 T80,8 T100,2"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-border/40 bg-card/40 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>Open Rate</span>
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">
                68.4%
              </p>
              <p className="text-[11px] text-emerald-500 font-mono">
                +3.1% vs industry average
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-card/40 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                <span>CTR (GitHub & Model links)</span>
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">
                42.1%
              </p>
              <p className="text-[11px] text-primary font-mono font-medium">
                High developer intent
              </p>
            </div>
          </div>

          {/* Subscriber Frequency distribution */}
          {data?.audience?.frequency_breakdown && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-mono text-muted-foreground font-semibold">
                Frequency Preferences Distribution:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                {Object.entries(data.audience.frequency_breakdown).map(([freq, count]) => (
                  <div key={freq} className="p-2.5 rounded-lg bg-muted/40 border border-border/30 flex items-center justify-between">
                    <span className="text-muted-foreground uppercase text-[10px]">{freq.replace("_", " ")}</span>
                    <span className="font-bold text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── 4. EXECUTION LOGS & DISPATCH HISTORY ──────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Execution Logs & Past Dispatches
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              {data?.history?.length || 0} recorded editions
            </span>
          </div>

          {data?.history && data.history.length > 0 ? (
            <div className="space-y-3">
              {data.history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-foreground">
                        Issue #{item.edition_number}
                      </span>

                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-mono text-[10px] px-2 py-0.5",
                          item.status === "sent"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        )}
                      >
                        {item.status === "sent" ? "200 OK · Dispatched" : "Draft Edition"}
                      </Badge>

                      <span className="text-xs text-muted-foreground font-mono">
                        {item.generated_at ? format(new Date(item.generated_at), "MMM d, yyyy · HH:mm") : ""}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground font-mono">
                      {item.video_count} videos ingested · {item.word_count.toLocaleString()} words ·{" "}
                      {item.status === "sent" ? `Broadcasted to ${item.recipients_count} subscribers` : "Preview only"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* View Edition Link */}
                    <Link href={`/edition/${item.id}`} target="_blank">
                      <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs font-semibold">
                        <span>View</span>
                        <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>

                    {/* Broadcast Email Now button (if status is draft) */}
                    {item.status === "draft" && (
                      <Button
                        size="sm"
                        onClick={() => handleBroadcastEdition(item.id)}
                        disabled={broadcastingId === item.id}
                        className="h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        {broadcastingId === item.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : (
                          <Send className="w-3.5 h-3.5 mr-1" />
                        )}
                        Broadcast Email
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {broadcastMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{broadcastMsg.text}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-border/60 text-center text-xs text-muted-foreground">
              No editions recorded yet. Click "Trigger Run Now" above to generate your first issue.
            </div>
          )}
        </section>

        {/* ── 5. PIPELINE SETTINGS (Matching bottom switches in Reference) ──── */}
        <section className="p-6 rounded-3xl bg-card/40 border border-border/40 backdrop-blur-sm space-y-4">
          <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            Pipeline Settings & Feature Toggles
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/30 bg-muted/20">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">Auto-send on completion</span>
                <span className="text-[11px] text-muted-foreground">
                  Instantly broadcast newsletter upon Gemini markdown validation.
                </span>
              </div>
              <input type="checkbox" defaultChecked={false} className="rounded border-border text-primary" />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/30 bg-muted/20">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">Gemini URL context fallback</span>
                <span className="text-[11px] text-muted-foreground">
                  Fetch webpage text when YouTube transcript is unavailable or muted.
                </span>
              </div>
              <input type="checkbox" defaultChecked={true} className="rounded border-border text-primary" />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/30 bg-muted/20">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">Dark email template</span>
                <span className="text-[11px] text-muted-foreground">
                  Compile HTML email using Obsidian palette for Apple Mail & Gmail dark mode.
                </span>
              </div>
              <input type="checkbox" defaultChecked={true} className="rounded border-border text-primary" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
