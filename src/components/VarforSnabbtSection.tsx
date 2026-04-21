const reasons = [
  {
    title: "AI är hela min byggmetodik",
    body: "Jag skriver inte kod rad för rad. Jag orkestrerar AI-verktyg som skriver koden åt mig, sedan finjusterar jag det som behövs. En traditionell utvecklare bygger 1 feature per dag. Jag bygger 5–10.",
  },
  {
    title: "Jag har redan löst problemet en gång",
    body: "Betalsystem, användarauthentisering, dashboards, SEO, integrationer med Fortnox eller Stripe. Jag har gjort allt det i mina egna 7 produkter. Det som tar en ny byrå 3 veckor att researcha tar mig 3 dagar.",
  },
  {
    title: "10 år i säkerhetsbranschen",
    body: "Innan jag gjorde det här på heltid arbetade jag 10 år i säkerhetsbranschen. Det lärde mig tre saker: rutiner levererar resultat, deadlines är löften, och ingenting får glappa när det gäller data eller användarintegritet.",
  },
];

const VarforSnabbtSection = () => {
  return (
    <section className="border-t border-border bg-secondary/30 py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl">
          <p className="label-caps">Varför snabbt?</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            Varför jag levererar på veckor, inte månader
          </h2>
        </div>

        <div className="mt-14 max-w-3xl space-y-12">
          {reasons.map((r) => (
            <div key={r.title}>
              <h3 className="font-serif text-2xl md:text-3xl">{r.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VarforSnabbtSection;
