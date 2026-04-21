import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";

export const paket = [
  {
    id: "Prototyp",
    name: "Prototyp",
    price: "14 900 kr",
    time: "3–5 arbetsdagar",
    desc: "Validera en idé. Visa investerare. Testa koncept på 10 vänner innan du satsar stort.",
    features: [
      "Klickbar produkt med riktig data (inte Figma-mockup)",
      "Responsiv design, mobil + desktop",
      "Deployment på din subdomän",
      "1 veckas support",
    ],
    cta: "Starta prototyp",
    featured: false,
  },
  {
    id: "MVP",
    name: "MVP",
    price: "34 900 kr",
    time: "2 veckor",
    desc: "Lansera till första användarna. Ta betalt från dag ett.",
    features: [
      "Allt i Prototyp",
      "Användarregistrering & inloggning",
      "Stripe-betalningar integrerade",
      "Admin-dashboard",
      "SEO-grundoptimering",
      "2 veckors support",
    ],
    cta: "Starta MVP",
    featured: true,
  },
  {
    id: "SaaS",
    name: "Skalbar SaaS",
    price: "69 000 kr",
    time: "4 veckor",
    desc: "Full produkt redo för riktiga kunder. Betal-SaaS eller internt verktyg för team.",
    features: [
      "Allt i MVP",
      "Avancerad dashboard med analys",
      "Integrationer (Fortnox, HubSpot, Google Workspace m.fl.)",
      "Full SEO-optimering + schema.org",
      "1 månads support",
    ],
    cta: "Starta SaaS-projekt",
    featured: false,
  },
  {
    id: "Skraddarsytt",
    name: "Skräddarsytt",
    price: "Från 89 000 kr",
    time: "4–8 veckor",
    desc: "Komplexa projekt med egna krav. Diskuteras från fall till fall.",
    features: [
      "Egna API:er eller third-party-integrationer",
      "Multi-tenant-arkitektur",
      "Skarpa säkerhetskrav eller GDPR-behov",
      "Stora datamängder eller heavy dashboarding",
    ],
    cta: "Boka konsultation",
    featured: false,
  },
];

const PaketSection = () => {
  const { open } = useContactModal();

  return (
    <section id="paket" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl">
          <p className="label-caps">Paket & priser</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Vad jag bygger åt dig</h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Fast pris. Ingen byråkrati. Du vet exakt vad det kostar innan vi börjar.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {paket.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                p.featured ? "border-primary shadow-sm" : "border-border"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary-foreground">
                  Populärast
                </span>
              )}
              <p className="label-caps">{p.name}</p>
              <p className="mt-3 font-serif text-3xl">{p.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.time}</p>
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">{p.desc}</p>

              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => open(p.id)}
                variant={p.featured ? "default" : "outline"}
                className="mt-6 w-full"
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-3xl text-sm text-muted-foreground">
          Löpande underhåll efter leverans: <span className="text-foreground">1 990 kr/mån</span>.
          Bugfixar, säkerhetsuppdateringar, mindre justeringar.
        </p>
      </div>
    </section>
  );
};

export default PaketSection;
