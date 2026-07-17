import { useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import { SEO, SITE_URL } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import { Reveal, VkNav, VkFooter } from "@/pages/Index";
import { setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";
import { trackEvent } from "@/lib/analytics";
import "@/styles/verkstad.css";

type Package = {
  num: string;
  name: string;
  modalValue: string;
  time: string;
  price: string;
  priceFrom: number;
  featured?: boolean;
  desc: string;
  features: readonly string[];
};

const PACKAGES: readonly Package[] = [
  {
    num: "01",
    name: "Aurora Sprint",
    modalValue: "Prototyp",
    time: "1–2 veckor",
    price: "från 14 900 kr",
    priceFrom: 14900,
    desc: "Klickbar prototyp eller första fungerande version för att validera idén snabbt.",
    features: [
      "Avgränsning av kärnflödet",
      "Klickbar eller fungerande prototyp",
      "Modern, responsiv design",
      "Demo-URL för test",
      "Rekommendation för nästa steg",
    ],
  },
  {
    num: "02",
    name: "Aurora MVP",
    modalValue: "MVP",
    time: "3–5 veckor",
    price: "från 34 900 kr",
    priceFrom: 34900,
    featured: true,
    desc: "Lanseringsbar MVP med riktiga användare, data och de viktigaste funktionerna.",
    features: [
      "Inloggning och autentisering",
      "Databas i Supabase/Postgres",
      "Enkel adminpanel",
      "Betalflöde med Stripe vid behov",
      "GitHub-repo och dokumentation",
    ],
  },
  {
    num: "03",
    name: "Aurora Scale",
    modalValue: "SaaS",
    time: "6–10 veckor",
    price: "från 69 000 kr",
    priceFrom: 69000,
    desc: "Skalbar SaaS eller intern plattform med roller, integrationer och automation.",
    features: [
      "Skalbar systemstruktur",
      "Roller och behörigheter",
      "Tredjepartsintegrationer",
      "AI-flöden och automation",
      "Teknisk överlämning",
    ],
  },
  {
    num: "04",
    name: "Aurora AI Ops",
    modalValue: "Skraddarsytt",
    time: "Efter scope",
    price: "från 14 900 kr",
    priceFrom: 14900,
    desc: "AI-automationer och interna verktyg för företag som vill kapa manuellt arbete.",
    features: [
      "Processkartläggning",
      "AI- och automationsflöden",
      "API-kopplingar",
      "Behörighetshantering",
      "Driftbar lösning",
    ],
  },
];

const COMPARE: readonly (readonly [string, boolean | string, boolean | string, boolean | string, boolean | string])[] = [
  ["Fast pris innan start", true, true, true, true],
  ["Kod/repo ni äger", true, true, true, true],
  ["Klickbar produkt", true, true, true, false],
  ["Databas och autentisering", false, true, true, true],
  ["Betalningar", false, true, true, false],
  ["Roller och behörigheter", false, false, true, true],
  ["Integrationer", false, "Enkel", true, true],
  ["AI-automation", false, "Tillägg", true, true],
];

const FAQS = [
  {
    q: "Är priserna verkligen fasta?",
    a: "Ja, för det scope vi kommer överens om. Om ni senare vill lägga till större funktioner får ni en separat fast tilläggsoffert innan arbetet börjar.",
  },
  {
    q: "Vad ingår i offerten?",
    a: "Offerten beskriver funktioner, avgränsningar, leverabler, tidsplan, pris och vad ni behöver bidra med. Ni ska förstå exakt vad som byggs innan ni tackar ja.",
  },
  {
    q: "Kan vi börja med ett mindre projekt?",
    a: "Ja. En sprint eller prototyp är ofta det bästa första steget när ni vill testa nyttan och minska risken innan en större investering.",
  },
  {
    q: "Tar ni konsultuppdrag på timme?",
    a: "Ja. Utöver de fasta paketen tar jag konsultuppdrag inom AI-rådgivning, strategi och utveckling. Utvecklingskonsult kostar 895 kr/timme, löpande rådgivning börjar från 12 000 kr/månad och strategiworkshops kostar 24 900–49 900 kr. Dagpris offereras vid större omfattning.",
  },
  {
    q: "Tillkommer drift och externa licenser?",
    a: "Eventuella kostnader för exempelvis hosting, AI-anrop, e-post, SMS eller tredjepartssystem specificeras separat i offerten. Kontona ska normalt stå i ert namn.",
  },
] as const;

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/priser#service`,
  name: "Skräddarsydda AI-system, MVP, SaaS och konsultuppdrag",
  description: "Fastprisupplägg för prototyper, MVP, SaaS och AI-automationer samt konsultuppdrag inom AI-rådgivning och utveckling för svenska företag.",
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "Country", name: "Sverige" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Aurora Medias paket",
    itemListElement: PACKAGES.map((item) => ({
      "@type": "Offer",
      name: item.name,
      description: item.desc,
      price: item.priceFrom,
      priceCurrency: "SEK",
      url: `${SITE_URL}/priser`,
    })),
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const Priser = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Priser", url: "/priser" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  const openPackage = (item: Package) => {
    trackEvent("pricing_package_click", {
      package: item.name,
      price_from: item.priceFrom,
    });
    open({
      paket: item.modalValue,
      internalNote: `Besökaren valde ${item.name} (${item.price}) på prissidan.`,
    });
  };

  const openGeneral = (source: string) => {
    trackEvent("pricing_cta_click", { source });
    open({ internalNote: `Lead från prissidan · CTA: ${source}` });
  };

  return (
    <>
      <SEO
        title="Priser för AI-system, MVP och SaaS"
        description="Se riktpriser för prototyp, MVP, SaaS och AI-automation. Fast scope, tydlig offert och kod ni äger. Projekt från 14 900 kr."
        canonical="/priser"
        jsonLd={[pricingSchema, faqSchema]}
      />
      <div className="verkstad">
        <VkNav />
        <main>
          <section className="vk-section vk-hero">
            <div className="vk-wrap">
              <Reveal>
                <p className="vk-mono">priser · fast scope · ingen timrapport</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 style={{ marginTop: 18, maxWidth: "16ch" }}>
                  Ni ska veta priset <span className="accent" style={{ fontStyle: "italic" }}>innan vi börjar.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="vk-hero-sub">
                  Börja från 14 900 kr. Vi ramar in scope, pris och leverans innan bygget startar – sedan får ni en produkt som går att använda på riktigt.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="vk-hero-cta">
                  <button onClick={() => openGeneral("hero")} className="vk-btn vk-btn-primary">
                    Få en exakt offert <ArrowRight size={16} />
                  </button>
                  <a href="#paket" className="vk-btn vk-btn-ghost">Se paket och priser</a>
                </div>
                <p className="vk-mono vk-hero-micro">Svar inom 24 h · Ingen bindning · Inga överraskande timmar</p>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          <section id="paket" className="vk-section">
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">Paket och riktpriser</p></Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ marginTop: 14, maxWidth: "18ch" }}>
                  Fyra tydliga upplägg. <span style={{ color: "var(--gran)", fontStyle: "italic" }}>Fast pris.</span>
                </h2>
              </Reveal>

              <div className="vk-receipts" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                {PACKAGES.map((item, index) => (
                  <Reveal key={item.num} delay={index * 0.06}>
                    <article className="vk-receipt" style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
                      {item.featured && <span className="vk-receipt-flag">POPULÄRAST</span>}
                      <span className="vk-receipt-stamp">Fast pris</span>
                      <div className="vk-receipt-tier">{item.num} · {item.time}</div>
                      <h3 style={{ marginTop: 2 }}>{item.name}</h3>
                      <div className="vk-receipt-price" style={{ marginTop: 4 }}>{item.price}</div>
                      <p className="vk-receipt-desc">{item.desc}</p>
                      <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0", display: "grid", gap: 8, flex: 1 }}>
                        {item.features.map((feature) => (
                          <li key={feature} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--granbark)" }}>
                            <Check size={14} strokeWidth={2.5} style={{ color: "var(--gran)", flexShrink: 0, marginTop: 3 }} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => openPackage(item)}
                        className={`vk-btn ${item.featured ? "vk-btn-primary" : "vk-btn-ghost"}`}
                        style={{ justifyContent: "center", marginTop: 12, width: "100%" }}
                      >
                        Få exakt pris <ArrowRight size={14} />
                      </button>
                    </article>
                  </Reveal>
                ))}
              </div>
              <p className="vk-mono" style={{ marginTop: 28 }}>
                Riktpriser exkl. moms. Exakt pris beror på funktioner, integrationer, datakrav och leveranstid.
              </p>
            </div>
          </section>

          <hr className="vk-hair" />

          <section className="vk-section" style={{ background: "var(--bjork-djup)" }}>
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">Konsultuppdrag</p></Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ marginTop: 14, maxWidth: "20ch" }}>
                  Vill ni hellre hyra mig <span style={{ color: "var(--gran)", fontStyle: "italic" }}>på timme eller i månaden?</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ marginTop: 18, maxWidth: "62ch", fontSize: 17, color: "var(--granbark-mut)" }}>
                  Utöver fasta paket tar jag rena konsultuppdrag – AI-rådgivning, utveckling i era team
                  och strategiarbete. Timpris, dagpris eller fast månadskostnad utan bindningstid.
                </p>
              </Reveal>

              <div className="vk-receipts" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 36 }}>
                {[
                  {
                    num: "K1", name: "Strategiworkshop", price: "24 900–49 900 kr", time: "Halv–heldag",
                    desc: "Prioriterade AI-use cases, quick wins och en 6-månadersplan – med ledning och operativt team i samma rum.",
                    modal: "Konsult",
                  },
                  {
                    num: "K2", name: "Löpande AI-rådgivning", price: "från 12 000 kr/mån", time: "Löpande",
                    desc: "AI-CTO on demand: bollplank för ledning, styrelse eller dev-team. Avstämningar, prioritering och kvalitetskontroll.",
                    modal: "Konsult",
                  },
                  {
                    num: "K3", name: "Utvecklingskonsult", price: "895 kr/timme", time: "Efter behov",
                    desc: "Jag kliver in i ert befintliga team och bygger – React, TypeScript, AI-integrationer, Supabase och automation. Dagpris vid större omfattning.",
                    modal: "Konsult",
                  },
                ].map((item, index) => (
                  <Reveal key={item.num} delay={index * 0.06}>
                    <article className="vk-receipt" style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
                      <span className="vk-receipt-stamp">Konsult</span>
                      <div className="vk-receipt-tier">{item.num} · {item.time}</div>
                      <h3 style={{ marginTop: 2 }}>{item.name}</h3>
                      <div className="vk-receipt-price" style={{ marginTop: 4 }}>{item.price}</div>
                      <p className="vk-receipt-desc" style={{ flex: 1 }}>{item.desc}</p>
                      <button
                        type="button"
                        onClick={() => {
                          trackEvent("pricing_consult_click", { offer: item.name });
                          open({ paket: item.modal, internalNote: `Besökaren valde konsultuppdraget ${item.name} (${item.price}) på prissidan.` });
                        }}
                        className="vk-btn vk-btn-ghost"
                        style={{ justifyContent: "center", marginTop: 12, width: "100%" }}
                      >
                        Hör av dig <ArrowRight size={14} />
                      </button>
                    </article>
                  </Reveal>
                ))}
              </div>
              <p className="vk-mono" style={{ marginTop: 28 }}>
                Samma person hela vägen – du pratar direkt med den som råder och bygger. Inga mellanhänder.
              </p>
            </div>
          </section>

          <hr className="vk-hair" />

          <section className="vk-section">
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">Jämförelse</p></Reveal>
              <Reveal delay={0.05}><h2 style={{ marginTop: 14 }}>Vad <span style={{ color: "var(--gran)", fontStyle: "italic" }}>ingår?</span></h2></Reveal>
              <Reveal delay={0.1}>
                <div style={{ marginTop: 40, overflowX: "auto", border: "1px solid var(--linje)", borderRadius: 14, background: "#fff" }}>
                  <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--linje)" }}>
                        <th style={{ padding: "16px 20px" }} />
                        {PACKAGES.map((item) => (
                          <th key={item.num} style={{ padding: "16px 20px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--granbark)", fontWeight: 600, whiteSpace: "nowrap", letterSpacing: ".06em", textTransform: "uppercase" }}>
                            {item.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE.map((row) => (
                        <tr key={row[0]} style={{ borderBottom: "1px solid var(--linje)" }}>
                          <td style={{ padding: "14px 20px", fontSize: 14, color: "var(--granbark)", fontWeight: 500 }}>{row[0]}</td>
                          {row.slice(1).map((value, index) => (
                            <td key={`${row[0]}-${index}`} style={{ padding: "14px 20px", fontSize: 14, color: "var(--granbark)" }}>
                              {typeof value === "boolean" ? (
                                value ? <Check size={16} strokeWidth={2.5} style={{ color: "var(--gran)" }} /> : <span style={{ color: "#B7B4A9" }}>—</span>
                              ) : <span style={{ color: "var(--granbark-mut)" }}>{value}</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            </div>
          </section>

          <section className="vk-section" style={{ background: "var(--bjork-djup)" }}>
            <div className="vk-wrap" style={{ maxWidth: 860 }}>
              <Reveal>
                <div className="vk-secheader">
                  <span className="vk-mono">Vanliga frågor om pris</span>
                  <h2>Inga små bokstäver.</h2>
                </div>
              </Reveal>
              <div className="vk-faq">
                {FAQS.map((faq) => (
                  <details className="vk-faq-item" key={faq.q}>
                    <summary className="vk-faq-q" style={{ cursor: "pointer" }}>{faq.q}</summary>
                    <p className="vk-faq-a">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="vk-dark">
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">Osäker på nivå?</p></Reveal>
              <Reveal delay={0.05}><h2 style={{ marginTop: 14 }}>Börja med problemet – inte paketet.</h2></Reveal>
              <Reveal delay={0.1}>
                <p style={{ marginTop: 20, maxWidth: "58ch", fontSize: 18 }}>
                  Beskriv vad som tar tid eller vad ni vill bygga. Ni får ett ärligt förslag på minsta rimliga första steg och ett fast pris.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div style={{ marginTop: 28 }}>
                  <button onClick={() => openGeneral("final")} className="vk-btn vk-btn-primary">
                    Få rekommendation och offert <ArrowRight size={16} />
                  </button>
                </div>
              </Reveal>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default Priser;
