import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, Layers3, MessageSquare, Workflow, X } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { PACKAGES } from "@/data/offers";
import { VkFooter } from "@/components/verkstad/VerkstadLayout";
import { Binders, Clock, Envelope, Gear, Hammer, Key, Lightbulb, Paper, PhoneStool, Plug, Ruler, Stamp, SunMark, TinRobot } from "@/components/film/FilmProps";
import "@/styles/verkstad.css";
import "@/styles/aurora-film.css";

/* ─────────────────────────────────────────────────────────────
   AURORA.md — the homepage as a scroll-driven film.
   Every word is real DOM text: screen readers and people who prefer
   reduced motion get the same manifesto as a quiet reading page
   (see the prefers-reduced-motion block in aurora-film.css).
   ───────────────────────────────────────────────────────────── */

type Prop = { el: ReactNode; style: CSSProperties; depth?: number; spin?: number };
type Chapter = {
  id: string;
  title: string;
  bg: string;
  ink: string;
  floor?: string;
  disc?: string;
  lines: string[];
  notes?: string[];
  link?: { to: string; label: string };
  props: Prop[];
};

const HERO = { bg: "#1f45e0", ink: "#f6efe2", floor: "#e6d6bd" };

const CHAPTERS: Chapter[] = [
  {
    id: "flytta-data", title: "sluta flytta data för hand", bg: "#f3a6c8", ink: "#1d1b1c", floor: "#1f45e0",
    lines: ["Varje gång någon kopierar", "från ett mejl", "till ett kalkylblad", "försvinner en bit av eftermiddagen."],
    notes: ["förfrågan som ligger kvar i inkorgen", "samma uppgift i tre system", "kalkylbladet som bara en person förstår", "fakturaunderlag som pusslas ihop på fredag"],
    link: { to: "/ai-automation-foretag", label: "Automation & integrationer" },
    props: [
      { el: <Paper />, style: { left: "24%", top: "14%", width: "min(14vw, 120px)" }, depth: 60, spin: 30 },
      { el: <Envelope />, style: { left: "56%", top: "34%", width: "min(18vw, 160px)" }, depth: 90, spin: -20 },
      { el: <Paper tone="#fff" />, style: { left: "72%", top: "8%", width: "min(10vw, 90px)" }, depth: 120, spin: 50 },
      { el: <Envelope />, style: { left: "12%", top: "52%", width: "min(12vw, 110px)" }, depth: 40, spin: 25 },
    ],
  },
  {
    id: "mest-tid", title: "börja med det som stjäl mest tid", bg: "#ff4d17", ink: "#1d1b1c", disc: "#f3eadb",
    lines: ["Inte det roligaste.", "Inte det mest AI-iga.", "Det som stjäl flest timmar", "varje vecka."],
    notes: ["en process", "ett arbetsflöde", "ett avgränsat första test"],
    link: { to: "/ai-karta/start", label: "Gör gratis AI-kartan" },
    props: [
      { el: <Clock />, style: { left: "40%", top: "16%", width: "min(22vw, 200px)" }, depth: 50, spin: 90 },
      { el: <Clock />, style: { left: "0%", top: "64%", width: "min(9vw, 80px)" }, depth: 110, spin: -120 },
    ],
  },
  {
    id: "minsta", title: "bygg det minsta som fungerar", bg: "#c7a6f5", ink: "#1d1b1c", floor: "#2f5d3a",
    lines: ["Prototyp först.", "Riktiga användare sen.", "Hela systemet sist."],
    notes: ["avgränsad prototyp från 4 900 kr exkl. moms", "innehåll och pris i offerten före start"],
    link: { to: "/priser", label: "Se priser & upplägg" },
    props: [
      { el: <Lightbulb />, style: { left: "44%", top: "12%", width: "min(14vw, 130px)" }, depth: 40, spin: 8 },
      { el: <Paper />, style: { left: "20%", top: "44%", width: "min(10vw, 90px)" }, depth: 80, spin: -30 },
    ],
  },
  {
    id: "ai-nytta", title: "ai där den gör nytta. inte överallt.", bg: "#2f5d3a", ink: "#f3eadb", disc: "#f6c945",
    lines: ["Ibland räcker ett formulär.", "Ibland en integration.", "Ibland är AI exakt rätt.", "Vi väljer efter uppgiften – inte efter hypen."],
    props: [
      { el: <Gear />, style: { left: "40%", top: "10%", width: "min(20vw, 180px)" }, depth: 30, spin: 220 },
      { el: <Gear tone="#ff4d17" />, style: { left: "68%", top: "30%", width: "min(12vw, 110px)" }, depth: 30, spin: -320 },
      { el: <Plug />, style: { left: "12%", top: "66%", width: "min(26vw, 240px)" }, depth: 70, spin: 6 },
    ],
  },
  {
    id: "manniskan", title: "människan godkänner", bg: "#f6c945", ink: "#1d1b1c", floor: "#ff4d17",
    lines: ["Automationen förbereder.", "Systemet påminner.", "Du bestämmer."],
    notes: ["förfrågan kommer in", "underlaget samlas", "du granskar och godkänner"],
    props: [
      { el: <Stamp />, style: { left: "40%", top: "26%", width: "min(16vw, 150px)" }, depth: 30, spin: -10 },
      { el: <Paper />, style: { left: "16%", top: "12%", width: "min(9vw, 80px)" }, depth: 100, spin: 40 },
      { el: <Paper tone="#fff" />, style: { left: "72%", top: "58%", width: "min(9vw, 80px)" }, depth: 140, spin: -60 },
    ],
  },
  {
    id: "ni-ager", title: "ni äger det vi bygger", bg: "#1d1b1c", ink: "#f3eadb",
    lines: ["Kod. Dokumentation. Överlämning.", "Bestämt i offerten, före start.", "Inga svarta lådor."],
    props: [
      { el: <Key />, style: { left: "24%", top: "38%", width: "min(32vw, 300px)" }, depth: 50, spin: -24 },
    ],
  },
  {
    id: "mat", title: "mät i timmar, inte i funktioner", bg: "#7cc29a", ink: "#1d1b1c", floor: "#e5392b",
    lines: ["Fler funktioner är inte målet.", "Färre manuella moment är det.", "Vi bestämmer vad vi mäter", "innan vi bygger."],
    props: [
      { el: <Ruler />, style: { left: "12%", top: "18%", width: "min(34vw, 320px)" }, depth: 40, spin: -14 },
      { el: <Clock />, style: { left: "60%", top: "44%", width: "min(12vw, 110px)" }, depth: 90, spin: 60 },
    ],
  },
  {
    id: "byggare", title: "byggare, inte rådgivare", bg: HERO.bg, ink: HERO.ink, floor: HERO.floor,
    lines: ["Vi driver egna verksamheter.", "Vi bygger egna produkter.", "Därför vet vi hur det känns", "när systemet ska fungera en vanlig tisdag."],
    notes: ["Stayboost · Bergs Slussar Glamping", "Aurora Transport · körorder till faktura"],
    link: { to: "/arbete", label: "Se våra projekt" },
    props: [
      { el: <Hammer />, style: { left: "40%", top: "30%", width: "min(16vw, 150px)" }, depth: 30, spin: 12 },
      { el: <TinRobot />, style: { left: "68%", top: "40%", width: "min(11vw, 110px)" }, depth: 10, spin: 0 },
    ],
  },
];

