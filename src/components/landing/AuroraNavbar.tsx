import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContactModal } from "@/components/MvpContactModal";
import auroraMonogram from "@/assets/aurora-monogram.png";

const NAV = [
  { label: "Case", href: "#projekt", type: "section" },
  { label: "Process", href: "#process", type: "section" },
  { label: "Paket", href: "#paket", type: "section" },
  { label: "Metodik", href: "/metodik", type: "route" },
  { label: "Kontakt", href: "/kontakt", type: "route" },
];

const AuroraLogo = () => (
  <Link to="/" className="group flex items-center gap-3" aria-label="Aurora Media AB – startsida">
    <span
      className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]"
      aria-hidden
    >
      <img
        src={auroraMonogram}
        alt=""
        className="h-full w-full object-cover scale-[1.18]"
        draggable={false}
      />
    </span>
    <span className="flex flex-col leading-tight">
      <span className="font-display text-[15px] font-bold uppercase tracking-[0.32em] text-foreground">
        Aurora Media
      </span>
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        AI-byrån
      </span>
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
      if (location.pathname === href) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate(href);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 0);
      }
      return;
    }
    if (location.pathname === "/") return smoothTo(href);
    navigate(`/${href}`);
    setTimeout(() => smoothTo(href), 350);
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
          backgroundColor: scrolled ? "hsl(var(--background) / 0.85)" : "hsl(var(--background) / 0)",
          backdropFilter: scrolled ? "blur(18px)" : "blur(0px)",
          borderBottomColor: scrolled ? "hsl(var(--border) / 0.6)" : "hsl(var(--border) / 0)",
        }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-x-0 top-0 z-50 border-b"
      >
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center px-6 sm:px-10 lg:px-12">
          <AuroraLogo />

          <nav className="ml-auto mr-8 hidden items-center gap-7 md:flex">
            {NAV.map((n) => {
              const isActive = n.type === "route" && location.pathname === n.href;
              return (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={(e) => { e.preventDefault(); goToNav(n.href, n.type); }}
                  className={`text-sm font-medium transition-colors hover:text-foreground ${isActive ? "text-foreground" : "text-foreground/60"}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {n.label}
                </a>
              );
            })}
          </nav>

          <button
            onClick={() => open("Standard MVP")}
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.55)] transition hover:brightness-110 md:inline-flex"
          >
            Boka MVP-samtal
          </button>

          <button
            className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-border bg-card/80 text-foreground backdrop-blur-xl md:hidden"
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-background/97 px-6 pb-12 pt-24 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.href} href={n.href}
                  onClick={(e) => {
                    e.preventDefault(); setMobileOpen(false);
                    setTimeout(() => goToNav(n.href, n.type), 120);
                  }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.35 }}
                  className="block border-b border-border py-5 font-display text-3xl text-foreground"
                >
                  {n.label}
                </motion.a>
              ))}
              <motion.button
                onClick={() => { setMobileOpen(false); setTimeout(() => open("Standard MVP"), 200); }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.35 }}
                className="mt-8 w-full rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground"
              >
                Boka MVP-samtal
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuroraNavbar;
