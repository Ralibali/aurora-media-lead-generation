import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TriangleAlert as AlertTriangle, CalendarCheck, Check, Copy, Download, Loader as Loader2, Mail, RefreshCw, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import "@/styles/verkstad.css";
import { VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setSEOMeta } from "@/lib/seoHelpers";
import type { AiMapResult, ScoredProcess, TierKey } from "@/lib/aiMap";
import { FREQ_LABELS, TIME_LABELS, TIERS, tierForProcess } from "@/lib/aiMap";
import { downloadAiMapPdf, aiMapPdfBase64, aiMapPdfFilename } from "@/lib/aiMapPdf";
import { trackAiKartaClick } from "@/lib/aiKartaTracking";
import { getSupabase } from "@/lib/getSupabase";
import { trackEvent } from "@/lib/analytics";

const RESULT_KEY = "ai_map_result";
const HOURLY_RATE = 600;   // kr/h intern arbetstid – från AI-kartans värdemätare
const WEEKS_PER_MONTH = 4.33;
// Klistra in din Cal.com/Calendly-länk här. Lämnas den tom används bokningsdialogen som idag.
const BOOKING_URL = "";

type LoadStatus = "loading" | "ready" | "missing" | "error";

function fmtKr(n: number): string {
  return `${Math.round(n).toLocaleString("sv-SE").replace(/,/g, " ")} kr`;
}

function formatDate(d?: string): string {
  const date = d ? new Date(d) : new Date();
  return date.toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" });
}

