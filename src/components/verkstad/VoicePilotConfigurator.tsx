import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CheckCircle2, PhoneForwarded, Sparkles } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";

const VERTICALS = {
  trafikskola: {
    label: "Trafikskola",
    examples: ["Priser och paket", "Lediga tider", "Introduktionsutbildning", "Bokningsunderlag"],
  },
  boende: {
    label: "Hotell / glamping / boende",
    examples: ["Tillgänglighet", "In- och utcheckning", "Frukost och tillval", "Bokningsunderlag"],
  },
  service: {
    label: "Service / hantverk",
    examples: ["Typ av jobb", "Adress och område", "Brådska", "Offertunderlag"],
  },
  annat: {
    label: "Annan verksamhet",
    examples: ["Vanliga frågor", "Kvalificering", "Kontaktuppgifter", "Överlämning"],
  },
} as const;

type VerticalKey = keyof typeof VERTICALS;

const inputStyle = {
  width: "100%",
  border: "1px solid var(--linje)",
  borderRadius: 10,
  background: "#fff",
  padding: "11px 12px",
  fontSize: 15,
  color: "var(--granbark)",
} as const;

const labelStyle = {
  display: "grid",
  gap: 7,
  fontSize: 13,
  fontWeight: 650,
  color: "var(--granbark)",
} as const;

