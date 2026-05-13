import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/aurora-hero-borealis.jpg";

/* ─────────────────────────────────────────────────────────────────────────
   AURORA MEDIA — cinematic Nordic landing
   Dark editorial shell with mono typography and a moss/aurora green accent.
   Content keeps the original Aurora studio narrative.
   ───────────────────────────────────────────────────────────────────────── */

const TOKENS = `
  .aur {
    --ink:#0B0E0C;
    --ink-2:#121613;
    --bone:#E9E4D6;
    --bone-soft:rgba(233,228,214,0.74);
    --bone-mute:rgba(233,228,214,0.5);
    --bone-faint:rgba(233,228,214,0.22);
    --hair:rgba(233,228,214,0.13);
    --moss:#7FE3B0;
    --moss-soft:#5FBE8E;
    --font-mono:"JetBrains Mono", ui-monospace, monospace;
    --font-display:"Fraunces", Georgia, serif;
    --font-body:"Inter", system-ui, sans-serif;
    background:var(--ink);
    color:var(--bone);
    font-family:var(--font-body);
    font-size:15px; line-height:1.6;
    min-height:100vh; overflow-x:clip; position:relative;
  }
  .aur *::selection{ background:var(--moss); color:var(--ink); }
  .aur .wrap{ max-width:1320px; margin-inline:auto; padding-inline:clamp(20px,4vw,56px); }

  /* Type */
  .aur .mono{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.06em; color:var(--moss); font-weight:500; }
  .aur .mono-sm{ font-family:var(--font-mono); font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-mute); }
  .aur .mono-md{ font-family:var(--font-mono); font-size:13px; letter-spacing:0.02em; color:var(--bone); font-weight:500; }
  .aur .meta-label{ color:var(--bone-mute); font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; }

  .aur .hero-line{
    font-family:var(--font-mono); font-weight:500;
    font-size:clamp(2.4rem, 7.6vw, 6.6rem);
    line-height:1.02; letter-spacing:-0.03em; color:var(--bone);
  }
  .aur .hero-line .it{ font-family:var(--font-display); font-style:italic; font-weight:400; color:var(--moss); letter-spacing:-0.02em; }
  .aur .hero-line .amp{ color:var(--moss); font-weight:400; }

  .aur .h2{
    font-family:var(--font-mono); font-weight:500;
    font-size:clamp(1.8rem,4.4vw,3.4rem);
    line-height:1.08; letter-spacing:-0.025em; color:var(--bone);
  }
  .aur .h2 .it{ font-family:var(--font-display); font-style:italic; color:var(--moss); font-weight:400; }
  .aur .h3{ font-family:var(--font-mono); font-weight:500; font-size:clamp(1.05rem,1.6vw,1.35rem); letter-spacing:-0.01em; color:var(--bone); }
  .aur .h3 .it{ font-family:var(--font-display); font-style:italic; color:var(--moss); }
  .aur .lead{ font-size:clamp(1rem,1.18vw,1.12rem); line-height:1.65; color:var(--bone-soft); max-width:54ch; }
  .aur .body{ color:var(--bone-soft); font-size:0.97rem; line-height:1.7; }

  /* Buttons */
  .aur .btn{
    display:inline-flex; align-items:center; gap:10px;
    padding:11px 20px 11px 22px; border-radius:9999px;
    font-family:var(--font-mono); font-size:12px; letter-spacing:0.04em;
    font-weight:500; cursor:pointer; text-decoration:none;
    transition:all 220ms cubic-bezier(0.2,0.8,0.2,1);
    border:1px solid transparent; white-space:nowrap;
  }
  .aur .btn .a{ display:inline-flex; transition:transform 220ms cubic-bezier(0.2,0.8,0.2,1); }
  .aur .btn:hover .a{ transform:translateX(3px); }
  .aur .btn-moss{ background:var(--moss); color:var(--ink); }
  .aur .btn-moss:hover{ background:var(--bone); }
  .aur .btn-ghost{ background:transparent; color:var(--bone); border-color:var(--bone-faint); }
  .aur .btn-ghost:hover{ border-color:var(--moss); color:var(--moss); }

  /* Nav */
  .aur .nav{
    position:fixed; inset:0 0 auto 0; z-index:50;
    padding:18px clamp(20px,4vw,56px);
    display:flex; align-items:center; justify-content:space-between;
    transition:background 240ms ease, backdrop-filter 240ms ease, border-color 240ms ease;
    border-bottom:1px solid transparent;
  }
  .aur .nav.scrolled{
    background:rgba(11,14,12,0.72);
    backdrop-filter:saturate(140%) blur(14px);
    -webkit-backdrop-filter:saturate(140%) blur(14px);
    border-bottom-color:var(--hair);
  }
  .aur .brand{ font-family:var(--font-mono); font-size:18px; letter-spacing:-0.02em; color:var(--moss); text-decoration:none; font-weight:500; display:inline-flex; align-items:center; gap:6px; }
  .aur .brand .glyph{ color:var(--bone); font-style:italic; font-family:var(--font-display); }
  .aur .nav-menu{ display:none; gap:28px; align-items:center; }
  @media(min-width:900px){ .aur .nav-menu{ display:flex; } }
  .aur .nav-menu a{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-soft); text-decoration:none; transition:color 180ms; }
  .aur .nav-menu a:hover{ color:var(--moss); }
  .aur .nav-progress{
    width:140px; height:1px; background:var(--hair); position:relative; overflow:hidden;
    display:none; margin:0 18px;
  }
  @media(min-width:760px){ .aur .nav-progress{ display:block; } }
  .aur .nav-progress::after{
    content:""; position:absolute; left:0; top:0; bottom:0;
    width:var(--p,8%); background:var(--moss);
    box-shadow:0 0 10px var(--moss);
  }

  /* Hero */
  .aur .hero{ position:relative; min-height:100vh; display:flex; flex-direction:column; isolation:isolate; }
  .aur .hero-bg{ position:absolute; inset:0; z-index:-2; overflow:hidden; }
  .aur .hero-bg img{ width:100%; height:100%; object-fit:cover; filter:saturate(0.9) brightness(0.78); }
  .aur .hero-bg::after{
    content:""; position:absolute; inset:0;
    background:
      linear-gradient(180deg, rgba(11,14,12,0.55) 0%, rgba(11,14,12,0.05) 30%, rgba(11,14,12,0.25) 60%, rgba(11,14,12,0.96) 100%),
      radial-gradient(60% 50% at 25% 90%, rgba(11,14,12,0.7), transparent 70%);
  }
  .aur .hero-content{ position:relative; margin-top:auto; padding-bottom:clamp(48px, 8vh, 96px); padding-top:140px; }
  .aur .hero-meta-strip{
    display:grid; grid-template-columns:1fr 1fr; gap:18px 24px;
    margin-bottom:clamp(36px,6vw,72px);
    padding-bottom:18px; border-bottom:1px solid var(--bone-faint); max-width:760px;
  }
  @media(min-width:760px){ .aur .hero-meta-strip{ grid-template-columns:repeat(4,1fr); } }
  .aur .clock{ display:inline-flex; align-items:center; gap:8px; font-family:var(--font-mono); font-size:11px; letter-spacing:0.1em; color:var(--bone); }
  .aur .clock::before{ content:""; width:6px; height:6px; border-radius:50%; background:var(--moss); box-shadow:0 0 10px var(--moss); animation:aur-pulse 2.4s ease-in-out infinite; }
  @keyframes aur-pulse{ 0%,100%{opacity:1; transform:scale(1);} 50%{opacity:.4; transform:scale(.65);} }

  .aur .hero-cta{ display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin-top:34px; }

  /* Section base */
  .aur .section{ padding-block:clamp(80px, 12vw, 160px); position:relative; }
  .aur .section + .section{ border-top:1px solid var(--hair); }
  .aur .sec-head{
    display:grid; grid-template-columns:1fr; gap:24px;
    margin-bottom:clamp(48px,7vw,96px);
  }
  @media(min-width:900px){ .aur .sec-head{ grid-template-columns:1fr 2fr; gap:clamp(32px,5vw,80px); align-items:start; } }

  /* Manifest */
  .aur .manifest-grid{ display:grid; grid-template-columns:1fr; gap:clamp(32px,5vw,80px); }
  @media(min-width:900px){ .aur .manifest-grid{ grid-template-columns:1fr 1.5fr; } }

  /* Services 2x2 */
  .aur .svc-grid{ display:grid; grid-template-columns:1fr; border-top:1px solid var(--hair); }
  @media(min-width:760px){ .aur .svc-grid{ grid-template-columns:1fr 1fr; } }
  .aur .svc-cell{ padding:clamp(28px,4vw,52px); border-bottom:1px solid var(--hair); transition:background 200ms; }
  .aur .svc-cell:hover{ background:rgba(127,227,176,0.04); }
  @media(min-width:760px){ .aur .svc-cell:nth-child(odd){ border-right:1px solid var(--hair); } }
  .aur .svc-num{ font-family:var(--font-mono); font-size:12px; letter-spacing:0.06em; color:var(--moss); margin-bottom:18px; display:inline-block; }
  .aur .svc-title{ font-family:var(--font-mono); font-size:clamp(1.4rem,2.2vw,1.9rem); line-height:1.1; letter-spacing:-0.02em; margin-bottom:14px; color:var(--bone); font-weight:500; }
  .aur .tag{ display:inline-block; padding:5px 11px; border:1px solid var(--hair); border-radius:9999px; font-family:var(--font-mono); font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--bone-mute); margin:4px 4px 0 0; }

  /* Work rows */
  .aur .work-row{
    position:relative; display:grid;
    grid-template-columns:48px 1fr; gap:14px 22px;
    padding:24px 12px; border-bottom:1px solid var(--hair);
    overflow:hidden; transition:padding-left 320ms cubic-bezier(0.2,0.8,0.2,1);
  }
  @media(min-width:900px){ .aur .work-row{ grid-template-columns:60px 1.4fr 2fr 1fr auto; align-items:baseline; padding:28px 12px; } }
  .aur .work-row::before{
    content:""; position:absolute; inset:0; background:var(--moss);
    transform:translateX(-101%); transition:transform 420ms cubic-bezier(0.2,0.8,0.2,1);
    z-index:0; opacity:0.07;
  }
  .aur .work-row:hover{ padding-left:28px; }
  .aur .work-row:hover::before{ transform:translateX(0); }
  .aur .work-row > *{ position:relative; z-index:1; }
  .aur .w-num{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.08em; color:var(--bone-mute); }
  .aur .w-title{ font-family:var(--font-mono); font-size:clamp(1.2rem,1.9vw,1.7rem); line-height:1.1; letter-spacing:-0.01em; color:var(--bone); font-weight:500; transition:color 200ms; }
  .aur .work-row:hover .w-title{ color:var(--moss); }
  .aur .w-desc{ color:var(--bone-soft); font-size:0.95rem; line-height:1.6; }
  .aur .w-type, .aur .w-year{ font-family:var(--font-mono); font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-mute); }

  /* Process */
  .aur .proc-grid{ display:grid; grid-template-columns:1fr; border-top:1px solid var(--hair); border-bottom:1px solid var(--hair); }
  @media(min-width:900px){ .aur .proc-grid{ grid-template-columns:repeat(4,1fr); } }
  .aur .proc-step{ padding:clamp(28px,3.5vw,48px); border-bottom:1px solid var(--hair); }
  @media(min-width:900px){ .aur .proc-step{ border-bottom:none; border-right:1px solid var(--hair); } .aur .proc-step:last-child{ border-right:none; } }
  .aur .proc-num{ font-family:var(--font-display); font-style:italic; font-size:3rem; line-height:1; color:var(--moss); margin-bottom:24px; display:block; }
  .aur .proc-name{ font-family:var(--font-mono); font-size:1.5rem; letter-spacing:-0.02em; margin-bottom:12px; color:var(--bone); font-weight:500; }

  /* CTA band */
  .aur .cta-band{ padding-block:clamp(96px,14vw,180px); position:relative; overflow:hidden; border-top:1px solid var(--hair); }
  .aur .cta-band::after{
    content:""; position:absolute; inset:0;
    background:radial-gradient(50% 60% at 80% 20%, rgba(127,227,176,0.18), transparent 70%);
    pointer-events:none;
  }
  .aur .cta-email{
    font-family:var(--font-display); font-style:italic;
    font-size:clamp(1.6rem,3.2vw,2.4rem);
    color:var(--bone); text-decoration:none;
    border-bottom:1px solid var(--bone-faint);
    padding-bottom:6px; letter-spacing:-0.02em;
    transition:color 200ms, border-color 200ms;
    display:inline-block;
  }
  .aur .cta-email:hover{ color:var(--moss); border-bottom-color:var(--moss); }

  /* Footer */
  .aur .foot{ padding-block:clamp(56px,7vw,88px); border-top:1px solid var(--hair); color:var(--bone-mute); font-family:var(--font-mono); font-size:12px; letter-spacing:0.04em; }
  .aur .foot a{ color:var(--bone-soft); text-decoration:none; transition:color 180ms; display:block; padding:5px 0; }
  .aur .foot a:hover{ color:var(--moss); }
  .aur .foot-grid{ display:grid; grid-template-columns:1fr; gap:32px; }
  @media(min-width:760px){ .aur .foot-grid{ grid-template-columns:2fr 1fr 1fr 1fr; } }

  @media (prefers-reduced-motion: reduce){
    .aur *, .aur *::before, .aur *::after{ animation:none !important; transition:none !important; }
  }
`;

