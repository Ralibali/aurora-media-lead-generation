import { motion } from "framer-motion";
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
    q: "Vad händer om Lovable eller Bolt stängs ner?",
    a: "Jag är inte låst till ett verktyg. Jag använder Lovable, Bolt, Emergent, Cursor och Claude efter behov. Koden är standard React + Supabase som fungerar var som helst. Du får alltid källkoden.",
  },
  {
    q: "Får jag källkoden?",
    a: "Ja, alltid. Du äger allt – kod, design, data, domän. Inga låsningar.",
  },
  {
    q: "Hur fungerar supporten efter leverans?",
    a: "Prototyp: 1 vecka. MVP: 2 veckor. SaaS: 1 månad. Sedan kan du teckna löpande underhåll för 1 990 kr/mån eller stå på egen hand.",
  },
  {
    q: "Jobbar du ensam?",
    a: "Jag driver Aurora Media AB själv. Det är precis därför jag är snabb och prisvärd – inga mellanled, ingen byråkrati, inga projektledare som ska bokas in.",
  },
  {
    q: "Kan du ta över ett befintligt projekt?",
    a: "Ja, om det är byggt i teknologi jag jobbar i (React, Supabase, Next.js, Vue). Jag gör en snabb audit först och ger fast pris på överlämningen.",
  },
  {
    q: "Hur fungerar det med GDPR?",
    a: "All data lagras i EU (Supabase Frankfurt). Jag upprättar personuppgiftsbiträdesavtal vid projektets början och går igenom vilka uppgifter som hanteras var.",
  },
  {
    q: "Vad händer om projektet försenas?",
    a: "Fast pris gäller. Om jag blir försenad kostar det inte dig något extra. Om du vill lägga till scope är det offert-baserat.",
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
          <p className="label-caps">FAQ</p>
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
