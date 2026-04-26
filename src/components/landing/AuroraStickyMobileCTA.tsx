import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";

const AuroraStickyMobileCTA = () => {
  const { open } = useContactModal();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="fixed bottom-3 left-3 right-3 z-40 md:hidden"
        >
          <button
            onClick={() => open()}
            className="au-btn-coral w-full justify-center"
            style={{ width: "100%", padding: "1.05rem 1.25rem", fontSize: "1rem" }}
          >
            Boka kostnadsfri rådgivning
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuroraStickyMobileCTA;
