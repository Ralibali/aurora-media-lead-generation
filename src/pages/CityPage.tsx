import { useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { getCity, getCitySeo, cities } from "@/lib/cityContent";
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
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useContactModal();

  const isAiVariant = location.pathname.startsWith("/ai-byra-");
  const routeVariant = isAiVariant ? "ai-byra" : "saas-utveckling";

  const city = slug ? getCity(slug) : null;
  const seo = slug ? getCitySeo(slug) : null;
  const seoTitle = seo ? (isAiVariant ? seo.metaTitleAI : seo.metaTitleSaaS) : "";
  const seoDescription = seo ? (isAiVariant ? seo.metaDescAI : seo.metaDescSaaS) : "";

  useEffect(() => {
    if (!city || !seo || !slug) {
      navigate("/404", { replace: true });
      return;
    }

    setSEOMeta({
      title: seoTitle,
      description: seoDescription,
      canonical: `${SITE_URL}/${routeVariant}-${slug}`,
    });

    let metaKw = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (seo.keywords) {
      if (!metaKw) {
        metaKw = document.createElement("meta");
        metaKw.setAttribute("name", "keywords");
        document.head.appendChild(metaKw);
      }
      metaKw.setAttribute(
        "content",
        Array.isArray(seo.keywords) ? seo.keywords.join(", ") : seo.keywords,
      );
    }

    const breadcrumbLabel = isAiVariant
      ? `AI-byrå ${city.city}`
      : `SaaS-utveckling ${city.city}`;

    setBreadcrumb([
      { name: "Hem", url: SITE_URL },
      { name: breadcrumbLabel, url: `${SITE_URL}/${routeVariant}-${slug}` },
    ]);

    setJsonLd("city-localbusiness", {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/${routeVariant}-${slug}#service`,
      name: `Aurora Media – ${breadcrumbLabel}`,
      description: seoDescription,
      url: `${SITE_URL}/${routeVariant}-${slug}`,
      areaServed: { "@type": "City", name: city.city },
      makesOffer: paket.map((p: { name: string; price?: string }) => ({
        "@type": "Offer",
        name: p.name,
        priceCurrency: "SEK",
      })),
    });

    const faqItems = city.faqs ?? [];
    if (faqItems.length > 0) {
      setJsonLd("city-faq", {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item: { q: string; a: string }) => ({
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
    };
  }, [slug, city, seo, isAiVariant, routeVariant, navigate, seoTitle, seoDescription]);

  if (!city || !seo || !slug) return null;

  const breadcrumbLabel = isAiVariant
    ? `AI-byrå ${city.city}`
    : `SaaS-utveckling ${city.city}`;

  const altPath = isAiVariant
    ? `/saas-utveckling-${slug}`
    : `/ai-byra-${slug}`;
  const altLabel = isAiVariant
    ? `SaaS-utveckling i ${city.city}`
    : `AI-byrå i ${city.city}`;

  const otherCities = cities.filter((c) => c.slug !== slug).slice(0, 5);
  const faqItems: { q: string; a: string }[] = city.faqs ?? [];

  return (
    <NordicLayout>
      {/* Hero */}
      <section className="page-hero">
        <div className="wrap">
          <Reveal>
            <p className="mono">{(isAiVariant ? "ai-byrå" : "saas-utveckling")} · {city.city.toLowerCase()}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "20ch" }}>
              {seo.h1Pre} <span className="it">{seo.h1Em}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>{city.intro}</p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => open()} className="btn btn-moss">
                Starta projekt <span className="a"><ArrowRight size={14} /></span>
              </button>
              <a href="mailto:info@auroramedia.se" className="btn btn-ghost">Maila oss</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Lokal kontext */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Lokal kontext</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">
                {isAiVariant
                  ? <>AI-kompetens förankrad i <span className="it">{city.city}.</span></>
                  : <>SaaS-erfarenhet i <span className="it">{city.city}s marknad.</span></>}
              </h2>
            </Reveal>
          </div>
          <Reveal>
            <p className="lead">{city.localContext}</p>
          </Reveal>
        </div>
      </section>

      {/* Tjänster / paket */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Tjänster</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Tjänster för företag i <span className="it">{city.city}.</span></h2>
            </Reveal>
          </div>
          {seo.tjansterIntro && (
            <Reveal>
              <p className="body" style={{ marginBottom: "clamp(28px,4vw,48px)", maxWidth: "60ch" }}>
                {seo.tjansterIntro}
              </p>
            </Reveal>
          )}
          <div className="feat-list" style={{ marginTop: 0 }}>
            {paket.map((p: { name: string; features: string[] }, i: number) => (
              <Reveal key={p.name} delay={i * 0.05}>
                <div className="feat-row">
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-title">{p.name}</span>
                  <span className="feat-body">{p.features.slice(0, 3).join(" · ")}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link to="/priser" className="btn btn-ghost">
              Se fullständiga priser <span className="a"><ArrowRight size={14} /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Jämförelse */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Jämförelse</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Så <span className="it">skiljer</span> vi oss.</h2>
            </Reveal>
          </div>
          <Reveal>
            <p className="lead">{city.comparison}</p>
          </Reveal>
          {city.caseNote && (
            <Reveal delay={0.1}>
              <div style={{ marginTop: 32, padding: "clamp(20px,2.4vw,28px)", border: "1px solid var(--hair)", borderRadius: 8, maxWidth: 720 }}>
                <p className="body" style={{ marginBottom: 14 }}>{city.caseNote}</p>
                <Link to="/arbete" className="text-link" style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.08em" }}>
                  Se vårt arbete →
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <Reveal><div className="meta-label">Vanliga frågor</div></Reveal>
              <Reveal delay={0.1}>
                <h2 className="h2">FAQ — <span className="it">{breadcrumbLabel}.</span></h2>
              </Reveal>
            </div>
            <div className="feat-list">
              {faqItems.map((item, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="feat-row">
                    <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="feat-title">{item.q}</span>
                    <span className="feat-body">{item.a}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Internlänkar */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Relaterade sidor</div></Reveal>
            <Reveal delay={0.1}><h2 className="h2">Läs vidare.</h2></Reveal>
          </div>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: 8 }} aria-label="Internlänkar">
            {[
              { href: altPath, label: altLabel },
              { href: "/priser", label: "Priser" },
              { href: "/arbete", label: "Vårt arbete" },
              { href: "/metodik", label: "Metodik" },
              ...(slug === "linkoping" ? [{ href: "/webbyra-linkoping", label: "Webbyrå Linköping" }] : []),
              { href: "/blogg", label: "Blogg" },
            ].map(({ href, label }) => (
              <Link key={href} to={href} className="pill">{label} →</Link>
            ))}
          </nav>

          {otherCities.length > 0 && (
            <>
              <div className="meta-label" style={{ marginTop: 48, marginBottom: 16 }}>Andra städer</div>
              <nav style={{ display: "flex", flexWrap: "wrap", gap: 8 }} aria-label="Andra städer">
                {otherCities.map((c) => (
                  <Link key={c.slug} to={`/${routeVariant}-${c.slug}`} className="pill">
                    {isAiVariant ? `AI-byrå ${c.city}` : `SaaS-utveckling ${c.city}`} →
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Nästa steg</div>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Redo att <span className="it">börja?</span>
          </h2>
          <p className="lead" style={{ marginTop: 22 }}>Berätta om projektet — offert inom 24 timmar.</p>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Starta ett projekt <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
}
