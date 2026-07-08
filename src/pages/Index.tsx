import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Plus, Minus } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";

/* ─────────────────────────────────────────────────────────────
   NORDISK VERKSTAD — startsidans nya designsystem
   Presentation only. Rör inte scripts/, supabase-anrop eller routes.
   ───────────────────────────────────────────────────────────── */

const CSS = `
.verkstad {
  --bjork: #F6F5F1;
  --bjork-djup: #EBE9E3;
  --granbark: #14171A;
  --granbark-mut: #4A5058;
  --gran: #0F5132;
  --gran-soft: #E4EEE8;
  --varsel: #E8500A;
  --varsel-hover: #C64308;
  --linje: #D8D5CC;
  --font-sans: "Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Spline Sans Mono", ui-monospace, monospace;

  background: var(--bjork);
  color: var(--granbark);
  font-family: var(--font-sans);
  font-size: 17px;
  line-height: 1.65;
  font-feature-settings: "ss01", "kern", "liga";
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow-x: clip;
}
.verkstad::before {
  content: "";
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: .025;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  mix-blend-mode: multiply;
}
.verkstad main { position: relative; z-index: 2; }

.verkstad h1, .verkstad h2, .verkstad h3, .verkstad h4 {
  font-family: var(--font-sans);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--granbark);
  line-height: 1.05;
  text-wrap: balance;
}
.verkstad h1 { font-size: clamp(44px, 6vw, 76px); font-weight: 800; letter-spacing: -0.028em; }
.verkstad h2 { font-size: clamp(32px, 4.4vw, 54px); letter-spacing: -0.024em; line-height: 1.08; }
.verkstad h3 { font-size: clamp(20px, 2vw, 24px); }
.verkstad p  { text-wrap: pretty; color: var(--granbark); }

.vk-wrap { max-width: 1180px; margin-inline: auto; padding-inline: clamp(20px, 4vw, 40px); }
.vk-section { padding-block: clamp(72px, 10vw, 128px); }
.vk-mono { font-family: var(--font-mono); font-size: 12.5px; letter-spacing: .08em; text-transform: uppercase; color: #3E444B; font-weight: 500; }
.vk-hair { height: 1px; background: var(--linje); border: 0; }

/* ── Buttons ── */
.vk-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 22px; border-radius: 999px;
  font-family: var(--font-sans); font-size: 15px; font-weight: 600;
  border: 1px solid transparent; cursor: pointer; text-decoration: none;
  transition: background .2s ease, color .2s ease, border-color .2s ease, transform .2s ease;
  white-space: nowrap; position: relative; overflow: hidden;
}
.vk-btn-primary { background: var(--varsel); color: #fff; }
.vk-btn-primary::after {
  content: ""; position: absolute; inset: 0;
  background: var(--varsel-hover);
  transform: translateX(-101%); transition: transform .4s cubic-bezier(.16,1,.3,1);
  z-index: 0;
}
.vk-btn-primary:hover::after { transform: translateX(0); }
.vk-btn-primary > * { position: relative; z-index: 1; }

.vk-btn-ghost { background: transparent; color: var(--granbark); border-color: var(--granbark); }
.vk-btn-ghost:hover { background: var(--granbark); color: var(--bjork); }

/* ── Nav ── */
.vk-nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(246,245,241,.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--linje);
  transition: box-shadow .2s ease;
}
.vk-nav.scrolled { box-shadow: 0 1px 0 var(--linje); }
.vk-nav-inner {
  display: flex; align-items: center; justify-content: space-between;
  padding-block: 18px;
}
.vk-brand {
  display: inline-flex; align-items: baseline; gap: 6px;
  font-family: var(--font-sans); font-weight: 800; font-size: 20px;
  letter-spacing: -0.03em; color: var(--granbark); text-decoration: none;
}
.vk-brand-dot { width: 8px; height: 8px; border-radius: 2px; background: var(--gran); display: inline-block; }
.vk-nav-links { display: none; gap: 28px; }
@media (min-width: 900px) { .vk-nav-links { display: flex; } }
.vk-nav-links a { color: var(--granbark); text-decoration: none; font-size: 14px; font-weight: 500; opacity: .8; }
.vk-nav-links a:hover { opacity: 1; }

/* ── Hero ── */
.vk-hero { padding-top: clamp(56px, 8vw, 96px); padding-bottom: clamp(72px, 10vw, 128px); }
.vk-hero-grid { display: grid; gap: clamp(40px, 6vw, 72px); grid-template-columns: 1fr; align-items: center; }
@media (min-width: 980px) { .vk-hero-grid { grid-template-columns: 1.1fr .9fr; } }
.vk-hero h1 .accent { color: var(--gran); }
.vk-hero-sub { margin-top: 24px; max-width: 54ch; font-size: 18px; color: #3E444B; line-height: 1.6; }
.vk-hero-cta { margin-top: 32px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.vk-hero-micro { margin-top: 18px; }

/* ── Signature animation panel ── */
.vk-sig {
  border: 1px solid var(--linje);
  background: var(--bjork-djup);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  min-height: 460px;
  display: grid; gap: 20px;
  grid-template-rows: auto 1fr;
}
.vk-sig-prompt {
  background: #0F1215;
  color: #EDECE5;
  border-radius: 12px;
  padding: 16px 18px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.55;
  min-height: 90px;
  position: relative;
}
.vk-sig-prompt::before {
  content: "prompt.txt";
  position: absolute; top: -10px; left: 14px;
  background: var(--gran); color: #fff;
  font-size: 10px; padding: 3px 8px; border-radius: 4px;
  letter-spacing: .08em; text-transform: uppercase; font-weight: 600;
}
.vk-sig-caret { display: inline-block; width: 8px; background: #7FE3B0; margin-left: 2px; animation: caret 1s steps(1) infinite; }
@keyframes caret { 50% { opacity: 0; } }
.vk-sig-ui {
  display: grid; gap: 12px; align-content: start;
}
.vk-sig-card {
  background: #fff; border: 1px solid var(--linje); border-radius: 10px;
  padding: 14px 16px; display: flex; align-items: center; justify-content: space-between;
}
.vk-sig-card .label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: var(--granbark-mut); }
.vk-sig-card .val { font-weight: 700; font-size: 16px; }
.vk-sig-row {
  background: #fff; border: 1px solid var(--linje); border-radius: 10px;
  padding: 12px 16px; display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center; font-size: 13px;
}
.vk-sig-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--gran-soft); color: var(--gran);
  border-radius: 999px; padding: 6px 12px;
  font-size: 12px; font-weight: 600;
}

/* ── Marquee ── */
.vk-marquee-wrap { overflow: hidden; border-block: 1px solid var(--linje); padding-block: 22px; }
.vk-marquee { display: flex; gap: 48px; animation: marquee 40s linear infinite; width: max-content; }
@media (prefers-reduced-motion: reduce) { .vk-marquee { animation: none; } }
.vk-marquee span { font-family: var(--font-mono); font-size: 14px; color: var(--granbark); opacity: .55; white-space: nowrap; letter-spacing: .02em; }
.vk-marquee span::after { content: "·"; margin-left: 48px; opacity: .4; }
@keyframes marquee { to { transform: translateX(-50%); } }

.vk-stats { display: grid; gap: 24px; grid-template-columns: repeat(3, 1fr); margin-top: 40px; }
@media (max-width: 720px) { .vk-stats { grid-template-columns: 1fr; } }
.vk-stat-num { font-size: clamp(44px, 6vw, 72px); font-weight: 800; letter-spacing: -0.03em; line-height: 1; color: var(--gran); font-family: var(--font-sans); }
.vk-stat-label { margin-top: 12px; color: var(--granbark); font-weight: 500; }

/* ── Problem table ── */
.vk-cmp { margin-top: 40px; border: 1px solid var(--linje); border-radius: 14px; overflow: hidden; }
.vk-cmp-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  border-bottom: 1px solid var(--linje);
}
.vk-cmp-row:last-child { border-bottom: 0; }
.vk-cmp-cell { padding: 22px 24px; font-size: 16px; }
.vk-cmp-left { color: var(--granbark-mut); border-right: 1px solid var(--linje); }
.vk-cmp-right { font-weight: 600; display: flex; align-items: center; gap: 10px; }
.vk-cmp-check { color: var(--gran); flex-shrink: 0; }
@media (max-width: 620px) {
  .vk-cmp-row { grid-template-columns: 1fr; }
  .vk-cmp-left { border-right: 0; border-bottom: 1px solid var(--linje); }
}

/* ── Process timeline ── */
.vk-timeline { margin-top: 48px; display: grid; gap: 32px; position: relative; }
.vk-timeline::before {
  content: ""; position: absolute; left: 15px; top: 0; bottom: 0; width: 1px; background: var(--linje);
}
.vk-tl-step { position: relative; padding-left: 56px; }
.vk-tl-dot {
  position: absolute; left: 8px; top: 6px; width: 14px; height: 14px;
  border-radius: 50%; background: var(--bjork); border: 2px solid var(--gran);
}
.vk-tl-label { color: var(--gran); font-weight: 700; }

/* ── Case cards ── */
.vk-cases { margin-top: 48px; display: grid; gap: 24px; grid-template-columns: repeat(3, 1fr); }
@media (max-width: 900px) { .vk-cases { grid-template-columns: 1fr; } }
.vk-case { text-decoration: none; color: inherit; display: block; }
.vk-case-browser {
  border-radius: 12px; overflow: hidden; border: 1px solid var(--linje);
  background: #fff; transition: transform .5s cubic-bezier(.16,1,.3,1), box-shadow .5s;
  transform-origin: center;
}
.vk-case:hover .vk-case-browser { transform: rotate(-1deg) translateY(-4px); box-shadow: 0 20px 40px -20px rgba(20,23,26,.15); }
.vk-case-chrome {
  display: flex; align-items: center; gap: 6px; padding: 10px 14px;
  border-bottom: 1px solid var(--linje); background: var(--bjork-djup);
}
.vk-case-chrome i { width: 10px; height: 10px; border-radius: 50%; background: var(--linje); display: block; }
.vk-case-img { aspect-ratio: 16/10; object-fit: cover; width: 100%; display: block; }
.vk-case h3 { margin-top: 18px; }
.vk-case p { margin-top: 8px; color: var(--granbark-mut); font-size: 15px; }
.vk-case-meta { margin-top: 14px; font-family: var(--font-mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--gran); }

/* ── Receipts ── */
.vk-receipts { margin-top: 48px; display: grid; gap: 28px; grid-template-columns: repeat(3, 1fr); }
@media (max-width: 900px) { .vk-receipts { grid-template-columns: 1fr; } }
.vk-receipt {
  position: relative; padding: 32px 26px 28px;
  background: #fff; font-family: var(--font-mono); font-size: 13px;
  border: 1px dashed var(--linje);
  border-radius: 6px;
  transition: transform .3s ease, box-shadow .3s ease;
}
.vk-receipt:hover { transform: translateY(-4px); box-shadow: 0 24px 40px -24px rgba(20,23,26,.2); }
.vk-receipt::before, .vk-receipt::after {
  content: ""; position: absolute; left: 0; right: 0; height: 12px;
  background-image: radial-gradient(circle at 6px 6px, var(--bjork) 5px, transparent 5px);
  background-size: 12px 12px; background-repeat: repeat-x;
}
.vk-receipt::before { top: -1px; }
.vk-receipt::after { bottom: -1px; transform: rotate(180deg); }
.vk-receipt-stamp {
  position: absolute; top: 20px; right: 14px;
  transform: rotate(-6deg);
  border: 2px solid var(--varsel); color: var(--varsel);
  font-weight: 700; letter-spacing: .12em; font-size: 11px;
  padding: 6px 10px; border-radius: 4px; text-transform: uppercase;
  background: rgba(232,80,10,.06);
}
.vk-receipt-tier { color: var(--granbark-mut); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
.vk-receipt-price { margin-top: 6px; font-size: 26px; font-weight: 700; color: var(--granbark); font-family: var(--font-mono); letter-spacing: -0.01em; }
.vk-receipt-desc { margin-top: 14px; color: var(--granbark); line-height: 1.55; font-family: var(--font-sans); font-size: 14px; }
.vk-receipt-flag {
  position: absolute; top: -1px; left: -1px;
  background: var(--gran); color: #fff;
  font-family: var(--font-sans); font-size: 11px; font-weight: 700;
  padding: 5px 12px; border-radius: 6px 0 6px 0; letter-spacing: .03em;
}

/* ── AI-karta panel ── */
.vk-panel {
  margin-top: 32px; background: var(--bjork-djup);
  border-radius: 20px; padding: clamp(40px, 6vw, 72px);
  display: grid; gap: 24px;
}

/* ── Founder ── */
.vk-founder { margin-top: 40px; display: grid; gap: 28px; grid-template-columns: auto 1fr; align-items: start; }
@media (max-width: 720px) { .vk-founder { grid-template-columns: 1fr; } }
.vk-founder-mark {
  width: 96px; height: 96px; border-radius: 50%;
  background: var(--gran); color: #fff;
  display: grid; place-items: center;
  font-family: var(--font-sans); font-size: 40px; font-weight: 800;
  letter-spacing: -0.03em;
}

/* ── FAQ ── */
.vk-faq { margin-top: 40px; border-top: 1px solid var(--linje); }
.vk-faq-item { border-bottom: 1px solid var(--linje); }
.vk-faq-q {
  width: 100%; padding: 22px 4px; text-align: left; background: none; border: 0; cursor: pointer;
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  font-family: var(--font-sans); font-size: 18px; font-weight: 600; color: var(--granbark);
}
.vk-faq-icon { flex-shrink: 0; color: var(--gran); transition: transform .3s ease; }
.vk-faq-a { padding: 0 4px 24px; color: var(--granbark-mut); font-size: 16px; line-height: 1.65; }

/* ── Dark CTA ── */
.vk-dark {
  margin-top: 0;
  background: var(--granbark); color: var(--bjork);
  padding-block: clamp(80px, 10vw, 128px);
}
.vk-dark h2 { color: var(--bjork); }
.vk-dark p { color: rgba(246,245,241,.7); }
.vk-dark .vk-mono { color: rgba(246,245,241,.5); }

/* ── Footer ── */
.vk-footer { background: var(--bjork); border-top: 1px solid var(--linje); padding-block: 56px 40px; font-family: var(--font-mono); font-size: 13px; }
.vk-footer-grid { display: grid; gap: 40px; grid-template-columns: repeat(4, 1fr); }
@media (max-width: 900px) { .vk-footer-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .vk-footer-grid { grid-template-columns: 1fr; } }
.vk-footer h4 { font-family: var(--font-mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--granbark-mut); font-weight: 500; margin-bottom: 14px; }
.vk-footer a { display: block; color: var(--granbark); text-decoration: none; padding: 4px 0; opacity: .8; }
.vk-footer a:hover { opacity: 1; color: var(--gran); }
.vk-footer-bottom { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--linje); display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: var(--granbark-mut); }

/* ── Focus ── */
.verkstad a:focus-visible, .verkstad button:focus-visible {
  outline: 2px solid var(--gran); outline-offset: 3px; border-radius: 4px;
}

/* ── Section headings block ── */
.vk-secheader { display: grid; gap: 18px; max-width: 68ch; }
`;

