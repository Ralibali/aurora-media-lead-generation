const groups = [
  {
    name: "Etablerade SMB",
    body: "Ditt team (20–200 anställda) har ett Excel-ark eller manuell process som skriker efter att bli en app. Jag bygger den på 2–4 veckor. Fast pris.",
  },
  {
    name: "Startup-grundare",
    body: "Du har en idé men ingen utvecklare. Jag bygger MVP:n så du kan validera, pitcha investerare eller ta dina första betalande kunder.",
  },
  {
    name: "Företag som vill undvika byrå-fällan",
    body: "Du vet att en traditionell dev-byrå tar 6 månader och 500 000 kr för det du behöver. Det behöver inte vara så. Jag bygger med AI. Snabbare, billigare, samma kvalitet.",
  },
];

const TargetAudienceSection = () => {
  return (
    <section className="border-t border-border py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl">
          <p className="label-caps">Målgrupp</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Vem jag jobbar med</h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {groups.map((g) => (
            <div key={g.name} className="rounded-lg border border-border bg-card p-7">
              <h3 className="font-serif text-2xl">{g.name}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
