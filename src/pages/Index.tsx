import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────
   AURORA MEDIA — landing page
   Nordisk redaktionell minimalism. Asymmetri, typografisk dramatik,
   monospace-metadata, EN accent (korall #E64A19). Allt på svenska.
   ───────────────────────────────────────────────────────────────────────── */

/* ── Tokens (scoped via CSS variables on the wrapper) ────────────────── */
const TOKENS = `
  .aurora {
    --ink: #0B0F14;
    --ink-soft: #1E222A;
    --bone: #F2EDE3;
    --slate: #6B6F77;
    --glow: #E64A19;
    --hairline: #D9D2C3;
    --font-display: "Fraunces", Georgia, serif;
    --font-body: "Instrument Sans", system-ui, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, monospace;

    background: var(--bone);
    color: var(--ink);
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.55;
    letter-spacing: -0.005em;
    min-height: 100vh;
    position: relative;
    overflow-x: clip;
  }
  .aurora *::selection { background: var(--glow); color: var(--bone); }

  .aurora .wrap {
    max-width: 1440px;
    margin-inline: auto;
    padding-inline: clamp(20px, 4vw, 48px);
  }
  .aurora .section { padding-block: clamp(64px, 10vw, 128px); }
  .aurora .hairline { height: 1px; background: var(--hairline); width: 100%; }

  /* Typography */
  .aurora .display {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(3.5rem, 11vw, 9.5rem);
    line-height: 0.92;
    letter-spacing: -0.045em;
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .aurora .h2 {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(2.5rem, 6vw, 5rem);
    line-height: 0.95;
    letter-spacing: -0.035em;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .aurora .h3 {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(1.5rem, 2.4vw, 2rem);
    line-height: 1.05;
    letter-spacing: -0.025em;
  }
  .aurora .display em, .aurora .h2 em, .aurora .h3 em {
    font-style: italic;
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .aurora .mono {
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.10em;
    color: var(--ink);
    font-weight: 500;
  }
  .aurora .mono-sm { font-size: 10px; letter-spacing: 0.12em; }
  .aurora .meta-label { color: var(--slate); }
  .aurora .lead { font-size: clamp(1rem, 1.2vw, 1.1rem); line-height: 1.55; color: var(--ink); }
  .aurora .body { font-size: 0.98rem; line-height: 1.65; color: var(--ink); }
  .aurora .slate { color: var(--slate); }

  /* Pills */
  .aurora .pill {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 22px;
    border-radius: 9999px;
    font-family: var(--font-body);
    font-size: 14px; font-weight: 500;
    text-decoration: none;
    transition: all 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
    cursor: pointer; border: 1px solid transparent;
    white-space: nowrap;
  }
  .aurora .pill .arrow { display: inline-block; transition: transform 220ms cubic-bezier(0.2,0.8,0.2,1); }
  .aurora .pill:hover .arrow { transform: translateX(4px); }
  .aurora .pill-primary { background: var(--ink); color: var(--bone); }
  .aurora .pill-primary:hover { background: var(--glow); color: var(--bone); }
  .aurora .pill-ghost { background: transparent; color: var(--ink); border-color: var(--ink); }
  .aurora .pill-ghost:hover { background: var(--ink); color: var(--bone); }
  .aurora .pill-outline-light {
    background: transparent; color: var(--bone);
    border-color: rgba(242,237,227,0.4);
  }
  .aurora .pill-outline-light:hover { background: var(--bone); color: var(--ink); border-color: var(--bone); }

  /* Focus rings */
  .aurora a:focus-visible, .aurora button:focus-visible {
    outline: 2px solid var(--glow);
    outline-offset: 3px;
    border-radius: 2px;
  }

  /* Nav */
  .aurora .nav {
    position: fixed; inset: 0 0 auto 0; z-index: 50;
    transition: backdrop-filter 220ms ease, background 220ms ease, border-color 220ms ease;
    border-bottom: 1px solid transparent;
  }
  .aurora .nav.scrolled {
    background: rgba(242,237,227,0.78);
    backdrop-filter: saturate(140%) blur(14px);
    -webkit-backdrop-filter: saturate(140%) blur(14px);
    border-bottom-color: var(--hairline);
  }
  .aurora .nav-inner {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px clamp(20px,4vw,48px);
    max-width: 1440px; margin-inline: auto;
  }
  .aurora .nav-logo {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--font-display); font-style: italic;
    font-size: 22px; letter-spacing: -0.02em; color: var(--ink);
    text-decoration: none;
  }
  .aurora .nav-dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--glow);
    display: inline-block;
    animation: aurora-pulse 3s ease-in-out infinite;
  }
  @keyframes aurora-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(0.7); }
  }
  .aurora .nav-menu { display: none; gap: 28px; }
  .aurora .nav-menu a {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--ink); text-decoration: none;
    transition: color 180ms ease;
  }
  .aurora .nav-menu a:hover { color: var(--glow); }
  @media (min-width: 900px) { .aurora .nav-menu { display: flex; } }

  /* Ticker */
  .aurora .ticker {
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
    overflow: hidden;
    padding-block: 18px;
  }
  .aurora .ticker + .ticker { border-top: none; }
  .aurora .ticker-track {
    display: inline-flex; gap: 56px; white-space: nowrap;
    animation: aurora-marquee 38s linear infinite;
    font-family: var(--font-display);
    font-style: italic; font-size: clamp(1.2rem, 1.8vw, 1.6rem);
    color: var(--ink);
    font-variation-settings: "opsz" 144, "SOFT" 100;
    will-change: transform;
  }
  .aurora .ticker-track.reverse { animation-direction: reverse; animation-duration: 52s; }
  .aurora .ticker:hover .ticker-track { animation-play-state: paused; }
  .aurora .ticker-track .star { color: var(--glow); }
  @keyframes aurora-marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* Section header grid */
  .aurora .section-header {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: clamp(48px, 7vw, 96px);
  }
  @media (min-width: 900px) {
    .aurora .section-header {
      grid-template-columns: 1fr 2fr;
      gap: clamp(32px, 5vw, 80px);
    }
  }

  /* Services 2x2 */
  .aurora .services-grid {
    display: grid;
    grid-template-columns: 1fr;
    border-top: 1px solid var(--hairline);
  }
  @media (min-width: 760px) {
    .aurora .services-grid { grid-template-columns: 1fr 1fr; }
  }
  .aurora .service-cell {
    padding: clamp(28px, 4vw, 56px);
    border-bottom: 1px solid var(--hairline);
    transition: background 180ms ease;
  }
  .aurora .service-cell:hover { background: rgba(11,15,20,0.025); }
  @media (min-width: 760px) {
    .aurora .service-cell:nth-child(odd) { border-right: 1px solid var(--hairline); }
  }
  .aurora .service-num {
    font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em;
    color: var(--glow); margin-bottom: 18px; display: inline-block;
  }
  .aurora .service-title {
    font-family: var(--font-display); font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    line-height: 1.05; letter-spacing: -0.025em; margin-bottom: 14px;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .aurora .tag {
    display: inline-block; padding: 5px 12px;
    border: 1px solid var(--hairline); border-radius: 9999px;
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--slate);
    margin: 4px 4px 0 0;
  }

  /* Work list */
  .aurora .work-row {
    position: relative;
    display: grid;
    grid-template-columns: 36px 1fr;
    gap: 16px 24px;
    padding: 22px 12px;
    border-bottom: 1px solid var(--hairline);
    overflow: hidden;
    transition: padding-left 320ms cubic-bezier(0.2,0.8,0.2,1);
  }
  @media (min-width: 900px) {
    .aurora .work-row {
      grid-template-columns: 60px 1.4fr 2fr 1fr auto;
      align-items: baseline;
      padding: 26px 12px;
    }
  }
  .aurora .work-row::before {
    content: "";
    position: absolute; inset: 0;
    background: var(--glow);
    transform: translateX(-101%);
    transition: transform 420ms cubic-bezier(0.2,0.8,0.2,1);
    z-index: 0; opacity: 0.06;
  }
  .aurora .work-row:hover { padding-left: 28px; }
  .aurora .work-row:hover::before { transform: translateX(0); }
  .aurora .work-row > * { position: relative; z-index: 1; }
  .aurora .work-row .w-num {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em;
    color: var(--slate);
  }
  .aurora .work-row .w-title {
    font-family: var(--font-display); font-size: clamp(1.4rem, 2vw, 1.9rem);
    line-height: 1.05; letter-spacing: -0.02em;
    transition: font-style 220ms ease;
  }
  .aurora .work-row:hover .w-title { font-style: italic; }
  .aurora .work-row .w-desc { color: var(--slate); font-size: 0.95rem; line-height: 1.55; }
  .aurora .work-row .w-type, .aurora .work-row .w-year {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--slate);
  }

  /* Process columns */
  .aurora .process-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
  }
  @media (min-width: 900px) { .aurora .process-grid { grid-template-columns: repeat(4, 1fr); } }
  .aurora .process-step {
    padding: clamp(28px, 3.5vw, 48px);
    border-bottom: 1px solid var(--hairline);
  }
  @media (min-width: 900px) {
    .aurora .process-step { border-bottom: none; border-right: 1px solid var(--hairline); }
    .aurora .process-step:last-child { border-right: none; }
  }
  .aurora .process-numeral {
    font-family: var(--font-display); font-style: italic;
    font-size: 3rem; line-height: 1; color: var(--glow);
    margin-bottom: 24px; display: block;
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .aurora .process-name {
    font-family: var(--font-display); font-size: 1.6rem;
    letter-spacing: -0.02em; margin-bottom: 12px;
  }

  /* CTA dark section */
  .aurora .cta-dark {
    background: var(--ink); color: var(--bone);
    position: relative; overflow: hidden;
  }
  .aurora .cta-dark::after {
    content: ""; position: absolute; inset: 0;
    background: radial-gradient(60% 60% at 88% 12%, rgba(230,74,25,0.18), transparent 70%);
    pointer-events: none;
  }
  .aurora .cta-dark .slate { color: rgba(242,237,227,0.55); }
  .aurora .cta-dark .h2, .aurora .cta-dark .mono { color: var(--bone); }
  .aurora .cta-dark .glow-em { color: var(--glow); font-style: italic; }
  .aurora .cta-email {
    font-family: var(--font-display); font-style: italic;
    font-size: clamp(1.6rem, 3.4vw, 2.6rem);
    color: var(--bone); text-decoration: none;
    border-bottom: 1px solid rgba(242,237,227,0.3);
    padding-bottom: 6px; transition: border-color 200ms ease, color 200ms ease;
    letter-spacing: -0.02em; display: inline-block;
  }
  .aurora .cta-email:hover { border-bottom-color: var(--glow); color: var(--glow); }

  /* Footer */
  .aurora .footer {
    background: var(--ink); color: var(--bone);
    padding-block: clamp(56px, 7vw, 96px);
    border-top: 1px solid rgba(242,237,227,0.08);
  }
  .aurora .footer .slate { color: rgba(242,237,227,0.5); }
  .aurora .footer a { color: rgba(242,237,227,0.78); text-decoration: none; transition: color 180ms ease; display: block; padding: 6px 0; font-size: 14px; }
  .aurora .footer a:hover { color: var(--glow); }
  .aurora .footer-grid {
    display: grid; grid-template-columns: 1fr; gap: 40px;
  }
  @media (min-width: 760px) { .aurora .footer-grid { grid-template-columns: 1.6fr 1fr 1fr 1fr; } }

  /* Noise overlay */
  .aurora-noise {
    position: fixed; inset: 0; z-index: 60;
    pointer-events: none; opacity: 0.35;
    mix-blend-mode: multiply;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .aurora *, .aurora *::before, .aurora *::after {
      animation: none !important; transition: none !important;
    }
  }
`;

/* ── Noise overlay (SVG turbulence) ─────────────────────────────────── */
const NoiseOverlay = () => (
  <svg className="aurora-noise" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <filter id="aurora-noise-filter">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.04
                                          0 0 0 0 0.06
                                          0 0 0 0 0.08
                                          0 0 0 0.55 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#aurora-noise-filter)" />
  </svg>
);

/* ── Reveal helper ──────────────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, as: As = "div" as any, className }: any) => {
  const reduce = useReducedMotion();
  if (reduce) return <As className={className}>{children}</As>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ── Nav ────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Studio", href: "#studio" },
  { label: "Tjänster", href: "#tjanster" },
  { label: "Arbeten", href: "#arbeten" },
  { label: "Process", href: "#process" },
];

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a href="#top" className="nav-logo" aria-label="Aurora Media — startsida">
          <span className="nav-dot" aria-hidden />
          <span>Aurora Media</span>
        </a>
        <nav className="nav-menu" aria-label="Huvudmeny">
          {NAV_ITEMS.map((n) => (
            <a key={n.href} href={n.href}>{n.label}</a>
          ))}
        </nav>
        <a href="#kontakt" className="pill pill-ghost" style={{ display: "none" }} data-desktop>
          Boka samtal <span className="arrow">→</span>
        </a>
        <a href="#kontakt" className="pill pill-ghost aurora-cta-desktop">
          Boka samtal <span className="arrow">→</span>
        </a>
      </div>
      <style>{`
        .aurora .aurora-cta-desktop { display: none; }
        @media (min-width: 760px) { .aurora .aurora-cta-desktop { display: inline-flex; } }
      `}</style>
    </header>
  );
};

/* ── Magnetic pill (cursor-attracted CTA) ───────────────────────────── */
const Magnetic = ({ children, strength = 18, className, href }: any) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
    const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  return (
    <a ref={ref} href={href} className={className} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transition: "transform 360ms cubic-bezier(0.2,0.8,0.2,1)" }}>
      {children}
    </a>
  );
};

