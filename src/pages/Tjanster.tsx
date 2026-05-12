import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const BORDER = "rgba(237, 233, 220, 0.15)";
const SectionBorder = () => <div style={{ height: "0.5px", backgroundColor: BORDER }} />;

const SERVICES = [
  {
    num: "01",
    name: "SaaS-produkt",
    price: "från 14 900 kr",
    time: "1–4 veckor",
    includes: [
      "Autentisering och användarhantering",
      "Betalningsflöde med Stripe",
      "Admin-panel och dashboards",
      "E-post och notifikationer",
      "Hosting och CI/CD-pipeline",
      "Dokumentation och kodöverlämning",
    ],
    desc: "Från MVP till lansering. Auth, betalning, e-post och admin från dag ett. Samma stack som vi använder på våra egna sex produkter.",
  },
  {
    num: "02",
    name: "Hemsida",
    price: "pris på offert",
    time: "1–2 veckor",
    includes: [
      "Modern React-arkitektur",
      "SEO-optimering från grunden",
      "CMS-integration om önskat",
      "Responsiv design för alla skärmar",
      "Google Analytics och sökkonsol",
      "Domän och hosting",
    ],
    desc: "Modern, snabb och SEO-optimerad. CMS som ni faktiskt vill använda. Byggt på samma grund som ni kan bygga vidare på.",
  },
  {
    num: "03",
    name: "Internt system",
    price: "pris på offert",
    time: "2–6 veckor",
    includes: [
      "Admin-paneler skräddarsydda för er",
      "Databasdesign och API-lager",
      "Rollbaserad åtkomst",
      "Rapporter och exportfunktioner",
      "Integration mot befintliga system",
      "Driftmiljö och backups",
    ],
    desc: "Admin-paneler, dashboards och flöden som ersätter era Excel-arkiv. Ni äger källkoden och kan bygga vidare.",
  },
  {
    num: "04",
    name: "AI-integration",
    price: "pris på offert",
    time: "1–3 veckor",
    includes: [
      "Språkmodell-integration (OpenAI, Anthropic m.fl.)",
      "Promptdesign och finjustering",
      "Agent-flöden och automatiseringar",
      "RAG och kunskapsbaser",
      "Säker hantering av API-nycklar",
      "Monitorering och loggning",
    ],
    desc: "Språkmodeller, agenter och automatiseringar in i era befintliga system. Byggda för att faktiskt fungera i produktion.",
  },
];

const Tjanster = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Tjänster — SaaS, hemsidor, interna system och AI | Aurora Media",
      description:
        "Vi bygger fyra saker snabbt: SaaS-produkter, hemsidor, interna system och AI-integrationer. Fast pris, fast deadline, kod ni äger.",
      canonical: "/tjanster",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">
        <section className="section-pad pt-[120px]">
          <div className="site-container">
            <p className="eyebrow mb-4">Tjänster</p>
            <h1 className="hero-h1 text-cream max-w-[560px]">
              Vi bygger fyra saker.{" "}
              <em>Snabbt.</em>
            </h1>
            <p className="mt-4 max-w-[460px] font-sans text-[14px] leading-relaxed" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
              Samma metodik som på våra egna sex produkter — moderna AI-verktyg, fast pris och fast
              deadline. Levereras på veckor.
            </p>
          </div>
        </section>

        {SERVICES.map((s, idx) => (
          <section key={s.num} className="section-pad">
            <SectionBorder />
            <div className="site-container pt-14">
              <div className="grid gap-10 sm:grid-cols-[1fr_1.4fr]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="mono-accent" style={{ color: "rgba(237, 233, 220, 0.40)" }}>{s.num}</span>
                    <span className="mono-accent" style={{ color: "rgba(237, 233, 220, 0.50)" }}>{s.price}</span>
                  </div>
                  <h2 className="section-h2 text-cream">{s.name}</h2>
                  <p className="mt-3 font-sans text-[14px] leading-relaxed" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
                    {s.desc}
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <span className="mono-accent" style={{ color: "rgba(237, 233, 220, 0.40)" }}>Tidsplan</span>
                    <span className="font-sans text-[13px] text-cream">{s.time}</span>
                  </div>

                  <div className="mt-6">
                    <Link
                      to="/kontakt"
                      className="inline-flex items-center rounded-lg px-[18px] py-[10px] font-sans text-[13px] font-medium transition-opacity hover:opacity-85"
                      style={{ backgroundColor: "#EDE9DC", color: "#100F0D" }}
                    >
                      Begär offert →
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-4">Vad ingår</p>
                  <div>
                    {s.includes.map((item, i) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 py-3"
                        style={{ borderBottom: i < s.includes.length - 1 ? `0.5px solid ${BORDER}` : "none" }}
                      >
                        <span className="mono-accent" style={{ color: "rgba(237, 233, 220, 0.30)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-sans text-[13px] text-cream">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="section-pad">
          <SectionBorder />
          <div className="site-container pt-14">
            <p className="eyebrow mb-4">Nästa steg</p>
            <h2 className="section-h2 text-cream mb-3">
              Har ni en idé eller en process som suger?
            </h2>
            <p className="max-w-[460px] font-sans text-[14px] leading-relaxed mb-8" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
              Skicka över den — vi återkommer med offert inom 24 timmar.
            </p>
            <Link
              to="/kontakt"
              className="inline-flex items-center rounded-lg px-[18px] py-[10px] font-sans text-[13px] font-medium transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#EDE9DC", color: "#100F0D" }}
            >
              Begär offert →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Tjanster;
