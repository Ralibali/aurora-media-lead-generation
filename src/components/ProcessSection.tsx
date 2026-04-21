const steps = [
  {
    when: "Dag 1",
    title: "Första samtalet",
    body: "Du beskriver problemet via mejl eller video-call. Jag säger rakt om det är byggbart, vilket paket som passar och exakt tidsplan. 20–30 min.",
  },
  {
    when: "Dag 3",
    title: "Klickbar prototyp",
    body: "Du loggar in och testar. Inte en Figma-mockup – en verklig app med din data. Din feedback formar resten av bygget.",
  },
  {
    when: "Dag 7–14",
    title: "Produktion",
    body: "Jag bygger ut funktionalitet, kopplar betalningar, sätter upp domän, dashboards, allt. Du får uppdateringar två gånger i veckan.",
  },
  {
    when: "Leveransdagen",
    title: "Du tar över",
    body: "Full överlämning. Källkod. Dokumentation. Support ingår 2–4 veckor. Sedan är produkten helt din.",
  },
];

const ProcessSection = () => {
  return (
    <section className="border-t border-border py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl">
          <p className="label-caps">Process</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Så går det till</h2>
          <p className="mt-5 text-lg text-muted-foreground">Fyra steg. Inga överraskningar.</p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title}>
              <div className="mb-4 flex items-center gap-3">
                <span className="font-serif text-3xl text-primary">0{i + 1}</span>
                <span className="label-caps">{s.when}</span>
              </div>
              <h3 className="font-serif text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
