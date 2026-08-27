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
              {checkoutCancelled && (
                <div className="gb-thanks" role="status">
                  <b>Köpet avbröts.</b> Inget har debiterats. Du är välkommen tillbaka när du vill.
                </div>
              )}
              {checkoutReturn && (
                <div className="gb-thanks" role="status">
                  {verify.state === "checking" && <><b>Verifierar…</b> Vi kontrollerar kontobetalningen mot betalleverantören.</>}
                  {verify.state === "paid" && (
                    <>
                      <b>Betalning verifierad.</b>{" "}
                      {verify.delivered
                        ? "Leveransmejlet med dina nedladdningslänkar är skickat."
                        : "Leveransmejlet med dina nedladdningslänkar är på väg."}{" "}
                      Saknas något? Mejla info@auroramedia.se.
                    </>
                  )}
                  {(verify.state === "unverified" || verify.state === "idle") && (
                    <>
                      <b>Tack.</b> Vi kan inte bekräfta någon betalning här – om den gick igenom får
                      du leverans via e-post. Kontakta info@auroramedia.se om något saknas.
                    </>
                  )}
                </div>
              )}


              <Reveal>
                <p className="gb-eyebrow">
                  <i aria-hidden="true" /> AI-KONTORET
                </p>
              </Reveal>
