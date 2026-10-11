"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  color: string;
}

const COLORS = [
  "rgba(196, 175, 255, ", // violet
  "rgba(127, 221, 237, ", // cyan
  "rgba(255, 255, 255, ", // white
  "rgba(214, 190, 245, ", // lavender
];

export function CosmicParticles({ count = 45 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 600);
    let isVisible = true;

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener("resize", resize);

    // Initialize particles
    const particles: Particle[] = Array.from({ length: count }, () => {
      const baseAlpha = Math.random() * 0.5 + 0.2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    });

    // Render once if reduced motion is requested
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.baseAlpha})`;
        ctx.fill();
      });
      return () => {
        window.removeEventListener("resize", resize);
      };
    }

    // Visibility observer to pause loop when not on screen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    let angle = 0;
    const render = () => {
      if (isVisible && !document.hidden) {
        ctx.clearRect(0, 0, width, height);
        angle += 0.015;

        particles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap edges
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Subtle twinkle/pulsing alpha
          const currentAlpha =
            p.baseAlpha + Math.sin(angle * p.pulseSpeed * 20 + idx) * 0.2;
          const safeAlpha = Math.max(0.08, Math.min(0.85, currentAlpha));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${safeAlpha})`;
          ctx.shadowBlur = p.radius > 1.2 ? 6 : 0;
          ctx.shadowColor = `${p.color}0.6)`;
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: -1,
      }}
    />
  );
}
