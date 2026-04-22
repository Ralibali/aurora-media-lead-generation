import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import FAQSection from "@/components/FAQSection";
import FinalCTASection from "@/components/FinalCTASection";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { paket } from "@/components/PaketSection";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const tillagg = [
  { name: "Hemsida", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
  { name: "E-handel", price: "Från 19 900 kr", to: "/tjanster/ehandel" },
  { name: "Mobilapp – PWA", price: "6 900 kr (2–3 dagar extra)", to: "/tjanster/mobilapp" },
  { name: "Mobilapp – Capacitor (iOS + Android)", price: "24 900 kr (1–2 v extra)", to: "/tjanster/mobilapp" },
  { name: "Mobilapp – Native", price: "Från 89 000 kr (4–8 v)", to: "/tjanster/mobilapp" },
  { name: "SEO", price: "Från 2 490 kr", to: "/tjanster/seo" },
  { name: "Google Ads", price: "3 900 kr setup", to: "/tjanster/google-ads" },
  { name: "Meta Ads", price: "3 900 kr setup", to: "/tjanster/meta-ads" },
  { name: "Content", price: "995 kr/artikel", to: "/tjanster/content" },
  { name: "Grafisk profil", price: "Från 5 900 kr", to: "/tjanster/grafisk-profil" },
  { name: "Fotografering", price: "4 900 kr/halvdag", to: "/tjanster/fotografering" },
];

const kombos = [
  {
    name: "SaaS + App",
    paket: "Kombination – SaaS + app",
    price: "Från 59 800 kr",
    breakdown: "34 900 MVP + 24 900 Capacitor",
    time: "3–4 veckor",
    desc: "Full SaaS på webben plus iOS + Android. Lanserad i båda app-butikerna.",
  },
  {
    name: "Webb + SEO",
    paket: "Hemsida",
    price: "Från 9 800 kr",
    breakdown: "4 900 landningssida + 4 900 SEO",
    time: "5–7 dagar",
    desc: "Enkel hemsida som direkt är SEO-optimerad från start.",
  },
  {
    name: "E-handel + Meta Ads",
    paket: "E-handel",
    price: "Från 23 800 kr",
    breakdown: "19 900 butik + 3 900 Ads-setup",
    time: "2 veckor",
    desc: "Shopify- eller WooCommerce-butik med första Meta-kampanjen igång.",
  },
  {
    name: "Full launch-paket",
    paket: "Kombination – SaaS + app",
    price: "Från 99 600 kr",
    breakdown: "69 000 SaaS + 24 900 app + 5 700 grund-SEO",
    time: "5–6 veckor",
    desc: "Live på webben, i App Store, på Google Play, SEO optimerad. Redo för första kunden dag ett.",
  },
];

const lopande = [
  { name: "Löpande underhåll", price: "1 990 kr/mån", desc: "Bugfixar, säkerhetsuppdateringar, mindre justeringar (upp till 2 timmar/mån)." },
  { name: "Retainer", price: "Från 12 000 kr/mån", desc: "Löpande utveckling – nya features varje månad. Säg upp med 30 dagars varsel." },
  { name: "Timpris", price: "895 kr/h", desc: "Mindre engångsjobb och konsultationer som inte passar paket." },
];

const comparisonRows: { feature: string; values: [string | boolean, string | boolean, string | boolean, string | boolean] }[] = [
  { feature: "Responsiv design", values: [true, true, true, true] },
  { feature: "Riktig data (inte mockup)", values: [true, true, true, true] },
  { feature: "Deployment på din domän", values: [true, true, true, true] },
  { feature: "Användarlogin", values: [false, true, true, true] },
  { feature: "Stripe-betalningar", values: [false, true, true, true] },
  { feature: "Admin-dashboard", values: [false, true, true, true] },
  { feature: "Avancerad analys", values: [false, false, true, true] },
  { feature: "Externa integrationer (Fortnox m.fl.)", values: [false, false, true, true] },
  { feature: "Full SEO", values: [false, false, true, true] },
  { feature: "Multi-tenant arkitektur", values: [false, false, false, true] },
  { feature: "Säkerhetskrav (audit, kryptering)", values: [false, false, false, true] },
  { feature: "Support efter leverans", values: ["1 vecka", "2 veckor", "1 månad", "Förhandlingsbar"] },
];

const prisFaqs = [
  { q: "Hur betalar jag?", a: "50 procent vid projektstart, 50 procent vid leverans. Faktura med 30 dagars betalningsvillkor. F-skatt via Aurora Media AB." },
  { q: "Vad ingår i garantin?", a: "Om prototypen dag 3 inte motsvarar förväntningarna betalar du inget. Då går vi skilda vägar utan kostnad – och behåller var sin lärdom." },
  { q: "Är moms inkluderad?", a: "Alla priser är exklusive moms. 25 procent moms tillkommer för svenska företag." },
  { q: "Vad händer om scope ändras under projektet?", a: "Mindre justeringar ingår. Större tillägg offereras separat innan vi börjar bygga – aldrig i efterhand." },
  { q: "Kan jag kombinera paket?", a: "Ja. Många kunder börjar med Prototyp, beslutar sig för MVP eller SaaS, och uppgraderar då till differensen. Du betalar aldrig dubbelt." },
];

const Priser = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "Priser – fast pris från 14 900 kr | SaaS, MVP & webb | Aurora Media",
      description:
        "Transparenta paket för AI-byggd SaaS: Prototyp 14 900 kr, MVP 34 900 kr, Skalbar SaaS 69 000 kr, Skräddarsytt från 89 000 kr. Fast pris, ingen timdebitering.",
      canonical: "/priser",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Priser", url: "/priser" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Priser</p>
              <h1 className="mt-4 font-serif text-[clamp(2.75rem,7vw,6rem)] leading-[1.05] tracking-[-0.02em]">
                Fast pris. <em className="italic text-primary">Inga timmar.</em>
              </h1>
              <p className="mt-7 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Du vet exakt vad du betalar innan vi börjar. Ingen löpande räkning, inga
                "det blev lite mer komplext än vi trodde". Inga sex-månaders bindningar.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main packages */}
        <section className="pb-20 md:pb-24">
          <div className="container mx-auto px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {paket.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
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
          </div>
        </section>

        {/* Comparison table */}
        <section className="border-t border-border bg-secondary/30 py-20 md:py-24">
          <div className="container mx-auto px-6">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="label-caps">Jämförelse</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em]">
                Vad ingår var?
              </h2>
            </motion.div>

            <div className="mt-12 overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="p-5 font-medium text-muted-foreground"></th>
                    <th className="p-5 font-serif text-base font-normal">Prototyp</th>
                    <th className="p-5 font-serif text-base font-normal">MVP</th>
                    <th className="p-5 font-serif text-base font-normal text-primary">Skalbar SaaS</th>
                    <th className="p-5 font-serif text-base font-normal">Skräddarsytt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparisonRows.map((row) => (
                    <tr key={row.feature}>
                      <td className="p-4 text-foreground/85">{row.feature}</td>
                      {row.values.map((v, i) => (
                        <td key={i} className="p-4 text-sm">
                          {typeof v === "boolean" ? (
                            v ? (
                              <Check className="h-4 w-4 text-primary" aria-label="Ingår" />
                            ) : (
                              <span className="text-muted-foreground/40" aria-label="Ingår ej">—</span>
                            )
                          ) : (
                            <span className={i === 2 ? "font-medium text-primary" : "text-foreground/75"}>{v}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Tilläggstjänster */}
        <section className="border-t border-border py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Tilläggstjänster</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em]">
                Resten av paletten.
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                Allt annat jag levererar – samma fast-pris-approach.
              </p>
            </motion.div>

            <div className="mt-10 divide-y divide-border border-y border-border">
              {tillagg.map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  className="group grid gap-2 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6"
                >
                  <p className="font-serif text-xl md:text-2xl">{t.name}</p>
                  <p className="text-sm font-medium text-primary sm:text-right">{t.price}</p>
                  <ArrowUpRight className="hidden h-5 w-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:block" />
                </Link>
              ))}
            </div>

            <p className="mt-6 text-sm text-muted-foreground max-w-3xl">
              Capacitor är min rekommendation för 90 procent av app-projekt. Vill du paketera
              webb + app som ett projekt? <Link to="/tjanster/mobilapp" className="text-primary hover:underline">MVP + Capacitor = från 59 800 kr på 3–4 veckor</Link>.
            </p>
          </div>
        </section>

        {/* Vanliga kombinationer */}
        <section className="border-t border-border bg-secondary/30 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Kombo-paket</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em]">
                Vanliga kombinationer.
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                Spara tid genom att paketera flera tjänster från start. Samma fasta priser, ett projekt.
              </p>
            </motion.div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {kombos.map((k, i) => (
                <motion.div
                  key={k.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="flex flex-col rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-md"
                >
                  <p className="label-caps">{k.name}</p>
                  <p className="mt-3 font-serif text-2xl md:text-3xl">{k.price}</p>
                  <p className="mt-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {k.breakdown}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{k.time}</p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">{k.desc}</p>
                  <Button
                    onClick={() => open(k.paket)}
                    variant="outline"
                    className="mt-6 w-full"
                  >
                    Få offert
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Löpande priser */}
        <section className="border-t border-border bg-secondary/30 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Löpande priser</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em]">
                Efter leverans.
              </h2>
            </motion.div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {lopande.map((l, i) => (
                <motion.div
                  key={l.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="rounded-xl border border-border bg-card p-7"
                >
                  <p className="label-caps">{l.name}</p>
                  <p className="mt-3 font-serif text-2xl md:text-3xl">{l.price}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{l.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Betalning + Garanti */}
        <section className="border-t border-border py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl grid gap-12 md:grid-cols-2 md:gap-16">
            <motion.div {...fadeUp}>
              <p className="label-caps">Betalningsvillkor</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Hur det funkar.
              </h2>
              <ul className="mt-7 space-y-3.5">
                <li className="flex items-start gap-3 text-base text-foreground/85">
                  <Check className="mt-1 h-4 w-4 text-primary shrink-0" />
                  50 procent vid projektstart, 50 procent vid leverans
                </li>
                <li className="flex items-start gap-3 text-base text-foreground/85">
                  <Check className="mt-1 h-4 w-4 text-primary shrink-0" />
                  Faktura med 30 dagars betalningsvillkor
                </li>
                <li className="flex items-start gap-3 text-base text-foreground/85">
                  <Check className="mt-1 h-4 w-4 text-primary shrink-0" />
                  F-skatt via Aurora Media AB (org.nr 559272-0220)
                </li>
                <li className="flex items-start gap-3 text-base text-foreground/85">
                  <Check className="mt-1 h-4 w-4 text-primary shrink-0" />
                  Alla priser exklusive 25 % moms
                </li>
              </ul>
            </motion.div>

            <motion.div {...fadeUp} className="rounded-xl border border-primary/30 bg-primary/5 p-8">
              <p className="label-caps text-primary">Garanti</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Du tar ingen risk.
              </h2>
              <p className="mt-7 text-base leading-relaxed text-foreground/85 md:text-lg">
                Om prototypen dag 3 inte motsvarar förväntningarna, betalar du inget och behåller
                vi var sin lärdom. Inga 6-månaderskontrakt. Inga uppsägningstider för paket.
              </p>
            </motion.div>
          </div>
        </section>

        <FAQSection items={prisFaqs} title="Frågor om priser." />

        <FinalCTASection />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default Priser;
