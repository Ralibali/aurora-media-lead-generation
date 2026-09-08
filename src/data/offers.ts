// Public offer catalogue. Keep names, starting prices and planning ranges consistent.
export type Package = {
  num: string;
  name: string;
  modalValue: string;
  time: string;
  price: string;
  priceFrom: number;
  featured?: boolean;
  desc: string;
  features: readonly string[];
};

export const PACKAGES: readonly Package[] = [
  {
    num: "01",
    name: "Aurora Sprint",
    modalValue: "Prototyp",
    time: "1–2 veckor",
    price: "från 4 900 kr",
    priceFrom: 4900,
    desc: "Klickbar prototyp eller första fungerande version för att validera idén snabbt.",
    features: [
      "Avgränsning av kärnflödet",
      "Klickbar eller fungerande prototyp",
      "Modern, responsiv design",
      "Demo-URL för test",
      "Rekommendation för nästa steg",
    ],
  },
  {
    num: "02",
    name: "Aurora MVP",
    modalValue: "MVP",
    time: "3–5 veckor",
    price: "från 11 900 kr",
    priceFrom: 11900,
    featured: true,
    desc: "Lanseringsbar MVP med riktiga användare, data och de viktigaste funktionerna.",
    features: [
      "Inloggning och autentisering",
      "Databas i Supabase/Postgres",
      "Enkel adminpanel",
      "Betalflöde med Stripe vid behov",
      "GitHub-repo och dokumentation",
    ],
  },
  {
    num: "03",
    name: "Aurora Scale",
    modalValue: "SaaS",
    time: "6–10 veckor",
    price: "från 24 900 kr",
    priceFrom: 24900,
    desc: "Skalbar SaaS eller intern plattform med roller, integrationer och automation.",
    features: [
      "Skalbar systemstruktur",
      "Roller och behörigheter",
      "Tredjepartsintegrationer",
      "AI-flöden och automation",
      "Teknisk överlämning",
    ],
  },
  {
    num: "04",
    name: "Aurora AI Ops",
    modalValue: "AI-automation",
    time: "Efter scope",
    price: "från 4 900 kr",
    priceFrom: 4900,
    desc: "AI-automationer och interna verktyg för företag som vill kapa manuellt arbete.",
    features: [
      "Processkartläggning",
      "AI- och automationsflöden",
      "API-kopplingar",
      "Behörighetshantering",
      "Driftbar lösning",
    ],
  },
];

