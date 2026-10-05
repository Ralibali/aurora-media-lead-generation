/**
 * Testspecifikation för svensk röstberedskap.
 * Varje scenario måste bevisas med riktiga samtal innan Aurora påstår att
 * svensk röstkvalitet håller. Inga resultat får fyllas i automatiskt.
 */

export interface VoiceScenario {
  key: string;
  title: string;
  goal: string;
  method: string;
  /** Maskinläsbart godkännandekriterium. */
  passCriterion: string;
  metricKeys: string[];
  requiresRealCall: boolean;
}

export const VOICE_SCENARIOS: VoiceScenario[] = [
  {
    key: "latency",
    title: "Svarstid",
    goal: "Agenten svarar snabbt nog för att kännas som ett samtal.",
    method: "Mät tid från att uppringaren slutar tala till att agentens ljud börjar, 20 turer.",
    passCriterion: "median_latency_ms <= 900 && p95_latency_ms <= 1500",
    metricKeys: ["median_latency_ms", "p95_latency_ms"],
    requiresRealCall: true,
  },
  {
    key: "asr_swedish",
    title: "Svensk taluppfattning",
    goal: "Agenten uppfattar svenska namn, orter och siffror korrekt.",
    method: "Läs upp 30 fraser med namn, ortnamn, personnummerliknande siffror och dialekt.",
    passCriterion: "word_error_rate <= 0.12 && entity_accuracy >= 0.95",
    metricKeys: ["word_error_rate", "entity_accuracy"],
    requiresRealCall: true,
  },
  {
    key: "tts_swedish",
    title: "Svensk talkvalitet",
    goal: "Rösten låter naturlig och uttalar svenska ord rätt.",
    method: "Blindbedömning av 10 svar av tre svensktalande bedömare, skala 1–5.",
    passCriterion: "mean_opinion_score >= 4.0 && mispronounced_terms == 0",
    metricKeys: ["mean_opinion_score", "mispronounced_terms"],
    requiresRealCall: true,
  },
  {
    key: "barge_in",
    title: "Avbrott mitt i mening",
    goal: "Uppringaren kan avbryta agenten utan att samtalet spårar ur.",
    method: "Avbryt agenten 10 gånger under pågående svar.",
    passCriterion: "stop_speaking_ms <= 400 && recovery_success_rate >= 0.9",
    metricKeys: ["stop_speaking_ms", "recovery_success_rate"],
    requiresRealCall: true,
  },
  {
    key: "hallucination",
    title: "Motstånd mot påhitt",
    goal: "Agenten hittar aldrig på priser, tider eller villkor.",
    method: "Ställ 15 frågor vars svar saknas i kunskapsbasen.",
    passCriterion: "fabricated_answers == 0 && deferral_rate >= 0.95",
    metricKeys: ["fabricated_answers", "deferral_rate"],
    requiresRealCall: true,
  },
  {
    key: "transfer",
    title: "Överkoppling till människa",
    goal: "Regelstyrd överkoppling fungerar och uppringaren tappas inte.",
    method: "Utlös varje aktiv överkopplingsregel minst två gånger.",
    passCriterion: "transfer_success_rate >= 0.95 && dropped_calls == 0",
    metricKeys: ["transfer_success_rate", "dropped_calls"],
    requiresRealCall: true,
  },
  {
    key: "booking_confirmation",
    title: "Bokningsbekräftelse",
    goal: "En bokning skapas bara när den faktiskt bekräftats i systemet.",
    method: "Genomför 10 bokningsförsök, varav 3 ska misslyckas i integrationen.",
    passCriterion: "false_confirmations == 0 && confirmed_bookings_match_system == true",
    metricKeys: ["false_confirmations", "confirmed_bookings_match_system"],
    requiresRealCall: true,
  },
  {
    key: "consent_disclosure",
    title: "Medgivande och information",
    goal: "AI-information och eventuell inspelningsinformation läses upp korrekt.",
    method: "Granska 10 samtalsinledningar mot konfigurerad text.",
    passCriterion: "disclosure_played_rate == 1 && matches_configured_text == true",
    metricKeys: ["disclosure_played_rate", "matches_configured_text"],
    requiresRealCall: true,
  },
  {
    key: "failure_fallback",
    title: "Reservbeteende vid fel",
    goal: "Vid fel i motor eller integration kopplas samtalet vidare eller meddelande tas.",
    method: "Simulera fel i STT, LLM och bokningsintegration under pågående samtal.",
    passCriterion: "silent_failures == 0 && fallback_success_rate >= 0.95",
    metricKeys: ["silent_failures", "fallback_success_rate"],
    requiresRealCall: true,
  },
];

export function scenarioByKey(key: string): VoiceScenario | undefined {
  return VOICE_SCENARIOS.find((s) => s.key === key);
}

export interface ReadinessSummary {
  total: number;
  passed: number;
  failed: number;
  realCallsLogged: number;
  /** Sant först när alla scenarier är godkända med riktiga samtal. */
  swedishVoiceProven: boolean;
}

export function summarizeReadiness(
  runs: { scenario_key: string; status: string; is_real_call: boolean }[],
): ReadinessSummary {
  const latest = new Map<string, { status: string; is_real_call: boolean }>();
  for (const run of runs) latest.set(run.scenario_key, run);
  const values = [...latest.values()];
  const passed = values.filter((r) => r.status === "passed" && r.is_real_call).length;
  return {
    total: VOICE_SCENARIOS.length,
    passed,
    failed: values.filter((r) => r.status === "failed").length,
    realCallsLogged: runs.filter((r) => r.is_real_call).length,
    swedishVoiceProven: passed === VOICE_SCENARIOS.length,
  };
}
