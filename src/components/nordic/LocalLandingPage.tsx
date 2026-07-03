import { useEffect } from "react";
import { ArrowRight, Check, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import {
  setSEOMeta,
  setBreadcrumb,
  setJsonLd,
  removeJsonLd,
  organizationSchema,
  SITE_URL,
} from "@/lib/seoHelpers";

export interface LocalLandingPageProps {
  slug: string; // e.g. "digital-marknadsforing-linkoping"
  metaTitle: string;
  metaDesc: string;
  keywords: string;
  crumbLabel: string;
  eyebrow: string; // mono line
  h1: string;
  h1Italic?: string;
  lead: string;
  serviceType: string[];
  problems: { n: string; title: string; desc: string }[];
  services: { title: string; desc: string }[];
  bulletTitle?: string;
  bullets?: string[];
  faqs: { q: string; a: string }[];
  relatedLinks: { label: string; to: string; desc: string }[];
  ctaTitle?: string;
  ctaLead?: string;
}

const LocalLandingPage = ({
  slug,
  metaTitle,
  metaDesc,
  keywords,
  crumbLabel,
  eyebrow,
  h1,
  h1Italic,
  lead,
  serviceType,
  problems,
  services,
  bulletTitle = "Så jobbar vi",
  bullets = [
    "Tydligt scope och fast pris innan start",
    "Lokal kontakt i Linköping – fysiska möten på plats vid behov",
    "Modern standardteknik – ingen leverantörslåsning",
    "Kod, dokumentation och konton lämnas över enligt avtal",
  ],
  faqs,
  relatedLinks,
  ctaTitle = "Berätta om er situation",
  ctaLead = "Boka en kostnadsfri 30-minuters rådgivning. Vi säger till om vi är rätt eller fel för uppdraget.",
}: LocalLandingPageProps) => {
  const { open } = useContactModal();
  const pageUrl = `${SITE_URL}/${slug}`;

  useEffect(() => {
    setSEOMeta({
      title: metaTitle,
      description: metaDesc,
      canonical: `/${slug}`,
      keywords,
    });

    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: crumbLabel, url: `/${slug}` },
    ]);

    setJsonLd(`${slug}-org`, organizationSchema);
    setJsonLd(`${slug}-service`, {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${pageUrl}#service`,
      name: metaTitle,
      description: metaDesc,
      url: pageUrl,
      image: `${SITE_URL}/og-image-sv.jpg`,
      email: "info@auroramedia.se",
      priceRange: "14900-89000+ SEK",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Linköping",
        addressRegion: "Östergötlands län",
        addressCountry: "SE",
      },
      geo: { "@type": "GeoCoordinates", latitude: 58.4108, longitude: 15.6214 },
      areaServed: [
        { "@type": "City", name: "Linköping" },
        { "@type": "AdministrativeArea", name: "Östergötland" },
      ],
      serviceType,
    });

    setJsonLd(`${slug}-faq`, {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });

    return () => {
      removeJsonLd(`${slug}-org`);
      removeJsonLd(`${slug}-service`);
      removeJsonLd(`${slug}-faq`);
      removeJsonLd("breadcrumb-jsonld");
    };
  }, [slug, pageUrl, metaTitle, metaDesc, keywords, crumbLabel, serviceType, faqs]);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "clamp(36px,7vw,96px)",
              alignItems: "center",
            }}
          >
            <div>
              <Reveal>
                <p className="mono">{eyebrow}</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1
                  className="hero-line"
                  style={{ marginTop: 18, fontSize: "clamp(2.2rem,5.4vw,4.6rem)", maxWidth: "17ch" }}
                >
                  {h1}{" "}
                  {h1Italic && <span className="it">{h1Italic}</span>}
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="lead" style={{ marginTop: 24, maxWidth: "62ch" }}>{lead}</p>
              </Reveal>
              <Reveal delay={0.3}>
                <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={() => open()} className="btn btn-moss">
                    Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
                  </button>
                  <Link to="/ai-karta" className="btn btn-ghost">
                    Gör AI-kartläggningen
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.18}>
              <aside
                style={{
                  border: "1px solid var(--hair)",
                  borderRadius: 12,
                  padding: "clamp(24px,4vw,42px)",
                  background: "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.018))",
                }}
              >
                <div className="meta-label">Lokalt i Linköping</div>
                <h2 className="h3" style={{ marginTop: 18 }}>Aurora Media AB</h2>
                <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <MapPin size={18} style={{ flex: "0 0 auto", marginTop: 2 }} />
                    <p className="body">Drivs från Linköping. Fysiska möten i Linköpingsområdet efter överenskommelse.</p>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <ShieldCheck size={18} style={{ flex: "0 0 auto", marginTop: 2 }} />
                    <p className="body">Svenskt aktiebolag · Org.nr 559272-0220 · Kod och dokumentation enligt avtal.</p>
                  </div>
                </div>
                <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--hair)" }}>
                  <a href="mailto:info@auroramedia.se" className="text-link">info@auroramedia.se →</a>
                </div>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Vanliga utmaningar</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Vad vi hör från företag <span className="it">i Östergötland.</span></h2>
            </Reveal>
          </div>
          <div className="work-grid">
            {problems.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.05}>
                <article className="work-card" style={{ height: "100%" }}>
                  <div className="meta-label">{p.n}</div>
                  <h3 style={{ marginTop: 18 }}>{p.title}</h3>
                  <p className="body" style={{ marginTop: 12 }}>{p.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Det här levererar vi</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Konkret arbete – <span className="it">inte powerpoints.</span></h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.04}>
                <div className="feat-row">
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-title">{s.title}</span>
                  <span className="feat-body">{s.desc}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <button onClick={() => open()} className="btn btn-moss">
              Beskriv ert projekt <span className="a"><ArrowRight size={14} /></span>
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div
            style={{
              border: "1px solid var(--hair)",
              borderRadius: 12,
              padding: "clamp(28px,5vw,60px)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "clamp(28px,5vw,72px)",
            }}
          >
            <div>
              <div className="meta-label">{bulletTitle}</div>
              <h2 className="h2" style={{ marginTop: 18 }}>Ni ska förstå <span className="it">vad ni köper.</span></h2>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {bullets.map((b) => (
                <div key={b} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Check size={18} style={{ flex: "0 0 auto", marginTop: 4 }} />
                  <p className="body">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Vanliga frågor</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Frågor från företag <span className="it">i Linköping.</span></h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.04}>
                <div className="feat-row">
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-title">{f.q}</span>
                  <span className="feat-body">{f.a}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Relaterat</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Läs vidare.</h2>
            </Reveal>
          </div>
          <div className="work-grid">
            {relatedLinks.map((l) => (
              <Link to={l.to} key={l.to} className="work-card">
                <div className="meta-label">{l.label}</div>
                <p className="body" style={{ marginTop: 12 }}>{l.desc}</p>
                <div className="url" style={{ marginTop: 18 }}>Läs mer →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ textAlign: "center" }}>
          <Reveal>
            <div className="meta-label" style={{ justifyContent: "center" }}>Nästa steg</div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="h2" style={{ marginTop: 18 }}>{ctaTitle}</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 22, maxWidth: "56ch", marginInline: "auto" }}>{ctaLead}</p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => open()} className="btn btn-moss">
                Boka rådgivning <span className="a"><ArrowRight size={14} /></span>
              </button>
              <Link to="/ai-karta" className="btn btn-ghost">Gör AI-kartläggningen</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </NordicLayout>
  );
};

export default LocalLandingPage;
