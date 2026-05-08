import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";

type Props = {
  primaryLabel: string;
  primaryTo?: string;
  primaryOnClick?: () => void;
  secondaryLabel?: string;
  secondaryTo?: string;
  secondaryOnClick?: () => void;
  showAfter?: number;
};

/**
 * Återanvändbar sticky CTA för mobil. Visas efter scroll.
 * Två klickbara element = primär konvertering + sekundär intern länk
 * (sekundär länk räknas som pageview → minskar bounce rate i analytics).
 */
const StickyMobileCTABar = ({
  primaryLabel,
  primaryTo,
  primaryOnClick,
  secondaryLabel,
  secondaryTo,
  secondaryOnClick,
  showAfter = 400,
}: Props) => {
  const [show, setShow] = useState(false);
  const { isOpen: contactOpen } = useContactModal();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  const visible = show && !contactOpen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-3 mt-3 flex items-stretch gap-2 rounded-2xl border border-white/10 bg-background/95 p-2 shadow-[0_-12px_40px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            {primaryOnClick ? (
              <button
                type="button"
                onClick={primaryOnClick}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/85 px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.8)] active:scale-[0.98] transition-transform"
              >
                {primaryLabel}
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            ) : (
              <Link
                to={primaryTo ?? "#"}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/85 px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.8)] active:scale-[0.98] transition-transform"
              >
                {primaryLabel}
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            )}
            {secondaryLabel && (secondaryOnClick || secondaryTo) && (
              secondaryOnClick ? (
                <button
                  type="button"
                  onClick={secondaryOnClick}
                  className="flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3.5 text-xs font-semibold text-foreground/85 hover:text-foreground active:scale-[0.98] transition-transform"
                >
                  {secondaryLabel}
                </button>
              ) : (
                <Link
                  to={secondaryTo!}
                  className="flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3.5 text-xs font-semibold text-foreground/85 hover:text-foreground active:scale-[0.98] transition-transform"
                >
                  {secondaryLabel}
                </Link>
              )
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyMobileCTABar;
