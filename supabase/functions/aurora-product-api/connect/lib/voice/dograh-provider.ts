import type {
  AgentDeploymentSpec,
  CallRecord,
  DeploymentResult,
  ProviderCapabilities,
  ProviderHealth,
  TranscriptTurn,
  VoiceProvider,
} from "./types.ts";

/**
 * Dograh adapter — talks to an upstream voice engine over HTTP only.
 * No upstream source code is copied or vendored into Aurora. Endpoint paths
 * and payload shapes MUST be verified against the upstream API contract
 * (see docs/KIMI_HANDOFF.md, work package WP-1) before the pilot.
 */
export const dograhCapabilities: ProviderCapabilities = {
  telephonyInbound: true,
  telephonyOutboundReturn: true,
  outboundColdCalling: false,
  swedishAsr: true,
  swedishTts: true,
  bargeIn: true,
  liveTransfer: true,
  recording: true,
  toolActions: true,
};

export interface DograhConfig {
  baseUrl: string;
  apiKey: string;
}

export function readDograhConfig(env: Record<string, string | undefined>): DograhConfig | null {
  const baseUrl = env["DOGRAH_BASE_URL"];
  const apiKey = env["DOGRAH_API_KEY"];
  if (!baseUrl || !apiKey) return null;
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

export function mapUpstreamCall(raw: unknown): CallRecord | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const externalId = typeof r["id"] === "string" ? r["id"] : null;
  if (!externalId) return null;
  const turns = Array.isArray(r["transcript"]) ? (r["transcript"] as unknown[]) : [];
  const transcript: TranscriptTurn[] = turns.map((t, index) => {
    const turn = (typeof t === "object" && t !== null ? t : {}) as Record<string, unknown>;
    const speaker = turn["speaker"] === "agent" || turn["speaker"] === "system" ? turn["speaker"] : "caller";
    return {
      position: index,
      speaker: speaker as TranscriptTurn["speaker"],
      content: typeof turn["text"] === "string" ? turn["text"] : "",
      offsetMs: typeof turn["offset_ms"] === "number" ? turn["offset_ms"] : null,
      confidence: typeof turn["confidence"] === "number" ? turn["confidence"] : null,
    };
  });
  return {
    externalId,
    startedAt: typeof r["started_at"] === "string" ? r["started_at"] : new Date().toISOString(),
    endedAt: typeof r["ended_at"] === "string" ? r["ended_at"] : null,
    durationSeconds: typeof r["duration_seconds"] === "number" ? r["duration_seconds"] : 0,
    fromNumber: typeof r["from"] === "string" ? r["from"] : null,
    toNumber: typeof r["to"] === "string" ? r["to"] : null,
    outcome: typeof r["outcome"] === "string" ? r["outcome"] : "unknown",
    avgLatencyMs: typeof r["avg_latency_ms"] === "number" ? r["avg_latency_ms"] : null,
    costSek: typeof r["cost_sek"] === "number" ? r["cost_sek"] : 0,
    isDemo: false,
    summary: typeof r["summary"] === "string" ? r["summary"] : null,
    transcript,
  };
}

export function createDograhProvider(config: DograhConfig): VoiceProvider {
  const request = async (path: string, init?: RequestInit) => {
    return fetch(`${config.baseUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.apiKey}`,
        ...(init?.headers ?? {}),
      },
    });
  };

  return {
    id: "dograh",
    capabilities: dograhCapabilities,
    async health(): Promise<ProviderHealth> {
      const startedAt = Date.now();
      try {
        const res = await request("/api/v1/health");
        return {
          providerId: "dograh",
          configured: true,
          reachable: res.ok,
          swedishVerified: false,
          latencyMs: Date.now() - startedAt,
          message: res.ok
            ? "Röstmotorn svarar. Svensk röstkvalitet är inte verifierad förrän riktiga pilotsamtal är loggade."
            : `Röstmotorn svarade med status ${res.status}.`,
          checkedAt: new Date().toISOString(),
        };
      } catch (error) {
        return {
          providerId: "dograh",
          configured: true,
          reachable: false,
          swedishVerified: false,
          latencyMs: null,
          message: `Kunde inte nå röstmotorn: ${error instanceof Error ? error.message : "okänt fel"}`,
          checkedAt: new Date().toISOString(),
        };
      }
    },
    async deployAgent(spec: AgentDeploymentSpec): Promise<DeploymentResult> {
      const res = await request("/api/v1/agents", {
        method: "POST",
        body: JSON.stringify({
          external_id: spec.agentId,
          name: spec.name,
          language: spec.language,
          system_prompt: spec.persona,
          greeting: spec.greeting,
          disclosure: spec.disclosureText,
          consent_required: spec.consentRequired,
          max_call_seconds: spec.maxCallSeconds,
          fallback_number: spec.fallbackNumber,
          knowledge: spec.knowledge,
          qualification: spec.qualification,
          handoff: spec.handoff,
          opening_hours: spec.openingHours,
        }),
      });
      if (!res.ok) {
        return {
          ok: false,
          providerAgentId: null,
          message: `Publicering misslyckades (status ${res.status}).`,
          simulated: false,
        };
      }
      const body = (await res.json()) as { id?: string };
      return {
        ok: true,
        providerAgentId: body.id ?? null,
        message: "Agenten publicerades till röstmotorn.",
        simulated: false,
      };
    },
    async fetchCalls(providerAgentId: string, sinceIso: string): Promise<CallRecord[]> {
      const res = await request(
        `/api/v1/agents/${encodeURIComponent(providerAgentId)}/calls?since=${encodeURIComponent(sinceIso)}`,
      );
      if (!res.ok) return [];
      const body = (await res.json()) as { items?: unknown[] };
      return (body.items ?? []).map(mapUpstreamCall).filter((c): c is CallRecord => c !== null);
    },
  };
}
