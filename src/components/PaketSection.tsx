import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";

export const paket = [
  {
    id: "Prototyp",
    name: "Prototyp",
    price: "14 900 kr",
    time: "3–5 dagar",
    desc: "Klickbar MVP. Visa investerare. Testa idé.",
    features: [
      "Responsiv design",
      "Riktig data (inte mockup)",
      "Deployment på din domän",
      "1 veckas support",
    ],
    cta: "Starta prototyp",
    featured: false,
  },
  {
    id: "MVP",
    name: "MVP",
    price: "34 900 kr",
    time: "2 veckor",
    desc: "Lanseringsklar. Ta betalt från dag ett.",
    features: [
      "Allt i Prototyp",
      "Användarlogin",
      "Stripe-betalningar",
      "Admin-dashboard",
      "2 veckors support",
    ],
    cta: "Starta MVP",
    featured: true,
  },
  {
    id: "SaaS",
    name: "Skalbar SaaS",
    price: "69 000 kr",
    time: "4 veckor",
    desc: "Full produkt för skala.",
    features: [
      "Allt i MVP",
      "Avancerad analys",
      "Integrationer (Fortnox, HubSpot m.fl.)",
      "Full SEO",
      "1 månads support",
    ],
    cta: "Starta SaaS",
    featured: false,
  },
  {
    id: "Skraddarsytt",
    name: "Skräddarsytt",
    price: "Från 89 000 kr",
    time: "4–8 veckor",
    desc: "Komplexa projekt.",
    features: [
      "Custom integrationer",
      "Multi-tenant",
      "Säkerhetskrav",
      "Stora datamängder",
    ],
    cta: "Boka samtal",
    featured: false,
  },
];

const PaketSection = () => {
  const { open } = useContactModal();

  return (
    <section id="paket" className="border-t border-border py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="label-caps">Priser</p>
          <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em]">
            Så här mycket kostar det.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Fast pris. Ingen byråkrati. Ingen "kontakta oss för offert".
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {paket.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative flex flex-col rounded-xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                p.featured ? "border-primary shadow-md" : "border-border hover:border-primary/50"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                  Populärast
                </span>
              )}
              <p className="label-caps">{p.name}</p>
              <p className="mt-3 font-serif text-3xl md:text-4xl">{p.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.time}</p>
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">{p.desc}</p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => open(p.id)}
                variant={p.featured ? "default" : "outline"}
                className="mt-6 w-full"
              >
                {p.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Löpande underhåll efter leverans:{" "}
            <span className="text-foreground">1 990 kr/mån</span>
          </p>
          <Link to="/priser" className="font-medium text-primary underline-offset-4 hover:underline">
            Se fullständiga priser →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PaketSection;
