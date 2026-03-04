import { ArrowRight, Lightbulb, Rocket, BarChart3, RefreshCw } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    number: "01",
    title: "Analys & Strategi",
    description: "Vi börjar med att förstå ert företag, era mål och er målgrupp. Genom en grundlig analys av er nuvarande digitala närvaro identifierar vi möjligheter och skapar en skräddarsydd strategi.",
  },
  {
    icon: Rocket,
    number: "02",
    title: "Genomförande",
    description: "Vi sätter strategin i verket – oavsett om det handlar om att bygga en ny hemsida, lansera annonskampanjer eller skapa innehåll. Vi håller er uppdaterade hela vägen.",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Mätning & Optimering",
    description: "Vi följer upp resultaten noggrant med analysverktyg. Vad fungerar? Vad kan bli bättre? Vi optimerar löpande för att maximera er avkastning.",
  },
  {
    icon: RefreshCw,
    number: "04",
    title: "Löpande Utveckling",
    description: "Digital marknadsföring är ingen engångsinsats. Vi jobbar kontinuerligt med att utveckla och förbättra er närvaro för långsiktig tillväxt.",
  },
];

const ProcessSection = () => {
  return (
    <section id="process" className="py-24 md:py-32 bg-card/50 scroll-mt-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Hur vi jobbar</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Från idé till resultat</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Vi tror på ett strukturerat arbetssätt med tydliga steg – så att ni alltid vet vad som händer och varför.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              <div className="p-8 rounded-xl bg-card aurora-border h-full">
                <span className="text-4xl font-display font-bold aurora-text opacity-50">{step.number}</span>
                <div className="w-10 h-10 rounded-lg aurora-gradient flex items-center justify-center my-4">
                  <step.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-primary/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
