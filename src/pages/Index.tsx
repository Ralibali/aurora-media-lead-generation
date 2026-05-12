import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta, setJsonLd, setHreflang, organizationSchema, websiteSchema, serviceSchema } from "@/lib/seoHelpers";

// ─── Shared primitives ───────────────────────────────────────────────────────

const BORDER = "rgba(237, 233, 220, 0.15)";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="eyebrow mb-3">{children}</p>
);

const SectionBorder = () => (
  <div style={{ height: "0.5px", backgroundColor: BORDER }} />
);

// ─── Section: Hero ───────────────────────────────────────────────────────────

const Hero = () => (
  <section id="top" className="section-pad pt-[120px]">
    <div className="site-container">
      <p className="eyebrow mb-6">AI-byrå · Linköping · sedan 2021</p>

      <h1 className="hero-h1 text-cream max-w-[640px]">
        Vi pratar inte AI.
        <br />
        Vi <em>bygger</em> med det.
      </h1>

      <p
        className="mt-6 max-w-[480px] font-sans text-[14px] leading-relaxed"
        style={{ color: "rgba(237, 233, 220, 0.65)" }}
      >
        Snabb SaaS för svenska företag. SaaS-produkter, MVP:er och interna system levererade
        på veckor istället för månader. Från 14 900 kr.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          to="/kontakt"
          className="inline-flex items-center justify-center rounded-lg px-[18px] py-[10px] font-sans text-[13px] font-medium transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#EDE9DC", color: "#100F0D" }}
        >
          Begär offert →
        </Link>
        <Link
          to="/kontakt"
          className="inline-flex items-center justify-center rounded-lg border px-[18px] py-[10px] font-sans text-[13px] transition-all hover:opacity-85"
          style={{
            borderWidth: "0.5px",
            borderColor: "rgba(237, 233, 220, 0.30)",
            color: "#EDE9DC",
          }}
        >
          Boka 30 min
        </Link>
      </div>

      {/* Client strip */}
      <div
        className="mt-12 border-y py-4"
        style={{ borderColor: BORDER, borderWidth: "0.5px" }}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="eyebrow mr-2">Bygger för</span>
          <span className="font-serif text-[16px]" style={{ color: "rgba(237, 233, 220, 0.80)" }}>
            åkerier · vårdkliniker · friskvårdsstudios ·{" "}
            <em>m.fl. svenska tjänsteföretag</em>
          </span>
        </div>
      </div>
    </div>
  </section>
);

// ─── Section 01: Egna produkter ──────────────────────────────────────────────

const PRODUCTS = [
  { num: "01", name: "Hönsgården", desc: "Skötsel av hönsflocken — mobilapp", meta: "honsgarden.se" },
  { num: "02", name: "AgilityManager", desc: "Träningslogg och kursplaner för hundsporten", meta: "agilitymanager.se" },
  { num: "03", name: "Aurora Transport", desc: "TMS för svenska åkerier — multi-tenant", meta: "auroratransport.se" },
  { num: "04", name: "Updro", desc: "Marknadsplats för svenska byråer", meta: "updro.se" },
  { num: "05", name: "Odlingsdagboken", desc: "Köksträdgården med AI-coach Gro", meta: "odlingsdagboken.com" },
  { num: "06", name: "GoGlamping", desc: "Bokning och boende vid Göta kanal", meta: "goglamping.se" },
];