/* ────────── Data ────────── */

const PRODUCTS = [
  "Aurora Transport", "Updro", "Hönsgården", "Odlingsdagboken",
  "AgilityManager", "Viriditas", "Cykelhjälpen", "Bergs Slussar Glamping",
];

const CASES = [
  {
    title: "Aurora Transport",
    tagline: "Dispatch, körorder och Fortnox-fakturering för åkerier.",
    meta: "BYGGTID: <2 VECKOR · I DRIFT",
    thumb: "/portfolio/aurora-transport.webp",
    href: "/arbete/aurora-transport",
  },
  {
    title: "Hönsgården",
    tagline: "Freemium-app med statistik och AI-stöd för hönsägare.",
    meta: "BYGGTID: <3 VECKOR · BETALANDE KUND: DAG 1",
    thumb: "/portfolio/honsgarden.webp",
    href: "/arbete/honsgarden",
  },
  {
    title: "Bergs Slussar Glamping",
    tagline: "Digital bokning och gästkommunikation vid Göta kanal.",
    meta: "BYGGTID: <2 VECKOR · I DRIFT",
    thumb: "/portfolio/goglamping-sweden.webp",
    href: "/arbete/goglamping-sweden",
  },
];

const FAQS = [
  { q: "Äger vi koden?", a: "Ja. Allt – kod, data, konton – står på er från dag ett. Ingen inlåsning." },
  { q: "Är fast pris på riktigt?", a: "Ja. Vill ni ändra scope skriver jag en ny fast offert. Ni får aldrig en överraskande faktura." },
  { q: "Vad händer efter lansering?", a: "30 dagars buggfri-garanti ingår. Sedan underhåll från 1 990 kr/mån – eller sköt det själva, det är er kod." },
  { q: "Måste vi kunna teknik?", a: "Nej. Ni kan ert flöde, jag kan resten. Ni testar klickbara versioner, inte läser rapporter." },
  { q: "Fungerar det på distans?", a: "Ja – video 1–2 gånger i veckan. I Östergötland ses vi gärna fysiskt." },
];

