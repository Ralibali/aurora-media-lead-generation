import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { Check } from "lucide-react";
import { getCity, cities } from "@/lib/cityContent";
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
  const city = slug ? getCity(slug) : undefined;
  const { open } = useContactModal();

  useEffect(() => {
    if (!city) return;
    const path = `/saas-utveckling-${city.slug}`;
    const title = `AI-byrå i ${city.city} – bygger SaaS från 14 900 kr | Aurora Media`;
    const description = `SaaS-utveckling i ${city.city} med AI-kodning. Prototyp på 3–5 dagar, MVP på 2 veckor, full SaaS på 4 veckor. Fast pris från 14 900 kr.`;

    setSEOMeta({
      title,
      description,
      canonical: path,
      ogType: "website",
    });

    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: `AI-byrå ${city.city}`, url: path },
    ]);

    setJsonLd("city-localbusiness", {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}${path}#service`,
      name: `Aurora Media AB – AI-byrå i ${city.city}`,
      description,
      url: `${SITE_URL}${path}`,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: {
        "@type": "City",
        name: city.city,
        containedInPlace: { "@type": "AdministrativeArea", name: city.region },
      },
      priceRange: "14900-89000 SEK",
      makesOffer: paket.map((p) => ({
        "@type": "Offer",
        name: p.name,
        price: String(p.priceNum ?? p.price).replace(/\D/g, ""),
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
  }, [city]);

  if (!slug) return <Navigate to="/" replace />;
  if (!city) return <Navigate to="/404" replace />;

  const otherCities = cities.filter((c) => c.slug !== city.slug).slice(0, 5);

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
              <span className="text-foreground">AI-byrå {city.city}</span>
            </nav>
            <p className="label-caps">AI-byrå · {city.city}</p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05]">
              AI-byrå i {city.city} –{" "}
              <em className="italic text-primary">bygger SaaS på veckor från 14 900 kr</em>
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
              Varför anlita en AI-byrå i {city.city}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{city.localContext}</p>
          </div>
        </section>

        {/* Tjänster / paket */}
        <section className="border-t border-border py-20 bg-secondary/30">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="font-serif text-3xl md:text-4xl mb-10">
              Mina tjänster i {city.city}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {paket.map((p) => (
                <div key={p.name} className="rounded-xl border border-border bg-background p-6">
                  <p className="label-caps">{p.name}</p>
                  <p className="mt-3 font-serif text-2xl">{p.price}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                  {p.bullets && (
                    <ul className="mt-4 space-y-2 text-sm">
                      {p.bullets.slice(0, 4).map((b: string) => (
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
              FAQ om SaaS-utveckling i {city.city}
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

        {/* Andra städer */}
        <section className="border-t border-border py-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <p className="label-caps mb-4">Också aktiv i</p>
            <div className="flex flex-wrap gap-3">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  to={`/saas-utveckling-${c.slug}`}
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
