"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { BellRing, Calendar, Loader2, MailX, Users } from "lucide-react";
import { FREQUENCY_OPTIONS, getSubscriberCount, unsubscribeByEmail } from "@/lib/api";
import { stagger, fadeUp } from "@/lib/motion";
import { useSubscribe } from "@/components/subscribe-modal";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { Magnetic } from "@/components/animation/magnetic";
import { toast } from "@/components/ui/toaster";

export default function SubscriptionsPage() {
  const { open } = useSubscribe();
  const { data: count } = useSWR("sub-count", getSubscriberCount, { revalidateOnFocus: false, shouldRetryOnError: false });
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const unsub = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setState("error");
      setMsg("Enter the email address you subscribed with.");
      return;
    }
    setState("loading");
    try {
      const res = await unsubscribeByEmail(clean);
      setState("done");
      setMsg(res.message);
      toast({ title: "Unsubscribed", description: res.email });
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Could not unsubscribe.");
    }
  };

  return (
    <PageContainer narrow>
      <PageHeader eyebrow="Subscriptions" title="Intelligence by email" description="Choose how often the AI-curated digest reaches your inbox." />

      {count && (
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
          <Users className="size-4 text-primary" /> {count.count} active subscriber{count.count === 1 ? "" : "s"}
        </p>
      )}

      <motion.ul variants={stagger(0.07)} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
        {FREQUENCY_OPTIONS.map((o) => (
          <motion.li key={o.value} variants={fadeUp} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{o.label}</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{o.badge}</span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-primary"><Calendar className="size-3.5" />{o.schedule}</p>
            <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>
          </motion.li>
        ))}
      </motion.ul>

      <div className="mt-8">
        <Magnetic>
          <button onClick={open} className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-accent-hover">
            <BellRing className="size-4" /> Subscribe
          </button>
        </Magnetic>
      </div>

      <section className="mt-14 rounded-2xl border border-border bg-elevated p-5 sm:p-6" aria-labelledby="unsub-h">
        <h2 id="unsub-h" className="flex items-center gap-2 font-semibold"><MailX className="size-4 text-muted-foreground" />Unsubscribe</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter your email to stop receiving the digest. Every email also contains a one-click unsubscribe link.</p>
        <form onSubmit={unsub} className="mt-4 flex flex-col gap-2 sm:flex-row" noValidate>
          <label className="flex-1">
            <span className="sr-only">Email address</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); if (state !== "loading") setState("idle"); }} placeholder="you@example.com" className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary/70" />
          </label>
          <button type="submit" disabled={state === "loading"} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium hover:bg-muted disabled:opacity-60">
            {state === "loading" && <Loader2 className="size-4 animate-spin" />}Unsubscribe
          </button>
        </form>
        {state === "done" && <p role="status" className="mt-3 text-sm text-foreground">{msg}</p>}
        {state === "error" && <p role="alert" className="mt-3 text-sm text-destructive">{msg}</p>}
      </section>
    </PageContainer>
  );
}
