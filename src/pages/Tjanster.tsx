import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  ShoppingBag,
  Search,
  MousePointerClick,
  Megaphone,
  PenTool,
  Palette,
  Camera,
  Code2,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import AuroraNavbar from "@/components/landing/AuroraNavbar";
import AuroraFooter from "@/components/landing/AuroraFooter";
import AuroraFinalCTA from "@/components/landing/AuroraFinalCTA";
import AuroraStickyMobileCTA from "@/components/landing/AuroraStickyMobileCTA";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

type Service = {
  icon: LucideIcon;
  name: string;
  price: string;
  desc: string;
  to: string;
  featured?: boolean;
};

const primary: Service = {
  icon: Code2,
  name: "SaaS & MVP",
  price: "Från 14 900 kr",
  desc: "Min huvudtjänst: SaaS-produkter och MVP:er byggda med AI-driven utveckling. Fast pris, leverans 1–4 veckor, kod du äger från dag ett.",
  to: "/priser",
  featured: true,
};

const services: Service[] = [
  { icon: Globe, name: "Hemsida", price: "Från 4 900 kr", desc: "Snabb, modern, fullt kodad. Inga mallar.", to: "/tjanster/hemsidor" },
  { icon: ShoppingBag, name: "E-handel", price: "Från 19 900 kr", desc: "Shopify eller egen Stripe-lösning. Lansering på 2 veckor.", to: "/tjanster/ehandel" },
  { icon: Smartphone, name: "Mobilapp", price: "Från 6 900 kr", desc: "PWA eller Capacitor – iOS + Android från samma kodbas.", to: "/tjanster/mobilapp" },
  { icon: Search, name: "SEO", price: "Från 2 490 kr", desc: "Teknisk SEO, on-page, lokal SEO för Linköping.", to: "/tjanster/seo" },
  { icon: MousePointerClick, name: "Google Ads", price: "3 900 kr setup", desc: "Sökannonser och Performance Max. Ingen bindning.", to: "/tjanster/google-ads" },
  { icon: Megaphone, name: "Meta Ads", price: "3 900 kr setup", desc: "Facebook + Instagram. Pixel + CAPI ingår.", to: "/tjanster/meta-ads" },
  { icon: PenTool, name: "Content", price: "Från 995 kr/artikel", desc: "SEO-optimerade artiklar. AI-skrivet, mänskligt redigerat.", to: "/tjanster/content" },
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

  const totalCount = useMemo(() => services.length + 1, []);

  return (
    <div className="aurora-theme min-h-screen">
      <AuroraNavbar />
      <main id="main" className="overflow-hidden">
        {/* Hero */}
        <section className="aurora-bg relative min-h-[70vh] pt-28 md:pt-36">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-16 md:px-8 lg:grid-cols-12 lg:items-end lg:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="lg:col-span-7"
            >
              <p className="au-eyebrow">TJÄNSTER · {totalCount} OMRÅDEN</p>
              <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.045em]">
                Allt jag levererar.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "hsl(var(--au-cream) / 0.72)" }}>
                Min huvudtjänst är att bygga SaaS med AI. Allt annat är tilläggstjänster jag tar med samma fast-pris-approach – samma snabbhet, samma transparens.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button onClick={() => open()} className="au-btn-coral">
                  Starta ett projekt
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
                <a href="#tjanster-grid" className="au-btn-ghost">
                  Se alla tjänster
                  <ArrowUpRight size={16} strokeWidth={2.2} />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
              className="grid gap-4 sm:grid-cols-3 lg:col-span-5"
            >
              {[
                { value: totalCount, label: "tjänster" },
                { value: "1–4v", label: "leverans" },
                { value: "0%", label: "bindning" },
              ].map((stat) => (
                <div key={stat.label} className="au-card-static p-5">
                  <p className="font-display text-4xl leading-none" style={{ color: "hsl(152 80% 60%)" }}>
                    {stat.value}
                  </p>
                  <p className="mt-2 font-mono-au text-[10px] uppercase tracking-[0.18em]" style={{ color: "hsl(var(--au-cream) / 0.55)" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services grid */}
        <section
          id="tjanster-grid"
          className="aurora-section-bg relative border-t py-20 md:py-28"
          style={{ borderColor: "hsl(var(--au-cream) / 0.08)" }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <p className="au-eyebrow">UTBUD</p>
                <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.035em]">
                  Primär tjänst — och hela paletten.
                </h2>
              </div>
              <div className="lg:col-span-7 lg:pt-2">
                <p className="text-base leading-relaxed md:text-lg" style={{ color: "hsl(var(--au-cream) / 0.7)" }}>
                  SaaS-utveckling är kärnan. Resten finns för att du ska kunna lansera, marknadsföra och växa utan att behöva fem leverantörer.
                </p>
              </div>
            </div>

            {/* Flagship + grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="mt-12 grid gap-4 lg:grid-cols-2"
            >
              <ServiceCard service={primary} large />
              <div className="grid gap-4 sm:grid-cols-2">
                {services.slice(0, 4).map((s) => (
                  <ServiceCard key={s.name} service={s} />
                ))}
              </div>
            </motion.div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(4).map((s, i) => (
                <ServiceCard key={s.name} service={s} index={i} />
              ))}
            </div>
          </div>
        </section>

        <AuroraFinalCTA />
      </main>
      <AuroraFooter />
      <AuroraStickyMobileCTA />
    </div>
  );
};

const ServiceCard = ({
  service,
  large = false,
  index = 0,
}: {
  service: Service;
  large?: boolean;
  index?: number;
}) => {
  const Icon = service.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.18), ease: [0.32, 0.72, 0, 1] }}
    >
      <Link
        to={service.to}
        aria-label={`Läs mer om ${service.name}`}
        className={`group au-card relative flex h-full flex-col overflow-hidden ${large ? "min-h-[430px] p-8 md:p-10" : "min-h-[260px] p-6"}`}
        style={
          service.featured
            ? {
                background: "linear-gradient(180deg, hsl(152 50% 10% / 0.55), hsl(156 14% 11%))",
                boxShadow: "0 0 0 1px hsl(152 80% 38% / 0.25), 0 30px 80px -30px hsl(152 80% 30% / 0.55)",
                borderColor: "hsl(152 80% 38% / 0.35)",
              }
            : undefined
        }
      >
        {service.featured && <span className="au-eyebrow mb-4 inline-block">PRIMÄR TJÄNST</span>}

        <div className="flex items-start justify-between gap-4">
          <span className="au-icon">
            <Icon size={20} strokeWidth={2} />
          </span>
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-300 group-hover:rotate-[20deg]"
            style={{
              background: "hsl(var(--au-cream) / 0.06)",
              border: "1px solid hsl(var(--au-cream) / 0.1)",
              color: "hsl(var(--au-cream) / 0.85)",
            }}
          >
            <ArrowUpRight size={15} strokeWidth={2.2} />
          </span>
        </div>

        <h3 className={`mt-5 font-display tracking-[-0.025em] ${large ? "text-3xl md:text-5xl" : "text-2xl"}`}>
          {service.name}
        </h3>
        <p
          className={`${large ? "mt-3 text-base md:text-lg" : "mt-2 text-sm"} font-mono-au`}
          style={{ color: "hsl(152 80% 65%)" }}
        >
          {service.price}
        </p>

        <p
          className={`${large ? "mt-4 text-base md:text-lg" : "mt-3 text-sm"} leading-relaxed`}
          style={{ color: "hsl(var(--au-cream) / 0.65)" }}
        >
          {service.desc}
        </p>

        <div
          className="mt-auto flex items-center gap-2 pt-6 font-mono-au text-[11px] uppercase tracking-[0.16em]"
          style={{ color: "hsl(var(--au-cream) / 0.55)" }}
        >
          Läs mer
          <ArrowUpRight size={12} strokeWidth={2.2} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
};

export default Tjanster;