const USE_CASES = [
  { name: "Administration", icon: Workflow, before: "Mejl → Excel → dubbelarbete", title: "Ett flöde hela vägen.", text: "Samla förfrågningar, underlag och uppföljning i ett system. Låt återkommande moment skötas automatiskt och behåll kontrollen över besluten.", steps: ["Förfrågan kommer in", "Underlaget samlas", "Du granskar och godkänner"], note: "Administration och systemintegrationer" },
  { name: "Kundkontakt", icon: MessageSquare, before: "Samma frågor. Om och om igen.", title: "Ge kunden ett tydligt nästa steg.", text: "Bygg en kundportal, ett bokningsflöde eller en assistent som använder ert underlag. Frågor som kräver en människa går vidare till rätt person.", steps: ["Kunden ställer en fråga", "Svar från ert underlag", "Personlig hjälp vid behov"], note: "Kundportal, bokning och AI-assistent" },
  { name: "Egen produkt", icon: Layers3, before: "En idé som behöver bli testbar", title: "Från idé till något ni kan prova.", text: "Börja med den viktigaste funktionen. Testa en klickbar prototyp med riktiga användare innan ni bygger vidare till app eller SaaS.", steps: ["Avgränsa kärnflödet", "Testa prototypen", "Bygg vidare på det som fungerar"], note: "Prototyp, app eller SaaS" },
];

