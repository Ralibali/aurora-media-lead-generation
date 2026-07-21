import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import AiKartaShell from "@/components/aikarta/AiKartaShell";
import SnabbanalysForm from "@/components/SnabbanalysForm";
import { setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";
import { trackEvent } from "@/lib/analytics";
import "@/styles/verkstad.css";

/*
 * AI-SNABBANALYS – snabbvarianten av AI-kartan.
 * För besökare som inte orkar svara på frågor: de beskriver sin vardag i
 * fritext + anger sin e-post. AI tolkar texten till samma datastruktur som
 * wizarden, och flödet landar på samma resultatsida med samma PDF-produkt.
 */

const AiSnabbanalys = () => {
  useEffect(() => {
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "AI-kartan", url: "/ai-karta" },
      { name: "Snabbanalys", url: "/ai-snabbanalys" },
    ]);
    trackEvent("ai_snabbanalys_view");
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <>
      <SEO
        title="AI-snabbanalys – beskriv er vardag, få en AI-plan som PDF | Aurora Media"
        description="Skriv några meningar om vad som tar tid i er vardag. Vår AI tolkar texten och skickar en personlig AI-plan som PDF – gratis, på någon minut."
        canonical="/ai-snabbanalys"
      />
      <AiKartaShell>
        <style>{`
          .aisn-wrap { max-width: 1100px; margin: 0 auto; padding: clamp(90px,12vw,140px) 20px 80px; }
          .aisn-grid { display: grid; grid-template-columns: 1.25fr .9fr; gap: 48px; align-items: start; margin-top: 44px; }
          @media (max-width: 920px) { .aisn-grid { grid-template-columns: 1fr; } }
          .aisn-card { background: #fff; border: 1px solid var(--linje); border-radius: 16px; padding: clamp(22px,3.5vw,34px); }
          .aisn-label { display: block; font-family: var(--font-mono); font-size: 11px; letter-spacing: .09em; text-transform: uppercase; color: #3E444B; margin: 0 0 8px; }
          .aisn-step { display: flex; gap: 14px; align-items: flex-start; }
          .aisn-step + .aisn-step { margin-top: 18px; }
          .aisn-stepnum { width: 26px; height: 26px; border-radius: 50%; background: #14171A; color: #F6F5F1; display: grid; place-items: center; font-family: var(--font-mono); font-size: 12px; flex-shrink: 0; }
          .aisn-altcard { display: block; margin-top: 28px; border: 1px dashed #14171A; border-radius: 14px; padding: 18px 20px; text-decoration: none; color: #14171A; transition: background .15s ease; }
          .aisn-altcard:hover { background: #fff; }
        `}</style>

        <div className="aisn-wrap">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#3E444B", display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 7, height: 7, background: "#E8500A", borderRadius: "50%", display: "inline-block" }} />
            AI-snabbanalys · Gratis · ca 30 sekunder
          </p>
          <h1 style={{ marginTop: 16, marginBottom: 18, maxWidth: 700 }}>
            Beskriv er vardag. Få en AI-plan som PDF.
          </h1>
          <p style={{ maxWidth: 620, color: "var(--granbark-mut)", fontSize: 17, lineHeight: 1.6 }}>
            Inga frågor, ingen wizard. Skriv några meningar om vad som tar mest tid i er vardag –
            vår AI tolkar texten, räknar på vad det kostar er och bygger en personlig AI-plan
            som skickas till din mejl inom någon minut.
          </p>

          <div className="aisn-grid">
            <SnabbanalysForm idPrefix="aisn" />

            {/* ---------- SIDOPANEL ---------- */}
            <aside>
              <div className="aisn-card" style={{ background: "var(--gran-soft)" }}>
                <p className="aisn-label">Så går det till</p>
                <div className="aisn-step">
                  <span className="aisn-stepnum">1</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>Du beskriver – vi lyssnar</p>
                    <p style={{ color: "var(--granbark-mut)", fontSize: 14, lineHeight: 1.55, marginTop: 3 }}>
                      Skriv som du skulle berätta det för en kollega. AI:n hittar automationscasen.
                    </p>
                  </div>
                </div>
                <div className="aisn-step">
                  <span className="aisn-stepnum">2</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>Planen landar i inkorgen</p>
                    <p style={{ color: "var(--granbark-mut)", fontSize: 14, lineHeight: 1.55, marginTop: 3 }}>
                      Vad varje process kostar i kronor, vad som bör byggas först, fast pris och återbetalningstid.
                    </p>
                  </div>
                </div>
                <div className="aisn-step">
                  <span className="aisn-stepnum">3</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>Valfritt: 20 min med mig</p>
                    <p style={{ color: "var(--granbark-mut)", fontSize: 14, lineHeight: 1.55, marginTop: 3 }}>
                      Vill du gå djupare pekar jag ut exakt första bygget – kostnadsfritt, utan köpkrav.
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/ai-karta" className="aisn-altcard" onClick={() => trackEvent("ai_snabbanalys_to_wizard")}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: "#3E444B", marginBottom: 6 }}>
                  Hellre svara på frågor?
                </p>
                <p style={{ fontWeight: 700, fontSize: 16.5 }}>
                  Gör fulla AI-kartan – tre korta steg <span aria-hidden="true">→</span>
                </p>
              </Link>
            </aside>
          </div>
        </div>
      </AiKartaShell>
    </>
  );
};

export default AiSnabbanalys;
