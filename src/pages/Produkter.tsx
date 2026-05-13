import { useEffect } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta } from "@/lib/seoHelpers";

const PRODUCTS = [
  { num: "01", name: "Hönsgården", url: "honsgarden.se", tagline: "Mobilapp för hönshållning.", tags: ["Mobilapp", "React Native", "iOS & Android"], desc: "En mobilapp som hjälper hönshållare att hålla koll på sin flock — hälsologg, äggproduktion, påminnelser och råd. Byggd med React Native och Supabase." },
  { num: "02", name: "AgilityManager", url: "agilitymanager.se", tagline: "Träningslogg och kursplaner för hundsporten.", tags: ["SaaS", "Community", "Sport"], desc: "Digital plattform för agility-tränare och hundägare. Loggbok, kursplanering, progresstracking och community-funktioner." },
  { num: "03", name: "Aurora Transport", url: "auroratransport.se", tagline: "TMS för svenska åkerier.", tags: ["SaaS", "Multi-tenant", "Logistik"], desc: "Multi-tenant transportshanteringssystem. Körordrar, fordonsstatus, förarhantering och fakturering. Levererat på fyra veckor.", highlight: "Levererat på fyra veckor." },
  { num: "04", name: "Updro", url: "updro.se", tagline: "Marknadsplats för svenska byråer.", tags: ["Marketplace", "B2B", "SaaS"], desc: "En plattform där svenska byråer kan lista sina tjänster och kunder kan hitta rätt partner. Marketplace med dubbelsidiga nätverkseffekter." },
  { num: "05", name: "Odlingsdagboken", url: "odlingsdagboken.com", tagline: "Köksträdgård med AI-coach Gro.", tags: ["AI", "Consumer", "SaaS"], desc: "Digital trädgårdsdagbok med inbyggd AI-coach (Gro) som ger råd baserade på vad du odlar, var du bor och årstiden." },
  { num: "06", name: "GoGlamping", url: "goglamping.se", tagline: "Bokning vid Göta kanal.", tags: ["Bokningssystem", "Hospitality", "B2C"], desc: "Bokningsplattform för glamping-upplevelser. Kalenderhantering, betalningsflöde, gästkommunikation och administratörspanel." },
];

const Produkter = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "Produkter — sex SaaS i drift | Aurora Media",
      description: "Aurora Media driver sex egna SaaS-produkter. Inte case studies — produkter i drift.",
      canonical: "/produkter", ogImage: "/og-image-sv.jpg",
    });
  }, []);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">egna produkter · sex i drift</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "16ch" }}>
              Sex produkter. <span className="it">I drift idag.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>
              Inte case studies. Inte mockups. Produkter vi äger, driver och itererar på — bevis på att vi faktiskt kan bygga.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="work-grid">
            {PRODUCTS.map((p) => (
              <a key={p.num} href={`https://${p.url}`} target="_blank" rel="noopener noreferrer" className="work-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span className="mono">{p.num}</span>
                  <ArrowUpRight size={14} style={{ color: "var(--moss)" }} />
                </div>
                <h4>{p.name}</h4>
                <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--moss-soft)", fontSize: 14, marginTop: 4 }}>{p.tagline}</p>
                <p className="body" style={{ marginTop: 12 }}>{p.desc}</p>
                <div className="url" style={{ marginTop: 14 }}>{p.url}</div>
                <div style={{ marginTop: 10 }}>
                  {p.tags.map((t) => (<span key={t} className="pill">{t}</span>))}
                </div>
                {p.highlight && (
                  <p style={{ marginTop: 14, fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--bone-mute)", fontSize: 13 }}>"{p.highlight}"</p>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Vill ni ha er egen?</div>
          <h2 className="h2" style={{ marginTop: 18 }}>Vi bygger samma sak <span className="it">åt er.</span></h2>
          <p className="lead" style={{ marginTop: 22 }}>Fast pris, veckor inte månader, kod ni äger.</p>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Begär offert <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
};

export default Produkter;
