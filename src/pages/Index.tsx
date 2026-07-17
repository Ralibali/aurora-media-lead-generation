import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Plus, Minus } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { Reveal, VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import LiveBuildDemo from "@/components/verkstad/LiveBuildDemo";
import "@/styles/verkstad.css";

// Re-export for backwards compatibility with pages that import from @/pages/Index
export { Reveal, VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";


/* ────────── Data ────────── */

const PRODUCTS: { name: string; url: string }[] = [
  { name: "Aurora Transport", url: "https://auroratransport.se" },
  { name: "Updro", url: "https://updro.se" },
  { name: "Hönsgården", url: "https://honsgarden.se" },
  { name: "Odlingsdagboken", url: "https://odlingsdagboken.com" },
  { name: "AgilityManager", url: "https://agilitymanager.se" },
  { name: "Viriditas", url: "https://viriditasmassage.se" },
  { name: "Bergs Slussar Glamping", url: "https://goglampingsweden.se" },
];

const CASES = [
  {
    title: "Aurora Transport",
    tagline: "Dispatch, körorder och Fortnox-fakturering för åkerier.",
    meta: "BYGGTID: <2 VECKOR · I DRIFT",
    result: "Betalande kund dag 1",
    thumb: "/portfolio/aurora-transport.webp",
    href: "/arbete/aurora-transport",
  },
  {
    title: "Hönsgården",
    tagline: "Freemium-app med statistik och AI-stöd för hönsägare.",
    meta: "BYGGTID: <3 VECKOR · I DRIFT",
    result: "67 % premium-konvertering bland aktiva",
    thumb: "/portfolio/honsgarden.webp",
    href: "/arbete/honsgarden",
  },
  {
    title: "Bergs Slussar Glamping",
    tagline: "Digital bokning och gästkommunikation vid Göta kanal.",
    meta: "BYGGTID: <2 VECKOR · I DRIFT",
    result: "Lansering maj 2026",
    thumb: "/portfolio/goglamping-sweden.webp",
    href: "/arbete/goglamping-sweden",
  },
];

const FAQS = [
  { q: "Äger vi koden?", a: "Ja. Allt – kod, data, konton – står på er från dag ett. Ingen inlåsning." },
  { q: "Är fast pris på riktigt?", a: "Ja. Vill ni ändra scope skriver jag en ny fast offert. Ni får aldrig en överraskande faktura." },
  { q: "Vad händer efter lansering?", a: "30 dagars buggfri-garanti ingår. Sedan kan ni teckna underhåll till ett rimligt månadspris – eller sköt det själva, det är er kod." },
  { q: "Måste vi kunna teknik?", a: "Nej. Ni kan ert flöde, jag kan resten. Ni testar klickbara versioner, inte läser rapporter." },
  { q: "Fungerar det på distans?", a: "Ja – video 1–2 gånger i veckan. I Östergötland ses vi gärna fysiskt." },
];

/* ────────── Small components ────────── */


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


/* ────────── Signature animation ────────── */

type Scene = {
  prompt: string;
  card: { label: string; value: string; meta: string };
  row1: { left: string; mid: string; right: string };
  row2: { left: string; mid: string; right: string };
  badge: string;
};

const SCENES: Scene[] = [
  {
    prompt: "Bygg ett dispatchsystem för vårt åkeri – körorder, schema, Fortnox-fakturering.",
    card: { label: "Körorder #214", value: "Linköping → Jönköping", meta: "07:40" },
    row1: { left: "Chaufför · A. Lund", mid: "18 t", right: "OK" },
    row2: { left: "Faktura #F-2214", mid: "14 250 kr", right: "Skickad" },
    badge: "Fakturerad via Fortnox",
  },
  {
    prompt: "Automatisera vår offertprocess så att förfrågningar från mejl blir färdiga PDF-offerter.",
    card: { label: "Förfrågan #892", value: "Nybygg villa · Berg AB", meta: "09:12" },
    row1: { left: "Kalkyl · 42 poster", mid: "3 s", right: "Klar" },
    row2: { left: "Offert #O-2214", mid: "186 400 kr", right: "PDF" },
    badge: "Skickad till kund",
  },
  {
    prompt: "Skapa en intern AI-assistent som svarar på frågor om våra produkter och priser.",
    card: { label: "Fråga #1042", value: "Pris på pumpmodell X-200?", meta: "14:03" },
    row1: { left: "Källa · Prislista v12", mid: "0,8 s", right: "Match" },
    row2: { left: "Svar · 12 480 kr/st", mid: "lager 34", right: "OK" },
    badge: "Besvarad av intern AI",
  },
  {
    prompt: "Koppla ihop vår bokning med SMS-påminnelser och en enkel admin-panel.",
    card: { label: "Bokning #558", value: "Klippning · M. Ek", meta: "16:30" },
    row1: { left: "SMS · 24 h innan", mid: "queued", right: "OK" },
    row2: { left: "SMS · 1 h innan", mid: "queued", right: "OK" },
    badge: "Påminnelser aktiva",
  },
  {
    prompt: "Bygg ett lagerhanteringssystem som skannar inleveranser och varnar vid lågt saldo.",
    card: { label: "Inleverans #77", value: "Pall · 240 enheter", meta: "11:15" },
    row1: { left: "Artikel · SKU-4410", mid: "+240", right: "Bokförd" },
    row2: { left: "Saldo · SKU-1180", mid: "6 st", right: "Lågt" },
    badge: "Beställning triggad",
  },
  {
    prompt: "Gör en dashboard som hämtar data från Fortnox och visar lönsamhet per kund.",
    card: { label: "Kund · Nord AB", value: "TB-marginal 34 %", meta: "Q3" },
    row1: { left: "Intäkter", mid: "428 900 kr", right: "↑" },
    row2: { left: "Kostnader", mid: "283 100 kr", right: "OK" },
    badge: "Uppdaterad från Fortnox",
  },
];

const Signature = () => {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(reduce ? SCENES[0].prompt : "");
  const [stage, setStage] = useState(reduce ? 4 : 0);
  const scene = SCENES[idx];

  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    let i = 0;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const run = async () => {
      while (!cancelled) {
        const s = SCENES[i];
        setIdx(i);
        setText("");
        setStage(0);
        for (let j = 0; j <= s.prompt.length; j++) {
          if (cancelled) return;
          await sleep(22);
          setText(s.prompt.slice(0, j));
        }
        for (let st = 1; st <= 4; st++) {
          if (cancelled) return;
          await sleep(550);
          setStage(st);
        }
        await sleep(4200);
        i = (i + 1) % SCENES.length;
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
        <AnimatePresence mode="wait">
          {stage >= 1 && (
            <motion.div
              key={`c1-${idx}`}
              className="vk-sig-card"
              initial={{ opacity: 0, y: 12, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <div>
                <div className="label">{scene.card.label}</div>
                <div className="val" style={{ marginTop: 4 }}>{scene.card.value}</div>
              </div>
              <div className="vk-mono" style={{ fontSize: 12 }}>{scene.card.meta}</div>
            </motion.div>
          )}
          {stage >= 2 && (
            <motion.div
              key={`c2-${idx}`}
              className="vk-sig-row"
              initial={{ opacity: 0, y: 12, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <span>{scene.row1.left}</span>
              <span className="vk-mono" style={{ fontSize: 11 }}>{scene.row1.mid}</span>
              <span className="vk-mono" style={{ fontSize: 11, color: "var(--gran)" }}>{scene.row1.right}</span>
            </motion.div>
          )}
          {stage >= 3 && (
            <motion.div
              key={`c3-${idx}`}
              className="vk-sig-row"
              initial={{ opacity: 0, y: 12, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <span>{scene.row2.left}</span>
              <span className="vk-mono" style={{ fontSize: 11 }}>{scene.row2.mid}</span>
              <span className="vk-mono" style={{ fontSize: 11, color: "var(--gran)" }}>{scene.row2.right}</span>
            </motion.div>
          )}
          {stage >= 4 && (
            <motion.div
              key={`badge-${idx}`}
              initial={{ opacity: 0, scale: .8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              style={{ marginTop: 4 }}
            >
              <span className="vk-sig-badge">
                <Check size={12} strokeWidth={3} /> {scene.badge}
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
          Få ett eget AI-system som gör jobbet.{" "}
          <span className="accent">På två veckor.</span>
        </motion.h1>
        <motion.p
          className="vk-hero-sub"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8, delay: .3 }}
        >
          Jag bygger interna AI-system och automatiseringar åt svenska småföretag.
          Fast pris. Ingen bindningstid. Kod ni äger själva.
        </motion.p>
        <motion.div
          className="vk-hero-cta"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, delay: .5 }}
        >
          <Link to="/ai-karta" className="vk-btn vk-btn-primary" onClick={() => trackEvent("home_hero_ai_karta_click")}>
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
        {[...PRODUCTS, ...PRODUCTS].map((p, i) => (
          <a
            key={`${p.url}-${i}`}
            href={p.url}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => trackEvent("home_product_link_click", { product: p.name })}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {p.name}
          </a>
        ))}
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

/* ── Live bygg-demo ── */
const DemoSection = () => (
  <section className="vk-section" id="demo">
    <div className="vk-wrap">
      <Reveal>
        <div className="vk-secheader">
          <span className="vk-mono">Testa själv · 20 sekunder</span>
          <h2>Se din idé bli produkt. <span style={{ color: "var(--gran)" }}>Live.</span></h2>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <p style={{ maxWidth: "60ch", fontSize: 18, color: "var(--granbark-mut)", marginTop: 8, marginBottom: 36 }}>
          Det här är vad vi gör varje dag – fast på riktigt tar prototypen 3–5 dagar istället för 20 sekunder.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <LiveBuildDemo />
      </Reveal>
    </div>
  </section>
);

/* ── Scroll-progress ── */
const ScrollProgress = () => {
  useEffect(() => {
    const bar = document.createElement("div");
    bar.className = "vk-progress";
    document.body.appendChild(bar);
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = `${max > 0 ? (h.scrollTop / max) * 100 : 0}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      bar.remove();
    };
  }, []);
  return null;
};

/* ── Magnetiska knappar (subtil dragning mot markören) ── */
const useMagnetic = () => {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest?.(".vk-magnetic") as HTMLElement | null;
      document.querySelectorAll<HTMLElement>(".vk-magnetic").forEach((el) => {
        if (el !== target) el.style.transform = "";
      });
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        const pull = (1 - dist / 120) * 8;
        target.style.transform = `translate(${(dx / dist) * pull}px, ${(dy / dist) * pull}px)`;
      } else {
        target.style.transform = "";
      }
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);
};

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
            <Link
              to={c.href}
              className="vk-case"
              onClick={() => trackEvent("home_case_card_click", { case: c.title })}
            >
              <div className="vk-case-browser">
                <div className="vk-case-chrome"><i/><i/><i/></div>
                <img src={c.thumb} alt={`${c.title} – produktskärmdump`} className="vk-case-img" loading="lazy" />
              </div>
              <h3>{c.title}</h3>
              <p>{c.tagline}</p>
              <div
                className="vk-mono"
                style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--gran)" }}
              >
                <Check size={12} strokeWidth={3} /> {c.result}
              </div>
              <div className="vk-case-meta" style={{ marginTop: 8 }}>{c.meta}</div>
              <div className="vk-mono" style={{ marginTop: 12, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
                Läs caset <ArrowRight size={12} />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Link
          to="/arbete"
          className="vk-btn vk-btn-ghost"
          onClick={() => trackEvent("home_cases_all_click")}
        >
          Alla case <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </section>
);

const ReceiptsSection = () => {
  const { open } = useContactModal();
  return (
    <section className="vk-section" style={{ background: "var(--bjork-djup)" }}>
      <div className="vk-wrap">
        <Reveal>
          <div className="vk-secheader">
            <span className="vk-mono">Fast pris · eller konsult</span>
            <h2>Fyra upplägg. Inga överraskningar.</h2>
          </div>
        </Reveal>
        <div className="vk-receipts" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
          {[
            { tier: "Prototyp", price: "Från 14 900 kr", desc: "Klickbar produkt på 3–5 dagar. Testa idén skarpt innan ni satsar.", stamp: "Fast pris" },
            { tier: "MVP", price: "Från 34 900 kr", desc: "Lanseringsklar på två veckor. Inloggning, betalning, admin.", flag: "Flest väljer denna", stamp: "Fast pris" },
            { tier: "SaaS", price: "Från 69 000 kr", desc: "Full produkt: kundportal, integrationer (Fortnox, Stripe), drift.", stamp: "Fast pris" },
            { tier: "Konsult", price: "895 kr/timme", desc: "AI-rådgivning eller utveckling i era team – timpris 895 kr eller från 12 000 kr/mån.", stamp: "Konsult" },
          ].map((r, i) => (
            <Reveal delay={i * 0.08} key={r.tier}>
              <div className="vk-receipt">
                {r.flag && <span className="vk-receipt-flag">{r.flag}</span>}
                <span className="vk-receipt-stamp">{r.stamp}</span>
                <div className="vk-receipt-tier">{r.tier}</div>
                <div className="vk-receipt-price" style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>
                  {r.price}
                </div>
                <p className="vk-receipt-desc">{r.desc}</p>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("home_package_cta_click", { tier: r.tier });
                    open(r.tier);
                  }}
                  className="vk-btn vk-btn-primary"
                  style={{ marginTop: 16, justifyContent: "center", width: "100%" }}
                  aria-label={`Diskutera ${r.tier}`}
                >
                  Diskutera {r.tier} <ArrowRight size={14} />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <Link to="/priser" className="vk-btn vk-btn-ghost">
            Se alla priser och vad som ingår <ArrowRight size={14} />
          </Link>
        </div>
        <p className="vk-mono" style={{ marginTop: 20 }}>
          Exakt offert inom 24 h · Fast pris · Inga timmar, aldrig löpande räkning
        </p>
      </div>
    </section>
  );
};


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
            <Link
              to="/ai-karta"
              className="vk-btn vk-btn-primary"
              onClick={() => trackEvent("home_ai_karta_section_click")}
            >
              <span>Gör AI-kartan nu</span> <ArrowRight size={16} />
            </Link>
            <span className="vk-mono">Resultat direkt på skärmen · 4 uppföljande tips · Avsluta när ni vill</span>
          </div>
          <div
            className="vk-mono"
            style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13 }}
          >
            <span style={{ color: "var(--granbark-mut)" }}>Läs mer:</span>
            <Link to="/ai-automation-foretag" onClick={() => trackEvent("home_related_link_click", { target: "ai_automation" })}>
              AI-automation för företag →
            </Link>
            <Link to="/tjanster" onClick={() => trackEvent("home_related_link_click", { target: "tjanster" })}>
              Alla tjänster →
            </Link>
            <Link to="/priser" onClick={() => trackEvent("home_related_link_click", { target: "priser" })}>
              Priser →
            </Link>
            <Link to="/ai-byra-linkoping" onClick={() => trackEvent("home_related_link_click", { target: "ai_byra_linkoping" })}>
              AI-byrå i Linköping →
            </Link>
            <Link to="/ai-konsult-sverige" onClick={() => trackEvent("home_related_link_click", { target: "ai_konsult_sverige" })}>
              Konsultuppdrag →
            </Link>
            <Link to="/verktyg" onClick={() => trackEvent("home_related_link_click", { target: "verktyg" })}>
              Gratis verktyg →
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

const TOOLS_HOME = [
  { slug: "ai-roi-kalkylator", name: "AI ROI-kalkylator", desc: "Årsbesparing, payback och kassaflödesgraf över 36 månader." },
  { slug: "app-prisraknare", name: "App-prisräknare", desc: "Konfigurera scope och se prisintervall, paket och leveranstid direkt." },
  { slug: "seo-kalkylator", name: "SEO-kalkylator", desc: "Räkna ut vad ökad organisk trafik är värd i omsättning och bruttovinst." },
  { slug: "ai-mognadsanalys", name: "AI-mognadsanalys", desc: "Tio frågor ger nivå, radardiagram och en 30-dagars handlingsplan." },
  { slug: "personalkostnad-vs-ai", name: "Personalkostnad vs AI", desc: "Jämför årskostnader och se frigjord kapacitet per år – i grafer." },
  { slug: "prompt-generator", name: "Prompt-generator", desc: "Bygg strukturerade svenska prompts med nio färdiga mallar." },
];

const ToolsSection = () => (
  <section className="vk-section" style={{ background: "var(--bjork-djup)" }}>
    <div className="vk-wrap">
      <Reveal>
        <div className="vk-secheader">
          <span className="vk-mono">Gratis verktyg · byggda av oss</span>
          <h2>Sex verktyg. Noll kronor. <span style={{ color: "var(--gran)" }}>Räkna själv.</span></h2>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <p style={{ maxWidth: "62ch", fontSize: 18, color: "var(--granbark-mut)", marginTop: 8 }}>
          Samma verktyg vi använder i våra uppdrag – med grafer, scenarier och PDF-export.
          Allt körs lokalt i din webbläsare, ingen data lämnar sidan.
        </p>
      </Reveal>
      <div className="vk-hub-grid" style={{ marginTop: 36 }}>
        {TOOLS_HOME.map((t, i) => (
          <Reveal key={t.slug} delay={i * 0.04}>
            <Link
              to={`/verktyg/${t.slug}`}
              className="vk-hub-card"
              onClick={() => trackEvent("home_tool_click", { tool: t.slug })}
            >
              <div>
                <h3 className="vk-hub-title" style={{ marginTop: 0 }}>{t.name}</h3>
                <p className="vk-hub-desc">{t.desc}</p>
              </div>
              <div className="vk-hub-meta">
                <span className="time">Gratis</span>
                <span className="cta">Öppna <ArrowRight size={12} /></span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.15}>
        <div style={{ marginTop: 28 }}>
          <Link to="/verktyg" className="vk-btn vk-btn-ghost" onClick={() => trackEvent("home_verktyg_click")}>
            Alla verktyg <ArrowRight size={16} />
          </Link>
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
            <button onClick={() => { trackEvent("home_final_cta_click"); open(); }} className="vk-btn vk-btn-primary">
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


/* ────────── Page ────────── */

const SITE = "https://auroramedia.se";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const casesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Byggda case av Aurora Media",
  itemListElement: CASES.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${SITE}${c.href}`,
    name: c.title,
  })),
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE}/#localbusiness`,
  name: "Aurora Media AB",
  url: SITE,
  email: "info@auroramedia.se",
  areaServed: [
    { "@type": "Country", name: "Sverige" },
    { "@type": "City", name: "Linköping" },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Linköping",
    addressRegion: "Östergötland",
    addressCountry: "SE",
  },
  identifier: { "@type": "PropertyValue", propertyID: "orgNr", value: "559272-0220" },
  founder: { "@type": "Person", name: "Christoffer Holstensson" },
};

const Index = () => {
  useMagnetic();
  return (
    <>
      <SEO
        title="AI-system och automation för småföretag | Aurora Media"
        description="Aurora Media bygger interna AI-system, automationer och SaaS för svenska småföretag. Fast pris från 14 900 kr, snabb leverans och kod ni äger själva."
        canonical="/"
        jsonLd={[faqSchema, casesSchema, localBusinessSchema]}
      />
      <ScrollProgress />

      <div className="verkstad">
        <VkNav />
        <main>
          <HeroSection />
          <ProofStrip />
          <ProblemSection />
          <DemoSection />
          <ProcessSection />
          <CasesSection />
          <ReceiptsSection />
          <AIKartaSection />
          <ToolsSection />
          <ManifestSection />
          <FAQSection />
          <FinalCTA />
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default Index;
