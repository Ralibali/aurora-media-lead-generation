import { ReactNode, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CITIES, FilmFooter, FilmHeader } from "@/components/film/FilmChrome";
import "@/styles/verkstad.css";
import "@/styles/aurora-theme.css";

/* ─────────────────────────────────────────────────────────────
   Nordisk Verkstad — shared layout primitives.
   Extracted from src/pages/Index.tsx so alla sidor (start + verktyg)
   återanvänder samma nav/footer/reveal utan duplicering.
   ───────────────────────────────────────────────────────────── */

export const Reveal = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => {
  const reduce = useReducedMotion();
  const [forceShow, setForceShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceShow(true), 1200);
    return () => clearTimeout(t);
  }, []);
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      animate={forceShow ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

/** Every verkstad page shares the AURORA.md header, index menu and footer. */
export const VkNav = () => <FilmHeader variant="page" />;

export { CITIES };

export const VkFooter = ({ cta = true }: { cta?: boolean } = {}) => <FilmFooter cta={cta} />;

/**
 * VerkstadLayout — full page shell in nordisk verkstad-designen.
 * Wraps content in .verkstad, adds sticky nav and footer.
 */
export const VerkstadLayout = ({ children }: { children: ReactNode }) => (
  <div className="verkstad">
    <VkNav />
    <main id="main">{children}</main>
    <VkFooter />
  </div>
);

export default VerkstadLayout;