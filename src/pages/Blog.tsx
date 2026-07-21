import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import NordicLayout from "@/components/nordic/NordicLayout";
import { articles } from "@/lib/articles";
import { setSEOMeta, setJsonLd, setBreadcrumb, SITE_URL } from "@/lib/seoHelpers";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("sv-SE", { year: "numeric", month: "short", day: "numeric" });

const Blog = () => {
  const [featured, ...rest] = articles;

  useEffect(() => {
    setSEOMeta({
      title: "Artiklar om AI och SaaS-utveckling | Aurora Media",
      description:
        "Konkreta guider om AI-kodning, SaaS-arkitektur, MVP:er och interna verktyg — skrivna från verkliga projekt.",
      canonical: "/blogg",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Blogg", url: "/blogg" }]);
    setJsonLd("blog-collection-jsonld", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Blogg – Aurora Media",
      url: `${SITE_URL}/blogg`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: articles.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/blogg/${a.slug}`,
          name: a.title,
        })),
      },
    });
  }, []);

  return (
    <NordicLayout>
      <main id="main">
        {/* Hero */}
        <section className="section-pad" style={{ paddingTop: "clamp(120px,14vw,160px)" }}>
          <div className="wrap">
            <p className="mono" style={{ marginBottom: 20 }}>
              blogg · {articles.length} artiklar
            </p>
            <h1 className="hero-line" style={{ maxWidth: 760, marginBottom: 18 }}>
              Artiklar som gör <span className="it">idéer till produkter.</span>
            </h1>
            <p className="lead">
              Raka guider om AI-kodning, SaaS, MVP:er och interna verktyg — skrivna från verkliga projekt.
            </p>
          </div>
        </section>

        {/* Featured */}
        {featured && (
          <section className="section-pad-sm divide-top">
            <div className="wrap">
              <p className="kicker" style={{ marginBottom: 18 }}>rekommenderad läsning</p>
              <Link to={`/blogg/${featured.slug}`} className="surface surface-pad">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="chip">{featured.category}</span>
                    <span className="chip chip-mute">{featured.readMinutes} min</span>
                    <span className="chip chip-mute">{formatDate(featured.publishedDate)}</span>
                  </div>
                  <ArrowUpRight size={18} style={{ color: "var(--bone-faint)" }} />
                </div>
                <h2 className="h2" style={{ marginBottom: 14 }}>{featured.title}</h2>
                <p className="body" style={{ maxWidth: 620 }}>{featured.intro}</p>
                <div style={{ marginTop: 24, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
                  {featured.sections.slice(0, 4).map((s, i) => (
                    <div key={s.heading} style={{ padding: "12px 14px", border: "1px solid var(--hair)", borderRadius: 6 }}>
                      <p className="mono" style={{ color: "var(--bone-mute)", marginBottom: 6 }}>0{i + 1}</p>
                      <p style={{ fontSize: 13, color: "var(--bone-soft)", lineHeight: 1.5 }}>{s.heading}</p>
                    </div>
                  ))}
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Article list */}
        <section className="section-pad-sm">
          <div className="wrap">
            <p className="kicker" style={{ marginBottom: 24 }}>alla artiklar</p>
            {rest.map((a) => (
              <Link key={a.slug} to={`/blogg/${a.slug}`} className="list-row">
                <span className="mono" style={{ color: "var(--bone-mute)" }}>{formatDate(a.publishedDate)}</span>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <span className="chip">{a.category}</span>
                    <span className="chip chip-mute">{a.readMinutes} min</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(15px,1.4vw,17px)", color: "var(--bone)", lineHeight: 1.3, letterSpacing: "-0.01em" }}>{a.title}</p>
                </div>
                <span className="arr">↗</span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-band">
          <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
            <p className="mono" style={{ marginBottom: 18 }}>nästa steg</p>
            <h2 className="h2" style={{ marginBottom: 14, maxWidth: 720 }}>
              Har ni en idé som <span className="it">behöver bli verklig?</span>
            </h2>
            <p className="lead" style={{ marginBottom: 28 }}>
              Prototyp från 4 900 kr. Fast pris, kod ni äger.
            </p>
            <Link to="/kontakt" className="btn btn-moss">
              Begär offert <span className="a">→</span>
            </Link>
          </div>
        </section>
      </main>
    </NordicLayout>
  );
};

export default Blog;
