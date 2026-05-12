import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV = [
  { label: "Arbete", href: "/arbete" },
  { label: "Produkter", href: "/produkter" },
  { label: "Tjänster", href: "/tjanster" },
  { label: "Process", href: "/process" },
  { label: "Om", href: "/om" },
];

const SiteHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      <header
        style={{
          position: "fixed",
          inset: "0 0 auto 0",
          zIndex: 100,
          transition: "background 0.3s ease, border-color 0.3s ease",
          backgroundColor: scrolled ? "rgba(16,15,13,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: `0.5px solid ${scrolled ? "rgba(237,233,220,0.10)" : "transparent"}`,
        }}
      >
        <div className="wrap" style={{ display: "flex", alignItems: "center", height: 64, gap: 40 }}>

          {/* Wordmark */}
          <Link to="/" aria-label="Aurora Media — startsida" className="wordmark" style={{ flexShrink: 0 }}>
            aurora.
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="Huvudnavigation"
            style={{ display: "flex", alignItems: "center", gap: 28, marginLeft: "auto" }}
            className="hidden md:flex"
          >
            {NAV.map((n) => (
              <Link
                key={n.href}
                to={n.href}
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  color: location.pathname === n.href ? "#EDE9DC" : "rgba(237,233,220,0.55)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#EDE9DC")}
                onMouseLeave={(e) => (e.currentTarget.style.color = location.pathname === n.href ? "#EDE9DC" : "rgba(237,233,220,0.55)")}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <Link
            to="/kontakt"
            className="btn-nav hidden md:inline-flex"
            style={{ marginLeft: 8 }}
          >
            Begär offert
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Stäng meny" : "Öppna meny"}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 5,
              alignItems: "flex-end",
            }}
            className="md:hidden"
          >
            <span style={{
              display: "block", height: 1, width: 22, background: "#EDE9DC",
              transformOrigin: "center",
              transition: "transform 0.2s, opacity 0.2s",
              transform: mobileOpen ? "translateY(6px) rotate(45deg)" : "none",
            }} />
            <span style={{
              display: "block", height: 1, width: 16, background: "#EDE9DC",
              transition: "opacity 0.15s, width 0.15s",
              opacity: mobileOpen ? 0 : 1,
            }} />
            <span style={{
              display: "block", height: 1, width: 22, background: "#EDE9DC",
              transformOrigin: "center",
              transition: "transform 0.2s, opacity 0.2s",
              transform: mobileOpen ? "translateY(-6px) rotate(-45deg)" : "none",
            }} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 90,
            backgroundColor: "#100F0D",
            display: "flex", flexDirection: "column",
            paddingTop: 80, paddingBottom: 40,
            paddingInline: "clamp(20px, 4vw, 48px)",
          }}
          className="md:hidden"
        >
          <nav style={{ flex: 1 }}>
            {NAV.map((n, i) => (
              <Link
                key={n.href}
                to={n.href}
                style={{
                  display: "block",
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: "clamp(28px, 6vw, 40px)",
                  fontWeight: 400,
                  color: "#EDE9DC",
                  textDecoration: "none",
                  padding: "14px 0",
                  borderBottom: "0.5px solid rgba(237,233,220,0.10)",
                  animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${0.05 + i * 0.05}s both`,
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/kontakt"
            className="btn-primary"
            style={{ marginTop: 32, alignSelf: "flex-start" }}
          >
            Begär offert →
          </Link>
        </div>
      )}
    </>
  );
};

export default SiteHeader;
