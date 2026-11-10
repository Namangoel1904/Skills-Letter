"use client";

import { useEffect, useRef } from "react";

type CursorState = "default" | "link" | "view" | "play" | "drag" | "native";

const NATIVE_SELECTOR =
  "input:not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select, [contenteditable='true']";

function resolveState(target: Element | null): CursorState {
  if (!target) return "default";
  if (target.closest(NATIVE_SELECTOR)) return "native";
  const tagged = target.closest<HTMLElement>("[data-cursor]");
  if (tagged) return (tagged.dataset.cursor as CursorState) ?? "default";
  if (target.closest("a, button, [role='button'], summary, label")) return "link";
  return "default";
}

/**
 * Context-aware cursor: a precise dot plus a lagging ring that morphs per target.
 * Motion is applied imperatively in a rAF loop, so pointer moves never trigger React renders.
 * Disabled on touch devices and when the user prefers reduced motion.
 * Opt a region in with data-cursor="view | play | drag".
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    const root = rootRef.current!;
    const ring = ringRef.current!;
    const dot = dotRef.current!;
    document.documentElement.classList.add("bn-cursor");

    let tx = -100;
    let ty = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let state: CursorState = "default";
    let visible = false;

    const setState = (next: CursorState) => {
      if (next === state) return;
      state = next;
      root.dataset.state = next;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        rx = tx;
        ry = ty;
        root.style.opacity = "1";
      }
      setState(resolveState(e.target as Element | null));
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };
    const onLeave = () => {
      visible = false;
      root.style.opacity = "0";
    };
    const onDown = () => {
      if (state === "native") return;
      const wrap = document.createElement("div");
      wrap.style.cssText = `position:absolute;left:0;top:0;transform:translate3d(${tx}px,${ty}px,0)`;
      const pulse = document.createElement("span");
      pulse.style.cssText =
        "position:absolute;left:-24px;top:-24px;width:48px;height:48px;border-radius:9999px;border:1px solid var(--primary);animation:bn-pulse-ring .55s cubic-bezier(.22,1,.36,1) forwards";
      wrap.appendChild(pulse);
      root.appendChild(wrap);
      window.setTimeout(() => wrap.remove(), 600);
    };

    const tick = () => {
      rx += (tx - rx) * 0.2;
      ry += (ty - ry) * 0.2;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("bn-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-state="default"
      className="group pointer-events-none fixed inset-0 z-[9999] opacity-0 transition-opacity duration-200 data-[state=native]:!opacity-0 [@media(hover:none)]:hidden"
    >
      <div ref={ringRef} className="absolute left-0 top-0 will-change-transform">
        <div className="-ml-4 -mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-foreground/40 text-[10px] font-semibold tracking-widest text-white transition-[transform,background-color,border-color] duration-300 ease-out group-data-[state=link]:scale-[1.5] group-data-[state=link]:border-primary/70 group-data-[state=view]:scale-[2.2] group-data-[state=view]:border-transparent group-data-[state=view]:bg-primary group-data-[state=play]:scale-[2.4] group-data-[state=play]:border-transparent group-data-[state=play]:bg-primary group-data-[state=drag]:scale-[2.2] group-data-[state=drag]:border-transparent group-data-[state=drag]:bg-foreground group-data-[state=drag]:text-background">
          <span className="absolute hidden scale-[0.45] group-data-[state=view]:block">VIEW</span>
          <svg className="absolute hidden size-3 scale-[0.5] group-data-[state=play]:block" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg
            className="absolute hidden size-3 scale-[0.6] text-primary group-data-[state=link]:block"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
          <span className="absolute hidden scale-[0.45] group-data-[state=drag]:block">DRAG</span>
        </div>
      </div>
      <div ref={dotRef} className="absolute left-0 top-0 will-change-transform">
        <div className="-ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-primary transition-opacity group-data-[state=view]:opacity-0 group-data-[state=play]:opacity-0 group-data-[state=drag]:opacity-0" />
      </div>
    </div>
  );
}
