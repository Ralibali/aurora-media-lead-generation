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
  Sparkles,
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
  icon: Sparkles,
  name: "AI-builder & SaaS/MVP",
  price: "Prototyp från 14 900 kr · MVP från 34 900 kr",
  desc: "Auroras kärna: SaaS, interna appar och AI-automationer byggda snabbt, med fast pris och kod du äger. Mindre workshop. Mer fungerande produkt.",
  to: "/ai-konsult-sverige",
  featured: true,
};

const services: Service[] = [
  { icon: Code2, name: "SaaS & interna system", price: "Från 34 900 kr", desc: "Dashboard, login, databas, Stripe, admin och integrationer. Byggt för riktig användning, inte bara demo.", to: "/priser" },
  { icon: Globe, name: "Hemsidor & plattformar", price: "Offert efter scope", desc: "Moderna React-sajter, landningssidor och SEO-hubbar som matchar nya Aurora-standarden.", to: "/tjanster/hemsidor" },
  { icon: ShoppingBag, name: "E-handel", price: "Offert efter butik", desc: "Shopify, Stripe eller skräddarsytt flöde med betalning, orderlogik och spårning från start.", to: "/tjanster/ehandel" },
  { icon: Smartphone, name: "Mobilappar", price: "PWA eller app efter behov", desc: "Installerbara webbappar eller app-liknande lösningar med samma kodbas som produkten.", to: "/tjanster/mobilapp" },
  { icon: Search, name: "SEO", price: "Engångsinsats eller löpande", desc: "Teknisk SEO, sitemap, prerendering, AI-discovery, content och interna länkar som faktiskt hjälper ranking.", to: "/tjanster/seo" },
  { icon: MousePointerClick, name: "Google Ads", price: "Setup efter konto", desc: "Kampanjstruktur, landningssidor och konverteringsspårning så trafiken har någonstans att ta vägen.", to: "/tjanster/google-ads" },
  { icon: Megaphone, name: "Meta Ads", price: "Setup efter mål", desc: "Facebook och Instagram med Pixel/CAPI, kreativa vinklar och tydliga funnels.", to: "/tjanster/meta-ads" },
  { icon: PenTool, name: "Content & AI-sök", price: "Artikelplan eller paket", desc: "SEO-artiklar, jämförelser, llms.txt, AI-vänliga landningssidor och content som stärker expertis.", to: "/blogg" },
  { icon: Palette, name: "Grafisk profil", price: "Offert efter nivå", desc: "Visuell riktning, färger, typografi och komponentkänsla som håller ihop sajten.", to: "/tjanster/grafisk-profil" },
  { icon: Camera, name: "Foto & visuellt material", price: "Offert efter upplägg", desc: "Produkt-, miljö- och porträttfoto när du behöver eget material istället för stock-känsla.", to: "/tjanster/fotografering" },
];

const Tjanster = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "Tjänster – AI-builder, SaaS, MVP, webb och SEO | Aurora Media",
      description:
        "Aurora Media bygger SaaS, MVP:er, interna appar, AI-automationer, hemsidor, SEO och digitala system med fast pris, snabb leverans och kod du äger.",
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
        <section className="aurora-bg relative min-h-[70vh] pt-28 md:pt-36">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-16 md:px-8 lg:grid-cols-12 lg:items-end lg:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="lg:col-span-7"
            >
              <p className="au-eyebrow">TJÄNSTER · AI-BUILDER · {totalCount} OMRÅDEN</p>
              <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.045em]">
                Från AI-snack till produkt.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "hsl(var(--au-cream) / 0.72)" }}>
                Aurora Media bygger det andra bara workshoppar om: SaaS, MVP:er, interna appar, AI-automationer och webbar som går att använda. Fast pris, snabb leverans och kod du äger.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button onClick={() => open()} className="au-btn-coral">
                  Boka AI-genomgång
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
                <Link to="/ai-konsult-sverige" className="au-btn-ghost">
                  AI-konsult vs AI-builder
                  <ArrowUpRight size={16} strokeWidth={2.2} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
              className="grid gap-4 sm:grid-cols-3 lg:col-span-5"
            >
              {[
                { value: "14 900", label: "prototyp från" },
                { value: "34 900", label: "MVP från" },
                { value: "100%", label: "kodägande" },
              ].map((stat) => (
                <div key={stat.label} className="au-card-static p-5">
                  <p className="font-display text-4xl leading-none" style={{ color: "hsl(217 91% 70%)" }}>
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
                  Kärnan är AI-byggda produkter. Resten finns för lansering.
                </h2>
              </div>
              <div className="lg:col-span-7 lg:pt-2">
                <p className="text-base leading-relaxed md:text-lg" style={{ color: "hsl(var(--au-cream) / 0.7)" }}>
                  Du ska inte behöva fem leverantörer för produkt, webb, SEO, annonsering och content. Aurora håller ihop strategi, bygg, lansering och tillväxt i samma tekniska grund.
                </p>
              </div>
            </div>

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
                background: "linear-gradient(180deg, hsl(217 70% 12% / 0.72), hsl(260 38% 12% / 0.58))",
                boxShadow: "0 0 0 1px hsl(217 91% 64% / 0.28), 0 30px 80px -30px hsl(217 91% 46% / 0.65)",
                borderColor: "hsl(217 91% 64% / 0.38)",
              }
            : undefined
        }
      >
        {service.featured && <span className="au-eyebrow mb-4 inline-block">PRIMÄR POSITION</span>}

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
        <p className={`${large ? "mt-3 text-base md:text-lg" : "mt-2 text-sm"} font-mono-au`} style={{ color: "hsl(217 91% 74%)" }}>
          {service.price}
        </p>

        <p className={`${large ? "mt-4 text-base md:text-lg" : "mt-3 text-sm"} leading-relaxed`} style={{ color: "hsl(var(--au-cream) / 0.65)" }}>
          {service.desc}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-6 font-mono-au text-[11px] uppercase tracking-[0.16em]" style={{ color: "hsl(var(--au-cream) / 0.55)" }}>
          Läs mer
          <ArrowUpRight size={12} strokeWidth={2.2} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
};

export default Tjanster;
