import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  ShoppingBag,
  Search,
  MousePointerClick,
  Megaphone,
  PenTool,
  Palette,
  Camera,
  ArrowUpRight,
  Code2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import Reveal from "@/components/Reveal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const primary = {
  icon: Code2,
  name: "SaaS & MVP",
  price: "Från 14 900 kr",
  desc: "Min huvudtjänst: bygger SaaS-produkter och MVP:er med AI-kodning. Fast pris, leverans 1–4 veckor.",
  to: "/priser",
};

const services = [
  { icon: Globe, name: "Hemsida", price: "Från 4 900 kr", desc: "Snabb, modern, fullt kodad. Inga mallar.", to: "/tjanster/hemsidor" },
  { icon: ShoppingBag, name: "E-handel", price: "Från 19 900 kr", desc: "Shopify eller egen Stripe-lösning. Lansering på 2 veckor.", to: "/tjanster/ehandel" },
  { icon: Search, name: "SEO", price: "Från 2 490 kr", desc: "Teknisk SEO, on-page, lokal SEO för Linköping.", to: "/tjanster/seo" },
  { icon: MousePointerClick, name: "Google Ads", price: "3 900 kr setup", desc: "Sökannonser och Performance Max. Ingen bindning.", to: "/tjanster/google-ads" },
  { icon: Megaphone, name: "Meta Ads", price: "3 900 kr setup", desc: "Facebook + Instagram. Pixel + CAPI ingår.", to: "/tjanster/meta-ads" },
  { icon: PenTool, name: "Content", price: "1 490 kr/artikel", desc: "SEO-optimerade artiklar. AI-skrivet, redigerat manuellt.", to: "/tjanster/content" },
  { icon: Palette, name: "Grafisk profil", price: "Från 5 900 kr", desc: "Logo, färger, typografi, mallar.", to: "/tjanster/grafisk-profil" },
  { icon: Camera, name: "Fotografering", price: "4 900 kr/halvdag", desc: "Produkt-, miljö- och porträttfoto i Linköping.", to: "/tjanster/fotografering" },
];

const Tjanster = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "Tjänster – SaaS, hemsidor, SEO, ads, content | Aurora Media",
      description:
        "Alla tjänster jag levererar: SaaS-utveckling, hemsidor, e-handel, SEO, Google Ads, Meta Ads, content, grafisk profil och fotografering. Fast pris, snabb leverans.",
      canonical: "/tjanster",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Tjänster</p>
              <h1 className="mt-4 font-serif text-[clamp(2.75rem,7vw,6rem)] leading-[1.05] tracking-[-0.02em]">
                Allt jag levererar.
              </h1>
              <p className="mt-7 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Min huvudtjänst är att bygga SaaS med AI. Allt annat är tilläggstjänster jag tar
                med samma fast-pris-approach.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Primary */}
        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Primär tjänst</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="mt-5"
            >
              <Link
                to={primary.to}
                className="group flex flex-col gap-6 rounded-xl border-2 border-primary bg-card p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:flex-row md:items-center md:gap-10 md:p-10"
              >
                <primary.icon className="h-12 w-12 text-primary" strokeWidth={1.25} />
                <div className="flex-1">
                  <h2 className="font-serif text-3xl md:text-4xl">{primary.name}</h2>
                  <p className="mt-2 font-mono text-sm text-primary">{primary.price}</p>
                  <p className="mt-4 text-base leading-relaxed text-foreground/80 md:text-lg">{primary.desc}</p>
                </div>
                <span className="inline-flex items-center gap-1 self-start font-medium text-primary md:self-center">
                  Se priser
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Secondary services */}
        <section className="border-t border-border bg-secondary/30 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Tilläggstjänster</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Resten av paletten.
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                Samma fast-pris-approach, samma snabbhet, samma transparens.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link
                      to={s.to}
                      className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-md"
                    >
                      <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      <h3 className="mt-5 font-serif text-2xl">{s.name}</h3>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{s.price}</p>
                      <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/75">{s.desc}</p>
                      <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Läs mer
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border py-28 md:py-36">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <motion.h2
              {...fadeUp}
              className="font-serif italic text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em]"
            >
              Vet du inte var du ska börja?
            </motion.h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Berätta vad du vill uppnå. Jag säger vilken tjänst som passar – eller om jag inte
              är rätt person.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Button size="lg" onClick={() => open()} className="px-10">
                Starta projekt
              </Button>
              <a
                href="mailto:info@auroramedia.se"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Eller direkt: info@auroramedia.se
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default Tjanster;
