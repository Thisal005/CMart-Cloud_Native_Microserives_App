"use client";

import { useEffect, useRef, useState } from "react";

interface MouseOffset {
  x: number;
  y: number;
}

export function useMouseParallax<T extends HTMLElement = HTMLDivElement>(lerpFactor = 0.08) {
  const containerRef = useRef<T | null>(null);
  const [offset, setOffset] = useState<MouseOffset>({ x: 0, y: 0 });

  useEffect(() => {
    // Check for reduced motion or touch screens
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId: number;
    let isHovering = false;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized between -1 and 1
      targetX = Math.max(-1, Math.min(1, (event.clientX - centerX) / (rect.width / 2)));
      targetY = Math.max(-1, Math.min(1, (event.clientY - centerY) / (rect.height / 2)));
      isHovering = true;
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      isHovering = false;
    };

    const animate = () => {
      // Linear interpolation
      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;

      setOffset({
        x: Math.round(currentX * 1000) / 1000,
        y: Math.round(currentY * 1000) / 1000,
      });

      // Keep animating if there's remaining momentum or still hovering
      if (
        isHovering ||
        Math.abs(currentX - targetX) > 0.001 ||
        Math.abs(currentY - targetY) > 0.001
      ) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const onEnter = () => {
      animationFrameId = requestAnimationFrame(animate);
    };

    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [lerpFactor]);

  return { containerRef, offset };
}
