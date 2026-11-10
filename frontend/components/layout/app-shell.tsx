"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CustomCursor } from "@/components/cursor/custom-cursor";
import { IntroProvider } from "@/components/intro/intro";
import { SubscribeProvider } from "@/components/subscribe-modal";
import { cn } from "@/lib/utils";
import { ADMIN_TOKEN_KEY } from "./nav-config";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

const COLLAPSE_KEY = "bn:sidebar-collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
      // Admin link is shown only when this browser already holds a login token from the admin console.
      setShowAdmin(!!localStorage.getItem(ADMIN_TOKEN_KEY));
    } catch {
      /* ignore */
    }
  }, [pathname]);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const toggleCollapse = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });

  return (
    <IntroProvider>
      <SubscribeProvider>
        <a href="#main" className="sr-only z-[200] rounded bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Skip to content
        </a>
        <Topbar onMenu={() => setMobileOpen(true)} onToggleCollapse={toggleCollapse} />
        <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} showAdmin={showAdmin} />
        <main id="main" className={cn("min-h-screen pt-14 transition-[padding] duration-300 ease-[cubic-bezier(.22,1,.36,1)]", collapsed ? "lg:pl-[72px]" : "lg:pl-60")}>
          {children}
        </main>
        <CustomCursor />
      </SubscribeProvider>
    </IntroProvider>
  );
}
