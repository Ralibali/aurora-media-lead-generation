import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta } from "@/lib/seoHelpers";

const BORDER = "rgba(237, 233, 220, 0.15)";
const SectionBorder = () => <div style={{ height: "0.5px", backgroundColor: BORDER }} />;

const PRODUCTS = [
  {
    num: "01",
    name: "Hönsgården",
    url: "honsgarden.se",
    headline: "Mobilapp för hönshållare.",
    desc: "En mobilapp som hjälper hönshållare att hålla koll på sin flock — hälsologg, äggproduktion, påminnelser och råd. Byggd med React Native och ett Supabase-backend. Visar att en vertikal nischad app kan hitta sin publik snabbt.",
    meta: ["Mobilapp", "React Native", "iOS & Android"],
    stat: null,
  },
  {
    num: "02",
    name: "AgilityManager",
    url: "agilitymanager.se",
    headline: "Träningslogg och kursplaner för hundsporten.",
    desc: "Digital plattform för agility-tränare och hundägare. Loggbok för träningspass, kursplanering, progresstracking och community-funktioner. Byggd för en dedikerad nischgemenskap som saknade rätt verktyg.",
    meta: ["SaaS", "Community", "Sport"],
    stat: null,
  },
  {
    num: "03",
    name: "Aurora Transport",
    url: "auroratransport.se",
    headline: "TMS för svenska åkerier.",
    desc: "Ett multi-tenant transportshanteringssystem byggt specifikt för den svenska åkerimarknaden. Körordrar, fordonsstatus, förarhantering och fakturering i en plattform. Bevis på att branschspecifik SaaS slår generella verktyg.",
    meta: ["SaaS", "Multi-tenant", "Logistik"],
    stat: "Levererat på fyra veckor.",
  },
  {
    num: "04",
    name: "Updro",
    url: "updro.se",
    headline: "Marknadsplats för svenska byråer.",
    desc: "En plattform där svenska byråer kan lista sina tjänster och potentiella kunder kan hitta rätt partner. Sökning, filtrering, profiler och kontaktflöden. Marketplace-arkitektur med dubbelsidiga nätverkseffekter.",
    meta: ["Marketplace", "B2B", "SaaS"],
    stat: null,
  },
  {
    num: "05",
    name: "Odlingsdagboken",
    url: "odlingsdagboken.com",
    headline: "Köksträdgården med AI-coach Gro.",
    desc: "Digital trädgårdsdagbok med en inbyggd AI-coach (Gro) som ger råd baserade på vad du odlar, var du bor och årstiden. Integrerar väderdata, såningskalendrar och ett community för trädgårdsintresserade.",
    meta: ["AI", "Consumer", "SaaS"],
    stat: null,
  },
  {
    num: "06",
    name: "GoGlamping",
    url: "goglamping.se",
    headline: "Bokning och boende vid Göta kanal.",
    desc: "Bokningsplattform för glamping-upplevelser längs Göta kanal. Kalenderhantering, betalningsflöde, gästkommunikation och administratörspanel. Visar hur en traditionell hospitality-verksamhet kan digitaliseras med en produkt som faktiskt är rolig att använda.",
    meta: ["Bokningssystem", "Hospitality", "B2C"],
    stat: null,
  },
];

const Produkter = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Produkter — sex SaaS i drift | Aurora Media",
      description:
        "Aurora Media driver sex egna SaaS-produkter. Inte case studies — produkter i drift som genererar intäkter och bevisar att vi faktiskt kan bygga.",
      canonical: "/produkter",
      ogImage: "/og-image-sv.jpg",
    });
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">
        <section className="section-pad pt-[120px]">
          <div className="site-container">
            <p className="eyebrow mb-4">Egna produkter</p>
            <h1 className="hero-h1 text-cream max-w-[560px]">
              Sex produkter.{" "}
              <em>I drift idag.</em>
            </h1>
            <p className="mt-4 max-w-[460px] font-sans text-[14px] leading-relaxed" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
              Inte case studies. Inte mockups. Produkter som vi äger, driver och itererar på.
              Det är skillnaden mellan att bygga åt andra och att förstå vad det innebär att bygga.
            </p>
          </div>
        </section>

        {PRODUCTS.map((p, idx) => (
          <section key={p.num} className="section-pad">
            <SectionBorder />
            <div className="site-container pt-14">
              <div className="grid gap-8 sm:grid-cols-[200px_1fr]">
                <div>
                  <span className="mono-accent block mb-3" style={{ color: "rgba(237, 233, 220, 0.40)" }}>{p.num}</span>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {p.meta.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded px-2 py-0.5 font-sans text-[11px]"
                        style={{ border: `0.5px solid ${BORDER}`, color: "rgba(237, 233, 220, 0.55)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {p.stat && (
                    <p className="mt-4 font-serif text-[13px]" style={{ color: "rgba(237, 233, 220, 0.65)", fontStyle: "italic" }}>
                      "{p.stat}"
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="section-h2 text-cream">{p.name}</h2>
                    <a
                      href={`https://${p.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono-accent shrink-0 transition-opacity hover:opacity-70 mt-1"
                      style={{ color: "rgba(237, 233, 220, 0.50)" }}
                    >
                      {p.url} ↗
                    </a>
                  </div>
                  <p className="font-sans text-[14px] font-medium text-cream mb-3">{p.headline}</p>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="section-pad">
          <SectionBorder />
          <div className="site-container pt-14">
            <p className="eyebrow mb-4">Vill ni ha er egen?</p>
            <h2 className="section-h2 text-cream mb-3">
              Vi bygger samma sak åt er.
            </h2>
            <p className="max-w-[460px] font-sans text-[14px] leading-relaxed mb-8" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
              Alla produkter ovan är byggda med samma metodik vi använder för kundprojekt.
              Fast pris, veckor inte månader, kod ni äger.
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

export default Produkter;
