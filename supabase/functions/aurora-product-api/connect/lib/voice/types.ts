/**
 * VoiceProvider — Aurora Voice adapter boundary.
 *
 * Aurora never embeds or forks an upstream voice engine (Dograh or other).
 * Everything Aurora needs from a voice engine, telephony, STT, TTS or LLM
 * vendor is expressed through this contract. Implementations live next to
 * this file and are selected at runtime by configuration.
 */

export type ProviderId = "demo" | "dograh";

export interface ProviderCapabilities {
  telephonyInbound: boolean;
  telephonyOutboundReturn: boolean;
  /** Autonomous outbound cold calling is deliberately never supported. */
  outboundColdCalling: false;
  swedishAsr: boolean;
  swedishTts: boolean;
  bargeIn: boolean;
  liveTransfer: boolean;
  recording: boolean;
  toolActions: boolean;
}

export interface ProviderHealth {
  providerId: ProviderId;
  configured: boolean;
  reachable: boolean;
  /** Never claim verified Swedish voice quality without real-call evidence. */
  swedishVerified: boolean;
  latencyMs: number | null;
  message: string;
  checkedAt: string;
}

export interface AgentDeploymentSpec {
  agentId: string;
  orgName: string;
  name: string;
  language: string;
  persona: string | null;
  greeting: string | null;
  disclosureText: string;
  consentRequired: boolean;
  maxCallSeconds: number;
  fallbackNumber: string | null;
  knowledge: { question: string; answer: string }[];
  qualification: { fieldKey: string; question: string; required: boolean }[];
  handoff: { description: string; conditionKey: string; action: string; target: string | null }[];
  openingHours: { weekday: number; opens: string | null; closes: string | null; closed: boolean }[];
}

export interface DeploymentResult {
  ok: boolean;
  providerAgentId: string | null;
  message: string;
  /** True when nothing was sent to a live engine (demo/dry run). */
  simulated: boolean;
}

export interface TranscriptTurn {
  position: number;
  speaker: "caller" | "agent" | "system";
  content: string;
  offsetMs: number | null;
  confidence: number | null;
}

export interface CallRecord {
  externalId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  fromNumber: string | null;
  toNumber: string | null;
  outcome: string;
  avgLatencyMs: number | null;
  costSek: number;
  /** Demo data must always be labelled as such all the way to the UI. */
  isDemo: boolean;
  summary: string | null;
  transcript: TranscriptTurn[];
}

export interface VoiceProvider {
  readonly id: ProviderId;
  readonly capabilities: ProviderCapabilities;
  health(): Promise<ProviderHealth>;
  deployAgent(spec: AgentDeploymentSpec): Promise<DeploymentResult>;
  /** Pull finished calls for an agent since a timestamp. Never invents calls. */
  fetchCalls(providerAgentId: string, sinceIso: string): Promise<CallRecord[]>;
}
