import type {
  AgentDeploymentSpec,
  DeploymentResult,
  ProviderCapabilities,
  ProviderHealth,
  VoiceProvider,
} from "./types.ts";

/**
 * Demo provider: a safe stand-in used before a real voice engine is connected.
 * It performs no telephony and returns no calls — demo call data is only ever
 * created by an explicit, clearly labelled action in the app.
 */
export const demoCapabilities: ProviderCapabilities = {
  telephonyInbound: false,
  telephonyOutboundReturn: false,
  outboundColdCalling: false,
  swedishAsr: false,
  swedishTts: false,
  bargeIn: false,
  liveTransfer: false,
  recording: false,
  toolActions: false,
};

export function createDemoProvider(): VoiceProvider {
  return {
    id: "demo",
    capabilities: demoCapabilities,
    async health(): Promise<ProviderHealth> {
      return {
        providerId: "demo",
        configured: true,
        reachable: true,
        swedishVerified: false,
        latencyMs: null,
        message:
          "DEMO-läge. Ingen röstmotor är ansluten – inga riktiga samtal kan tas emot eller ringas.",
        checkedAt: new Date().toISOString(),
      };
    },
    async deployAgent(spec: AgentDeploymentSpec): Promise<DeploymentResult> {
      return {
        ok: true,
        providerAgentId: null,
        message: `DEMO: konfigurationen för "${spec.name}" validerades lokalt men publicerades inte till någon röstmotor.`,
        simulated: true,
      };
    },
    async fetchCalls() {
      return [];
    },
  };
}
