import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Play } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";

const NAV = [
  { label: "AI-kartan", href: "/ai-karta", type: "route" },
  { label: "AI & automation", href: "/ai-automation-foretag", type: "route" },
  { label: "Tjänster", href: "#tjanster", type: "section" },
  { label: "Process", href: "#process", type: "section" },
  { label: "Paket", href: "#paket", type: "section" },
];

const AuroraLogo = () => (
  <Link to="/" className="group flex items-center gap-3">
    <span
      className="grid h-9 w-9 place-items-center border border-blue-300/35 bg-blue-500/10 shadow-[0_0_28px_rgba(59,130,246,0.55)]"
      aria-hidden
    >
      <span className="relative h-3 w-3 rounded-full bg-blue-300 shadow-[0_0_18px_rgba(147,197,253,0.95)]">
        <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 bg-blue-200/70" />
        <span className="absolute left-1/2 top-1/2 h-5 w-px -translate-x-1/2 -translate-y-1/2 bg-blue-200/70" />
      </span>
    </span>
    <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-white">
      Aurora Media
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

  const goToNav = (href: string, type: string) => {
    if (type === "route") {
      navigate(href);
      return;
    }

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        animate={{
          backgroundColor: scrolled ? "rgba(0,0,0,0.42)" : "rgba(0,0,0,0)",
          backdropFilter: scrolled ? "blur(18px)" : "blur(0px)",
          borderBottomColor: scrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0)",
        }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-x-0 top-0 z-50 border-b"
      >
        <div className="flex h-[70px] w-full items-center px-6 sm:px-10 lg:px-[70px]">
          <AuroraLogo />

          <nav className="ml-auto mr-12 hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={(e) => {
                  e.preventDefault();
                  goToNav(n.href, n.type);
                }}
                className="text-[0.85rem] font-normal text-white/60 transition-colors hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <button
            onClick={() => open()}
            className="hidden h-[52px] w-[52px] place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/15 md:grid"
            aria-label="Boka kostnadsfri rådgivning"
          >
            <Play size={17} fill="currentColor" className="ml-0.5" />
          </button>

          <button
            className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl md:hidden"
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
            style={{ background: "rgba(0,0,0,0.96)", backdropFilter: "blur(24px)" }}
          >
            <div className="flex flex-col gap-1">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    setTimeout(() => goToNav(n.href, n.type), 120);
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.35 }}
                  className="block border-b border-white/10 py-5 font-display text-3xl text-white"
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
                className="lumina-primary-cta group mt-8 justify-center"
                style={{ width: "100%" }}
              >
                <span className="relative z-10">Boka AI-genomlysning</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuroraNavbar;
