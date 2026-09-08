import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import { Reveal, VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import { setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";
import { PORTFOLIO } from "@/data/portfolio";
import "@/styles/verkstad.css";

const projects = PORTFOLIO.filter((project) => !project.draft && !project.noindex);
const stayboost = projects.find((project) => project.slug === "bergs-slussar-stayboost");

export default function OppnaSiffror() {
  const { open } = useContactModal();
  useEffect(() => {
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Öppna siffror", url: "/oppna-siffror" }]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return <div className="verkstad">
    <SEO title="Öppna siffror – projekt och dokumenterade resultat | Aurora Media" description="Se Aurora Medias publicerade projekt och dokumenterade resultat från vår egen verksamhet, med datum, underlag och tydliga avgränsningar." canonical="/oppna-siffror" />
    <VkNav />
    <main id="main">
      <section className="vk-section vk-hero"><div className="vk-wrap">
        <Reveal><p className="vk-mono">Öppna siffror · underlag och sammanhang</p></Reveal>
        <Reveal delay={0.1}><h1 style={{ marginTop: 18, maxWidth: "19ch" }}>Resultat som går <span className="accent" style={{ fontStyle: "italic" }}>att granska.</span></h1></Reveal>
        <Reveal delay={0.2}><p className="vk-hero-sub">Här samlar vi dokumenterade resultat och länkar till våra projekt. Varje siffra behöver ett sammanhang: vilken verksamhet den gäller, när den kontrollerades och vad som faktiskt mättes.</p></Reveal>
      </div></section>
      <hr className="vk-hair" />
      <section className="vk-section"><div className="vk-wrap">
        <Reveal><p className="vk-mono">Stayboost på Bergs Slussar Glamping · egen verksamhet</p>
          <h2 style={{ marginTop: 16 }}>Från bokning till <span className="accent">gästflöde.</span></h2>
          <p style={{ maxWidth: 780, marginTop: 20, lineHeight: 1.75 }}>Uppgifterna nedan kommer från verksamhetens statistik, kontrollerad den 3 september 2026 och dokumenterad i caset. De beskriver den uppmätta verksamheten fram till kontrollen. Tidsbesparing och vilken del av försäljningen som orsakats av automationen är inte uppmätta.</p>
        </Reveal>
        <div className="vk-metrics" style={{ marginTop: 32, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
          {stayboost?.results?.map((metric) => <div className="vk-metric" key={metric.label}>
            <span className="vk-metric-label">{metric.label}</span><strong className="vk-metric-value">{metric.value}</strong>
          </div>)}
        </div>
        <Link to="/arbete/bergs-slussar-stayboost" className="vk-btn vk-btn-outline" style={{ marginTop: 28 }}>Se caset och underlaget <ArrowRight size={16} /></Link>
      </div></section>
      <hr className="vk-hair" />
      <section className="vk-section"><div className="vk-wrap">
        <Reveal><p className="vk-mono">{projects.length} publicerade projekt i portfolion</p><h2 style={{ marginTop: 16 }}>Titta på <span className="accent">arbetet bakom.</span></h2>
          <p style={{ marginTop: 20, maxWidth: 720, lineHeight: 1.75 }}>Listan omfattar egna produkter, egna verksamheter och uppdrag. Projekttyp och sammanhang framgår i respektive case. Antalet projekt är inte ett mått på antal betalande kunder.</p>
        </Reveal>
        <div className="vk-steps" style={{ marginTop: 32 }}>
          {projects.map((project) => <div key={project.slug} style={{ padding: "24px 0", borderBottom: "1px solid var(--linje)" }}>
            <Link to={`/arbete/${project.slug}`} style={{ fontSize: 22, fontWeight: 600, color: "var(--gran)", display: "inline-flex", gap: 12, alignItems: "center" }}>{project.name}<ArrowRight size={16} /></Link>
            <p style={{ marginTop: 10, maxWidth: 740, lineHeight: 1.7 }}>{project.tagline}</p>
          </div>)}
        </div>
      </div></section>
      <section className="vk-dark"><div className="vk-wrap">
        <p className="vk-mono">Börja med ett arbetsflöde</p><h2 style={{ marginTop: 16 }}>Vad vill ni kunna <span style={{ fontStyle: "italic" }}>mäta bättre?</span></h2>
        <p style={{ marginTop: 20, maxWidth: 680, fontSize: 18, lineHeight: 1.7 }}>Beskriv var arbetet fastnar idag. Vi kan avgränsa en första lösning och bestämma hur ni ska följa upp om den hjälper.</p>
        <button onClick={() => open()} className="vk-btn vk-btn-primary" style={{ marginTop: 28 }}>Prata om ert arbetsflöde <ArrowRight size={16} /></button>
      </div></section>
    </main><VkFooter />
  </div>;
}
