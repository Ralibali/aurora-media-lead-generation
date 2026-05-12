import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { toast } from "sonner";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const Rule = () => <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)" }} />;

const Field = ({
  label, name, type = "text", required, placeholder, as,
}: {
  label: string; name: string; type?: string;
  required?: boolean; placeholder?: string; as?: "textarea" | "select";
  children?: React.ReactNode;
}) => {
  const base: React.CSSProperties = {
    width: "100%",
    background: "rgba(237,233,220,0.03)",
    border: "0.5px solid rgba(237,233,220,0.14)",
    borderRadius: 6,
    color: "#EDE9DC",
    fontFamily: "'Inter',system-ui,sans-serif",
    fontSize: 13,
    padding: "10px 14px",
    outline: "none",
    transition: "border-color 0.15s",
    appearance: "none",
  };
  const focusStyle = "rgba(237,233,220,0.40)";
  const blurStyle = "rgba(237,233,220,0.14)";
  const onFocus = (e: React.FocusEvent<HTMLElement>) =>
    ((e.target as HTMLElement).style.borderColor = focusStyle);
  const onBlur = (e: React.FocusEvent<HTMLElement>) =>
    ((e.target as HTMLElement).style.borderColor = blurStyle);

  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 6, letterSpacing: "0.04em" }}>
        {label}{required && " *"}
      </label>
      {as === "textarea" ? (
        <textarea id={name} name={name} required={required} placeholder={placeholder} rows={5}
          style={{ ...base, resize: "vertical" }} onFocus={onFocus} onBlur={onBlur} />
      ) : as === "select" ? (
        <select id={name} name={name} style={{ ...base, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur} />
      ) : (
        <input id={name} name={name} type={type} required={required} placeholder={placeholder}
          style={base} onFocus={onFocus} onBlur={onBlur} />
      )}
    </div>
  );
};

