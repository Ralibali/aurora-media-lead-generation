import { ReactNode, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { trackAiKartaClick } from "@/lib/aiKartaTracking";
import { NORDIC_TOKENS } from "@/styles/nordic-tokens";

export const Reveal = ({
  children,
  delay = 0,
  y = 24,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.85, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const NAV_ITEMS = [
  { label: "AI-kartan", to: "/ai-karta" },
  { label: "Arbete", to: "/arbete" },
  { label: "Tjänster", to: "/tjanster" },
  { label: "Priser", to: "/priser" },
  { label: "Om", to: "/om" },
];

const NordicNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, (value) => `${Math.max(6, value * 100)}%`);
  const { open } = useContactModal();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <a href="#main" className="skip-link">
        Hoppa till innehållet
      </a>

      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <Link to="/" className="brand" aria-label="Aurora Media — startsida">
          aurora<span className="glyph">.✦</span>
        </Link>

        <nav className="nav-menu" aria-label="Huvudmeny">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <motion.div
            className="nav-progress"
            style={{ ["--p" as never]: progress } as never}
            aria-hidden
          />
          <button
            type="button"
            onClick={() => open()}
            className="nav-consultation"
            data-desktop-action
          >
            Boka rådgivning
          </button>
          <Link
            to="/ai-karta"
            className="btn btn-moss"
            data-desktop-action
            onClick={() => void trackAiKartaClick("nav_cta")}
          >
            Starta AI-kartan <span className="a"><ArrowRight size={14} /></span>
          </Link>
          <button
            type="button"
            className={`nav-burger ${mobileOpen ? "open" : ""}`}
            aria-label={mobileOpen ? "Stäng meny" : "Öppna meny"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            <span /> <span /> <span />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="mob-menu" role="dialog" aria-modal="true" aria-label="Meny">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
          <div className="mobile-menu-actions">
            <Link
              to="/ai-karta"
              className="btn btn-moss"
              onClick={() => void trackAiKartaClick("mobile_nav_cta")}
            >
              Starta AI-kartan <span className="a"><ArrowRight size={14} /></span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                open();
              }}
              className="btn btn-ghost"
            >
              Boka kostnadsfri rådgivning
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const NordicFooter = () => (
  <footer className="foot">
    <div className="wrap">
      <div className="foot-grid">
        <div>
          <Link to="/" className="brand" style={{ fontSize: 22 }}>
            aurora<span className="glyph">.✦</span>
          </Link>
          <p style={{ marginTop: 18, color: "var(--bone-mute)", maxWidth: "38ch" }}>
            Aurora Media AB bygger AI-lösningar, interna system, appar och SaaS för
            svenska företag. Bas i Linköping, arbete i hela Sverige.
          </p>
          <p style={{ marginTop: 22 }}>
            <span className="meta-label">Org.nr</span>
            <br />
            <span style={{ color: "var(--bone-soft)" }}>559272-0220</span>
          </p>
        </div>

        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>Lösningar</p>
          <Link to="/ai-byra-linkoping">AI-konsult i Linköping</Link>
          <Link to="/ai-automation-foretag">AI-automation</Link>
          <Link to="/tjanster">Interna system & SaaS</Link>
          <Link to="/tjanster/mobilapp">Apputveckling</Link>
        </div>

        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>Resurser</p>
          <Link to="/ai-karta">Kostnadsfri AI-karta</Link>
          <Link to="/blogg/ai-for-foretag-linkoping">AI för företag i Linköping</Link>
          <Link to="/blogg/ersatta-excel-med-internt-system">Ersätta Excel</Link>
          <Link to="/blogg">Alla guider</Link>
        </div>

        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>Företag</p>
          <Link to="/arbete">Arbete</Link>
          <Link to="/process">Process</Link>
          <Link to="/priser">Paket & pris</Link>
          <Link to="/om">Om Aurora Media</Link>
          <Link to="/kontakt">Kontakt</Link>
          <a href="mailto:info@auroramedia.se">info@auroramedia.se</a>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--hair)", marginBlock: 32 }} />

      <div className="foot-bottom">
        <span>© {new Date().getFullYear()} Aurora Media AB — 559272-0220</span>
        <span>Linköping · Sverige · Svarstid normalt inom 24 h vardagar</span>
        <Link to="/integritetspolicy">Integritetspolicy</Link>
      </div>
    </div>
  </footer>
);

const NordicLayout = ({
  children,
  hideNav = false,
  hideFooter = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
  hideFooter?: boolean;
}) => (
  <>
    <style>{NORDIC_TOKENS}</style>
    <div className="aur">
      {!hideNav && <NordicNav />}
      <main>{children}</main>
      {!hideFooter && <NordicFooter />}
    </div>
  </>
);

export default NordicLayout;