const Products = () => (
  <section id="produkter" className="section-pad">
    <SectionBorder />
    <div className="site-container pt-14 sm:pt-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow>01 — Egna produkter</Eyebrow>
          <h2 className="section-h2 text-cream">
            Sex produkter. <em>I drift idag.</em>
          </h2>
        </div>
        <p
          className="hidden font-sans text-[13px] sm:block"
          style={{ color: "rgba(237, 233, 220, 0.50)" }}
        >
          Inte case studies.
        </p>
      </div>

      <div className="mt-8">
        {PRODUCTS.map((p, i) => (
          <div
            key={p.num}
            className="grid items-center gap-4 py-4"
            style={{
              gridTemplateColumns: "32px 1fr 1fr auto",
              borderBottom: i < PRODUCTS.length - 1 ? `0.5px solid ${BORDER}` : "none",
            }}
          >
            <span className="mono-accent" style={{ color: "rgba(237, 233, 220, 0.40)" }}>
              {p.num}
            </span>
            <span className="font-sans text-[14px] font-medium text-cream">{p.name}</span>
            <span
              className="hidden font-sans text-[13px] sm:block"
              style={{ color: "rgba(237, 233, 220, 0.60)" }}
            >
              {p.desc}
            </span>
            <a
              href={`https://${p.meta}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mono-accent transition-opacity hover:opacity-70 whitespace-nowrap"
              style={{ color: "rgba(237, 233, 220, 0.50)" }}
            >
              {p.meta} ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Testimonial ─────────────────────────────────────────────────────────────

const Testimonial = () => (
  <section className="section-pad">
    <SectionBorder />
    <div className="site-container pt-14">
      <p className="eyebrow mb-6 text-center">Vad kunder säger</p>
      <blockquote className="mx-auto max-w-[560px] text-center">
        <p className="testimonial-text text-cream">
          "Aurora levererade vårt TMS på fyra veckor — något två andra byråer sa var{" "}
          <em>omöjligt</em>."
        </p>
        <footer className="mt-6">
          <p className="font-sans text-[14px] text-cream-80">Daniel, CJ Bemanning AB</p>
          <p className="mono-accent mt-1" style={{ color: "rgba(237, 233, 220, 0.30)" }}>
            [platshållare — byts mot verifierat citat]
          </p>
        </footer>
      </blockquote>
    </div>
  </section>
);

// ─── Section 02: Tjänster ────────────────────────────────────────────────────

const SERVICES = [
  {
    num: "01",
    name: "SaaS-produkt",
    price: "från 14 900 kr",
    desc: "Från MVP till lansering. Auth, betalning, e-post och admin från dag ett.",
  },
  {
    num: "02",
    name: "Hemsida",
    price: "pris på offert",
    desc: "Modern, snabb och SEO-optimerad. CMS som ni faktiskt vill använda.",
  },
  {
    num: "03",
    name: "Internt system",
    price: "pris på offert",
    desc: "Admin-paneler, dashboards och flöden som ersätter era Excel-arkiv.",
  },
  {
    num: "04",
    name: "AI-integration",
    price: "pris på offert",
    desc: "Språkmodeller, agenter och automatiseringar in i era befintliga system.",
  },
];

const Services = () => (
  <section id="tjanster" className="section-pad">
    <SectionBorder />
    <div className="site-container pt-14">
      <Eyebrow>02 — Tjänster</Eyebrow>
      <h2 className="section-h2 text-cream">
        Vi bygger fyra saker. <em>Snabbt.</em>
      </h2>
      <p
        className="mt-3 max-w-[460px] font-sans text-[14px] leading-relaxed"
        style={{ color: "rgba(237, 233, 220, 0.65)" }}
      >
        Samma metodik som på våra egna produkter — moderna AI-verktyg, fast pris och fast deadline.
        Levereras på veckor.
      </p>

      <div
        className="mt-8 grid grid-cols-1 sm:grid-cols-2"
        style={{ border: `0.5px solid ${BORDER}` }}
      >
        {SERVICES.map((s, i) => (
          <div
            key={s.num}
            className="p-6 transition-colors"
            style={{
              borderRight: i % 2 === 0 ? `0.5px solid ${BORDER}` : "none",
              borderBottom: i < 2 ? `0.5px solid ${BORDER}` : "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(237, 233, 220, 0.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <div className="flex items-start justify-between">
              <span className="mono-accent" style={{ color: "rgba(237, 233, 220, 0.40)" }}>
                {s.num}
              </span>
              <span className="mono-accent" style={{ color: "rgba(237, 233, 220, 0.50)" }}>
                {s.price}
              </span>
            </div>
            <p className="mt-4 font-sans text-[15px] font-medium text-cream">{s.name}</p>
            <p
              className="mt-2 font-sans text-[13px] leading-relaxed"
              style={{ color: "rgba(237, 233, 220, 0.60)" }}
            >
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mt-8 flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center"
        style={{ borderColor: BORDER, borderWidth: "0.5px" }}
      >
        <div>
          <p className="font-sans text-[14px] text-cream">Har ni en idé eller en process som suger?</p>
          <p
            className="mt-1 font-sans text-[13px]"
            style={{ color: "rgba(237, 233, 220, 0.65)" }}
          >
            Skicka över den — vi återkommer med offert inom 24 timmar.
          </p>
        </div>
        <Link
          to="/kontakt"
          className="shrink-0 inline-flex items-center rounded-lg px-[18px] py-[10px] font-sans text-[13px] font-medium transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#EDE9DC", color: "#100F0D" }}
        >
          Begär offert →
        </Link>
      </div>
    </div>
  </section>
);

// ─── Section 03: Process ─────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    name: "Samtal",
    desc: "Ni berättar om problemet eller idén. Vi säger ja eller nej och varför.",
    meta: "30 min",
  },
  {
    num: "02",
    name: "Offert",
    desc: "Skriftligt förslag med fast pris, fast omfattning och fast deadline.",
    meta: "inom 24h",
  },
  {
    num: "03",
    name: "Bygge",
    desc: "Ni har tillgång till live-versionen från dag ett och kan följa varje deploy. Avstämning varje vecka.",
    meta: "1–6 veckor",
  },
  {
    num: "04",
    name: "Lansering",
    desc: "Domän, repo, dokumentation och drift överlämnas — eller så kör vi vidare på supportavtal.",
    meta: "1 dag",
  },
];

const Process = () => (
  <section id="process" className="section-pad">
    <SectionBorder />
    <div className="site-container pt-14">
      <Eyebrow>03 — Process</Eyebrow>
      <h2 className="section-h2 text-cream">
        Från första samtal till live <em>på fyra veckor.</em>
      </h2>
      <p
        className="mt-3 max-w-[460px] font-sans text-[14px] leading-relaxed"
        style={{ color: "rgba(237, 233, 220, 0.65)" }}
      >
        Vi använder moderna AI-verktyg som accelererar varje del av processen. Ni betalar för
        bygget — inte för att vi lär oss nya ramverk för varje projekt.
      </p>

      <div className="mt-8">
        {STEPS.map((s, i) => (
          <div
            key={s.num}
            className="grid items-start gap-4 py-5"
            style={{
              gridTemplateColumns: "32px 1fr 1.5fr auto",
              borderBottom: i < STEPS.length - 1 ? `0.5px solid ${BORDER}` : "none",
            }}
          >
            <span className="mono-accent pt-0.5" style={{ color: "rgba(237, 233, 220, 0.40)" }}>
              {s.num}
            </span>
            <span className="font-sans text-[14px] font-medium text-cream">{s.name}</span>
            <span
              className="hidden font-sans text-[13px] leading-relaxed sm:block"
              style={{ color: "rgba(237, 233, 220, 0.60)" }}
            >
              {s.desc}
            </span>
            <span
              className="mono-accent whitespace-nowrap text-right"
              style={{ color: "rgba(237, 233, 220, 0.50)" }}
            >
              {s.meta}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Section 04: Om aurora ───────────────────────────────────────────────────

const About = () => (
  <section id="om" className="section-pad">
    <SectionBorder />
    <div className="site-container pt-14">
      <Eyebrow>04 — Om aurora</Eyebrow>
      <h2 className="section-h2 text-cream">
        Aurora är en person. <em>Det är en feature.</em>
      </h2>

      <div className="mt-8 grid gap-10 sm:grid-cols-[1fr_1.4fr]">
        {/* Left */}
        <div>
          <div
            className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full"
            style={{ border: `0.5px solid ${BORDER}` }}
          >
            <span className="font-serif text-[28px] text-cream">C</span>
          </div>
          <p className="font-sans text-[14px] font-medium text-cream">Christoffer Holstensson</p>
          <p
            className="font-sans text-[13px]"
            style={{ color: "rgba(237, 233, 220, 0.65)" }}
          >
            Grundare och utvecklare
          </p>

          <table className="mt-5 w-full">
            <tbody>
              {[
                ["Bas", "Linköping"],
                ["Sedan", "2021"],
                ["Specialitet", "SaaS, AI, system"],
                ["Egna produkter", "6 i drift"],
              ].map(([k, v]) => (
                <tr
                  key={k}
                  className="border-b"
                  style={{ borderColor: BORDER, borderWidth: "0.5px" }}
                >
                  <td
                    className="py-2 font-sans text-[12px]"
                    style={{ color: "rgba(237, 233, 220, 0.50)" }}
                  >
                    {k}
                  </td>
                  <td className="py-2 font-sans text-[12px] text-right text-cream">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-5 flex gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[13px] transition-opacity hover:opacity-70"
              style={{ color: "rgba(237, 233, 220, 0.65)" }}
            >
              LinkedIn ↗
            </a>
            <a
              href="https://github.com/ralibali"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[13px] transition-opacity hover:opacity-70"
              style={{ color: "rgba(237, 233, 220, 0.65)" }}
            >
              GitHub: ralibali ↗
            </a>
          </div>
        </div>

        {/* Right */}
        <div
          className="space-y-4 font-sans text-[14px] leading-[1.7]"
          style={{ color: "rgba(237, 233, 220, 0.80)" }}
        >
          <p>
            De flesta byråer skickar runt projekt mellan projektledare, designers, utvecklare och
            konsulter. Något försvinner i varje överlämning.
          </p>
          <p>
            Aurora Media är annorlunda byggt: en person bygger hela vägen, från första skissen till
            driftsatt produkt. Det är därför vi kan leverera på veckor istället för månader — och
            det är därför ni alltid pratar med personen som faktiskt kodar.
          </p>
          <p>
            När projektet växer förbi vad en person rimligen klarar säger vi det rakt ut. Då tar vi
            in externa specialister med ert godkännande — eller så hänvisar vi vidare.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// ─── Stats strip ─────────────────────────────────────────────────────────────

const STATS = [
  { num: "6", label: "Egna SaaS i drift" },
  { num: "4 år", label: "Aktiv verksamhet sedan 2021" },
  { num: "EU", label: "All data stannar inom EU, GDPR-anpassat" },
  { num: "100%", label: "Källkod och drift går till er" },
];

const StatsStrip = () => (
  <section className="section-pad">
    <div
      className="border-y"
      style={{ borderColor: BORDER, borderWidth: "0.5px" }}
    >
      <div className="site-container py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.num}>
              <p className="stat-numeral text-cream">{s.num}</p>
              <p
                className="mt-1 font-sans text-[11px] leading-[1.4]"
                style={{ color: "rgba(237, 233, 220, 0.55)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const Index = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Aurora Media — AI-byrå i Linköping | SaaS, MVP och interna system",
      description:
        "Vi pratar inte AI. Vi bygger med det. SaaS-produkter, MVP:er och interna system levererade på veckor istället för månader. Från 14 900 kr.",
      canonical: "/",
      ogImage: "/og-image-sv.jpg",
      ogType: "website",
      ogLocale: "sv_SE",
      keywords:
        "AI-byrå, SaaS-utveckling, MVP, interna system, Linköping, Aurora Media, AI-integration",
    });
    setHreflang("/", "/en");
    setJsonLd("organization-jsonld", organizationSchema);
    setJsonLd("website-jsonld", websiteSchema);
    setJsonLd("service-jsonld", serviceSchema);

    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prev = themeMeta?.getAttribute("content") ?? null;
    if (themeMeta) themeMeta.setAttribute("content", "#100F0D");
    return () => {
      if (prev !== null && themeMeta) themeMeta.setAttribute("content", prev);
    };
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">
        Hoppa till innehåll
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Products />
        <Testimonial />
        <Services />
        <Process />
        <About />
        <StatsStrip />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
