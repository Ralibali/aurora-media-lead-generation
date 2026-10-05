import { createFileRoute } from "@/modules/shared/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel } from "@/modules/local-boost/components/AppShell";
import { NotConfigured } from "@/modules/local-boost/components/DemoBadge";
import { getSettings, updateUsageCap } from "@/modules/local-boost/lib/aurora.functions";
import { formatSek } from "@/modules/local-boost/lib/pricing";

export const Route = createFileRoute("/_authenticated/installningar")({
  head: () => ({
    meta: [
      { title: "Integrationer — Aurora Local" },
      { name: "description", content: "Status för leverantörer samt kostnads- och användningstak." },
      { property: "og:title", content: "Integrationer — Aurora Local" },
      { property: "og:description", content: "Leverantörsstatus och kostnadstak." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const fetchSettings = useServerFn(getSettings);
  const updateCap = useServerFn(updateUsageCap);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchSettings(),
  });

  const mutation = useMutation({
    mutationFn: (input: { id: string; cap: number }) => updateCap({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });

  if (isLoading) return <AppShell title="Integrationer"><Loading /></AppShell>;
  if (error) return <AppShell title="Integrationer"><ErrorNote error={error} /></AppShell>;
  if (!data) return null;

  return (
    <AppShell
      title="Integrationer och kostnadstak"
      description="Ingen leverantör är hårdkodad. Saknas nycklar står det ej konfigurerad — och ingen data hittas på."
    >
      <Panel title="Aktiva kopplingar (från miljövariabler)">
        <ul className="space-y-2 text-sm">
          {[
            { title: "Lokal data (rankning, citeringar, konkurrenter)", info: data.resolved.localData },
            { title: "Google-företagsprofil", info: data.resolved.gbp },
            { title: "AI-synlighet (Aurora Sight)", info: data.resolved.auroraSight },
          ].map((row) => (
            <li key={row.title} className="rounded-md border border-border p-3">
              <p className="font-medium">{row.title}</p>
              {row.info.mode === "not_configured" ? (
                <div className="mt-2">
                  <NotConfigured message={`${row.info.name} är inte kopplad.`} />
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {row.info.name} — läge: {row.info.mode === "demo" ? "DEMO" : "live"}
                </p>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Demoläge: {data.resolved.demoMode ? "på" : "av"}.
        </p>
      </Panel>

      <Panel title="Registrerade leverantörer">
        <ul className="space-y-2 text-sm">
          {(data.integrations).map((integration) => (
            <li key={integration.provider_key} className="rounded-md border border-border p-3">
              <p className="font-medium">{integration.provider_name}</p>
              <p className="text-xs text-muted-foreground">
                {integration.kind} · {integration.mode === "not_configured" ? "ej konfigurerad" : integration.mode}
                {integration.notes ? ` · ${integration.notes}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Kostnads- och användningstak">
        <ul className="space-y-2 text-sm">
          {(data.usage).map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
            >
              <span>
                {row.provider_key}
                <span className="block text-xs text-muted-foreground">
                  Förbrukat {formatSek(Number(row.cost_sek))} av {formatSek(Number(row.monthly_cap_sek))} ·{" "}
                  {row.units} anrop
                </span>
              </span>
              <input
                type="number"
                min={0}
                defaultValue={Number(row.monthly_cap_sek)}
                onBlur={(e) => mutation.mutate({ id: row.id, cap: Number(e.target.value) })}
                className="w-32 rounded-md border border-input bg-background px-2 py-1 text-sm"
                disabled={!data.access.isAdmin}
              />
            </li>
          ))}
        </ul>
        {!data.access.isAdmin ? (
          <p className="mt-3 text-xs text-muted-foreground">Endast Aurora-admin kan ändra taken.</p>
        ) : null}
        {mutation.error ? <ErrorNote error={mutation.error} /> : null}
      </Panel>
    </AppShell>
  );
}
