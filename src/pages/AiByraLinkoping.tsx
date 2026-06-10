import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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

const FAQS = [
  {
    q: "Vad kostar en AI-byrå?",
    a: "Hos Aurora Media är priserna fasta: prototyp 14 900 kr, MVP 34 900 kr och skalbar SaaS 89 000 kr. Större skräddarsydda projekt offereras separat men alltid med fast pris. Ingen timdebitering, inga överraskningar.",
  },
  {
    q: "Hur lång tid tar ett AI-projekt?",
    a: "Prototyp: 3–5 dagar. MVP: 1–2 veckor. Skalbar SaaS: 3–4 veckor. AI-automationer för enskilda flöden kan vara live på under en vecka. Vi använder AI-kodning för att korta utvecklingstiden – inte för att kvaliteten ska sjunka.",
  },
  {
    q: "Äger jag koden?",
    a: "Ja, alltid. Du får full källkod, GitHub-tillgång och dokumentation från dag ett. Inga konstiga licensavtal eller lock-ins. Du kan ta över utveckling internt eller byta partner när du vill.",
  },
  {
    q: "Vad är skillnaden mot en vanlig webbyrå?",
    a: "En vanlig webbyrå bygger oftast WordPress-sajter på timdebitering. Vi bygger fullstack-produkter – SaaS, interna verktyg, AI-integrationer – med React, TypeScript och Supabase. Fast pris, modern stack, snabbare leverans.",
  },
  {
    q: "Jobbar ni bara i Linköping?",
    a: "Nej. Vi är baserade i Linköping och tar fysiska möten i Östergötland, men hälften av kunderna finns i Stockholm, Göteborg och övriga Sverige. Video-möten räcker för 90 procent av projekten.",
  },
  {
    q: "Vilka AI-verktyg använder ni?",
    a: "I utvecklingen: Lovable, Bolt, Cursor, Claude och GPT. I produkterna vi bygger: OpenAI, Anthropic, Gemini, Mistral och ElevenLabs beroende på behov. Vi är leverantörsoberoende och väljer rätt modell per use-case.",
  },
];

const SERVICES = [
  {
    title: "AI-automationer",
    desc: "Vi ersätter manuella Excel-flöden, mejlhantering och dataregistrering med AI-drivna arbetsflöden. Spar 10–40 timmar i veckan per team.",
  },
  {
    title: "SaaS-utveckling",
    desc: "Bygger SaaS-produkter med login, betalningar, multi-tenancy och allt däremellan. Lanseras på 2–4 veckor istället för 6 månader.",
  },
  {
    title: "MVP för startups",
    desc: "Validera er idé snabbt och billigt. MVP med riktiga användare på två veckor för 34 900 kr fast pris.",
  },
  {
    title: "Interna verktyg",
    desc: "Skräddarsydda dashboards, admin-paneler och CRUD-appar för era interna processer. Ersätter dyra SaaS-abonnemang.",
  },
  {
    title: "AI-integrationer",
    desc: "Koppla OpenAI, Anthropic eller open-source-modeller till era befintliga system. Chatbottar, classifiers, content-generering, RAG.",
  },
  {
    title: "Fortnox- och Visma-integrationer",
    desc: "Vi har byggt API-integrationer mot alla större svenska ekonomisystem. Inga manuella export-importflöden längre.",
  },
];

const CASES = [
  {
    name: "Aurora Transport",
    desc: "Komplett dispatch- och fakturasystem för svenska åkerier. Schemaläggning, körorder, Fortnox-export, Stripe. Byggd från noll på under två veckor.",
    href: "/arbete/aurora-transport",
  },
  {
    name: "Hönsgården",
    desc: "Freemium-app för svenska hönsägare. Webb plus Android-app via Capacitor. Lanserad på en vecka.",
    href: "/arbete/honsgarden",
  },
  {
    name: "Viriditas",
    desc: "Bokningssajt för massagemottagning i Linköping. Lokal kund, levererad på några dagar.",
    href: "/arbete/viriditas",
  },
];

const PROCESS = [
  { n: "01", title: "Kostnadsfri rådgivning", desc: "30 min där vi går igenom affärsbehov, mål och teknisk situation. Du får konkret återkoppling – inte säljsnack." },
  { n: "02", title: "Offert och scope", desc: "Inom 24 timmar får du fast pris, leveransplan och tydligt scope. Inga dolda kostnader." },
  { n: "03", title: "Bygg med daglig avstämning", desc: "Vi bygger med dig i loopen – inte i månadslånga svarta lådor. Du ser progress dagligen i preview-länkar." },
  { n: "04", title: "Lansering och överlämning", desc: "Du får produktion, källkod, dokumentation och 30 dagars buggfri-garanti. Sedan kan du köra själv eller teckna underhåll." },
];

