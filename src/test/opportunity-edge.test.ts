// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

// Compile the production handler with its Supabase client factory replaced and
// the remote OIDC verifier rejecting tokens. Claim pinning has separate unit tests.
// All network I/O is mocked; these tests cannot write to a live database or send mail.
async function handler(name: string, client: unknown, environment: Record<string, string> = {}) {
  const sourceFile = resolve(__dirname, `../../supabase/functions/${name}/index.ts`);
  const source = (await readFile(sourceFile, "utf8"))
    .replace(/^import \{ createClient \} from [^\n]+;/m, "const createClient = () => globalThis.__opportunityTestClient;")
    .replace(/^import \{ githubRunnerAccess \} from [^\n]+;/m, "const githubRunnerAccess = async () => false;");
  const compiled = await build({ stdin: { contents: source, sourcefile: sourceFile, resolveDir: dirname(sourceFile), loader: "ts" }, bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  let serve: (request: Request) => Promise<Response>;
  vi.stubGlobal("__opportunityTestClient", client);
  vi.stubGlobal("Deno", { env: { get: (key: string) => ({ SUPABASE_URL: "https://local.invalid", SUPABASE_SERVICE_ROLE_KEY: "local-test-key", ...environment })[key] }, serve: (fn: typeof serve) => { serve = fn; } });
  await import(/* @vite-ignore */ `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}#${Math.random()}`);
  return (body: unknown, headers: Record<string, string> = {}) => serve(new Request("https://local.invalid/function", { method: "POST", headers: { "Content-Type": "application/json", origin: "https://auroramedia.se", "x-forwarded-for": "local-test", ...headers }, body: JSON.stringify(body) }));
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('Guardian API authorization', () => {
  it('rejects anonymous calls before any database access', async () => {
    const from = vi.fn(); const submit = await handler('website-guardian', { from }, { ADMIN_SECRET: 'test-admin' });
    expect((await submit({ action: 'list' })).status).toBe(401); expect(from).not.toHaveBeenCalled();
  });
  it('does not let scheduler credentials read customer sites or create sites', async () => {
    const from = vi.fn(); const submit = await handler('website-guardian', { from }, { GUARDIAN_CRON_SECRET: 'test-cron' });
    expect((await submit({ action: 'list' }, { authorization: 'Bearer test-cron' })).status).toBe(403);
    expect((await submit({ action: 'create' }, { authorization: 'Bearer test-cron' })).status).toBe(403);
    expect((await submit({ action: 'claim_due' }, { authorization: 'Bearer test-cron' })).status).toBe(403);
    expect((await submit({ action: 'complete_flow' }, { authorization: 'Bearer test-cron' })).status).toBe(403);
    expect(from).not.toHaveBeenCalled();
  });
  it('rejects unapproved URLs and malformed bodies before writing', async () => {
    const from = vi.fn(); const submit = await handler('website-guardian', { from }, { ADMIN_SECRET: 'test-admin', GUARDIAN_ALLOWED_ORIGINS: 'https://example.test' });
    expect((await submit({ action: 'create', url: 'http://127.0.0.1', name: 'Private' }, { authorization: 'Bearer test-admin' })).status).toBe(400);
    expect((await submit(null, { authorization: 'Bearer test-admin' })).status).toBe(400); expect(from).not.toHaveBeenCalled();
  });
});