/* ── Live Linköping clock ───────────────────────────────────────────── */
const useLinkopingTime = () => {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Stockholm" });
};

/* ── Hero ───────────────────────────────────────────────────────────── */
const HERO_META = [
  { label: "Studio", value: "Linköping · 58.41°N" },
  { label: "Sedan", value: "MMXXI" },
  { label: "Status", value: "Tar uppdrag Q3 2026" },
];

const HERO_LINE_1 = ["Vi", "bygger"];
const HERO_LINE_2 = ["digitala"];
const HERO_LINE_3_PRE = ["som"];
const HERO_LINE_4 = ["faktiskt"];

const Hero = () => {
  const reduce = useReducedMotion();
  const time = useLinkopingTime();
  const heroRef = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 30 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    setGlow({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const Word = ({ t, em, i, base = 0.15 }: any) => (
    <span style={{ display: "inline-block", overflow: "hidden", paddingRight: "0.18em", verticalAlign: "bottom" }}>
      {reduce ? (em ? <em>{t}</em> : t) : (
        <motion.span
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.85, delay: base + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ display: "inline-block" }}
        >
          {em ? <em>{t}</em> : t}
        </motion.span>
      )}
    </span>
  );

  return (
    <section
      id="top"
      ref={heroRef}
      onMouseMove={onMove}
      style={{
        paddingTop: 132,
        paddingBottom: "clamp(48px, 8vw, 96px)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      {/* Cursor-driven aurora glow */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `radial-gradient(420px circle at ${glow.x}% ${glow.y}%, rgba(230,74,25,0.12), transparent 60%)`,
          transition: reduce ? "none" : "background 600ms cubic-bezier(0.2,0.8,0.2,1)",
        }}
      />

      <div className="wrap" style={{ width: "100%", position: "relative", zIndex: 1 }}>
        {/* top meta strip */}
        <div className="aurora-hero-meta">
          <style>{`
            .aurora .aurora-hero-meta {
              display: grid; grid-template-columns: 1fr 1fr; gap: 20px 24px;
              margin-bottom: clamp(40px, 7vw, 80px);
              padding-bottom: 22px; border-bottom: 1px solid var(--hairline);
            }
            @media (min-width: 760px) {
              .aurora .aurora-hero-meta { grid-template-columns: repeat(4, 1fr); align-items: end; }
            }
            .aurora .aurora-hero-clock {
              font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em;
              color: var(--ink); display: inline-flex; align-items: center; gap: 8px;
            }
            .aurora .aurora-hero-clock::before {
              content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--glow);
              animation: aurora-pulse 2s ease-in-out infinite;
            }
          `}</style>
          {HERO_META.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.06}>
              <div>
                <div className="mono meta-label" style={{ marginBottom: 8 }}>{m.label}</div>
                <div className="mono" style={{ color: "var(--ink)" }}>{m.value}</div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.18}>
            <div>
              <div className="mono meta-label" style={{ marginBottom: 8 }}>Lokal tid</div>
              <span className="aurora-hero-clock">{time}</span>
            </div>
          </Reveal>
        </div>

        {/* Editorial H1 — multi-line with oversized italic break */}
        <h1 className="display aurora-h1" style={{ marginBottom: "clamp(40px, 7vw, 88px)" }}>
          <style>{`
            .aurora .aurora-h1 { display: block; }
            .aurora .aurora-h1 .line { display: block; }
            .aurora .aurora-h1 .line-2 { padding-left: clamp(0px, 6vw, 84px); }
            .aurora .aurora-h1 .line-3 { display: flex; align-items: baseline; gap: clamp(12px, 2vw, 28px); flex-wrap: wrap; }
            .aurora .aurora-h1 .mega {
              font-style: italic; color: var(--glow);
              font-size: clamp(4.2rem, 14vw, 12rem); line-height: 0.86;
              letter-spacing: -0.055em;
              font-variation-settings: "opsz" 144, "SOFT" 100;
              display: inline-block;
            }
            .aurora .aurora-h1 .rule {
              flex: 1 1 80px; height: 1px; background: var(--ink);
              transform-origin: left center;
            }
            .aurora .aurora-h1 .tail { display: block; }
          `}</style>

          <span className="line">
            {HERO_LINE_1.map((t, i) => <Word key={i} t={t} i={i} />)}
          </span>
          <span className="line line-2">
            {HERO_LINE_2.map((t, i) => <Word key={i} t={t} em i={i + HERO_LINE_1.length} />)}
            {" "}
            {HERO_LINE_3_PRE.map((t, i) => <Word key={i} t={t} i={i + HERO_LINE_1.length + 1} />)}
          </span>
          <span className="line line-3">
            {HERO_LINE_4.map((t, i) => <Word key={i} t={t} em i={i + 4} />)}
            {!reduce && (
              <motion.span className="rule" aria-hidden
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 0.85, ease: [0.2,0.8,0.2,1] }}
              />
            )}
            {reduce && <span className="rule" aria-hidden />}
          </span>
          <span className="tail" style={{ overflow: "hidden", display: "block", marginTop: "clamp(4px, 1vw, 10px)" }}>
            {reduce ? <span className="mega">används.</span> : (
              <motion.span className="mega"
                initial={{ y: "110%", opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.95, ease: [0.2,0.8,0.2,1] }}
                style={{ display: "inline-block" }}
              >
                används.
              </motion.span>
            )}
          </span>
        </h1>

        {/* lower hero */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "clamp(28px, 4vw, 56px)", alignItems: "end" }} className="aurora-hero-lower">
          <style>{`@media (min-width: 900px) { .aurora-hero-lower { grid-template-columns: 1fr 1.2fr !important; } }`}</style>
          <Reveal delay={0.9}>
            <p className="lead" style={{ maxWidth: 460 }}>
              <span className="mono meta-label" style={{ display: "block", marginBottom: 12 }}>↳ Manifest</span>
              Aurora Media är en oberoende digitalstudio från Östergötland. Vi designar, utvecklar och driver
              SaaS-plattformar och webbplatser för svenska företag som vill bygga <em style={{ fontFamily: "var(--font-display)" }}>något som håller</em> —
              inte bara ser bra ut i en pitch.
            </p>
          </Reveal>
          <Reveal delay={1.0}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-start" }}>
              <Magnetic href="#arbeten" className="pill pill-primary">
                Se utvalda arbeten <span className="arrow">→</span>
              </Magnetic>
              <Magnetic href="#kontakt" className="pill pill-ghost">
                Starta projekt <span className="arrow">→</span>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Scroll hint */}
      {!reduce && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}
          className="wrap" style={{ width: "100%", position: "relative", zIndex: 1, marginTop: 48 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span className="mono meta-label">↓ Skrolla</span>
            <span className="mono meta-label">№ 001 / Aurora Media — index</span>
          </div>
        </motion.div>
      )}
    </section>
  );
};

