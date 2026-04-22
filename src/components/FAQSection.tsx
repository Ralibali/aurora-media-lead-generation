import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

export const faqs = [
  {
    q: "Vem är du?",
    a: "Jag heter Christoffer och driver Aurora Media själv från Linköping. Jag kommer från säkerhetsbranschen där jag jobbade i tio år innan jag bytte spår och bygger nu webbappar på heltid.",
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
  searchable = false,
}: {
  items?: typeof faqs;
  title?: string;
  searchable?: boolean;
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [items, query, searchable]);

  return (
    <section className="border-t border-border py-20 md:py-32">
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
          {searchable && (
            <p className="mt-4 text-base text-muted-foreground">
              {items.length} frågor. Sök eller bläddra.
            </p>
          )}
        </motion.div>

        {searchable && (
          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sök bland frågorna…"
                className="h-12 rounded-full border-border bg-card pl-11 pr-11 text-base shadow-sm focus-visible:ring-primary/40"
                aria-label="Sök i frågor och svar"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Rensa sökning"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {query && (
              <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
                {filtered.length === 0
                  ? "Inga träffar."
                  : `${filtered.length} träff${filtered.length === 1 ? "" : "ar"}`}
                {" "}för "{query}"
              </p>
            )}
          </div>
        )}

        <div className="mt-10 max-w-3xl">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
              <HelpCircle className="mx-auto h-6 w-6 text-muted-foreground/60" />
              <p className="mt-4 font-serif text-xl">Hittar du inte svaret?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Mejla{" "}
                <a
                  href="mailto:info@auroramedia.se"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  info@auroramedia.se
                </a>{" "}
                – jag svarar inom 24 timmar.
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              <AnimatePresence initial={false}>
                {filtered.map((f, i) => (
                  <motion.div
                    key={f.q}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25, delay: searchable ? 0 : i * 0.03 }}
                  >
                    <AccordionItem
                      value={`item-${i}`}
                      className="mb-3 overflow-hidden rounded-xl border border-border bg-card/60 px-5 transition-colors data-[state=open]:border-primary/50 data-[state=open]:bg-card data-[state=open]:shadow-sm sm:px-6"
                    >
                      <AccordionTrigger className="gap-4 py-5 text-left font-serif text-lg leading-snug tracking-[-0.01em] hover:no-underline data-[state=open]:text-primary md:text-xl">
                        <span className="flex-1">{f.q}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground sm:text-[1.0625rem]">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Accordion>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
