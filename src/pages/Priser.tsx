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
  { name: "Hemsida", price: "Offert efter omfattning", to: "/tjanster/hemsidor" },
  { name: "E-handel", price: "Offert efter behov", to: "/tjanster/ehandel" },
  { name: "Mobilapp – PWA", price: "Snabbt tillägg", to: "/tjanster/mobilapp" },
  { name: "Mobilapp – iOS + Android", price: "Offert efter plattform", to: "/tjanster/mobilapp" },
  { name: "Mobilapp – Native", price: "Skräddarsydd offert", to: "/tjanster/mobilapp" },
  { name: "SEO", price: "Månad eller engångsinsats", to: "/tjanster/seo" },
  { name: "Google Ads", price: "Setup efter konto", to: "/tjanster/google-ads" },
  { name: "Meta Ads", price: "Setup efter mål", to: "/tjanster/meta-ads" },
  { name: "Content", price: "Pris efter volym", to: "/tjanster/content" },
  { name: "Grafisk profil", price: "Offert efter nivå", to: "/tjanster/grafisk-profil" },
  { name: "Fotografering", price: "Offert efter upplägg", to: "/tjanster/fotografering" },
];

const kombos = [
  {
    name: "SaaS + App",
    paket: "Kombination – SaaS + app",
    price: "Offert efter scope",
    breakdown: "Webbapp + mobilapp i samma plan",
    time: "2–4 veckor",
    desc: "För dig som vill komma ut på webben och i mobilen utan att bygga två separata projekt.",
  },
  {
    name: "Webb + SEO",
    paket: "Hemsida",
    price: "Rimlig paketoffert",
    breakdown: "Hemsida + SEO-grund från start",
    time: "3–7 arbetsdagar",
    desc: "En snabb, snygg och sökbar hemsida där grunden är rätt redan från början.",
  },
  {
    name: "E-handel + Meta Ads",
    paket: "E-handel",
    price: "Offert efter butikens omfattning",
    breakdown: "Butik + första kampanjstrukturen",
    time: "1–2 veckor",
    desc: "För dig som vill kunna sälja och samtidigt få igång relevant trafik direkt efter lansering.",
  },
  {
    name: "Full launch-paket",
    paket: "Kombination – SaaS + app",
    price: "Skräddarsydd offert",
    breakdown: "Webb, app, SEO och annonsering",
    time: "3–6 veckor",
    desc: "När du vill ha en samlad lansering där teknik, synlighet och konvertering hänger ihop.",
  },
];

const lopande = [
  { name: "Löpande underhåll", price: "Fast månadsoffert", desc: "Bugfixar, säkerhetsuppdateringar och mindre justeringar när du vill slippa tänka på tekniken." },
  { name: "Retainer", price: "Offert efter tempo", desc: "För dig som vill utveckla vidare varje månad med tydlig prioritering och snabb leverans." },
  { name: "Konsultation", price: "Bokas efter behov", desc: "Passar mindre engångsjobb, rådgivning eller felsökning där du vill komma vidare snabbt." },
];

const comparisonRows: { feature: string; values: [string | boolean, string | boolean, string | boolean, string | boolean] }[] = [
  { feature: "Responsiv design", values: [true, true, true, true] },
  { feature: "Riktig data (inte bara mockup)", values: [true, true, true, true] },
  { feature: "Deployment på din domän", values: [true, true, true, true] },
  { feature: "Användarlogin", values: [false, true, true, true] },
  { feature: "Betalningar", values: [false, true, true, true] },
  { feature: "Admin-dashboard", values: [false, true, true, true] },
  { feature: "Analys och spårning", values: [false, false, true, true] },
  { feature: "Externa integrationer", values: [false, false, true, true] },
  { feature: "SEO-grund", values: [false, true, true, true] },
  { feature: "Multi-tenant arkitektur", values: [false, false, false, true] },
  { feature: "Säkerhets- och GDPR-tänk", values: [true, true, true, true] },
  { feature: "Support efter leverans", values: ["Ingår", "Ingår", "Ingår", "Enligt offert"] },
];

const prisFaqs = [
  { q: "Varför visar ni inte fasta priser längre?", a: "För att två projekt sällan är lika. Ett fast lågt pris kan låta tryggt, men blir ofta missvisande. Jag vill hellre ge dig en ärlig offert efter vad du faktiskt behöver — så att du inte betalar för fel saker." },
  { q: "Kommer offerten kännas dyr?", a: "Målet är tvärtom att du ska känna: det här är rimligt. Jag bygger hellre smart och fokuserat än stort och onödigt. Du får alltid veta omfattning, leverans och pris innan vi startar." },
  { q: "Hur snabbt kan ni leverera?", a: "Mindre projekt kan ofta komma igång och levereras på några arbetsdagar. Större MVP-, SaaS- och e-handelsprojekt får en tydlig tidsplan, men fokus är alltid att få ut första värdeskapande versionen snabbt." },
  { q: "Vad händer om scope ändras under projektet?", a: "Då tar vi det innan något byggs vidare. Mindre justeringar är normalt, men större tillägg ska aldrig komma som en överraskning i efterhand." },
  { q: "Kan jag börja litet och bygga vidare?", a: "Ja, och det är ofta det smartaste. Börja med det som skapar mest värde först, lansera snabbare och bygg vidare när du vet vad kunderna faktiskt behöver." },
];