/* ── Ticker ─────────────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "SaaS-utveckling", "Webbplatser", "Varumärke", "SEO & innehåll", "Drift & support",
];
const TICKER_ITEMS_2 = [
  "Linköping", "Stockholm", "Göteborg", "Östergötland", "Norden",
];

const Ticker = () => {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  const items2 = [...TICKER_ITEMS_2, ...TICKER_ITEMS_2, ...TICKER_ITEMS_2, ...TICKER_ITEMS_2];
  return (
    <>
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {items.map((t, i) => (
            <span key={i}>
              {t}<span className="star" style={{ marginLeft: 56 }}>✦</span>
            </span>
          ))}
        </div>
      </div>
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track reverse">
          {items2.map((t, i) => (
            <span key={i} style={{ color: "var(--slate)" }}>
              {t}<span className="star" style={{ marginLeft: 56 }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

/* ── Studio ─────────────────────────────────────────────────────────── */
const Studio = () => (
  <section id="studio" className="section">
    <div className="wrap">
      <div className="section-header">
        <Reveal>
          <div className="mono meta-label">01 — Studio</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2">En liten studio. <em>Stor verkstad.</em></h2>
        </Reveal>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "clamp(32px, 5vw, 80px)" }} className="aurora-manifest">
        <style>{`@media (min-width: 900px) { .aurora-manifest { grid-template-columns: 1fr 1.5fr !important; } }`}</style>
        <Reveal>
          <p className="h3" style={{ maxWidth: "30ch" }}>
            Vi är inte en byrå med säljare och projektledare i flera led. Vi är teknikerna, designerna och
            strategerna — <em>samma personer</em> som faktiskt skriver koden och rättar buggarna klockan 22
            på en söndag.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div style={{ display: "grid", gap: 20 }}>
            <p className="body slate">
              Aurora Media startades för att vi var trötta på att se goda idéer dö i Powerpoint-presentationer,
              orealistiska budgets och team där ingen riktigt äger leveransen. Vi bygger små, fokuserade
              projekt med få inblandade och hög teknisk kvalitet.
            </p>
            <p className="body slate">
              Vid sidan av kunduppdrag driver vi en växande portfölj av egna SaaS-produkter — från flockhantering
              för hönsuppfödare till transportsystem för svenska åkerier. Det vi lär oss där, kommer kunderna
              till godo i nästa projekt.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ── Services ───────────────────────────────────────────────────────── */
