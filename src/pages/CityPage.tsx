import { useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { getCity, getCitySeo } from "@/lib/cityContent";
import { paket } from "@/components/PaketSection";
import {
  setSEOMeta,
  setJsonLd,
  setBreadcrumb,
  removeJsonLd,
  organizationSchema,
  SITE_URL,
} from "@/lib/seoHelpers";

export default function CityPage() {
  const { city: citySlug, slug: legacySlug } = useParams<{ city?: string; slug?: string }>();
  const slug = citySlug ?? legacySlug;
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useContactModal();
  const isAiVariant = location.pathname.startsWith("/ai-byra-");
  const routeVariant = isAiVariant ? "ai-byra" : "saas-utveckling";
  const city = slug ? getCity(slug) : null;
  const seo = slug ? getCitySeo(slug) : null;
  const seoTitle = seo ? (isAiVariant ? seo.metaTitleAI : seo.metaTitleSaaS) : "";
  const seoDescription = seo ? (isAiVariant ? seo.metaDescAI : seo.metaDescSaaS) : "";
  const isSupportedLocalPage = slug === "linkoping";

  useEffect(() => {
    if (!city || !seo || !slug) {
      navigate("/404", { replace: true });
      return;
    }

    setSEOMeta({
      title: seoTitle,
      description: seoDescription,
      canonical: `${SITE_URL}/${routeVariant}-${slug}`,
      noindex: !isSupportedLocalPage,
    });

    const label = isAiVariant ? `AI-byrå ${city.city}` : `SaaS-utveckling ${city.city}`;
    setBreadcrumb([
      { name: "Hem", url: SITE_URL },
      { name: label, url: `${SITE_URL}/${routeVariant}-${slug}` },
    ]);

    setJsonLd("city-localbusiness", {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/${routeVariant}-${slug}#service`,
      name: `Aurora Media – ${label}`,
      description: seoDescription,
      url: `${SITE_URL}/${routeVariant}-${slug}`,
      areaServed: { "@type": "City", name: city.city },
      provider: { "@id": `${SITE_URL}/#organization` },
      makesOffer: paket.map((item: { name: string }) => ({
        "@type": "Offer",
        name: item.name,
        priceCurrency: "SEK",
      })),
    });

    if (city.faqs?.length) {
      setJsonLd("city-faq", {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: city.faqs.map((item: { q: string; a: string }) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      });
    }
    setJsonLd("city-organization", organizationSchema);

    return () => {
      removeJsonLd("city-localbusiness");
      removeJsonLd("city-faq");
      removeJsonLd("city-organization");
      removeJsonLd("breadcrumb-jsonld");
    };
  }, [city, isAiVariant, isSupportedLocalPage, navigate, routeVariant, seo, seoDescription, seoTitle, slug]);

  if (!city || !seo || !slug) return null;

  const label = isAiVariant ? `AI-byrå ${city.city}` : `SaaS-utveckling ${city.city}`;
  const alternativePath = isAiVariant ? `/saas-utveckling-${slug}` : `/ai-byra-${slug}`;
  const alternativeLabel = isAiVariant ? `SaaS-utveckling i ${city.city}` : `AI-byrå i ${city.city}`;

  return (
    <NordicLayout>
      <div id="main">
        <section className="page-hero">
          <div className="wrap">
            <Reveal><p className="mono">{isAiVariant ? "ai-byrå" : "saas-utveckling"} · {city.city.toLowerCase()}</p></Reveal>
            <Reveal delay={0.1}>
              <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "20ch" }}>
                {seo.h1Pre} <span className="it">{seo.h1Em}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}><p className="lead" style={{ marginTop: 24 }}>{city.intro}</p></Reveal>
            <Reveal delay={0.3}>
              <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => open()} className="btn btn-moss">Boka rådgivning <span className="a"><ArrowRight size={14} /></span></button>
                <Link to="/ai-karta" className="btn btn-ghost">Gör AI-kartan</Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <Reveal><div className="meta-label">Lokal kontext</div></Reveal>
              <Reveal delay={0.1}><h2 className="h2">Kompetens för företag i <span className="it">{city.city}.</span></h2></Reveal>
            </div>
            <Reveal><p className="lead">{city.localContext}</p></Reveal>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <Reveal><div className="meta-label">Tjänster</div></Reveal>
              <Reveal delay={0.1}><h2 className="h2">Från första test till <span className="it">fungerande system.</span></h2></Reveal>
            </div>
            {seo.tjansterIntro && <Reveal><p className="body" style={{ marginBottom: 38, maxWidth: "60ch" }}>{seo.tjansterIntro}</p></Reveal>}
            <div className="feat-list" style={{ marginTop: 0 }}>
              {paket.map((item: { name: string; features: string[] }, index: number) => (
                <Reveal key={item.name} delay={index * 0.05}>
                  <div className="feat-row">
                    <span className="feat-num">{String(index + 1).padStart(2, "0")}</span>
                    <span className="feat-title">{item.name}</span>
                    <span className="feat-body">{item.features.slice(0, 3).join(" · ")}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Link to="/priser" className="btn btn-ghost" style={{ marginTop: 28 }}>Se upplägg och priser <span className="a"><ArrowRight size={14} /></span></Link>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <Reveal><div className="meta-label">Så arbetar vi</div></Reveal>
              <Reveal delay={0.1}><h2 className="h2">Mindre presentation. <span className="it">Mer fungerande produkt.</span></h2></Reveal>
            </div>
            <Reveal><p className="lead">{city.comparison}</p></Reveal>
            {city.caseNote && <Reveal delay={0.1}><div className="surface surface-pad" style={{ marginTop: 32, maxWidth: 720 }}><p className="body">{city.caseNote}</p><Link to="/arbete" className="text-link" style={{ marginTop: 14, display: "inline-block" }}>Se vårt arbete →</Link></div></Reveal>}
          </div>
        </section>

        {!!city.faqs?.length && <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <Reveal><div className="meta-label">Vanliga frågor</div></Reveal>
              <Reveal delay={0.1}><h2 className="h2">FAQ — <span className="it">{label}.</span></h2></Reveal>
            </div>
            {city.faqs.map((item: { q: string; a: string }) => <details key={item.q} className="faq-row"><summary>{item.q}</summary><p>{item.a}</p></details>)}
          </div>
        </section>}

        <section className="section">
          <div className="wrap">
            <div className="meta-label">Läs vidare</div>
            <nav style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8 }} aria-label="Relaterade sidor">
              {isSupportedLocalPage && <Link to={alternativePath} className="pill">{alternativeLabel} →</Link>}
              <Link to="/ai-karta" className="pill">Kostnadsfri AI-karta →</Link>
              <Link to="/arbete" className="pill">Vårt arbete →</Link>
              <Link to="/priser" className="pill">Priser →</Link>
              <Link to="/blogg" className="pill">Guider →</Link>
            </nav>
          </div>
        </section>

        <section className="cta-band">
          <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
            <div className="meta-label">Nästa steg</div>
            <h2 className="h2" style={{ marginTop: 18 }}>Visa oss processen som tar <span className="it">onödig tid.</span></h2>
            <p className="lead" style={{ marginTop: 22 }}>Ni får en rak bedömning av ett rimligt första steg.</p>
            <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span></button>
          </div>
        </section>
      </div>
    </NordicLayout>
  );
}
