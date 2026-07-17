import { useEffect } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import { Reveal, VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import { setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";
import { trackEvent } from "@/lib/analytics";
import "@/styles/verkstad.css";

/*
 * ÖPPNA SIFFROR – Aurora Media visar sina metrics öppet.
 * Uppdatera siffrorna i denna fil en gång i månaden. Ärlighet säljer.
 */

const METRICS = [
  { label: "Produkter i drift", value: "7", note: "egna + kundprojekt" },
  { label: "Snittleverans", value: "2 veckor", note: "från samtal till drift" },
  { label: "Upptid 90 dagar", value: "99,9 %", note: "alla produkter" },
  { label: "Deploys i år", value: "240+", note: "små leveranser, ofta" },
  { label: "Support-svarstid", value: "< 24 h", note: "värderingar i timmar" },
  { label: "Fasta projekt i tid", value: "100 %", note: "2025–2026" },
];

const PRODUCTS = [
  { name: "Aurora Transport", url: "https://auroratransport.se", branch: "Transport & logistik", build: "< 2 veckor", stack: "React · Supabase · Fortnox", status: "I DRIFT" },
  { name: "Updro", url: "https://updro.se", branch: "Marknadsplats", build: "< 3 veckor", stack: "React · Supabase · Stripe", status: "I DRIFT" },
  { name: "Hönsgården", url: "https://honsgarden.se", branch: "AgriTech / Freemium", build: "< 3 veckor", stack: "React · Supabase · Stripe", status: "I DRIFT" },
  { name: "Odlingsdagboken", url: "https://odlingsdagboken.com", branch: "AgriTech / Content", build: "< 2 veckor", stack: "React · Supabase", status: "I DRIFT" },
  { name: "AgilityManager", url: "https://agilitymanager.se", branch: "SportTech", build: "< 2 veckor", stack: "React · Supabase", status: "I DRIFT" },
  { name: "Viriditas Massage", url: "https://viriditasmassage.se", branch: "Bokning & hälsa", build: "< 1 vecka", stack: "React · Supabase", status: "I DRIFT" },
  { name: "Bergs Slussar Glamping", url: "https://goglampingsweden.se", branch: "Besöksnäring", build: "< 2 veckor", stack: "React · Supabase · Stripe", status: "I DRIFT" },
];

const BUILDLOG = [
  { date: "2026-07", text: "Verktyg 2.0 – grafer, PDF-export och presets i alla sex gratisverktyg." },
  { date: "2026-06", text: "Aurora Transport: AI-dispatchflöde rullat ut i produktion." },
  { date: "2026-05", text: "Bergs Slussar Glamping lanserat – bokning och gästkommunikation." },
  { date: "2026-04", text: "Hönsgården: premiumkonvertering passerade 60 % bland aktiva." },
  { date: "2026-03", text: "Nya sajten auroramedia.se lanserad – verkstad-temat." },
];

const OppnaSiffror = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Öppna siffror", url: "/oppna-siffror" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <>
      <SEO
        title="Öppna siffror – metrics i realtid | Aurora Media"
        description="Aurora Media visar sina siffror öppet: produkter i drift, leveranstider, upptid och deploys. Ingen PowerPoint – facit."
        canonical="/oppna-siffror"
      />
      <div className="verkstad">
        <VkNav />
        <main>
          <section className="vk-section vk-hero">
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">öppna siffror · uppdateras månadsvis</p></Reveal>
              <Reveal delay={0.1}>
                <h1 style={{ marginTop: 18, maxWidth: "16ch" }}>
                  Inga PowerPoints. <span className="accent" style={{ fontStyle: "italic" }}>Bara facit.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="vk-hero-sub">
                  De flesta byråer visar mockups. Vi driver det vi bygger – varje dag.
                  Här är siffrorna, rakt upp och ner.
                </p>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          <section className="vk-section">
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">Nyckeltal</p></Reveal>
              <div className="vk-metrics" style={{ marginTop: 24, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                {METRICS.map((m, i) => (
                  <Reveal key={m.label} delay={i * 0.04}>
                    <div className="vk-metric">
                      <span className="vk-metric-label">{m.label}</span>
                      <strong className="vk-metric-value">{m.value}</strong>
                      <span className="vk-metric-note">{m.note}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <hr className="vk-hair" />

          <section className="vk-section" style={{ background: "var(--bjork-djup)" }}>
            <div className="vk-wrap">
              <Reveal>
                <div className="vk-secheader">
                  <span className="vk-mono">Produkter i drift</span>
                  <h2>Allt vi byggt. <span style={{ color: "var(--gran)" }}>Status just nu.</span></h2>
                </div>
              </Reveal>
              <div style={{ marginTop: 40, overflowX: "auto", border: "1px solid var(--linje)", borderRadius: 14, background: "#fff" }}>
                <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--linje)" }}>
                      {["Produkt", "Bransch", "Byggtid", "Stack", "Status"].map((h) => (
                        <th key={h} style={{ padding: "16px 20px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--granbark-mut)", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCTS.map((p) => (
                      <tr key={p.name} style={{ borderBottom: "1px solid var(--linje)" }}>
                        <td style={{ padding: "15px 20px" }}>
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--granbark)", fontSize: 15 }}
                            onClick={() => trackEvent("siffror_product_click", { product: p.name })}
                          >
                            {p.name} <ArrowUpRight size={13} />
                          </a>
                        </td>
                        <td style={{ padding: "15px 20px", fontSize: 14, color: "var(--granbark-mut)" }}>{p.branch}</td>
                        <td style={{ padding: "15px 20px", fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--granbark)" }}>{p.build}</td>
                        <td style={{ padding: "15px 20px", fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--granbark-mut)" }}>{p.stack}</td>
                        <td style={{ padding: "15px 20px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".06em",
                            color: "var(--gran)",
                          }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,.18)" }} />
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="vk-section">
            <div className="vk-wrap" style={{ maxWidth: 860 }}>
              <Reveal>
                <div className="vk-secheader">
                  <span className="vk-mono">Bygglogg</span>
                  <h2>Senaste leveranserna.</h2>
                </div>
              </Reveal>
              <div style={{ marginTop: 12 }}>
                {BUILDLOG.map((log, i) => (
                  <Reveal key={log.date} delay={i * 0.04}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "90px 1fr", gap: 18,
                      padding: "16px 0", borderBottom: "1px dashed var(--linje)", alignItems: "baseline",
                    }}>
                      <span className="vk-mono" style={{ color: "var(--gran)" }}>{log.date}</span>
                      <span style={{ fontSize: 16, color: "var(--granbark)" }}>{log.text}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.1}>
                <p className="vk-mono" style={{ marginTop: 24, opacity: 0.7 }}>
                  Siffrorna uppdateras manuellt varje månad. Det är hela poängen: de ska vara sanna.
                </p>
              </Reveal>
            </div>
          </section>

          <section className="vk-dark">
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">Nästa siffra</p></Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ marginTop: 14 }}>Vill du bli produkt nummer åtta?</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ marginTop: 20, maxWidth: "58ch", fontSize: 18 }}>
                  Två nya projekt per månad. Beskriv din idé så får du ett ärligt besked inom 24 timmar.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div style={{ marginTop: 28 }}>
                  <button onClick={() => open()} className="vk-btn vk-btn-primary">
                    Starta ditt bygge <ArrowRight size={16} />
                  </button>
                </div>
              </Reveal>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default OppnaSiffror;
