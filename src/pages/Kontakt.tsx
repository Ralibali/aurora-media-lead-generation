import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { toast } from "sonner";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const BORDER = "rgba(237, 233, 220, 0.15)";

const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(237, 233, 220, 0.04)",
  border: `0.5px solid ${BORDER}`,
  borderRadius: "8px",
  color: "#EDE9DC",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "14px",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
};

const InputField = ({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) => (
  <div>
    <label
      htmlFor={name}
      className="block font-sans text-[13px] font-medium mb-1.5"
      style={{ color: "rgba(237, 233, 220, 0.80)" }}
    >
      {label}{required && " *"}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(237, 233, 220, 0.40)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
    />
  </div>
);

const Kontakt = () => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setSEOMeta({
      title: "Kontakt — begär offert | Aurora Media",
      description:
        "Berätta vad ni vill bygga. Vi återkommer med offert inom 24 timmar. Fast pris, veckor inte månader.",
      canonical: "/kontakt",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Kontakt", url: "/kontakt" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setDone(true);
      toast.success("Tack! Vi hör av oss inom 24 timmar.");
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Något gick fel. Mejla istället info@auroramedia.se");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">
        <section className="section-pad pt-[120px]">
          <div className="site-container">
            <p className="eyebrow mb-4">Kontakt</p>
            <h1 className="hero-h1 text-cream max-w-[560px]">
              Berätta vad ni
              <br />
              vill <em>bygga.</em>
            </h1>
          </div>
        </section>

        <section className="section-pad">
          <div style={{ height: "0.5px", backgroundColor: BORDER }} />
          <div className="site-container pt-14">
            <div className="grid gap-14 sm:grid-cols-[1fr_1.2fr]">
              {/* Left: contact info */}
              <div>
                <a
                  href="mailto:info@auroramedia.se"
                  className="big-h2 text-cream block transition-opacity hover:opacity-70 group mb-4"
                >
                  info@auroramedia.se{" "}
                  <span className="font-serif" style={{ fontStyle: "italic" }}>↗</span>
                </a>
                <p className="font-sans text-[14px]" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
                  Svar inom 24 timmar.
                </p>

                <div className="mt-10 space-y-3">
                  {[
                    ["Plats", "Linköping, Sverige"],
                    ["Org.nr", "559272-0220"],
                    ["VAT", "SE559272022001"],
                    ["Leverans", "Veckor, inte månader"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b py-2.5" style={{ borderColor: BORDER, borderWidth: "0.5px" }}>
                      <span className="font-sans text-[12px]" style={{ color: "rgba(237, 233, 220, 0.50)" }}>{k}</span>
                      <span className="font-sans text-[12px] text-cream">{v}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-8 font-sans text-[13px]" style={{ color: "rgba(237, 233, 220, 0.50)" }}>
                  Föredrar du att boka ett samtal direkt?
                </p>
                <a
                  href="https://cal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center font-sans text-[13px] transition-opacity hover:opacity-70"
                  style={{ color: "rgba(237, 233, 220, 0.80)" }}
                >
                  Boka 30 min direkt ↗
                </a>
              </div>

              {/* Right: form */}
              <div>
                {done ? (
                  <div
                    className="rounded-lg p-8 text-center"
                    style={{ border: `0.5px solid ${BORDER}` }}
                  >
                    <h2 className="section-h2 text-cream mb-3">Tack!</h2>
                    <p className="font-sans text-[14px]" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
                      Vi hör av oss inom 24 timmar med en första bedömning.
                    </p>
                    <button
                      onClick={() => setDone(false)}
                      className="mt-6 font-sans text-[13px] underline transition-opacity hover:opacity-70"
                      style={{ color: "rgba(237, 233, 220, 0.65)" }}
                    >
                      Skicka en ny förfrågan
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputField label="Namn" name="name" required />
                      <InputField label="Företag" name="company" />
                    </div>
                    <InputField label="E-post" name="email" type="email" required />

                    <div>
                      <label
                        htmlFor="what"
                        className="block font-sans text-[13px] font-medium mb-1.5"
                        style={{ color: "rgba(237, 233, 220, 0.80)" }}
                      >
                        Vad vill ni bygga *
                      </label>
                      <textarea
                        id="what"
                        name="what"
                        required
                        minLength={20}
                        maxLength={2000}
                        rows={5}
                        placeholder="Beskriv idén, problemet eller processen ni vill lösa..."
                        style={{ ...inputStyle, resize: "vertical" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(237, 233, 220, 0.40)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="budget"
                        className="block font-sans text-[13px] font-medium mb-1.5"
                        style={{ color: "rgba(237, 233, 220, 0.80)" }}
                      >
                        Önskad budget
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(237, 233, 220, 0.40)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
                      >
                        <option value="" style={{ backgroundColor: "#1A1916" }}>Välj...</option>
                        <option value="under25k" style={{ backgroundColor: "#1A1916" }}>Under 25 000 kr</option>
                        <option value="25-100k" style={{ backgroundColor: "#1A1916" }}>25–100 000 kr</option>
                        <option value="100k+" style={{ backgroundColor: "#1A1916" }}>100 000+ kr</option>
                        <option value="unknown" style={{ backgroundColor: "#1A1916" }}>Vet ej</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="timeline"
                        className="block font-sans text-[13px] font-medium mb-1.5"
                        style={{ color: "rgba(237, 233, 220, 0.80)" }}
                      >
                        Tidshorisont
                      </label>
                      <select
                        id="timeline"
                        name="timeline"
                        style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(237, 233, 220, 0.40)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
                      >
                        <option value="" style={{ backgroundColor: "#1A1916" }}>Välj...</option>
                        <option value="asap" style={{ backgroundColor: "#1A1916" }}>Så snart som möjligt</option>
                        <option value="1-3m" style={{ backgroundColor: "#1A1916" }}>1–3 månader</option>
                        <option value="3-6m" style={{ backgroundColor: "#1A1916" }}>3–6 månader</option>
                        <option value="flexible" style={{ backgroundColor: "#1A1916" }}>Flexibel</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-lg px-5 py-3 font-sans text-[13px] font-medium transition-opacity hover:opacity-85 disabled:opacity-50"
                      style={{ backgroundColor: "#EDE9DC", color: "#100F0D" }}
                    >
                      {submitting ? "Skickar…" : "Skicka förfrågan →"}
                    </button>

                    <p className="font-sans text-[12px] text-center" style={{ color: "rgba(237, 233, 220, 0.40)" }}>
                      Vi återkommer inom 24 timmar med en första bedömning.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Kontakt;
