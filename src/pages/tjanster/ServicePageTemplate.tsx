import { useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ChevronRight, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

export type ServiceTier = {
  name: string;
  price: string;
  time: string;
  desc?: string;
  features?: string[];
  featured?: boolean;
  paketValue?: string; // override props.paketName for this specific tier
};

export type RelatedService = {
  name: string;
  price: string;
  to: string;
};

export type ServicePageProps = {
  slug: string;
  label?: string;
  title: string;
  titleEm?: string;
  intro: string;
  paketName: string; // value passed to ContactModal select
  seoTitle: string;
  seoDescription: string;
  includes: string[];
  process: { label: string; title: string; body: string }[];
  tiers?: ServiceTier[];
  pricingNote?: ReactNode;
  whyAffordable: string;
  faqs: { q: string; a: string }[];
  related: RelatedService[];
  extra?: ReactNode; // e.g. comparison table for Hemsidor
  postFaq?: ReactNode; // optional block rendered directly after FAQ
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

const ServicePageTemplate = (props: ServicePageProps) => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: props.seoTitle,
      description: props.seoDescription,
      canonical: `/tjanster/${props.slug}`,
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: props.title, url: `/tjanster/${props.slug}` },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, [props.slug, props.seoTitle, props.seoDescription, props.title]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Breadcrumb */}
        <nav aria-label="Brödsmulor" className="container mx-auto px-6 pt-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground">
                Hem
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li>
              <Link to="/tjanster" className="hover:text-foreground">
                Tjänster
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li className="text-foreground">{props.title}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="pt-10 pb-16 md:pt-16 md:pb-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">{props.label ?? "Tilläggstjänst"}</p>
              <h1 className="mt-5 font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-[-0.02em]">
                {props.title}
                {props.titleEm && (
                  <>
                    {" "}
                    <em className="italic text-primary">{props.titleEm}</em>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
                {props.intro}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => open(props.paketName)}>
                  Boka ett samtal
                </Button>
                <Button size="lg" variant="outline" onClick={() => open(props.paketName)}>
                  Få offert
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link to="/tjanster">Andra tjänster</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What's included */}
        <section className="border-t border-border py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Vad som ingår</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Det här får du.
              </h2>
            </motion.div>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {props.includes.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="flex items-start gap-3 text-base text-foreground/85"
                >
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Process */}
        <section className="border-t border-border bg-secondary/30 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Process</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Så går det till.
              </h2>
            </motion.div>
            <div className="mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
              {props.process.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="md:border-l md:border-border md:pl-5"
                >
                  <p className="font-mono text-[11px] uppercase tracking-wider text-primary">
                    {s.label}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing tiers (optional) */}
        {props.tiers && props.tiers.length > 0 && (
          <section className="border-t border-border py-20 md:py-24">
            <div className="container mx-auto px-6">
              <motion.div {...fadeUp} className="max-w-2xl">
                <p className="label-caps">Priser</p>
                <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                  Välj nivå.
                </h2>
              </motion.div>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {props.tiers.map((t, i) => (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className={`relative flex flex-col rounded-xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      t.featured ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {t.featured && (
                      <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                        Populärast
                      </span>
                    )}
                    <p className="label-caps">{t.name}</p>
                    <p className="mt-3 font-serif text-3xl md:text-4xl">{t.price}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t.time}</p>
                    {t.desc && (
                      <p className="mt-4 text-sm leading-relaxed text-foreground/80">{t.desc}</p>
                    )}
                    {t.features && (
                      <ul className="mt-5 flex-1 space-y-2.5">
                        {t.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span className="text-muted-foreground">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button
                      onClick={() => open(t.paketValue ?? props.paketName)}
                      variant={t.featured ? "default" : "outline"}
                      className="mt-6 w-full"
                    >
                      Få offert
                    </Button>
                  </motion.div>
                ))}
              </div>
              {props.pricingNote && (
                <div className="mt-8 max-w-3xl text-sm text-muted-foreground">{props.pricingNote}</div>
              )}
            </div>
          </section>
        )}

        {/* Custom extra (e.g. comparison table) */}
        {props.extra}

        {/* Why affordable */}
        <section className="border-t border-border py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-3xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Varför prisvärt</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Därför kan jag hålla priset.
              </h2>
              <p className="mt-7 text-lg leading-relaxed text-foreground/85">{props.whyAffordable}</p>
            </motion.div>
          </div>
        </section>

        <FAQSection items={props.faqs} title="Vanliga frågor" searchable={props.faqs.length >= 5} />

        {/* Related */}
        <section className="border-t border-border bg-secondary/30 py-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Närliggande tjänster</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Andra tjänster jag levererar.
              </h2>
            </motion.div>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {props.related.map((r, i) => (
                <motion.div
                  key={r.to}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Link
                    to={r.to}
                    className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-md"
                  >
                    <p className="font-serif text-2xl">{r.name}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{r.price}</p>
                    <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Läs mer
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border py-28 md:py-36">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <motion.h2
              {...fadeUp}
              className="font-serif italic text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em]"
            >
              Klar för {props.title.toLowerCase()}?
            </motion.h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Skriv ett mejl. Jag svarar inom 24 timmar.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Button size="lg" onClick={() => open(props.paketName)} className="px-10">
                Få offert
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

export default ServicePageTemplate;
