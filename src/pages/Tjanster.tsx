import { useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import { Reveal, VkNav, VkFooter } from "@/pages/Index";
import { setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";
import "@/styles/verkstad.css";

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
  {
    num: "05", name: "Konsultuppdrag", price: "895 kr/timme", time: "Löpande eller tidsbegränsat",
    desc: "Vi tar även rena konsultuppdrag – AI-rådgivning, strategi, utbildning och utveckling i era befintliga team. 895 kr/timme, dagpris eller fast månadskostnad: ni väljer upplägget.",
    includes: ["AI-rådgivning och strategiworkshops", "Utvecklingskonsult i era projekt och team", "AI-CTO on demand – bollplank för ledning", "Utbildning och prompt-rutiner för teamet", "Genomlysning av befintliga system och kod", "895 kr/timme, dagpris eller fast månad – utan bindning"],
  },
];

const Tjanster = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Tjänster", url: "/tjanster" }]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <>
      <SEO
        title="Tjänster — SaaS, hemsidor, interna system, AI och konsult | Aurora Media"
        description="Vi bygger SaaS-produkter, hemsidor, interna system och AI-integrationer – och tar konsultuppdrag inom AI-rådgivning och utveckling. Fast pris eller timpris, kod ni äger."
        canonical="/tjanster"
      />
      <div className="verkstad">
        <VkNav />
        <main>
          {/* Hero */}
          <section className="vk-section vk-hero">
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">tjänster · fast scope · kod ni äger</p></Reveal>
              <Reveal delay={0.1}>
                <h1 style={{ marginTop: 18, maxWidth: "18ch" }}>
                  Vi bygger. Vi konsultar.{" "}
                  <span className="accent" style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontWeight: 500 }}>
                    Snabbt.
                  </span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="vk-hero-sub">
                  Fasta byggpaket på veckor – eller konsultuppdrag i era team, på timme eller i månaden. Ni väljer upplägget.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="vk-hero-cta">
                  <button onClick={() => open()} className="vk-btn vk-btn-primary">
                    Begär offert <ArrowRight size={16} />
                  </button>
                  <a href="/priser" className="vk-btn vk-btn-ghost">Se priser</a>
                </div>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          {SERVICES.map((s) => (
            <section key={s.num} className="vk-section">
              <div className="vk-wrap">
                <div style={{ display: "grid", gap: "clamp(32px, 5vw, 64px)", gridTemplateColumns: "1fr", alignItems: "start" }} className="tjanst-grid">
                  <Reveal>
                    <div>
                      <p className="vk-mono">{s.num} · {s.price}</p>
                      <h2 style={{ marginTop: 14 }}>
                        {s.name}
                        <span style={{ color: "var(--gran)", fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontWeight: 500 }}>.</span>
                      </h2>
                      <p className="vk-mono" style={{ marginTop: 20, color: "var(--granbark-mut)" }}>Tidsplan</p>
                      <p style={{ marginTop: 6, fontSize: 17, fontWeight: 600, color: "var(--granbark)" }}>{s.time}</p>
                      <button onClick={() => open()} className="vk-btn vk-btn-primary" style={{ marginTop: 28 }}>
                        Begär offert <ArrowRight size={16} />
                      </button>
                    </div>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <div>
                      <p style={{ fontSize: 18, lineHeight: 1.65, color: "#3E444B", marginBottom: 28 }}>{s.desc}</p>
                      <p className="vk-mono" style={{ marginBottom: 16 }}>Vad ingår</p>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
                        {s.includes.map((item) => (
                          <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 16, lineHeight: 1.55, color: "var(--granbark)" }}>
                            <Check size={16} strokeWidth={2.5} style={{ color: "var(--gran)", flexShrink: 0, marginTop: 4 }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                </div>
              </div>
            </section>
          ))}

          {/* CTA */}
          <section className="vk-dark">
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">Nästa steg</p></Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ marginTop: 14 }}>
                  Har ni en idé eller en process som{" "}
                  <span style={{ color: "#F6F5F1", fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontWeight: 500 }}>suger?</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ marginTop: 20, fontSize: 18, maxWidth: "58ch" }}>Offert inom 24 timmar.</p>
              </Reveal>
              <Reveal delay={0.15}>
                <div style={{ marginTop: 28 }}>
                  <button onClick={() => open()} className="vk-btn vk-btn-primary">
                    Begär offert <ArrowRight size={16} />
                  </button>
                </div>
              </Reveal>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
      <style>{`@media (min-width: 900px) { .tjanst-grid { grid-template-columns: 5fr 7fr !important; } }`}</style>
    </>
  );
};

export default Tjanster;
