import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlass, X, ArrowRight } from "@phosphor-icons/react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { trackFaqSearch, trackFaqCtaClick } from "@/lib/faqTracking";

export type FaqItem = {
  q: string;
  a: string;
  category?: string;
};

export const faqs: FaqItem[] = [
  {
    q: "Vad gör Aurora Media?",
    a: "Aurora Media bygger SaaS, MVP:er, interna appar, AI-automationer och moderna webbplattformar åt svenska företag. Fokus är fast pris, snabb leverans och kod kunden äger.",
    category: "Om Aurora",
  },
  {
    q: "Använder du AI för att bygga?",
    a: "Ja. Jag använder AI-verktyg som Lovable, Bolt, Cursor och Claude för att bygga snabbare. Men arkitektur, scope, säkerhet, QA och slutansvar ligger hos mig.",
    category: "Process",
  },
  {
    q: "Vad betyder kod du äger?",
    a: "Du får tillgång till GitHub-repo, teknisk grund och dokumentation. Du ska kunna fortsätta med Aurora Media, ta in en annan utvecklare eller bygga vidare internt.",
    category: "Ägande",
  },
  {
    q: "Vad kostar det?",
    a: "En prototyp börjar från 14 900 kr, en MVP från 34 900 kr och en mer skalbar SaaS från 89 000 kr. Exakt pris beror på scope, integrationer och komplexitet.",
    category: "Pris",
  },
  {
    q: "Vilken teknik använder du?",
    a: "Vanligtvis React, TypeScript, Supabase, PostgreSQL, Stripe, Brevo och modern hosting. Stacken väljs efter vad projektet faktiskt behöver.",
    category: "Teknik",
  },
  {
    q: "Vad händer efter leverans?",
    a: "Du får överlämning, dokumentation och möjlighet till fortsatt utveckling eller support. Målet är inte att låsa in dig, utan att ge dig en stabil grund att äga själv.",
    category: "Leverans",
  },
];

const FAQSection = ({
  items = faqs,
  title = "Vanliga frågor",
  searchable = false,
  ctaPaket,
  ctaLabel = "Få personligt svar",
  ctaText = "Hittade du inte det du letade efter? Skicka några rader så återkommer jag med ett konkret svar.",
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    return items.reduce<string[]>((acc, item) => {
      if (item.category && !seen.has(item.category)) {
        seen.add(item.category);
        acc.push(item.category);
      }
      return acc;
    }, []);
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (searchable && activeCategory) {
      list = list.filter((item) => item.category === activeCategory);
    }
    const q = query.trim().toLowerCase();
    if (searchable && q) {
      list = list.filter((item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q));
    }
    return list;
  }, [items, searchable, activeCategory, query]);

  const handleSearch = (value: string) => {
    setQuery(value);
    setOpenIndex(0);
    if (value.trim()) {
      window.setTimeout(() => {
        trackFaqSearch({
          query: value.trim(),
          resultCount: filtered.length,
          openedQuestion: filtered[0]?.q ?? null,
        });
      }, 0);
    }
  };

  const handleCta = () => {
    const opened = openIndex !== null ? filtered[openIndex] : null;
    trackFaqCtaClick({
      source: "faq_section",
      paket: ctaPaket,
      ctaLabel,
      query: query.trim() || null,
      category: activeCategory,
      openedQuestion: opened?.q ?? null,
    });
    open({
      paket: ctaPaket,
      internalNote: `Lead från FAQ${query.trim() ? `\nSökning: ${query.trim()}` : ""}${opened ? `\nFråga: ${opened.q}` : ""}`,
    });
  };

  return (
    <section className="relative border-t border-white/10 py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(59,130,246,0.12),transparent_30rem)]" />
      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl"
        >
          <p className="label-caps">Frågor & svar</p>
          <h2 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.6rem)] font-bold leading-[0.98] tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/58">
            {searchable ? `${items.length} frågor. Sök, filtrera eller öppna det som är relevant.` : "Svar på de vanligaste frågorna innan du bokar ett samtal."}
          </p>
        </motion.div>

        {searchable && (
          <div className="mt-8 max-w-3xl space-y-4">
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrera frågor efter kategori">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                    activeCategory === null
                      ? "border-blue-300/45 bg-blue-400/14 text-blue-50"
                      : "border-white/12 bg-white/[0.045] text-white/52 hover:border-white/25 hover:text-white"
                  }`}
                >
                  Alla
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                      activeCategory === cat
                        ? "border-blue-300/45 bg-blue-400/14 text-blue-50"
                        : "border-white/12 bg-white/[0.045] text-white/52 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <MagnifyingGlass weight="bold" size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/42" />
              <Input
                type="search"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Sök bland frågorna…"
                className="h-12 rounded-full border-white/14 bg-white/[0.055] pl-11 pr-11 text-base text-white placeholder:text-white/34 shadow-none backdrop-blur-xl focus-visible:ring-blue-300/35"
                aria-label="Sök i frågor och svar"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => handleSearch("")}
                  aria-label="Rensa sökning"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/42 transition hover:bg-white/10 hover:text-white"
                >
                  <X weight="bold" size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-9 grid max-w-4xl gap-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/12 bg-white/[0.045] p-6 text-sm text-white/60">
              Inga träffar. Testa ett annat sökord eller skicka frågan direkt.
            </div>
          ) : (
            filtered.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={`${item.q}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.12) }}
                  className={`overflow-hidden rounded-2xl border transition ${
                    isOpen
                      ? "border-blue-300/35 bg-blue-400/[0.075] shadow-[0_20px_70px_-42px_rgba(59,130,246,0.85)]"
                      : "border-white/12 bg-white/[0.04] hover:border-white/22 hover:bg-white/[0.06]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-lg font-bold leading-snug text-white sm:text-xl">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-white/58 transition-transform ${isOpen ? "rotate-180 text-blue-100" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/10 px-5 pb-5 pt-4 sm:px-6">
                      <p className="max-w-3xl text-sm leading-relaxed text-white/68 sm:text-base">{item.a}</p>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        <div className="mt-8 max-w-4xl rounded-[1.5rem] border border-white/12 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(168,85,247,0.12),rgba(236,72,153,0.08))] p-6 backdrop-blur-2xl sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="font-display text-xl font-bold text-white">Saknar du ett svar?</p>
            <p className="mt-2 text-sm leading-relaxed text-white/62">{ctaText}</p>
          </div>
          <Button onClick={handleCta} className="mt-5 shrink-0 rounded-full sm:mt-0">
            {ctaLabel}
            <ArrowRight weight="bold" size={15} className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
