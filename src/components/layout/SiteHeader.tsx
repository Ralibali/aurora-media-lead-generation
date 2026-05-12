import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const NAV = [
  { label: "Arbete", href: "/arbete" },
  { label: "Produkter", href: "/produkter" },
  { label: "Tjänster", href: "/tjanster" },
  { label: "Kontakt", href: "/kontakt" },
];

const SiteHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(16, 15, 13, 0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "0.5px solid rgba(237, 233, 220, 0.12)" : "0.5px solid transparent",
        }}
      >
        <div className="site-container">
          <div className="flex h-[60px] items-center justify-between">
            {/* Wordmark */}
            <Link
              to="/"
              aria-label="Aurora Media AB – startsida"
              className="font-sans text-[17px] font-medium tracking-[-0.02em] text-cream transition-opacity hover:opacity-70"
              style={{ letterSpacing: "-0.02em" }}
            >
              aurora.
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Huvudnavigation" className="hidden items-center gap-7 md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  to={n.href}
                  aria-label={n.label}
                  className="font-sans text-[13px] transition-colors"
                  style={{ color: "rgba(237, 233, 220, 0.65)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EDE9DC")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237, 233, 220, 0.65)")}
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            {/* CTA pill */}
            <Link
              to="/kontakt"
              className="hidden items-center rounded-lg border px-3.5 py-1.5 font-sans text-[12px] transition-all md:flex"
              style={{
                borderWidth: "0.5px",
                borderColor: "rgba(237, 233, 220, 0.30)",
                color: "#EDE9DC",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(237, 233, 220, 0.60)";
                e.currentTarget.style.backgroundColor = "rgba(237, 233, 220, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(237, 233, 220, 0.30)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Begär offert
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Stäng meny" : "Öppna meny"}
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
            >
              <span
                className="block h-px w-5 bg-cream transition-all duration-200"
                style={{ transform: mobileOpen ? "translateY(3px) rotate(45deg)" : "none" }}
              />
              <span
                className="block h-px w-5 bg-cream transition-all duration-200"
                style={{
                  opacity: mobileOpen ? 0 : 1,
                  transform: mobileOpen ? "scaleX(0)" : "none",
                }}
              />
              <span
                className="block h-px w-5 bg-cream transition-all duration-200"
                style={{ transform: mobileOpen ? "translateY(-3px) rotate(-45deg)" : "none" }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col px-5 pt-20 pb-10 md:hidden"
            style={{ backgroundColor: "#100F0D" }}
          >
            <nav aria-label="Mobilnavigation" className="flex flex-col">
              {NAV.map((n, i) => (
                <motion.div
                  key={n.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    to={n.href}
                    className="block border-b py-5 font-serif text-[32px] text-cream"
                    style={{ borderColor: "rgba(237, 233, 220, 0.12)" }}
                  >
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10"
            >
              <Link
                to="/kontakt"
                className="inline-flex rounded-lg border px-5 py-3 font-sans text-[13px] font-medium text-cream"
                style={{ borderWidth: "0.5px", borderColor: "rgba(237, 233, 220, 0.30)" }}
              >
                Begär offert →
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SiteHeader;