const SERVICES = [
  {
    num: "→ 01",
    title: "Webbplatser",
    desc: "Snabba, SEO-optimerade webbplatser byggda för konvertering. Från enkla portföljer till komplexa B2B-plattformar.",
    tags: ["Next.js", "React", "Supabase", "SEO"],
  },
  {
    num: "→ 02",
    title: "SaaS-utveckling",
    desc: "Vi bygger hela SaaS-produkter — från första prototyp till skalbar plattform med betalning, autentisering och mobilappar.",
    tags: ["TypeScript", "Stripe", "RLS", "Capacitor"],
  },
  {
    num: "→ 03",
    title: "Marknadsföring",
    desc: "Google Ads, Meta, sökmotoroptimering och innehåll som ger spårbar avkastning — inte vanity metrics.",
    tags: ["Google Ads", "Meta", "SEO", "Innehåll"],
  },
  {
    num: "→ 04",
    title: "Drift & förvaltning",
    desc: "Löpande utveckling, övervakning och säkerhet för kritiska digitala produkter. Vi bygger det — vi driver det.",
    tags: ["Hosting", "Säkerhet", "Support", "Iteration"],
  },
];

const Services = () => (
  <section id="tjanster" className="section">
    <div className="wrap">
      <div className="section-header">
        <Reveal>
          <div className="mono meta-label">02 — Tjänster</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2">Vad vi <em>faktiskt</em> gör.</h2>
        </Reveal>
      </div>

      <Reveal>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <div className="service-cell" key={s.title}>
              <span className="service-num">{s.num}</span>
              <h3 className="service-title">{s.title}</h3>
              <p className="body slate" style={{ maxWidth: "44ch", marginBottom: 20 }}>{s.desc}</p>
              <div>{s.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── Work ───────────────────────────────────────────────────────────── */
const WORK = [
  { n: "001", title: "Hönsgården", desc: "SaaS för flockhantering. Mobilapp i App Store och Google Play med över 67 % freemium-konvertering.", type: "Egen produkt", year: "2025" },
  { n: "002", title: "AgilityManager", desc: "Plattform för agility-tränare med banplanerare i 3D, statistik och tävlingskalender.", type: "Egen produkt", year: "2026" },
  { n: "003", title: "Aurora Transport", desc: "SaaS för transportbolag — uppdragshantering, körjournaler och digitala signaturer.", type: "Egen produkt", year: "2026" },
  { n: "004", title: "Viriditas Massage", desc: "Hemsida, bokningssystem och Google Ads-kampanj för massagesalong i Uddevalla.", type: "Kunduppdrag", year: "2026" },
  { n: "005", title: "Odlingsdagboken", desc: "Digital trädgårdsdagbok med AI-coachen Gro och programmatisk SEO.", type: "Egen produkt", year: "2025" },
  { n: "006", title: "Updro", desc: "Marknadsplats för digitala uppdrag — referralsystem, escrow och SEO-driven trafik.", type: "Egen produkt", year: "2026" },
];

const Work = () => (
  <section id="arbeten" className="section">
    <div className="wrap">
      <div className="section-header">
        <Reveal>
          <div className="mono meta-label">03 — Utvalda arbeten</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2">Saker vi <em>byggt</em> och driver.</h2>
        </Reveal>
      </div>

      <div style={{ borderTop: "1px solid var(--hairline)" }}>
        {WORK.map((w) => (
          <Reveal key={w.n}>
            <div className="work-row">
              <span className="w-num">{w.n}</span>
              <span className="w-title">{w.title}</span>
              <span className="w-desc">{w.desc}</span>
              <span className="w-type">{w.type}</span>
              <span className="w-year">{w.year}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ── Process ────────────────────────────────────────────────────────── */
const STEPS = [
  { num: "i.", name: "Förstå", desc: "Vi börjar med din affär — inte med din design. Vad ska produkten lösa, för vem, och hur mäter vi att den lyckas?" },
  { num: "ii.", name: "Forma", desc: "Snabba prototyper i kod, inte bilder i Figma. Vi testar idéer i webbläsaren där användaren möter dem." },
  { num: "iii.", name: "Bygg", desc: "Modern stack, robust kod, tidiga lanseringar. Vi släpper i iterationer — inte i ett stort drag." },
  { num: "iv.", name: "Driv", desc: "Allt vi bygger förvaltas av samma team. Inga överlämningar, ingen kunskap som försvinner." },
];

const Process = () => (
  <section id="process" className="section">
    <div className="wrap">
      <div className="section-header">
        <Reveal>
          <div className="mono meta-label">04 — Process</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2">Från idé till drift på <em>fyra steg.</em></h2>
        </Reveal>
      </div>

      <Reveal>
        <div className="process-grid">
          {STEPS.map((s) => (
            <div className="process-step" key={s.num}>
              <span className="process-numeral">{s.num}</span>
              <h3 className="process-name">{s.name}</h3>
              <p className="body slate">{s.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── CTA dark ───────────────────────────────────────────────────────── */
const CTA = () => (
  <section id="kontakt" className="cta-dark section" style={{ position: "relative" }}>
    <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "clamp(40px, 6vw, 80px)", alignItems: "end" }} className="aurora-cta-grid">
        <style>{`@media (min-width: 900px) { .aurora-cta-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
        <Reveal>
          <h2 className="h2">Har du <span className="glow-em">något</span> att bygga?</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div>
            <div className="mono meta-label" style={{ color: "rgba(242,237,227,0.45)", marginBottom: 18 }}>Kontakt</div>
            <a href="mailto:info@auroramedia.se" className="cta-email">info@auroramedia.se →</a>
            <p className="body slate" style={{ marginTop: 24, maxWidth: "32ch" }}>
              Vi svarar inom ett arbetsdygn. Korta samtal är gratis.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ── Footer ─────────────────────────────────────────────────────────── */
const Footer = () => (
  <footer className="footer">
    <div className="wrap">
      <div className="footer-grid">
        <div>
          <div className="nav-logo" style={{ color: "var(--bone)", marginBottom: 16 }}>
            <span className="nav-dot" aria-hidden />
            <span style={{ color: "var(--bone)" }}>Aurora Media</span>
          </div>
          <p className="body slate" style={{ maxWidth: "32ch" }}>
            En oberoende digitalstudio från Linköping. Vi bygger digitala produkter
            för svenska företag som vill bygga något som håller.
          </p>
        </div>
        <div>
          <div className="mono" style={{ color: "rgba(242,237,227,0.45)", marginBottom: 12 }}>Studio</div>
          <a href="#studio">Om oss</a>
          <a href="#process">Process</a>
          <a href="#tjanster">Tjänster</a>
        </div>
        <div>
          <div className="mono" style={{ color: "rgba(242,237,227,0.45)", marginBottom: 12 }}>Arbeten</div>
          <a href="#arbeten">Utvalda arbeten</a>
          <a href="#arbeten">Egna produkter</a>
          <a href="#arbeten">Kunduppdrag</a>
        </div>
        <div>
          <div className="mono" style={{ color: "rgba(242,237,227,0.45)", marginBottom: 12 }}>Kontakt</div>
          <a href="mailto:info@auroramedia.se">info@auroramedia.se</a>
          <a href="#kontakt">Boka samtal</a>
          <a href="/integritetspolicy">Integritetspolicy</a>
        </div>
      </div>

      <div className="hairline" style={{ background: "rgba(242,237,227,0.12)", marginBlock: 48 }} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <span className="mono" style={{ color: "rgba(242,237,227,0.5)" }}>
          © 2026 Aurora Media AB — 559272-0220
        </span>
        <span className="mono" style={{ color: "rgba(242,237,227,0.5)" }}>
          Linköping · Sverige · 58°N
        </span>
      </div>
    </div>
  </footer>
);

/* ── Page ───────────────────────────────────────────────────────────── */
const Index = () => {
  // Override the global app dark background for this page only
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#F2EDE3";
    return () => { document.body.style.background = prev; };
  }, []);

  return (
    <>
      <style>{TOKENS}</style>
      <div className="aurora">
        <NoiseOverlay />
        <Nav />
        <main>
          <Hero />
          <Ticker />
          <Studio />
          <Services />
          <Work />
          <Process />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
