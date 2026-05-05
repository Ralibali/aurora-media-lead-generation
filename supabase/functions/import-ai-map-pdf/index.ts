// Edge Function: import-ai-map-pdf
// Tar emot en ifylld Aurora AI-karta PDF (base64), läser AcroForm-fälten med pdf-lib
// och anropar submit-ai-map internt så all scoring + AI-analys + lagring delas.
import { PDFDocument, PDFCheckBox, PDFRadioGroup, PDFTextField } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAIN_AREAS = [
  "Administration", "Kundservice/support",
  "Sälj och offerter", "Ekonomi och fakturor",
  "Rapportering/Excel", "Intern kunskap och rutiner",
  "Projektledning", "HR/onboarding",
  "Lager/logistik", "Annat",
];

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function decodeBase64(b64: string): Uint8Array {
  const clean = b64.replace(/^data:application\/pdf;base64,/, "");
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function getText(form: ReturnType<PDFDocument["getForm"]>, name: string): string {
  try {
    const f = form.getField(name);
    if (f instanceof PDFTextField) return (f.getText() ?? "").trim();
  } catch { /* missing */ }
  return "";
}
function getCheck(form: ReturnType<PDFDocument["getForm"]>, name: string): boolean {
  try {
    const f = form.getField(name);
    if (f instanceof PDFCheckBox) return f.isChecked();
  } catch { /* missing */ }
  return false;
}
function getRadio(form: ReturnType<PDFDocument["getForm"]>, name: string): string {
  try {
    const f = form.getField(name);
    if (f instanceof PDFRadioGroup) return f.getSelected() ?? "";
  } catch { /* missing */ }
  return "";
}

const FREQ_OK = new Set(["daily", "weekly", "monthly", "rare"]);
const TIME_OK = new Set(["0-1", "1-3", "3-5", "5-10", "10+"]);
const YPN_OK = new Set(["yes", "partial", "no"]);
const VALUE_OK = new Set(["high", "medium", "low"]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { pdf_base64 } = await req.json();
    if (typeof pdf_base64 !== "string" || pdf_base64.length < 100) {
      return new Response(JSON.stringify({ error: "PDF saknas eller är ogiltig." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let bytes: Uint8Array;
    try {
      bytes = decodeBase64(pdf_base64);
    } catch {
      return new Response(JSON.stringify({ error: "Kunde inte läsa PDF-filen." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let pdf: PDFDocument;
    try {
      pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    } catch (e) {
      console.error("[import-ai-map-pdf] PDF load failed", e);
      return new Response(
        JSON.stringify({ error: "Filen ser inte ut som en giltig PDF. Säkerställ att du laddar upp Aurora AI-kartans arbetsblad." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const form = pdf.getForm();

    const company_name = getText(form, "company_name");
    const industry = getText(form, "industry");
    const employee_count = getText(form, "employee_count");
    const contact_name = getText(form, "contact_name");
    const email = getText(form, "email");
    const consent = getCheck(form, "consent");

    const pain_areas = PAIN_AREAS.filter((a) => getCheck(form, `pain_${slug(a)}`));

    const processes: Array<Record<string, string>> = [];
    for (let i = 1; i <= 3; i++) {
      const process_name = getText(form, `p${i}_process_name`);
      const systems = getText(form, `p${i}_systems`);
      const frequency = getRadio(form, `p${i}_frequency`);
      const weekly_time = getRadio(form, `p${i}_weekly_time`);
      const rule_based = getRadio(form, `p${i}_rule_based`);
      const data_available = getRadio(form, `p${i}_data_available`);
      const business_value = getRadio(form, `p${i}_business_value`);

      // Bara ta med om något är ifyllt – men kräv hela uppsättningen vid scoring
      if (!process_name && !frequency && !weekly_time) continue;
      processes.push({
        process_name, systems,
        frequency, weekly_time,
        rule_based, data_available, business_value,
      });
    }

    // Validering med tydliga fel innan vi anropar submit
    const missing: string[] = [];
    if (!company_name) missing.push("Företagsnamn");
    if (!industry) missing.push("Bransch");
    if (!employee_count) missing.push("Antal anställda");
    if (!contact_name) missing.push("Kontaktperson");
    if (!email) missing.push("E-post");
    if (!consent) missing.push("Samtycke (kryssrutan på sista sidan)");
    if (processes.length < 1) missing.push(`Minst 1 process (du har fyllt i ${processes.length})`);

    for (let i = 0; i < processes.length; i++) {
      const p = processes[i];
      const idx = i + 1;
      if (!p.process_name) missing.push(`Process ${idx}: namn`);
      if (!FREQ_OK.has(p.frequency)) missing.push(`Process ${idx}: hur ofta`);
      if (!TIME_OK.has(p.weekly_time)) missing.push(`Process ${idx}: tid per vecka`);
      if (!YPN_OK.has(p.rule_based)) missing.push(`Process ${idx}: regelstyrd`);
      if (!YPN_OK.has(p.data_available)) missing.push(`Process ${idx}: data finns`);
      if (!VALUE_OK.has(p.business_value)) missing.push(`Process ${idx}: affärsnytta`);
    }

    if (missing.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Vi kunde inte läsa alla obligatoriska fält i PDF:en.",
          missing,
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Anropa submit-ai-map så all scoring + AI-analys + lagring delas
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    if (!SUPABASE_URL || !ANON_KEY) {
      return new Response(JSON.stringify({ error: "Server-konfiguration saknas." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const submitBody = {
      company_name, industry, employee_count, contact_name, email,
      pain_areas, consent,
      processes,
      website: "", // honeypot tom
    };

    const submitResp = await fetch(`${SUPABASE_URL}/functions/v1/submit-ai-map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ANON_KEY}`,
        apikey: ANON_KEY,
        // Forward klient-info för IP/UA-spårning
        "x-forwarded-for": req.headers.get("x-forwarded-for") ?? "",
        "user-agent": req.headers.get("user-agent") ?? "aurora-pdf-import",
      },
      body: JSON.stringify(submitBody),
    });

    const submitJson = await submitResp.json().catch(() => ({}));
    if (!submitResp.ok || !submitJson?.ok) {
      console.error("[import-ai-map-pdf] submit-ai-map failed", submitResp.status, submitJson);
      return new Response(
        JSON.stringify({ error: submitJson?.error || "Kunde inte räkna fram analysen." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        ...submitJson,
        meta: { company_name, contact_name, email },
        source: "pdf_upload",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[import-ai-map-pdf] unexpected", err);
    return new Response(
      JSON.stringify({ error: "Oväntat fel vid PDF-import. Försök igen eller fyll i digitalt." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