export default function VoicePilotConfigurator() {
  const { open } = useContactModal();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [vertical, setVertical] = useState<VerticalKey>("trafikskola");
  const [company, setCompany] = useState("");
  const [openingHours, setOpeningHours] = useState("Vardagar 08:00–17:00");
  const [bookingUrl, setBookingUrl] = useState("");
  const [handoffNumber, setHandoffNumber] = useState("");
  const [faq, setFaq] = useState("");
  const [goal, setGoal] = useState("Svara på vanliga frågor och skapa ett komplett bokningsunderlag");

  useEffect(() => {
    const pricing = document.getElementById("priser");
    if (!pricing?.parentElement) return;

    const slot = document.createElement("div");
    slot.dataset.voicePilotSlot = "true";
    pricing.parentElement.insertBefore(slot, pricing);
    setPortalTarget(slot);

    return () => {
      setPortalTarget(null);
      slot.remove();
    };
  }, []);

  const selected = VERTICALS[vertical];
  const preview = useMemo(
    () => [
      `1. Assistenten presenterar sig som digital assistent${company.trim() ? ` hos ${company.trim()}` : " hos företaget"}.`,
      `2. Den identifierar ärendet och fokuserar på: ${goal.trim() || "rutinfrågor och kvalificering"}.`,
      `3. För ${selected.label.toLowerCase()} används i första hand: ${selected.examples.join(", ")}.`,
      `4. Öppettider: ${openingHours.trim() || "läggs in före pilotstart"}.`,
      bookingUrl.trim()
        ? `5. Bokning: assistenten får hänvisa till ${bookingUrl.trim()} och samla in underlag; direktbokning aktiveras först efter verifierad integration.`
        : "5. Bokning: assistenten samlar in ett komplett underlag som personalen bekräftar.",
      handoffNumber.trim()
        ? `6. Överlämning: avvikande eller känsliga ärenden kan lämnas till ${handoffNumber.trim()} enligt överenskomna regler.`
        : "6. Överlämning: avvikande eller känsliga ärenden markeras för mänsklig uppföljning.",
      "7. Piloten mäter hanterade ärenden, överlämningar, vanligaste frågor och faktisk automationsgrad.",
    ],
    [bookingUrl, company, goal, handoffNumber, openingHours, selected],
  );

  const startPilot = () => {
    const note = [
      "Aurora Voice – pilotunderlag",
      `Bransch: ${selected.label}`,
      `Företag: ${company.trim() || "Ej angivet"}`,
      `Mål: ${goal.trim() || "Ej angivet"}`,
      `Öppettider: ${openingHours.trim() || "Ej angivet"}`,
      `Bokningslänk: ${bookingUrl.trim() || "Ingen angiven"}`,
      `Överlämningsnummer: ${handoffNumber.trim() || "Inget angivet"}`,
      `FAQ/extra kontext: ${faq.trim() || "Ingen angiven"}`,
      "Pilotstatus: intake/demo. Inget telefonnummer eller live-AI aktiveras från formuläret.",
    ].join("\n");

    trackEvent("voice_pilot_configured", {
      vertical,
      has_booking_url: Boolean(bookingUrl.trim()),
      has_handoff_number: Boolean(handoffNumber.trim()),
    });

    open({
      paket: "Aurora Voice (AI-receptionist)",
      internalNote: note,
      message: `Jag vill testa Aurora Voice för ${company.trim() || "min verksamhet"}. Målet är: ${goal.trim() || "att avlasta rutinärenden och samla in bokningsunderlag"}. Jag vill gå igenom pilotupplägget och vad som krävs för att koppla telefoni och eventuella integrationer.`,
    });
  };

  if (!portalTarget) return null;

  return createPortal(
    <>
      <hr className="vk-hair" />
      <section className="vk-section" id="voice-pilot">
        <div className="vk-wrap">
          <p className="vk-mono">Bygg pilotunderlaget direkt</p>
          <h2 style={{ marginTop: 14, maxWidth: "20ch" }}>
            Se hur ett första <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", color: "var(--gran)" }}>samtalsflöde</span> kan se ut.
          </h2>
          <p style={{ marginTop: 16, maxWidth: "72ch", color: "#3E444B", lineHeight: 1.7 }}>
            Det här konfigurerar ett pilotunderlag – inte ett live-telefonnummer. Inget kopplas till telefoni, bokningssystem eller AI-tjänst förrän flödet har granskats och godkänts.
          </p>

          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", marginTop: 34 }}>
            <div style={{ border: "1px solid var(--linje)", borderRadius: 16, background: "#fff", padding: 24 }}>
              <div style={{ display: "grid", gap: 16 }}>
                <label style={labelStyle}>
                  Bransch
                  <select value={vertical} onChange={(event) => setVertical(event.target.value as VerticalKey)} style={inputStyle}>
                    {Object.entries(VERTICALS).map(([value, item]) => (
                      <option key={value} value={value}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <label style={labelStyle}>
                  Företag
                  <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Företagsnamn" style={inputStyle} maxLength={120} />
                </label>
                <label style={labelStyle}>
                  Vad ska receptionisten främst lösa?
                  <textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} maxLength={500} />
                </label>
                <label style={labelStyle}>
                  Öppettider
                  <input value={openingHours} onChange={(event) => setOpeningHours(event.target.value)} style={inputStyle} maxLength={200} />
                </label>
                <label style={labelStyle}>
                  Bokningslänk, om ni har en
                  <input value={bookingUrl} onChange={(event) => setBookingUrl(event.target.value)} placeholder="https://…" style={inputStyle} maxLength={300} />
                </label>
                <label style={labelStyle}>
                  Nummer för mänsklig överlämning, valfritt
                  <input value={handoffNumber} onChange={(event) => setHandoffNumber(event.target.value)} placeholder="07… / växel" style={inputStyle} maxLength={80} />
                </label>
                <label style={labelStyle}>
                  Vanliga frågor eller viktig kontext
                  <textarea value={faq} onChange={(event) => setFaq(event.target.value)} rows={4} placeholder="Priser, regler, vad AI:n aldrig får lova…" style={{ ...inputStyle, resize: "vertical" }} maxLength={1200} />
                </label>
              </div>
            </div>

            <div style={{ border: "1.5px solid var(--gran)", borderRadius: 16, background: "#fff", padding: 24, alignSelf: "start" }}>
              <p className="vk-mono" style={{ color: "var(--gran)" }}>Förhandsvisning · {selected.label}</p>
              <div style={{ marginTop: 18, display: "grid", gap: 13 }}>
                {preview.map((line) => (
                  <div key={line} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15, lineHeight: 1.6, color: "#3E444B" }}>
                    <CheckCircle2 size={17} style={{ color: "var(--gran)", flexShrink: 0, marginTop: 3 }} />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 22, padding: 16, borderRadius: 12, background: "var(--dimma)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700 }}>
                  <PhoneForwarded size={18} /> Säker pilotprincip
                </div>
                <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, color: "#3E444B" }}>
                  Assistenten ska alltid kunna lämna över eller skapa ett ärende. Direktbokning, betalning och andra skrivande integrationer aktiveras först efter separat verifiering.
                </p>
              </div>
              <button onClick={startPilot} className="vk-btn vk-btn-primary" style={{ marginTop: 22, width: "100%", justifyContent: "center" }}>
                <Sparkles size={16} /> Skicka pilotunderlaget <ArrowRight size={16} />
              </button>
              <p className="vk-mono" style={{ marginTop: 12, color: "var(--granbark-mut)", lineHeight: 1.5 }}>
                Öppnar befintligt kontaktflöde med underlaget förifyllt. Inget samtal skickas automatiskt.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>,
    portalTarget,
  );
}
