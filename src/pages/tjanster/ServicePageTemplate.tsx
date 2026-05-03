import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
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
  paketValue?: string;
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
  paketName: string;
  seoTitle: string;
  seoDescription: string;
  includes: string[];
  process: { label: string; title: string; body: string }[];
  tiers?: ServiceTier[];
  pricingNote?: ReactNode;
  whyAffordable: string;
  faqs: { q: string; a: string; category?: string }[];
  related: RelatedService[];
  extra?: ReactNode;
  postFaq?: ReactNode;
};

const CTA_COPY: Record<string, { label: string; text: string }> = {
  seo: {
    label: "Få SEO-genomgång",
    text: "Skicka URL:en så tittar jag på struktur, indexering och vad som mest sannolikt bromsar synligheten.",
  },
  ehandel: {
    label: "Få e-handelsplan",
    text: "Berätta kort om sortiment, betalflöde och nuläge så tar vi fram rätt nivå: Shopify, Stripe eller skräddarsytt.",
  },
  hemsidor: {
    label: "Få webbplan",
    text: "Skriv vad sajten ska göra: sälja, ranka, förklara eller bli en plattform. Jag svarar med konkret nästa steg.",
  },
  "google-ads": {
    label: "Få annonsplan",
    text: "Skicka mål, budget och nuvarande konto så får du en konkret struktur istället för gissningar.",
  },
  "meta-ads": {
    label: "Få annonsplan",
    text: "Berätta målgrupp och erbjudande så skissar jag kampanjvinkel och funnel.",
  },
  content: {
    label: "Få contentplan",
    text: "Skicka ämne eller nyckelord så föreslår jag artikelstruktur och SEO-vinkel.",
  },
  "grafisk-profil": {
    label: "Boka varumärkessparring",
    text: "Vi går igenom hur uttrycket ska kännas och vad som behövs för att hålla ihop helheten.",
  },
  fotografering: {
    label: "Planera foto",
    text: "Berätta vad som ska fotograferas, var och varför så får du ett rimligt upplägg.",
  },
  mobilapp: {
    label: "Boka appsparring",
    text: "Vi tar reda på om du faktiskt behöver app, PWA eller bara bättre mobil webb.",
  },
};

const getCtaCopy = (slug: string, fallbackTitle: string) =>
  CTA_COPY[slug] ?? {
    label: "Boka genomgång",
    text: `Har du frågor om ${fallbackTitle.toLowerCase()}? Skicka några rader så får du ett konkret svar.`,
  };

