import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, ChevronRight, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, setJsonLd, removeJsonLd } from "@/lib/seoHelpers";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

const tiers = [
  {
    name: "PWA",
    paket: "Mobilapp – PWA",
    price: "6 900 kr",
    time: "2–3 dagar extra",
    tagline: "Billigaste vägen till app-upplevelse",
    bra: "Snabb lansering, testa om appen behövs alls",
    inc: [
      "Installerbar från webben (inte butikerna)",
      "Funkar offline",
      "Push-notiser (Android, begränsat iOS)",
      "Fullskärmsläge, app-ikon",
      "Samma kodbas som webben",
    ],
    notInc: [
      "Visas inte i App Store eller Google Play",
      "In-app purchase fungerar inte",
    ],
    cta: "Välj PWA",
  },
  {
    name: "Capacitor-app",
    paket: "Mobilapp – Capacitor",
    price: "24 900 kr",
    time: "1–2 veckor extra",
    tagline: "Riktig app i båda butikerna",
    bra: "Produkter som ska kännas professionella, konsument-produkter, appar med push-notiser",
    inc: [
      "Finns i Apple App Store",
      "Finns i Google Play Store",
      "Native push-notiser båda plattformar",
      "App-ikon, splash screen, riktiga installers",
      "Uppgraderingar via butikerna",
      "Samma kodbas som webben (underhåll på ett ställe)",
      "Upload till båda butikerna ingår",
    ],
    notInc: [
      "Apple Developer Program: 99 USD/år (du betalar)",
      "Google Play Developer: 25 USD engångs (du betalar)",
    ],
    featured: true,
    cta: "Välj Capacitor-app",
  },
  {
    name: "Native app",
    paket: "Mobilapp – Native",
    price: "Från 89 000 kr",
    time: "4–8 veckor",
    tagline: "När appen måste vara best-in-class",
    bra: "Avancerad hårdvaruaccess (kamera-streaming, ARKit, komplex audio), enterprise-kunder",
    inc: [
      "Byggd i React Native eller Swift/Kotlin",
      "Maximal prestanda",
      "Full tillgång till plattformsspecifika API:er",
      "Separat kodbas från webben",
    ],
    notInc: [],
    cta: "Boka konsultation",
  },
];

const includes = [
  "Konvertering av befintlig webb-SaaS till Capacitor-projekt",
  "iOS-konfiguration: app-ikon, splash screen, bundle ID, permissions",
  "Android-konfiguration: app-ikon, splash screen, package name, permissions",
  "Push-notiser via OneSignal eller Firebase (iOS + Android)",
  "Native device-API:er: kamera, filer, delning där relevant",
  "App Store-inlämning (screenshots, beskrivning, metadata)",
  "Google Play-inlämning (screenshots, beskrivning, metadata)",
  "Privacy policy-sida på webben (krav från butikerna)",
  "Setup av kundens Apple Developer + Google Play-konto",
  "Första release upload till båda butiker",
  "Hjälp med eventuella rejections från butikerna",
  "2 veckors support efter app-godkännande",
];

const process = [
  {
    label: "Dag 1",
    title: "Vi stämmer av",
    body: "Jag tittar på din befintliga webb-SaaS (eller planerade bygge) och bedömer komplexiteten. Du får veta exakt hur många arbetsdagar appen tar.",
  },
  {
    label: "Dag 2–5",
    title: "Capacitor-konvertering",
    body: "Jag lägger till Capacitor till projektet, konfigurerar iOS- och Android-builds, sätter upp ikon, splash screen, push-notiser.",
  },
  {
    label: "Dag 6–10",
    title: "Testing och polish",
    body: "Tester på riktiga iPhones och Android-enheter. Justeringar för att appen ska kännas smooth på båda plattformarna.",
  },
  {
    label: "Dag 11–14",
    title: "Butiks-inlämning",
    body: "App Store Connect och Google Play Console-setup. Screenshots, beskrivningar, metadata. Submission och hantering av eventuella rejections. Apple-godkännande tar oftast 1–7 dagar extra.",
  },
];

const faqs = [
  {
    q: "Behöver jag ha en webb-SaaS först?",
    a: "Ja, Capacitor-varianten kräver befintlig webb (eller en som byggs samtidigt). Vi kan också bygga webb + app som ett paket. MVP + Capacitor = från 59 800 kr totalt, levereras på 3 veckor.",
  },
  {
    q: "Vem äger Apple Developer-kontot?",
    a: "Du gör. Jag hjälper dig sätta upp det första gången, men kontot står i ditt företagsnamn. Du äger appen fullständigt, som med all min leverans.",
  },
  {
    q: "Vad händer om Apple eller Google avvisar appen?",
    a: "Det är ovanligt för Capacitor-appar men händer. Första rejection hanterar jag utan extra kostnad. Om det kräver större omskrivning diskuterar vi scope separat.",
  },
  {
    q: "Kan jag uppdatera appen själv sen?",
    a: "Ja, med en begränsning: uppdateringar till butikerna kräver Xcode (iOS) och Android Studio. Jag kan lära dig, eller du kan teckna löpande underhåll (1 990 kr/mån) så sköter jag uppdateringarna.",
  },
  {
    q: "Fungerar push-notiser på iOS?",
    a: "Ja, via Apple Push Notification Service. Kräver extra setup av certifikat men ingår i paketet.",
  },
  {
    q: "Kan jag ta betalt i appen?",
    a: "Ja, men med nyanser. Fysiska varor och tjänster betalas via Stripe (som på webben). Digitala prenumerationer måste gå via Apple/Google in-app purchase – då tar butikerna 15–30 procent. Jag sätter upp vilket som passar din modell.",
  },
];

