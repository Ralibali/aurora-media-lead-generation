import { Link } from "react-router-dom";

const COLS = [
  {
    title: "Företaget",
    links: [
      { label: "Om aurora", href: "/om" },
      { label: "Arbete", href: "/arbete" },
      { label: "Produkter", href: "/produkter" },
      { label: "Process", href: "/process" },
    ],
  },
  {
    title: "Kontakt",
    links: [
      { label: "Kontakta oss", href: "/kontakt" },
      { label: "Begär offert", href: "/kontakt" },
      { label: "Blogg", href: "/blogg" },
      { label: "Webbbyrå Linköping", href: "/webbyra-linkoping" },
    ],
  },
  {
    title: "Juridiskt",
    links: [
      { label: "Integritetspolicy", href: "/integritetspolicy" },
      { label: "Redaktionell policy", href: "/redaktionell-policy" },
    ],
  },
];

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const cls = "block py-1 font-sans text-[13px] transition-colors";
  const style = { color: "rgba(237, 233, 220, 0.65)" };
  const hoverColor = "#EDE9DC";

  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={cls}
        style={style}
        onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237, 233, 220, 0.65)")}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      to={href}
      className={cls}
      style={style}
      onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237, 233, 220, 0.65)")}
    >
      {children}
    </Link>
  );
};

const SiteFooter = () => {
  return (
    <footer
      className="border-t"
      style={{ borderColor: "rgba(237, 233, 220, 0.12)", borderWidth: "0.5px" }}
    >
      {/* Big email section */}
      <div
        className="border-b section-pad"
        style={{ borderColor: "rgba(237, 233, 220, 0.12)", borderWidth: "0.5px" }}
      >
        <div className="site-container">
          <p className="eyebrow mb-4">Hör av er</p>
          <a
            href="mailto:info@auroramedia.se"
            className="big-h2 text-cream block transition-opacity hover:opacity-70 group"
          >
            info@auroramedia.se{" "}
            <span
              className="inline-block font-serif transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ fontStyle: "italic" }}
            >
              ↗
            </span>
          </a>
          <p
            className="mt-3 font-sans text-[14px]"
            style={{ color: "rgba(237, 233, 220, 0.65)" }}
          >
            Snabbt svar — oftast inom 24 timmar.
          </p>
        </div>
      </div>

      {/* Four columns */}
      <div className="section-pad">
        <div className="site-container">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Brand col */}
            <div>
              <Link
                to="/"
                aria-label="Aurora Media AB – startsida"
                className="font-sans text-[17px] font-medium text-cream transition-opacity hover:opacity-70"
                style={{ letterSpacing: "-0.02em" }}
              >
                aurora.
              </Link>
              <p
                className="mt-4 font-sans text-[13px] leading-relaxed"
                style={{ color: "rgba(237, 233, 220, 0.50)" }}
              >
                AI-byrå i Linköping.
                <br />
                559272-0220
              </p>
            </div>

            {COLS.map((col) => (
              <div key={col.title}>
                <p
                  className="mb-3 font-sans text-[11px] font-medium"
                  style={{ color: "rgba(237, 233, 220, 0.40)" }}
                >
                  {col.title}
                </p>
                <ul className="space-y-0.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <FooterLink href={l.href}>{l.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div
        className="border-t py-5"
        style={{ borderColor: "rgba(237, 233, 220, 0.10)", borderWidth: "0.5px" }}
      >
        <div className="site-container flex items-center justify-between">
          <p
            className="font-sans text-[12px]"
            style={{ color: "rgba(237, 233, 220, 0.40)" }}
          >
            © {new Date().getFullYear()} Aurora Media AB
          </p>
          <span
            className="font-mono text-[11px]"
            style={{ color: "rgba(237, 233, 220, 0.40)" }}
          >
            SV
          </span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
