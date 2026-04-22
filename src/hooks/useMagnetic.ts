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

  // Scale spring for touch feedback (press-down micro-interaction)
  const scaleMV = useMotionValue(1);
  const scale = useSpring(scaleMV, { stiffness: 300, damping: 22, mass: 0.4 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (reduce) return;

    // Touch / coarse pointer: subtle scale press-feedback instead of magnetic follow
    if (!fineHover) {
      const handleDown = () => scaleMV.set(0.96);
      const handleUp = () => scaleMV.set(1);

      el.addEventListener("touchstart", handleDown, { passive: true });
      el.addEventListener("touchend", handleUp, { passive: true });
      el.addEventListener("touchcancel", handleUp, { passive: true });
      el.addEventListener("pointerdown", handleDown);
      el.addEventListener("pointerup", handleUp);
      el.addEventListener("pointerleave", handleUp);

      return () => {
        el.removeEventListener("touchstart", handleDown);
        el.removeEventListener("touchend", handleUp);
        el.removeEventListener("touchcancel", handleUp);
        el.removeEventListener("pointerdown", handleDown);
        el.removeEventListener("pointerup", handleUp);
        el.removeEventListener("pointerleave", handleUp);
      };
    }

    // Fine pointer (mouse/trackpad): magnetic follow, only while hovering element
    let hovering = false;

    const handleEnter = () => {
      hovering = true;
    };

    const handleMove = (e: MouseEvent) => {
      if (!hovering) return;
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
      hovering = false;
      x.set(0);
      y.set(0);
    };

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mousemove", handleMove as EventListener);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mousemove", handleMove as EventListener);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [strength, radius, x, y, scaleMV]);

  return { ref, x: springX, y: springY, scale };
}
