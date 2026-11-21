import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { Binders, PhoneStool, SunMark, TinRobot } from "@/components/film/FilmProps";
import "@/styles/aurora-chrome.css";

/* ─────────────────────────────────────────────────────────────
   AURORA.md chrome — the header, index menu and footer shared by
   every public page, so the whole site reads as one film.
   ───────────────────────────────────────────────────────────── */

/** The manifesto's chapters. The homepage film renders them in this order. */
export const FILM_INDEX = [
  { id: "flytta-data", title: "sluta flytta data för hand" },
  { id: "mest-tid", title: "börja med det som stjäl mest tid" },
  { id: "minsta", title: "bygg det minsta som fungerar" },
  { id: "ai-nytta", title: "ai där den gör nytta. inte överallt." },
  { id: "manniskan", title: "människan godkänner" },
  { id: "ni-ager", title: "ni äger det vi bygger" },
  { id: "mat", title: "mät i timmar, inte i funktioner" },
  { id: "byggare", title: "byggare, inte rådgivare" },
] as const;

export type FilmChapterId = (typeof FILM_INDEX)[number]["id"];

const SITE_LINKS: [string, string][] = [
  ["/tjanster", "Tjänster"], ["/priser", "Priser & upplägg"], ["/arbete", "Våra projekt"], ["/ai-karta", "Gratis AI-karta"],
  ["/verktyg", "Gratis verktyg"], ["/blogg", "Guider & insikter"], ["/portal", "Kundportal"], ["/om", "Om Aurora"], ["/kontakt", "Kontakt"],
];
const OFFER_LINKS: [string, string][] = [
  ["/care", "WordPress-drift"], ["/aurora-watch", "Aurora Watch"], ["/mailguard", "E-postskydd (DMARC)"], ["/merchant-rescue", "Merchant API-migrering"],
  ["/app-release", "App-release"], ["/lokal-synlighet", "Lokal synlighet"], ["/ai-synlighet", "AI-synlighet"], ["/ai-receptionist", "AI-receptionist"],
];

const vars = (v: Record<string, string | undefined>) => v as CSSProperties;

type HeaderProps = {
  /** "film": fixed and transparent over the homepage film. "page": sticky cobalt bar on every other page. */
  variant?: "film" | "page";
  ink?: string;
  now?: ReactNode;
  solid?: boolean;
  /** On the homepage chapters scroll in place; elsewhere they link to /#chapter. */
  onJump?: (id: string) => void;
};

