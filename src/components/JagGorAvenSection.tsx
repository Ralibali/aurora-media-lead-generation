import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";

const services = [
  { icon: Globe, name: "Hemsida", price: "Från 4 900 kr", desc: "Enkel, snabb och modern. Allt från en sida till fem.", to: "/tjanster/hemsidor" },
  { icon: ShoppingBag, name: "E-handel", price: "Från 19 900 kr", desc: "Shopify eller egen lösning. Lansering på två veckor.", to: "/tjanster/ehandel" },
  { icon: Search, name: "SEO", price: "Från 4 900 kr", desc: "Teknisk SEO, on-page och lokal SEO för Linköping.", to: "/tjanster/seo" },
  { icon: MousePointerClick, name: "Google Ads", price: "3 900 kr setup", desc: "Sökannonser som faktiskt konverterar.", to: "/tjanster/google-ads" },
  { icon: Megaphone, name: "Meta Ads", price: "3 900 kr setup", desc: "Facebook och Instagram. Pixelinstallation ingår.", to: "/tjanster/meta-ads" },
  { icon: PenTool, name: "Content", price: "1 490 kr/artikel", desc: "SEO-optimerade artiklar skrivna med AI och redigerade av mig.", to: "/tjanster/content" },
  { icon: Palette, name: "Grafisk profil", price: "Från 5 900 kr", desc: "Logo, färger, typografi och mallar du faktiskt vågar använda.", to: "/tjanster/grafisk-profil" },
  { icon: Camera, name: "Fotografering", price: "4 900 kr/halvdag", desc: "Produkt-, miljö- och porträttfoto i Linköping.", to: "/tjanster/fotografering" },
];

const JagGorAvenSection = () => {
  return (
    <section className="border-t border-border bg-secondary/30 py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="label-caps">Mer än bara kod</p>
          <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em]">
            Jag hjälper även till med detta.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Samma modell med fasta priser gäller här. Fråga mig om en offert.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
  );
};

export default JagGorAvenSection;
