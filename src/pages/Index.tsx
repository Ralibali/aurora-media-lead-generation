import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/aurora-hero-nordic.jpg";

/* ─────────────────────────────────────────────────────────────────────────
   AURORA MEDIA — AI-driven mjukvarubyrå (Linköping)
   Cinematic Nordic shell, mono typography, moss-green accent.
   Innehåll spegelvänt mot auroramedia.se.
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

  .aur .mono{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.06em; color:var(--moss); font-weight:500; }
  .aur .mono-md{ font-family:var(--font-mono); font-size:13px; letter-spacing:0.02em; color:var(--bone); font-weight:500; }
  .aur .meta-label{ color:var(--bone-mute); font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; }

  .aur .hero-line{
    font-family:var(--font-mono); font-weight:500;
    font-size:clamp(2.4rem, 7.6vw, 6.4rem);
    line-height:1.02; letter-spacing:-0.03em; color:var(--bone);
  }
  .aur .hero-line .it{ font-family:var(--font-display); font-style:italic; font-weight:400; color:var(--moss); letter-spacing:-0.02em; }
  .aur .h2{
    font-family:var(--font-mono); font-weight:500;
    font-size:clamp(1.8rem,4.4vw,3.4rem);
    line-height:1.08; letter-spacing:-0.025em; color:var(--bone);
  }
  .aur .h2 .it{ font-family:var(--font-display); font-style:italic; color:var(--moss); font-weight:400; }
  .aur .h3{ font-family:var(--font-mono); font-weight:500; font-size:clamp(1.05rem,1.6vw,1.35rem); letter-spacing:-0.01em; color:var(--bone); }
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
    background:rgba(11,14,12,0.78);
    backdrop-filter:saturate(140%) blur(14px);
    -webkit-backdrop-filter:saturate(140%) blur(14px);
    border-bottom-color:var(--hair);
  }
  .aur .brand{ font-family:var(--font-mono); font-size:18px; letter-spacing:-0.02em; color:var(--moss); text-decoration:none; font-weight:500; display:inline-flex; align-items:center; gap:6px; }
  .aur .brand .glyph{ color:var(--bone); font-style:italic; font-family:var(--font-display); }
  .aur .nav-menu{ display:none; gap:26px; align-items:center; }
  @media(min-width:980px){ .aur .nav-menu{ display:flex; } }
  .aur .nav-menu a{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-soft); text-decoration:none; transition:color 180ms; }
  .aur .nav-menu a:hover{ color:var(--moss); }
  .aur .nav-progress{ width:120px; height:1px; background:var(--hair); position:relative; overflow:hidden; display:none; margin:0 16px; }
  @media(min-width:760px){ .aur .nav-progress{ display:block; } }
  .aur .nav-progress::after{ content:""; position:absolute; left:0; top:0; bottom:0; width:var(--p,8%); background:var(--moss); box-shadow:0 0 10px var(--moss); }

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
  .aur .clock{ display:inline-flex; align-items:center; gap:8px; font-family:var(--font-mono); font-size:11px; letter-spacing:0.1em; color:var(--bone); }
  .aur .clock::before{ content:""; width:6px; height:6px; border-radius:50%; background:var(--moss); box-shadow:0 0 10px var(--moss); animation:aur-pulse 2.4s ease-in-out infinite; }
  @keyframes aur-pulse{ 0%,100%{opacity:1; transform:scale(1);} 50%{opacity:.4; transform:scale(.65);} }

  .aur .hero-trust{ display:grid; grid-template-columns:1fr; gap:14px; margin-top:30px; max-width:560px; }
  @media(min-width:760px){ .aur .hero-trust{ grid-template-columns:repeat(3,1fr); } }
  .aur .trust-item{ display:flex; gap:10px; align-items:flex-start; color:var(--bone-soft); font-size:0.92rem; line-height:1.45; }
  .aur .trust-item .ic{ color:var(--moss); margin-top:2px; flex-shrink:0; }

  /* Section base */
  .aur .section{ padding-block:clamp(80px, 11vw, 150px); position:relative; }
  .aur .section + .section{ border-top:1px solid var(--hair); }
  .aur .sec-head{ display:grid; grid-template-columns:1fr; gap:24px; margin-bottom:clamp(48px,7vw,88px); }
  @media(min-width:900px){ .aur .sec-head{ grid-template-columns:1fr 2fr; gap:clamp(32px,5vw,80px); align-items:start; } }

  /* Aurora-metoden timeline */
  .aur .timeline{
    display:grid; grid-template-columns:1fr; gap:1px;
    background:var(--hair); border:1px solid var(--hair);
    margin-top:clamp(40px,6vw,72px);
  }
  @media(min-width:760px){ .aur .timeline{ grid-template-columns:repeat(3,1fr); } }
  .aur .tl-step{ background:var(--ink); padding:clamp(28px,3.4vw,44px); transition:background 200ms; }
  .aur .tl-step:hover{ background:var(--ink-2); }
  .aur .tl-num{ font-family:var(--font-display); font-style:italic; font-size:2.4rem; line-height:1; color:var(--moss); display:block; margin-bottom:18px; }
  .aur .tl-day{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-mute); margin-bottom:10px; display:block; }
  .aur .tl-title{ font-family:var(--font-mono); font-size:1.25rem; color:var(--bone); margin-bottom:10px; letter-spacing:-0.01em; font-weight:500; }

  /* Services 3-col */
  .aur .svc-grid{
    display:grid; grid-template-columns:1fr; gap:1px;
    background:var(--hair); border:1px solid var(--hair);
    margin-top:clamp(40px,6vw,72px);
  }
  @media(min-width:700px){ .aur .svc-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(min-width:1000px){ .aur .svc-grid{ grid-template-columns:repeat(3,1fr); } }
  .aur .svc-cell{ background:var(--ink); padding:clamp(24px,2.4vw,32px); transition:background 200ms; }
  .aur .svc-cell:hover{ background:var(--ink-2); }
  .aur .svc-num{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.06em; color:var(--moss); display:block; margin-bottom:14px; }
  .aur .svc-title{ font-family:var(--font-mono); font-size:1.1rem; color:var(--bone); margin-bottom:6px; font-weight:500; letter-spacing:-0.01em; }
  .aur .svc-tag{ font-family:var(--font-display); font-style:italic; color:var(--moss-soft); font-size:0.95rem; margin-bottom:10px; display:block; }

  /* Work / projects */
  .aur .work-feature{
    border:1px solid var(--hair); padding:clamp(28px,3.4vw,48px);
    border-radius:8px; margin-bottom:24px;
    background:linear-gradient(180deg, rgba(127,227,176,0.04), transparent 60%);
    display:grid; grid-template-columns:1fr; gap:18px;
  }
  @media(min-width:900px){ .aur .work-feature{ grid-template-columns:auto 1fr auto; align-items:start; gap:36px; } }
  .aur .work-feature .badge{ font-family:var(--font-mono); font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--ink); background:var(--moss); padding:5px 10px; border-radius:4px; align-self:start; display:inline-block; }
  .aur .work-feature h3{ font-family:var(--font-mono); font-size:clamp(1.4rem,2.4vw,2rem); letter-spacing:-0.02em; color:var(--bone); margin-bottom:10px; font-weight:500; }
  .aur .work-grid{ display:grid; grid-template-columns:1fr; gap:1px; background:var(--hair); border:1px solid var(--hair); }
  @media(min-width:700px){ .aur .work-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(min-width:1000px){ .aur .work-grid{ grid-template-columns:repeat(3,1fr); } }
  .aur .work-card{ background:var(--ink); padding:clamp(22px,2.2vw,28px); transition:background 200ms; display:block; text-decoration:none; color:inherit; }
  .aur .work-card:hover{ background:var(--ink-2); }
  .aur .work-card h4{ font-family:var(--font-mono); font-size:1.05rem; color:var(--bone); margin-bottom:8px; font-weight:500; }
  .aur .work-card .url{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.04em; color:var(--moss); }
  .aur .work-card .meta{ font-family:var(--font-mono); font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--bone-mute); margin-top:14px; }

  /* Pills row */
  .aur .pill{ display:inline-block; padding:6px 12px; border:1px solid var(--hair); border-radius:9999px; font-family:var(--font-mono); font-size:11px; letter-spacing:0.04em; color:var(--bone-soft); margin:4px 4px 0 0; transition:all 180ms; }
  .aur .pill:hover{ border-color:var(--moss); color:var(--moss); }

  /* Industries */
  .aur .ind-grid{ display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--hair); border:1px solid var(--hair); margin-top:clamp(40px,6vw,72px); }
  @media(min-width:760px){ .aur .ind-grid{ grid-template-columns:repeat(4,1fr); } }
  .aur .ind-cell{ background:var(--ink); padding:clamp(20px,2.2vw,30px); font-family:var(--font-mono); font-size:0.95rem; color:var(--bone); transition:background 200ms; letter-spacing:-0.005em; }
  .aur .ind-cell:hover{ background:var(--ink-2); color:var(--moss); }

  /* Integrations columns */
  .aur .int-grid{ display:grid; grid-template-columns:1fr; gap:1px; background:var(--hair); border:1px solid var(--hair); margin-top:clamp(40px,6vw,72px); }
  @media(min-width:700px){ .aur .int-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(min-width:1000px){ .aur .int-grid{ grid-template-columns:repeat(3,1fr); } }
  .aur .int-cell{ background:var(--ink); padding:clamp(22px,2.4vw,30px); }
  .aur .int-cell h4{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--moss); margin-bottom:10px; }
  .aur .int-cell p{ color:var(--bone-soft); font-size:0.95rem; line-height:1.55; }

  /* Process steps stacked */
  .aur .proc-grid{ display:grid; grid-template-columns:1fr; border-top:1px solid var(--hair); border-bottom:1px solid var(--hair); margin-top:clamp(40px,6vw,72px); }
  @media(min-width:900px){ .aur .proc-grid{ grid-template-columns:repeat(5,1fr); } }
  .aur .proc-step{ padding:clamp(26px,2.8vw,40px); border-bottom:1px solid var(--hair); }
  @media(min-width:900px){ .aur .proc-step{ border-bottom:none; border-right:1px solid var(--hair); } .aur .proc-step:last-child{ border-right:none; } }
  .aur .proc-num{ font-family:var(--font-display); font-style:italic; font-size:2.6rem; line-height:1; color:var(--moss); display:block; margin-bottom:16px; }
  .aur .proc-name{ font-family:var(--font-mono); font-size:1.1rem; color:var(--bone); margin-bottom:10px; font-weight:500; letter-spacing:-0.01em; }

  /* Pricing */
  .aur .price-grid{ display:grid; grid-template-columns:1fr; gap:18px; margin-top:clamp(40px,6vw,72px); }
  @media(min-width:880px){ .aur .price-grid{ grid-template-columns:repeat(3,1fr); align-items:stretch; } }
  .aur .price-card{ border:1px solid var(--hair); border-radius:10px; padding:clamp(28px,3vw,40px); display:flex; flex-direction:column; background:var(--ink); position:relative; transition:border-color 200ms, transform 200ms; }
  .aur .price-card:hover{ border-color:var(--bone-faint); transform:translateY(-2px); }
  .aur .price-card.featured{ border-color:var(--moss); background:linear-gradient(180deg, rgba(127,227,176,0.08), transparent 60%); }
  .aur .price-num{ font-family:var(--font-display); font-style:italic; font-size:2.2rem; color:var(--moss); display:block; margin-bottom:8px; }
  .aur .price-tag{ position:absolute; top:-10px; right:24px; background:var(--moss); color:var(--ink); font-family:var(--font-mono); font-size:10px; letter-spacing:0.16em; padding:5px 10px; border-radius:4px; text-transform:uppercase; }
  .aur .price-card h3{ font-family:var(--font-mono); font-size:1.5rem; color:var(--bone); margin-bottom:10px; font-weight:500; letter-spacing:-0.01em; }
  .aur .price-list{ list-style:none; padding:0; margin:22px 0; display:flex; flex-direction:column; gap:10px; }
  .aur .price-list li{ display:flex; gap:10px; color:var(--bone-soft); font-size:0.95rem; line-height:1.5; }
  .aur .price-list li svg{ color:var(--moss); flex-shrink:0; margin-top:3px; }
  .aur .price-card .btn{ margin-top:auto; }

  /* CTA */
  .aur .cta-band{ padding-block:clamp(96px,14vw,180px); position:relative; overflow:hidden; border-top:1px solid var(--hair); }
  .aur .cta-band::after{ content:""; position:absolute; inset:0; background:radial-gradient(50% 60% at 80% 20%, rgba(127,227,176,0.18), transparent 70%); pointer-events:none; }
  .aur .cta-email{ font-family:var(--font-display); font-style:italic; font-size:clamp(1.6rem,3.2vw,2.4rem); color:var(--bone); text-decoration:none; border-bottom:1px solid var(--bone-faint); padding-bottom:6px; letter-spacing:-0.02em; transition:color 200ms, border-color 200ms; display:inline-block; }
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

