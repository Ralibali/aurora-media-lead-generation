import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { setSEOMeta, setJsonLd, setBreadcrumb } from "@/lib/seoHelpers";

// Hero palette (warm dark)
const HERO_BG = "#0F0E0C";
const HERO_H1 = "#FAF7F2";
const HERO_BODY = "#E8E1D4";
const HERO_MUTED = "#9A9388";
const HERO_ACCENT = "#D97D3C";
const HERO_PLACEHOLDER_BG = "#1A1814";

// Rest of page (editorial light)
const BG = "#FAF7F2";
const INK = "#1A1A1A";
const ACCENT = "#1F3D2E";
const MUTED = "#6B6760";
const RULE = "#E5E0D6";

const products = [
  {
    name: "Hönsgården",
    url: "https://honsgarden.se",
    blurb: "App för hönsgårdar med 5 000+ aktiva användare.",
  },
  {
    name: "AgilityManager",
    url: "https://agilitymanager.se",
    blurb: "Träningsplattform för hundagility-tränare.",
  },
  {
    name: "Odlingsdagboken",
    url: "https://odlingsdagboken.com",
    blurb: "Odlingsapp med AI-coachen Gro.",
  },
  {
    name: "Updro",
    url: "https://updro.se",
    blurb: "Marknadsplats för digitalbyråer i Sverige.",
  },
  {
    name: "Aurora Transport",
    url: "https://auroratransport.se",
    blurb: "Transportadministration för åkerier.",
  },
  {
    name: "GoGlamping Sweden",
    url: "https://goglampingsweden.se",
    blurb: "Min egen glampingverksamhet vid Göta kanal.",
  },
];