const CITIES = [
  ["Linköping", "/ai-byra-linkoping"], ["Norrköping", "/ai-byra-norrkoping"],
  ["Stockholm", "/ai-byra-stockholm"], ["Göteborg", "/ai-byra-goteborg"],
  ["Malmö", "/ai-byra-malmo"], ["Uppsala", "/ai-byra-uppsala"],
  ["Motala", "/ai-byra-motala"], ["Nyköping", "/ai-byra-nykoping"],
];

/* ────────── Small components ────────── */

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >{children}</motion.div>
  );
};

const CountUp = ({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(to); return; }
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduce]);
  return <span ref={ref}>{prefix}{n}{suffix}</span>;
};

/* ────────── Nav ────────── */

const VkNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const { open } = useContactModal();
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`vk-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="vk-wrap vk-nav-inner">
        <Link to="/" className="vk-brand">
          <span className="vk-brand-dot" /> aurora media
        </Link>
        <nav className="vk-nav-links" aria-label="Huvudmeny">
          <Link to="/arbete">Arbete</Link>
          <Link to="/tjanster">Tjänster</Link>
          <Link to="/priser">Priser</Link>
          <Link to="/ai-karta">AI-kartan</Link>
          <Link to="/om">Om</Link>
        </nav>
        <button onClick={() => open()} className="vk-btn vk-btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>
          Boka samtal <ArrowRight size={14} />
        </button>
      </div>
    </header>
  );
};

/* ────────── Signature animation ────────── */

const PROMPT = "Bygg ett dispatchsystem för vårt åkeri – körorder, schema, Fortnox-fakturering.";

const Signature = () => {
  const reduce = useReducedMotion();
  const [text, setText] = useState(reduce ? PROMPT : "");
  const [stage, setStage] = useState(reduce ? 4 : 0);

  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        setText(""); setStage(0);
        for (let i = 0; i <= PROMPT.length; i++) {
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, 22));
          setText(PROMPT.slice(0, i));
        }
        for (let s = 1; s <= 4; s++) {
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, 550));
          setStage(s);
        }
        await new Promise((r) => setTimeout(r, 4500));
      }
    };
    run();
    return () => { cancelled = true; };
  }, [reduce]);

  return (
    <div className="vk-sig" aria-hidden={!reduce}>
      <div className="vk-sig-prompt">
        {text}<span className="vk-sig-caret">&nbsp;</span>
      </div>
      <div className="vk-sig-ui">
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              key="c1"
              className="vk-sig-card"
              initial={{ opacity: 0, y: 12, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <div>
                <div className="label">Körorder #214</div>
                <div className="val" style={{ marginTop: 4 }}>Linköping → Jönköping</div>
              </div>
              <div className="vk-mono" style={{ fontSize: 12 }}>07:40</div>
            </motion.div>
          )}
          {stage >= 2 && (
            <motion.div
              key="c2"
              className="vk-sig-row"
              initial={{ opacity: 0, y: 12, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <span>Chaufför · A. Lund</span>
              <span className="vk-mono" style={{ fontSize: 11 }}>18 t</span>
              <span className="vk-mono" style={{ fontSize: 11, color: "var(--gran)" }}>OK</span>
            </motion.div>
          )}
          {stage >= 3 && (
            <motion.div
              key="c3"
              className="vk-sig-row"
              initial={{ opacity: 0, y: 12, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <span>Faktura #F-2214</span>
              <span className="vk-mono" style={{ fontSize: 11 }}>14 250 kr</span>
              <span className="vk-mono" style={{ fontSize: 11, color: "var(--gran)" }}>Skickad</span>
            </motion.div>
          )}
          {stage >= 4 && (
            <motion.div
              key="badge"
              initial={{ opacity: 0, scale: .8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              style={{ marginTop: 4 }}
            >
              <span className="vk-sig-badge">
                <Check size={12} strokeWidth={3} /> Fakturerad via Fortnox
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ────────── Sections ────────── */

const HeroSection = () => (
  <section className="vk-section vk-hero">
    <div className="vk-wrap vk-hero-grid">
      <div>
        <motion.p
          className="vk-mono"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6, ease: [0.16,1,0.3,1] }}
        >
          AI-byrå · Linköping · Fast pris
        </motion.p>
        <motion.h1
          style={{ marginTop: 20 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8, delay: .1, ease: [0.16,1,0.3,1] }}
        >
          Från Excel-kaos till egen SaaS.{" "}
          <span className="accent">På två veckor.</span>
        </motion.h1>
        <motion.p
          className="vk-hero-sub"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8, delay: .3 }}
        >
          Jag bygger interna system, AI-automationer och SaaS åt svenska småföretag.
          Fast pris från 14 900 kr. Kod ni äger själva.
        </motion.p>
        <motion.div
          className="vk-hero-cta"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, delay: .5 }}
        >
          <Link to="/ai-karta" className="vk-btn vk-btn-primary">
            <span>Starta gratis AI-kartläggning</span> <ArrowRight size={16} />
          </Link>
          <Link to="/arbete" className="vk-btn vk-btn-ghost">
            Se vad jag byggt <ArrowUpRight size={16} />
          </Link>
        </motion.div>
        <motion.p
          className="vk-mono vk-hero-micro"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: .5, delay: .8 }}
        >
          5 minuter · Inget säljsamtal · Svar inom 24 h
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .9, delay: .4, ease: [0.16,1,0.3,1] }}
      >
        <Signature />
      </motion.div>
    </div>
  </section>
);

const ProofStrip = () => (
  <>
    <div className="vk-marquee-wrap">
      <div className="vk-wrap" style={{ marginBottom: 16 }}>
        <span className="vk-mono">I skarp drift just nu</span>
      </div>
      <div className="vk-marquee">
        {[...PRODUCTS, ...PRODUCTS].map((p, i) => <span key={i}>{p}</span>)}
      </div>
    </div>
    <div className="vk-wrap" style={{ paddingBlock: "clamp(40px, 6vw, 72px)" }}>
      <div className="vk-stats">
        <div>
          <div className="vk-stat-num"><CountUp to={10} /></div>
          <div className="vk-stat-label">produkter live</div>
        </div>
        <div>
          <div className="vk-stat-num"><CountUp to={2} suffix=" v" /></div>
          <div className="vk-stat-label">snittleverans</div>
        </div>
        <div>
          <div className="vk-stat-num">Dag <CountUp to={1} /></div>
          <div className="vk-stat-label">betalande kund på senaste bygget</div>
        </div>
      </div>
    </div>
  </>
);

const ProblemSection = () => (
  <section className="vk-section">
    <div className="vk-wrap">
      <Reveal>
        <div className="vk-secheader">
          <span className="vk-mono">Problemet</span>
          <h2>Ni har fått offerten: 400 000 kr och sex månader.</h2>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="vk-cmp">
          {[
            ["1 500 kr/timmen", "Fast pris innan start"],
            ["Leverans \"under Q3\"", "Fungerande version vecka 1"],
            ["Workshop och rapport", "Produkt ni klickar i"],
          ].map(([l, r]) => (
            <div className="vk-cmp-row" key={l}>
              <div className="vk-cmp-cell vk-cmp-left">{l}</div>
              <div className="vk-cmp-cell vk-cmp-right">
                <Check size={18} strokeWidth={2.5} className="vk-cmp-check" /> {r}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

const ProcessSection = () => (
  <section className="vk-section" style={{ background: "var(--bjork-djup)" }}>
    <div className="vk-wrap">
      <Reveal>
        <div className="vk-secheader">
          <span className="vk-mono">Så funkar det</span>
          <h2>Tre steg. Fjorton dagar. Ni är i drift.</h2>
        </div>
      </Reveal>
      <div className="vk-timeline">
        {[
          { d: "Dag 1", t: "Samtalet", b: "20 minuter. Ni beskriver flödet som stjäl mest tid. Jag säger ärligt om det är värt att bygga." },
          { d: "Dag 3–5", t: "Prototypen", b: "Fast offert + klickbar produkt. Ni ser vad ni köper innan ni betalar fullt." },
          { d: "Dag 14", t: "Lansering", b: "Systemet i drift hos er. Koden er. 30 dagars garanti börjar ticka." },
        ].map((s, i) => (
          <Reveal delay={i * 0.08} key={s.d}>
            <div className="vk-tl-step">
              <span className="vk-tl-dot" />
              <div className="vk-mono vk-tl-label">{s.d} — {s.t}</div>
              <p style={{ marginTop: 8, fontSize: 17, color: "var(--granbark)" }}>{s.b}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const CasesSection = () => (
  <section className="vk-section">
    <div className="vk-wrap">
      <Reveal>
        <div className="vk-secheader">
          <span className="vk-mono">Case</span>
          <h2>Byggt. Lanserat. I drift.</h2>
        </div>
      </Reveal>
      <div className="vk-cases">
        {CASES.map((c, i) => (
          <Reveal delay={i * 0.06} key={c.title}>
            <Link to={c.href} className="vk-case">
              <div className="vk-case-browser">
                <div className="vk-case-chrome"><i/><i/><i/></div>
                <img src={c.thumb} alt={`${c.title} – produktskärmdump`} className="vk-case-img" loading="lazy" />
              </div>
              <h3>{c.title}</h3>
              <p>{c.tagline}</p>
              <div className="vk-case-meta">{c.meta}</div>
            </Link>
          </Reveal>
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <Link to="/arbete" className="vk-btn vk-btn-ghost">
          Alla case <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </section>
);

const ReceiptsSection = () => (
  <section className="vk-section" style={{ background: "var(--bjork-djup)" }}>
    <div className="vk-wrap">
      <Reveal>
        <div className="vk-secheader">
          <span className="vk-mono">Fast pris</span>
          <h2>Tre paket. Inga överraskningar.</h2>
        </div>
      </Reveal>
      <div className="vk-receipts">
        {[
          { tier: "Prototyp", price: "14 900:-", desc: "Klickbar produkt på 3–5 dagar. Testa idén skarpt innan ni satsar." },
          { tier: "MVP", price: "34 900:-", desc: "Lanseringsklar på två veckor. Inloggning, betalning, admin.", flag: "Flest väljer denna" },
          { tier: "SaaS", price: "från 69 000:-", desc: "Full produkt: kundportal, integrationer (Fortnox, Stripe), drift." },
        ].map((r, i) => (
          <Reveal delay={i * 0.08} key={r.tier}>
            <div className="vk-receipt">
              {r.flag && <span className="vk-receipt-flag">{r.flag}</span>}
              <span className="vk-receipt-stamp">Fast pris</span>
              <div className="vk-receipt-tier">{r.tier}</div>
              <div className="vk-receipt-price">{r.price}</div>
              <p className="vk-receipt-desc">{r.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="vk-mono" style={{ marginTop: 32 }}>
        Priser exkl. moms · Exakt offert inom 24 h · Inga timmar, aldrig löpande räkning
      </p>
    </div>
  </section>
);

const AIKartaSection = () => (
  <section className="vk-section">
    <div className="vk-wrap">
      <Reveal>
        <div className="vk-panel">
          <span className="vk-mono">AI-kartan</span>
          <h2 style={{ maxWidth: "18ch" }}>Vad kan AI automatisera hos er?</h2>
          <p style={{ maxWidth: "58ch", fontSize: 18, color: "var(--granbark-mut)" }}>
            Svara på fem frågor om er verksamhet. Ni får en konkret karta över vilka flöden
            som går att automatisera och vad de kostar er idag. Gratis, fem minuter.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 8 }}>
            <Link to="/ai-karta" className="vk-btn vk-btn-primary">
              <span>Gör AI-kartan nu</span> <ArrowRight size={16} />
            </Link>
            <span className="vk-mono">Resultat direkt på skärmen · 4 uppföljande tips · Avsluta när ni vill</span>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

const ManifestSection = () => (
  <section className="vk-section">
    <div className="vk-wrap">
      <Reveal>
        <div className="vk-secheader">
          <span className="vk-mono">Manifest</span>
          <h2>Byggare, inte rådgivare.</h2>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="vk-founder">
          <div className="vk-founder-mark">C</div>
          <div>
            <p style={{ fontSize: 19, lineHeight: 1.6, maxWidth: "62ch" }}>
              Jag fakturerar inte möten. Jag har byggt tio egna produkter – dispatch för åkerier,
              bokning för besöksnäring, verktyg för lantbruk – och driver flera av dem själv, varje dag.
              När jag säger två veckor är det inte en ambition. Det är facit.
            </p>
            <p style={{ marginTop: 24, fontWeight: 700, fontSize: 17 }}>Christoffer Holstensson · Grundare</p>
            <p className="vk-mono" style={{ marginTop: 6 }}>
              Aurora Media AB · Org.nr 559272-0220 · Linköping
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="vk-section" style={{ background: "var(--bjork-djup)" }}>
      <div className="vk-wrap">
        <Reveal>
          <div className="vk-secheader">
            <span className="vk-mono">Frågor</span>
            <h2>Det ni undrar innan ni skickar första mejlet.</h2>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="vk-faq">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div className="vk-faq-item" key={f.q}>
                  <button className="vk-faq-q" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                    {f.q}
                    <span className="vk-faq-icon">{isOpen ? <Minus size={20} /> : <Plus size={20} />}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: .3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <p className="vk-faq-a">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const FinalCTA = () => {
  const { open } = useContactModal();
  return (
    <section className="vk-dark">
      <div className="vk-wrap">
        <Reveal>
          <span className="vk-mono">Slut-CTA</span>
          <h2 style={{ marginTop: 18, maxWidth: "20ch" }}>
            Jag tar in två nya projekt per månad.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ marginTop: 22, maxWidth: "58ch", fontSize: 18 }}>
            Det är baksidan av att en person bygger allt: kvaliteten är hög och platserna få.
            Boka en gratis AI-genomlysning så vet ni exakt vad ni skulle bygga först –
            och om jag är rätt person att göra det.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <button onClick={() => open()} className="vk-btn vk-btn-primary">
              <span>Boka gratis genomlysning</span> <ArrowRight size={16} />
            </button>
            <a href="mailto:info@auroramedia.se" style={{ color: "var(--bjork)", opacity: .8, textDecoration: "none", fontFamily: "var(--font-mono)", fontSize: 13 }}>
              info@auroramedia.se →
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="vk-mono" style={{ marginTop: 20 }}>
            Inget säljmanus · Ärligt besked · Svar inom 24 h
          </p>
        </Reveal>
      </div>
    </section>
  );
};

const VkFooter = () => (
  <footer className="vk-footer">
    <div className="vk-wrap">
      <div className="vk-footer-grid">
        <div>
          <h4>Tjänster</h4>
          <Link to="/tjanster">Alla tjänster</Link>
          <Link to="/tjanster/hemsidor">Hemsidor</Link>
          <Link to="/tjanster/mobilapp">Mobilapp</Link>
          <Link to="/ai-automation-foretag">AI-automation</Link>
          <Link to="/tjanster/seo">SEO</Link>
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
          <Link to="/arbete/goglamping-sweden">Bergs Slussar Glamping</Link>
        </div>
        <div>
          <h4>Bolag</h4>
          <a href="mailto:info@auroramedia.se">info@auroramedia.se</a>
          <Link to="/om">Om Aurora</Link>
          <Link to="/kontakt">Kontakt</Link>
          <Link to="/integritetspolicy">Integritetspolicy</Link>
          <span style={{ display: "block", padding: "4px 0", opacity: .6 }}>Org.nr 559272-0220</span>
        </div>
      </div>
      <div className="vk-footer-bottom">
        <span>© {new Date().getFullYear()} Aurora Media AB · Linköping</span>
        <span>Svarstid &lt; 24 h · GDPR & EU-datalagring</span>
      </div>
    </div>
  </footer>
);

/* ────────── Page ────────── */

const Index = () => (
  <>
    <SEO
      title="Aurora Media AB | AI-driven mjukvarupartner för svenska företag"
      description="Aurora Media bygger AI-lösningar, interna system, appar och SaaS för svenska företag. Snabb leverans, tydligt scope och kod ni äger."
      canonical="/"
    />
    <style>{CSS}</style>
    <div className="verkstad">
      <VkNav />
      <main>
        <HeroSection />
        <ProofStrip />
        <ProblemSection />
        <ProcessSection />
        <CasesSection />
        <ReceiptsSection />
        <AIKartaSection />
        <ManifestSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <VkFooter />
    </div>
  </>
);

export default Index;
