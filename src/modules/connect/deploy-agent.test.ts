// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const provider = vi.hoisted(() => ({
  deployAgent: vi.fn(),
  resolve: vi.fn(),
}));

vi.mock("../../../supabase/functions/aurora-product-api/connect/lib/voice/index.ts", () => ({
  resolveVoiceProvider: provider.resolve,
}));

type Operation = (input: {
  data: { agentId: string; confirm: true };
  context: { userId: string; supabase: unknown };
}) => Promise<unknown>;

// Import the actual Edge operation while keeping Deno-only modules out of the
// frontend's TypeScript program. Vitest aliases their pinned npm dependencies.
const backendModule = "../../../supabase/functions/aurora-product-api/connect/lib/aurora.functions.ts";
const { deployAgentToProvider } = await import(backendModule) as { deployAgentToProvider: Operation };
const agentId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const userId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function sourceClient(isStaff: boolean | null, staffError: unknown = null, updateError: unknown = null) {
  const rpc = vi.fn().mockResolvedValue({ data: isStaff, error: staffError });
  const update = vi.fn();
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn((table: string) => {
    let updating = false;
    const rows = table === "agents"
      ? { id: agentId, org_id: "organization-a", name: "Receptionist" }
      : table === "organizations" ? { name: "Customer A" } : [];
    const result = () => ({ data: updating ? null : rows, error: updating ? updateError : null });
    const query = {
      select: () => query,
      eq: () => query,
      maybeSingle: () => Promise.resolve(result()),
      single: () => Promise.resolve(result()),
      update: (values: unknown) => { updating = true; update(values); return query; },
      insert,
      then: (resolve: (value: ReturnType<typeof result>) => unknown) => Promise.resolve(result()).then(resolve),
    };
    return query;
  });
  return { rpc, from, update, insert };
}

beforeEach(() => {
  provider.deployAgent.mockReset().mockResolvedValue({ ok: true, simulated: false, providerAgentId: "upstream-a" });
  provider.resolve.mockReset().mockReturnValue({ id: "dograh", deployAgent: provider.deployAgent });
  vi.stubGlobal("Deno", { env: { get: () => undefined } });
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unexpected external request")));
});

afterEach(() => vi.unstubAllGlobals());

describe("Connect provider deployment authorization", () => {
  it.each([
    [false, null],
    [null, { message: "source database unavailable" }],
  ])("rejects a non-staff or unverifiable account before any provider access", async (staff, error) => {
    const supabase = sourceClient(staff as boolean | null, error);
    await expect(deployAgentToProvider({ data: { agentId, confirm: true }, context: { supabase, userId } }))
      .rejects.toThrow("Endast Aurora-personal");
    expect(supabase.rpc).toHaveBeenCalledWith("is_aurora_staff", { _user_id: userId });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(provider.resolve).not.toHaveBeenCalled();
    expect(provider.deployAgent).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("allows verified staff and records the real provider result", async () => {
    const supabase = sourceClient(true);
    await expect(deployAgentToProvider({ data: { agentId, confirm: true }, context: { supabase, userId } }))
      .resolves.toEqual({ ok: true, simulated: false, providerAgentId: "upstream-a" });
    expect(provider.deployAgent).toHaveBeenCalledOnce();
    expect(supabase.update).toHaveBeenCalledWith({ provider: "dograh", provider_agent_id: "upstream-a", status: "testing" });
  });

  it("does not report success when saving the provider result fails", async () => {
    const supabase = sourceClient(true, null, { message: "write rejected" });
    await expect(deployAgentToProvider({ data: { agentId, confirm: true }, context: { supabase, userId } }))
      .rejects.toThrow("publiceringsstatus kunde inte sparas");
    expect(provider.deployAgent).toHaveBeenCalledOnce();
    expect(supabase.insert).not.toHaveBeenCalled();
  });
});
