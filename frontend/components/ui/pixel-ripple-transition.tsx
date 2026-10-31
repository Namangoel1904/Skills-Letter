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

      // Resize canvas to full window
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);

      const CELL = 22; // Pixel block size
      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);

      // Max distance from click point to furthest corner
      const maxDist = Math.max(
        Math.hypot(originX, originY),
        Math.hypot(width - originX, originY),
        Math.hypot(originX, height - originY),
        Math.hypot(width - originX, height - originY)
      );

      const DURATION = 650; // ms
      const startTime = performance.now();
      let completedCalled = false;

      const palette = [
        "rgba(99, 102, 241, 0.95)", // Indigo
        "rgba(56, 189, 248, 0.95)", // Cyan
        "rgba(168, 85, 247, 0.95)", // Purple
        "rgba(16, 185, 129, 0.95)", // Emerald
        "rgba(15, 23, 42, 0.98)",   // Slate
        "rgba(9, 9, 11, 1.0)",      // Obsidian
      ];

      function render(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / DURATION, 1);

        // Clear canvas with subtle trail
        ctx!.clearRect(0, 0, width, height);

        // Radius of the expanding ripple wavefront
        const waveRadius = progress * (maxDist * 1.3);
        const waveWidth = 260; // thickness of the active ripple band

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cellCenterX = c * CELL + CELL / 2;
            const cellCenterY = r * CELL + CELL / 2;
            const dist = Math.hypot(cellCenterX - originX, cellCenterY - originY);

            // Check if cell is within the expanding ripple wavefront
            const diff = waveRadius - dist;

            if (diff > -40 && diff < waveWidth) {
              // Normalized position in the wave (0 at front, 1 at back)
              const waveNorm = Math.max(0, Math.min(1, (diff + 40) / (waveWidth + 40)));

              // Organic pixelation factor
              const pseudoRand = ((c * 17 + r * 31 + Math.floor(elapsed / 40)) % 10) / 10;
              const scale = Math.sin(waveNorm * Math.PI) * (0.85 + pseudoRand * 0.3);

              if (scale > 0.05) {
                const colorIdx = (c + r + Math.floor(elapsed / 60)) % palette.length;
                ctx!.fillStyle = palette[colorIdx];

                const drawSize = Math.min(CELL, CELL * Math.max(0.1, scale));
                const offset = (CELL - drawSize) / 2;

                ctx!.fillRect(
                  c * CELL + offset,
                  r * CELL + offset,
                  drawSize,
                  drawSize
                );
              }
            } else if (diff >= waveWidth && progress > 0.45) {
              // Trailing pixel wipe that smoothly blankets into the destination page
              const wipeProgress = (progress - 0.45) / 0.55;
              const fillRand = ((c * 13 + r * 29) % 10) / 10;

              if (fillRand < wipeProgress * 1.2) {
                ctx!.fillStyle = "rgba(10, 10, 12, 0.96)";
                ctx!.fillRect(c * CELL, r * CELL, CELL, CELL);
              }
            }
          }
        }

        // Trigger callback right before animation finishes so transition is seamless
        if (progress >= 0.75 && !completedCalled) {
          completedCalled = true;
          onComplete?.();
        }

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(render);
        } else {
          // Keep the screen covered momentarily until page unmounts
          ctx!.fillStyle = "rgba(10, 10, 12, 1.0)";
          ctx!.fillRect(0, 0, width, height);
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
