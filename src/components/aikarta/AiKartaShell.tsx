import { ReactNode } from "react";
import { Link } from "react-router-dom";

/* Delad ljus "verkstad"-shell för /ai-karta-flödet.
   Håller nav + footer isolerade från gamla NordicLayout så temat inte krockar. */

const SHELL_CSS = `
.aik { background: #F6F5F1; color: #14171A; font-family: var(--font-sans); min-height: 100vh; }
.aik-nav {
  position: sticky; top: 0; z-index: 40;
  background: rgba(246,245,241,.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #D8D5CC;
}
.aik-nav-inner {
  max-width: 1080px; margin: 0 auto;
  padding: 14px clamp(20px, 4vw, 48px);
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.aik-brand {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--font-sans); font-weight: 800; font-size: 19px;
  letter-spacing: -0.03em; color: #14171A; text-decoration: none;
}
.aik-brand-dot { width: 8px; height: 8px; border-radius: 2px; background: #0F5132; }
.aik-nav-cta {
  color: #14171A; font-size: 14px; font-weight: 500; text-decoration: none;
  display: inline-flex; align-items: center; gap: 6px;
}
.aik-nav-cta:hover { color: #0F5132; }
.aik-foot {
  border-top: 1px solid #D8D5CC;
  padding: 40px clamp(20px, 4vw, 48px);
  margin-top: 80px;
  color: #4A5058; font-size: 13px;
  max-width: 1080px; margin-left: auto; margin-right: auto;
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.aik-foot a { color: #14171A; text-decoration: none; }
.aik-foot a:hover { text-decoration: underline; }
`;

export default function AiKartaShell({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{SHELL_CSS}</style>
      <div className="aik">
        <header className="aik-nav">
          <div className="aik-nav-inner">
            <Link to="/" className="aik-brand">
              <span className="aik-brand-dot" aria-hidden />
              aurora media
            </Link>
            <Link to="/kontakt" className="aik-nav-cta">Hellre prata direkt? →</Link>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="aik-foot">
          <span>© {new Date().getFullYear()} Aurora Media AB · 559272-0220</span>
          <span>
            <Link to="/integritetspolicy">Integritetspolicy</Link>{" · "}
            <a href="mailto:info@auroramedia.se">info@auroramedia.se</a>
          </span>
        </footer>
      </div>
    </>
  );
}
