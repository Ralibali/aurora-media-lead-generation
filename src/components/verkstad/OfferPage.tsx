import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import { Reveal, VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, setJsonLd, removeJsonLd, SITE_URL } from "@/lib/seoHelpers";
import { trackEvent } from "@/lib/analytics";
import AuroraPlattformen from "@/components/verkstad/AuroraPlattformen";
import "@/styles/verkstad.css";

const italic = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 500,
  color: "var(--gran)",
};

export type OfferTier = {
  name: string;
  price: string;
  cadence?: string;
  desc: string;
  features: string[];
  featured?: boolean;
};

export type OfferPageProps = {
  /** Route path without leading slash, e.g. "care" */
  slug: string;
  /** Value sent to the contact form's "paket" field */
  paketValue: string;
  eyebrow: string;
  title: string;
  titleEm: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  /** Konkreta utfall – vad kunden får ut */
  outcomes: { title: string; body: string }[];
  includes: string[];
  tiers: OfferTier[];
  pricingNote?: ReactNode;
  process: { title: string; body: string }[];
  /** Transparens: vad som INTE ingår / inte är live ännu */
  honesty?: string[];
  faqs: { q: string; a: string }[];
  related: { name: string; price: string; to: string }[];
  serviceType: string;
};

const OfferPage = (props: OfferPageProps) => {
  const { open } = useContactModal();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const url = `${SITE_URL}/${props.slug}`;

  const book = (placement: string) => {
    trackEvent("offer_cta_click", { offer: props.paketValue, placement });
    open({ paket: props.paketValue, internalNote: `Sida: /${props.slug}` });
  };

  useEffect(() => {
    setSEOMeta({
      title: props.seoTitle,
      description: props.seoDescription,
      canonical: `/${props.slug}`,
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: props.eyebrow, url: `/${props.slug}` },
    ]);
    setJsonLd("offer-service-jsonld", {
      "@context": "https://schema.org",
      "@type": "Service",
      name: props.eyebrow,
      serviceType: props.serviceType,
      description: props.seoDescription,
      url,
      provider: {
        "@type": "Organization",
        name: "Aurora Media AB",
        url: SITE_URL,
        email: "info@auroramedia.se",
        address: { "@type": "PostalAddress", addressLocality: "Linköping", addressCountry: "SE" },
      },
      areaServed: { "@type": "Country", name: "Sverige" },
      offers: props.tiers.map((t) => ({
        "@type": "Offer",
        name: t.name,
        description: t.desc,
        priceCurrency: "SEK",
        priceSpecification: { "@type": "PriceSpecification", price: t.price, priceCurrency: "SEK" },
      })),
    });
    if (props.faqs.length) {
      setJsonLd("offer-faq-jsonld", {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: props.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      });
    }
    return () => {
      removeJsonLd("breadcrumb-jsonld");
      removeJsonLd("offer-service-jsonld");
      removeJsonLd("offer-faq-jsonld");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.slug]);

  return (
    <div className="verkstad">
      <VkNav />
      <main id="main">
        {/* Hero */}
        <section className="vk-section vk-hero">
          <div className="vk-wrap">
            <Reveal><p className="vk-mono">{props.eyebrow} · del av Aurora Media</p></Reveal>
            <Reveal delay={0.1}>
              <h1 style={{ marginTop: 18, maxWidth: "20ch" }}>
                {props.title} <span style={italic}>{props.titleEm}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}><p className="vk-hero-sub">{props.intro}</p></Reveal>
            <Reveal delay={0.3}>
              <div className="vk-hero-cta">
                <button onClick={() => book("hero")} className="vk-btn vk-btn-primary">
                  Boka genomgång <ArrowRight size={16} />
                </button>
                <a href="#priser" className="vk-btn vk-btn-ghost">Se priser</a>
              </div>
            </Reveal>
            <Reveal delay={0.35}>
              <p className="vk-mono" style={{ marginTop: 18, color: "var(--granbark-mut)" }}>
                30 min · Kostnadsfritt · Svar inom 24 timmar · info@auroramedia.se
              </p>
            </Reveal>
          </div>
        </section>

        <hr className="vk-hair" />

        {/* Utfall */}
        <section className="vk-section">
          <div className="vk-wrap">
            <Reveal><p className="vk-mono">Vad ni får ut</p></Reveal>
            <Reveal delay={0.05}>
              <h2 style={{ marginTop: 14 }}>Konkreta <span style={italic}>utfall</span>.</h2>
            </Reveal>
            <div style={{ marginTop: 40, display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {props.outcomes.map((o, i) => (
                <Reveal key={o.title} delay={Math.min(i * 0.05, 0.2)}>
                  <div style={{ border: "1px solid var(--linje)", borderRadius: 14, background: "#fff", padding: "26px 24px", height: "100%" }}>
                    <h3 style={{ marginBottom: 10 }}>{o.title}</h3>
                    <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "#3E444B" }}>{o.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <hr className="vk-hair" />

        {/* Ingår */}
        <section className="vk-section">
          <div className="vk-wrap">
            <Reveal><p className="vk-mono">Vad som ingår</p></Reveal>
            <Reveal delay={0.05}>
              <h2 style={{ marginTop: 14 }}>Det här <span style={italic}>levereras</span>.</h2>
            </Reveal>
            <div style={{ marginTop: 40, borderTop: "1px solid var(--linje)" }}>
              {props.includes.map((item, i) => (
                <Reveal key={item} delay={Math.min(i * 0.03, 0.2)}>
                  <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 20, padding: "20px 0", borderBottom: "1px solid var(--linje)", alignItems: "start" }}>
                    <span className="vk-mono" style={{ color: "var(--gran)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontSize: 17, color: "var(--granbark)", lineHeight: 1.55 }}>{item}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <hr className="vk-hair" />

        {/* Priser */}
        <section className="vk-section" id="priser">
          <div className="vk-wrap">
            <Reveal><p className="vk-mono">Priser</p></Reveal>
            <Reveal delay={0.05}>
              <h2 style={{ marginTop: 14 }}>Fast pris, <span style={italic}>inga överraskningar</span>.</h2>
            </Reveal>
            <div style={{ marginTop: 40, display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
              {props.tiers.map((t, i) => (
                <Reveal key={t.name} delay={Math.min(i * 0.05, 0.2)}>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      border: t.featured ? "1.5px solid var(--gran)" : "1px solid var(--linje)",
                      borderRadius: 16,
                      background: "#fff",
                      padding: "28px 24px",
                    }}
                  >
                    {t.featured && (
                      <span className="vk-mono" style={{ position: "absolute", top: -11, left: 20, background: "var(--gran)", color: "#fff", borderRadius: 6, padding: "3px 10px", fontSize: 10.5 }}>
                        Populärast
                      </span>
                    )}
                    <p className="vk-mono" style={{ color: "var(--granbark-mut)" }}>{t.name}</p>
                    <p style={{ marginTop: 10, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>
                      {t.price}
                      {t.cadence && <span style={{ fontSize: 15, fontWeight: 500, color: "var(--granbark-mut)" }}> {t.cadence}</span>}
                    </p>
                    <p style={{ marginTop: 12, fontSize: 15.5, lineHeight: 1.6, color: "#3E444B" }}>{t.desc}</p>
                    <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 24px", display: "grid", gap: 10, flex: 1 }}>
                      {t.features.map((f) => (
                        <li key={f} style={{ display: "flex", gap: 10, fontSize: 15, lineHeight: 1.5, color: "var(--granbark)" }}>
                          <Check size={16} style={{ color: "var(--gran)", flexShrink: 0, marginTop: 3 }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => book(`tier:${t.name}`)} className={`vk-btn ${t.featured ? "vk-btn-primary" : "vk-btn-ghost"}`}>
                      Begär offert <ArrowRight size={15} />
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
            {props.pricingNote && (
              <Reveal delay={0.15}>
                <p style={{ marginTop: 24, fontSize: 15, color: "#3E444B", maxWidth: "70ch", lineHeight: 1.7 }}>{props.pricingNote}</p>
              </Reveal>
            )}
          </div>
        </section>

        <hr className="vk-hair" />

        {/* Process */}
        <section className="vk-section">
          <div className="vk-wrap">
            <Reveal><p className="vk-mono">Så jobbar vi</p></Reveal>
            <Reveal delay={0.05}>
              <h2 style={{ marginTop: 14 }}><span style={italic}>Process</span> utan onödiga möten.</h2>
            </Reveal>
            <div style={{ marginTop: 40, borderTop: "1px solid var(--linje)" }}>
              {props.process.map((step, i) => (
                <Reveal key={step.title} delay={Math.min(i * 0.04, 0.2)}>
                  <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 20, padding: "24px 0", borderBottom: "1px solid var(--linje)", alignItems: "start" }}>
                    <span className="vk-mono" style={{ color: "var(--gran)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 style={{ marginBottom: 8 }}>{step.title}</h3>
                      <p style={{ fontSize: 16, lineHeight: 1.65, color: "#3E444B" }}>{step.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Ärlighet */}
        {props.honesty && props.honesty.length > 0 && (
          <>
            <hr className="vk-hair" />
            <section className="vk-section">
              <div className="vk-wrap">
                <Reveal><p className="vk-mono">Vad vi inte lovar</p></Reveal>
                <Reveal delay={0.05}>
                  <h2 style={{ marginTop: 14 }}>Ärligt om <span style={italic}>gränserna</span>.</h2>
                </Reveal>
                <ul style={{ listStyle: "none", padding: 0, margin: "32px 0 0", display: "grid", gap: 14, maxWidth: "72ch" }}>
                  {props.honesty.map((h) => (
                    <li key={h} style={{ display: "flex", gap: 12, fontSize: 16.5, lineHeight: 1.6, color: "#3E444B" }}>
                      <Minus size={16} style={{ color: "var(--varsel)", flexShrink: 0, marginTop: 6 }} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}

        <hr className="vk-hair" />

        <AuroraPlattformen activeSlug={props.slug} />

        {/* FAQ */}
        {props.faqs.length > 0 && (
          <>
            <hr className="vk-hair" />
            <section className="vk-section">
              <div className="vk-wrap">
                <Reveal><p className="vk-mono">Vanliga frågor</p></Reveal>
                <Reveal delay={0.05}>
                  <h2 style={{ marginTop: 14 }}><span style={italic}>Frågor</span> vi får ofta.</h2>
                </Reveal>
                <div className="vk-faq">
                  {props.faqs.map((f, i) => (
                    <div className="vk-faq-item" key={f.q}>
                      <button
                        className="vk-faq-q"
                        aria-expanded={openFaq === i}
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        <span>{f.q}</span>
                        {openFaq === i ? <Minus size={18} className="vk-faq-icon" /> : <Plus size={18} className="vk-faq-icon" />}
                      </button>
                      {openFaq === i && <div className="vk-faq-a">{f.a}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Relaterat */}
        {props.related.length > 0 && (
          <section className="vk-section" style={{ paddingBlock: "clamp(48px, 6vw, 80px)" }}>
            <div className="vk-wrap">
              <p className="vk-mono" style={{ marginBottom: 24 }}>Kombinera med</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {props.related.map((r) => (
                  <li key={r.to}>
                    <Link
                      to={r.to}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 22px", border: "1px solid var(--linje)", borderRadius: 12, background: "#fff", color: "var(--granbark)", textDecoration: "none", fontWeight: 600 }}
                    >
                      <span>{r.name}<br /><span className="vk-mono" style={{ color: "var(--granbark-mut)" }}>{r.price}</span></span>
                      <ArrowRight size={16} style={{ color: "var(--gran)", flexShrink: 0 }} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="vk-dark">
          <div className="vk-wrap">
            <Reveal><p className="vk-mono">Nästa steg</p></Reveal>
            <Reveal delay={0.05}>
              <h2 style={{ marginTop: 14 }}>
                Redo att{" "}
                <span style={{ color: "#F6F5F1", fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontWeight: 500 }}>komma igång?</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p style={{ marginTop: 20, fontSize: 18, maxWidth: "58ch" }}>
                Berätta kort om er situation – ni får ett konkret förslag inom 24 timmar. Eller mejla{" "}
                <a href="mailto:info@auroramedia.se" style={{ color: "inherit" }}>info@auroramedia.se</a>.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div style={{ marginTop: 28 }}>
                <button onClick={() => book("footer")} className="vk-btn vk-btn-primary">
                  Kontakta oss <ArrowRight size={16} />
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <VkFooter />

      {/* Sticky mobil-CTA */}
      <div className="vk-offer-sticky">
        <button onClick={() => book("sticky_mobile")} className="vk-btn vk-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          Boka kostnadsfri genomgång <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default OfferPage;
