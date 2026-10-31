"use client";

import React, { useRef, useImperativeHandle, forwardRef, useEffect } from "react";

export interface PixelRippleHandle {
  trigger: (x: number, y: number, onComplete?: () => void) => void;
}

export const PixelRippleTransition = forwardRef<PixelRippleHandle, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    trigger: (originX: number, originY: number, onComplete?: () => void) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        onComplete?.();
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        onComplete?.();
        return;
      }

      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);

      const CELL = 20; // Pixel tile size
      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);

      const maxDist = Math.max(
        Math.hypot(originX, originY),
        Math.hypot(width - originX, originY),
        Math.hypot(originX, height - originY),
        Math.hypot(width - originX, height - originY)
      );

      // Fast, snappy ripple duration (420ms)
      const DURATION = 420;
      const startTime = performance.now();
      let completedCalled = false;

      const palette = [
        "rgba(99, 102, 241, ", // Indigo
        "rgba(56, 189, 248, ", // Cyan
        "rgba(168, 85, 247, ", // Purple
        "rgba(16, 185, 129, ", // Emerald
        "rgba(244, 114, 182, ", // Pink
      ];

      function render(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / DURATION, 1);

        // Always clear canvas each frame - NEVER leave a black screen
        ctx!.clearRect(0, 0, width, height);

        // Radius of the expanding ripple wavefront
        const waveRadius = progress * (maxDist * 1.25);
        const waveWidth = 200; // Active wavefront thickness

        // Fade out overall alpha as wave completes
        const globalFade = 1 - Math.pow(progress, 2.5);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cellCenterX = c * CELL + CELL / 2;
            const cellCenterY = r * CELL + CELL / 2;
            const dist = Math.hypot(cellCenterX - originX, cellCenterY - originY);

            const diff = waveRadius - dist;

            if (diff > -20 && diff < waveWidth) {
              const waveNorm = Math.max(0, Math.min(1, (diff + 20) / (waveWidth + 20)));
              const pseudoRand = ((c * 17 + r * 31 + Math.floor(elapsed / 30)) % 10) / 10;
              const scale = Math.sin(waveNorm * Math.PI) * (0.8 + pseudoRand * 0.35);

              if (scale > 0.05) {
                const colorBase = palette[(c + r + Math.floor(elapsed / 50)) % palette.length];
                const alpha = Math.min(1, scale * 1.1 * globalFade);

                ctx!.fillStyle = `${colorBase}${alpha.toFixed(2)})`;

                const drawSize = Math.min(CELL, CELL * Math.max(0.15, scale));
                const offset = (CELL - drawSize) / 2;

                ctx!.fillRect(
                  c * CELL + offset,
                  r * CELL + offset,
                  drawSize,
                  drawSize
                );
              }
            }
          }
        }

        // Call navigation early while wave is expanding so transition feels instantaneous
        if (progress >= 0.25 && !completedCalled) {
          completedCalled = true;
          onComplete?.();
        }

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(render);
        } else {
          // Clean finish: completely clear canvas
          ctx!.clearRect(0, 0, width, height);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    },
  }));

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 select-none"
    />
  );
});

PixelRippleTransition.displayName = "PixelRippleTransition";
