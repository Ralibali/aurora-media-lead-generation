import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const SERVICES = [
  {
    num: "01", name: "SaaS-produkt", price: "från 14 900 kr", time: "1–4 veckor",
    desc: "Från MVP till lansering. Auth, betalning, e-post och admin från dag ett. Samma stack som vi använder på våra egna sex produkter.",
    includes: ["Autentisering och användarhantering", "Betalningsflöde med Stripe", "Admin-panel och dashboards", "E-post och notifikationer", "Hosting och CI/CD-pipeline", "Dokumentation och kodöverlämning"],
  },
  {
    num: "02", name: "Hemsida", price: "pris på offert", time: "1–2 veckor",
    desc: "Modern, snabb och SEO-optimerad. CMS ni faktiskt vill använda. Byggt på grund ni äger och kan bygga vidare på.",
    includes: ["Modern React-arkitektur", "SEO-optimering från grunden", "CMS-integration om önskat", "Responsiv design", "Google Analytics och sökkonsol", "Domän och hosting"],
  },
  {
    num: "03", name: "Internt system", price: "pris på offert", time: "2–6 veckor",
    desc: "Admin-paneler, dashboards och flöden som ersätter era Excel-arkiv. Ni äger källkoden och kan bygga vidare.",
    includes: ["Admin-paneler skräddarsydda för er", "Databasdesign och API-lager", "Rollbaserad åtkomst", "Rapporter och exportfunktioner", "Integration mot befintliga system", "Driftmiljö och backups"],
  },
  {
    num: "04", name: "AI-integration", price: "pris på offert", time: "1–3 veckor",
    desc: "Språkmodeller, agenter och automatiseringar in i era befintliga system. Byggda för att faktiskt fungera i produktion.",
    includes: ["Språkmodell-integration (OpenAI, Anthropic m.fl.)", "Promptdesign och finjustering", "Agent-flöden och automatiseringar", "RAG och kunskapsbaser", "Säker hantering av API-nycklar", "Monitorering och loggning"],
  },
];

const Tjanster = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "Tjänster — SaaS, hemsidor, interna system och AI | Aurora Media",
      description: "Vi bygger fyra saker snabbt: SaaS-produkter, hemsidor, interna system och AI-integrationer. Fast pris, fast deadline, kod ni äger.",
      canonical: "/tjanster",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Tjänster", url: "/tjanster" }]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">tjänster · fast scope · kod ni äger</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "18ch" }}>
              Vi bygger fyra saker. <span className="it">Snabbt.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>
              Moderna AI-verktyg, fast pris, fast deadline. Levereras på veckor — inte månader.
            </p>
          </Reveal>
        </div>
      </section>

      {SERVICES.map((s, idx) => (
        <section key={s.num} className="section">
          <div className="wrap">
            <div className="sec-head">
              <Reveal>
                <div>
                  <div className="meta-label">{s.num} · {s.price}</div>
                  <h2 className="h2" style={{ marginTop: 18 }}>
                    {s.name}<span className="it">.</span>
                  </h2>
                  <p className="body" style={{ marginTop: 18 }}>
                    <span className="meta-label">Tidsplan</span><br />
                    <span style={{ color: "var(--bone)" }}>{s.time}</span>
                  </p>
                  <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 24 }}>
                    Begär offert <span className="a"><ArrowRight size={14} /></span>
                  </button>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div>
                  <p className="lead" style={{ marginBottom: 28 }}>{s.desc}</p>
                  <div className="meta-label" style={{ marginBottom: 14 }}>Vad ingår</div>
                  <div className="feat-list" style={{ marginTop: 0 }}>
                    {s.includes.map((item, i) => (
                      <div key={item} className="feat-row" style={{ gridTemplateColumns: "60px 1fr" }}>
                        <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="feat-body">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Nästa steg</div>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Har ni en idé eller en process som <span className="it">suger?</span>
          </h2>
          <p className="lead" style={{ marginTop: 22 }}>Offert inom 24 timmar.</p>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Begär offert <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
};

export default Tjanster;
