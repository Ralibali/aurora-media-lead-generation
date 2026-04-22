import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import FinalCTASection from "@/components/FinalCTASection";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";
import { cn } from "@/lib/utils";

type Category = "SaaS" | "Marknadsplats" | "Konsument" | "Bokning";

type Case = {
  name: string;
  domain: string;
  category: Category;
  label: string;
  desc: string;
  stack: string;
  result: string;
};

const cases: Case[] = [
  {
    name: "Aurora Transport",
    domain: "auroratransport.se",
    category: "SaaS",
    label: "Featured · Transport · B2B",
    desc: "Dispatching-SaaS för svenska transportbolag. CJ Bemanning var första kunden.",
    stack: "3 veckor · Lovable · Supabase · Stripe · Fortnox",
    result: "Lanserad 3 veckor. Betalande kund från dag 1.",
  },
  {
    name: "Updro",
    domain: "updro.se",
    category: "Marknadsplats",
    label: "Marknadsplats · B2B",
    desc: "Marknadsplats för digitala tjänster. Jämförbara offerter från relevanta byråer.",
    stack: "3 veckor · Lovable · Supabase · Stripe Connect",
    result: "Live 2026. Byråer onboardas löpande.",
  },
  {
    name: "AgilityManager",
    domain: "agilitymanager.se",
    category: "Konsument",
    label: "Konsument · Sport",
    desc: "Träningsapp för agility-förare med tävlingsresultat och statistik.",
    stack: "2,5 veckor · Lovable · Supabase · Firecrawl",
    result: "Live med betalande användare.",
  },
  {
    name: "Hönsgården",
    domain: "honsgarden.se",
    category: "Konsument",
    label: "Konsument · Hobby",
    desc: "Värphönsapp för svenska hönsägare. Vaccinationsschema och flockhantering.",
    stack: "10 dagar · Lovable · Supabase · RevenueCat",
    result: "67 % premium-konvertering bland aktiva.",
  },
  {
    name: "Odlingsdagboken",
    domain: "odlingsdagboken.com",
    category: "Konsument",
    label: "Konsument · AI-coach",
    desc: "Svensk odlings-SaaS med AI-coach byggd på Claude. Råd per zon och gröda.",
    stack: "2 veckor · Lovable · Supabase · Claude API",
    result: "Premium 99 kr/år. Live.",
  },
  {
    name: "GoGlamping Sweden",
    domain: "goglampingsweden.se",
    category: "Bokning",
    label: "Bokning · Turism",
    desc: "Bokningssajt för glamping vid Göta kanal. SEO + Sirvoy-integration.",
    stack: "9 dagar · React · Vite · Sirvoy",
    result: "Live. Öppnar maj 2026.",
  },
  {
    name: "Viriditas",
    domain: "viriditasmassage.se",
    category: "Bokning",
    label: "Bokning · Hälsa",
    desc: "Bokningssajt för massagemottagning med direkttidsbokning.",
    stack: "1 vecka · React · Vite",
    result: "Live, betalande kund.",
  },
];

const filters: ("Alla" | Category)[] = ["Alla", "SaaS", "Marknadsplats", "Konsument", "Bokning"];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

const Arbete = () => {
  const [active, setActive] = useState<(typeof filters)[number]>("Alla");

  useEffect(() => {
    setSEOMeta({
      title: "Arbete – 7 SaaS-produkter live | Aurora Media Linköping",
      description:
        "Sju egna SaaS-produkter i drift: Aurora Transport, Updro, AgilityManager, Hönsgården, Odlingsdagboken, GoGlamping, Viriditas. Bevis på AI-byggd SaaS som levererar.",
      canonical: "/arbete",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Arbete", url: "/arbete" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  const filtered = useMemo(
    () => (active === "Alla" ? cases : cases.filter((c) => c.category === active)),
    [active],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="pt-16 pb-10 md:pt-24 md:pb-14">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Arbete</p>
              <h1 className="mt-4 font-serif text-[clamp(2.75rem,7vw,6rem)] leading-[1.05] tracking-[-0.02em]">
                Sju SaaS. <em className="italic text-primary">Alla live.</em>
              </h1>
              <p className="mt-7 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Det här är produkter jag har byggt och driver själv. Inga case-studies från en byrå
                jag jobbade på 2018 – det här är mitt arbete, just nu.
              </p>
            </motion.div>

            {/* Filters */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-10 flex flex-wrap gap-2"
              role="tablist"
              aria-label="Filtrera arbete"
            >
              {filters.map((f) => {
                const isActive = f === active;
                return (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(f)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-transparent text-muted-foreground hover:border-primary hover:text-foreground",
                    )}
                  >
                    {f}
                  </button>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Grid */}
        <section className="pb-24 md:pb-32">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid gap-6 md:grid-cols-2">
              {filtered.map((c, i) => (
                <motion.a
                  key={c.domain}
                  href={`https://${c.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg md:p-9"
                >
                  <p className="font-mono text-[11px] uppercase tracking-wider text-primary">
                    {c.label}
                  </p>
                  <h2 className="mt-4 font-serif text-3xl md:text-4xl">{c.name}</h2>
                  <p className="mt-3 text-base leading-relaxed text-foreground/80 md:text-lg">
                    {c.desc}
                  </p>
                  <div className="mt-7 space-y-2 border-t border-border pt-5 text-sm">
                    <p className="font-mono text-xs text-muted-foreground">{c.stack}</p>
                    <p className="text-foreground/75">{c.result}</p>
                  </div>
                  <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Besök {c.domain}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        <FinalCTASection />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default Arbete;
