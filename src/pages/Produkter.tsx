import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta } from "@/lib/seoHelpers";

const Rule = () => <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)" }} />;
const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20, textTransform: "lowercase" }}>{children}</p>
);

const PRODUCTS = [
  {
    num: "01", name: "Hönsgården", url: "honsgarden.se",
    tagline: "Mobilapp för hönshållning.",
    tags: ["Mobilapp","React Native","iOS & Android"],
    desc: "En mobilapp som hjälper hönshållare att hålla koll på sin flock — hälsologg, äggproduktion, påminnelser och råd. Byggd med React Native och Supabase. Visar att en vertikal nischad app kan hitta sin publik snabbt.",
  },
  {
    num: "02", name: "AgilityManager", url: "agilitymanager.se",
    tagline: "Träningslogg och kursplaner för hundsporten.",
    tags: ["SaaS","Community","Sport"],
    desc: "Digital plattform för agility-tränare och hundägare. Loggbok för träningspass, kursplanering, progresstracking och community-funktioner. Byggd för en dedikerad nischgemenskap som saknade rätt verktyg.",
  },
  {
    num: "03", name: "Aurora Transport", url: "auroratransport.se",
    tagline: "TMS för svenska åkerier.",
    tags: ["SaaS","Multi-tenant","Logistik"],
    desc: "Multi-tenant transportshanteringssystem för den svenska åkerimarknaden. Körordrar, fordonsstatus, förarhantering och fakturering. Bevis på att branschspecifik SaaS slår generella verktyg. Levererat på fyra veckor.",
    highlight: "Levererat på fyra veckor.",
  },
  {
    num: "04", name: "Updro", url: "updro.se",
    tagline: "Marknadsplats för svenska byråer.",
    tags: ["Marketplace","B2B","SaaS"],
    desc: "En plattform där svenska byråer kan lista sina tjänster och potentiella kunder kan hitta rätt partner. Sökning, filtrering, profiler och kontaktflöden. Marketplace-arkitektur med dubbelsidiga nätverkseffekter.",
  },
  {
    num: "05", name: "Odlingsdagboken", url: "odlingsdagboken.com",
    tagline: "Köksträdgård med AI-coach Gro.",
    tags: ["AI","Consumer","SaaS"],
    desc: "Digital trädgårdsdagbok med inbyggd AI-coach (Gro) som ger råd baserade på vad du odlar, var du bor och årstiden. Integrerar väderdata, såningskalendrar och ett community.",
  },
  {
    num: "06", name: "GoGlamping", url: "goglamping.se",
    tagline: "Bokning vid Göta kanal.",
    tags: ["Bokningssystem","Hospitality","B2C"],
    desc: "Bokningsplattform för glamping-upplevelser längs Göta kanal. Kalenderhantering, betalningsflöde, gästkommunikation och administratörspanel. Traditionell hospitality digitaliserad rätt.",
  },
];

const Produkter = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Produkter — sex SaaS i drift | Aurora Media",
      description: "Aurora Media driver sex egna SaaS-produkter. Inte case studies — produkter i drift.",
      canonical: "/produkter", ogImage: "/og-image-sv.jpg",
    });
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">

        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap">
            <Label>egna produkter</Label>
            <h1 className="t-h1 c-cream anim-fade-up" style={{ maxWidth: 540 }}>
              Sex produkter. <em>I drift idag.</em>
            </h1>
            <p style={{ marginTop: 16, maxWidth: 440, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", fontFamily: "'Inter',system-ui,sans-serif" }}>
              Inte case studies. Inte mockups. Produkter vi äger, driver och itererar på — bevis på att vi faktiskt kan bygga.
            </p>
          </div>
        </section>

        {PRODUCTS.map((p) => (
          <section key={p.num} style={{ paddingBlock: "clamp(40px,6vw,64px)" }}>
            <Rule />
            <div className="wrap" style={{ paddingTop: "clamp(28px,4vw,48px)" }}>
              <div style={{ display: "grid", gap: "clamp(20px,3vw,48px)" }} className="sm:grid-cols-[160px_1fr]">

                <div>
                  <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.25)", display: "block", marginBottom: 16 }}>{p.num}</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {p.tags.map((t) => (
                      <span key={t} style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.35)", border: "0.5px solid rgba(237,233,220,0.14)", borderRadius: 3, padding: "3px 7px" }}>{t}</span>
                    ))}
                  </div>
                  {p.highlight && (
                    <p style={{ marginTop: 16, fontFamily: "'Fraunces',Georgia,serif", fontStyle: "italic", fontSize: 13, color: "rgba(237,233,220,0.50)" }}>
                      "{p.highlight}"
                    </p>
                  )}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 6, flexWrap: "wrap" }}>
                    <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: "clamp(22px,3vw,30px)", color: "#EDE9DC", lineHeight: 1.15, letterSpacing: "-0.01em" }}>{p.name}</h2>
                    <a href={`https://${p.url}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 11, color: "rgba(237,233,220,0.35)", textDecoration: "none", transition: "color 0.15s", whiteSpace: "nowrap", marginTop: 6 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#EDE9DC")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.35)")}>
                      {p.url} ↗
                    </a>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(237,233,220,0.65)", fontFamily: "'Inter',system-ui,sans-serif", fontWeight: 500, marginBottom: 10 }}>{p.tagline}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif" }}>{p.desc}</p>
                </div>
              </div>
            </div>
          </section>
        ))}

        <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
          <Rule />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <Label>vill ni ha er egen?</Label>
            <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: "clamp(24px,3.5vw,36px)", color: "#EDE9DC", marginBottom: 10, letterSpacing: "-0.015em" }}>
              Vi bygger samma sak åt er.
            </h2>
            <p style={{ fontSize: 13, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 28 }}>Fast pris, veckor inte månader, kod ni äger.</p>
            <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Produkter;
