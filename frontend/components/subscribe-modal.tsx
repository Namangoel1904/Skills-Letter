"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BellRing, Loader2, Mail, ShieldCheck } from "lucide-react";
import { subscribe, FREQUENCY_OPTIONS, type FrequencyOption } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";
import { toast } from "@/components/ui/toaster";

const SubscribeContext = createContext<{ open: () => void }>({ open: () => {} });

/** Open the global subscription dialog from anywhere. */
export const useSubscribe = () => useContext(SubscribeContext);

export function SubscribeProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openDialog = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ open: openDialog }), [openDialog]);
  return (
    <SubscribeContext.Provider value={value}>
      {children}
      <SubscribeDialog open={open} onOpenChange={setOpen} />
    </SubscribeContext.Provider>
  );
}

/** Back-compat wrapper: any child click opens the global dialog. */
export function SubscribeModal({ children }: { children: React.ReactElement<{ onClick?: React.MouseEventHandler }> }) {
  const { open } = useSubscribe();
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      open();
    },
  });
}

function AnimatedCheck() {
  return (
    <div className="relative grid size-16 place-items-center">
      <motion.span
        className="absolute inset-0 rounded-full bg-primary/15"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.25, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.7, ease: EASE.out }}
      />
      <motion.span
        className="absolute inset-0 rounded-full border border-primary/60"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 1.7, opacity: 0 }}
        transition={{ duration: 1.1, delay: 0.25, ease: EASE.out }}
      />
      <svg viewBox="0 0 24 24" className="relative size-8 text-primary" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3, ease: EASE.out }} />
      </svg>
    </div>
  );
}

function SubscribeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<FrequencyOption>("weekly");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setStatus("idle");
    setEmail("");
    setName("");
    setFrequency("weekly");
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setErrorMsg("Enter a valid email address.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await subscribe({ email: clean, name: name.trim() || undefined, frequency });
      setStatus("success"); // only after the backend confirmed (201)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(msg);
      setStatus("error");
      toast({ title: "Subscription failed", description: msg, variant: "destructive" });
    }
  };

  const chosen = FREQUENCY_OPTIONS.find((o) => o.value === frequency);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) window.setTimeout(reset, 250);
      }}
    >
      <DialogContent className="w-full overflow-hidden rounded-2xl border border-border bg-popover p-0 shadow-2xl sm:max-w-[560px]">
        <div className="relative max-h-[88vh] overflow-y-auto p-6 sm:p-7">
          <div className="pointer-events-none absolute -left-24 -top-24 size-56 rounded-full bg-primary/15 blur-3xl" />
          {status === "success" ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative flex flex-col items-center py-4 text-center" role="status">
              <AnimatedCheck />
              <h2 className="mt-5 text-xl font-semibold tracking-tight">You&apos;re subscribed</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Subscription confirmed for <span className="font-medium text-foreground">{email}</span>.
              </p>
              <div className="mt-5 w-full space-y-1.5 rounded-xl border border-border bg-muted/40 p-4 text-left font-mono text-xs">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Cadence</span><span className="font-medium">{chosen?.label}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Schedule</span><span className="text-right font-medium text-primary">{chosen?.schedule}</span></div>
              </div>
              <Button onClick={() => onOpenChange(false)} className="mt-5 h-10 w-full rounded-xl font-semibold">Done</Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="relative space-y-4" noValidate>
              <DialogHeader className="text-left">
                <div className="mb-1 flex items-center gap-2 text-primary">
                  <BellRing className="size-4" />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-widest">Newsletter</span>
                </div>
                <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">Your playlists, distilled into your inbox.</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Pick how often BeingNotified sends the AI-curated digest.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-5">
                <div className="space-y-1.5 sm:col-span-3">
                  <Label htmlFor="sub-email" className="text-xs font-medium">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="sub-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={status === "error" && !!errorMsg}
                      className="h-10 rounded-xl pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="sub-name" className="text-xs font-medium">First name <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Input id="sub-name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-xl" />
                </div>
              </div>

              <fieldset className="space-y-2">
                <legend className="mb-2 text-xs font-medium">Delivery frequency</legend>
                <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
                  {FREQUENCY_OPTIONS.map((opt) => {
                    const active = frequency === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setFrequency(opt.value)}
                        className={cn(
                          "relative rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                          active ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:bg-muted/60"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{opt.label}</span>
                          <span className="rounded-full border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{opt.badge}</span>
                        </div>
                        <span className="mt-1 block font-mono text-[11px] text-primary">{opt.schedule}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {status === "error" && errorMsg && (
                <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{errorMsg}</p>
              )}

              <Button type="submit" disabled={status === "loading"} className="h-10 w-full rounded-xl font-semibold">
                {status === "loading" ? <Loader2 className="size-4 animate-spin" aria-label="Subscribing" /> : (<>Subscribe<ArrowRight className="size-4" /></>)}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" /> No spam. Unsubscribe any time from Subscriptions.
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