export function FilmHeader({ variant = "page", ink, now, solid, onJump }: HeaderProps) {
  const { open } = useContactModal();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => { setMenuOpen(false); buttonRef.current?.focus(); }, []);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (variant !== "page") return;
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [variant]);
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMenu(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [menuOpen, closeMenu]);

  const contact = (source: string) => { trackEvent("film_contact_click", { source, path: pathname }); open(); };
  const cls = ["fc-header", `fc-${variant}`, solid ? "is-solid" : "", scrolled ? "is-scrolled" : ""].filter(Boolean).join(" ");

  return <>
    <a href="#main" className="fc-skip">Hoppa till innehåll</a>
    <header className={cls} style={vars({ "--hdr": ink })}>
      <Link to="/" className="fc-brand" aria-label="Aurora Media – startsidan"><SunMark className="fc-mark" /><span>AURORA.md</span><i aria-hidden="true" /></Link>
      <p className="fc-now" aria-hidden="true">{now}</p>
      <div className="fc-actions">
        <button type="button" className="fc-cta" onClick={() => contact(`${variant}_header`)}>Boka samtal</button>
        <button ref={buttonRef} type="button" className="fc-index" aria-expanded={menuOpen} aria-controls="fc-menu" onClick={() => setMenuOpen(true)}>index <span aria-hidden="true" className="fc-burger" /></button>
      </div>
    </header>

    {menuOpen && <div id="fc-menu" ref={menuRef} className="fc-menu" role="dialog" aria-modal="true" aria-label="Index">
      <button type="button" className="fc-menu-close" onClick={closeMenu} aria-label="Stäng index"><X size={22} /></button>
      <div className="fc-menu-grid">
        <nav aria-label="Kapitel">
          <p className="fc-mono">## manifestet</p>
          <ol>
            {FILM_INDEX.map((c, i) => <li key={c.id}>{onJump
              ? <button type="button" onClick={() => { setMenuOpen(false); onJump(c.id); }}><span>###</span> {i + 1}. {c.title}</button>
              : <Link to={`/#${c.id}`}><span>###</span> {i + 1}. {c.title}</Link>}</li>)}
            <li>{onJump
              ? <button type="button" onClick={() => { setMenuOpen(false); onJump("kom-igang"); }}><span>##</span> så kommer ni igång</button>
              : <Link to="/#kom-igang"><span>##</span> så kommer ni igång</Link>}</li>
          </ol>
        </nav>
        <nav aria-label="Huvudmeny">
          <p className="fc-mono">## aurora media</p>
          <ul>{SITE_LINKS.map(([href, label]) => <li key={href}><Link to={href} aria-current={pathname === href ? "page" : undefined}>{label}<ArrowUpRight size={16} /></Link></li>)}</ul>
          <p className="fc-mono fc-mono-gap">## erbjudanden</p>
          <ul className="fc-small-links">{OFFER_LINKS.map(([href, label]) => <li key={href}><Link to={href}>{label}</Link></li>)}</ul>
          <button type="button" className="fc-btn" onClick={() => { setMenuOpen(false); contact("menu"); }}>Boka ett kostnadsfritt samtal <ArrowRight size={17} /></button>
          <a className="fc-mono fc-mail" href="mailto:info@auroramedia.se">info@auroramedia.se</a>
        </nav>
      </div>
    </div>}
  </>;
}

export const CITIES: [string, string][] = [
  ["Linköping", "/ai-byra-linkoping"], ["Norrköping", "/ai-byra-norrkoping"], ["Stockholm", "/ai-byra-stockholm"], ["Göteborg", "/ai-byra-goteborg"],
  ["Malmö", "/ai-byra-malmo"], ["Uppsala", "/ai-byra-uppsala"], ["Motala", "/ai-byra-motala"], ["Nyköping", "/ai-byra-nykoping"],
];

/** The closing scene of every page: a set with the wordmark, then the full link index. */
export function FilmFooter({ cta = true }: { cta?: boolean }) {
  const { open } = useContactModal();
  return (
    <footer className="fc-footer">
      <div className="fc-wall">
        <div className="fc-wall-copy">
          <p className="fc-mono">## sista raden</p>
          {cta && <>
            <p className="fc-wall-line">Vilket arbetsmoment har ni tröttnat på?</p>
            <div className="fc-wall-actions">
              <button type="button" className="fc-btn fc-btn-hot" onClick={() => { trackEvent("film_contact_click", { source: "footer" }); open(); }}>Boka ett kostnadsfritt samtal <ArrowRight size={17} /></button>
              <a className="fc-wall-mail" href="mailto:info@auroramedia.se">info@auroramedia.se</a>
            </div>
          </>}
        </div>
        <div className="fc-set" aria-hidden="true">
          <div className="fc-floor" />
          <p className="fc-word">AURORA<b>.</b><em>md</em></p>
          <div className="fc-prop fc-prop-binders"><Binders /></div>
          <div className="fc-prop fc-prop-robot"><TinRobot /></div>
          <div className="fc-prop fc-prop-phone"><PhoneStool /></div>
        </div>
      </div>
      <div className="fc-links">
        <div className="fc-links-grid">
          <div>
            <h4>Tjänster</h4>
            <Link to="/tjanster">Alla tjänster</Link>
            <Link to="/tjanster/hemsidor">Hemsidor</Link>
            <Link to="/tjanster/mobilapp">Mobilapp</Link>
            <Link to="/ai-automation-foretag">AI-automation</Link>
            <Link to="/tjanster/seo">SEO</Link>
            <Link to="/care">Aurora Care – WordPress-drift</Link>
            <Link to="/aurora-watch">Aurora Watch – kundflöden och webbövervakning</Link>
            <Link to="/mailguard">Aurora MailGuard – SPF, DKIM och DMARC</Link>
            <Link to="/merchant-rescue">Merchant Rescue – Merchant API-migrering</Link>
            <Link to="/app-release">AppLaunch – release-checklista för appar</Link>
            <Link to="/lokal-synlighet">Lokal synlighet</Link>
            <Link to="/ai-synlighet">AI-synlighet</Link>
            <Link to="/ai-receptionist">AI-receptionist</Link>
            <Link to="/verktyg">Gratis verktyg</Link>
          </div>
          <div>
            <h4>Städer</h4>
            {CITIES.map(([n, h]) => <Link key={h} to={h}>{n}</Link>)}
          </div>
          <div>
            <h4>Case</h4>
            <Link to="/arbete">Alla projekt</Link>
            <Link to="/arbete/aurora-transport">Aurora Transport</Link>
            <Link to="/arbete/honsgarden">Hönsgården</Link>
            <Link to="/arbete/bergs-slussar-stayboost">Bergs Slussar Glamping</Link>
          </div>
          <div>
            <h4>Bolag</h4>
            <a href="mailto:info@auroramedia.se">info@auroramedia.se</a>
            <Link to="/om">Om Aurora</Link>
            <Link to="/oppna-siffror">Öppna siffror</Link>
            <Link to="/kontakt">Kontakt</Link>
            <Link to="/blogg">Guider & insikter</Link>
            <Link to="/villkor">Villkor</Link>
            <Link to="/integritetspolicy">Integritetspolicy</Link>
            <span className="fc-org">Org.nr 559272-0220</span>
          </div>
        </div>
        <div className="fc-bottom">
          <span>© {new Date().getFullYear()} Aurora Media AB · Linköping</span>
          <span>AI, automation & systemutveckling</span>
        </div>
      </div>
    </footer>
  );
}
