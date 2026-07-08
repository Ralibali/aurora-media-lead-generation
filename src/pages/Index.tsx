import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Plus, Minus } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import "@/styles/verkstad.css";

/* ─────────────────────────────────────────────────────────────
   NORDISK VERKSTAD — startsidans nya designsystem
   Presentation only. Rör inte scripts/, supabase-anrop eller routes.
   ───────────────────────────────────────────────────────────── */

/* Nordisk verkstad-designen lever i src/styles/verkstad.css */

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
  const [forceShow, setForceShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceShow(true), 1200);
    return () => clearTimeout(t);
  }, []);
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      animate={forceShow ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.1 }}
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
