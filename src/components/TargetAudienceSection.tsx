import Reveal from "@/components/Reveal";

const groups = [
  {
    name: "Etablerade företag (SMB)",
    body: "Ni har en befintlig verksamhet med 20–200 anställda och behöver en intern app eller en ny digital tjänst. Ni vill ha en snabb process och ett fast pris istället för en byrå-offert i flera steg.",
  },
  {
    name: "Startup-grundare",
    body: "Du har en idé men ingen utvecklare. Du behöver en prototyp eller MVP för att testa mot marknaden, pitcha investerare eller ta dina första betalande kunder. Du vill jobba med någon som själv har byggt och lanserat.",
  },
  {
    name: "Byrå-flyktingar",
    body: "Du har tröttnat på stora byråer med långa ledtider, höga priser och projektledare i varje led. Du vill ha en direkt relation med personen som faktiskt skriver koden.",
  },
];

const TargetAudienceSection = () => {
  return (
    <section className="border-t border-border py-24 md:py-32">
      <div className="container mx-auto px-6">
        <Reveal className="max-w-2xl">
          <p className="label-caps">För vem?</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Jag jobbar helst med tre typer av kunder.</h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {groups.map((g, i) => (
            <Reveal key={g.name} delay={i * 0.08} y={20}>
              <div className="h-full rounded-lg border border-border bg-card p-7 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
                <h3 className="font-serif text-2xl">{g.name}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
