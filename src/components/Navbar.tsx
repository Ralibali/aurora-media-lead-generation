import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { List, X, CaretDown, ArrowUpRight } from "@phosphor-icons/react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { useContactModal } from "@/components/ContactModal";

const services = [
  { label: "SaaS & MVP", to: "/priser", primary: true },
  { label: "Hemsidor", to: "/tjanster/hemsidor" },
  { label: "E-handel", to: "/tjanster/ehandel" },
  { label: "Mobilapp", to: "/tjanster/mobilapp" },
  { label: "SEO", to: "/tjanster/seo" },
  { label: "Google Ads", to: "/tjanster/google-ads" },
  { label: "Meta Ads", to: "/tjanster/meta-ads" },
  { label: "Content", to: "/tjanster/content" },
  { label: "Grafisk profil", to: "/tjanster/grafisk-profil" },
  { label: "Fotografering", to: "/tjanster/fotografering" },
];

const navItems = [
  { label: "Arbete", to: "/arbete" },
  { label: "Priser", to: "/priser" },
  { label: "Artiklar", to: "/blog" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { open: openModal } = useContactModal();
  const { scrollY } = useScroll();
  const navigate = useNavigate();

  // Smooth shrink: from 1.5 padding to 1 padding when scrolled
  const padding = useTransform(scrollY, [0, 120], [6, 4]);
  const top = useTransform(scrollY, [0, 120], [16, 12]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Fluid Island — desktop */}
      <motion.header
        style={{ top, padding }}
        className="fixed left-1/2 z-50 hidden -translate-x-1/2 md:block"
      >
        <motion.nav
          animate={{
            backgroundColor: scrolled
              ? "hsla(0, 0%, 6%, 0.85)"
              : "hsla(0, 0%, 6%, 0.65)",
            backdropFilter: scrolled ? "blur(24px)" : "blur(16px)",
          }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="flex items-center gap-1 rounded-full border border-white/10 px-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]"
        >
          {/* Logo */}
          <Link
            to="/"
            className="ml-3 mr-2 font-serif text-base tracking-tight text-white/95 transition-opacity hover:opacity-80"
          >
            Aurora
          </Link>

          <span className="h-5 w-px bg-white/10" aria-hidden />

          {/* Center links */}
          <div className="flex items-center gap-1 px-2">
            {/* Tjänster dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-expanded={servicesOpen}
              >
                Tjänster
                <CaretDown weight="bold" size={11} />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute left-1/2 top-full -translate-x-1/2 pt-3"
                  >
                    <div className="w-64 overflow-hidden rounded-2xl border border-white/10 bg-[hsl(0_0%_8%)]/95 p-2 shadow-2xl backdrop-blur-xl">
                      {services.map((s) => (
                        <button
                          key={s.to}
                          onClick={() => {
                            setServicesOpen(false);
                            navigate(s.to);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                            s.primary ? "text-white" : "text-white/65 hover:text-white"
                          }`}
                        >
                          <span>{s.label}</span>
                          {s.primary && (
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[hsl(154_44%_55%)]">
                              Primär
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/blog"}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-white/10 ${
                    isActive ? "text-white" : "text-white/70 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* CTA pill — button-in-button */}
          <button onClick={() => openModal()} className="ml-1 group">
            <span className="flex items-center gap-2 rounded-full bg-white py-1 pl-4 pr-1 text-sm text-[hsl(0_0%_8%)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]">
              Starta projekt
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(0_0%_8%)] text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px]">
                <ArrowUpRight weight="bold" size={13} />
              </span>
            </span>
          </button>
        </motion.nav>
      </motion.header>

      {/* Mobile bar */}
      <div className="fixed left-3 right-3 top-3 z-50 md:hidden">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-[hsl(0_0%_6%)]/85 px-4 py-2 shadow-lg backdrop-blur-xl">
          <Link
            to="/"
            className="font-serif text-base tracking-tight text-white/95"
          >
            Aurora
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/15"
            aria-label={open ? "Stäng meny" : "Öppna meny"}
            aria-expanded={open}
          >
            <motion.span
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="flex"
            >
              {open ? (
                <X weight="bold" size={18} />
              ) : (
                <List weight="bold" size={18} />
              )}
            </motion.span>
          </button>
        </div>
      </div>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-[hsl(0_0%_6%)]/95 px-6 pb-12 pt-24 backdrop-blur-3xl md:hidden"
          >
            <div className="flex flex-col gap-1 text-white">
              {[
                { label: "Arbete", to: "/arbete" },
                { label: "Priser", to: "/priser" },
                { label: "Artiklar", to: "/blog" },
              ].map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + i * 0.05,
                    duration: 0.4,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                >
                  <NavLink
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block border-b border-white/10 py-5 font-serif text-3xl tracking-tight"
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="border-b border-white/10 py-5"
              >
                <p className="font-serif text-3xl tracking-tight">Tjänster</p>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                  {services.map((s) => (
                    <NavLink
                      key={s.to}
                      to={s.to}
                      onClick={() => setOpen(false)}
                      className="text-sm text-white/65 transition-colors hover:text-white"
                    >
                      {s.label}
                    </NavLink>
                  ))}
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                onClick={() => {
                  setOpen(false);
                  openModal();
                }}
                className="mt-8 group"
              >
                <span className="flex w-full items-center justify-between rounded-full bg-white py-2 pl-6 pr-2 text-base text-[hsl(0_0%_8%)] transition-transform active:scale-[0.98]">
                  Starta projekt
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(0_0%_8%)] text-white">
                    <ArrowUpRight weight="bold" size={16} />
                  </span>
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
