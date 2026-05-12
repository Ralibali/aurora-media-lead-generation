import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const Rule = () => <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)" }} />;
const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20, textTransform: "lowercase" }}>{children}</p>
);

const SERVICES = [
  {
    num: "01", name: "SaaS-produkt", price: "från 14 900 kr", time: "1–4 veckor",
    desc: "Från MVP till lansering. Auth, betalning, e-post och admin från dag ett. Samma stack som vi använder på våra egna sex produkter.",
    includes: ["Autentisering och användarhantering","Betalningsflöde med Stripe","Admin-panel och dashboards","E-post och notifikationer","Hosting och CI/CD-pipeline","Dokumentation och kodöverlämning"],
  },
  {
    num: "02", name: "Hemsida", price: "pris på offert", time: "1–2 veckor",
    desc: "Modern, snabb och SEO-optimerad. CMS ni faktiskt vill använda. Byggt på grund ni äger och kan bygga vidare på.",
    includes: ["Modern React-arkitektur","SEO-optimering från grunden","CMS-integration om önskat","Responsiv design","Google Analytics och sökkonsol","Domän och hosting"],
  },
  {
    num: "03", name: "Internt system", price: "pris på offert", time: "2–6 veckor",
    desc: "Admin-paneler, dashboards och flöden som ersätter era Excel-arkiv. Ni äger källkoden och kan bygga vidare.",
    includes: ["Admin-paneler skräddarsydda för er","Databasdesign och API-lager","Rollbaserad åtkomst","Rapporter och exportfunktioner","Integration mot befintliga system","Driftmiljö och backups"],
  },
  {
    num: "04", name: "AI-integration", price: "pris på offert", time: "1–3 veckor",
    desc: "Språkmodeller, agenter och automatiseringar in i era befintliga system. Byggda för att faktiskt fungera i produktion.",
    includes: ["Språkmodell-integration (OpenAI, Anthropic m.fl.)","Promptdesign och finjustering","Agent-flöden och automatiseringar","RAG och kunskapsbaser","Säker hantering av API-nycklar","Monitorering och loggning"],
  },
];

const Tjanster = () => {
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
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">

        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap">
            <Label>tjänster</Label>
            <h1 className="t-h1 c-cream anim-fade-up" style={{ maxWidth: 520 }}>
              Vi bygger fyra saker. <em>Snabbt.</em>
            </h1>
            <p style={{ marginTop: 16, maxWidth: 440, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", fontFamily: "'Inter',system-ui,sans-serif" }}>
              Moderna AI-verktyg, fast pris, fast deadline. Levereras på veckor.
            </p>
          </div>
        </section>

        {SERVICES.map((s) => (
          <section key={s.num} style={{ paddingBlock: "clamp(48px,7vw,72px)" }}>
            <Rule />
            <div className="wrap" style={{ paddingTop: "clamp(32px,5vw,56px)" }}>
              <div style={{ display: "grid", gap: "clamp(28px,4vw,56px)" }} className="sm:grid-cols-[1fr_1.2fr]">

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.30)", letterSpacing: "0.06em" }}>{s.num}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.40)" }}>{s.price}</span>
                  </div>
                  <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "clamp(22px,3vw,30px)", color: "#EDE9DC", lineHeight: 1.15, marginBottom: 12, letterSpacing: "-0.01em" }}>
                    {s.name}
                  </h2>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.55)", fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 24 }}>{s.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.30)" }}>tidsplan</span>
                    <span style={{ fontSize: 13, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif" }}>{s.time}</span>
                  </div>
                  <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
                </div>

                <div>
                  <p style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.30)", letterSpacing: "0.08em", marginBottom: 16, textTransform: "lowercase" }}>vad ingår</p>
                  {s.includes.map((item, i) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "0.5px solid rgba(237,233,220,0.07)" }}>
                      <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.25)", minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontSize: 13, color: "rgba(237,233,220,0.75)", fontFamily: "'Inter',system-ui,sans-serif" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
          <Rule />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <Label>nästa steg</Label>
            <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "clamp(24px,3.5vw,36px)", color: "#EDE9DC", marginBottom: 10, letterSpacing: "-0.015em" }}>
              Har ni en idé eller en process som suger?
            </h2>
            <p style={{ fontSize: 13, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 28 }}>Offert inom 24 timmar.</p>
            <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Tjanster;
