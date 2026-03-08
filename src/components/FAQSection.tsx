import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Vad kostar en hemsida i Linköping?",
    answer:
      "Priset varierar beroende på omfattning och funktionalitet. En enklare företagshemsida med 5–10 sidor kostar vanligtvis från 15 000 kr, medan en mer avancerad e-handelslösning eller specialanpassad webbplats kan kosta från 30 000 kr och uppåt. Vi erbjuder alltid en kostnadsfri offert anpassad efter just ert behov.",
  },
  {
    question: "Hur lång tid tar det att bygga en hemsida?",
    answer:
      "En enklare företagshemsida tar normalt 2–4 veckor att leverera. Mer komplexa projekt som e-handel eller skräddarsydda lösningar kan ta 4–8 veckor beroende på funktionalitet och innehållsleverans från er sida.",
  },
  {
    question: "Varför ska jag välja en lokal webbbyrå i Linköping?",
    answer:
      "En lokal webbbyrå förstår den lokala marknaden och kan träffas för personliga möten. Vi på Aurora Media AB finns i Linköping och kan snabbt anpassa strategi efter lokala förutsättningar – det ger bättre resultat för företag som riktar sig mot kunder i Östergötland.",
  },
  {
    question: "Vad ingår i SEO för företag i Linköping?",
    answer:
      "Vår SEO-tjänst inkluderar teknisk SEO-audit, on-page-optimering, sökordanalys, lokal SEO (Google Business Profile), länkbygge och månatliga rapporter. Vi fokuserar på att få ert företag att synas högt i Google för sökord relevanta för Linköping och Östergötland.",
  },
  {
    question: "Erbjuder ni WordPress-hemsidor?",
    answer:
      "Ja! Vi bygger professionella WordPress-hemsidor optimerade för hastighet, SEO och säkerhet. WordPress är världens mest populära CMS och ger er full kontroll. Vi erbjuder även WooCommerce för e-handel.",
  },
  {
    question: "Hur mycket kostar Google Ads för mitt företag?",
    answer:
      "Vi rekommenderar en startbudget på minst 5 000 kr/månad i annonsbudget plus vår administrationsavgift på 15% av spenderat belopp. Den totala kostnaden beror på bransch och konkurrens. Vi ger full transparens – ni ser exakt vart varje krona går.",
  },
  {
    question: "Kan ni hjälpa till med sociala medier?",
    answer:
      "Absolut! Vi erbjuder allt från strategi och innehållsplanering till daglig hantering av Instagram, Facebook, LinkedIn och TikTok. Vi skapar engagerande innehåll, hanterar community management och rapporterar resultat månadsvis.",
  },
  {
    question: "Jobbar ni bara med företag i Linköping?",
    answer:
      "Vi är baserade i Linköping och många av våra kunder finns här, men vi jobbar med företag i hela Sverige. Det digitala arbetssättet gör att vi kan leverera lika bra resultat oavsett var ni befinner er.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 md:py-32 bg-card/50">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">
            Vanliga frågor
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frågor &amp; svar om webbbyrå i Linköping
          </h2>
          <p className="text-muted-foreground text-lg">
            Här hittar du svar på de vanligaste frågorna vi får från företag i
            Linköping och Östergötland.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card aurora-border rounded-xl px-6 border"
            >
              <AccordionTrigger className="text-left font-display font-semibold text-base md:text-lg py-5 hover:no-underline hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
