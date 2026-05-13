import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/aurora-hero-nordic.jpg";

/* ─────────────────────────────────────────────────────────────────────────
   AURORA MEDIA — cinematic Nordic redesign
   Inspired by satoriml.se: atmospheric hero, mono branding, editorial steps,
   forest-green accent on deep ink.
   ───────────────────────────────────────────────────────────────────────── */

const TOKENS = `
  .aur {
    --ink:#0C100E;
    --ink-2:#141815;
    --bone:#E9E4D6;
    --bone-soft:rgba(233,228,214,0.72);
    --bone-mute:rgba(233,228,214,0.5);
    --bone-faint:rgba(233,228,214,0.22);
    --hair:rgba(233,228,214,0.14);
    --moss:#9BC07A;
    --moss-soft:#7FA862;
    --font-mono:"JetBrains Mono", ui-monospace, monospace;
    --font-display:"Fraunces", Georgia, serif;
    --font-body:"Inter", system-ui, sans-serif;

    background:var(--ink);
    color:var(--bone);
    font-family:var(--font-body);
    font-size:15px;
    line-height:1.6;
    min-height:100vh;
    overflow-x:clip;
    position:relative;
  }
  .aur *::selection{ background:var(--moss); color:var(--ink); }

  .aur .wrap{ max-width:1320px; margin-inline:auto; padding-inline:clamp(20px,4vw,56px); }

  /* Mono utility */
  .aur .mono{
    font-family:var(--font-mono);
    font-size:11px;
    letter-spacing:0.06em;
    color:var(--moss);
    font-weight:500;
  }
  .aur .mono-sm{ font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-mute); }
  .aur .mono-md{ font-family:var(--font-mono); font-size:13px; letter-spacing:0.02em; color:var(--bone); font-weight:500; }

  /* Display headlines using monospace for satori-like editorial code feel */
  .aur .hero-line{
    font-family:var(--font-mono);
    font-weight:500;
    font-size:clamp(2.4rem, 7vw, 6.4rem);
    line-height:1.02;
    letter-spacing:-0.03em;
    color:var(--bone);
  }
  .aur .hero-line .amp{ color:var(--moss); font-weight:400; }
  .aur .hero-line .it{ font-family:var(--font-display); font-style:italic; font-weight:400; letter-spacing:-0.02em; }

  .aur .h2{
    font-family:var(--font-mono);
    font-weight:500;
    font-size:clamp(1.8rem, 4.4vw, 3.6rem);
    line-height:1.08;
    letter-spacing:-0.025em;
    color:var(--bone);
  }
  .aur .h2 .it{ font-family:var(--font-display); font-style:italic; color:var(--moss); }

  .aur .h3{
    font-family:var(--font-mono);
    font-weight:500;
    font-size:clamp(1.05rem,1.6vw,1.35rem);
    letter-spacing:-0.01em;
    color:var(--bone);
  }

  .aur .lead{
    font-family:var(--font-body);
    font-size:clamp(1rem,1.2vw,1.15rem);
    line-height:1.65;
    color:var(--bone-soft);
    max-width:48ch;
  }

  /* Buttons */
  .aur .btn{
    display:inline-flex; align-items:center; gap:10px;
    padding:11px 20px 11px 22px;
    border-radius:9999px;
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
    background:rgba(12,16,14,0.72);
    backdrop-filter:saturate(140%) blur(14px);
    -webkit-backdrop-filter:saturate(140%) blur(14px);
    border-bottom-color:var(--hair);
  }
  .aur .brand{
    font-family:var(--font-mono); font-size:18px; letter-spacing:-0.02em;
    color:var(--moss); text-decoration:none; font-weight:500;
    display:inline-flex; align-items:center; gap:6px;
  }
  .aur .brand .glyph{ color:var(--bone); font-style:italic; font-family:var(--font-display); }

  .aur .nav-progress{
    flex:1; max-width:380px; margin:0 32px;
    height:1px; background:var(--hair); position:relative; overflow:hidden;
    display:none;
  }
  @media(min-width:760px){ .aur .nav-progress{ display:block; } }
  .aur .nav-progress::after{
    content:""; position:absolute; left:0; top:0; bottom:0;
    width:var(--p,12%); background:var(--moss);
    box-shadow:0 0 12px var(--moss);
    transition:width 220ms ease;
  }

  /* Hero */
  .aur .hero{
    position:relative; min-height:100vh;
    display:flex; flex-direction:column;
    isolation:isolate;
  }
  .aur .hero-bg{
    position:absolute; inset:0; z-index:-2;
    overflow:hidden;
  }
  .aur .hero-bg img{
    width:100%; height:100%; object-fit:cover;
    filter:saturate(0.85) brightness(0.78);
  }
  .aur .hero-bg::after{
    content:""; position:absolute; inset:0;
    background:
      linear-gradient(180deg, rgba(12,16,14,0.55) 0%, rgba(12,16,14,0.05) 30%, rgba(12,16,14,0.15) 60%, rgba(12,16,14,0.95) 100%),
      radial-gradient(60% 50% at 30% 90%, rgba(12,16,14,0.7), transparent 70%);
  }

  .aur .hero-content{
    position:relative;
    margin-top:auto;
    padding-bottom:clamp(48px, 8vh, 96px);
  }

  .aur .hero-meta{
    display:flex; flex-wrap:wrap; gap:18px 28px; align-items:center;
    margin-top:32px;
  }
  .aur .hero-meta .dot{ width:6px; height:6px; border-radius:50%; background:var(--moss); box-shadow:0 0 10px var(--moss); animation:aur-pulse 2.6s ease-in-out infinite; }
  @keyframes aur-pulse{ 0%,100%{opacity:1; transform:scale(1);} 50%{opacity:.45; transform:scale(.7);} }

  /* Firefly particles */
  .aur .fireflies{ position:absolute; inset:0; z-index:-1; pointer-events:none; overflow:hidden; }
  .aur .fly{
    position:absolute; width:3px; height:3px; border-radius:50%;
    background:#FFD58A; box-shadow:0 0 8px #FFC76E, 0 0 18px rgba(255,199,110,0.5);
    animation:aur-fly linear infinite;
    opacity:0.8;
  }
  @keyframes aur-fly{
    0%{ transform:translate(0,0) scale(0.6); opacity:0; }
    20%{ opacity:0.9; }
    50%{ transform:translate(40px,-60px) scale(1); opacity:0.6; }
    80%{ opacity:0.9; }
    100%{ transform:translate(80px,-130px) scale(0.5); opacity:0; }
  }

  /* Section base */
  .aur .section{ padding-block:clamp(80px, 12vw, 160px); position:relative; }
  .aur .section + .section{ border-top:1px solid var(--hair); }

  /* Steps */
  .aur .steps{
    display:grid; grid-template-columns:1fr; gap:0;
    margin-top:clamp(48px,7vw,96px);
    border-top:1px solid var(--hair);
  }
  .aur .step{
    display:grid; grid-template-columns:auto 1fr;
    gap:24px 36px;
    padding:clamp(28px,4vw,48px) clamp(8px,2vw,16px);
    border-bottom:1px solid var(--hair);
    transition:background 240ms ease, padding-left 320ms cubic-bezier(0.2,0.8,0.2,1);
    position:relative;
  }
  .aur .step:hover{ background:rgba(155,192,122,0.04); padding-left:clamp(20px,3vw,32px); }
  @media(min-width:900px){
    .aur .step{ grid-template-columns:120px 1fr 1.4fr; align-items:start; }
  }
  .aur .step-num{
    font-family:var(--font-mono); font-size:13px; letter-spacing:0.04em;
    color:var(--moss); font-weight:500;
  }
  .aur .step-title{
    font-family:var(--font-mono); font-size:clamp(1.1rem,1.7vw,1.4rem);
    color:var(--bone); letter-spacing:-0.01em; font-weight:500; line-height:1.2;
  }
  .aur .step-desc{ color:var(--bone-soft); font-size:0.98rem; line-height:1.65; }

  /* Pillars */
  .aur .pillars{
    display:grid; grid-template-columns:1fr; gap:1px;
    background:var(--hair);
    border:1px solid var(--hair);
    margin-top:clamp(48px,6vw,80px);
  }
  @media(min-width:760px){ .aur .pillars{ grid-template-columns:repeat(3,1fr); } }
  .aur .pillar{
    background:var(--ink);
    padding:clamp(28px,3vw,40px);
    transition:background 220ms ease;
  }
  .aur .pillar:hover{ background:var(--ink-2); }
  .aur .pillar-num{
    font-family:var(--font-mono); font-size:11px; letter-spacing:0.1em;
    color:var(--moss); margin-bottom:24px; display:block;
  }

  /* CTA dark band */
  .aur .cta-band{
    padding-block:clamp(96px,14vw,180px);
    text-align:left;
    position:relative; overflow:hidden;
    border-top:1px solid var(--hair);
  }
  .aur .cta-band::after{
    content:""; position:absolute; inset:0;
    background:radial-gradient(50% 60% at 80% 20%, rgba(155,192,122,0.18), transparent 70%);
    pointer-events:none;
  }
  .aur .cta-email{
    font-family:var(--font-display); font-style:italic;
    font-size:clamp(1.6rem, 3.4vw, 2.6rem);
    color:var(--bone); text-decoration:none;
    border-bottom:1px solid var(--bone-faint);
    padding-bottom:6px; letter-spacing:-0.02em;
    transition:color 200ms, border-color 200ms;
  }
  .aur .cta-email:hover{ color:var(--moss); border-bottom-color:var(--moss); }

  /* Footer */
  .aur .foot{ padding-block:clamp(56px,7vw,88px); border-top:1px solid var(--hair); color:var(--bone-mute); font-family:var(--font-mono); font-size:12px; letter-spacing:0.04em; }
  .aur .foot a{ color:var(--bone-soft); text-decoration:none; transition:color 180ms; }
  .aur .foot a:hover{ color:var(--moss); }
  .aur .foot-grid{ display:grid; grid-template-columns:1fr; gap:32px; }
  @media(min-width:760px){ .aur .foot-grid{ grid-template-columns:2fr 1fr 1fr 1fr; } }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce){
    .aur *, .aur *::before, .aur *::after{ animation:none !important; transition:none !important; }
  }
`;