const faqs = [
  {
    q: "Vad kostar kartan?",
    a: "Inget. Den är gratis och du behöver inte uppge kortuppgifter eller boka något möte.",
  },
  {
    q: "Vad händer efter att jag fyllt i?",
    a: "Du får svaret direkt på skärmen — vilka uppgifter som kan automatiseras, ungefär hur många timmar det skulle spara, och om jag tycker att det är värt att bygga.",
  },
  {
    q: "Måste jag bygga något efter?",
    a: "Nej. Många använder kartan som ett internt diskussionsunderlag. Vill ni att jag bygger något så finns jag — annars hör vi inte av oss igen.",
  },
  {
    q: "Hur snabbt får jag svar?",
    a: "Direkt. Analysen är klar samma sekund du skickat in formuläret.",
  },
  {
    q: "Kan jag ringa istället?",
    a: "Absolut. Mejla mig på info@auroramedia.se så ringer jag upp samma dag.",
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const AiKarta = () => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setSEOMeta({
      title: "Skapa er AI-karta – Aurora Media",
      description:
        "Tre minuters formulär. Få en konkret karta över vad som kan automatiseras i er verksamhet.",
      canonical: "/ai-karta",
      ogImage: "/og-image-sv.jpg",
    });
    setBreadcrumb([
      { name: "Start", url: "/" },
      { name: "AI-kartan", url: "/ai-karta" },
    ]);
    setJsonLd("ai-karta-faq-jsonld", breadcrumbJsonLd);
  }, []);

  return (
    <div
      className="min-h-screen font-sans antialiased"
      style={{
        background: BG,
        color: INK,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      {/* Editorial fonts */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=Caveat:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* === Minimal header === */}
      <header className="border-b" style={{ borderColor: RULE }}>
        <div className="mx-auto flex max-w-6xl items-center px-6 py-5">
          <Link to="/" aria-label="Aurora Media">
            <img
              src={auroraLogo}
              alt="Aurora Media"
              className="h-7 w-auto"
              style={{ filter: "brightness(0)" }}
            />
          </Link>
        </div>
      </header>

      <main>
        {/* === Hero === */}
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-16">
            <div className="md:col-span-7">
              <p
                className="text-[11px] font-medium uppercase tracking-[0.18em]"
                style={{ color: ACCENT }}
              >
                Hej — Christoffer här
              </p>

              <h1
                className="mt-6 leading-[0.98] tracking-[-0.02em]"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontWeight: 400,
                  fontSize: "clamp(2.4rem, 6.4vw, 4.8rem)",
                  color: INK,
                }}
              >
                Jag bygger system som tar bort de tråkiga uppgifterna i
                ert företag.
              </h1>

              <p
                className="mt-8 max-w-xl text-[1.0625rem] leading-[1.65]"
                style={{ color: MUTED }}
              >
                Berätta lite om vad ni gör i ett kort frågeformulär — så
                får ni tillbaka en konkret karta över vilka uppgifter som
                kan automatiseras, hur många timmar det skulle spara, och
                om det ens är värt att bygga. Tar tre minuter.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/ai-karta/start"
                  className="inline-flex items-center justify-center rounded-full px-7 py-4 text-[15px] font-medium transition hover:opacity-90"
                  style={{ background: ACCENT, color: BG }}
                >
                  Skapa min karta →
                </Link>
              </div>

              <p
                className="mt-4 text-[13px]"
                style={{ color: MUTED }}
              >
                Helt gratis. Inget säljmöte. Du får svaret direkt på
                skärmen.
              </p>
            </div>

            {/* Portrait — polaroid feel */}
            <div className="md:col-span-5">
              <figure className="mx-auto max-w-[320px] md:ml-auto md:mr-0">
                <div
                  className="rotate-[-2deg] bg-white p-3 pb-5 shadow-[0_24px_60px_-30px_rgba(26,26,26,0.45)]"
                  style={{ border: `1px solid ${RULE}` }}
                >
                  <div
                    className="aspect-[4/5] w-full overflow-hidden"
                    style={{ background: "#EFEAE0" }}
                  >
                    {!imgFailed ? (
                      <img
                        src="/christoffer.jpg"
                        alt="Christoffer Holstensson, Linköping"
                        className="h-full w-full object-cover"
                        onError={() => setImgFailed(true)}
                        loading="eager"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{
                          fontFamily: "'Fraunces', Georgia, serif",
                          color: ACCENT,
                          fontSize: "5rem",
                        }}
                      >
                        CH
                      </div>
                    )}
                  </div>
                  <figcaption
                    className="mt-3 text-center"
                    style={{
                      fontFamily: "'Caveat', cursive",
                      color: INK,
                      fontSize: "1.15rem",
                    }}
                  >
                    Christoffer Holstensson — Linköping
                  </figcaption>
                </div>
              </figure>
            </div>
          </div>
        </section>

        {/* === Products === */}
        <section
          className="border-t"
          style={{ borderColor: RULE }}
        >
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.18em]"
              style={{ color: ACCENT }}
            >
              Produkter jag byggt och driver
            </p>
            <h2
              className="mt-4 max-w-2xl leading-[1.05] tracking-[-0.02em]"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(1.75rem, 3.6vw, 2.6rem)",
                fontWeight: 400,
              }}
            >
              Sex egna produkter som lever idag.
            </h2>

            <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2">
              {products.map((p) => (
                <li
                  key={p.url}
                  className="border-t pt-6"
                  style={{ borderColor: RULE }}
                >
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3
                        style={{
                          fontFamily: "'Fraunces', Georgia, serif",
                          fontSize: "1.5rem",
                          fontWeight: 500,
                          color: INK,
                        }}
                      >
                        {p.name}
                      </h3>
                      <span
                        className="text-[12px] underline-offset-4 group-hover:underline"
                        style={{ color: ACCENT }}
                      >
                        {p.url.replace(/^https?:\/\//, "")} ↗
                      </span>
                    </div>
                    <p
                      className="mt-2 text-[15px] leading-[1.6]"
                      style={{ color: MUTED }}
                    >
                      {p.blurb}
                    </p>
                  </a>
                </li>
              ))}
            </ul>

            <p
              className="mt-12 text-[13px]"
              style={{ color: MUTED }}
            >
              + Klientarbeten som Viriditas (massagesalong, Uddevalla)
            </p>
          </div>
        </section>

        {/* === How it works === */}
        <section
          className="border-t"
          style={{ borderColor: RULE }}
        >
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <h2
              className="max-w-2xl leading-[1.05] tracking-[-0.02em]"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(1.75rem, 3.6vw, 2.6rem)",
                fontWeight: 400,
              }}
            >
              Så här går det till
            </h2>

            <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
              {[
                {
                  n: "01",
                  t: "Du svarar på några frågor",
                  b: "Tio enkla frågor om vad ni gör och var det tar mest tid. Tre minuter.",
                },
                {
                  n: "02",
                  t: "Jag analyserar processerna",
                  b: "Du får en karta över vilka uppgifter som kan automatiseras, vad det skulle spara i timmar, och hur en lösning skulle kunna se ut.",
                },
                {
                  n: "03",
                  t: "Du bestämmer vad ni vill göra",
                  b: "Bygg det själva. Anlita mig. Lägg på hyllan. Inga förpliktelser, ingen säljare som ringer.",
                },
              ].map((s) => (
                <div key={s.n}>
                  <div
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: "3.25rem",
                      lineHeight: 1,
                      color: ACCENT,
                      fontWeight: 300,
                    }}
                  >
                    {s.n}
                  </div>
                  <h3
                    className="mt-5"
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: "1.35rem",
                      fontWeight: 500,
                      color: INK,
                    }}
                  >
                    {s.t}
                  </h3>
                  <p
                    className="mt-3 text-[15px] leading-[1.65]"
                    style={{ color: MUTED }}
                  >
                    {s.b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === About === */}
        <section
          className="border-t"
          style={{ borderColor: RULE }}
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-12 md:gap-16 md:py-28">
            <div className="md:col-span-5">
              <figure className="mx-auto max-w-[300px]">
                <div
                  className="rotate-[1.5deg] bg-white p-3 pb-5 shadow-[0_24px_60px_-30px_rgba(26,26,26,0.45)]"
                  style={{ border: `1px solid ${RULE}` }}
                >
                  <div
                    className="aspect-[4/5] w-full overflow-hidden"
                    style={{ background: "#EFEAE0" }}
                  >
                    {!imgFailed ? (
                      <img
                        src="/christoffer.jpg"
                        alt="Christoffer Holstensson"
                        className="h-full w-full object-cover"
                        onError={() => setImgFailed(true)}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{
                          fontFamily: "'Fraunces', Georgia, serif",
                          color: ACCENT,
                          fontSize: "5rem",
                        }}
                      >
                        CH
                      </div>
                    )}
                  </div>
                </div>
              </figure>
            </div>

            <div className="md:col-span-7">
              <p
                className="text-[11px] font-medium uppercase tracking-[0.18em]"
                style={{ color: ACCENT }}
              >
                Lite om mig
              </p>
              <h2
                className="mt-4 leading-[1.05] tracking-[-0.02em]"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "clamp(1.75rem, 3.6vw, 2.6rem)",
                  fontWeight: 400,
                }}
              >
                Polis till vardags. Byggare på kvällarna.
              </h2>

              <div
                className="mt-8 space-y-5 text-[1.0625rem] leading-[1.75]"
                style={{ color: "#2A2A2A" }}
              >
                <p>
                  Jag heter Christoffer Holstensson, är 33 och bor i
                  Linköping. Vid sidan av mitt jobb som polis driver jag
                  Aurora Media AB, där jag bygger SaaS-produkter och
                  system åt svenska företag.
                </p>
                <p>
                  Jag har byggt sex egna produkter som lever idag, varav
                  flera har betalande prenumeranter. Det är inte teori
                  för mig — jag äter min egen hundmat.
                </p>
                <p>
                  Det som gör det här tilltaget annorlunda är att jag
                  inte är en konsult som föreslår saker. Jag är en
                  byggare. Om kartan visar att något är värt att göra —
                  då kan jag bygga det. Snabbt och utan onödig overhead.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* === FAQ === */}
        <section
          className="border-t"
          style={{ borderColor: RULE }}
        >
          <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
            <h2
              className="leading-[1.05] tracking-[-0.02em]"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(1.75rem, 3.6vw, 2.6rem)",
                fontWeight: 400,
              }}
            >
              Vanliga frågor
            </h2>

            <Accordion type="single" collapsible className="mt-10">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`q-${i}`}
                  className="border-0 border-b"
                  style={{ borderColor: RULE }}
                >
                  <AccordionTrigger
                    className="py-5 text-left hover:no-underline"
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: "1.15rem",
                      fontWeight: 500,
                      color: INK,
                    }}
                  >
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent
                    className="pb-5 text-[15px] leading-[1.7]"
                    style={{ color: MUTED }}
                  >
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* === Final CTA === */}
        <section
          className="border-t"
          style={{ borderColor: RULE, background: "#F2EDE3" }}
        >
          <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
            <h2
              className="mx-auto max-w-2xl leading-[1.02] tracking-[-0.02em]"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(2rem, 5vw, 3.4rem)",
                fontWeight: 400,
              }}
            >
              Vill ni se vad som är möjligt?
            </h2>
            <p
              className="mx-auto mt-5 max-w-md text-[1.0625rem] leading-[1.6]"
              style={{ color: MUTED }}
            >
              Tre minuters formulär. Sen vet ni.
            </p>
            <div className="mt-10">
              <Link
                to="/ai-karta/start"
                className="inline-flex items-center justify-center rounded-full px-8 py-4 text-[15px] font-medium transition hover:opacity-90"
                style={{ background: ACCENT, color: BG }}
              >
                Skapa min karta →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* === Minimal footer === */}
      <footer
        className="border-t"
        style={{ borderColor: RULE }}
      >
        <div
          className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-6 py-10 text-[13px] sm:flex-row sm:items-center sm:justify-between"
          style={{ color: MUTED }}
        >
          <p>
            Aurora Media AB · Org.nr 559272-0220 · Linköping
          </p>
          <Link
            to="/integritetspolicy"
            className="underline-offset-4 hover:underline"
            style={{ color: MUTED }}
          >
            Integritetspolicy
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default AiKarta;
