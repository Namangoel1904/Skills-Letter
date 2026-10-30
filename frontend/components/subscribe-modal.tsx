"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, CheckCircle2, ShieldCheck, Mail, ArrowRight, Loader2 } from "lucide-react";
import { subscribe, FREQUENCY_OPTIONS, type FrequencyOption } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SubscribeModalProps {
  children: React.ReactNode;
}

export function SubscribeModal({ children }: SubscribeModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<FrequencyOption>("weekly");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#6366f1", "#8b5cf6", "#ec4899", "#3b82f6"],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await subscribe({ email, name: name || undefined, frequency });
      setStatus("success");
      triggerConfetti();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setEmail("");
    setName("");
    setFrequency("weekly");
    setErrorMsg("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.3)]">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 sm:p-8 relative">
          <DialogHeader className="text-left mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <DialogTitle className="font-heading text-xl sm:text-2xl font-bold tracking-tight">
              Get the TechPulse Dispatch
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              Pure signal. Direct GitHub links, quantized model drops, and AGY prompts delivered to your inbox.
            </DialogDescription>
          </DialogHeader>

          {status === "success" ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-4 animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">You’re on the VIP list</h3>
              <p className="text-xs text-muted-foreground max-w-xs mb-6">
                We’ve registered <span className="text-foreground font-medium">{email}</span>. You will receive updates according to your chosen schedule.
              </p>
              <Button onClick={() => setOpen(false)} className="rounded-xl px-6 h-10 w-full font-semibold">
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sub-email" className="text-xs font-semibold">
                  Email address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="sub-email"
                    type="email"
                    required
                    placeholder="naman@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sub-name" className="text-xs font-semibold">
                  First name <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="sub-name"
                  type="text"
                  placeholder="Naman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary/30"
                />
              </div>

              {/* Frequency selection buttons */}
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-semibold">Delivery cadence</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setFrequency(opt.value)}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between",
                        frequency === opt.value
                          ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.2)] text-foreground"
                          : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60"
                      )}
                    >
                      <span className="font-semibold">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {status === "error" && (
                <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                  {errorMsg}
                </p>
              )}

              <Button
                type="submit"
                disabled={status === "loading"}
                className="w-full h-11 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all mt-2"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Confirm Subscription</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero spam. One-click unsubscribe at any time.</span>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
