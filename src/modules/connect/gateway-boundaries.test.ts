// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ createClient: vi.fn(), getUser: vi.fn(), from: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: sdk.createClient }));

let handler: (request: Request) => Promise<Response>;
beforeAll(async () => {
  vi.stubGlobal("Deno", {
    serve: (callback: typeof handler) => { handler = callback; },
    env: { get: (name: string) => name === "SUPABASE_SERVICE_ROLE_KEY" ? "target-project-service-secret" : undefined },
  });
  // Exercise the real gateway and imported operation registry. Only the SDK's
  // network boundary is mocked; policy, JWT selection and handlers run normally.
  const gatewayModule = "../../../supabase/functions/aurora-product-api/index.ts";
  await import(gatewayModule);
});

beforeEach(() => {
  sdk.createClient.mockReset();
  sdk.getUser.mockReset().mockImplementation(async (token: string) => token === "valid.source.token"
    ? { data: { user: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" } }, error: null }
    : { data: { user: null }, error: { message: "JWT belongs to another project" } });
  sdk.from.mockReset().mockImplementation(() => {
    const value = { data: [], error: null };
    const query = {
      select: () => query,
      eq: () => query,
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: (result: typeof value) => unknown) => Promise.resolve(value).then(resolve),
    };
    return query;
  });
  sdk.createClient.mockReturnValue({ auth: { getUser: sdk.getUser }, from: sdk.from });
});

afterAll(() => vi.unstubAllGlobals());

function request(product: string, operation: string, token?: string, data?: unknown) {
  return handler(new Request("https://auroramedia.invalid/functions/v1/aurora-product-api", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ product, operation, data }),
  }));
}

describe("shared product gateway with original handlers", () => {
  it.each(["connect", "local-boost"])("requires authentication before creating a %s client", async product => {
    expect((await request(product, "getMe")).status).toBe(401);
    expect(sdk.createClient).not.toHaveBeenCalled();
    expect(sdk.from).not.toHaveBeenCalled();
  });

  it.each([
    ["connect", "https://iwypiteuubedpfuiyatu.supabase.co"],
    ["local-boost", "https://ydnyoqfikiybyektvann.supabase.co"],
  ])("verifies %s sessions against that product and preserves the bearer for RLS", async (product, sourceUrl) => {
    const response = await request(product, "getMe", "valid.source.token");
    expect(response.status).toBe(200);
    expect(sdk.createClient).toHaveBeenCalledOnce();
    const [url, key, options] = sdk.createClient.mock.calls[0];
    expect(url).toBe(sourceUrl);
    expect(key).toMatch(/^sb_publishable_/);
    expect(key).not.toBe("target-project-service-secret");
    expect(options.global.headers.Authorization).toBe("Bearer valid.source.token");
    expect(options.auth.persistSession).toBe(false);
    expect(sdk.getUser).toHaveBeenCalledWith("valid.source.token");
    expect(sdk.from).toHaveBeenCalledWith("profiles");
  });

  it("rejects a token that the source project cannot verify before reading data", async () => {
    expect((await request("connect", "getMe", "wrong.project.token")).status).toBe(401);
    expect(sdk.getUser).toHaveBeenCalledWith("wrong.project.token");
    expect(sdk.from).not.toHaveBeenCalled();
  });

  it.each(["constructor", "__proto__", "QA_CRITERIA", "resolveVoiceProvider", "deleteEverything"])("does not invoke arbitrary export %s", async operation => {
    expect((await request("connect", operation, "valid.source.token")).status).toBe(404);
    expect(sdk.createClient).not.toHaveBeenCalled();
  });

  it.each(["connect", "local-boost"])("cannot claim %s administration from a normal verified session", async product => {
    const response = await request(product, "claimFirstAdmin", "valid.source.token");
    expect(response.status).toBe(200);
    expect((await response.json()).result.granted).toBe(false);
    expect(sdk.createClient).toHaveBeenCalledOnce();
    expect(sdk.from).not.toHaveBeenCalled();
  });

  it("rejects another project name before accessing the SDK", async () => {
    expect((await request("arbitrary-project", "getMe", "valid.source.token")).status).toBe(400);
    expect(sdk.createClient).not.toHaveBeenCalled();
  });
});
