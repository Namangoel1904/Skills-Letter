"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { unsubscribe } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2, Zap } from "lucide-react";
import Link from "next/link";

function UnsubscribeContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"confirm" | "loading" | "success" | "error">(
    token ? "confirm" : "error"
  );
  const [message, setMessage] = useState(token ? "" : "Invalid or missing unsubscribe link.");

  const handleUnsubscribe = () => {
    if (!token) return;
    setStatus("loading");
    unsubscribe(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message ?? "Failed to unsubscribe.");
      });
  };

  return (
    <div className="glass-card p-10 text-center max-w-sm w-full">
      <Link href="/" className="inline-flex items-center gap-2 mb-8 font-bold text-xl">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        Tech<span className="text-primary">Pulse</span>
      </Link>

      {status === "confirm" && (
        <>
          <h2 className="text-xl font-bold mb-2">Unsubscribe Confirmation</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Are you sure you want to stop receiving curated open-source drops and AI technical digests?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleUnsubscribe}
              className="w-full py-2.5 px-4 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-sm font-semibold transition-colors"
            >
              Yes, Unsubscribe
            </button>
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-semibold transition-colors"
            >
              Keep My Subscription
            </Link>
          </div>
        </>
      )}

      {status === "loading" && (
        <>
          <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Updating your preferences…</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Unsubscribed</h2>
          <p className="text-muted-foreground text-sm mb-6">{message}</p>
          <p className="text-xs text-muted-foreground">
            Changed your mind? <Link href="/" className="text-primary underline">Resubscribe</Link>
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground text-sm mb-6">{message}</p>
          <Link href="/" className="text-primary text-sm underline">Go back home</Link>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="glass-card p-12 text-center max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