const FAQS = [
  { q: "Vad händer i det första samtalet?", a: "Vi går igenom ett arbetsflöde, vilka system ni använder och vad ni vill förbättra. Ni får en rekommendation om nästa steg. Samtalet är kostnadsfritt och ni förbinder er inte till ett projekt." },
  { q: "Vad kostar ett projekt?", a: "En avgränsad prototyp börjar på 4 900 kr exklusive moms. MVP börjar på 11 900 kr och en större plattform på 24 900 kr. Det är riktpriser: innehåll, leveranstid, drift och eventuella externa tjänster specificeras i offerten innan start." },
  { q: "Måste lösningen använda AI?", a: "Nej. Ibland räcker en integration, ett formulär eller tydligare rutiner. Vi väljer den lösning som passar uppgiften. AI används där den tillför nytta." },
  { q: "Kan ni arbeta med våra befintliga system?", a: "Ja, när systemen har lämpliga API:er eller exportmöjligheter. Vi kontrollerar åtkomst, datakvalitet och begränsningar innan vi lovar en integration." },
  { q: "Äger vi koden och vad händer efter lansering?", a: "Ni får projektets kod och dokumentation enligt offerten. Vi kommer överens om drift, support, behörigheter och överlämning före start. Externa tjänster har sina egna licenser och avgifter." },
];

const SITE_LINKS: [string, string][] = [["/tjanster", "Tjänster"], ["/priser", "Priser & upplägg"], ["/arbete", "Våra projekt"], ["/ai-karta", "Gratis AI-karta"], ["/verktyg", "Gratis verktyg"], ["/blogg", "Guider & insikter"], ["/portal", "Kundportal"], ["/om", "Om Aurora"], ["/kontakt", "Kontakt"]];

const steps = (c: Chapter) => c.lines.length + (c.notes?.length ?? 0) + (c.link ? 1 : 0);
const vars = (v: Record<string, string | number | undefined>) => v as CSSProperties;

/** Writes each film section's scroll progress to --p (0→1 while pinned) without re-rendering. */
function useFilm(onActive: (index: number) => void) {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      let active = -2;
      document.querySelectorAll<HTMLElement>("[data-film]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const span = Math.max(1, r.height - vh);
        el.style.setProperty("--p", Math.min(1, Math.max(0, -r.top / span)).toFixed(4));
        if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) active = Number(el.dataset.film);
      });
      onActive(active);
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => { window.removeEventListener("scroll", request); window.removeEventListener("resize", request); if (frame) cancelAnimationFrame(frame); };
  }, [onActive]);
}

function Props({ props }: { props: Prop[] }) {
  return <>{props.map((p, i) => <div key={i} className="af-prop" style={{ ...p.style, ...vars({ "--d": p.depth ?? 40, "--r": p.spin ?? 0 }) }}>{p.el}</div>)}</>;
}