const Reveal = ({ children, delay = 0, y = 24, className = "" }: any) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
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
  { label: "Tjänster", href: "#tjanster" },
  { label: "Arbeten", href: "#arbeten" },
  { label: "Branscher", href: "#branscher" },
  { label: "Integrationer", href: "#integrationer" },
  { label: "Process", href: "#process" },
  { label: "Paket", href: "#paket" },
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
          Boka rådgivning <span className="a"><ArrowRight size={14} /></span>
        </button>
      </div>
    </header>
  );
};

/* ───── Hero ───── */
const TRUST = [
  "SaaS, appar och digitala produkter",
  "AI, automation och effektivisering",
  "Byggt för affärsnytta och tillväxt",
];

const Hero = () => {
  const { open } = useContactModal();
  const time = useStockholmTime();
  return (
    <section id="top" className="hero">
      <div className="hero-bg">
        <img src={heroImg} alt="Dimmig svensk sjö med röd stuga vid skogsbrynet" width={1920} height={1080} fetchPriority="high" />
      </div>

      <div className="wrap hero-content">
        <Reveal>
          <p className="mono">aurora media · ai-driven mjukvarubyrå · linköping</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="hero-line" style={{ marginTop: 18 }}>Idén finns.</h1>
        </Reveal>
        <Reveal delay={0.2}>
          <h1 className="hero-line" style={{ paddingLeft: "clamp(0px,6vw,84px)" }}>
            Vi <span className="it">bygger</span> systemet.
          </h1>
        </Reveal>
        <Reveal delay={0.35}>
          <p className="lead" style={{ marginTop: 28 }}>
            Aurora Media bygger SaaS, appar, AI-lösningar och skräddarsydda system för företag som vill växa
            snabbare, effektivisera arbetet och ersätta manuella rutiner med smarta digitala flöden.
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <div className="hero-trust">
            {TRUST.map((t) => (
              <div key={t} className="trust-item">
                <Check size={14} className="ic" strokeWidth={2.5} /> {t}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.55}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 36 }}>
            <button onClick={() => open()} className="btn btn-moss">
              Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
            </button>
            <Link to="/ai-automation-foretag" className="btn btn-ghost">
              AI &amp; effektivisering <span className="a"><ArrowUpRight size={14} /></span>
            </Link>
            <span className="clock" style={{ marginLeft: 4 }}>Linköping · {time}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ───── Aurora-metoden ───── */
const TIMELINE = [
  { n: "01", day: "Dag 1", title: "Kostnadsfri rådgivning", desc: "Vi kartlägger affärsmål, system och flaskhalsar." },
  { n: "02", day: "Dag 2–7", title: "Prototyp & arkitektur", desc: "Du ser en klickbar version av lösningen." },
  { n: "03", day: "Vecka 2–4", title: "Lansering", desc: "Vi bygger, integrerar och driftsätter." },
];

const MetodSection = () => (
  <section className="section" id="metoden">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Aurora-metoden</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2"><span className="it">"Från idé</span> till lansering på under fyra veckor."</h2>
        </Reveal>
      </div>
      <div className="timeline">
        {TIMELINE.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08}>
            <div className="tl-step">
              <span className="tl-num">{s.n}</span>
              <span className="tl-day">{s.day}</span>
              <h3 className="tl-title">{s.title}</h3>
              <p className="body">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ───── Tjänster ───── */
const SERVICES = [
  { n: "01", title: "System", tag: "Affärssystem som växer med er.", desc: "Robusta affärssystem som växer med er — byggda i modern stack." },
  { n: "02", title: "Integrationer", tag: "Fortnox, Visma, Stripe & mer.", desc: "Sömlösa kopplingar mellan Fortnox, Visma, Stripe och era befintliga verktyg." },
  { n: "03", title: "Appar", tag: "iOS, Android & PWA.", desc: "iOS, Android och progressiva webbappar som folk faktiskt vill använda." },
  { n: "04", title: "Redesign", tag: "UI/UX som konverterar.", desc: "Modern UI/UX som lyfter varumärket och ökar konvertering." },
  { n: "05", title: "Webb & plattformar", tag: "Från landningssida till SaaS.", desc: "Snabba, säkra och skalbara lösningar — från landningssida till SaaS." },
  { n: "06", title: "Landningssidor", tag: "Sidor som säljer dygnet runt.", desc: "Konverterande sidor som driver leads och säljer hela dygnet." },
  { n: "07", title: "Digital marknadsföring", tag: "Meta & Google Ads med ROAS.", desc: "Meta Ads och Google Ads — datadriven annonsering med tydlig ROAS." },
  { n: "08", title: "SEO & innehåll", tag: "SEO som rankar & konverterar.", desc: "Programmatic SEO och innehåll som rankar — och konverterar." },
  { n: "09", title: "AI-integration", tag: "GPT, chatbottar & automation.", desc: "GPT-driven automation, chatbottar och AI-coacher inbyggda i din produkt." },
  { n: "10", title: "Strategi & rådgivning", tag: "Audits, MVP & strategi.", desc: "Tekniska audits, MVP-validering och digital strategi för bolag som vill växa rätt." },
  { n: "11", title: "CRO & analys", tag: "GA4, Hotjar & A/B-tester.", desc: "Datadriven optimering med GA4, Hotjar och A/B-testning som höjer konvertering." },
  { n: "12", title: "Underhåll & support", tag: "Drift, support & hosting.", desc: "Löpande utveckling, säkerhetsuppdateringar och hosting — vi sover så du slipper." },
];

const ServicesSection = () => (
  <section className="section" id="tjanster">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Tjänster</div></Reveal>
        <Reveal delay={0.1}>
          <div>
            <h2 className="h2">Vi utvecklar mjukvara med <span className="it">intention.</span></h2>
            <p className="lead" style={{ marginTop: 22 }}>
              Varje system vi bygger är skräddarsytt efter er verksamhet — inte tvärtom. Snabb leverans,
              transparent kommunikation och kod du äger från dag ett. Vi kombinerar utveckling, marknadsföring
              och AI för att leverera något som faktiskt rör nålen.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="svc-grid">
        {SERVICES.map((s) => (
          <div key={s.n} className="svc-cell">
            <span className="svc-num">→ {s.n}</span>
            <h3 className="svc-title">{s.title}</h3>
            <span className="svc-tag">{s.tag}</span>
            <p className="body">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ───── Arbeten ───── */
const FLAGSHIP = {
  title: "Aurora Transport",
  desc: "Komplett dispatch- och fakturasystem för åkerier. Bygger schemaläggning, körorder, Fortnox-export och Stripe-fakturering på under två veckor.",
  url: "auroratransport.se",
  meta: "Live · Under 2 veckor",
  tags: ["SaaS", "Lovable", "Supabase", "Stripe", "Fortnox API"],
  href: "/arbete/aurora-transport",
};

const PROJECTS = [
  { title: "Updro", desc: "Marknadsplats där företag jämför offerter från digitala byråer.", url: "updro.se", meta: "Live · 2 veckor", tags: ["SaaS", "Lovable", "Supabase"], href: "/arbete/updro" },
  { title: "AgilityManager", desc: "Träningsapp för svenska agility-förare. iOS + Android planerade 2026.", url: "agilitymanager.se", meta: "Live · Under 2 veckor", tags: ["SaaS", "Lovable", "Supabase"], href: "/arbete/agilitymanager" },
  { title: "Hönsgården", desc: "Freemium-app för svenska hönsägare. Webb + Google Play-app via Capacitor.", url: "honsgarden.se", meta: "Live · 1 vecka", tags: ["SaaS", "Lovable", "Supabase"], href: "/arbete/honsgarden" },
  { title: "Odlingsdagboken", desc: "Svensk odlings-SaaS med AI-coach.", url: "odlingsdagboken.com", meta: "Live · Under 2 veckor", tags: ["SaaS", "Lovable", "Supabase"], href: "/arbete/odlingsdagboken" },
  { title: "GoGlamping Sweden", desc: "Bokningssajt för glamping vid Göta kanal.", url: "goglampingsweden.se", meta: "Live · 1 vecka", tags: ["Utveckling", "React", "Vite"], href: "/arbete/goglamping-sweden" },
  { title: "Viriditas", desc: "Bokningssajt för massagemottagning.", url: "viriditasmassage.se", meta: "Live · Några dagar", tags: ["Utveckling", "React", "Vite"], href: "/arbete/viriditas" },
  { title: "Yachting Sweden", desc: "SEO och content för svensk båtbransch.", url: "yachtingsweden.se", meta: "Pågående", tags: ["SEO", "Technical SEO", "Content"], href: "/arbete/yachting-sweden" },
  { title: "Solcellsofferter.se", desc: "SEO för svensk solcellsmarknadsplats.", url: "solcellsofferter.se", meta: "Live", tags: ["SEO", "Content"], href: "/arbete/solcellsofferter" },
  { title: "Minandel.se", desc: "V85 travtips-sajt med custom tema.", url: "minandel.se", meta: "Live", tags: ["WordPress", "Custom theme"], href: "/arbete/minandel" },
];

const WorkSection = () => (
  <section className="section" id="arbeten">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Referenser · 10 projekt</div></Reveal>
        <Reveal delay={0.1}>
          <div>
            <h2 className="h2">9 live just nu. <span className="it">Inga exempel</span> från praktiken.</h2>
            <p className="lead" style={{ marginTop: 22 }}>
              Aurora Media driver en egen portfölj av SaaS-produkter med riktiga kunder, prenumerationer och
              MRR — plus utvecklings- och SEO-uppdrag åt svenska bolag. Klicka och se. Allt nedan är på riktigt.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <Link to={FLAGSHIP.href} className="work-feature" style={{ textDecoration: "none", color: "inherit" }}>
          <span className="badge">Flaggskepp</span>
          <div>
            <h3>{FLAGSHIP.title}</h3>
            <p className="body" style={{ marginBottom: 16, maxWidth: "60ch" }}>{FLAGSHIP.desc}</p>
            <div>
              {FLAGSHIP.tags.map((t) => <span key={t} className="pill">{t}</span>)}
            </div>
          </div>
          <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
            <div className="mono" style={{ marginBottom: 8 }}>{FLAGSHIP.url}</div>
            <div className="meta-label">{FLAGSHIP.meta}</div>
          </div>
        </Link>
      </Reveal>

      <div className="work-grid">
        {PROJECTS.map((p) => (
          <Link to={p.href} key={p.title} className="work-card">
            <h4>{p.title}</h4>
            <p className="body">{p.desc}</p>
            <div className="url" style={{ marginTop: 14 }}>{p.url}</div>
            <div className="meta">{p.meta}</div>
            <div style={{ marginTop: 10 }}>
              {p.tags.map((t) => <span key={t} className="pill">{t}</span>)}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 36, textAlign: "center" }}>
        <Link to="/arbete" className="btn btn-ghost">
          Se alla 10 projekt i detalj <span className="a"><ArrowUpRight size={14} /></span>
        </Link>
      </div>
    </div>
  </section>
);

/* ───── Branscher ───── */
const INDUSTRIES = [
  "Industri & Logistik", "Vård & Hälsa", "Fintech & Kassa", "Skönhet & Wellness",
  "SaaS & Tech", "E-handel", "Bygg & Hantverk", "Lantbruk & Hippologi",
];

const IndustriesSection = () => (
  <section className="section" id="branscher">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Branscher</div></Reveal>
        <Reveal delay={0.1}>
          <div>
            <h2 className="h2">Byggt för <span className="it">verkliga</span> verksamheter.</h2>
            <p className="lead" style={{ marginTop: 22 }}>
              Vi har levererat till svenska bolag i åtta olika branscher — från transportbolag och
              massageföretag till barnpsykiatri och e-handel.
            </p>
          </div>
        </Reveal>
      </div>
      <div className="ind-grid">
        {INDUSTRIES.map((i) => (
          <div key={i} className="ind-cell">{i}</div>
        ))}
      </div>
    </div>
  </section>
);

/* ───── Integrationer ───── */
const INTEGRATIONS = [
  { cat: "Ekonomi", list: "Fortnox, Visma, Bokio" },
  { cat: "Betalning", list: "Stripe, Klarna, Swish, PayPal, Adyen" },
  { cat: "Auth & ID", list: "BankID, Auth0, Clerk" },
  { cat: "Kommunikation", list: "Slack, Microsoft 365, Teams, Google Workspace" },
  { cat: "E-post & SMS", list: "Mailgun, Resend, Postmark, Twilio, 46elks" },
  { cat: "Marknadsföring", list: "Meta Ads, Google Ads, Mailchimp, Klaviyo, HubSpot, ActiveCampaign" },
  { cat: "E-handel & CMS", list: "Shopify, WooCommerce, WordPress, Webflow, Strapi" },
  { cat: "AI", list: "OpenAI, Anthropic, Google Gemini, Mistral, ElevenLabs" },
  { cat: "Backend & hosting", list: "Supabase, Vercel, Cloudflare, AWS, Firebase" },
  { cat: "Automation", list: "Zapier, Make, n8n" },
  { cat: "CRM", list: "Pipedrive, HubSpot, Salesforce" },
  { cat: "Övrigt", list: "Google Maps, Calendly, Notion, Airtable, Linear, Sentry" },
];

const IntegrationsSection = () => {
  const { open } = useContactModal();
  return (
    <section className="section" id="integrationer">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="meta-label">Integrationer</div></Reveal>
          <Reveal delay={0.1}>
            <div>
              <h2 className="h2">Sömlöst kopplat till <span className="it">din verksamhet.</span></h2>
              <p className="lead" style={{ marginTop: 22 }}>
                Vi bygger anpassade integrationer mot REST/GraphQL-API:er, OAuth 2.0-flöden och webhooks. Det
                här är bara ett urval — kan ditt verktyg prata API, kan vi koppla det.
              </p>
            </div>
          </Reveal>
        </div>
        <div className="int-grid">
          {INTEGRATIONS.map((i) => (
            <div key={i.cat} className="int-cell">
              <h4>{i.cat}</h4>
              <p>{i.list}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, padding: "clamp(28px,3vw,40px)", border: "1px solid var(--hair)", borderRadius: 10, display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ maxWidth: "52ch" }}>
            <h3 className="h3" style={{ marginBottom: 10 }}>Alla verktyg du inte ser</h3>
            <p className="body">
              Om ditt system pratar API, kan vi koppla det. OAuth 2.0, REST, GraphQL, webhooks — vi bygger
              anpassade integrationer på begäran.
            </p>
          </div>
          <button onClick={() => open()} className="btn btn-ghost">
            Diskutera din integration <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </div>
    </section>
  );
};

/* ───── Process ───── */
const PROCESS = [
  { n: "i.", name: "Vi kartlägger behovet", desc: "Workshop där vi förstår er verksamhet och målbild." },
  { n: "ii.", name: "Vi designar flödet", desc: "Wireframes, UX och tekniskt arkitekturförslag." },
  { n: "iii.", name: "Vi bygger första versionen", desc: "MVP byggd i modern stack med daglig avstämning." },
  { n: "iv.", name: "Vi testar med riktiga användare", desc: "Iterationer baserat på faktisk användning." },
  { n: "v.", name: "Du lanserar och äger koden", desc: "Full överlämning — kod, dokumentation och support." },
];

const ProcessSection = () => (
  <section className="section" id="process">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Process</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2">Från idé till lansering <span className="it">utan kaos.</span></h2>
        </Reveal>
      </div>
      <div className="proc-grid">
        {PROCESS.map((s) => (
          <div className="proc-step" key={s.n}>
            <span className="proc-num">{s.n}</span>
            <h3 className="proc-name">{s.name}</h3>
            <p className="body">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ───── Paket ───── */
const PACKAGES = [
  {
    n: "01", featured: false, name: "Prototyp",
    desc: "För dig som vill testa en idé snabbt innan större investering.",
    items: ["Klickbar prototyp", "1–2 användarflöden", "UX-genomgång", "Leverans på några dagar"],
    cta: "Starta med prototyp",
  },
  {
    n: "02", featured: true, name: "MVP",
    desc: "För dig som vill lansera en första fungerande produkt med riktiga kunder.",
    items: ["Fungerande webb-/mobilapp", "Auth, betalningar, databas", "Stripe + valfri integration", "Leverans 1–2 veckor", "Du äger koden"],
    cta: "Bygg min MVP",
  },
  {
    n: "03", featured: false, name: "Skräddarsytt system",
    desc: "För bolag som behöver affärssystem, integrationer eller intern plattform.",
    items: ["Anpassad arkitektur", "Fortnox/Visma-integration", "BankID & rollstyrning", "Multi-tenant SaaS", "Långsiktig utveckling"],
    cta: "Boka rådgivning",
  },
];

const PackagesSection = () => {
  const { open } = useContactModal();
  return (
    <section className="section" id="paket">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="meta-label">Paket</div></Reveal>
          <Reveal delay={0.1}>
            <div>
              <h2 className="h2">Välj hur snabbt du <span className="it">vill komma igång.</span></h2>
              <p className="lead" style={{ marginTop: 22 }}>
                Tre tydliga paketnivåer — från snabb prototyp till skräddarsytt affärssystem. Inga konstiga
                tilläggsfakturor, ingen abonnemangsfälla. Tydlig leveranstid, helt utan överraskningar.
              </p>
            </div>
          </Reveal>
        </div>
        <div className="price-grid">
          {PACKAGES.map((p) => (
            <Reveal key={p.n}>
              <div className={`price-card ${p.featured ? "featured" : ""}`}>
                {p.featured && <span className="price-tag">Populär</span>}
                <span className="price-num">{p.n}</span>
                <h3>{p.name}</h3>
                <p className="body">{p.desc}</p>
                <ul className="price-list">
                  {p.items.map((it) => (
                    <li key={it}><Check size={14} strokeWidth={2.5} /> {it}</li>
                  ))}
                </ul>
                <button onClick={() => open()} className={`btn ${p.featured ? "btn-moss" : "btn-ghost"}`}>
                  {p.cta} <span className="a"><ArrowRight size={14} /></span>
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ───── CTA ───── */
const CTA = () => {
  const { open } = useContactModal();
  return (
    <section id="kontakt" className="cta-band">
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <Reveal><div className="meta-label">Nästa steg</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2" style={{ marginTop: 18, maxWidth: "20ch" }}>
            Din idé förtjänar mer än <span className="it">att ligga i anteckningar.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="lead" style={{ marginTop: 22 }}>
            Berätta vad du vill bygga. Vi återkommer inom 24 timmar med förslag, tidsplan och ungefärlig
            budget — helt utan kostnad och bindning.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
            <button onClick={() => open()} className="btn btn-moss">
              Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
            </button>
            <a href="mailto:info@auroramedia.se" className="cta-email">info@auroramedia.se →</a>
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
          <p style={{ marginTop: 18, color: "var(--bone-mute)", maxWidth: "36ch" }}>
            Aurora Media AB — AI-driven mjukvarubyrå i Linköping. Vi bygger SaaS, MVP:er, interna system,
            webbappar, mobilappar, e-handel, integrationer och automatiseringar för svenska företag.
          </p>
          <p style={{ marginTop: 22 }}>
            <span className="meta-label">Org.nr</span><br />
            <span style={{ color: "var(--bone-soft)" }}>559272-0220</span>
          </p>
        </div>
        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>Tjänster</p>
          <a href="#tjanster">Alla tjänster</a>
          <Link to="/tjanster/hemsidor">Hemsidor</Link>
          <Link to="/tjanster/seo">SEO</Link>
          <Link to="/tjanster/mobilapp">Mobilapp</Link>
          <Link to="/ai-automation-foretag">AI-automation</Link>
        </div>
        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>Företag</p>
          <Link to="/arbete">Arbete</Link>
          <Link to="/process">Process</Link>
          <Link to="/priser">Paket & pris</Link>
          <Link to="/om">Om oss</Link>
        </div>
        <div>
          <p className="meta-label" style={{ marginBottom: 12 }}>Kontakt</p>
          <a href="mailto:info@auroramedia.se">info@auroramedia.se</a>
          <a href="#kontakt">Boka rådgivning</a>
          <Link to="/integritetspolicy">Integritetspolicy</Link>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--hair)", marginBlock: 48 }} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <span>© {new Date().getFullYear()} Aurora Media AB — 559272-0220</span>
        <span>Linköping · Sverige · 58°N · Svarstid &lt; 24 h</span>
      </div>
    </div>
  </footer>
);

/* ───── Page ───── */
const Index = () => (
  <>
    <SEO
      title="Aurora Media AB — AI-driven mjukvarubyrå i Linköping"
      description="Aurora Media bygger SaaS, MVP:er, interna system, webbappar, mobilappar, e-handel, integrationer och AI-automationer för svenska företag. Från idé till lansering på under fyra veckor."
    />
    <style>{TOKENS}</style>
    <div className="aur">
      <Nav />
      <main>
        <Hero />
        <MetodSection />
        <ServicesSection />
        <WorkSection />
        <IndustriesSection />
        <IntegrationsSection />
        <ProcessSection />
        <PackagesSection />
        <CTA />
      </main>
      <Footer />
    </div>
  </>
);

export default Index;
