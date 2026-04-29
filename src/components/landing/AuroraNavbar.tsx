import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";

const NAV = [
  { label: "Tjänster", href: "#tjanster" },
  { label: "Branscher", href: "#branscher" },
  { label: "Process", href: "#process" },
  { label: "Projekt", href: "#projekt" },
  { label: "Paket", href: "#paket" },
];

const AuroraLogo = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <span
      className="grid h-8 w-8 place-items-center rounded-lg font-display text-base"
      style={{
        background:
          "linear-gradient(135deg, hsl(152 80% 50%), hsl(160 70% 28%))",
        color: "hsl(160 24% 6%)",
        boxShadow: "0 8px 24px -12px hsl(152 80% 50% / 0.7)",
      }}
      aria-hidden
    >
      A
    </span>
    <span className="font-display text-[15px] tracking-[-0.01em] text-[hsl(var(--au-cream))]">
      AURORA MEDIA
    </span>
  </Link>
);

const smoothTo = (href: string) => {
  if (!href.startsWith("#")) return;
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const AuroraNavbar = () => {
  const { open } = useContactModal();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const goToSection = (href: string) => {
    if (location.pathname === "/") {
      smoothTo(href);
      return;
    }
    navigate(`/${href}`);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        animate={{
          backgroundColor: scrolled ? "hsl(160 24% 4% / 0.78)" : "hsl(160 24% 4% / 0)",
          backdropFilter: scrolled ? "blur(18px)" : "blur(0px)",
          borderBottomColor: scrolled
            ? "hsl(42 38% 92% / 0.06)"
            : "hsl(42 38% 92% / 0)",
        }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-x-0 top-0 z-50 border-b"
      >
        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-5 md:px-8">
          <AuroraLogo />

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={(e) => {
                  e.preventDefault();
                  goToSection(n.href);
                }}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-[hsl(var(--au-cream)/0.72)] transition-colors hover:bg-[hsl(var(--au-cream)/0.05)] hover:text-[hsl(var(--au-cream))]"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <button
              onClick={() => open()}
              className="au-btn-coral"
              style={{
                padding: scrolled ? "0.6rem 1.05rem" : "0.95rem 1.5rem",
                fontSize: scrolled ? "0.85rem" : "0.95rem",
                transition:
                  "padding 0.35s cubic-bezier(0.32,0.72,0,1), font-size 0.35s cubic-bezier(0.32,0.72,0,1), transform 0.35s cubic-bezier(0.32,0.72,0,1), box-shadow 0.35s cubic-bezier(0.32,0.72,0,1)",
              }}
              aria-label="Boka kostnadsfri rådgivning"
            >
              {scrolled ? "Boka" : "Boka rådgivning"}
              <ArrowRight size={scrolled ? 14 : 16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--au-cream)/0.12)] bg-[hsl(var(--au-cream)/0.04)] text-[hsl(var(--au-cream))] md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Stäng meny" : "Öppna meny"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-y-auto px-6 pb-12 pt-24 md:hidden"
            style={{ background: "hsl(160 24% 4% / 0.97)", backdropFilter: "blur(24px)" }}
          >
            <div className="flex flex-col gap-1">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    setTimeout(() => goToSection(n.href), 120);
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.35 }}
                  className="block border-b border-[hsl(var(--au-cream)/0.08)] py-5 font-display text-3xl text-[hsl(var(--au-cream))]"
                >
                  {n.label}
                </motion.a>
              ))}
              <motion.button
                onClick={() => {
                  setMobileOpen(false);
                  setTimeout(() => open(), 200);
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.35 }}
                className="au-btn-coral mt-8 justify-center text-base"
                style={{ width: "100%" }}
              >
                Boka rådgivning
                <ArrowRight size={18} strokeWidth={2.5} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuroraNavbar;
