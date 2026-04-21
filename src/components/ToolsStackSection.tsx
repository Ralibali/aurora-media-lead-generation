const tools = [
  {
    name: "Lovable",
    desc: "Snabbaste vägen från idé till produkt. Fullt React + Supabase-stack. Mitt huvudverktyg för de flesta projekt.",
    tag: "SaaS · MVP · Marknadsplatser",
  },
  {
    name: "Bolt.new",
    desc: "Live preview medan AI skriver koden. Bra för snabba prototyper och pitch-demos.",
    tag: "Prototyper · Demos",
  },
  {
    name: "Emergent",
    desc: "Komplexare system med bättre kontroll över arkitekturen. Används när projektet behöver mer än en standard-SaaS.",
    tag: "Enterprise · Custom",
  },
  {
    name: "Cursor + Claude",
    desc: "När AI-verktygen behöver finjusteras av en människa. Jag fyller i gapen där plattformarna inte räcker.",
    tag: "Custom kod · Integrationer",
  },
  {
    name: "Supabase + Stripe",
    desc: "Databas, auth, betalningar. Produktionsklar infrastruktur från dag 1.",
    tag: "Backend · Betalningar",
  },
];

const ToolsStackSection = () => {
  return (
    <section className="border-t border-border bg-secondary/30 py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl">
          <p className="label-caps">Stack</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Verktygen jag bygger med</h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Jag är inte låst till ett verktyg. Jag väljer det som passar ditt projekt bäst.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-lg border border-border bg-card p-6 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <p className="font-serif text-2xl">{t.name}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
              <p className="mt-5 text-xs text-primary">{t.tag}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsStackSection;
