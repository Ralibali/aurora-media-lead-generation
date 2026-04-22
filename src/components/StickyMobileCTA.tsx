import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContactModal } from "@/components/ContactModal";

const StickyMobileCTA = () => {
  const { open } = useContactModal();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        >
          <button
            onClick={() => open()}
            className="flex h-14 w-full items-center justify-center bg-primary text-base font-medium text-primary-foreground shadow-lg active:scale-[0.98]"
          >
            Starta projekt
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyMobileCTA;
