import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, X, Question, ArrowRight } from "@phosphor-icons/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { trackFaqSearch } from "@/lib/faqTracking";

export type FaqItem = {
  q: string;
  a: string;
  category?: string;
};

export const faqs: FaqItem[] = [
  {
    q: "Vem är du?",
    a: "Jag heter Christoffer och driver Aurora Media själv från Linköping. Jag kommer från säkerhetsbranschen där jag jobbade i tio år innan jag bytte spår och bygger nu webbappar på heltid.",
    category: "Om mig",
  },
  {
    q: "Använder du AI för att skriva all kod?",
    a: "Nej. Jag använder AI-verktyg som Lovable, Bolt och Claude för att snabba på vissa delar, men jag granskar och styr all arkitektur och logik själv. Det är så jag kan leverera på veckor istället för månader utan att tappa kvalitet.",
    category: "Verktyg",
  },
  {
    q: "Vad betyder det att jag äger källkoden?",
    a: "Att du får alla filer och rättigheter till koden jag skriver. Du kan anlita vem som helst för att vidareutveckla den i framtiden. Inga låsningar, inga abonnemang du måste behålla.",
    category: "Pris & process",
  },
  {
    q: "Vilken teknik använder du?",
    a: "Jag bygger med React för frontend och Supabase (PostgreSQL) för backend. Det är en modern och stabil kombination som funkar för allt från enkla appar till skalbar SaaS.",
    category: "Verktyg",
  },
  {
    q: "Varför en administrativ avgift på 15%?",
    a: "Den täcker min tid för projekthantering, möten och avstämningar. Jag väljer att redovisa den separat istället för att gömma den i timpriset. Då vet du exakt vad du betalar för.",
    category: "Pris & process",
  },
  {
    q: "Vad händer efter att appen är klar?",
    a: "Jag överlämnar allt till dig. Om du vill kan jag erbjuda ett supportavtal för 1 990 kr/mån som täcker drift och mindre ändringar. Annars står du på egen hand med full källkod.",
    category: "Pris & process",
  },
  {
    q: "Kan du bygga en mobilapp för App Store?",
    a: "Apparna jag bygger är webbappar som fungerar och ser bra ut på mobilen. De kan installeras på hemskärmen precis som en vanlig app. För renodlade native-appar hänvisar jag vidare.",
    category: "Verktyg",
  },
  {
    q: "Varför jobbar du ensam?",
    a: "För att det är enklare. Färre möten, inga missförstånd och en rakare kommunikation. Du pratar direkt med personen som bygger – ingen account manager emellan.",
    category: "Om mig",
  },
];

