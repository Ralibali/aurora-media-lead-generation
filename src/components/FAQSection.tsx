import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    q: "Vem är du?",
    a: "Jag heter Christoffer och driver Aurora Media själv från Linköping. Jag kommer från säkerhetsbranschen där jag jobbade i 10 år innan jag bytte spår och bygger nu webbappar på heltid.",
  },
  {
    q: "Använder du AI för att skriva all kod?",
    a: "Nej. Jag använder AI-verktyg som Lovable, Bolt och Claude för att snabba på vissa delar, men jag granskar och styr all arkitektur och logik själv. Det är så jag kan leverera på veckor istället för månader utan att tappa kvalitet.",
  },
  {
    q: "Vad betyder det att jag äger källkoden?",
    a: "Att du får alla filer och rättigheter till koden jag skriver. Du kan anlita vem som helst för att vidareutveckla den i framtiden. Inga låsningar, inga abonnemang du måste behålla.",
  },
  {
    q: "Vilken teknik använder du?",
    a: "Jag bygger med React för frontend och Supabase (PostgreSQL) för backend. Det är en modern och stabil kombination som funkar för allt från enkla appar till skalbar SaaS.",
  },
  {
    q: "Varför en administrativ avgift på 15%?",
    a: "Den täcker min tid för projekthantering, möten och avstämningar. Jag väljer att redovisa den separat istället för att gömma den i timpriset. Då vet du exakt vad du betalar för.",
  },
  {
    q: "Vad händer efter att appen är klar?",
    a: "Jag överlämnar allt till dig. Om du vill kan jag erbjuda ett supportavtal för 1 990 kr/mån som täcker drift och mindre ändringar. Annars står du på egen hand med full källkod.",
  },
  {
    q: "Kan du bygga en mobilapp för App Store?",
    a: "Apparna jag bygger är webbappar som fungerar och ser bra ut på mobilen. De kan installeras på hemskärmen precis som en vanlig app. För renodlade native-appar hänvisar jag vidare.",
  },
  {
    q: "Varför jobbar du ensam?",
    a: "För att det är enklare. Färre möten, inga missförstånd och en rakare kommunikation. Du pratar direkt med personen som bygger – ingen account manager emellan.",
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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="label-caps">Frågor & svar</p>
          <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em]">
            {title}
          </h2>
        </motion.div>

        <div className="mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {items.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-serif text-lg md:text-xl py-5 data-[state=open]:text-primary">
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
