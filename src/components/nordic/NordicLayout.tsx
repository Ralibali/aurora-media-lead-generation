import { ReactNode, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { NORDIC_TOKENS } from "@/styles/nordic-tokens";

/* ─────────────────────────────────────────────────────────────────────────
   NordicLayout — delar Nordic Noir-shell (tokens + nav + footer) över alla sidor.
   Användning:
     <NordicLayout>
       <section className="section">…</section>
     </NordicLayout>
   ───────────────────────────────────────────────────────────────────────── */

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
  { label: "Arbete", to: "/arbete" },
  { label: "Tjänster", to: "/tjanster" },
  { label: "Process", to: "/process" },
  { label: "Priser", to: "/priser" },
  { label: "Om", to: "/om" },
];

const NordicNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, (v) => `${Math.max(6, v * 100)}%`);
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
      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <Link to="/" className="brand" aria-label="Aurora Media — startsida">
          aurora<span className="glyph">.✦</span>
        </Link>
        <nav className="nav-menu" aria-label="Huvudmeny">
          {NAV_ITEMS.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center" }}>
          <motion.div
            className="nav-progress"
            style={{ ["--p" as never]: progress } as never}
            aria-hidden
          />
          <button
            onClick={() => open()}
            className="btn btn-ghost"
            style={{ display: "none" }}
            // visa knappen från md+
            data-cta="desktop"
          >
            Boka rådgivning{" "}
            <span className="a">
              <ArrowRight size={14} />
            </span>
          </button>
          <button
            type="button"
            className={`nav-burger ${mobileOpen ? "open" : ""}`}
            aria-label={mobileOpen ? "Stäng meny" : "Öppna meny"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span /> <span /> <span />
          </button>
        </div>
      </header>

      {/* Inline CSS rule that re-shows the desktop CTA from md+ — kept here to avoid editing tokens */}
      <style>{`@media(min-width:980px){ .aur .nav button[data-cta="desktop"]{ display:inline-flex !important; } }`}</style>

      {mobileOpen && (
        <div className="mob-menu" role="dialog" aria-modal="true" aria-label="Meny">
          {NAV_ITEMS.map((n) => (
            <Link key={n.to} to={n.to}>
              {n.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              open();
            }}
            className="btn btn-moss"
            style={{ marginTop: 28, alignSelf: "flex-start" }}
          >
            Boka kostnadsfri rådgivning{" "}
            <span className="a">
              <ArrowRight size={14} />
            </span>
          </button>
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
          <p style={{ marginTop: 18, color: "var(--bone-mute)", maxWidth: "36ch" }}>
            Aurora Media AB — AI-driven mjukvarubyrå i Linköping. Vi bygger SaaS,
            MVP:er, interna system, webbappar, mobilappar, e-handel, integrationer
            och automatiseringar för svenska företag.
          </p>
          <p style={{ marginTop: 22 }}>
            <span className="meta-label">Org.nr</span>
            <br />
            <span style={{ color: "var(--bone-soft)" }}>559272-0220</span>
          </p>
        </div>
        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>
            Tjänster
          </p>
          <Link to="/tjanster">Alla tjänster</Link>
          <Link to="/tjanster/hemsidor">Hemsidor</Link>
          <Link to="/tjanster/seo">SEO</Link>
          <Link to="/tjanster/mobilapp">Mobilapp</Link>
          <Link to="/ai-automation-foretag">AI-automation</Link>
        </div>
        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>
            Företag
          </p>
          <Link to="/arbete">Arbete</Link>
          <Link to="/process">Process</Link>
          <Link to="/priser">Paket & pris</Link>
          <Link to="/om">Om oss</Link>
        </div>
        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>
            Kontakt
          </p>
          <a href="mailto:info@auroramedia.se">info@auroramedia.se</a>
          <Link to="/kontakt">Boka rådgivning</Link>
          <Link to="/integritetspolicy">Integritetspolicy</Link>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--hair)", marginBlock: 48 }} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span>© {new Date().getFullYear()} Aurora Media AB — 559272-0220</span>
        <span>Linköping · Sverige · 58°N · Svarstid &lt; 24 h</span>
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
