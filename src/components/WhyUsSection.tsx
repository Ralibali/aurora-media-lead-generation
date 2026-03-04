import { Shield, Clock, Eye, Handshake, TrendingUp, HeartHandshake } from "lucide-react";

const reasons = [
  {
    icon: HeartHandshake,
    title: "Personligt engagemang",
    description: "Ni är inte ett nummer i kön. Vi lär känna ert företag på djupet och behandlar ert varumärke som vårt eget.",
  },
  {
    icon: Eye,
    title: "Full transparens",
    description: "Ni ser alltid exakt vad vi gör och vad det kostar. Inga dolda avgifter, inga överraskningar. Vi tar bara 15% i administrationsavgift på annonsering.",
  },
  {
    icon: TrendingUp,
    title: "Resultatfokus",
    description: "Vi mäter allt vi gör. Varje krona ni investerar ska generera mätbara resultat – fler besökare, fler leads, fler kunder.",
  },
  {
    icon: Shield,
    title: "Allt under ett tak",
    description: "Slipp hantera fem olika byråer. Vi erbjuder alla digitala tjänster ni behöver – från hemsida och SEO till sociala medier och annonsering.",
  },
  {
    icon: Clock,
    title: "Snabba leveranser",
    description: "Vi vet att tid är pengar. Vårt team jobbar effektivt för att leverera på tid utan att kompromissa med kvalitet.",
  },
  {
    icon: Handshake,
    title: "Långsiktigt partnerskap",
    description: "Vi bygger relationer, inte bara projekt. Vår framgång mäts i er tillväxt – det är därför vi jobbar långsiktigt med alla våra kunder.",
  },
];

const WhyUsSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Varför oss?</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Receptet till att växa</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Det finns hundratals digitala byråer där ute. Här är varför våra kunder väljer att jobba med oss – och fortsätter göra det.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason) => (
            <div key={reason.title} className="flex gap-5">
              <div className="w-12 h-12 shrink-0 rounded-lg aurora-gradient flex items-center justify-center">
                <reason.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold mb-2">{reason.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