function ChapterScene({ c, index }: { c: Chapter; index: number }) {
  const prev = index === 0 ? HERO.bg : CHAPTERS[index - 1].bg;
  const n = steps(c);
  return (
    <section id={c.id} className="af-chapter" data-film={index + 1} aria-labelledby={`${c.id}-h`} style={vars({ "--bg": c.bg, "--ink": c.ink, "--prev": prev, "--floor": c.floor, "--disc": c.disc, "--n": n + 0.4, "--len": 2 + n * 0.34 })}>
      <div className="af-stage">
        <div className="af-wipe">
          {c.floor && <div className="af-floor" />}
          <div className="af-props">{c.disc && <div className="af-disc" />}<Props props={c.props} /></div>
          <div className="af-copy">
            <h2 id={`${c.id}-h`} className="af-kicker"><span aria-hidden="true">### </span>{index + 1}. {c.title}</h2>
            <p className="af-lines">{c.lines.map((l, i) => <span key={l} className="af-line" style={vars({ "--i": i })}>{l} </span>)}</p>
            {c.notes && <ul className="af-notes">{c.notes.map((note, j) => <li key={note} className="af-line" style={vars({ "--i": c.lines.length + j })}><span aria-hidden="true">- </span>{note}</li>)}</ul>}
            {c.link && <Link to={c.link.to} className="af-line af-chip" style={vars({ "--i": n - 1 })} onClick={() => trackEvent("home_film_link_click", { chapter: c.id })}>{c.link.label}<ArrowUpRight size={16} /></Link>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  const { open } = useContactModal();
  const [active, setActive] = useState(-2);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const selected = USE_CASES[activeCase];
  useFilm(useCallback((i: number) => setActive(i), []));

  const contact = (source: string, note?: string) => {
    trackEvent("home_contact_click", { source });
    open({ internalNote: note || `Förfrågan från startsidan: ${source}` });
  };
  const closeMenu = useCallback(() => { setMenuOpen(false); menuButtonRef.current?.focus(); }, []);
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMenu(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [menuOpen, closeMenu]);

  const jump = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const offset = el.dataset.film && !reduce ? window.innerHeight * 0.9 : 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? "auto" : "smooth" });
  };

  const chapter = active >= 1 ? CHAPTERS[active - 1] : null;
  const headerInk = active === -1 ? "#1d1b1c" : chapter ? chapter.ink : HERO.ink;

  return <>
    <SEO title="AI-system och automation för företag | Aurora Media" description="Mindre manuellt arbete. Mer tid för affären. Aurora Media i Linköping bygger AI-lösningar, integrationer och interna system. Börja med ett kostnadsfritt samtal." canonical="/" jsonLd={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    <div className="af">
      <a href="#main" className="af-skip">Hoppa till innehåll</a>
      <header className={`af-header${active === -1 ? " is-solid" : ""}`} style={vars({ "--hdr": headerInk })}>
        <Link to="/" className="af-brand" aria-label="Aurora Media – startsidan"><SunMark className="af-mark" /><span>AURORA.md</span><i aria-hidden="true" /></Link>
        <p className="af-now" aria-hidden="true">{chapter ? <><span>###</span> {active}. {chapter.title}</> : null}</p>
        <div className="af-actions">
          <button type="button" className="af-cta" onClick={() => contact("film_header")}>Boka samtal</button>
          <button ref={menuButtonRef} type="button" className="af-index" aria-expanded={menuOpen} aria-controls="af-menu" onClick={() => setMenuOpen(true)}>index <span aria-hidden="true" className="af-burger" /></button>
        </div>
      </header>

      {menuOpen && <div id="af-menu" ref={menuRef} className="af-menu" role="dialog" aria-modal="true" aria-label="Index">
        <button type="button" className="af-menu-close" onClick={closeMenu} aria-label="Stäng index"><X size={22} /></button>
        <div className="af-menu-grid">
          <nav aria-label="Kapitel">
            <p className="af-mono">## manifestet</p>
            <ol>{CHAPTERS.map((c, i) => <li key={c.id}><button type="button" onClick={() => jump(c.id)}><span>###</span> {i + 1}. {c.title}</button></li>)}
              <li><button type="button" onClick={() => jump("kom-igang")}><span>##</span> så kommer ni igång</button></li></ol>
          </nav>
          <nav aria-label="Huvudmeny">
            <p className="af-mono">## aurora media</p>
            <ul>{SITE_LINKS.map(([href, label]) => <li key={href}><Link to={href}>{label}<ArrowUpRight size={16} /></Link></li>)}</ul>
            <button type="button" className="af-btn" onClick={() => { setMenuOpen(false); contact("film_menu"); }}>Boka ett kostnadsfritt samtal <ArrowRight size={17} /></button>
            <a className="af-mono af-mail" href="mailto:info@auroramedia.se">info@auroramedia.se</a>
          </nav>
        </div>
      </div>}

      <main id="main">
        <section className="af-hero" data-film="0" aria-labelledby="af-title" style={vars({ "--bg": HERO.bg, "--ink": HERO.ink, "--floor": HERO.floor })}>
          <div className="af-stage">
            <div className="af-hero-floor" />
            <h1 id="af-title" className="af-title"><span aria-hidden="true">AURORA<b>.</b><em>md</em></span><span className="af-sr">Aurora Media – AI, automation och egna system som minskar manuellt arbete</span></h1>
            <div className="af-prop af-hero-binders" style={vars({ "--d": 30, "--r": -8, "--x": -26 })}><Binders /></div>
            <div className="af-prop af-hero-phone" style={vars({ "--d": 20, "--r": 6, "--x": 22 })}><PhoneStool /></div>
            <div className="af-prop af-hero-robot" style={vars({ "--d": 10, "--r": 0, "--x": 14 })}><TinRobot /></div>
            <div className="af-hero-notes">
              <ul className="af-mono">
                <li><span aria-hidden="true">&gt;</span> ett arbetsmanifest om AI och automation.</li>
                <li><span aria-hidden="true">&gt;</span> inte en broschyr. inte en powerpoint.</li>
                <li><span aria-hidden="true">&gt;</span> skrivet i Linköping, mellan två leveranser.</li>
              </ul>
              <button type="button" className="af-chip af-chip-solid" onClick={() => contact("film_hero")}>Prata om ert arbetsflöde <ArrowRight size={16} /></button>
            </div>
            <p className="af-byline af-mono"><span>Aurora Media AB · Linköping</span><span>Version 2026.11</span></p>
          </div>
        </section>

        {CHAPTERS.map((c, i) => <ChapterScene key={c.id} c={c} index={i} />)}

        <div className={`af-scroll af-mono${active >= 0 ? " is-on" : ""}`} aria-hidden="true">scroll <i /></div>

        <section className="af-appendix" id="kom-igang" data-film="-1" aria-labelledby="kom-igang-h">
          <div className="af-wrap">
            <p className="af-mono">## appendix</p>
            <h2 id="kom-igang-h" className="af-h2">Så kommer ni igång.</h2>

            <div className="af-block af-usecase">
              <div>
                <p className="af-mono">### vad vill ni få ordning på?</p>
                <div className="af-tabs" aria-label="Välj ett användningsfall">
                  {USE_CASES.map((c, i) => <button key={c.name} type="button" aria-pressed={activeCase === i} onClick={() => { setActiveCase(i); trackEvent("home_use_case_selected", { use_case: c.name }); }}><c.icon size={16} />{c.name}</button>)}
                </div>
              </div>
              <div className="af-card" aria-live="polite">
                <p className="af-mono af-muted">{selected.before}</p>
                <h3>{selected.title}</h3><p>{selected.text}</p>
                <ol className="af-flow">{selected.steps.map((s, i) => <li key={s}><span>{String(i + 1).padStart(2, "0")}</span>{s}{i === 2 && <Check size={16} />}</li>)}</ol>
                <button type="button" className="af-btn" onClick={() => contact("use_case", selected.note)}>Det här vill vi lösa <ArrowRight size={17} /></button>
              </div>
            </div>

            <div className="af-block">
              <p className="af-mono">### bevis, inte påståenden</p>
              <div className="af-cases">
                <Link className="af-case" to="/arbete/bergs-slussar-stayboost"><img src="/portfolio/goglamping-sweden.webp" alt="Bergs Slussar Glamping – bokningssajten" loading="lazy" width="1440" height="900" /><div><p className="af-mono af-muted">Egen verksamhet · Besöksnäring</p><h3>Från bokning till gästupplevelse.<ArrowUpRight size={22} /></h3><p>Stayboost på Bergs Slussar Glamping: digital incheckning, gästinformation och tillägg i ett sammanhängande flöde.</p></div></Link>
                <Link className="af-case" to="/arbete/aurora-transport"><img src="/portfolio/aurora-transport.webp" alt="Aurora Transport – översikt över transportplanering" loading="lazy" width="1440" height="900" /><div><p className="af-mono af-muted">Egen produkt · Transport</p><h3>Ordning från körorder till faktura.<ArrowUpRight size={22} /></h3><p>Ett system för transportledning, körorder och fakturaunderlag. Byggt kring arbetsflödet i ett åkeri.</p></div></Link>
              </div>
            </div>

            <div className="af-block">
              <p className="af-mono">### paket</p>
              <div className="af-packages">
                {PACKAGES.map(p => <article key={p.name} className={`af-package${p.featured ? " is-featured" : ""}`}>
                  <p className="af-mono af-muted">{p.num} · {p.time}</p><h3>{p.name}</h3><p className="af-price">{p.price}<span> exkl. moms</span></p><p>{p.desc}</p>
                  <ul>{p.features.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul>
                  <button type="button" className="af-text-btn" onClick={() => { trackEvent("home_package_click", { package: p.name }); open(p.modalValue); }}>Fråga om {p.name} <ArrowRight size={16} /></button>
                </article>)}
              </div>
              <p className="af-mono af-muted af-small">Riktpriser. Exakt innehåll, leveranstid och pris lämnas i en skriftlig offert före start.</p>
            </div>

            <div className="af-block af-map">
              <div><p className="af-mono">### gratis ai-karta · 3 steg</p><h3>Var gör automation mest nytta hos er?</h3><p>Beskriv 1–5 återkommande arbetsuppgifter. Få en prioriterad karta, ett uppskattat tidsvärde och förslag på vad ni bör undersöka först.</p></div>
              <div><Link to="/ai-karta/start" className="af-btn af-btn-light" onClick={() => trackEvent("home_ai_karta_section_click")}>Hitta ert första steg <ArrowRight size={17} /></Link><p className="af-mono af-small">Cirka 3–5 minuter · Kostnadsfritt</p></div>
            </div>

            <div className="af-block af-faq-grid">
              <div><p className="af-mono">### raka svar</p><h3 className="af-h3">Innan vi börjar.</h3><button type="button" className="af-text-btn" onClick={() => contact("faq")}>Ställ en fråga <ArrowRight size={16} /></button></div>
              <div>{FAQS.map(f => <details className="af-faq" key={f.q}><summary>{f.q}<span aria-hidden="true">+</span></summary><p>{f.a}</p></details>)}</div>
            </div>
          </div>

          <div className="af-final">
            <div className="af-wrap">
              <p className="af-mono">## sista raden</p>
              <h2 className="af-h2">Vilket arbetsmoment har ni tröttnat på<b>?</b></h2>
              <p>Berätta vad som krånglar. Vi återkommer med hur vi kan ta det vidare. Första samtalet är kostnadsfritt.</p>
              <div className="af-final-actions"><button type="button" className="af-btn af-btn-hot" onClick={() => contact("final")}>Prata med Aurora Media <ArrowRight size={18} /></button><a className="af-text-btn" href="mailto:info@auroramedia.se">info@auroramedia.se <ArrowUpRight size={17} /></a></div>
            </div>
          </div>
        </section>
      </main>
      <div className="verkstad"><VkFooter /></div>
    </div>
  </>;
}