const ServicePageTemplate = (props: ServicePageProps) => {
  const { open } = useContactModal();
  const cta = getCtaCopy(props.slug, props.title);

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
      <main className="overflow-hidden">
        <section className="relative px-6 pb-16 pt-28 sm:px-10 md:pt-36 lg:px-[70px]">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_16%,rgba(59,130,246,0.22),transparent_34rem),radial-gradient(circle_at_12%_50%,rgba(168,85,247,0.14),transparent_30rem)]" />
          <div className="mx-auto max-w-7xl">
            <nav aria-label="Brödsmulor" className="mb-10">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/45">
                <li><Link to="/" className="hover:text-white">Hem</Link></li>
                <ChevronRight className="h-3 w-3" />
                <li><Link to="/tjanster" className="hover:text-white">Tjänster</Link></li>
                <ChevronRight className="h-3 w-3" />
                <li className="text-white/70">{props.label ?? props.title}</li>
              </ol>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <p className="label-caps mb-5">{props.label ?? "Tjänst"}</p>
                <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.92] tracking-tight text-white">
                  {props.title}
                  {props.titleEm && <span className="block text-blue-100/92">{props.titleEm}</span>}
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/66 md:text-xl">
                  {props.intro}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" onClick={() => open(props.paketName)} className="rounded-full">
                    Boka genomgång <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-full">
                    <Link to="/priser">Se priser</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/12 bg-white/[0.055] p-6 backdrop-blur-2xl">
                <p className="label-caps mb-5">Snabb överblick</p>
                <div className="grid gap-3">
                  {props.includes.slice(0, 5).map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />
                      <span className="text-sm leading-relaxed text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 px-6 py-16 sm:px-10 md:py-24 lg:px-[70px]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="label-caps mb-3">Vad som ingår</p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">Det här får du.</h2>
            </div>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {props.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-[1.35rem] border border-white/12 bg-white/[0.045] p-5 text-sm leading-relaxed text-white/68 backdrop-blur-xl">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-white/10 bg-white/[0.018] px-6 py-16 sm:px-10 md:py-24 lg:px-[70px]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="label-caps mb-3">Process</p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">Så går det till.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {props.process.map((step, index) => (
                <div key={step.title} className="rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-6 backdrop-blur-xl">
                  <p className="text-sm font-bold text-blue-200">0{index + 1}</p>
                  <h3 className="mt-4 font-display text-2xl font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {props.tiers && props.tiers.length > 0 && (
          <section className="border-t border-white/10 px-6 py-16 sm:px-10 md:py-24 lg:px-[70px]">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 max-w-3xl">
                <p className="label-caps mb-3">Nivåer</p>
                <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">Välj rätt nivå.</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {props.tiers.map((tier) => (
                  <div key={tier.name} className={`relative flex flex-col rounded-[1.7rem] border p-7 backdrop-blur-2xl ${tier.featured ? "border-blue-300/40 bg-blue-400/10 shadow-[0_34px_100px_-52px_rgba(59,130,246,0.9)]" : "border-white/12 bg-white/[0.055]"}`}>
                    {tier.featured && <span className="absolute -top-3 left-6 rounded-full border border-blue-300/30 bg-blue-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-50">Rekommenderad</span>}
                    <p className="label-caps">{tier.name}</p>
                    <p className="mt-4 text-3xl font-bold text-white">{tier.price}</p>
                    <p className="mt-1 text-sm text-white/45">{tier.time}</p>
                    {tier.desc && <p className="mt-4 text-sm leading-relaxed text-white/66">{tier.desc}</p>}
                    {tier.features && (
                      <ul className="mt-6 flex-1 space-y-2.5">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-white/64">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button onClick={() => open(tier.paketValue ?? props.paketName)} variant={tier.featured ? "default" : "outline"} className="mt-7 w-full rounded-full">
                      Få offert
                    </Button>
                  </div>
                ))}
              </div>
              {props.pricingNote && <div className="mt-8 max-w-3xl text-sm leading-relaxed text-white/52">{props.pricingNote}</div>}
            </div>
          </section>
        )}

        {props.extra}

        <section className="border-t border-white/10 px-6 py-16 sm:px-10 md:py-24 lg:px-[70px]">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="label-caps mb-3">Varför Aurora</p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">Snabbare utan att bli slarvigt.</h2>
            </div>
            <p className="text-lg leading-relaxed text-white/68">{props.whyAffordable}</p>
          </div>
        </section>

        <FAQSection items={props.faqs} title={`Vanliga frågor om ${props.title.toLowerCase()}`} searchable ctaPaket={props.paketName} ctaLabel={cta.label} ctaText={cta.text} />
        {props.postFaq}

        {props.related.length > 0 && (
          <section className="border-t border-white/10 px-6 py-16 sm:px-10 md:py-24 lg:px-[70px]">
            <div className="mx-auto max-w-7xl">
              <p className="label-caps mb-3">Relaterat</p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">Bygg vidare.</h2>
              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {props.related.map((service) => (
                  <Link key={service.to} to={service.to} className="group rounded-[1.4rem] border border-white/12 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:border-blue-300/35 hover:bg-white/[0.07]">
                    <p className="font-display text-xl font-bold text-white">{service.name}</p>
                    <p className="mt-2 text-sm text-white/52">{service.price}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-100/80">Läs mer <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default ServicePageTemplate;
