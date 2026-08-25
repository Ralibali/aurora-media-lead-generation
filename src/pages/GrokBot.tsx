import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { SEO, SITE_URL } from "@/components/SEO";
import { Reveal, VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import { trackEvent } from "@/lib/analytics";
import { getSupabase } from "@/lib/getSupabase";
import {
  PRODUCT_STATUS,
  PRODUCT_VERSION,
  PRODUCT_UPDATED,
  PRODUCT_UPDATED_ISO,
  PRODUCT_VERIFIED_ISO,
  PRODUCT_FRESHNESS,
  PRICES,
  FN_LAUNCH_STATUS,
  FN_VERIFY_SESSION,
  FN_CREATE_CHECKOUT,
  LEGAL_ACK_TEXT,
  WAITLIST_PAKET,
  LEGAL_LINKS,
  DIGITAL_DELIVERY_NOTE,
  LEARN_CARDS,
  LESSONS,
  VAULT_BLURB,
  VAULT_METHOD_NOTE,
  VAULT_GROUPS,
  CHAPTERS,
  BONUS_CHAPTER,
  ADVANCED_BONUS,
  USE_CASES,
  WHO_FOR,
  WHO_NOT_FOR,
  FAQ,
  PREVIEW_EXCERPT,
  type AiKontoretProduct,
} from "@/config/aiKontoret";
import "@/styles/grokbot.css";

const IS_LIVE = PRODUCT_STATUS === "live";
const OG_IMAGE = `${SITE_URL}/og-grok-bot.jpg`;

const SEO_TITLE = "AI-KONTORET – Bygg ett AI-drivet företag med Grok Bot | Guide 199 kr";
const SEO_DESC =
  "Svenska guiden till Grok Bot: bygg AI-medarbetare och digitala kollegor med Skills, Routines, Groups och owner gates – ett AI-kontor som jobbar åt dig. 199 kr.";

/** Bot ≠ prompt – kedjan som gör en prompt till en medarbetare. */
const CHAIN_STEPS: { t: string; d: string }[] = [
  { t: "ROLL", d: "Vem Boten är och vilket jobb den äger" },
  { t: "VERKTYG", d: "Vad den får använda – och inte" },
  { t: "SKILL", d: "Det inlärda, återkommande arbetsflödet" },
  { t: "ROUTINE", d: "När jobbet körs – schemalagt eller triggat" },
  { t: "EVIDENCE", d: "Beviset på att jobbet faktiskt blev gjort" },
  { t: "HANDOFF", d: "Överlämningen till nästa Bot – eller till dig" },
  { t: "RESULT", d: "Leveransen som skapar affärsvärde" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const GrokBot = () => {
  const location = useLocation();
  const renderedAtRef = useRef(Date.now());
  const previewTracked = useRef(false);
  const scrollFired = useRef<Set<number>>(new Set());

  // Waitlist-formulär (prelaunch)
  const [wlName, setWlName] = useState("");
  const [wlEmail, setWlEmail] = useState("");
  const [wlHp, setWlHp] = useState("");
  const [wlState, setWlState] = useState<"idle" | "sending" | "done" | "error">("idle");

  // Checkout-kassa (live-läge): produkt + e-post + uttryckligt samtycke.
  const [coProduct, setCoProduct] = useState<AiKontoretProduct | null>(null);
  const [coEmail, setCoEmail] = useState("");
  const [coAck, setCoAck] = useState(false);
  const [coState, setCoState] = useState<"idle" | "sending" | "error">("idle");
  const [coError, setCoError] = useState<string | null>(null);

  // Lanseringsspärr: köpknappar öppnas bara om servern säger ready.
  const [launchReady, setLaunchReady] = useState(false);

  // Neutral retur från checkout (success-URL: /grok-bot?checkout=return&session_id=…).
  // OBS: en query-parameter bevisar INTE att betalning skett. Verifiering sker
  // server-side via ai-kontoret-verify-session; först då får UI:t visa köp och
  // först då loggas grok_purchase.
  const params = new URLSearchParams(location.search);
  const checkoutReturn = params.get("checkout") === "return";
  const checkoutCancelled = params.get("checkout") === "cancel";
  const returnedSessionId = params.get("session_id") ?? "";
  const [verify, setVerify] = useState<
    | { state: "idle" }
    | { state: "checking" }
    | { state: "paid"; product: string; delivered: boolean }
    | { state: "unverified" }
  >({ state: "idle" });

  useEffect(() => {
    trackEvent("grok_page_view", { status: PRODUCT_STATUS, version: PRODUCT_VERSION });
  }, []);

  // Lanseringsspärr hämtas bara i live-läge – prelaunch rör aldrig checkout.
  useEffect(() => {
    if (!IS_LIVE) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.functions.invoke(FN_LAUNCH_STATUS, { body: {} });
        if (!cancelled) setLaunchReady(!error && data?.ready === true);
      } catch {
        if (!cancelled) setLaunchReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Serververifiering av retursessionen.
  useEffect(() => {
    if (!checkoutReturn) return;
    trackEvent("grok_checkout_return", { status: PRODUCT_STATUS });
    if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(returnedSessionId)) {
      setVerify({ state: "unverified" });
      return;
    }
    let cancelled = false;
    setVerify({ state: "checking" });
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.functions.invoke(FN_VERIFY_SESSION, {
          body: { session_id: returnedSessionId },
        });
        if (cancelled) return;
        if (!error && data?.paid === true) {
          setVerify({ state: "paid", product: String(data.product), delivered: Boolean(data.delivered) });
          trackEvent("grok_purchase", { product: String(data.product), verified: true });
        } else {
          setVerify({ state: "unverified" });
        }
      } catch {
        if (!cancelled) setVerify({ state: "unverified" });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Scroll-djup → grok_scroll_content (25/50/75/100 %)
  useEffect(() => {
    const thresholds = [25, 50, 75, 100];
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = Math.round(((window.scrollY + window.innerHeight * 0.5) / max) * 100);
      for (const t of thresholds) {
        if (pct >= t && !scrollFired.current.has(t)) {
          scrollFired.current.add(t);
          trackEvent("grok_scroll_content", { percent: t });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const buyEvent: Record<AiKontoretProduct, string> = {
    guide: "grok_buy_guide_click",
    bundle: "grok_buy_bundle_click",
    vault: "grok_prompt_vault_click",
  };

  /** Köpbart endast när både koden och servern säger att allt är på plats. */
  const canBuy = IS_LIVE && launchReady;

  /** Köpflöde: canBuy → kassa (samtycke) → server-skapad Stripe-session. */
  const handleBuy = (product: AiKontoretProduct) => {
    trackEvent(buyEvent[product], { status: PRODUCT_STATUS, can_buy: canBuy });
    if (!canBuy) {
      // Prelaunch eller lanseringsspärr ej uppfylld → aldrig döda köpknappar.
      scrollToId("kop");
      return;
    }
    setCoError(null);
    setCoState("idle");
    setCoAck(false);
    setCoProduct(product);
  };

  /** Skapar Stripe Checkout Session server-side. Belopp sätts aldrig i klienten. */
  const startCheckout = async () => {
    if (!coProduct) return;
    if (!coAck) {
      setCoError("Du behöver godkänna villkoren för digital leverans.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(coEmail.trim())) {
      setCoError("Ange en giltig e-postadress – leveransen skickas dit.");
      return;
    }
    setCoState("sending");
    setCoError(null);
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.functions.invoke(FN_CREATE_CHECKOUT, {
        body: { product: coProduct, email: coEmail.trim(), legal_ack: true },
      });
      if (error || !data?.url) {
        setCoState("error");
        setCoError("Kassan kunde inte öppnas just nu. Försök igen eller mejla info@auroramedia.se.");
        return;
      }
      trackEvent("grok_checkout_start", { product: coProduct });
      window.location.href = data.url as string;
    } catch {
      setCoState("error");
      setCoError("Kassan kunde inte öppnas just nu. Försök igen eller mejla info@auroramedia.se.");
    }
  };


  const handlePreviewOpen = () => {
    if (previewTracked.current) return;
    previewTracked.current = true;
    trackEvent("grok_preview_open");
  };

  const submitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wlState === "sending") return;
    setWlState("sending");
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: wlName.trim(),
          email: wlEmail.trim(),
          paket: WAITLIST_PAKET,
          leadLabel: "grok-bot-waitlist",
          internalNote: "Anmälan via /grok-bot (AI-KONTORET prelaunch).",
          message:
            "Väntelista för AI-KONTORET. Personen vill få besked när guiden släpps och har anmält sig via sidan /grok-bot.",
          website: wlHp, // honeypot – ska vara tom
          _renderedAt: renderedAtRef.current,
        },
      });
      if (error) throw error;
      setWlState("done");
      trackEvent("grok_waitlist_submit");
    } catch (err) {
      console.error("[ai-kontoret] waitlist failed", err);
      setWlState("error");
    }
  };

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${SITE_URL}/grok-bot#produkt`,
      name: "AI-KONTORET – Så bygger du ett AI-drivet företag med Grok Bot",
      description: SEO_DESC,
      image: [OG_IMAGE],
      brand: { "@type": "Brand", name: "Aurora Media" },
      category: "Digital guide",
      inLanguage: "sv-SE",
      version: PRODUCT_VERSION,
      dateModified: PRODUCT_UPDATED_ISO,
      offers: [
        {
          "@type": "Offer",
          name: "AI-KONTORET – guiden",
          price: PRICES.guide,
          priceCurrency: "SEK",
          url: `${SITE_URL}/grok-bot#priser`,
          availability: IS_LIVE ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        },
        {
          "@type": "Offer",
          name: "AI-KONTORET + Prompt Vault (lanseringspaket)",
          price: PRICES.bundle,
          priceCurrency: "SEK",
          url: `${SITE_URL}/grok-bot#priser`,
          availability: IS_LIVE ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Hem", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "AI-KONTORET", item: `${SITE_URL}/grok-bot` },
      ],
    },
  ];

  return (
    <>
      <SEO
        title={SEO_TITLE}
        description={SEO_DESC}
        canonical="/grok-bot"
        ogImage={OG_IMAGE}
        ogImageAlt="AI-KONTORET – den praktiska svenska guiden till Grok Bot"
        jsonLd={jsonLd}
      />
      <div className="verkstad">
        <VkNav />
        <main>
          {/* ═══ 1. HERO ═══ */}
          <section className="vk-section gb-hero" aria-labelledby="gb-h1">
            <div className="vk-wrap">
              {checkoutReturn && (
                <div className="gb-thanks" role="status">
                  <b>Tack.</b> Om betalningen gick igenom får du leverans via e-post. Kontakta
                  info@auroramedia.se om något saknas.
                </div>
              )}

              <Reveal>
                <p className="gb-eyebrow">
                  <i aria-hidden="true" /> AI-KONTORET
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 id="gb-h1">
                  Bygg ett <span className="accent">AI-team</span> som faktiskt gör jobbet.
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="gb-hero-sub">
                  Den praktiska svenska guiden till Grok Bot — från din första Bot till Skills,
                  Routines, Groups, handoffs och ett AI-kontor som arbetar även när du inte sitter
                  framför datorn.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="gb-hero-ctas">
                  <button
                    type="button"
                    className="vk-btn vk-btn-primary"
                    onClick={() => (IS_LIVE ? handleBuy("guide") : scrollToId("kop"))}
                  >
                    <span>{IS_LIVE ? `Köp AI-KONTORET – ${PRICES.guide} kr` : "Få besked när AI-KONTORET släpps"}</span>
                  </button>
                  <button type="button" className="vk-btn vk-btn-ghost" onClick={() => scrollToId("ingar")}>
                    <span>Se vad som ingår</span>
                  </button>
                  <span className="gb-price-inline">
                    <strong>{PRICES.guide} kr</strong> engångspris
                  </span>
                </div>
              </Reveal>
              <Reveal delay={0.32}>
                <ul className="gb-proofline" aria-label="Produktens kännetecken">
                  <li>Praktiskt</li>
                  <li>Svenskt</li>
                  <li>Copy-paste-vänligt</li>
                  <li>Byggt från verklig användning</li>
                </ul>
              </Reveal>
              <Reveal delay={0.4}>
                <p className="gb-versionchip">
                  <b>Version {PRODUCT_VERSION}</b> · {PRODUCT_UPDATED} ·{" "}
                  <time dateTime={PRODUCT_UPDATED_ISO}>Senast uppdaterad {PRODUCT_UPDATED_ISO}</time>
                  {" · "}
                  <time dateTime={PRODUCT_VERIFIED_ISO}>Verifierad {PRODUCT_VERIFIED_ISO}</time>
                </p>
                <p className="gb-freshness vk-mono">{PRODUCT_FRESHNESS}</p>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 2. CREDIBILITY / WHY THIS EXISTS ═══ */}
          <section className="vk-section" aria-labelledby="gb-varfor">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Varför den här guiden finns</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-varfor">Skriven av någon som kör AI-botar i produktion. Varje dag.</h2>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="gb-lead">
                    Aurora Media är inte en byrå som läst om AI – vi bygger och driver AI-system för
                    svenska företag, med öppna siffror istället för PowerPoints. AI-KONTORET är
                    upplägget vi själva använder för att få Grok Bot att fungera som digitala
                    medarbetare: med roller, rutiner, beviskrav och tydliga gränser. Inget hype,
                    inga övernattslöften – ett operativsystem som håller i verkligheten.
                  </p>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className="gb-firstmover">
                    Per {PRODUCT_UPDATED_ISO} har vi inte hittat någon annan svensk betald guide,
                    kurs eller mallpaket för Grok Bot – så vi byggde den vi själva saknat. Det här
                    är inte information om Grok Bot (den fria engelska dokumentationen täcker
                    grundinställningarna). Det här är det svenska operativsystemet ovanpå:
                    AI-agenter med riktiga roller, bot-organisation, Skills, Routines, Groups,
                    usage-styrning och owner gates.
                  </p>
                </Reveal>
              </div>
              <Reveal delay={0.2}>
                <div className="gb-related" aria-label="Relaterat från Aurora Media">
                  <a href="/oppna-siffror">Öppna siffror – se driften i realtid →</a>
                  <a href="/arbete">Case och projekt →</a>
                  <a href="/ai-snabbanalys">Testa AI-snabbanalysen gratis →</a>
                </div>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 3. THE PROBLEM ═══ */}
          <section className="vk-section" aria-labelledby="gb-problem">
            <div className="vk-wrap">
              <div className="gb-dark">
                <Reveal>
                  <p className="gb-kicker">Problemet</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-problem">Grok Bot svarar gärna. Men vem får den att jobba?</h2>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="gb-lead" style={{ color: "rgba(246,245,241,.75)" }}>
                    De flesta använder sin AI som en smart chatt: ställ en fråga, få ett svar, börja
                    om imorgon. Värdet försvinner mellan sessionerna. Det här är vad vi ser om och
                    om igen:
                  </p>
                </Reveal>
                <div className="gb-problem-grid">
                  <Reveal delay={0.1}>
                    <div className="gb-problem">
                      <b>Engångspromptar som glöms bort</b>
                      Den där perfekta prompten ligger i en chatt du aldrig hittar igen – så du
                      skriver om den. Varje gång.
                    </div>
                  </Reveal>
                  <Reveal delay={0.16}>
                    <div className="gb-problem">
                      <b>Chatten blir aldrig ett arbete</b>
                      Svaren är bra men inget händer efteråt. Ingen äger uppgiften, ingen kör om
                      den, inget levereras.
                    </div>
                  </Reveal>
                  <Reveal delay={0.22}>
                    <div className="gb-problem">
                      <b>Botar som krockar med varandra</b>
                      Utan struktur letar flera agenter efter samma jobb och bränner usage på
                      identiska uppgifter – dubbelarbete du betalar för.
                    </div>
                  </Reveal>
                  <Reveal delay={0.28}>
                    <div className="gb-problem">
                      <b>Ingen kontroll, inga bevis</b>
                      Antingen gör AI:n för lite – eller så mycket att du inte vågar släppa den.
                      Och när något väl görs saknas kvittot på att det blev gjort.
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ 4. TRANSFORMATION ═══ */}
          <section className="vk-section" aria-labelledby="gb-transform">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Förändringen</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-transform">Från chattfönster till AI-kontor.</h2>
                </Reveal>
              </div>
              <div className="gb-transform">
                <Reveal>
                  <div className="gb-transform-card from">
                    <h3>Så de flesta använder AI idag</h3>
                    <ul>
                      <li>En chatt, en fråga, ett svar – sen börjar allt om</li>
                      <li>Samma instruktioner klistras in om och om igen</li>
                      <li>Du är både beställare, projektledare och mellanhand</li>
                      <li>Ingen vet vad som gjordes – eller om det ens blev gjort</li>
                      <li>Allt stannar när du stänger locket</li>
                    </ul>
                  </div>
                </Reveal>
                <span className="gb-transform-arrow" aria-hidden="true">
                  →
                </span>
                <Reveal delay={0.12}>
                  <div className="gb-transform-card to">
                    <h3>Så AI-KONTORET fungerar</h3>
                    <ul>
                      <li>Botar med riktiga jobb som körs varje gång de behövs</li>
                      <li>Skills fångar arbetsflödet en gång – och återanvänder det</li>
                      <li>Routines kör jobbet på rätt tid, utan att du startar det</li>
                      <li>Evidence receipts bevisar varje leverans</li>
                      <li>Owner gates håller pengar och publicering bakom din knapp</li>
                    </ul>
                  </div>
                </Reveal>
              </div>
              <Reveal delay={0.24}>
                <p className="gb-antihype vk-mono">
                  Ersätt inte hela teamet. Ge EN uppgift till EN bot – och bygg därifrån.
                </p>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 5. WHAT YOU LEARN ═══ */}
          <section className="vk-section" id="ingar" aria-labelledby="gb-lar">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Vad du lär dig</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-lar">Åtta byggstenar – ett komplett AI-kontor.</h2>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="gb-lead">
                    Varje sten är en egen del av guiden med mallar, exempel och steg-för-steg-upplägg.
                    Tillsammans blir de ett fungerande operativsystem.
                  </p>
                </Reveal>
              </div>
              <div className="gb-learn-grid">
                {LEARN_CARDS.map((c, i) => (
                  <Reveal key={c.title} delay={Math.min(i * 0.05, 0.3)}>
                    <article className="gb-learn-card">
                      <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                      <h3>{c.title}</h3>
                      <p>{c.desc}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 6. BOT ≠ PROMPT ═══ */}
          <section className="vk-section" aria-labelledby="gb-botprompt">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Grundprincipen</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-botprompt">En Bot är inte en prompt.</h2>
                </Reveal>
              </div>
              <div className="gb-versus">
                <Reveal>
                  <div className="gb-versus-card">
                    <span className="vk-mono">Prompt</span>
                    <p className="gb-versus-quote">“Gör den här uppgiften.”</p>
                    <span className="gb-versus-tag">Engångshändelse · glöms bort · ingen ägare</span>
                  </div>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="gb-versus-card is-bot">
                    <span className="vk-mono">Bot</span>
                    <p className="gb-versus-quote">
                      “Du äger detta jobb och utför det varje gång det behövs.”
                    </p>
                    <span className="gb-versus-tag">Varaktig · ansvarig · mätbar</span>
                  </div>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <p className="gb-lead" style={{ marginBottom: "clamp(28px,4vw,40px)" }}>
                  Det är därför “skriv bättre prompts” aldrig räcker. En Bot är en kedja av beslut –
                  och varje länk i kedjan har sitt eget kapitel i guiden:
                </p>
              </Reveal>
              <div className="gb-chain-row-wrap">
                <div className="gb-chain gb-chain-row" role="list" aria-label="Från roll till resultat">
                  {CHAIN_STEPS.map((s, i) => (
                    <Reveal key={s.t} delay={Math.min(i * 0.06, 0.36)}>
                      <div className="gb-chain-step" role="listitem">
                        <span className="n">{String(i + 1).padStart(2, "0")}</span>
                        <span className="t">{s.t}</span>
                        <span className="d">{s.d}</span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
              <Reveal delay={0.15}>
                <p style={{ marginTop: "clamp(24px,4vw,36px)", maxWidth: "64ch" }}>
                  Missar du en länk faller kedjan: roll utan routine blir aldrig körd, arbete utan
                  evidence kan inte granskas, handoff utan ägare fastnar hos dig. Kedjan är enkel –
                  men det är den som skiljer en leksak från en medarbetare.
                </p>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 7. REAL AI OFFICE ARCHITECTURE ═══ */}
          <section className="vk-section" id="arkitektur" aria-labelledby="gb-office">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Arkitektur</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-office">Så ser ett riktigt AI-kontor ut.</h2>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="gb-lead">
                    Inte tio bottar som pratar samtidigt – en liten organisation där varje Bot vet
                    sitt jobb, sin chef och sin överlämning.
                  </p>
                </Reveal>
              </div>
              <Reveal>
                <div className="gb-org" role="img" aria-label="Organisation: Ägare överst, därunder HQ/Chief of Staff, därunder Company CEO, och underst specialisterna Growth & Sales, Engineering, QA och Research">
                  <div className="gb-org-node is-owner">
                    <div className="role">ÄGARE</div>
                    <div className="sub">Du. Sätter riktning, äger gates, tar besluten.</div>
                  </div>
                  <div className="gb-org-link" aria-hidden="true" />
                  <div className="gb-org-node is-hq">
                    <div className="role">HQ / CHIEF OF STAFF</div>
                    <div className="sub">Prioriterar, fördelar uppdrag, eskalerar till dig.</div>
                  </div>
                  <div className="gb-org-link" aria-hidden="true" />
                  <div className="gb-org-node">
                    <div className="role">COMPANY CEO</div>
                    <div className="sub">Driver verksamhetens mål och veckans fokus.</div>
                  </div>
                  <div className="gb-org-link" aria-hidden="true" />
                  <div className="gb-org-fan" aria-hidden="true">
                    <span /><span /><span /><span />
                  </div>
                  <div className="gb-org-specs">
                    <div className="gb-org-spec">
                      <div className="role">GROWTH &amp; SALES</div>
                      <div className="sub">Loopar, outreach, uppföljning</div>
                    </div>
                    <div className="gb-org-spec">
                      <div className="role">ENGINEERING</div>
                      <div className="sub">Bygger och underhåller</div>
                    </div>
                    <div className="gb-org-spec">
                      <div className="role">QA</div>
                      <div className="sub">Granskar med evidence</div>
                    </div>
                    <div className="gb-org-spec">
                      <div className="role">RESEARCH</div>
                      <div className="sub">Lägesbilder och underlag</div>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="gb-org-note">
                  Målet är <b>inte</b> att skapa flest Botar. Målet är att skapa det{" "}
                  <b>minsta team som slutför ett riktigt uppdrag</b> – från start till bevisad
                  leverans.
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="gb-org-tech vk-mono">
                  Tekniskt sett delar alla Botar en och samma beständiga molndator knuten till ditt
                  konto – varje Bot arbetar på sin egen arbetsyta. Guiden visar hur du organiserar
                  dem så att de samarbetar istället för att krocka.
                </p>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 8. SKILLS + ROUTINES ═══ */}
          <section className="vk-section" aria-labelledby="gb-skills">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Motorrummet</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-skills">Lär en gång. Kör för alltid.</h2>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="gb-lead">
                    Hjärtat i upplägget: Teach a Task. Du visar Boten hur ett jobb görs – den
                    fångar flödet som en Skill, och en Routine ser till att det körs på rätt tid.
                  </p>
                </Reveal>
              </div>
              <div className="gb-cases">
                <Reveal>
                  <div className="gb-case">
                    <span className="tag">Teach a Task → Skill</span>
                    <h3>Från demonstration till återanvändbar förmåga</h3>
                    <p>
                      Visa flödet en gång – strukturera det som en Skill med tydliga in- och
                      utdata. En stabil Skill slår samma gigantiska prompt varje dag, varje gång:
                      den går att versionera, testa och förbättra.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="gb-case">
                    <span className="tag">Routine → schemalagt &amp; eventdrivet</span>
                    <h3>Jobbet körs utan att du startar det</h3>
                    <p>
                      Schemalägg återkommande arbete – eller trigga det på händelser. Guiden visar
                      när vilket läge är rätt, och hur du undviker att Routines kör i tomgång.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={0.15}>
                  <div className="gb-case">
                    <span className="tag">Work Packets</span>
                    <h3>Arbetspaket som kan lämnas – och granskas</h3>
                    <p>
                      Varje uppdrag paketeras med mål, underlag, deadline och beviskrav. Det gör
                      handoffs mellan Botar möjliga utan att du blir mellanhand.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={0.2}>
                  <div className="gb-case">
                    <span className="tag">Observe / Prepare / Commit / Emit</span>
                    <h3>En disciplinerad arbetscykel</h3>
                    <p>
                      Boten observerar läget, förbereder underlag, verkställer först när det är
                      dags och rapporterar resultatet. Samma cykel i varje Skill gör hela kontoret
                      förutsägbart.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 8b. AVANCERAD BONUS — BYGG DIN EGEN AI-MEDARBETARE ═══ */}
          <section className="vk-section" id="bonus" aria-labelledby="gb-bonus-h">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">{ADVANCED_BONUS.kicker}</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-bonus-h">{ADVANCED_BONUS.headline}</h2>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="gb-lead">{ADVANCED_BONUS.lead}</p>
                </Reveal>
              </div>

              <div className="gb-bonus-compare">
                <Reveal>
                  <div className="gb-bonus-col is-ready">
                    <span className="gb-bonus-label vk-mono">{ADVANCED_BONUS.readyMade.label}</span>
                    <ol className="gb-bonus-flow">
                      {ADVANCED_BONUS.readyMade.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                    <p className="gb-bonus-note">{ADVANCED_BONUS.readyMade.note}</p>
                  </div>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="gb-bonus-col is-build">
                    <span className="gb-bonus-label vk-mono">
                      {ADVANCED_BONUS.buildYourOwn.label}
                    </span>
                    <ol className="gb-bonus-flow">
                      {ADVANCED_BONUS.buildYourOwn.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                    <p className="gb-bonus-note">{ADVANCED_BONUS.buildYourOwn.note}</p>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.16}>
                <p className="gb-antihype vk-mono">{ADVANCED_BONUS.trustNote}</p>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />


          {/* ═══ 9. REAL USE CASES ═══ */}
          <section className="vk-section" aria-labelledby="gb-cases-h">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">I praktiken</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-cases-h">Riktiga flöden du bygger i guiden.</h2>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="gb-lead">
                    Inga abstrakta demoexempel – det här är de loopar som driver ett AI-kontor i
                    vardagen.
                  </p>
                </Reveal>
              </div>
              <div className="gb-cases">
                {USE_CASES.map((u, i) => (
                  <Reveal key={u.title} delay={Math.min(i * 0.06, 0.3)}>
                    <article className="gb-case">
                      <span className="tag">{u.mono}</span>
                      <h3>{u.title}</h3>
                      <p>{u.desc}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 10. COMMON MISTAKES / REAL LESSONS ═══ */}
          <section className="vk-section" aria-labelledby="gb-lessons-h">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Lärdomar från verklig drift</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-lessons-h">Misstagen är redan gjorda – åt dig.</h2>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="gb-lead">
                    Guiden bygger på faktisk användning, inklusive allt som inte funkade första
                    gången. Sex lärdomar du slipper lära dig på egen hand:
                  </p>
                </Reveal>
              </div>
              <div className="gb-lessons">
                {LESSONS.map((l, i) => (
                  <Reveal key={l.quote} delay={Math.min(i * 0.05, 0.3)}>
                    <article className="gb-lesson">
                      <blockquote>“{l.quote}”</blockquote>
                      <p>{l.takeaway}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 11. GUIDE CONTENT ═══ */}
          <section className="vk-section" aria-labelledby="gb-chapters-h">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Innehållsförteckning</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-chapters-h">Tolv kapitel. Från första Boten till hela kontoret.</h2>
                </Reveal>
              </div>
              <div className="gb-chapters">
                {CHAPTERS.map((c, i) => (
                  <div className="gb-chapter" key={c.title}>
                    <span className="no" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3>{c.title}</h3>
                      <p>{c.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="gb-chapter is-bonus">
                  <span className="no" aria-hidden="true">
                    +
                  </span>
                  <div>
                    <h3>{BONUS_CHAPTER.title}</h3>
                    <p>{BONUS_CHAPTER.desc}</p>
                  </div>
                </div>
              </div>

              <p className="gb-chapters-note">
                Aktuell struktur · Version {PRODUCT_VERSION} · {PRODUCT_UPDATED}
              </p>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 12. PROMPT VAULT UPSELL ═══ */}
          <section className="vk-section" id="vault" aria-labelledby="gb-vault-h">
            <div className="vk-wrap">
              <Reveal>
                <div className="gb-vault">
                  <p className="gb-kicker">Tillägg · +{PRICES.vault} kr</p>
                  <h2 id="gb-vault-h">Prompt Vault</h2>
                  <p className="gb-lead" style={{ color: "rgba(246,245,241,.8)" }}>
                    {VAULT_BLURB} Öppna, kopiera, klistra in – och anpassa till din verksamhet.
                  </p>
                  <p className="gb-vault-method">{VAULT_METHOD_NOTE}</p>
                  <div className="gb-vault-groups">
                    {VAULT_GROUPS.map((g) => (
                      <div className="gb-vault-group" key={g.title}>
                        <h3>{g.title}</h3>
                        <div className="gb-chips">
                          {g.items.map((it) => (
                            <span className="gb-chip" key={it}>
                              {it}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="gb-vault-cta">
                    <button
                      type="button"
                      className="vk-btn vk-btn-primary"
                      onClick={() => handleBuy("bundle")}
                    >
                      <span>
                        {IS_LIVE
                          ? `Guiden + Vault – ${PRICES.bundle} kr`
                          : "Få besked när Vault släpps"}
                      </span>
                    </button>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "rgba(246,245,241,.65)" }}>
                      Ingår i lanseringspaketet – se priser nedan
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 13. BUNDLE PRICING ═══ */}
          <section className="vk-section" id="priser" aria-labelledby="gb-priser-h">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Pris</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-priser-h">Välj ditt upplägg.</h2>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="gb-lead">
                    Engångspriser, inga abonnemang. Allt är digitalt och ditt för alltid – inklusive
                    kommande uppdateringar av Version 1.x.
                  </p>
                </Reveal>
              </div>
              <div className="gb-pricing">
                <div className="gb-price-slot">
                <Reveal>
                  <article className="gb-price-card">
                    <span className="gb-price-name">AI-KONTORET</span>
                    <div className="gb-price-amount">
                      <span className="now">{PRICES.guide} kr</span>
                    </div>
                    <p className="gb-price-desc">Den kompletta guiden till Grok Bot som medarbetare.</p>
                    <ul className="gb-price-list">
                      <li>Hela guiden – tolv kapitel</li>
                      <li>Alla ramverk och modeller</li>
                      <li>Verkliga exempel från drift</li>
                      <li>Steg-för-steg-upplägg från noll</li>
                    </ul>
                    <button
                      type="button"
                      className="vk-btn vk-btn-ghost"
                      onClick={() => handleBuy("guide")}
                    >
                      <span>{IS_LIVE ? `Köp guiden – ${PRICES.guide} kr` : "Få lanseringsbesked"}</span>
                    </button>
                  </article>
                </Reveal>
                </div>
                <div className="gb-price-slot is-first">
                <Reveal delay={0.1}>
                  <article className="gb-price-card is-hero">
                    <span className="gb-price-badge">Lanseringspaket · bäst värde</span>
                    <span className="gb-price-name">AI-KONTORET + PROMPT VAULT</span>
                    <div className="gb-price-amount">
                      <span className="now">{PRICES.bundle} kr</span>
                      <span className="was">{PRICES.bundleReference} kr</span>
                    </div>
                    <span className="gb-price-save">
                      {PRICES.guide} + {PRICES.vault} = {PRICES.bundleReference} kr → spara{" "}
                      {PRICES.bundleReference - PRICES.bundle} kr
                    </span>
                    <p className="gb-price-desc">Guiden och hela biblioteket, redo att kopieras.</p>
                    <ul className="gb-price-list">
                      <li>Hela guiden – tolv kapitel</li>
                      <li>Prompt Vault – alla färdiga prompts</li>
                      <li>Mallar &amp; operating rules</li>
                      <li>Copy-paste-arbetsflöden för varje roll</li>
                    </ul>
                    <button
                      type="button"
                      className="vk-btn vk-btn-primary"
                      onClick={() => handleBuy("bundle")}
                    >
                      <span>
                        {IS_LIVE ? `Köp paketet – ${PRICES.bundle} kr` : "Få besked när AI-KONTORET släpps"}
                      </span>
                    </button>
                  </article>
                </Reveal>
                </div>
                <div className="gb-price-slot">
                <Reveal delay={0.2}>
                  <article className="gb-price-card">
                    <span className="gb-price-name">PROMPT VAULT</span>
                    <div className="gb-price-amount">
                      <span className="now">{PRICES.vault} kr</span>
                    </div>
                    <p className="gb-price-desc">För dig som redan har guiden.</p>
                    <ul className="gb-price-list">
                      <li>Alla färdiga prompts &amp; templates</li>
                      <li>Roller: CEO, Chief of Staff, Growth, Sales, QA, Engineer</li>
                      <li>System: Opportunity Engine, Usage Governor m.fl.</li>
                      <li>Owner gates &amp; evidence-krav</li>
                    </ul>
                    <button
                      type="button"
                      className="vk-btn vk-btn-ghost"
                      onClick={() => handleBuy("vault")}
                    >
                      <span>{IS_LIVE ? `Köp Vault – ${PRICES.vault} kr` : "Få lanseringsbesked"}</span>
                    </button>
                  </article>
                </Reveal>
                </div>
              </div>
              <Reveal delay={0.15}>
                <div className="gb-legal-strip">
                  <b>Tryggt köp, tydliga villkor.</b> {DIGITAL_DELIVERY_NOTE} Priser i svenska
                  kronor. Läs <a href={LEGAL_LINKS.villkor}>villkoren</a> och{" "}
                  <a href={LEGAL_LINKS.integritetspolicy}>integritetspolicyn</a> – information om
                  ångerrätt och återbetalning för digitalt innehåll finns i kassan innan du
                  betalar. Frågor? <a href="mailto:info@auroramedia.se">info@auroramedia.se</a>
                </div>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 14–15. WHO IT IS FOR / NOT FOR ═══ */}
          <section className="vk-section" aria-labelledby="gb-who-h">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Passar det dig?</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-who-h">Rakt besked om vem guiden är för.</h2>
                </Reveal>
              </div>
              <div className="gb-who">
                <Reveal>
                  <div className="gb-who-card yes">
                    <h3>AI-KONTORET är för dig som…</h3>
                    <ul className="gb-who-list">
                      {WHO_FOR.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
                <Reveal delay={0.12}>
                  <div className="gb-who-card no">
                    <h3>…och inte för dig som…</h3>
                    <ul className="gb-who-list">
                      {WHO_NOT_FOR.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 16. PREVIEW / SAMPLE ═══ */}
          <section className="vk-section" id="forhandsvisning" aria-labelledby="gb-preview-h">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Smakprov</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-preview-h">Så här ser materialet ut inuti.</h2>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="gb-lead">
                    Ett utdrag ur kapitel 3 – mallen Bot Charter som förvandlar en chatt till en
                    medarbetare. Exakt den här tonen och konkretionen genom hela guiden.
                  </p>
                </Reveal>
              </div>
              <Reveal>
                <div className="gb-preview">
                  <div className="gb-preview-bar">
                    <i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" />
                    <span style={{ marginLeft: 6 }}>AI-KONTORET · kapitel 3 · Bot Charter</span>
                  </div>
                  <div className="gb-preview-body">
                    <details onToggle={handlePreviewOpen}>
                      <summary
                        style={{
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "clamp(17px,2vw,19px)",
                          letterSpacing: "-.01em",
                        }}
                      >
                        Läs utdraget: Bot Charter för en Research-bot
                      </summary>
                      <pre className="gb-preview-excerpt">{PREVIEW_EXCERPT}</pre>
                    </details>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ═══ 17. FAQ ═══ */}
          <section className="vk-section" id="faq" aria-labelledby="gb-faq-h">
            <div className="vk-wrap">
              <div className="gb-head">
                <Reveal>
                  <p className="gb-kicker">Vanliga frågor</p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id="gb-faq-h">Allt du undrar – innan du bestämmer dig.</h2>
                </Reveal>
              </div>
              <div className="gb-faq">
                {FAQ.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ 18. FINAL CTA + WAITLIST ═══ */}
          <section className="vk-section" id="kop" aria-labelledby="gb-final-h">
            <div className="vk-wrap">
              <Reveal>
                <div className="gb-final">
                  <p className="gb-kicker">AI-KONTORET · {PRICES.guide} kr</p>
                  <h2 id="gb-final-h">Sluta chatta med din AI. Börja anställa den.</h2>
                  <p>
                    {IS_LIVE
                      ? "Guiden är klar. Tolv kapitel, alla ramverk och varje lärdom – redo att laddas ner direkt efter köpet."
                      : "Guiden färdigställs just nu. Ställ dig i väntelistan så får du besked först – och till lanseringspriset."}
                  </p>

                  {IS_LIVE ? (
                    <div className="gb-final-ctas">
                      <button
                        type="button"
                        className="vk-btn vk-btn-primary"
                        onClick={() => handleBuy("bundle")}
                      >
                        <span>Köp paketet – {PRICES.bundle} kr</span>
                      </button>
                      <button
                        type="button"
                        className="vk-btn vk-btn-ghost"
                        onClick={() => handleBuy("guide")}
                      >
                        <span>Bara guiden – {PRICES.guide} kr</span>
                      </button>
                    </div>
                  ) : (
                    <div className="gb-waitlist">
                      {wlState === "done" ? (
                        <div className="gb-waitlist-ok" role="status">
                          <h3>Du är på listan.</h3>
                          <p>Vi mejlar dig så fort AI-KONTORET släpps. Inga andra utskick.</p>
                        </div>
                      ) : (
                        <form onSubmit={submitWaitlist} noValidate={false}>
                          <label htmlFor="gb-wl-name" className="vk-mono" style={{ display: "block", marginBottom: 2 }}>
                            Namn
                          </label>
                          <input
                            id="gb-wl-name"
                            type="text"
                            autoComplete="name"
                            required
                            maxLength={80}
                            value={wlName}
                            onChange={(e) => setWlName(e.target.value)}
                            placeholder="Ditt namn"
                          />
                          <label htmlFor="gb-wl-email" className="vk-mono" style={{ display: "block", marginBottom: 2 }}>
                            E-post
                          </label>
                          <input
                            id="gb-wl-email"
                            type="email"
                            autoComplete="email"
                            required
                            maxLength={160}
                            value={wlEmail}
                            onChange={(e) => setWlEmail(e.target.value)}
                            placeholder="namn@foretag.se"
                          />
                          <input
                            type="text"
                            className="gb-hp"
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                            value={wlHp}
                            onChange={(e) => setWlHp(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="vk-btn vk-btn-primary"
                            disabled={wlState === "sending"}
                            style={{ justifyContent: "center" }}
                          >
                            <span>
                              {wlState === "sending" ? "Skickar…" : "Få besked när AI-KONTORET släpps"}
                            </span>
                          </button>
                          {wlState === "error" && (
                            <p role="alert" style={{ color: "#F2B8A2", fontSize: 13.5, margin: 0 }}>
                              Kunde inte skicka just nu – försök igen eller mejla
                              info@auroramedia.se.
                            </p>
                          )}
                          <p className="gb-consent">
                            Genom att anmäla dig godkänner du att Aurora Media sparar din e-post för
                            att meddela dig när guiden släpps – inget annat. Läs mer i{" "}
                            <a href={LEGAL_LINKS.integritetspolicy}>integritetspolicyn</a>.
                          </p>
                        </form>
                      )}
                    </div>
                  )}

                  <p
                    style={{
                      marginTop: 30,
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      letterSpacing: ".06em",
                      color: "rgba(246,245,241,.55)",
                    }}
                  >
                    AI-KONTORET · VERSION {PRODUCT_VERSION} · {PRODUCT_UPDATED.toUpperCase()} ·
                    SENAST UPPDATERAD {PRODUCT_UPDATED_ISO} · VERIFIERAD {PRODUCT_VERIFIED_ISO}
                    {" · "}
                    {PRODUCT_FRESHNESS.toUpperCase()}
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* Interna länkar vidare */}
          <section className="vk-section" style={{ paddingTop: 0 }} aria-label="Mer från Aurora Media">
            <div className="vk-wrap">
              <div className="gb-related">
                <a href="/ai-karta">AI-kartan – gratis kartläggning →</a>
                <a href="/verktyg">Gratis AI-verktyg →</a>
                <a href="/blogg">Guider om AI-kodning →</a>
                <a href="/kontakt">Boka ett samtal →</a>
              </div>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default GrokBot;
