import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    q: "Varför så mycket billigare än traditionella dev-byråer?",
    a: "Eftersom jag använder AI för att skriva större delen av koden. En traditionell utvecklare tar 400–1200 kr/h och bygger 1 feature/dag. Jag bygger 5–10 features/dag till fast pris.",
  },
  {
    q: "Vad händer om Lovable eller Bolt höjer priser eller stängs ner?",
    a: "Jag är inte låst till ett verktyg. Jag använder Lovable, Bolt, Emergent, Cursor och Claude efter behov. Koden är standard React + Supabase som fungerar var som helst. Du får alltid källkoden.",
  },
  {
    q: "Kan jag få källkoden efter leverans?",
    a: "Ja, alltid. Du äger allt – kod, design, data, domän. Jag har inga låsningar.",
  },
  {
    q: "Hur fungerar supporten efter leverans?",
    a: "Prototyp: 1 vecka. MVP: 2 veckor. SaaS: 1 månad. Sedan kan du teckna löpande underhåll för 1 990 kr/mån eller stå på egen hand.",
  },
  {
    q: "Jobbar du ensam eller har du team?",
    a: "Jag driver Aurora Media AB själv. Det är precis därför jag är snabb och prisvärd – inga mellanled, ingen byråkrati, inga projektledare som ska bokas in.",
  },
  {
    q: "Kan du ta över ett befintligt projekt?",
    a: "Ja, om det är byggt i teknologi jag jobbar i (React, Supabase, Next.js, Vue). Jag gör en snabb audit först och ger fast pris på överlämningen.",
  },
  {
    q: "Vad kostar löpande underhåll?",
    a: "1 990 kr/mån. Inkluderar bugfixar, säkerhetsuppdateringar, mindre justeringar (upp till 2 timmar/mån). Större features offereras separat.",
  },
  {
    q: "Accepterar du fasta retainers istället för enskilda projekt?",
    a: "Ja. Om du behöver löpande utveckling (t.ex. nya features varje månad) kan vi göra en retainer-modell från 12 000 kr/mån.",
  },
  {
    q: "Hur är det med GDPR och databehandling?",
    a: "All data lagras i EU (Supabase Frankfurt-region). Jag upprättar personuppgiftsbiträdesavtal vid projektets början och går igenom vilka uppgifter som hanteras var.",
  },
  {
    q: "Vad händer om projektet blir försenat?",
    a: "Fasta pris gäller. Om jag blir försenad kostar det inte dig något extra. Om du vill lägga till scope är det offert-baserat.",
  },
  {
    q: "Kan du bara hjälpa mig med SEO eller marknadsföring?",
    a: "Primärt bygger jag produkter. Men om ni har en befintlig produkt och behöver teknisk SEO, jag tar såna projekt också. Timpris 895 kr/h.",
  },
  {
    q: "Var är du baserad?",
    a: "Linköping, Sverige. Jag jobbar med kunder i hela landet – de flesta möten är digitala.",
  },
];

const FAQSection = ({
  items = faqs,
  title = "Vanliga frågor",
}: {
  items?: typeof faqs;
  title?: string;
}) => {
  return (
    <section className="border-t border-border py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl">
          <p className="label-caps">FAQ</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">{title}</h2>
        </div>

        <div className="mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {items.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-serif text-lg md:text-xl py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
