import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import { setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";
import { getSupabase } from "@/lib/getSupabase";
import { FN_WITHDRAW, LEGAL_LINKS } from "@/config/aiKontoret";
import "@/styles/verkstad.css";

type FormState = {
  name: string;
  email: string;
  sessionId: string;
  product: "" | "guide" | "vault" | "bundle";
  description: string;
  confirm: boolean;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  sessionId: "",
  product: "",
  description: "",
  confirm: false,
};

const AngraKop = () => {
  const [params] = useSearchParams();
  const [form, setForm] = useState<FormState>(() => ({
    ...emptyForm,
    sessionId: params.get("session_id") ?? params.get("order") ?? "",
    email: params.get("email") ?? "",
    name: params.get("name") ?? "",
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    submitted_at: string;
    request_id: string | null;
    receipt_emailed: boolean;
  } | null>(null);

  useEffect(() => {
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Ångra köp", url: "/angra-kop" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  const fieldStyle = useMemo(
    () => ({
      width: "100%" as const,
      marginTop: 6,
      padding: "12px 14px",
      borderRadius: 10,
      border: "1px solid var(--linje)",
      background: "#fff",
      fontSize: 16,
    }),
    [],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!form.confirm) {
      setError("Du måste uttryckligen bekräfta att du vill utöva ångerrätten.");
      return;
    }
    setBusy(true);
    try {
      const supabase = await getSupabase();
      const { data, error: fnError } = await supabase.functions.invoke(FN_WITHDRAW, {
        body: {
          name: form.name,
          email: form.email,
          session_id: form.sessionId,
          product: form.product || null,
          description: form.description,
          confirm: true,
        },
      });
      if (fnError || !data?.received) {
        const reason = data?.error ?? "request_failed";
        setError(
          reason === "email_required"
            ? "Ange en giltig e-postadress."
            : reason === "name_required"
            ? "Ange ditt namn."
            : reason === "confirm_required"
            ? "Du måste bekräfta att du vill utöva ångerrätten."
            : reason === "session_invalid"
            ? "Order- eller sessions-id:t ser inte giltigt ut."
            : "Begäran kunde inte tas emot just nu. Mejla info@auroramedia.se.",
        );
        return;
      }
      setReceipt({
        submitted_at: String(data.submitted_at),
        request_id: data.request_id ?? null,
        receipt_emailed: Boolean(data.receipt_emailed),
      });
    } catch {
      setError("Begäran kunde inte tas emot just nu. Mejla info@auroramedia.se.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SEO
        title="Ångra köp | Aurora Media AB"
        description="Lämna en begäran om ångerrätt för AI-KONTORET. Du får ett mottagningsbevis med tidpunkt. Det är inte ett automatiskt beslut."
        canonical="/angra-kop"
      />
      <div className="verkstad">
        <VkNav />
        <main id="main">
          <section className="vk-section" style={{ paddingTop: "clamp(110px,14vw,160px)" }}>
            <div className="vk-wrap" style={{ maxWidth: 720 }}>
              <p className="vk-mono">Ångerfunktion · DAL 2 kap. 10 a §</p>
              <h1 style={{ marginTop: 14, marginBottom: 18 }}>Ångra köp</h1>
              <p style={{ maxWidth: 640, color: "var(--granbark-mut)", fontSize: 17, lineHeight: 1.6 }}>
                Här kan du lämna en begäran om att utöva ångerrätt för ett köp av AI-KONTORET.
                Funktionen finns bland annat när ångerrätten fortfarande kan gälla – till exempel
                om samtycket saknades eller den digitala leveransen inte har påbörjats.
              </p>
              <p style={{ maxWidth: 640, color: "var(--granbark-mut)", fontSize: 16, lineHeight: 1.6, marginTop: 12 }}>
                När du skickar formuläret får du ett <strong>mottagningsbevis</strong> med tidpunkt.
                Det bekräftar bara att vi tagit emot begäran. Det är inte ett beslut om att
                ångerrätten gäller och inte ett besked om återbetalning.
              </p>

              {receipt ? (
                <div
                  role="status"
                  style={{
                    marginTop: 28,
                    border: "1px solid var(--linje)",
                    borderRadius: 14,
                    padding: "24px 26px",
                    background: "#FDFCF8",
                  }}
                >
                  <p className="vk-mono">Mottagningsbevis</p>
                  <h2 style={{ fontSize: 24, marginTop: 10 }}>Begäran är mottagen</h2>
                  <p style={{ marginTop: 12, lineHeight: 1.65 }}>
                    Inlämnad: <strong>{receipt.submitted_at}</strong>
                  </p>
                  {receipt.request_id && (
                    <p style={{ marginTop: 8, lineHeight: 1.65 }}>
                      Referens: <strong>{receipt.request_id}</strong>
                    </p>
                  )}
                  <p style={{ marginTop: 12, color: "var(--granbark-mut)", lineHeight: 1.65 }}>
                    {receipt.receipt_emailed
                      ? "Ett mottagningsbevis har också skickats till din e-post."
                      : "Vi har sparat begäran. Om mejlet inte kom fram, spara tidpunkten ovan och skriv till info@auroramedia.se."}
                  </p>
                  <p style={{ marginTop: 12, color: "var(--granbark-mut)", lineHeight: 1.65 }}>
                    Vi granskar ärendet manuellt. Status börjar som mottagen och kan därefter bli
                    under granskning, accepterad, avvisad eller återbetald – utan automatiskt
                    juridiskt beslut.
                  </p>
                  <p style={{ marginTop: 16 }}>
                    <Link to={LEGAL_LINKS.villkor} style={{ fontWeight: 600 }}>
                      Tillbaka till villkoren
                    </Link>
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} style={{ marginTop: 28, display: "grid", gap: 16 }}>
                  <label>
                    Namn
                    <input
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      style={fieldStyle}
                    />
                  </label>
                  <label>
                    E-post
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      style={fieldStyle}
                    />
                  </label>
                  <label>
                    Stripe session- eller order-id (rekommenderas, t.ex. cs_…)
                    <input
                      value={form.sessionId}
                      onChange={(e) => setForm((f) => ({ ...f, sessionId: e.target.value }))}
                      placeholder="cs_test_… eller order-id"
                      style={fieldStyle}
                    />
                  </label>
                  <label>
                    Produkt (valfritt)
                    <select
                      value={form.product}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, product: e.target.value as FormState["product"] }))
                      }
                      style={fieldStyle}
                    >
                      <option value="">Välj om du vet</option>
                      <option value="guide">AI-KONTORET Guide</option>
                      <option value="vault">Prompt Vault</option>
                      <option value="bundle">Bundle (Guide + Vault)</option>
                    </select>
                  </label>
                  <label>
                    Beskriv köpet (valfritt)
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={4}
                      style={{ ...fieldStyle, minHeight: 96 }}
                    />
                  </label>
                  <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <input
                      type="checkbox"
                      checked={form.confirm}
                      onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.checked }))}
                      style={{ marginTop: 4 }}
                    />
                    <span>
                      Jag vill utöva ångerrätten för det angivna köpet. Jag förstår att detta är en
                      begäran, inte ett automatiskt godkännande.
                    </span>
                  </label>
                  {error && (
                    <p role="alert" style={{ color: "#9B1D1D", fontWeight: 600 }}>
                      {error}
                    </p>
                  )}
                  <button type="submit" className="vk-btn vk-btn-primary" disabled={busy}>
                    <span>{busy ? "Skickar…" : "Skicka begäran"}</span>
                  </button>
                </form>
              )}

              <p style={{ marginTop: 28, fontSize: 14, color: "var(--granbark-mut)", lineHeight: 1.6 }}>
                Du kan också skriva till{" "}
                <a href="mailto:info@auroramedia.se" style={{ fontWeight: 600 }}>
                  info@auroramedia.se
                </a>
                . Standardinformation om ångerrätt:{" "}
                <a
                  href="https://www.konsumentverket.se/for-konsument/kopa-varor-och-tjanster/angerratt/"
                  rel="noopener noreferrer"
                >
                  Konsumentverket
                </a>
                . Villkor: <Link to={LEGAL_LINKS.villkor}>/villkor#ai-kontoret</Link>.
              </p>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default AngraKop;
