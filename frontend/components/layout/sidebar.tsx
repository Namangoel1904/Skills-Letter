"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SPRING } from "@/lib/motion";
import { isActive, NAV_ITEMS } from "./nav-config";

function NavLinks({ collapsed, showAdmin, onNavigate }: { collapsed: boolean; showAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((i) => !i.admin || showAdmin);
  return (
    <TooltipProvider delay={150}>
      <nav aria-label="Primary" className="flex flex-col gap-0.5 px-2">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const link = (
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span layoutId="nav-active" transition={SPRING.layout} className="absolute inset-0 rounded-lg bg-muted" aria-hidden />
              )}
              {active && <motion.span layoutId="nav-bar" transition={SPRING.layout} className="absolute left-0 top-2.5 h-5 w-[3px] rounded-r bg-primary" aria-hidden />}
              <item.icon className={cn("relative size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110", active && "text-primary")} />
              <span className={cn("relative truncate transition-opacity duration-200", collapsed && "lg:pointer-events-none lg:w-0 lg:opacity-0")}>{item.label}</span>
            </Link>
          );
          if (!collapsed) return <div key={item.href}>{link}</div>;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={link} />
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}

export function Sidebar({ collapsed, mobileOpen, onClose, showAdmin }: { collapsed: boolean; mobileOpen: boolean; onClose: () => void; showAdmin: boolean }) {
  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-14 z-30 hidden overflow-y-auto overflow-x-hidden border-r border-border bg-background py-3 transition-[width] duration-300 ease-[cubic-bezier(.22,1,.36,1)] lg:block",
          collapsed ? "w-[72px]" : "w-60"
        )}
      >
        <NavLinks collapsed={collapsed} showAdmin={showAdmin} />
        {!collapsed && (
          <p className="mt-6 px-5 text-[11px] leading-relaxed text-muted-foreground">
            Your playlists. Distilled into intelligence.
          </p>
        )}
      </aside>

      {/* Mobile / tablet drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-background py-3 shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-3 flex items-center justify-between px-4">
                <Link href="/" onClick={onClose} className="flex items-center gap-2 font-semibold">
                  <BrandMark size={28} />
                  BeingNotified
                </Link>
                <button onClick={onClose} aria-label="Close navigation" className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>
              <NavLinks collapsed={false} showAdmin={showAdmin} onNavigate={onClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