const AiByraLinkoping = () => {
  const { open } = useContactModal();
  const PAGE_URL = `${SITE_URL}/ai-byra-linkoping`;

  useEffect(() => {
    setSEOMeta({
      title: "AI-byrå i Linköping | Fast pris från 14 900 kr – Aurora Media",
      description:
        "AI-byrå i Linköping som bygger SaaS, AI-automationer och interna verktyg. Fast pris från 14 900 kr. Leverans på veckor, kod du äger.",
      canonical: "/ai-byra-linkoping",
      keywords:
        "AI-byrå Linköping, AI-byrå, AI-konsult Linköping, AI-automation Linköping, SaaS Linköping",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "AI-byrå i Linköping", url: "/ai-byra-linkoping" },
    ]);

    setJsonLd("ai-byra-linkoping-org", organizationSchema);

    setJsonLd("ai-byra-linkoping-service", {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${PAGE_URL}#service`,
      name: "Aurora Media – AI-byrå i Linköping",
      description:
        "AI-byrå i Linköping som bygger SaaS, AI-automationer och interna verktyg åt svenska företag.",
      url: PAGE_URL,
      image: `${SITE_URL}/og-image-sv.jpg`,
      priceRange: "14900-89000 SEK",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Linköping",
        addressRegion: "Östergötlands län",
        addressCountry: "SE",
      },
      geo: { "@type": "GeoCoordinates", latitude: 58.4108, longitude: 15.6214 },
      areaServed: { "@type": "City", name: "Linköping" },
      makesOffer: [
        { "@type": "Offer", name: "Prototyp", price: "14900", priceCurrency: "SEK" },
        { "@type": "Offer", name: "MVP", price: "34900", priceCurrency: "SEK" },
        { "@type": "Offer", name: "Skalbar SaaS", price: "89000", priceCurrency: "SEK" },
      ],
    });

    setJsonLd("ai-byra-linkoping-faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });

    return () => {
      removeJsonLd("ai-byra-linkoping-org");
      removeJsonLd("ai-byra-linkoping-service");
      removeJsonLd("ai-byra-linkoping-faq");
      removeJsonLd("breadcrumb-jsonld");
    };
  }, [PAGE_URL]);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal>
            <p className="mono">ai-byrå · linköping · östergötland</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1
              className="hero-line"
              style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "20ch" }}
            >
              AI-byrå i Linköping – från idé till{" "}
              <span className="it">färdig produkt.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>
              Vi bygger SaaS, AI-automationer och interna verktyg åt svenska företag. Fast pris från
              14 900 kr. Leverans på veckor – inte månader. Baserade i Linköping, jobbar med kunder i
              hela Sverige.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => open()} className="btn btn-moss">
                Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
              </button>
              <Link to="/priser" className="btn btn-ghost">Se priser</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Vad gör en AI-byrå */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Introduktion</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Vad en AI-byrå <span className="it">faktiskt</span> gör.</h2>
            </Reveal>
          </div>
          <div style={{ display: "grid", gap: "clamp(18px,2.4vw,28px)", maxWidth: 800 }}>
            <Reveal>
              <p className="lead">
                En AI-byrå hjälper företag att gå från "vi borde göra något med AI" till
                fungerande produkter och processer. Inte powerpoints. Inte tre månader workshop.
                Fungerande produkter.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="body">
                Aurora Media är en AI-driven mjukvarubyrå i Linköping. Vi bygger SaaS-produkter,
                AI-automationer och interna verktyg åt svenska bolag. Skillnaden mot en traditionell
                byrå är att vi använder AI-kodning som Lovable, Bolt, Cursor och Claude i själva
                utvecklingen. Det betyder att en MVP som tidigare kostade 400 000 kr och tog sex
                månader nu kan levereras för 34 900 kr på två veckor.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="body">
                Vi har levererat sju egna SaaS-produkter och kundprojekt åt bolag i Östergötland,
                Stockholm och Göteborg. Allt med fast pris, modern stack (React, TypeScript,
                Supabase) och kod som du äger från dag ett.
              </p>
            </Reveal>
          </div>
          <div style={{ marginTop: 32 }}>
            <button onClick={() => open()} className="btn btn-ghost">
              Diskutera ert projekt <span className="a"><ArrowRight size={14} /></span>
            </button>
          </div>
        </div>
      </section>

      {/* Tjänster */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Tjänster</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Det vi <span className="it">levererar</span> som AI-byrå.</h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {SERVICES.map((s, i) => (
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
              Boka rådgivning <span className="a"><ArrowRight size={14} /></span>
            </button>
          </div>
        </div>
      </section>

      {/* Lokalt */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Lokal förankring</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Baserade i <span className="it">Linköping.</span></h2>
            </Reveal>
          </div>
          <div style={{ display: "grid", gap: "clamp(18px,2.4vw,28px)", maxWidth: 800 }}>
            <Reveal>
              <p className="lead">
                Aurora Media drivs från Linköping. Vi tar fysiska möten i centrala Linköping eller på
                Mjärdevi Science Park. För bolag i Norrköping, Motala, Mjölby och övriga
                Östergötland är vi 30–60 minuter bort.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="body">
                Linköpings tech-kluster runt Saab, Ericsson, Sectra, LiU och Mjärdevi gör staden till
                en av Sveriges tätaste per capita. Många bolag här har dragits med dyra
                konsultarvoden (1 500–2 000 kr/h) och långa projekt. Vi erbjuder ett rakare
                alternativ: fast pris, snabb leverans, modern stack.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="body">
                För kunder utanför Östergötland (Stockholm, Göteborg, Malmö) räcker video-möten i
                90 procent av fallen. Geografin spelar mindre roll när hela arbetet sker i preview-länkar
                och GitHub.
              </p>
            </Reveal>
          </div>
          <div style={{ marginTop: 32 }}>
            <a href="mailto:info@auroramedia.se" className="btn btn-ghost">
              Maila info@auroramedia.se <span className="a"><ArrowRight size={14} /></span>
            </a>
          </div>
        </div>
      </section>

      {/* Priser */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Priser</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Fast pris – <span className="it">ingen timdebitering.</span></h2>
            </Reveal>
          </div>
          <div className="feat-list">
            <Reveal>
              <div className="feat-row">
                <span className="feat-num">01</span>
                <span className="feat-title">Prototyp – 14 900 kr</span>
                <span className="feat-body">Klickbar prototyp på 3–5 dagar. För att testa konceptet innan större investering.</span>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="feat-row">
                <span className="feat-num">02</span>
                <span className="feat-title">MVP – 34 900 kr</span>
                <span className="feat-body">Lanseringsklar produkt på 2 veckor. Login, databas, betalningar och en huvudintegration.</span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="feat-row">
                <span className="feat-num">03</span>
                <span className="feat-title">Skalbar SaaS – 89 000 kr</span>
                <span className="feat-body">Full SaaS på 3–4 veckor. Multi-tenant, roller, admin, AI-integrationer.</span>
              </div>
            </Reveal>
          </div>
          <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/priser" className="btn btn-ghost">Se alla paket</Link>
            <button onClick={() => open()} className="btn btn-moss">
              Begär offert <span className="a"><ArrowRight size={14} /></span>
            </button>
          </div>
        </div>
      </section>

      {/* Case */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Case</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Produkter vi <span className="it">byggt.</span></h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {CASES.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.05}>
                <div className="feat-row">
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-title">{c.name}</span>
                  <span className="feat-body">
                    {c.desc} <Link to={c.href} className="text-link">Läs mer →</Link>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <Link to="/arbete" className="btn btn-ghost">
              Se alla projekt <span className="a"><ArrowRight size={14} /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Process</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Hur vi <span className="it">jobbar.</span></h2>
            </Reveal>
          </div>
          <div className="proc-grid">
            {PROCESS.map((p) => (
              <div className="proc-step" key={p.n}>
                <span className="proc-num">{p.n}</span>
                <h3 className="proc-name">{p.title}</h3>
                <p className="body">{p.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <button onClick={() => open()} className="btn btn-moss">
              Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Vanliga frågor</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">AI-byrå i Linköping – <span className="it">FAQ.</span></h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {FAQS.map((f, i) => (
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

      {/* Relaterat */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Relaterade sidor</div></Reveal>
            <Reveal delay={0.1}><h2 className="h2">Läs vidare.</h2></Reveal>
          </div>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: 8 }} aria-label="Relaterade sidor">
            {[
              { to: "/webbyra-linkoping", label: "Webbyrå Linköping" },
              { to: "/ai-konsult-sverige", label: "AI-konsult Sverige" },
              { to: "/ai-automation-foretag", label: "AI-automation för företag" },
              { to: "/saas-utveckling-linkoping", label: "SaaS-utveckling Linköping" },
              { to: "/ai-byra-norrkoping", label: "AI-byrå Norrköping" },
              { to: "/ai-byra-stockholm", label: "AI-byrå Stockholm" },
              { to: "/priser", label: "Priser & paket" },
              { to: "/arbete", label: "Vårt arbete" },
              { to: "/blogg", label: "Blogg" },
            ].map((r) => (
              <Link key={r.to} to={r.to} className="pill">{r.label} →</Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Nästa steg</div>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Redo att <span className="it">börja?</span>
          </h2>
          <p className="lead" style={{ marginTop: 22 }}>
            Berätta vad du vill bygga. Offert med fast pris inom 24 timmar.
          </p>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
};

export default AiByraLinkoping;
