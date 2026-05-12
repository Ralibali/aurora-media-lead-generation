import { Link } from "react-router-dom";

const RULE = { height: "0.5px", background: "rgba(237,233,220,0.12)" } as const;

const col1 = [
  { label: "Arbete", href: "/arbete" },
  { label: "Produkter", href: "/produkter" },
  { label: "Tjänster", href: "/tjanster" },
  { label: "Process", href: "/process" },
  { label: "Om", href: "/om" },
];

const col2 = [
  { label: "Blogg", href: "/blogg" },
  { label: "Webbyrå Linköping", href: "/webbyra-linkoping" },
  { label: "AI-konsult Sverige", href: "/ai-konsult-sverige" },
];

const col3 = [
  { label: "Integritetspolicy", href: "/integritetspolicy" },
  { label: "Redaktionell policy", href: "/redaktionell-policy" },
  { label: "Kontakt", href: "/kontakt" },
];

const FootLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    to={href}
    style={{
      display: "block",
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 13,
      color: "rgba(237,233,220,0.50)",
      textDecoration: "none",
      padding: "4px 0",
      transition: "color 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.color = "#EDE9DC")}
    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.50)")}
  >
    {label}
  </Link>
);

const SiteFooter = () => (
  <footer style={{ borderTop: "0.5px solid rgba(237,233,220,0.12)" }}>

    {/* Big CTA row */}
    <div className="wrap" style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
      <p className="t-label" style={{ marginBottom: 16 }}>Hör av er</p>

      <a
        href="mailto:info@auroramedia.se"
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "clamp(28px, 5vw, 52px)",
          fontStyle: "italic",
          fontWeight: 400,
          color: "#EDE9DC",
          textDecoration: "none",
          letterSpacing: "-0.02em",
          display: "block",
          lineHeight: 1.1,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        info@auroramedia.se ↗
      </a>

      <p style={{ marginTop: 12, fontSize: 13, color: "rgba(237,233,220,0.45)", fontFamily: "'Inter',system-ui,sans-serif" }}>
        Svar inom 24 timmar.
      </p>
    </div>

    <div style={RULE} />

    {/* Link columns */}
    <div className="wrap" style={{ paddingBlock: 48 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "32px 48px" }}>

        <div>
          <Link
            to="/"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 20,
              fontStyle: "italic",
              color: "#EDE9DC",
              textDecoration: "none",
              display: "block",
              marginBottom: 8,
            }}
          >
            aurora.
          </Link>
          <p style={{ fontSize: 12, color: "rgba(237,233,220,0.35)", fontFamily: "'Inter',system-ui,sans-serif", lineHeight: 1.6 }}>
            AI-byrå · Linköping
            <br />559272-0220
          </p>
        </div>

        <div>
          <p className="t-label" style={{ marginBottom: 12 }}>Sidor</p>
          {col1.map((l) => <FootLink key={l.href} {...l} />)}
        </div>

        <div>
          <p className="t-label" style={{ marginBottom: 12 }}>Innehåll</p>
          {col2.map((l) => <FootLink key={l.href} {...l} />)}
        </div>

        <div>
          <p className="t-label" style={{ marginBottom: 12 }}>Juridiskt</p>
          {col3.map((l) => <FootLink key={l.href} {...l} />)}
        </div>

      </div>
    </div>

    <div style={RULE} />

    {/* Bottom */}
    <div
      className="wrap"
      style={{
        paddingBlock: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <p style={{ fontSize: 12, color: "rgba(237,233,220,0.30)", fontFamily: "'Inter',system-ui,sans-serif" }}>
        © {new Date().getFullYear()} Aurora Media AB
      </p>
      <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 11, color: "rgba(237,233,220,0.30)" }}>
        SV
      </span>
    </div>
  </footer>
);

export default SiteFooter;