const Priser = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "Priser & offert – snabb leverans utan överraskningar | Aurora Media",
      description:
        "Få en tydlig och rimlig offert för hemsida, SaaS, MVP, e-handel, SEO, Google Ads och Meta Ads. Snabb leverans, tydlig omfattning och inga överraskningar.",
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
        <section className="pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <Reveal>
              <p className="label-caps">Priser & offert</p>
              <h1 className="mt-4 font-serif text-[clamp(2.75rem,7vw,6rem)] leading-[1.05] tracking-[-0.02em]">
                Du får ett tydligt pris. <em className="italic text-primary">Inte en överraskning.</em>
              </h1>
              <p className="mt-7 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Jag visar inte generella prislappar eftersom de sällan säger sanningen. Istället får du en snabb genomgång, en konkret rekommendation och en offert som är anpassad efter det som faktiskt behöver byggas.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="pb-20 md:pb-24">
          <div className="container mx-auto px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {paket.map((p, i) => (
                <Reveal
                  key={p.id}
                  delay={i * 0.06}
                  duration={0.6}
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
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/30 py-20 md:py-24">
          <div className="container mx-auto px-6">
            <Reveal className="max-w-2xl">
              <p className="label-caps">Jämförelse</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em]">
                Välj nivå — inte prislapp.
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                Det viktiga är inte att köpa störst paket. Det viktiga är att börja på rätt nivå och få ut något som faktiskt kan användas.
              </p>
            </Reveal>

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

        <section className="border-t border-border py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <Reveal>
              <p className="label-caps">Tilläggstjänster</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em]">
                Resten av paletten.
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                Du får pris efter behov, inte efter en mall. Det gör offerten mer rättvis och oftast mer träffsäker.
              </p>
            </Reveal>

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
              Vill du kombinera flera delar? Då paketerar vi dem i ett upplägg så att du får en tydlig leverans, en tydlig prioritering och ett pris du kan ta ställning till innan start.
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/30 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <Reveal>
              <p className="label-caps">Kombo-paket</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em]">
                Vanliga kombinationer.
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                Här finns inga låsta paketpriser. Det finns bättre: en kombination som passar målet, budgeten och tempot.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {kombos.map((k, i) => (
                <Reveal
                  key={k.name}
                  delay={i * 0.06}
                  y={16}
                  duration={0.5}
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
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/30 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <Reveal>
              <p className="label-caps">Efter leverans</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em]">
                Trygghet även efter lansering.
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {lopande.map((l, i) => (
                <Reveal
                  key={l.name}
                  delay={i * 0.06}
                  y={16}
                  duration={0.5}
                  className="rounded-xl border border-border bg-card p-7"
                >
                  <p className="label-caps">{l.name}</p>
                  <p className="mt-3 font-serif text-2xl md:text-3xl">{l.price}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{l.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl grid gap-12 md:grid-cols-2 md:gap-16">
            <Reveal>
              <p className="label-caps">Så fungerar det</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Inga dolda överraskningar.
              </h2>
              <ul className="mt-7 space-y-3.5">
                <li className="flex items-start gap-3 text-base text-foreground/85">
                  <Check className="mt-1 h-4 w-4 text-primary shrink-0" />
                  Vi börjar med en snabb genomgång av mål, behov och viktigaste funktioner
                </li>
                <li className="flex items-start gap-3 text-base text-foreground/85">
                  <Check className="mt-1 h-4 w-4 text-primary shrink-0" />
                  Du får en tydlig offert innan projektstart
                </li>
                <li className="flex items-start gap-3 text-base text-foreground/85">
                  <Check className="mt-1 h-4 w-4 text-primary shrink-0" />
                  Leveransen delas upp så att det viktigaste kommer ut först
                </li>
                <li className="flex items-start gap-3 text-base text-foreground/85">
                  <Check className="mt-1 h-4 w-4 text-primary shrink-0" />
                  Större tillägg godkänns alltid innan de byggs
                </li>
              </ul>
            </Reveal>

            <Reveal delay={0.08} className="rounded-xl border border-primary/30 bg-primary/5 p-8">
              <p className="label-caps text-primary">Trygghet</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Du ska känna att det var värt det.
              </h2>
              <p className="mt-7 text-base leading-relaxed text-foreground/85 md:text-lg">
                Ett bra projekt handlar inte om att pressa fram flest funktioner. Det handlar om att bygga rätt saker, i rätt ordning, till ett pris som känns rimligt när du ser vad du får tillbaka.
              </p>
            </Reveal>
          </div>
        </section>

        <FAQSection items={prisFaqs} title="Frågor om offert och pris." />

        <FinalCTASection />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default Priser;