const AiKartaResultat = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("t")?.trim() || "";

  const [result, setResult] = useState<AiMapResult | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [pdfMailStatus, setPdfMailStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  // Async personlig AI-analys (bara om ai_analysis saknas på leaden)
  const [liveAnalysis, setLiveAnalysis] = useState<{ heading: string; body: string } | null>(null);
  const [liveAnalysisLoading, setLiveAnalysisLoading] = useState(false);

  // Booking dialog
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [bookingErr, setBookingErr] = useState<string | null>(null);
  const [bookForm, setBookForm] = useState({ name: "", email: "", phone: "", preferred_time: "", message: "", website: "" });
  const [bookFieldErrors, setBookFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setSEOMeta({
      title: "Er AI-karta · Resultat | Aurora Media",
      description: "Personlig AI-karta med rekommenderad nivå, tidsbesparing och första steg.",
      canonical: "https://auroramedia.se/ai-karta/resultat",
      noindex: true,
    });
  }, []);

  // Ladda resultatet: token via /ai-karta/resultat?t=... har prioritet, annars sessionStorage
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStatus("loading");
      try {
        if (token) {
          const supabase = await getSupabase();
          const { data, error } = await supabase.functions.invoke("get-ai-map-result", {
            body: { token },
          });
          if (cancelled) return;
          if (error || !data || (data as { error?: string }).error) {
            setErrorMsg("Länken är ogiltig eller har gått ut.");
            setStatus("error");
            return;
          }
          const parsed = data as AiMapResult;
          setResult(parsed);
          setStatus(parsed.processes?.length ? "ready" : "error");
          trackEvent("ai_karta_result_viewed", { source: "share_token" });
          return;
        }
        const raw = sessionStorage.getItem(RESULT_KEY);
        if (!raw) { setStatus("missing"); return; }
        const parsed = JSON.parse(raw) as AiMapResult;
        if (!parsed || !parsed.top3 || parsed.top3.length === 0) {
          setErrorMsg("Resultatet verkar vara tomt eller skadat.");
          setStatus("error");
          return;
        }
        setResult(parsed);
        setStatus("ready");
        trackEvent("ai_karta_result_viewed", { source: "session" });
      } catch (err) {
        console.error("[AiKartaResultat] load failed", err);
        setErrorMsg(err instanceof Error ? err.message : "Okänt fel vid inläsning.");
        setStatus("error");
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [token]);

  // Hämta live-analys om ai_analysis saknas
  useEffect(() => {
    if (!result || result.ai_analysis || liveAnalysis || liveAnalysisLoading) return;
    setLiveAnalysisLoading(true);
    const industry = result.meta?.industry || "okänd bransch";
    const topName = result.top3?.[0]?.process_name || result.processes?.[0]?.process_name || "";
    const rows = (result.processes ?? []).slice(0, 6).map((p) => `• ${p.process_name} (score ${p.score}, ${p.potential})`).join("\n");
    const context = `Bransch: ${industry}. Företag: ${result.meta?.company_name || ""}.\nProcesser med score/potential:\n${rows}\n\nToppområde: ${topName}.`;
    const topic = `AI-karta för ${result.meta?.company_name || "kund"} – 3–4 meningar på svenska: vad som sticker ut, vilken process de ska börja med och varför. Ingen säljfras.`;
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.functions.invoke("generate-text", {
          body: { textType: "landing-section", topic, context, maxLength: 700 },
        });
        if (error) throw error;
        const c = (data as { content?: { heading?: string; paragraphs?: string[] } })?.content;
        if (!c || !Array.isArray(c.paragraphs) || c.paragraphs.length === 0) return;
        setLiveAnalysis({ heading: c.heading || "Vad kartan säger", body: c.paragraphs.join("\n\n") });
      } catch (err) {
        // Tyst fail – panelen göms
        console.warn("[AiKartaResultat] generate-text failed", err);
      } finally {
        setLiveAnalysisLoading(false);
      }
    })();
  }, [result, liveAnalysis, liveAnalysisLoading]);

  // Mejla PDF:en automatiskt direkt efter wizarden (färskt resultat, ej delningslänk).
  // Körs en gång per lead – sker tyst i bakgrunden, status visas vid PDF-knappen.
  useEffect(() => {
    if (!result || token) return; // token i URL = delad länk, skicka inte igen
    if (!result.shareToken || !result.meta?.email) return;
    const guardKey = `aik_pdf_mail:${result.leadId || result.shareToken}`;
    if (sessionStorage.getItem(guardKey)) {
      setPdfMailStatus("sent");
      return;
    }
    let cancelled = false;
    setPdfMailStatus("sending");
    (async () => {
      try {
        const share = `${window.location.origin}/ai-karta/resultat?t=${encodeURIComponent(result.shareToken!)}`;
        const pdfBase64 = aiMapPdfBase64(result, { shareUrl: share });
        const supabase = await getSupabase();
        const { data, error } = await supabase.functions.invoke("send-ai-map-pdf", {
          body: { token: result.shareToken, pdfBase64, filename: aiMapPdfFilename(result) },
        });
        if (cancelled) return;
        if (error || (data as { error?: string })?.error) throw error ?? new Error((data as { error?: string }).error);
        sessionStorage.setItem(guardKey, "1");
        setPdfMailStatus("sent");
        trackEvent("ai_karta_pdf_emailed", { company: result.meta.company_name });
      } catch (err) {
        console.warn("[AiKartaResultat] auto-PDF-mejl misslyckades", err);
        if (!cancelled) setPdfMailStatus("failed");
      }
    })();
    return () => { cancelled = true; };
  }, [result, token]);

  // Härledda värden
  const derived = useMemo(() => {
    if (!result) return null;
    const processes = (result.processes ?? []).slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const totalSavedPerWeek = result.totalSavedPerWeek ?? processes.reduce((s, p) => s + (p.saved_hours_per_week ?? 0), 0);
    const savedPerMonth = Math.round(totalSavedPerWeek * WEEKS_PER_MONTH * 10) / 10;
    const monthlyCost = Math.round(totalSavedPerWeek * WEEKS_PER_MONTH * HOURLY_RATE);
    const topProcess = processes[0] ?? null;
    const topTier: TierKey | null = topProcess ? tierForProcess(topProcess) : null;
    const paybackMonths = topTier && monthlyCost > 0 ? Math.max(1, Math.round(TIERS[topTier].price / monthlyCost)) : null;
    const maxScore = processes.reduce((m, p) => Math.max(m, p.score ?? 0), 0) || 16;
    return { processes, totalSavedPerWeek, savedPerMonth, monthlyCost, topProcess, topTier, paybackMonths, maxScore };
  }, [result]);

  if (status === "loading") return <ResultState kind="loading" />;
  if (status === "missing") return <ResultState kind="missing" onPrimary={() => navigate("/ai-karta/start")} />;
  if (status === "error" || !result || !derived) {
    return <ResultState kind="error" message={errorMsg ?? undefined} onPrimary={() => navigate("/ai-karta/start")} onSecondary={() => window.location.reload()} />;
  }

  const { meta, total_potential } = result;
  const { processes, totalSavedPerWeek, savedPerMonth, monthlyCost, topProcess, topTier, paybackMonths, maxScore } = derived;

  const shareUrl = (result.shareToken || token)
    ? `${window.location.origin}/ai-karta/resultat?t=${encodeURIComponent(result.shareToken || token)}`
    : null;

  const analysis = result.ai_analysis
    ? { heading: "Vad vi ser i era svar", body: [result.ai_analysis.executive_summary, result.ai_analysis.overall_recommendation].filter(Boolean).join("\n\n") }
    : liveAnalysis;

  const handlePrint = () => {
    void trackAiKartaClick("result_pdf_download");
    try {
      downloadAiMapPdf(result, { shareUrl });
      toast.success("PDF skapad");
    } catch (err) {
      console.error("[AiKartaResultat] PDF-export misslyckades", err);
      toast.error("Kunde inte skapa PDF");
    }
  };

  const handleResend = async () => {
    if (sending || !meta.email) {
      if (!meta.email) toast.info("Mejladress finns inte tillgänglig via delad länk.");
      return;
    }
    setSending(true);
    void trackAiKartaClick("result_resend_email");
    const tId = toast.loading(`Skickar analysen till ${meta.email}…`);
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.functions.invoke("resend-ai-map-email", {
        body: {
          email: meta.email, contact_name: meta.contact_name, company_name: meta.company_name,
          total_potential, top3: result.top3, totalSavedPerWeek, totalSavedPerYear: result.totalSavedPerYear,
        },
      });
      if (error || (data as { error?: string })?.error) {
        throw new Error((data as { error?: string })?.error || error?.message || "Okänt fel");
      }
      toast.success(`Mail skickat till ${meta.email}`, { id: tId });
    } catch (err) {
      console.error("[resend-ai-map-email]", err);
      toast.error("Kunde inte skicka mailet", { id: tId });
    } finally { setSending(false); }
  };

  const copyShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      trackEvent("ai_karta_share_copy", { company: meta.company_name });
      toast.success("Länk kopierad");
    } catch { toast.error("Kunde inte kopiera länken"); }
  };

  const openBooking = () => {
    void trackAiKartaClick("booking_open");
    if (BOOKING_URL) {
      window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
      return;
    }
    setBookingErr(null); setBookingStatus("idle"); setBookFieldErrors({});
    const topName = topProcess?.process_name || "";
    setBookForm((f) => ({
      ...f,
      name: f.name || meta.contact_name || "",
      email: f.email || meta.email || "",
      message: f.message || (topName ? `Vi vill titta närmare på "${topName}" som första projekt.` : ""),
    }));
    setBookingOpen(true);
  };

  const BookingSchema = z.object({
    name: z.string().trim().min(2, "Ange ditt namn").max(80),
    email: z.string().trim().email("Ogiltig e-postadress").max(160),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    preferred_time: z.string().trim().max(120).optional().or(z.literal("")),
    message: z.string().trim().max(1000).optional().or(z.literal("")),
  });

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingStatus === "submitting") return;
    setBookingErr(null); setBookFieldErrors({});
    const parsed = BookingSchema.safeParse(bookForm);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const iss of parsed.error.issues) {
        const k = iss.path[0]?.toString() ?? "form";
        if (!fe[k]) fe[k] = iss.message;
      }
      setBookFieldErrors(fe); return;
    }
    setBookingStatus("submitting");
    void trackAiKartaClick("booking_submit");
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.functions.invoke("book-ai-genomlysning", {
        body: {
          contact_name: parsed.data.name, email: parsed.data.email,
          company_name: meta.company_name, phone: parsed.data.phone,
          preferred_time: parsed.data.preferred_time, message: parsed.data.message,
          total_potential, totalSavedPerYear: result.totalSavedPerYear,
          topProcesses: (result.top3 ?? []).map((p) => p.process_name),
          website: bookForm.website,
        },
      });
      if (error || (data as { error?: string })?.error) {
        throw new Error((data as { error?: string })?.error || error?.message || "Okänt fel");
      }
      setBookingStatus("success");
      trackEvent("genomlysning_bokad", { company: meta.company_name });
      toast.success("Bokningsförfrågan skickad");
    } catch (err) {
      console.error("[book-ai-genomlysning]", err);
      setBookingStatus("idle");
      setBookingErr(err instanceof Error ? err.message : "Något gick fel. Försök igen.");
    }
  };

  const mailtoHref = shareUrl
    ? `mailto:?subject=${encodeURIComponent(`AI-karta för ${meta.company_name}`)}&body=${encodeURIComponent(`Hej,\n\nHär är vår AI-karta från Aurora Media:\n${shareUrl}\n`)}`
    : "";

  return (
    <div className="verkstad">
      <VkNav />
      <main id="main">
        <section className="vk-section" style={{ paddingTop: "clamp(96px,12vw,140px)" }}>
          <div className="vk-wrap">
            {/* Rubrik */}
            <p className="vk-mono">AI-karta · {formatDate(result.created_at)} · {meta.industry || "okänd bransch"}</p>
            <h1 style={{ marginTop: 14, marginBottom: 18 }}>
              Er AI-karta, {meta.company_name}
            </h1>
            <p style={{ maxWidth: 640, color: "var(--granbark-mut)", fontSize: 17, lineHeight: 1.6 }}>
              {processes.length} processer analyserade. Nedan ser ni potentialen per område, uppskattad tidsbesparing och en rekommenderad nivå för första bygget.
            </p>

            {/* Summerings-kvitto */}
            <div style={{ marginTop: 40 }}>
              <ReceiptSummary
                totalPotential={total_potential}
                savedPerMonth={savedPerMonth}
                monthlyCost={monthlyCost}
                topTier={topTier}
                paybackMonths={paybackMonths}
                topName={topProcess?.process_name || null}
              />
            </div>

            {/* Inline-CTA direkt efter kvittot */}
            <div style={{
              marginTop: 16,
              background: "var(--gran-soft)",
              border: "1px solid var(--linje)",
              borderRadius: 12,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}>
              <p style={{ fontSize: 14.5, color: "var(--granbark)", lineHeight: 1.5 }}>
                Vill ni att jag pekar ut första bygget? 20 minuter, inga köpkrav.
              </p>
              <button type="button" onClick={openBooking} className="vk-btn vk-btn-primary" style={{ whiteSpace: "nowrap" }}>
                Boka 20 min – gratis
              </button>
            </div>

            {/* Personlig analys */}
            {(analysis || liveAnalysisLoading) && (
              <div style={{
                marginTop: 32,
                background: "var(--gran-soft)",
                border: "1px solid var(--linje)",
                borderRadius: 14,
                padding: "24px 26px",
              }}>
                <p className="vk-mono" style={{ color: "var(--gran)" }}>Analys</p>
                {liveAnalysisLoading && !analysis ? (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ height: 14, width: "70%", background: "rgba(15,81,50,0.12)", borderRadius: 4, marginBottom: 10 }} />
                    <div style={{ height: 14, width: "94%", background: "rgba(15,81,50,0.10)", borderRadius: 4, marginBottom: 10 }} />
                    <div style={{ height: 14, width: "82%", background: "rgba(15,81,50,0.10)", borderRadius: 4 }} />
                  </div>
                ) : (
                  <>
                    <h3 style={{ marginTop: 12, marginBottom: 10, fontSize: 20 }}>{analysis!.heading}</h3>
                    <p style={{ color: "var(--granbark)", fontSize: 16, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                      {analysis!.body}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Kartan – alla processer */}
            <div style={{ marginTop: 40 }}>
              <p className="vk-mono">Karta · alla processer</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                {processes.map((p, i) => (
                  <ProcessRow
                    key={`${p.position}-${i}`}
                    process={p}
                    maxScore={maxScore}
                    isTop={i === 0}
                  />
                ))}
              </div>
              {topProcess && (
                <p style={{ marginTop: 14, color: "var(--granbark-mut)", fontSize: 14 }}>
                  <strong style={{ color: "var(--granbark)" }}>"{topProcess.process_name}"</strong> hamnar först: högst potential ({topProcess.potential.toLowerCase()}) och mest tid att vinna
                  {(topProcess.saved_hours_per_week ?? 0) > 0 && ` (~${topProcess.saved_hours_per_week} h/vecka)`}.
                </p>
              )}
            </div>

            {/* Delbarhet & PDF */}
            <div style={{ marginTop: 40 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <button type="button" onClick={handlePrint} className="vk-btn vk-btn-primary">
                  <Download size={16} /> Ladda ner AI-kartan som PDF
                </button>
                {shareUrl && (
                  <>
                    <button type="button" onClick={copyShare} className="vk-btn vk-btn-ghost">
                      <Copy size={16} /> Kopiera länk
                    </button>
                    <a href={mailtoHref} className="vk-btn vk-btn-ghost" onClick={() => trackEvent("ai_karta_share_email", { company: meta.company_name })}>
                      <Share2 size={16} /> Skicka till kollega
                    </a>
                  </>
                )}
                {meta.email && !result.shareToken && (
                  <button type="button" onClick={handleResend} disabled={sending} className="vk-btn vk-btn-ghost">
                    {sending ? <><Loader2 size={16} className="animate-spin" /> Skickar…</> : <><Mail size={16} /> Mejla mig analysen</>}
                  </button>
                )}
              </div>
              {meta.email && pdfMailStatus === "sending" && (
                <p style={{ marginTop: 10, fontSize: 13.5, color: "var(--granbark-mut)", display: "flex", alignItems: "center", gap: 7 }}>
                  <Loader2 size={14} className="animate-spin" /> Skickar PDF:en till {meta.email}…
                </p>
              )}
              {meta.email && pdfMailStatus === "sent" && (
                <p style={{ marginTop: 10, fontSize: 13.5, color: "var(--gran)", display: "flex", alignItems: "center", gap: 7 }}>
                  <Check size={14} strokeWidth={3} /> PDF:en är skickad till {meta.email} – kolla skräpposten om den inte dyker upp.
                </p>
              )}
            </div>

            <p style={{ marginTop: 18, fontSize: 13, color: "var(--granbark-mut)" }}>
              Uppskattningarna baseras på era svar och en schablon på {HOURLY_RATE} kr/h intern arbetstid. Exakt scope kräver genomgång av processer, system och data.
            </p>
          </div>
        </section>

        {/* Mörk konverteringspanel */}
        <section style={{ background: "#14171A", color: "#F6F5F1", padding: "clamp(56px,8vw,88px) 0" }}>
          <div className="vk-wrap">
            <p style={{ fontFamily: "'Spline Sans Mono',ui-monospace,monospace", fontSize: 12.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(246,245,241,0.55)", marginBottom: 16 }}>
              Nästa steg
            </p>
            <h2 style={{ fontFamily: "'Schibsted Grotesk',system-ui,sans-serif", color: "#F6F5F1", fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 16 }}>
              Vill ni bygga bort {topProcess ? `"${topProcess.process_name}"` : "det största tidsläckaget"}?
            </h2>
            <p style={{ color: "rgba(246,245,241,0.75)", fontSize: 17, lineHeight: 1.65, maxWidth: 620, marginBottom: 24 }}>
              Boka en gratis AI-genomlysning (20 min) så går vi igenom kartan tillsammans. Jag tar in två nya projekt per månad.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button type="button" onClick={openBooking} className="vk-btn vk-btn-primary">
                Boka gratis AI-genomlysning →
              </button>
            </div>
            <p style={{ marginTop: 18, fontSize: 13, color: "rgba(246,245,241,0.50)" }}>
              Inget säljmanus · Ärligt besked · Svar inom 24 h
            </p>
          </div>
        </section>
      </main>
      <VkFooter />
      {bookingStatus !== "success" && <div style={{ height: 84 }} />}

      {/* Sticky konverteringsbar */}
      {bookingStatus !== "success" && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
          background: "rgba(20,23,26,0.94)", backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(246,245,241,0.12)",
          padding: "12px 20px",
        }}>
          <div style={{
            maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 14, flexWrap: "wrap",
          }}>
            <p style={{ margin: 0, color: "#F6F5F1", fontSize: 14.5, fontWeight: 600 }}>
              Gratis AI-genomlysning (20 min)
              <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: "rgba(246,245,241,0.6)" }}>
                Vi går igenom kartan tillsammans – inga köpkrav.
              </span>
            </p>
            <button type="button" onClick={openBooking} className="vk-btn vk-btn-primary" style={{ whiteSpace: "nowrap" }}>
              Boka tid <CalendarCheck size={15} />
            </button>
          </div>
        </div>
      )}

      <Dialog open={bookingOpen} onOpenChange={(o) => { if (!o && bookingStatus === "submitting") return; setBookingOpen(o); }}>
        <DialogContent className="sm:max-w-lg">
          {bookingStatus === "success" ? (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary ring-4 ring-primary/10">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <DialogHeader className="mt-4">
                <DialogTitle className="text-center text-2xl">Tack – vi hör av oss!</DialogTitle>
                <DialogDescription className="text-center">
                  Vi skickar en kalenderinbjudan inom kort till <strong className="text-foreground">{bookForm.email}</strong>.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6 sm:justify-center">
                <Button onClick={() => setBookingOpen(false)} className="w-full sm:w-auto">Stäng</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Boka gratis AI-genomlysning</DialogTitle>
                <DialogDescription>20 min via Teams/Meet. Vi går igenom kartan tillsammans. Inga köpkrav.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submitBooking} className="mt-2 space-y-4" noValidate>
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <Label htmlFor="book-website">Webbplats</Label>
                  <Input id="book-website" tabIndex={-1} autoComplete="off" value={bookForm.website} onChange={(e) => setBookForm((f) => ({ ...f, website: e.target.value }))} />
                </div>
                <FormField label="Namn" id="book-name" value={bookForm.name} err={bookFieldErrors.name} disabled={bookingStatus === "submitting"} onChange={(v) => setBookForm((f) => ({ ...f, name: v }))} required />
                <FormField label="E-post" id="book-email" type="email" value={bookForm.email} err={bookFieldErrors.email} disabled={bookingStatus === "submitting"} onChange={(v) => setBookForm((f) => ({ ...f, email: v }))} required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Telefon (valfritt)" id="book-phone" value={bookForm.phone} disabled={bookingStatus === "submitting"} onChange={(v) => setBookForm((f) => ({ ...f, phone: v }))} />
                  <FormField label="Önskad tid (valfritt)" id="book-time" placeholder="t.ex. tis/tor em" value={bookForm.preferred_time} disabled={bookingStatus === "submitting"} onChange={(v) => setBookForm((f) => ({ ...f, preferred_time: v }))} />
                </div>
                <div>
                  <Label htmlFor="book-message" className="text-xs uppercase tracking-wider text-muted-foreground">Meddelande</Label>
                  <Textarea id="book-message" rows={3} value={bookForm.message} onChange={(e) => setBookForm((f) => ({ ...f, message: e.target.value }))} className="mt-1 rounded-2xl" disabled={bookingStatus === "submitting"} />
                </div>
                {bookingErr && (
                  <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/[0.08] p-3 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>{bookingErr}</p>
                  </div>
                )}
                <DialogFooter className="mt-2 gap-2 sm:gap-2">
                  <Button type="button" variant="ghost" onClick={() => setBookingOpen(false)} disabled={bookingStatus === "submitting"} className="w-full sm:w-auto">Avbryt</Button>
                  <Button type="submit" disabled={bookingStatus === "submitting"} className="w-full rounded-full sm:w-auto">
                    {bookingStatus === "submitting" ? (<>Skickar… <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>) : (<>Skicka bokningsförfrågan <CalendarCheck className="ml-2 h-4 w-4" /></>)}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─── Delkomponenter ─── */

function ReceiptSummary({ totalPotential, savedPerMonth, monthlyCost, topTier, paybackMonths, topName }: {
  totalPotential: string; savedPerMonth: number; monthlyCost: number;
  topTier: TierKey | null; paybackMonths: number | null; topName: string | null;
}) {
  const mono = "'Spline Sans Mono',ui-monospace,monospace";
  return (
    <div style={{
      border: "1.5px dashed var(--granbark)",
      borderRadius: 6,
      background: "#FBFAF6",
      padding: "22px 24px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 20,
    }}>
      <ReceiptCell label="Total potential" value={totalPotential} />
      <ReceiptCell label="Tidsbesparing / mån" value={savedPerMonth > 0 ? `~${savedPerMonth} h` : "–"} />
      <ReceiptCell label="Kostnad idag / mån" value={monthlyCost > 0 ? fmtKr(monthlyCost) : "–"} sub="600 kr/h schablon" />
      <ReceiptCell
        label="Återbetalningstid"
        value={topTier && paybackMonths ? `~${paybackMonths} mån` : "–"}
        sub={topTier ? `${TIERS[topTier].label} · ${TIERS[topTier].priceLabel}` : undefined}
      />
      {topName && (
        <div style={{ gridColumn: "1 / -1", borderTop: "1px dashed var(--linje)", paddingTop: 14 }}>
          <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--granbark-mut)" }}>
            Rekommenderad start · {topName}
          </span>
        </div>
      )}
    </div>
  );
}

function ReceiptCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const mono = "'Spline Sans Mono',ui-monospace,monospace";
  return (
    <div>
      <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--granbark-mut)", marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: mono, fontSize: 22, fontWeight: 600, color: "var(--granbark)", letterSpacing: "-0.01em" }}>{value}</p>
      {sub && <p style={{ fontFamily: mono, fontSize: 11, color: "var(--granbark-mut)", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function ProcessRow({ process, maxScore, isTop }: { process: ScoredProcess; maxScore: number; isTop: boolean }) {
  const mono = "'Spline Sans Mono',ui-monospace,monospace";
  const tier = tierForProcess(process);
  const tierMeta = TIERS[tier];
  const score = process.score ?? 0;
  const pct = Math.max(6, Math.round((score / (maxScore || 16)) * 100));
  const saved = process.saved_hours_per_week ?? 0;
  const monthly = saved > 0 ? Math.round(saved * WEEKS_PER_MONTH * 10) / 10 : 0;
  const payback = saved > 0
    ? Math.max(1, Math.round(tierMeta.price / (saved * WEEKS_PER_MONTH * HOURLY_RATE)))
    : null;
  const barGradient = process.potential === "Mycket hög" || process.potential === "Hög"
    ? "linear-gradient(90deg, #0F5132 0%, #4CAF80 100%)"
    : process.potential === "Medel"
      ? "linear-gradient(90deg, #6B8F6B 0%, #A9CBB0 100%)"
      : "linear-gradient(90deg, #B6B6AE 0%, #D8D5CC 100%)";

  return (
    <div style={{
      position: "relative",
      border: `1px solid ${isTop ? "var(--varsel)" : "var(--linje)"}`,
      borderRadius: 12,
      padding: "18px 20px",
      background: "#FDFCF8",
      boxShadow: isTop ? "0 4px 24px -12px rgba(232,80,10,0.35)" : "none",
    }}>
      {isTop && (
        <span style={{
          position: "absolute", top: -12, left: 16,
          background: "var(--varsel)", color: "#fff",
          fontFamily: mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
          padding: "4px 10px", borderRadius: 4, textTransform: "uppercase",
        }}>
          Börja här
        </span>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.015em", marginBottom: 4 }}>{process.process_name || "Namnlös process"}</h3>
          <p style={{ fontFamily: mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--granbark-mut)" }}>
            {process.potential} · {FREQ_LABELS[process.frequency]?.toLowerCase() || "okänt tempo"} · {TIME_LABELS[process.weekly_time] || "okänd tid"}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: mono, fontSize: 18, fontWeight: 600, color: "var(--granbark)" }}>{score} p</p>
          <p style={{ fontFamily: mono, fontSize: 11, color: "var(--granbark-mut)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {tierMeta.label} · {tierMeta.priceLabel}
          </p>
          {payback && (
            <p style={{ fontFamily: mono, fontSize: 11, color: "var(--gran)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>
              betalar sig på ~{payback} mån
            </p>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14, height: 10, background: "rgba(20,23,26,0.06)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barGradient, borderRadius: 999, transition: "width 400ms ease" }} />
      </div>

      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 18, fontFamily: mono, fontSize: 12, color: "var(--granbark-mut)" }}>
        <span><strong style={{ color: "var(--granbark)" }}>{saved > 0 ? `~${saved} h/v` : "–"}</strong> tidsvinst</span>
        <span><strong style={{ color: "var(--granbark)" }}>{monthly > 0 ? `~${monthly} h/mån` : "–"}</strong> per månad</span>
        {process.recommended_solution && (
          <span style={{ fontFamily: "'Schibsted Grotesk',sans-serif", textTransform: "none", letterSpacing: 0, fontSize: 13, color: "var(--granbark)" }}>
            Bygger: {process.recommended_solution}
          </span>
        )}
      </div>
    </div>
  );
}

function FormField({ label, id, value, onChange, err, disabled, required, placeholder, type }: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  err?: string; disabled?: boolean; required?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1 h-11 rounded-full text-base" disabled={disabled} required={required} />
      {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
    </div>
  );
}

function ResultState({ kind, message, onPrimary, onSecondary }: {
  kind: "loading" | "missing" | "error";
  message?: string; onPrimary?: () => void; onSecondary?: () => void;
}) {
  const config = {
    loading: { Icon: Loader2, iconClass: "animate-spin", title: "Laddar er AI-karta…", body: "Vi hämtar era svar och räknar fram kartan." },
    missing: { Icon: Sparkles, iconClass: "", title: "Vi hittar ingen ifylld AI-karta", body: "Starta om analysen så bygger vi ett nytt resultat på under två minuter." },
    error:   { Icon: AlertTriangle, iconClass: "", title: "Vi kunde inte ladda er analys", body: message || "Det kan vara ett tillfälligt problem – försök igen." },
  }[kind];
  const Icon = config.Icon;
  return (
    <div className="verkstad">
      <main id="main" className="vk-section" style={{ paddingTop: "clamp(120px,14vw,160px)", textAlign: "center" }}>
        <div className="vk-wrap" style={{ maxWidth: 560 }}>
          <div style={{ display: "inline-grid", placeItems: "center", width: 56, height: 56, borderRadius: "50%", background: "var(--gran-soft)", color: "var(--gran)", marginBottom: 18 }}>
            <Icon className={`h-6 w-6 ${config.iconClass}`} />
          </div>
          <h1 style={{ marginBottom: 12 }}>{config.title}</h1>
          <p style={{ color: "var(--granbark-mut)", marginBottom: 24 }}>{config.body}</p>
          {kind !== "loading" && (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={onPrimary} className="vk-btn vk-btn-primary">
                {kind === "missing" ? "Starta AI-kartan →" : "Tillbaka till start"}
              </button>
              {kind === "error" && onSecondary && (
                <button type="button" onClick={onSecondary} className="vk-btn vk-btn-ghost">
                  <RefreshCw size={16} /> Försök igen
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AiKartaResultat;
