"use client";

import { useEffect, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Simple global toast store
const listeners: Array<(toast: ToastMessage) => void> = [];
export function toast(msg: Omit<ToastMessage, "id">) {
  const item = { ...msg, id: Math.random().toString(36).slice(2) };
  listeners.forEach((fn) => fn(item));
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (t: ToastMessage) => setToasts((prev) => [...prev, t]);
    listeners.push(handler);
    return () => { const idx = listeners.indexOf(handler); if (idx > -1) listeners.splice(idx, 1); };
  }, []);

  return (
    <Toast.Provider swipeDirection="right">
      {toasts.map((t) => (
        <Toast.Root
          key={t.id}
          onOpenChange={(open) => { if (!open) setToasts((prev) => prev.filter((x) => x.id !== t.id)); }}
          className={cn(
            "glass-card flex items-start gap-3 p-4 rounded-2xl shadow-xl max-w-sm",
            t.variant === "destructive" && "border-destructive/30"
          )}
          defaultOpen
        >
          <div className="flex-1">
            <Toast.Title className="text-sm font-semibold text-foreground">{t.title}</Toast.Title>
            {t.description && <Toast.Description className="text-xs text-muted-foreground mt-0.5">{t.description}</Toast.Description>}
          </div>
          <Toast.Close className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm" />
    </Toast.Provider>
  );
}
