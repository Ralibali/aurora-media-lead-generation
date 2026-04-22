import { useEffect } from "react";
import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { Check } from "lucide-react";
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

const CityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { pathname } = useLocation();
  const city = slug ? getCity(slug) : undefined;
  const seo = slug ? getCitySeo(slug) : undefined;
  const { open } = useContactModal();

  // Two routes share this component – differentiate SEO copy.
  const isAiVariant = pathname.startsWith("/ai-byra-");
  const path = isAiVariant ? `/ai-byra-${slug}` : `/saas-utveckling-${slug}`;

  useEffect(() => {
    if (!city || !seo) return;
    const title = isAiVariant ? seo.metaTitleAI : seo.metaTitleSaaS;
    const description = isAiVariant ? seo.metaDescAI : seo.metaDescSaaS;
    const breadcrumbLabel = isAiVariant
      ? `AI-byrå ${city.city}`
      : `SaaS-utveckling ${city.city}`;

    setSEOMeta({
      title,
      description,
      canonical: path,
      ogType: "website",
    });

    // Keyword meta (low SEO weight, but useful for SERP previews/audits).
    const kwMeta = document.head.querySelector<HTMLMetaElement>(
      'meta[name="keywords"]',
    );
    if (kwMeta) kwMeta.content = seo.keywords.join(", ");
    else {
      const m = document.createElement("meta");
      m.name = "keywords";
      m.content = seo.keywords.join(", ");
      document.head.appendChild(m);
    }

    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: breadcrumbLabel, url: path },
    ]);

    setJsonLd("city-localbusiness", {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}${path}#service`,
      name: `Aurora Media AB – ${breadcrumbLabel}`,
      description,
      url: `${SITE_URL}${path}`,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: {
        "@type": "City",
        name: city.city,
        containedInPlace: { "@type": "AdministrativeArea", name: city.region },
      },
      priceRange: "14900-89000 SEK",
      knowsAbout: seo.keywords,
      makesOffer: paket.map((p) => ({
        "@type": "Offer",
        name: p.name,
        price: p.price.replace(/\D/g, "") || "0",
        priceCurrency: "SEK",
      })),
    });

    setJsonLd("city-faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: city.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });

    setJsonLd("city-organization", organizationSchema);

    return () => {
      removeJsonLd("city-localbusiness");
      removeJsonLd("city-faq");
      removeJsonLd("city-organization");
      removeJsonLd("breadcrumb-jsonld");
    };
  }, [city, seo, isAiVariant, path]);

  if (!slug) return <Navigate to="/" replace />;
  if (!city || !seo) return <Navigate to="/404" replace />;

  const otherCities = cities.filter((c) => c.slug !== city.slug).slice(0, 5);
  const breadcrumbLabel = isAiVariant
    ? `AI-byrå ${city.city}`
    : `SaaS-utveckling ${city.city}`;
  // Cross-link to the other variant for the same city.
  const altPath = isAiVariant
    ? `/saas-utveckling-${city.slug}`
    : `/ai-byra-${city.slug}`;
  const altLabel = isAiVariant
    ? `Se SaaS-utveckling i ${city.city}`
    : `Se AI-byrå-tjänster i ${city.city}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <nav aria-label="Brödsmulor" className="text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-foreground">Hem</Link>
              <span className="mx-2">›</span>
              <span className="text-foreground">{breadcrumbLabel}</span>
            </nav>
            <p className="label-caps">{breadcrumbLabel}</p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05]">
              {seo.h1Pre}{" "}
              <em className="italic text-primary">{seo.h1Em}</em>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">{city.intro}</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => open()}>Starta ett projekt</Button>
              <a
                href="mailto:info@auroramedia.se"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm hover:bg-secondary transition-colors"
              >
                info@auroramedia.se
              </a>
            </div>
          </div>
        </section>

        {/* Lokal kontext */}
        <section className="border-t border-border py-20">
          <div className="container mx-auto px-6 max-w-3xl space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl">
              {isAiVariant
                ? `Varför välja en AI-byrå i ${city.city}`
                : `Därför funkar SaaS-utveckling i ${city.city}`}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{city.localContext}</p>
          </div>
        </section>

        {/* Tjänster / paket */}
        <section className="border-t border-border py-20 bg-secondary/30">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="font-serif text-3xl md:text-4xl">
              Tjänster för företag i {city.city}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">{seo.tjansterIntro}</p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {paket.map((p) => (
                <div key={p.name} className="rounded-xl border border-border bg-background p-6">
                  <p className="label-caps">{p.name}</p>
                  <p className="mt-3 font-serif text-2xl">{p.price}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  {p.features && (
                    <ul className="mt-4 space-y-2 text-sm">
                      {p.features.slice(0, 4).map((b: string) => (
                        <li key={b} className="flex gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/priser" className="text-sm underline hover:text-primary">
                Se alla paket och vad som ingår →
              </Link>
            </div>
          </div>
        </section>

        {/* Jämförelse */}
        <section className="border-t border-border py-20">
          <div className="container mx-auto px-6 max-w-3xl space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl">
              Så skiljer jag mig från traditionella byråer i {city.city}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{city.comparison}</p>
            {city.caseNote && (
              <div className="mt-8 rounded-xl border border-border bg-secondary/40 p-6">
                <p className="label-caps mb-2">Lokalt case</p>
                <p className="text-sm">{city.caseNote}</p>
                <Link to="/arbete" className="mt-3 inline-block text-sm underline hover:text-primary">
                  Se hela portföljen →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border py-20 bg-secondary/30">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="font-serif text-3xl md:text-4xl mb-10">
              FAQ – {breadcrumbLabel}
            </h2>
            <div className="space-y-4">
              {city.faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-border bg-background p-6"
                >
                  <summary className="cursor-pointer font-medium list-none flex justify-between items-start gap-4">
                    <span>{f.q}</span>
                    <span className="text-primary group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Internlänkar – tjänster + auktoritetssidor */}
        <section className="border-t border-border py-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <p className="label-caps mb-4">Relaterat för {city.city}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              <li>
                <Link to={altPath} className="text-sm underline hover:text-primary">
                  {altLabel} →
                </Link>
              </li>
              <li>
                <Link to="/priser" className="text-sm underline hover:text-primary">
                  Priser & paket från 14 900 kr →
                </Link>
              </li>
              <li>
                <Link to="/arbete" className="text-sm underline hover:text-primary">
                  Cases & portfölj →
                </Link>
              </li>
              <li>
                <Link to="/metodik" className="text-sm underline hover:text-primary">
                  Vår AI-metodik →
                </Link>
              </li>
              {city.slug === "linkoping" && (
                <li>
                  <Link to="/webbbyra-linkoping" className="text-sm underline hover:text-primary">
                    Webbyrå Linköping →
                  </Link>
                </li>
              )}
              <li>
                <Link to="/artiklar" className="text-sm underline hover:text-primary">
                  Artiklar om SaaS & AI →
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* Andra städer */}
        <section className="border-t border-border py-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <p className="label-caps mb-4">Också aktiv i</p>
            <div className="flex flex-wrap gap-3">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  to={isAiVariant ? `/ai-byra-${c.slug}` : `/saas-utveckling-${c.slug}`}
                  className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors"
                >
                  {c.city}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default CityPage;
