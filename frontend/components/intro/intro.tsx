"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrandMark } from "@/components/brand-mark";
import { EASE } from "@/lib/motion";

/**
 * "From noise to signal" intro.
 * Plays once per browser session, only on the entry route "/", and can never block the app:
 *  - the site renders underneath the overlay the whole time
 *  - Skip Intro / Escape end it instantly
 *  - a hard timeout ends it even if animation callbacks never fire
 *  - prefers-reduced-motion skips it entirely
 */

const SESSION_KEY = "bn:intro-seen";
const MARK = 72;

const IntroContext = createContext<{ ready: boolean }>({ ready: true });
/** True once the intro has finished (or was skipped). Pages use it to orchestrate their entrance. */
export const useIntroReady = () => useContext(IntroContext).ready;

// Deterministic layout so server/client markup agree (overlay only mounts after the effect anyway).
const SIGNALS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 + (i % 3) * 0.35;
  const r = 28 + ((i * 37) % 22);
  return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.7, red: i % 3 === 0, d: (i % 6) * 0.06 };
});

const CARDS = [
  { x: -34, y: -22, r: -14, ry: 28, d: 0.5 },
  { x: 32, y: -26, r: 11, ry: -30, d: 0.58 },
  { x: -38, y: 20, r: 9, ry: 24, d: 0.66 },
  { x: 36, y: 24, r: -10, ry: -26, d: 0.74 },
  { x: 0, y: -38, r: 3, ry: 18, d: 0.82 },
];

const NODES = [
  [-130, -70], [140, -50], [-150, 60], [120, 90], [0, -120], [10, 130],
];

