import { useRef, useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * Magnetic hover physics. Returns a ref + spring x/y motion values.
 * Apply to any element via `style={{ x, y }}`.
 *
 * - strength: how strongly the element follows the cursor (0..1)
 * - radius: pixels around the element where attraction begins
 */
export function useMagnetic({
  strength = 0.35,
  radius = 90,
}: { strength?: number; radius?: number } = {}) {
  const ref = useRef<HTMLElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip on touch / reduced motion
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const max = Math.max(rect.width, rect.height) / 2 + radius;

      if (dist < max) {
        const falloff = 1 - dist / max;
        x.set(dx * strength * falloff);
        y.set(dy * strength * falloff);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const handleLeave = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [strength, radius, x, y]);

  return { ref, x: springX, y: springY };
}
