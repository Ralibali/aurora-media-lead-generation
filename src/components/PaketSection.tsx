import { PACKAGES } from "@/data/offers";
import { Check, ArrowUpRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";

export const paket = PACKAGES.map((offer) => ({
  id: offer.modalValue, number: offer.num, name: offer.name,
  price: offer.price, priceFrom: "Från", priceAmount: new Intl.NumberFormat("sv-SE").format(offer.priceFrom),
  priceCurrency: "kr", time: offer.time, desc: offer.desc, features: offer.features,
  cta: "Få en avgränsad offert", featured: offer.featured ?? false,
}));

const PaketSection = () => {
  const { open } = useContactModal();

  return (
    <section id="paket" className="border-t border-border py-24 md:py-36">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          className="max-w-2xl"
        >
          <p className="label-caps">Paket & upplägg</p>
          <h2 className="mt-3 font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] tracking-[-0.025em]">
            Snabb leverans.
            <br />
            <span className="italic text-primary">Rimlig offert.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Samma paket och startpriser som på prissidan. Exakt omfattning, leverans och pris bestäms i offerten. Tidsangivelserna är planeringsintervall.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {paket.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] }}
              className="relative"
            >
              {p.featured && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl opacity-70 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(60% 50% at 50% 50%, hsl(var(--forest-glow) / 0.45) 0%, transparent 70%)",
                  }}
                />
              )}

              {p.featured && (
                <div
                  className="absolute -right-2 top-4 z-10 rotate-[3deg] rounded-sm bg-primary px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-primary-foreground shadow-lg"
                  aria-hidden
                >
                  För en första lansering
                </div>
              )}

              <div className="bezel-shell h-full">
                <div
                  className={`bezel-core flex h-full flex-col p-7 ${
                    p.featured ? "text-white" : "bg-card"
                  }`}
                  style={
                    p.featured
                      ? { backgroundColor: "hsl(154 43% 14%)" }
                      : undefined
                  }
                >
                  <div className="flex items-baseline justify-between">
                    <p
                      className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
                        p.featured ? "text-white/55" : "text-muted-foreground"
                      }`}
                    >
                      Paket {p.number}
                    </p>
                  </div>

                  <h3
                    className={`mt-3 font-serif text-3xl leading-tight md:text-4xl ${
                      p.featured ? "text-white" : ""
                    }`}
                  >
                    {p.name}
                  </h3>

                  <div className="mt-5">
                    <span
                      className={`block text-xs uppercase tracking-wider ${
                        p.featured ? "text-white/55" : "text-muted-foreground"
                      }`}
                    >
                      {p.priceFrom}
                    </span>
                    <span
                      className={`mt-1 block font-serif text-3xl leading-tight ${
                        p.featured ? "text-white" : "text-foreground"
                      }`}
                    >
                      {p.priceAmount}
                    </span>
                  </div>

                  <p
                    className={`mt-3 font-mono text-[10px] uppercase tracking-wider ${
                      p.featured ? "text-white/45" : "text-muted-foreground"
                    }`}
                  >
                    {p.time}
                  </p>

                  <div
                    className={`my-5 h-px ${
                      p.featured ? "bg-white/15" : "bg-border"
                    }`}
                  />

                  <p
                    className={`text-sm leading-relaxed ${
                      p.featured ? "text-white/80" : "text-foreground/80"
                    }`}
                  >
                    {p.desc}
                  </p>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            p.featured
                              ? "bg-white/15 text-white"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <Check weight="bold" size={10} />
                        </span>
                        <span
                          className={
                            p.featured ? "text-white/75" : "text-muted-foreground"
                          }
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => open(p.id)}
                    className="group mt-7 inline-flex items-center justify-between gap-2 rounded-full py-2 pl-5 pr-1 text-sm transition-all duration-700 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.32, 0.72, 0, 1)",
                      backgroundColor: p.featured ? "hsl(0 0% 100%)" : "hsl(var(--foreground))",
                      color: p.featured ? "hsl(154 43% 14%)" : "hsl(var(--background))",
                    }}
                  >
                    <span className="font-medium">{p.cta}</span>
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-[1px]"
                      style={{
                        transitionTimingFunction:
                          "cubic-bezier(0.32, 0.72, 0, 1)",
                        backgroundColor: p.featured
                          ? "hsl(154 43% 14%)"
                          : "hsl(var(--background))",
                        color: p.featured ? "hsl(0 0% 100%)" : "hsl(var(--foreground))",
                      }}
                    >
                      <ArrowUpRight weight="bold" size={13} />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Inga överraskningar: du får alltid omfattning, leverans och pris bekräftat innan start.
          </p>
          <Link
            to="/priser"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Se hur upplägget fungerar →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PaketSection;