const WORD = "BEINGNOTIFIED".split("");

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"pending" | "play" | "done">("pending");
  const [flight, setFlight] = useState<{ x: number; y: number; s: number } | null>(null);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.intro = "done";
    setPhase("done");
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (seen || reduce || window.location.pathname !== "/") {
      finish();
      return;
    }
    document.documentElement.dataset.intro = "play";
    setPhase("play");

    // Measure the navbar logo so the brand mark can fly into it.
    const measure = window.setTimeout(() => {
      const el = document.getElementById("nav-logo-mark");
      if (!el) return;
      const r = el.getBoundingClientRect();
      setFlight({
        x: r.left + r.width / 2 - window.innerWidth / 2,
        y: r.top + r.height / 2 - window.innerHeight / 2,
        s: r.width / MARK,
      });
    }, 2500);
    const hardStop = window.setTimeout(finish, 4600);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && finish();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(measure);
      window.clearTimeout(hardStop);
      window.removeEventListener("keydown", onKey);
    };
  }, [reduce, finish]);

  const value = useMemo(() => ({ ready: phase === "done" }), [phase]);

  return (
    <IntroContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {phase === "play" && (
          <motion.div
            key="intro"
            className="bn-intro fixed inset-0 z-[10000] overflow-hidden bg-[#09090b] text-white"
            role="dialog"
            aria-label="BeingNotified introduction"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE.inOut } }}
          >
            {/* Scene 1 — signals */}
            <div className="absolute inset-0 grid place-items-center">
              {SIGNALS.map((s, i) => (
                <motion.span
                  key={i}
                  className={`absolute h-1 w-1 rounded-full ${s.red ? "bg-[#ff3158]" : "bg-white"}`}
                  style={{ boxShadow: s.red ? "0 0 12px 2px rgba(255,49,88,.55)" : "0 0 8px 1px rgba(255,255,255,.35)" }}
                  initial={{ opacity: 0, x: `${s.x}vw`, y: `${s.y}vh`, scale: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], x: [`${s.x}vw`, `${s.x}vw`, "0vw", "0vw"], y: [`${s.y}vh`, `${s.y}vh`, "0vh", "0vh"], scale: [0, 1, 1, 0.2] }}
                  transition={{ duration: 1.9, delay: s.d, times: [0, 0.2, 0.8, 1], ease: EASE.inOut }}
                />
              ))}
            </div>

            {/* Scene 2 — content cards converge in subtle 3D */}
            <div className="absolute inset-0 grid place-items-center [perspective:900px]">
              {CARDS.map((c, i) => (
                <motion.div
                  key={i}
                  className="absolute h-[72px] w-[128px] rounded-lg border border-white/25 bg-white/[0.03]"
                  initial={{ opacity: 0, x: `${c.x}vw`, y: `${c.y}vh`, rotateZ: c.r, rotateY: c.ry, scale: 1 }}
                  animate={{ opacity: [0, 0.9, 0.9, 0], x: `0vw`, y: `0vh`, rotateZ: 0, rotateY: 0, scale: [1, 1, 0.9, 0.2] }}
                  transition={{ duration: 1.4, delay: c.d, times: [0, 0.25, 0.75, 1], ease: EASE.inOut }}
                >
                  <span className="absolute left-2 top-2 h-1 w-10 rounded bg-white/30" />
                  <span className="absolute left-2 top-5 h-1 w-16 rounded bg-white/15" />
                  <span className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full bg-[#ff3158]" />
                </motion.div>
              ))}
            </div>

            {/* Scene 3 — intelligence network */}
            <svg className="absolute inset-0 h-full w-full" viewBox="-400 -300 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden>
              {NODES.map(([x, y], i) => (
                <g key={i}>
                  <motion.line
                    x1={x} y1={y} x2={0} y2={0}
                    stroke="#ff3158" strokeWidth={1} strokeOpacity={0.7}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: [0, 1, 1], opacity: [0, 0.9, 0] }}
                    transition={{ duration: 1.0, delay: 1.35 + i * 0.05, times: [0, 0.5, 1], ease: EASE.out }}
                  />
                  <motion.circle
                    cx={x} cy={y} r={3} fill="#fff"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.6] }}
                    transition={{ duration: 1.0, delay: 1.3 + i * 0.05, times: [0, 0.4, 1] }}
                  />
                </g>
              ))}
              <motion.circle
                cx={0} cy={0} r={90} fill="url(#bn-glow)"
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: [0, 0.9, 0.35], scale: [0.2, 1, 1.15] }}
                transition={{ duration: 1.3, delay: 1.5, ease: EASE.out }}
              />
              <defs>
                <radialGradient id="bn-glow">
                  <stop offset="0%" stopColor="#ff3158" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#ff3158" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>

            {/* Scene 4 — brand reveal (mark flies to the navbar logo in Scene 5) */}
            <div className="absolute inset-0 grid place-items-center">
              <motion.div
                className="absolute"
                style={{ width: MARK, height: MARK }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={
                  flight
                    ? { opacity: 1, scale: flight.s, x: flight.x, y: flight.y }
                    : { opacity: 1, scale: 1, x: 0, y: 0 }
                }
                transition={flight ? { duration: 0.7, ease: EASE.inOut } : { duration: 0.7, delay: 1.7, ease: EASE.out }}
                onAnimationComplete={() => flight && finish()}
              >
                <BrandMark size={MARK} />
              </motion.div>

              <motion.div
                className="absolute mt-44 text-center"
                animate={{ opacity: flight ? 0 : 1, y: flight ? 8 : 0 }}
                transition={{ duration: 0.35 }}
              >
                <h1 className="flex justify-center text-3xl font-semibold tracking-[0.32em] sm:text-4xl" aria-label="BeingNotified">
                  {WORD.map((ch, i) => (
                    <motion.span
                      key={i}
                      aria-hidden
                      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.5, delay: 1.95 + i * 0.035, ease: EASE.out }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </h1>
                <motion.p
                  className="mt-3 text-sm text-white/60"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.4 }}
                >
                  Less watching. More knowing.
                </motion.p>
              </motion.div>
            </div>

            <button
              type="button"
              onClick={finish}
              className="absolute bottom-6 right-6 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff3158]"
            >
              Skip intro
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
