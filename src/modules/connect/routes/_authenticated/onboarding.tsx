import { createFileRoute, useNavigate } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { useState } from "react";
import { AppShell } from "@/modules/connect/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listPlans, listTemplates, onboardOrganization } from "@/modules/connect/lib/aurora.functions";
import { formatSek } from "@/modules/connect/lib/pricing";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Ny kund – Aurora Voice" },
      { name: "description", content: "Guide i steg för att sätta upp en ny kund med branschmall, paket och budget." },
      { property: "og:title", content: "Ny kund – Aurora Voice" },
      { property: "og:description", content: "Onboarding-guide i Aurora Voice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

const steps = ["Verksamhet", "Branschmall", "Paket och budget", "Klart"];

function OnboardingPage() {
  const navigate = useNavigate();
  const templates = useQuery({ queryKey: ["templates"], queryFn: () => listTemplates() });
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => listPlans() });
  const onboard = useServerFn(onboardOrganization);

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    orgNumber: "",
    city: "",
    contactEmail: "",
    contactPhone: "",
    fallbackNumber: "",
    vertical: "trafikskola" as "trafikskola" | "hospitality",
    templateKey: "",
    planKey: "pilot",
    monthlyBudgetSek: 2000,
  });

  const availableTemplates = (templates.data ?? []).filter((t) => t.vertical === form.vertical);

  async function submit() {
    setBusy(true);
    try {
      const result = await onboard({
        data: {
          name: form.name,
          orgNumber: form.orgNumber || null,
          city: form.city || null,
          contactEmail: form.contactEmail || null,
          contactPhone: form.contactPhone || null,
          fallbackNumber: form.fallbackNumber || null,
          vertical: form.vertical,
          templateKey: form.templateKey || availableTemplates[0]?.key || "",
          planKey: form.planKey,
          monthlyBudgetSek: form.monthlyBudgetSek,
        },
      });
      toast.success("Kunden är upplagd i demoläge.");
      navigate({ to: "/kunder/$orgId", params: { orgId: result.orgId } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kunde inte skapa kunden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="Ny kund"
      description="Kunden skapas alltid i demoläge. Först när riktiga samtal är testade sätter ni den i drift."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <Badge key={label} variant={index === step ? "default" : "outline"}>
            {index + 1}. {label}
          </Badge>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Verksamhetens namn</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgnr">Organisationsnummer</Label>
                <Input id="orgnr" value={form.orgNumber} onChange={(e) => setForm({ ...form, orgNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ort</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Kontakt-e-post</Label>
                <Input id="email" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon till verksamheten</Label>
                <Input id="phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fallback">Nummer för överkoppling</Label>
                <Input id="fallback" value={form.fallbackNumber} onChange={(e) => setForm({ ...form, fallbackNumber: e.target.value })} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                {(["trafikskola", "hospitality"] as const).map((v) => (
                  <Button
                    key={v}
                    variant={form.vertical === v ? "default" : "secondary"}
                    onClick={() => setForm({ ...form, vertical: v, templateKey: "" })}
                  >
                    {v === "trafikskola" ? "Trafikskola" : "Hospitality / Glamping"}
                  </Button>
                ))}
              </div>
              <div className="grid gap-3">
                {availableTemplates.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setForm({ ...form, templateKey: t.key })}
                    className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                      form.templateKey === t.key ? "border-primary bg-secondary" : "border-border hover:bg-secondary"
                    }`}
                  >
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {(plans.data ?? []).map((plan) => (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => setForm({ ...form, planKey: plan.key })}
                    className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                      form.planKey === plan.key ? "border-primary bg-secondary" : "border-border hover:bg-secondary"
                    }`}
                  >
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatSek(Number(plan.setup_fee_sek))} uppstart · {formatSek(Number(plan.monthly_fee_sek))}/mån ·{" "}
                      {plan.included_minutes} min ingår
                    </p>
                  </button>
                ))}
              </div>
              <div className="space-y-2 sm:max-w-xs">
                <Label htmlFor="budget">Månadsbudget för användning (kr)</Label>
                <Input
                  id="budget"
                  type="number"
                  min={0}
                  value={form.monthlyBudgetSek}
                  onChange={(e) => setForm({ ...form, monthlyBudgetSek: Number(e.target.value) })}
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Verksamhet:</span> {form.name || "–"}
              </p>
              <p>
                <span className="text-muted-foreground">Bransch:</span> {form.vertical}
              </p>
              <p>
                <span className="text-muted-foreground">Mall:</span>{" "}
                {form.templateKey || availableTemplates[0]?.key || "–"}
              </p>
              <p>
                <span className="text-muted-foreground">Paket:</span> {form.planKey}
              </p>
              <p>
                <span className="text-muted-foreground">Budget:</span> {formatSek(form.monthlyBudgetSek)}/mån
              </p>
              <p className="pt-2 text-muted-foreground">
                Kunden skapas i demoläge med kunskapsbas, öppettider, kvalificeringsfrågor,
                överkopplingsregler och en testplan för svensk röstberedskap.
              </p>
            </div>
          ) : null}

          <div className="flex justify-between pt-2">
            <Button variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Tillbaka
            </Button>
            {step < steps.length - 1 ? (
              <Button disabled={step === 0 && form.name.trim().length < 2} onClick={() => setStep(step + 1)}>
                Nästa
              </Button>
            ) : (
              <Button disabled={busy || form.name.trim().length < 2} onClick={submit}>
                Skapa kund
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