const related = [
  { name: "Skalbar SaaS", price: "69 000 kr", to: "/priser" },
  { name: "MVP", price: "34 900 kr", to: "/priser" },
  { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
];

const Mobilapp = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "iOS & Android-app till din SaaS – från 24 900 kr | Aurora Media",
      description:
        "Paketera din webb-SaaS som iOS och Android-app via Capacitor. Från 24 900 kr som tillägg. Finns i App Store och Google Play på 2 veckor. Linköping.",
      canonical: "/tjanster/mobilapp",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: "Mobilapp", url: "/tjanster/mobilapp" },
    ]);
    setJsonLd("mobilapp-service-jsonld", {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "iOS och Android-app utveckling",
      provider: { "@id": "https://auroramedia.se/#organization" },
      description:
        "Paketerar webb-SaaS som native appar för App Store och Google Play via Capacitor.",
      offers: [
        { "@type": "Offer", name: "PWA", price: "6900", priceCurrency: "SEK" },
        { "@type": "Offer", name: "Capacitor iOS+Android", price: "24900", priceCurrency: "SEK" },
        {
          "@type": "Offer",
          name: "Native app",
          price: "89000",
          priceCurrency: "SEK",
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "SEK",
            minPrice: "89000",
          },
        },
      ],
      areaServed: "SE",
    });
    return () => {
      removeJsonLd("breadcrumb-jsonld");
      removeJsonLd("mobilapp-service-jsonld");
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Breadcrumb */}
        <nav aria-label="Brödsmulor" className="container mx-auto px-6 pt-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Hem</Link></li>
            <ChevronRight className="h-3 w-3" />
            <li><Link to="/tjanster" className="hover:text-foreground">Tjänster</Link></li>
            <ChevronRight className="h-3 w-3" />
            <li className="text-foreground">Mobilapp</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="pt-10 pb-16 md:pt-16 md:pb-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Tilläggstjänst · från 24 900 kr</p>
              <h1 className="mt-5 font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-[-0.02em]">
                iOS & Android-app <em className="italic text-primary">på din webb-SaaS</em>
              </h1>
              <p className="mt-7 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
                Ta din produkt till App Store och Google Play. Samma kodbas som webben,
                paketerad som riktig native app. 2–3 veckor extra på befintligt projekt.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => open("Mobilapp – Capacitor")}>
                  Boka samtal om app
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/tjanster">Se alla tjänster</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Three tiers */}
        <section className="border-t border-border py-20 md:py-24">
          <div className="container mx-auto px-6">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="label-caps">Tre varianter</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Tre sätt att leverera app.
              </h2>
            </motion.div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {tiers.map((t, i) => (
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
                  <p className="mt-4 text-sm font-medium text-foreground/90">{t.tagline}</p>
                  <p className="mt-2 text-xs text-muted-foreground italic">Bra för: {t.bra}</p>

                  <ul className="mt-5 space-y-2">
                    {t.inc.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                    {t.notInc.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                        <span className="text-muted-foreground/70">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => open(t.paket)}
                    variant={t.featured ? "default" : "outline"}
                    className="mt-6 w-full"
                  >
                    {t.cta}
                  </Button>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Osäker på vilken variant? Boka ett 20-minuters samtal så säger jag direkt
                vad som passar ditt projekt.
              </p>
              <Button onClick={() => open("Mobilapp (iOS/Android)")} className="mt-5" size="lg">
                Boka samtal
              </Button>
            </div>
          </div>
        </section>

        {/* Why Capacitor */}
        <section className="border-t border-border bg-secondary/30 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-3xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Varför Capacitor</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Varför jag rekommenderar Capacitor-varianten.
              </h2>
              <div className="mt-8 space-y-6 text-lg leading-relaxed text-foreground/85">
                <p>
                  Capacitor är Ionics ramverk för att paketera webbapps som native appar.
                  Det betyder att du bygger produkten en gång – som responsiv webb – och
                  sedan wrapar jag den som iOS och Android-app.
                </p>
                <p>
                  Alternativet är att bygga en separat native-app i React Native eller
                  Swift, vilket tar 4–8 veckor extra och kostar 3–5x mer. För 90 procent
                  av SaaS-projekt är Capacitor fullt tillräckligt och omöjligt att skilja
                  från native-appar för slutanvändaren.
                </p>
                <p>
                  Jag använder Capacitor i mina egna appar. Hönsgården finns på Google
                  Play just så. AgilityManager är planerad samma väg. Metoden är testad,
                  stabil och snabb.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Whats included */}
        <section className="border-t border-border py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div {...fadeUp}>
              <p className="label-caps">Vad som ingår i Capacitor-paketet</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
                Det här får du.
              </h2>
            </motion.div>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {includes.map((item, i) => (
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
              {process.map((s, i) => (
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

        <FAQSection items={faqs} title="Vanliga frågor" />

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
              {related.map((r, i) => (
                <motion.div
                  key={r.to + r.name}
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
              Har du en SaaS som borde vara en app också?
            </motion.h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Boka ett kort samtal. Jag säger direkt om Capacitor är rätt väg eller om du
              behöver något annat.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Button size="lg" onClick={() => open("Mobilapp – Capacitor")} className="px-10">
                Starta app-projekt
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

export default Mobilapp;