const FAQSection = ({
  items = faqs,
  title = "Vanliga frågor",
  searchable = false,
  ctaPaket,
  ctaLabel = "Be om offert",
  ctaText = "Hittade du inte det du letade efter? Skicka några rader så återkommer jag inom 24 timmar.",
}: {
  items?: FaqItem[];
  title?: string;
  searchable?: boolean;
  ctaPaket?: string;
  ctaLabel?: string;
  ctaText?: string;
}) => {
  const { open } = useContactModal();
  const [query, setQuery] = useState("");
  const [openItem, setOpenItem] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Härled tillgängliga kategorier från items (bevarar inmatningsordning)
  const availableCategories = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const f of items) {
      if (f.category && !seen.has(f.category)) {
        seen.add(f.category);
        list.push(f.category);
      }
    }
    return list;
  }, [items]);

  const showChips = searchable && availableCategories.length >= 2;

  // Filtrera först på kategori, sedan på sökord
  const filtered = useMemo(() => {
    if (!searchable) return items;
    let list = items;
    if (showChips && activeCategory) {
      list = list.filter((f) => f.category === activeCategory);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, query, searchable, activeCategory, showChips]);

  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Auto-öppna första träffen när användaren söker + scrolla in den mjukt
  useEffect(() => {
    if (!searchable) return;
    if (query.trim() && filtered.length > 0) {
      const nextValue = `item-${filtered[0].q}`;
      setOpenItem(nextValue);

      // Vänta på att accordion expanderar innan vi scrollar (två frames för layout)
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          const el = itemRefs.current.get(nextValue);
          if (!el) return;
          const isMobile = window.matchMedia("(max-width: 768px)").matches;
          // Offset för sticky navbar (~96px på mobil)
          const offset = isMobile ? 96 : 120;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    } else if (!query.trim()) {
      setOpenItem("");
    }
  }, [query, filtered, searchable]);

  // Debouncad tracking — loggar 800ms efter att användaren slutat skriva
  useEffect(() => {
    if (!searchable) return;
    const trimmed = query.trim();
    if (!trimmed) return;

    const timer = window.setTimeout(() => {
      trackFaqSearch({
        query: trimmed,
        resultCount: filtered.length,
        openedQuestion: filtered[0]?.q ?? null,
      });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [query, filtered, searchable]);

  // Logga när användaren manuellt öppnar en ANNAN fråga under aktiv sökning
  const handleAccordionChange = (value: string) => {
    setOpenItem(value);
    if (!searchable) return;
    const trimmed = query.trim();
    if (!value || !trimmed) return;

    const expectedAuto = filtered[0] ? `item-${filtered[0].q}` : "";
    if (value !== expectedAuto) {
      const opened = value.replace(/^item-/, "");
      trackFaqSearch({
        query: trimmed,
        resultCount: filtered.length,
        openedQuestion: opened,
      });
    }
  };

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

        {showChips && (
          <div className="mt-7 flex max-w-3xl flex-wrap gap-2" role="group" aria-label="Filtrera frågor efter kategori">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              aria-pressed={activeCategory === null}
              className={`rounded-full border px-4 py-1.5 text-sm transition-[background-color,border-color,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                activeCategory === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              Alla
              <span className="ml-1.5 text-xs opacity-70">({items.length})</span>
            </button>
            {availableCategories.map((cat) => {
              const count = items.filter((f) => f.category === cat).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  aria-pressed={isActive}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-[background-color,border-color,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat}
                  <span className="ml-1.5 text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {searchable && (
          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <MagnifyingGlass weight="bold" size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                  <X weight="bold" size={14} />
                </button>
              )}
            </div>
            {query && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {filtered.length === 0
                    ? "Inga träffar."
                    : `${filtered.length} träff${filtered.length === 1 ? "" : "ar"}`}
                  {" "}för "{query}"
                </p>
                {filtered.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const opened = filtered.find((f) => `item-${f.q}` === openItem) ?? filtered[0];
                      const noteParts = [
                        `Sökning: "${query.trim()}"`,
                        activeCategory ? `Kategori: ${activeCategory}` : null,
                        opened ? `Visad fråga: "${opened.q}"` : null,
                      ].filter(Boolean);
                      open({
                        paket: ctaPaket,
                        internalNote: `Lead från FAQ\n${noteParts.join("\n")}`,
                      });
                    }}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary transition-[background-color,border-color] duration-300 hover:border-primary hover:bg-primary/10"
                  >
                    Få personligt svar
                    <ArrowRight weight="bold" size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-10 max-w-3xl">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
              <Question weight="duotone" size={28} className="mx-auto text-muted-foreground/60" />
              <p className="mt-4 font-serif text-xl">Hittar du inte svaret?</p>
              <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
                {query.trim()
                  ? `Inga frågor matchade "${query.trim()}". Skicka frågan direkt till mig så svarar jag inom 24 timmar.`
                  : "Skicka frågan direkt till mig så svarar jag inom 24 timmar."}
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  onClick={() =>
                    open(query.trim() ? `Fråga om FAQ: ${query.trim()}` : undefined)
                  }
                  size="lg"
                  className="group"
                >
                  Ställ frågan direkt
                  <ArrowRight weight="bold" size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <a
                  href="mailto:info@auroramedia.se"
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Eller mejla info@auroramedia.se
                </a>
              </div>
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={openItem}
              onValueChange={handleAccordionChange}
              className="w-full"
            >
              <AnimatePresence initial={false}>
                {filtered.map((f, i) => (
                  <motion.div
                    key={f.q}
                    ref={(el) => {
                      const key = `item-${f.q}`;
                      if (el) itemRefs.current.set(key, el);
                      else itemRefs.current.delete(key);
                    }}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25, delay: searchable ? 0 : i * 0.03 }}
                    style={{ scrollMarginTop: "6rem" }}
                  >
                    <AccordionItem
                      value={`item-${f.q}`}
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

          {ctaPaket && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5 }}
              className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-primary/30 bg-primary/5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8"
            >
              <p className="text-base text-foreground/85 sm:max-w-md">{ctaText}</p>
              <Button
                onClick={() => open(ctaPaket)}
                className="group shrink-0"
                size="lg"
              >
                {ctaLabel}
                <ArrowRight weight="bold" size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
