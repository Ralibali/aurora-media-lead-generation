import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import RelatedLinks from "@/components/RelatedLinks";
import Reveal from "@/components/Reveal";
import { setSEOMeta, setJsonLd, setBreadcrumb, SITE_URL } from "@/lib/seoHelpers";

const steps = [
  {
    title: "1. Discovery (dag 1)",
    body: "Vi har ett 45-minuters samtal där vi går igenom vad du vill bygga, vilka användare du har, vilka system det måste prata med och vad som faktiskt definierar ett lyckat projekt. Du får en skriftlig sammanfattning samma dag och en fast offert dagen efter.",
  },
  {
    title: "2. Spec & wireframes (dag 2–3)",
    body: "Jag skriver en kompakt produktspec på 2–4 sidor: användarflöden, datamodell, integrationer och tekniska beslut. Inga 80-sidiga kravdokument. Du godkänner specen innan en kodrad skrivs.",
  },
  {
    title: "3. AI-driven kodning (dag 4–14)",
    body: "Här bygger jag i Lovable, Bolt eller Emergent beroende på projekt. AI genererar grunden – jag granskar, refaktorerar, säkrar och kopplar ihop med Supabase, Stripe, Fortnox eller vad som krävs. Du får en levande preview-länk från dag ett.",
  },
  {
    title: "4. QA & säkerhet (sista veckan)",
    body: "Jag kör manuell QA, RLS-policys i databasen, säkerhetsscan, prestandaprofilering och ett 50-punkters lanseringschecklista. Allt loggas så du ser exakt vad som testats.",
  },
  {
    title: "5. Lansering & överlämning",
    body: "Du får full kodbas på GitHub, Supabase-projektet i ditt namn, dokumentation och en 30-minuters genomgång. Ingen lock-in – du äger allt och kan flytta vart du vill.",
  },
];

const principles = [
  {
    title: "AI skriver inte allt",
    body: "AI genererar 70–80 procent av koden. Resterande 20–30 procent – arkitektur, säkerhet, edge cases, integrationer – kräver erfaren utvecklare. Det är där värdet ligger.",
  },
  {
    title: "Fast pris, ingen timdebitering",
    body: "Du vet vad du betalar innan jag börjar. Om jag underskattar tiden är det mitt problem, inte ditt. Det tvingar mig att vara realistisk i offerten.",
  },
  {
    title: "Du äger allt",
    body: "Källkod, databas, domän, hostingkonton – allt registreras i ditt namn från dag ett. Jag är konsult, inte värd.",
  },
  {
    title: "Riktiga säkerhetsrutiner",
    body: "Row Level Security i databasen, JWT-validering på edge functions, secrets i miljövariabler, OWASP-baserad QA. Inte bara ”AI skrev det så det funkar”.",
  },
];

const tools = [
  { name: "Lovable", use: "Primärt verktyg för React/TS + Supabase. Bäst för SaaS och webb." },
  { name: "Bolt.new", use: "Snabba prototyper och pitchdeck-demos när Lovable är overkill." },
  { name: "Emergent", use: "Komplexa multi-step backend-flöden och Python-tunga jobb." },
  { name: "Claude Code", use: "Refaktorering, code review och längre tankearbete utanför webb-IDE." },
  { name: "Supabase", use: "Databas, auth, storage, edge functions. RLS i alla projekt." },
  { name: "Stripe / Fortnox", use: "Betalningar och svensk bokföringsintegration." },
];

const Metodik = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Metodik – så bygger jag SaaS med AI på veckor | Aurora Media",
      description:
        "Min process från idé till lanserad SaaS på 2–4 veckor: discovery, spec, AI-driven kodning, QA, säkerhet och överlämning. Fast pris från 14 900 kr.",
      canonical: "/metodik",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Metodik", url: "/metodik" },
    ]);
    setJsonLd("metodik-howto", {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Hur Aurora Media bygger SaaS med AI",
      description: "Femstegsprocess från discovery till lansering på 2–4 veckor.",
      totalTime: "P28D",
      step: steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.body,
      })),
      author: { "@id": `${SITE_URL}/#organization` },
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <Reveal>
              <p className="label-caps">Metodik</p>
              <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05]">
                Så bygger jag SaaS med AI på <em className="italic text-primary">veckor</em>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                En transparent genomgång av hela processen – från första mejlet till lanserad produkt.
                Inga svarta lådor. Du ska veta exakt vad du köper.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-border py-20">
          <div className="container mx-auto px-6 max-w-3xl">
            <Reveal>
              <h2 className="font-serif text-3xl md:text-4xl mb-10">Processen, steg för steg</h2>
            </Reveal>
            <div className="space-y-10">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.06} y={16} duration={0.6}>
                  <h3 className="font-serif text-2xl mb-3">{s.title}</h3>
                  <p className="text-foreground/85 leading-relaxed">{s.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border py-20 bg-secondary/30">
          <div className="container mx-auto px-6 max-w-3xl">
            <Reveal>
              <h2 className="font-serif text-3xl md:text-4xl mb-10">Mina principer</h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              {principles.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.06} y={16} duration={0.6}>
                  <div className="rounded-xl border border-border bg-background p-6">
                    <p className="font-serif text-xl mb-2">{p.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border py-20">
          <div className="container mx-auto px-6 max-w-3xl">
            <Reveal>
              <h2 className="font-serif text-3xl md:text-4xl mb-10">Verktygen jag använder</h2>
            </Reveal>
            <ul className="space-y-4">
              {tools.map((t, i) => (
                <Reveal key={t.name} as="li" delay={i * 0.04} y={12} duration={0.5} className="border-b border-border pb-4">
                  <p className="font-serif text-lg">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.use}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border py-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <RelatedLinks
              heading="Läs vidare"
              links={[
                { to: "/redaktionell-policy", title: "Redaktionell policy", caption: "Transparens" },
                { to: "/priser", title: "Priser och paket", caption: "Vad det kostar" },
                { to: "/artiklar/lovable-vs-bolt-vs-emergent", title: "Lovable vs Bolt vs Emergent", caption: "Verktyg" },
                { to: "/arbete", title: "Sju produkter jag byggt själv", caption: "Portfölj" },
              ]}
            />
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default Metodik;