const Kontakt = () => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setSEOMeta({
      title: "Kontakt — begär offert | Aurora Media",
      description: "Berätta vad ni vill bygga. Vi återkommer med offert inom 24 timmar.",
      canonical: "/kontakt",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Kontakt", url: "/kontakt" }]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setDone(true);
      toast.success("Tack! Vi hör av oss inom 24 timmar.");
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Något gick fel. Mejla info@auroramedia.se");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">

        {/* Hero */}
        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap">
            <p style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20, textTransform: "lowercase" }}>
              kontakt
            </p>
            <h1 className="t-h1 c-cream anim-fade-up" style={{ maxWidth: 520 }}>
              Berätta vad ni
              <br /><em>vill bygga.</em>
            </h1>
          </div>
        </section>

        {/* Form + info */}
        <section style={{ paddingBlock: "clamp(40px,6vw,64px)" }}>
          <Rule />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <div style={{ display: "grid", gap: "clamp(40px,6vw,80px)" }} className="sm:grid-cols-[1fr_1.4fr]">

              {/* Left: direct contact */}
              <div>
                <a
                  href="mailto:info@auroramedia.se"
                  style={{
                    fontFamily: "'Fraunces',Georgia,serif",
                    fontSize: "clamp(20px,3vw,28px)",
                    fontStyle: "italic",
                    color: "#EDE9DC",
                    textDecoration: "none",
                    display: "block",
                    lineHeight: 1.2,
                    marginBottom: 8,
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  info@auroramedia.se ↗
                </a>
                <p style={{ fontSize: 13, color: "rgba(237,233,220,0.40)", fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 32 }}>
                  Svar inom 24 timmar.
                </p>

                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 28 }}>
                  {[["Plats","Linköping, Sverige"],["Org.nr","559272-0220"],["VAT","SE559272022001"],["Leverans","Veckor, inte månader"]].map(([k,v]) => (
                    <tr key={k} style={{ borderBottom: "0.5px solid rgba(237,233,220,0.08)" }}>
                      <td style={{ padding: "9px 0", fontSize: 12, color: "rgba(237,233,220,0.35)", fontFamily: "'Inter',system-ui,sans-serif" }}>{k}</td>
                      <td style={{ padding: "9px 0", fontSize: 12, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif", textAlign: "right" }}>{v}</td>
                    </tr>
                  ))}
                </table>

                <a
                  href="https://cal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "rgba(237,233,220,0.40)", fontFamily: "'Inter',system-ui,sans-serif", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EDE9DC")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.40)")}>
                  Boka 30 min direkt ↗
                </a>
              </div>

              {/* Right: form */}
              {done ? (
                <div style={{ border: "0.5px solid rgba(237,233,220,0.12)", borderRadius: 8, padding: "clamp(32px,5vw,56px)", textAlign: "center" }}>
                  <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 28, color: "#EDE9DC", marginBottom: 12 }}>Tack!</h2>
                  <p style={{ fontSize: 13, color: "rgba(237,233,220,0.55)", fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 24 }}>
                    Vi hör av oss inom 24 timmar.
                  </p>
                  <button onClick={() => setDone(false)} className="btn-ghost" style={{ fontSize: 12 }}>
                    Skicka en ny förfrågan
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gap: 16 }} className="sm:grid-cols-2">
                    <Field label="Namn" name="name" required />
                    <Field label="Företag" name="company" />
                  </div>
                  <Field label="E-post" name="email" type="email" required />
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 6, letterSpacing: "0.04em" }}>
                      Vad vill ni bygga *
                    </label>
                    <textarea
                      name="what" required minLength={20} maxLength={2000} rows={5}
                      placeholder="Beskriv idén, problemet eller processen ni vill lösa..."
                      style={{ width: "100%", background: "rgba(237,233,220,0.03)", border: "0.5px solid rgba(237,233,220,0.14)", borderRadius: 6, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif", fontSize: 13, padding: "10px 14px", outline: "none", resize: "vertical", transition: "border-color 0.15s" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(237,233,220,0.40)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(237,233,220,0.14)")}
                    />
                  </div>

                  <div style={{ display: "grid", gap: 16 }} className="sm:grid-cols-2">
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 6 }}>Budget</label>
                      <select name="budget" style={{ width: "100%", background: "rgba(237,233,220,0.03)", border: "0.5px solid rgba(237,233,220,0.14)", borderRadius: 6, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif", fontSize: 13, padding: "10px 14px", outline: "none", appearance: "none", cursor: "pointer" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(237,233,220,0.40)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(237,233,220,0.14)")}>
                        <option value="" style={{ background: "#1A1916" }}>Välj...</option>
                        <option value="u25" style={{ background: "#1A1916" }}>Under 25 000 kr</option>
                        <option value="25-100" style={{ background: "#1A1916" }}>25–100 000 kr</option>
                        <option value="100+" style={{ background: "#1A1916" }}>100 000+ kr</option>
                        <option value="unknown" style={{ background: "#1A1916" }}>Vet ej</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 6 }}>Tidshorisont</label>
                      <select name="timeline" style={{ width: "100%", background: "rgba(237,233,220,0.03)", border: "0.5px solid rgba(237,233,220,0.14)", borderRadius: 6, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif", fontSize: 13, padding: "10px 14px", outline: "none", appearance: "none", cursor: "pointer" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(237,233,220,0.40)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(237,233,220,0.14)")}>
                        <option value="" style={{ background: "#1A1916" }}>Välj...</option>
                        <option value="asap" style={{ background: "#1A1916" }}>Så snart som möjligt</option>
                        <option value="1-3m" style={{ background: "#1A1916" }}>1–3 månader</option>
                        <option value="flexible" style={{ background: "#1A1916" }}>Flexibel</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary" style={{ marginTop: 8, justifyContent: "center" }}>
                    {submitting ? "Skickar…" : "Skicka förfrågan →"}
                  </button>
                  <p style={{ fontSize: 11, color: "rgba(237,233,220,0.30)", fontFamily: "'Inter',system-ui,sans-serif", textAlign: "center" }}>
                    Svar inom 24 timmar.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Kontakt;
