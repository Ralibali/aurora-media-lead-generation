import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import "@/styles/verkstad.css";

/* ─────────────────────────────────────────────────────────────
   Nordisk Verkstad — shared layout primitives.
   Extracted from src/pages/Index.tsx so alla sidor (start + verktyg)
   återanvänder samma nav/footer/reveal utan duplicering.
   ───────────────────────────────────────────────────────────── */

export const Reveal = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => {
  const reduce = useReducedMotion();
  const [forceShow, setForceShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceShow(true), 1200);
    return () => clearTimeout(t);
  }, []);
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      animate={forceShow ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const VkNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const { open } = useContactModal();
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`vk-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="vk-wrap vk-nav-inner">
        <Link to="/" className="vk-brand">
          <span className="vk-brand-dot" /> aurora media
        </Link>
        <nav className="vk-nav-links" aria-label="Huvudmeny">
          <Link to="/arbete">Arbete</Link>
          <Link to="/tjanster">Tjänster</Link>
          <Link to="/priser">Priser</Link>
          <Link to="/verktyg">Verktyg</Link>
          <Link to="/ai-karta">AI-kartan</Link>
          <Link to="/om">Om</Link>
        </nav>
        <button
          onClick={() => open()}
          className="vk-btn vk-btn-ghost"
          style={{ padding: "10px 18px", fontSize: 13 }}
        >
          Boka samtal <ArrowRight size={14} />
        </button>
      </div>
    </header>
  );
};

export const CITIES: [string, string][] = [
  ["Linköping", "/ai-byra-linkoping"],
  ["Norrköping", "/ai-byra-norrkoping"],
  ["Stockholm", "/ai-byra-stockholm"],
  ["Göteborg", "/ai-byra-goteborg"],
  ["Malmö", "/ai-byra-malmo"],
  ["Uppsala", "/ai-byra-uppsala"],
  ["Motala", "/ai-byra-motala"],
  ["Nyköping", "/ai-byra-nykoping"],
];

export const VkFooter = () => (
  <footer className="vk-footer">
    <div className="vk-wrap">
      <div className="vk-footer-grid">
        <div>
          <h4>Tjänster</h4>
          <Link to="/tjanster">Alla tjänster</Link>
          <Link to="/tjanster/hemsidor">Hemsidor</Link>
          <Link to="/tjanster/mobilapp">Mobilapp</Link>
          <Link to="/ai-automation-foretag">AI-automation</Link>
          <Link to="/tjanster/seo">SEO</Link>
          <Link to="/verktyg">Gratis verktyg</Link>
        </div>
        <div>
          <h4>Städer</h4>
          {CITIES.map(([n, h]) => (
            <Link key={h} to={h}>
              {n}
            </Link>
          ))}
        </div>
        <div>
          <h4>Case</h4>
          <Link to="/arbete">Alla projekt</Link>
          <Link to="/arbete/aurora-transport">Aurora Transport</Link>
          <Link to="/arbete/honsgarden">Hönsgården</Link>
          <Link to="/arbete/goglamping-sweden">Bergs Slussar Glamping</Link>
        </div>
        <div>
          <h4>Bolag</h4>
          <a href="mailto:info@auroramedia.se">info@auroramedia.se</a>
          <Link to="/om">Om Aurora</Link>
          <Link to="/oppna-siffror">Öppna siffror</Link>
          <Link to="/kontakt">Kontakt</Link>
          <Link to="/integritetspolicy">Integritetspolicy</Link>
          <span style={{ display: "block", padding: "4px 0", opacity: 0.6 }}>
            Org.nr 559272-0220
          </span>
        </div>
      </div>
      <div className="vk-footer-bottom">
        <span>© {new Date().getFullYear()} Aurora Media AB · Linköping</span>
        <span>Svarstid &lt; 24 h · GDPR & EU-datalagring</span>
      </div>
    </div>
  </footer>
);

/**
 * VerkstadLayout — full page shell in nordisk verkstad-designen.
 * Wraps content in .verkstad, adds sticky nav and footer.
 */
export const VerkstadLayout = ({ children }: { children: ReactNode }) => (
  <div className="verkstad">
    <VkNav />
    <main>{children}</main>
    <VkFooter />
  </div>
);

export default VerkstadLayout;