/* ───── Reveal ───── */
const Reveal = ({ children, delay = 0, y = 24, className = "" }: any) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.85, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const useStockholmTime = () => {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Stockholm" });
};

/* ───── Nav ───── */
const NAV_ITEMS = [
  { label: "Studio", href: "#studio" },
  { label: "Tjänster", href: "#tjanster" },
  { label: "Arbeten", href: "#arbeten" },
  { label: "Process", href: "#process" },
];

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, (v) => `${Math.max(6, v * 100)}%`);
  const { open } = useContactModal();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <a href="#top" className="brand" aria-label="Aurora Media — startsida">
        aurora<span className="glyph">.✦</span>
      </a>
      <nav className="nav-menu" aria-label="Huvudmeny">
        {NAV_ITEMS.map((n) => (
          <a key={n.href} href={n.href}>{n.label}</a>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center" }}>
        <motion.div className="nav-progress" style={{ ["--p" as any]: progress }} aria-hidden />
        <button onClick={() => open()} className="btn btn-ghost">
          Boka samtal <span className="a"><ArrowRight size={14} /></span>
        </button>
      </div>
    </header>
  );
};

/* ───── Hero ───── */
const HERO_META = [
  { label: "Studio", value: "Linköping · 58.41°N" },
  { label: "Sedan", value: "MMXXI" },
  { label: "Status", value: "Tar uppdrag Q3 2026" },
];

const Hero = () => {
  const { open } = useContactModal();
  const time = useStockholmTime();
  return (
    <section id="top" className="hero">
      <div className="hero-bg">
        <img src={heroImg} alt="Aurora borealis över svensk fjällskog" width={1920} height={1080} fetchPriority="high" />
      </div>

      <div className="wrap hero-content">
        <Reveal>
          <div className="hero-meta-strip">
            {HERO_META.map((m) => (
              <div key={m.label}>
                <div className="meta-label" style={{ marginBottom: 8 }}>{m.label}</div>
                <div className="mono-md">{m.value}</div>
              </div>
            ))}
            <div>
              <div className="meta-label" style={{ marginBottom: 8 }}>Lokal tid</div>
              <span className="clock">{time}</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="hero-line">Vi bygger</h1>
        </Reveal>
        <Reveal delay={0.2}>
          <h1 className="hero-line" style={{ paddingLeft: "clamp(0px, 6vw, 84px)" }}>
            <span className="it">digitala</span> saker
          </h1>
        </Reveal>
        <Reveal delay={0.3}>
          <h1 className="hero-line">som <span className="it">faktiskt</span> används.</h1>
        </Reveal>

        <Reveal delay={0.45}>
          <p className="lead" style={{ marginTop: 30 }}>
            Aurora Media är en oberoende digitalstudio från Östergötland. Vi designar, utvecklar och driver
            SaaS-plattformar och webbplatser för svenska företag som vill bygga något som håller — inte bara
            ser bra ut i en pitch.
          </p>
        </Reveal>

        <Reveal delay={0.55}>
          <div className="hero-cta">
            <button onClick={() => open()} className="btn btn-moss">
              Starta projekt <span className="a"><ArrowRight size={14} /></span>
            </button>
            <a href="#arbeten" className="btn btn-ghost">
              Se utvalda arbeten <span className="a"><ArrowUpRight size={14} /></span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ───── Studio ───── */
const Studio = () => (
  <section id="studio" className="section">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">01 — Studio</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2">En liten studio. <span className="it">Stor verkstad.</span></h2>
        </Reveal>
      </div>

      <div className="manifest-grid">
        <Reveal>
          <p className="h3" style={{ maxWidth: "30ch", lineHeight: 1.35 }}>
            Vi är inte en byrå med säljare och projektledare i flera led. Vi är teknikerna, designerna och
            strategerna — <span className="it">samma personer</span> som faktiskt skriver koden och rättar buggarna klockan 22
            på en söndag.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div style={{ display: "grid", gap: 20 }}>
            <p className="body">
              Aurora Media startades för att vi var trötta på att se goda idéer dö i Powerpoint-presentationer,
              orealistiska budgets och team där ingen riktigt äger leveransen. Vi bygger små, fokuserade
              projekt med få inblandade och hög teknisk kvalitet.
            </p>
            <p className="body">
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

/* ───── Services ───── */
const SERVICES = [
  { num: "→ 01", title: "Webbplatser", desc: "Snabba, SEO-optimerade webbplatser byggda för konvertering. Från enkla portföljer till komplexa B2B-plattformar.", tags: ["Next.js", "React", "Supabase", "SEO"] },
  { num: "→ 02", title: "SaaS-utveckling", desc: "Vi bygger hela SaaS-produkter — från första prototyp till skalbar plattform med betalning, autentisering och mobilappar.", tags: ["TypeScript", "Stripe", "RLS", "Capacitor"] },
  { num: "→ 03", title: "Marknadsföring", desc: "Google Ads, Meta, sökmotoroptimering och innehåll som ger spårbar avkastning — inte vanity metrics.", tags: ["Google Ads", "Meta", "SEO", "Innehåll"] },
  { num: "→ 04", title: "Drift & förvaltning", desc: "Löpande utveckling, övervakning och säkerhet för kritiska digitala produkter. Vi bygger det — vi driver det.", tags: ["Hosting", "Säkerhet", "Support", "Iteration"] },
];

const Services = () => (
  <section id="tjanster" className="section">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">02 — Tjänster</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2">Vad vi <span className="it">faktiskt</span> gör.</h2>
        </Reveal>
      </div>

      <Reveal>
        <div className="svc-grid">
          {SERVICES.map((s) => (
            <div className="svc-cell" key={s.title}>
              <span className="svc-num">{s.num}</span>
              <h3 className="svc-title">{s.title}</h3>
              <p className="body" style={{ maxWidth: "44ch", marginBottom: 20 }}>{s.desc}</p>
              <div>{s.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ───── Work ───── */
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
      <div className="sec-head">
        <Reveal><div className="meta-label">03 — Utvalda arbeten</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2">Saker vi <span className="it">byggt</span> och driver.</h2>
        </Reveal>
      </div>

      <div style={{ borderTop: "1px solid var(--hair)" }}>
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

/* ───── Process ───── */
const STEPS = [
  { num: "i.", name: "Förstå", desc: "Vi börjar med din affär — inte med din design. Vad ska produkten lösa, för vem, och hur mäter vi att den lyckas?" },
  { num: "ii.", name: "Forma", desc: "Snabba prototyper i kod, inte bilder i Figma. Vi testar idéer i webbläsaren där användaren möter dem." },
  { num: "iii.", name: "Bygg", desc: "Modern stack, robust kod, tidiga lanseringar. Vi släpper i iterationer — inte i ett stort drag." },
  { num: "iv.", name: "Driv", desc: "Allt vi bygger förvaltas av samma team. Inga överlämningar, ingen kunskap som försvinner." },
];

const Process = () => (
  <section id="process" className="section">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">04 — Process</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2">Från idé till drift på <span className="it">fyra steg.</span></h2>
        </Reveal>
      </div>

      <Reveal>
        <div className="proc-grid">
          {STEPS.map((s) => (
            <div className="proc-step" key={s.num}>
              <span className="proc-num">{s.num}</span>
              <h3 className="proc-name">{s.name}</h3>
              <p className="body">{s.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ───── CTA ───── */
const CTA = () => {
  const { open } = useContactModal();
  return (
    <section id="kontakt" className="cta-band">
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "clamp(40px,6vw,80px)", alignItems: "end" }}>
          <Reveal>
            <h2 className="h2" style={{ maxWidth: "16ch" }}>
              Har du <span className="it">något</span> att bygga?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <div className="meta-label" style={{ marginBottom: 18 }}>Kontakt</div>
              <a href="mailto:info@auroramedia.se" className="cta-email">info@auroramedia.se →</a>
              <p className="body" style={{ marginTop: 22, maxWidth: "36ch" }}>
                Vi svarar inom ett arbetsdygn. Korta samtal är gratis.
              </p>
              <div style={{ marginTop: 28 }}>
                <button onClick={() => open()} className="btn btn-moss">
                  Boka samtal <span className="a"><ArrowRight size={14} /></span>
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ───── Footer ───── */
const Footer = () => (
  <footer className="foot">
    <div className="wrap">
      <div className="foot-grid">
        <div>
          <a href="#top" className="brand" style={{ fontSize: 22 }}>
            aurora<span className="glyph">.✦</span>
          </a>
          <p style={{ marginTop: 18, color: "var(--bone-mute)", maxWidth: "34ch" }}>
            En oberoende digitalstudio från Linköping. Vi bygger digitala produkter
            för svenska företag som vill bygga något som håller.
          </p>
        </div>
        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>Studio</p>
          <a href="#studio">Om oss</a>
          <a href="#process">Process</a>
          <a href="#tjanster">Tjänster</a>
        </div>
        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>Arbeten</p>
          <a href="#arbeten">Utvalda arbeten</a>
          <Link to="/arbete">Egna produkter</Link>
          <Link to="/arbete">Kunduppdrag</Link>
        </div>
        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>Kontakt</p>
          <a href="mailto:info@auroramedia.se">info@auroramedia.se</a>
          <a href="#kontakt">Boka samtal</a>
          <Link to="/integritetspolicy">Integritetspolicy</Link>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--hair)", marginBlock: 48 }} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <span>© {new Date().getFullYear()} Aurora Media AB — 559272-0220</span>
        <span>Linköping · Sverige · 58°N</span>
      </div>
    </div>
  </footer>
);

/* ───── Page ───── */
const Index = () => (
  <>
    <SEO
      title="Aurora Media — Digitalstudio i Linköping för SaaS, webb & AI"
      description="Aurora Media är en oberoende digitalstudio från Linköping. Vi designar, utvecklar och driver SaaS-plattformar och webbplatser för svenska företag som vill bygga något som håller."
    />
    <style>{TOKENS}</style>
    <div className="aur">
      <Nav />
      <main>
        <Hero />
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

export default Index;
