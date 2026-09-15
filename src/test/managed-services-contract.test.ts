// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (path: string) => readFile(resolve(root, path), "utf8");

describe("managed service safety contracts", () => {
  it("keeps provider secrets server-side and requires approval before WhatsApp send", async () => {
    const source = await read("supabase/functions/admin-managed-channels/index.ts");
    expect(source).toContain("Deno.env.get(workspace.credential_env_name)");
    expect(source).toContain("private_hosts_not_allowed");
    expect(source).toContain('redirect: "error"');
    expect(source).toContain('.eq("status", "approved")');
    expect(source).toContain('action === "stage_message"');
    expect(source).not.toMatch(/apiKey\s*[:=]\s*["']wacrm_live_/);
  });

  it("keeps commerce writes staged and makes external application explicit", async () => {
    const source = await read("supabase/functions/admin-commerce-ops/index.ts");
    expect(source).toContain('status: "applied"');
    expect(source).toContain('body.confirmation !== "APPLIED_EXTERNALLY"');
    expect(source).toContain('.from("commerce_ops_changes").insert');
    expect(source).toContain("price_guardrail");
  });

  it("locks every new public table behind service-role access", async () => {
    const migration = await read("supabase/migrations/20260915122120_aurora_managed_channels_and_commerce_ops.sql");
    for (const table of ["managed_channel_workspaces", "managed_channel_outbox", "commerce_ops_stores", "commerce_ops_snapshots", "commerce_ops_changes"]) {
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`revoke all on public.${table} from anon, authenticated`);
      expect(migration).toContain(`grant all on public.${table} to service_role`);
    }
  });
});
