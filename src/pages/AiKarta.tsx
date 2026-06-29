import { useEffect } from "react";
import { ArrowRight, Check, Clock3, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { trackAiKartaClick } from "@/lib/aiKartaTracking";
import {
  removeJsonLd,
  setBreadcrumb,
  setJsonLd,
  setSEOMeta,
  SITE_URL,
} from "@/lib/seoHelpers";

const BENEFITS = [
  {
    n: "01",
    title: "Era tre bästa startområden",
    body: "Processerna rangordnas efter frekvens, tidsåtgång, regelstyrning, tillgänglig data och affärsnytta.",
  },
  {
    n: "02",
    title: "Rimlig lösning per process",
    body: "Ni ser om behovet främst är AI, vanlig automation, en integration eller ett internt system.",
  },
  {
    n: "03",
    title: "Uppskattad frigjord tid",
    body: "Analysen räknar försiktigt på möjlig tidsbesparing och visar antagandena bakom uppskattningen.",
  },
  {
    n: "04",
    title: "Ett beslutsunderlag att spara",
    body: "Resultatet visas direkt och kan laddas ner som PDF för att delas med kollegor, ledning eller styrelse.",
  },
];

const STEPS = [
  {
    n: "01",
    label: "Fokus",
    title: "Markera var tiden försvinner",
    body: "Välj områden som administration, offerter, rapportering, kundservice eller interna rutiner.",
  },
  {
    n: "02",
    label: "Process",
    title: "Beskriv minst en arbetsuppgift",
    body: "Ange hur ofta den görs och ungefär hur mycket tid den tar. Fler detaljer är frivilliga.",
  },
  {
    n: "03",
    label: "Resultat",
    title: "Få analysen direkt",
    body: "Fyll i vart kopian ska skickas. Ingen betalning och inget bokat säljmöte krävs.",
  },
];

const FAQ = [
  {
    q: "Vad behöver vi förbereda?",
    a: "Ingenting. Tänk bara på en eller flera återkommande arbetsuppgifter som tar onödigt mycket tid, skapar dubbelarbete eller lätt blir fel.",
  },
  {
    q: "Är analysen verkligen personlig?",
    a: "Ja. Rangordningen och rekommendationerna bygger på era egna processer, tidsuppskattningar, system och svar. Resultatet är ändå en första bedömning, inte en full teknisk förstudie.",
  },
  {
    q: "Varför behöver ni vår e-postadress?",
    a: "För att skapa leadposten, skicka en kopia av resultatet och göra det möjligt att återfå analysen. Ni väljer själva om ni vill boka en genomgång efteråt.",
  },
  {
    q: "Måste vi prata med en säljare?",
    a: "Nej. Resultatet och PDF:en är tillgängliga direkt. En kostnadsfri genomlysning är ett frivilligt nästa steg för företag som vill kontrollera scope, data och kostnad.",
  },
  {
    q: "Kan vi skriva känslig information?",
    a: "Undvik personuppgifter, kundhemligheter och känsliga dokument. Beskriv processen på en övergripande nivå, till exempel ‘skapa offert från kundmejl’ eller ‘sammanställa veckorapport från Excel’.",
  },
];

const AiKarta = () => {
  useEffect(() => {
    setSEOMeta({
      title: "AI-kartläggning för företag – kostnadsfri AI-analys | Aurora Media",
      description:
        "Kartlägg företagets bästa områden för AI, automation och interna system. Få prioriterad topp 3, tidsuppskattning och PDF på cirka 3–5 minuter.",
      canonical: "/ai-karta",
      keywords:
        "AI-kartläggning företag, AI-analys företag, AI för företag, automatisera arbetsuppgifter",
    });

    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "AI-kartan", url: "/ai-karta" },
    ]);

    setJsonLd("ai-karta-jsonld", {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Aurora AI-karta",
      url: `${SITE_URL}/ai-karta`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "sv-SE",
      description:
        "Kostnadsfri AI-kartläggning som hjälper företag att prioritera processer för AI, automation, integrationer och interna system.",
      provider: { "@id": `${SITE_URL}/#organization` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "SEK",
      },
      featureList: [
        "Prioriterad topp 3",
        "Uppskattad tidsbesparing",
        "Lösningsförslag",
        "PDF-underlag",
      ],
    });

    setJsonLd("ai-karta-faq-jsonld", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });

    void trackAiKartaClick("landing_view");

    return () => {
      removeJsonLd("ai-karta-jsonld");
      removeJsonLd("ai-karta-faq-jsonld");
      removeJsonLd("breadcrumb-jsonld");
    };
  }, []);

  return (
    <NordicLayout>
      <div id="main">
        <section className="page-hero" aria-labelledby="ai-map-heading">
          <div className="wrap">
            <div className="funnel-grid">
              <div>
                <Reveal>
                  <p className="mono">kostnadsfri ai-kartläggning · cirka 3–5 minuter</p>
                </Reveal>
                <Reveal delay={0.1}>
                  <h1
                    id="ai-map-heading"
                    className="hero-line"
                    style={{ marginTop: 18, fontSize: "clamp(2.2rem,5.8vw,4.9rem)", maxWidth: "17ch" }}
                  >
                    Se var AI kan spara <span className="it">mest tid i ert företag.</span>
                  </h1>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className="lead" style={{ marginTop: 24, maxWidth: "62ch" }}>
                    Beskriv era återkommande arbetsuppgifter och få en prioriterad topp 3 med
                    lösningsförslag, försiktig tidsuppskattning och ett PDF-underlag att dela internt.
                  </p>
                </Reveal>
                <Reveal delay={0.3}>
                  <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <Link
                      to="/ai-karta/start"
                      className="btn btn-moss"
                      onClick={() => void trackAiKartaClick("landing_primary_cta")}
                    >
                      Starta kostnadsfritt <span className="a"><ArrowRight size={14} /></span>
                    </Link>
                    <Link to="/kontakt" className="btn btn-ghost">
                      Hellre prata direkt?
                    </Link>
                  </div>
                </Reveal>
                <Reveal delay={0.4}>
                  <div className="hero-trust" style={{ marginTop: 24 }}>
                    {[
                      "Resultatet visas direkt",
                      "Ingen betalning eller bokning",
                      "Byggd av Aurora Media AB i Linköping",
                    ].map((item) => (
                      <div key={item} className="trust-item">
                        <Check size={14} className="ic" strokeWidth={2.5} /> {item}
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.16}>
                <aside className="result-preview" aria-label="Exempel på resultat från AI-kartan">
                  <p className="eyebrow">exempel på resultat</p>
                  <h2 className="h3" style={{ marginTop: 14, fontSize: "clamp(1.15rem,2vw,1.45rem)" }}>
                    Företagets rekommenderade första pilot
                  </h2>
                  <p className="body" style={{ marginTop: 10 }}>
                    Skapa offertutkast från inkommande kundmejl och låt en medarbetare godkänna innan utskick.
                  </p>

                  <div style={{ marginTop: 22 }}>
                    {[
                      { label: "Potential", value: "Hög" },
                      { label: "Uppskattad effekt", value: "3–5 h/vecka" },
                      { label: "Lämplig lösning", value: "AI + automation" },
                    ].map((item, index) => (
                      <div key={item.label} className="result-preview-row">
                        <span className="mono" style={{ color: "var(--bone-mute)" }}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="body">{item.label}</span>
                        <strong className="mono-md">{item.value}</strong>
                      </div>
                    ))}
                  </div>

                  <p className="body" style={{ marginTop: 18, fontSize: 13 }}>
                    Exemplet visar formatet. Er analys räknas fram från era egna svar och kan ge ett annat resultat.
                  </p>
                </aside>
              </Reveal>
            </div>

            <Reveal delay={0.45}>
              <div className="trust-strip" style={{ marginTop: "clamp(36px,6vw,64px)" }}>
                <div>
                  <Clock3 size={18} color="var(--moss)" />
                  <p className="h3" style={{ marginTop: 10 }}>3–5 minuter</p>
                  <p className="body" style={{ marginTop: 4, fontSize: 13 }}>En process räcker för att börja.</p>
                </div>
                <div>
                  <Sparkles size={18} color="var(--moss)" />
                  <p className="h3" style={{ marginTop: 10 }}>Personligt resultat</p>
                  <p className="body" style={{ marginTop: 4, fontSize: 13 }}>Byggt på era egna arbetsflöden.</p>
                </div>
                <div>
                  <FileText size={18} color="var(--moss)" />
                  <p className="h3" style={{ marginTop: 10 }}>PDF att dela</p>
                  <p className="body" style={{ marginTop: 4, fontSize: 13 }}>Ta med underlaget till nästa möte.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section" aria-labelledby="ai-map-value-heading">
          <div className="wrap">
            <div className="sec-head">
              <Reveal><div className="meta-label">Det här får ni</div></Reveal>
              <Reveal delay={0.1}>
                <div>
                  <h2 id="ai-map-value-heading" className="h2">
                    Inte en lista över AI-verktyg. <span className="it">Ett prioriterat nästa steg.</span>
                  </h2>
                  <p className="lead" style={{ marginTop: 22 }}>
                    Kartan skiljer mellan sådant som bör lösas med AI och sådant som blir bättre med
                    vanlig automation, integration eller ett enklare internt system.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="work-grid">
              {BENEFITS.map((item, index) => (
                <Reveal key={item.n} delay={index * 0.05}>
                  <article className="work-card" style={{ height: "100%" }}>
                    <span className="meta-label">{item.n}</span>
                    <h3 style={{ marginTop: 18 }}>{item.title}</h3>
                    <p className="body" style={{ marginTop: 12 }}>{item.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="surface surface-pad" style={{ marginTop: 36, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 20, alignItems: "center" }}>
                <div>
                  <p className="h3">Har ni en återkommande tidstjuv i åtanke?</p>
                  <p className="body" style={{ marginTop: 6 }}>Det räcker. Ni behöver inte kunna beskriva tekniken.</p>
                </div>
                <Link
                  to="/ai-karta/start"
                  className="btn btn-moss"
                  onClick={() => void trackAiKartaClick("landing_mid_cta")}
                >
                  Kartlägg den nu <span className="a"><ArrowRight size={14} /></span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section" aria-labelledby="ai-map-process-heading">
          <div className="wrap">
            <div className="sec-head">
              <Reveal><div className="meta-label">Så fungerar det</div></Reveal>
              <Reveal delay={0.1}>
                <h2 id="ai-map-process-heading" className="h2">
                  Tre steg från tidstjuv till <span className="it">beslutsunderlag.</span>
                </h2>
              </Reveal>
            </div>

            <div className="timeline">
              {STEPS.map((step, index) => (
                <Reveal key={step.n} delay={index * 0.08}>
                  <div className="tl-step">
                    <span className="tl-num">{step.n}</span>
                    <span className="tl-day">{step.label}</span>
                    <h3 className="tl-title">{step.title}</h3>
                    <p className="body">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="ai-map-safe-heading">
          <div className="wrap">
            <div className="funnel-grid">
              <Reveal>
                <div>
                  <p className="meta-label">Trygg användning</p>
                  <h2 id="ai-map-safe-heading" className="h2" style={{ marginTop: 18 }}>
                    Beskriv processen. <span className="it">Inte företagshemligheterna.</span>
                  </h2>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="surface surface-pad">
                  <ShieldCheck size={22} color="var(--moss)" />
                  <p className="lead" style={{ marginTop: 16 }}>
                    Skriv exempelvis “registrera order från kundmejl” eller “sammanställa månadsrapport från tre system”.
                    Lägg inte in personnummer, kundlistor, avtal eller andra känsliga uppgifter.
                  </p>
                  <Link to="/integritetspolicy" className="text-link" style={{ marginTop: 18, display: "inline-block" }}>
                    Läs integritetspolicyn
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="ai-map-faq-heading">
          <div className="wrap" style={{ maxWidth: 920 }}>
            <div className="sec-head">
              <Reveal><div className="meta-label">Vanliga frågor</div></Reveal>
              <Reveal delay={0.1}>
                <h2 id="ai-map-faq-heading" className="h2">
                  Innan ni <span className="it">börjar.</span>
                </h2>
              </Reveal>
            </div>

            <div>
              {FAQ.map((item) => (
                <details key={item.q} className="faq-row">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
            <Reveal><div className="meta-label">Kostnadsfri första kartläggning</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2" style={{ marginTop: 18, maxWidth: "22ch" }}>
                Börja med processen som ni helst skulle slippa göra <span className="it">manuellt.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="lead" style={{ marginTop: 22 }}>
                Resultatet visas direkt. Ni bokar bara en genomgång om ni själva vill gå vidare.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <Link
                to="/ai-karta/start"
                className="btn btn-moss"
                style={{ marginTop: 28 }}
                onClick={() => void trackAiKartaClick("landing_final_cta")}
              >
                Starta min AI-karta <span className="a"><ArrowRight size={14} /></span>
              </Link>
            </Reveal>
          </div>
        </section>

        <Link
          to="/ai-karta/start"
          className="btn btn-moss sticky-funnel-cta"
          onClick={() => void trackAiKartaClick("landing_primary_cta")}
        >
          Starta kostnadsfritt · 3–5 min <span className="a"><ArrowRight size={14} /></span>
        </Link>
      </div>
    </NordicLayout>
  );
};

export default AiKarta;
