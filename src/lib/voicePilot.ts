export type VoiceVertical = "traffic_school" | "stay" | "transport" | "service" | "other";

export const VOICE_VERTICALS: Record<VoiceVertical, {
  label: string;
  firstUseCase: string;
  allowedActions: string[];
  prohibitedUntilVerified: string[];
}> = {
  traffic_school: {
    label: "Trafikskola",
    firstUseCase: "Priser, paket, utbildningsfrågor och bokningsunderlag när personalen kör.",
    allowedActions: ["Svara på verifierad FAQ", "Samla kontaktuppgifter", "Skapa bokningsunderlag", "Lämna över till personal"],
    prohibitedUntilVerified: ["Direktboka körlektion", "Ta betalt", "Ändra elevdata"],
  },
  stay: {
    label: "Boende / StayBoost",
    firstUseCase: "Incheckning, frukost, tillval, vägbeskrivning och bokningsunderlag.",
    allowedActions: ["Svara på verifierad gästinfo", "Samla bokningsunderlag", "Skicka vidare ärende", "Lämna över"],
    prohibitedUntilVerified: ["Ändra bokning", "Lämna ut dörrkod utan verifiering", "Ta betalt"],
  },
  transport: {
    label: "Transport",
    firstUseCase: "Ta emot transportförfrågan, adress, tid, gods och återkopplingsuppgifter.",
    allowedActions: ["Samla orderunderlag", "Svara på verifierad företagsinfo", "Skapa återkopplingsärende", "Lämna över"],
    prohibitedUntilVerified: ["Lova pris", "Tilldela förare", "Ändra aktiv transport"],
  },
  service: {
    label: "Service / hantverk",
    firstUseCase: "Ta emot jobbtyp, adress, brådska och offertunderlag.",
    allowedActions: ["Kvalificera ärende", "Samla kontaktuppgifter", "Skapa offertunderlag", "Lämna över"],
    prohibitedUntilVerified: ["Lova fast pris", "Boka tekniker", "Ta betalt"],
  },
  other: {
    label: "Annan verksamhet",
    firstUseCase: "FAQ, kvalificering och mänsklig överlämning.",
    allowedActions: ["Svara på verifierad FAQ", "Samla kontaktuppgifter", "Lämna över"],
    prohibitedUntilVerified: ["Skrivande integrationer", "Betalning", "Bindande bokning"],
  },
};

export function voicePilotMetrics(calls: Array<{ duration_seconds:number; outcome:string; automated:boolean; cost_ore:number|null }>) {
  const total = calls.length;
  const automated = calls.filter((call) => call.automated).length;
  const handoffs = calls.filter((call) => call.outcome === "handoff").length;
  const leads = calls.filter((call) => ["lead_captured","booking_request"].includes(call.outcome)).length;
  return {
    total,
    automationRate: total ? automated / total : 0,
    handoffRate: total ? handoffs / total : 0,
    qualifiedLeads: leads,
    minutes: Math.round(calls.reduce((sum, call) => sum + call.duration_seconds, 0) / 60),
    costSek: calls.reduce((sum, call) => sum + (call.cost_ore ?? 0), 0) / 100,
  };
}