/* ───── Reveal helper ───── */
const Reveal = ({ children, delay = 0, y = 24, className = "" }: any) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ───── Live time ───── */
const useStockholmTime = () => {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Stockholm" });
};

/* ───── Nav ───── */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, (v) => `${Math.max(8, v * 100)}%`);
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
      <motion.div className="nav-progress" style={{ ["--p" as any]: progress }} aria-hidden />
      <button onClick={() => open()} className="btn btn-ghost">
        Boka möte <span className="a"><ArrowRight size={14} /></span>
      </button>
    </header>
  );
};

/* ───── Fireflies ───── */
const Fireflies = () => {
  const flies = Array.from({ length: 18 }).map((_, i) => ({
    left: Math.random() * 100,
    top: 40 + Math.random() * 60,
    delay: Math.random() * 6,
    dur: 8 + Math.random() * 10,
  }));
  return (
    <div className="fireflies" aria-hidden>
      {flies.map((f, i) => (
        <span
          key={i}
          className="fly"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            animationDelay: `-${f.delay}s`,
            animationDuration: `${f.dur}s`,
          }}
        />
      ))}
    </div>
  );
};

/* ───── Hero ───── */
const Hero = () => {
  const { open } = useContactModal();
  const time = useStockholmTime();
  return (
    <section id="top" className="hero">
      <div className="hero-bg">
        <img src={heroImg} alt="" width={1920} height={1080} fetchPriority="high" />
      </div>
      <Fireflies />

      <div className="wrap hero-content">
        <Reveal>
          <p className="mono">aurora media · linköping</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="hero-line" style={{ marginTop: 18 }}>
            Bryggan mellan
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <h1 className="hero-line">
            <span className="it">idé</span> <span className="amp">&</span> <span className="it">system</span>
          </h1>
        </Reveal>
        <Reveal delay={0.35}>
          <p className="lead" style={{ marginTop: 28 }}>
            Vi accelererar er digitalisering. SaaS, AI och automation
            byggt för svenska företag som vill ersätta manuellt arbete
            med smarta digitala flöden.
          </p>
        </Reveal>
        <Reveal delay={0.5}>
          <div className="hero-meta">
            <button onClick={() => open()} className="btn btn-moss">
              Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
            </button>
            <Link to="/ai-automation-foretag" className="btn btn-ghost">
              AI &amp; automation <span className="a"><ArrowUpRight size={14} /></span>
            </Link>
            <span className="mono-sm" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span className="dot" /> Linköping · {time}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ───── Steps (AI-resan / Aurora-metoden) ───── */
const STEPS = [
  { n: "01", t: "Kostnadsfri kartläggning", d: "Vi börjar med ett samtal. Vad gör ni varje dag som borde varit automatiserat? Var blöder tiden? Inga säljare, bara byggare." },
  { n: "02", t: "Strategi & arkitektur", d: "Vi ritar lösningen. Klickbar prototyp, teknikval, integrationer mot Fortnox, HubSpot, Pipedrive eller vad ni redan kör. Ni ser exakt vad ni får." },
  { n: "03", t: "Bygg på riktigt", d: "Inte WordPress-tema. Riktiga SaaS-system, AI-agenter och kundappar. Skrivet i kod, deployat i molnet, testat hårt." },
  { n: "04", t: "AI på era data", d: "Era dokument, era processer, era kunder. När AI:n förstår er vardag går svaren från generiska till precisa. Här händer 3x-effekten." },
  { n: "05", t: "Automatisera flödet", d: "När grunden sitter kopplar vi ihop allt. E-post, fakturor, leads, rapporter. Det som tog en arbetsdag tar nu sex sekunder." },
  { n: "06", t: "Drift & vidareutveckling", d: "Vi släpper inte taget vid lansering. Övervakning, support, nya funktioner när verksamheten växer. Långsiktiga partners, inte projektleverantörer." },
];

const StepsSection = () => (
  <section className="section" id="metod">
    <div className="wrap">
      <Reveal>
        <p className="mono">// metoden</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="h2" style={{ marginTop: 18, maxWidth: "20ch" }}>
          Ni vet redan att <span className="it">AI</span> förändrar allt.
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="lead" style={{ marginTop: 18 }}>
          Frågan är bara hur ni tar er dit. Det här är vägen — sex steg från första samtalet till en organisation som jobbar smartare än innan.
        </p>
      </Reveal>

      <ol className="steps" aria-label="Aurora-metoden i sex steg">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.05}>
            <li className="step">
              <span className="step-num">{s.n}</span>
              <span className="step-title">{s.t}</span>
              <span className="step-desc">{s.d}</span>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  </section>
);

/* ───── Pillars (what we build) ───── */
const PILLARS = [
  {
    n: "01",
    title: "SaaS & kundportaler",
    desc: "Era egna verktyg, byggda för era processer. Inloggning, betalningar, dashboards, rapporter — allt under ert varumärke.",
    tags: ["React", "Supabase", "Stripe"],
  },
  {
    n: "02",
    title: "AI-agenter & automation",
    desc: "Tröttsamma uppgifter försvinner. Inkommande mail svaras, offerter skrivs, fakturor matchas — av AI som känner ert företag.",
    tags: ["GPT-5", "n8n", "Make"],
  },
  {
    n: "03",
    title: "Mobilappar & webb",
    desc: "Snabba, hårt designade appar för iOS och Android, eller marknadssajter som faktiskt konverterar besökare till kunder.",
    tags: ["React Native", "Next.js", "SEO"],
  },
];

const PillarsSection = () => (
  <section className="section" id="tjanster">
    <div className="wrap">
      <Reveal>
        <p className="mono">// vad vi bygger</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="h2" style={{ marginTop: 18, maxWidth: "22ch" }}>
          Tre saker vi gör <span className="it">på riktigt bra</span>.
        </h2>
      </Reveal>

      <div className="pillars">
        {PILLARS.map((p) => (
          <Reveal key={p.n}>
            <article className="pillar">
              <span className="pillar-num">{p.n}</span>
              <h3 className="h3">{p.title}</h3>
              <p style={{ color: "var(--bone-soft)", marginTop: 14, lineHeight: 1.65 }}>{p.desc}</p>
              <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {p.tags.map((t) => (
                  <span key={t} className="mono-sm" style={{ padding: "5px 10px", border: "1px solid var(--hair)", borderRadius: 999 }}>
                    {t}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ───── CTA ───── */
const CTASection = () => {
  const { open } = useContactModal();
  return (
    <section className="cta-band" id="kontakt">
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <p className="mono">// nästa steg</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2" style={{ marginTop: 18, maxWidth: "20ch" }}>
            Har ni en idé som <span className="it">borde varit</span> ett system?
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="lead" style={{ marginTop: 22 }}>
            Boka en kostnadsfri rådgivning. Trettio minuter, inga säljare, ingen pitch — bara konkreta svar på vad som går att bygga, hur snabbt, och vad det kostar.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
            <button onClick={() => open()} className="btn btn-moss">
              Boka samtal <span className="a"><ArrowRight size={14} /></span>
            </button>
            <a href="mailto:info@auroramedia.se" className="cta-email">info@auroramedia.se</a>
          </div>
        </Reveal>
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
          <p style={{ marginTop: 18, color: "var(--bone-mute)", maxWidth: 36 + "ch" }}>
            Aurora Media AB — Linköping. SaaS, AI och automation för svenska företag som vill växa snabbare.
          </p>
        </div>
        <div>
          <p className="mono-sm" style={{ marginBottom: 12 }}>tjänster</p>
          <Link to="/tjanster/hemsidor">Hemsidor</Link>
          <Link to="/tjanster/seo">SEO</Link>
          <Link to="/tjanster/mobilapp">Mobilapp</Link>
          <Link to="/ai-automation-foretag">AI-automation</Link>
        </div>
        <div>
          <p className="mono-sm" style={{ marginBottom: 12 }}>företag</p>
          <Link to="/om">Om oss</Link>
          <Link to="/arbete">Arbete</Link>
          <Link to="/process">Process</Link>
          <Link to="/priser">Priser</Link>
        </div>
        <div>
          <p className="mono-sm" style={{ marginBottom: 12 }}>kontakt</p>
          <a href="mailto:info@auroramedia.se">info@auroramedia.se</a>
          <Link to="/kontakt">Kontaktformulär</Link>
          <Link to="/integritetspolicy">Integritetspolicy</Link>
        </div>
      </div>
      <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid var(--hair)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span>© {new Date().getFullYear()} Aurora Media AB</span>
        <span>Org.nr 559XXX-XXXX · Linköping, Sverige</span>
      </div>
    </div>
  </footer>
);

/* ───── Page ───── */
const Index = () => (
  <>
    <SEO
      title="Aurora Media — SaaS, AI & automation för svenska företag"
      description="Aurora Media bygger SaaS, AI-lösningar och skräddarsydda system för företag i Linköping och hela Sverige. Från idé till lansering på under fyra veckor."
    />
    <style>{TOKENS}</style>
    <div className="aur">
      <Nav />
      <Hero />
      <StepsSection />
      <PillarsSection />
      <CTASection />
      <Footer />
    </div>
  </>
);

export default Index;
