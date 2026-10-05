import { createFileRoute, useNavigate } from "@/modules/shared/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { useState } from "react";
import { AppShell, ErrorNote, Panel } from "@/modules/local-boost/components/AppShell";
import { createOnboarding, getOverview } from "@/modules/local-boost/lib/aurora.functions";
import { formatSek } from "@/modules/local-boost/lib/pricing";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — Aurora Local" },
      { name: "description", content: "Lägg upp ny kund och plats med plan och checklista." },
      { property: "og:title", content: "Onboarding — Aurora Local" },
      { property: "og:description", content: "Guide för att starta en ny plats." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const fetchOverview = useServerFn(getOverview);
  const create = useServerFn(createOnboarding);
  const { data } = useQuery({ queryKey: ["overview"], queryFn: () => fetchOverview() });

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    organizationId: "",
    organizationName: "",
    contactEmail: "",
    locationName: "",
    street: "",
    postalCode: "",
    city: "",
    phone: "",
    website: "",
    planCode: "tillvaxt" as "bas" | "tillvaxt" | "premium",
  });

  const mutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          ...(form.organizationId ? { organizationId: form.organizationId } : {}),
          ...(form.organizationName ? { organizationName: form.organizationName } : {}),
          ...(form.contactEmail ? { contactEmail: form.contactEmail } : {}),
          locationName: form.locationName,
          ...(form.street ? { street: form.street } : {}),
          ...(form.postalCode ? { postalCode: form.postalCode } : {}),
          ...(form.city ? { city: form.city } : {}),
          ...(form.phone ? { phone: form.phone } : {}),
          ...(form.website ? { website: form.website } : {}),
          planCode: form.planCode,
        },
      }),
    onSuccess: (result) => navigate({ to: "/platser/$id", params: { id: result.locationId } }),
  });

  const field = (key: keyof typeof form, placeholder: string, type = "text") => (
    <input
      type={type}
      value={form[key] as string}
      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      placeholder={placeholder}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
    />
  );

  return (
    <AppShell
      title="Onboarding"
      description="Tre steg: kund, plats och plan. Checklistan skapas automatiskt."
    >
      <Panel title={`Steg ${step} av 3`}>
        {step === 1 ? (
          <div className="space-y-3">
            <label className="block text-sm text-muted-foreground">Befintlig kund</label>
            <select
              value={form.organizationId}
              onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">— Ny kund —</option>
              {(data?.organizations ?? []).map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {!form.organizationId ? (
              <>
                {field("organizationName", "Kundens företagsnamn")}
                {field("contactEmail", "Kontakt-e-post", "email")}
              </>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            {field("locationName", "Platsens namn")}
            {field("street", "Gatuadress")}
            {field("postalCode", "Postnummer")}
            {field("city", "Ort")}
            {field("phone", "Telefon")}
            {field("website", "Webbplats")}
            <p className="text-xs text-muted-foreground">
              Namn, adress och telefon används som facit vid kontroll mot kataloger.
            </p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            {(data?.plans ?? []).map((plan) => (
              <label
                key={plan.code}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3"
              >
                <input
                  type="radio"
                  name="plan"
                  checked={form.planCode === plan.code}
                  onChange={() => {
                    const code = plan.code;
                    if (code === "bas" || code === "tillvaxt" || code === "premium") {
                      setForm({ ...form, planCode: code });
                    }
                  }}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">{plan.name}</span> —{" "}
                  {formatSek(plan.monthly_price_sek)}/mån + {formatSek(plan.onboarding_fee_sek)} i
                  onboarding
                  <span className="block text-xs text-muted-foreground">{plan.description}</span>
                </span>
              </label>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex gap-2">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Tillbaka
            </button>
          ) : null}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && form.locationName.trim().length < 2}
              className="rounded-md px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50"
            >
              Nästa
            </button>
          ) : (
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="rounded-md px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50"
            >
              Skapa plats
            </button>
          )}
        </div>
        {mutation.error ? <ErrorNote error={mutation.error} /> : null}
      </Panel>
    </AppShell>
  );
}
