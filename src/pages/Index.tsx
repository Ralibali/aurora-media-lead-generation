import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import {
  setSEOMeta, setJsonLd, setHreflang,
  organizationSchema, websiteSchema, serviceSchema,
} from "@/lib/seoHelpers";

/* ── shared ──────────────────────────────────────────────────────────────── */
const RULE = { height: "0.5px", background: "rgba(237,233,220,0.12)" } as const;

function Rule() { return <div style={RULE} />; }

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "'JetBrains Mono',ui-monospace,monospace",
      fontSize: 11, letterSpacing: "0.1em",
      color: "rgba(237,233,220,0.40)",
      marginBottom: 20,
      textTransform: "lowercase",
    }}>
      {children}
    </p>
  );
}

/* ── counter animation ───────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round(t * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

/* ── 01 HERO ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
      <div className="wrap">

        {/* eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          borderBottom: "0.5px solid rgba(237,233,220,0.15)",
          paddingBottom: 10, marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EDE9DC", display: "block", flexShrink: 0 }} />
          <span style={{
            fontFamily: "'JetBrains Mono',ui-monospace,monospace",
            fontSize: 11, letterSpacing: "0.1em",
            color: "rgba(237,233,220,0.45)",
          }}>
            AI-byrå · Linköping · sedan 2021
          </span>
        </div>

        {/* headline */}
        <h1
          className="anim-fade-up t-display c-cream"
          style={{ maxWidth: 780, marginBottom: 28 }}
        >
          Vi pratar inte AI.
          <br />
          Vi <em>bygger</em> med det.
        </h1>

        {/* sub */}
        <p
          className="anim-fade-up anim-delay-1 t-body"
          style={{ maxWidth: 480, color: "rgba(237,233,220,0.60)", marginBottom: 40 }}
        >
          SaaS-produkter, MVP:er och interna system levererade på veckor
          istället för månader. Sex egna produkter i drift. Från 14 900 kr.
        </p>

        {/* ctas */}
        <div className="anim-fade-up anim-delay-2" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
          <Link to="/process" className="btn-ghost">Hur vi jobbar</Link>
        </div>

        {/* client strip */}
        <div style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: "0.5px solid rgba(237,233,220,0.10)",
          display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono',ui-monospace,monospace",
            fontSize: 11, color: "rgba(237,233,220,0.35)", letterSpacing: "0.08em",
          }}>
            bygger för
          </span>
          <span style={{
            fontFamily: "'Instrument Serif',Georgia,serif",
            fontSize: "clamp(15px,2vw,18px)",
            color: "rgba(237,233,220,0.65)",
            fontStyle: "italic",
          }}>
            åkerier · vårdkliniker · friskvårdsstudios · m.fl. svenska tjänsteföretag
          </span>
        </div>
      </div>
    </section>
  );
}

/* ── 02 PRODUCTS ─────────────────────────────────────────────────────────── */
const PRODUCTS = [
  { name: "Hönsgården",     desc: "Mobilapp för hönshållning",               url: "honsgarden.se" },
  { name: "AgilityManager", desc: "Träningslogg för hundsporten",             url: "agilitymanager.se" },
  { name: "Aurora Transport",desc: "TMS för svenska åkerier",                 url: "auroratransport.se" },
  { name: "Updro",          desc: "Marknadsplats för svenska byråer",         url: "updro.se" },
  { name: "Odlingsdagboken",desc: "Köksträdgård med AI-coach Gro",            url: "odlingsdagboken.com" },
  { name: "GoGlamping",     desc: "Bokning vid Göta kanal",                   url: "goglamping.se" },
];

function Products() {
  return (
    <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
      <Rule />
      <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, gap: 16, flexWrap: "wrap" }}>
          <div>
            <Label>01 — egna produkter</Label>
            <h2 className="t-h2 c-cream">
              Sex produkter. <em>I drift idag.</em>
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "rgba(237,233,220,0.35)", fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>
            Inte case studies.
          </p>
        </div>

        {PRODUCTS.map((p, i) => (
          <a
            key={p.name}
            href={`https://${p.url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr 1fr auto",
              alignItems: "center",
              gap: "12px 24px",
              padding: "18px 0",
              borderBottom: "0.5px solid rgba(237,233,220,0.08)",
              textDecoration: "none",
              transition: "background 0.15s",
              marginInline: "-12px",
              paddingInline: "12px",
              borderRadius: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,233,220,0.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.30)" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 14, fontWeight: 500, color: "#EDE9DC" }}>
              {p.name}
            </span>
            <span style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 13, color: "rgba(237,233,220,0.50)" }} className="hidden sm:block">
              {p.desc}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 11, color: "rgba(237,233,220,0.35)", whiteSpace: "nowrap" }}>
              {p.url} ↗
            </span>
          </a>
        ))}

        <div style={{ marginTop: 32 }}>
          <Link to="/produkter" style={{ fontSize: 13, color: "rgba(237,233,220,0.45)", fontFamily: "'Inter',system-ui,sans-serif", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EDE9DC")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.45)")}>
            Läs mer om produkterna →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 03 TESTIMONIAL ──────────────────────────────────────────────────────── */
function Testimonial() {
  return (
    <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
      <Rule />
      <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
        <div style={{ maxWidth: 680, marginInline: "auto", textAlign: "center" }}>
          <p className="t-quote c-cream" style={{ marginBottom: 32 }}>
            "Aurora levererade vårt TMS på fyra veckor — något två andra byråer sa var omöjligt."
          </p>
          <p style={{ fontSize: 13, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif" }}>
            Daniel, CJ Bemanning AB
          </p>
          <p style={{ marginTop: 6, fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.25)", letterSpacing: "0.06em" }}>
            [verifieras innan launch]
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── 04 SERVICES ─────────────────────────────────────────────────────────── */
const SERVICES = [
  { num: "01", name: "SaaS-produkt",   price: "från 14 900 kr", desc: "Från MVP till lansering. Auth, betalning, e-post och admin från dag ett. Samma stack som våra egna produkter." },
  { num: "02", name: "Hemsida",        price: "pris på offert", desc: "Modern, snabb och SEO-optimerad. CMS ni faktiskt vill använda. Byggt på grund ni äger." },
  { num: "03", name: "Internt system", price: "pris på offert", desc: "Admin-paneler, dashboards och flöden som ersätter era Excel-ark." },
  { num: "04", name: "AI-integration", price: "pris på offert", desc: "Språkmodeller, agenter och automatiseringar in i era befintliga system." },
];

function Services() {
  return (
    <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
      <Rule />
      <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>

        <div style={{ marginBottom: 40 }}>
          <Label>02 — tjänster</Label>
          <h2 className="t-h2 c-cream" style={{ marginBottom: 12 }}>
            Vi bygger fyra saker. <em>Snabbt.</em>
          </h2>
          <p className="t-body" style={{ maxWidth: 460, color: "rgba(237,233,220,0.55)" }}>
            Moderna AI-verktyg, fast pris, fast deadline. Levereras på veckor.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          border: "0.5px solid rgba(237,233,220,0.10)",
          borderRadius: 8,
          overflow: "hidden",
        }}>
          {SERVICES.map((s, i) => (
            <div
              key={s.num}
              style={{
                padding: "clamp(24px,3vw,36px)",
                borderRight: i % 2 === 0 ? "0.5px solid rgba(237,233,220,0.10)" : "none",
                borderBottom: i < 2 ? "0.5px solid rgba(237,233,220,0.10)" : "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,233,220,0.025)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.30)", letterSpacing: "0.06em" }}>{s.num}</span>
                <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.40)", letterSpacing: "0.04em" }}>{s.price}</span>
              </div>
              <p style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 20, color: "#EDE9DC", marginBottom: 10, lineHeight: 1.2 }}>{s.name}</p>
              <p style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 13, color: "rgba(237,233,220,0.55)", lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* inline CTA */}
        <div style={{
          marginTop: 32, padding: "24px 28px",
          border: "0.5px solid rgba(237,233,220,0.10)",
          borderRadius: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: 20, flexWrap: "wrap",
          background: "rgba(237,233,220,0.02)",
        }}>
          <div>
            <p style={{ fontSize: 14, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif", fontWeight: 500, marginBottom: 4 }}>
              Har ni en idé eller en process som suger?
            </p>
            <p style={{ fontSize: 13, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif" }}>
              Vi återkommer med offert inom 24 timmar.
            </p>
          </div>
          <Link to="/kontakt" className="btn-primary" style={{ flexShrink: 0 }}>Begär offert →</Link>
        </div>
      </div>
    </section>
  );
}

/* ── 05 PROCESS ──────────────────────────────────────────────────────────── */
const STEPS = [
  { n: "01", name: "Samtal",    t: "30 min",    desc: "Ni berättar. Vi säger ja eller nej och varför." },
  { n: "02", name: "Offert",    t: "< 24h",     desc: "Fast pris, fast scope, fast deadline — skriftligt." },
  { n: "03", name: "Bygge",     t: "1–6 veckor",desc: "Live-version från dag ett. Veckovisa stämningar." },
  { n: "04", name: "Lansering", t: "1 dag",     desc: "Repo, domän, docs överlämnas. Allt är ert." },
];

function ProcessSection() {
  return (
    <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
      <Rule />
      <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>

        <Label>03 — process</Label>
        <h2 className="t-h2 c-cream" style={{ marginBottom: 12 }}>
          Från samtal till live <em>på fyra veckor.</em>
        </h2>
        <p className="t-body" style={{ maxWidth: 460, color: "rgba(237,233,220,0.55)", marginBottom: 40 }}>
          Ni betalar för bygget — inte för att vi lär oss nya ramverk.
        </p>

        {STEPS.map((s, i) => (
          <div
            key={s.n}
            style={{
              display: "grid",
              gridTemplateColumns: "28px 160px 1fr auto",
              alignItems: "start",
              gap: "8px 28px",
              padding: "22px 0",
              borderBottom: "0.5px solid rgba(237,233,220,0.08)",
            }}
          >
            <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.28)", paddingTop: 2 }}>{s.n}</span>
            <span style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 14, fontWeight: 500, color: "#EDE9DC" }}>{s.name}</span>
            <span style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 13, color: "rgba(237,233,220,0.50)", lineHeight: 1.6 }} className="hidden sm:block">{s.desc}</span>
            <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 11, color: "rgba(237,233,220,0.35)", whiteSpace: "nowrap", textAlign: "right" }}>{s.t}</span>
          </div>
        ))}

        <div style={{ marginTop: 32 }}>
          <Link to="/process" style={{ fontSize: 13, color: "rgba(237,233,220,0.40)", fontFamily: "'Inter',system-ui,sans-serif", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EDE9DC")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.40)")}>
            Djupare om processen →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 06 ABOUT ────────────────────────────────────────────────────────────── */
function About() {
  return (
    <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
      <Rule />
      <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
        <Label>04 — om aurora</Label>
        <h2 className="t-h2 c-cream" style={{ marginBottom: 40 }}>
          Aurora är en person. <em>Det är en feature.</em>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "clamp(32px,5vw,64px)" }}
          className="sm:grid-cols-[240px_1fr]">

          {/* card */}
          <div>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              border: "0.5px solid rgba(237,233,220,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <span style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 28, color: "#EDE9DC", fontStyle: "italic" }}>C</span>
            </div>

            <p style={{ fontSize: 14, fontWeight: 500, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif" }}>Christoffer Holstensson</p>
            <p style={{ fontSize: 13, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif", marginTop: 2 }}>Grundare och utvecklare</p>

            <table style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}>
              {[["Bas","Linköping"],["Sedan","2021"],["Produkter","6 i drift"],["Specialitet","SaaS, AI, system"]].map(([k,v]) => (
                <tr key={k} style={{ borderBottom: "0.5px solid rgba(237,233,220,0.08)" }}>
                  <td style={{ padding: "8px 0", fontSize: 12, color: "rgba(237,233,220,0.40)", fontFamily: "'Inter',system-ui,sans-serif" }}>{k}</td>
                  <td style={{ padding: "8px 0", fontSize: 12, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif", textAlign: "right" }}>{v}</td>
                </tr>
              ))}
            </table>

            <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
              {[
                ["LinkedIn ↗", "https://linkedin.com"],
                ["GitHub ↗", "https://github.com/ralibali"],
              ].map(([label, href]) => (
                <a key={label as string} href={href as string} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "rgba(237,233,220,0.40)", fontFamily: "'Inter',system-ui,sans-serif", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EDE9DC")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.40)")}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* prose */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              "De flesta byråer skickar runt projekt mellan projektledare, designers, utvecklare och konsulter. Något försvinner i varje överlämning.",
              "Aurora Media är annorlunda byggt: en person bygger hela vägen, från första skissen till driftsatt produkt. Det är därför vi kan leverera på veckor istället för månader — och det är därför ni alltid pratar med personen som faktiskt kodar.",
              "När projektet växer förbi vad en person rimligen klarar säger vi det rakt ut. Då tar vi in externa specialister med ert godkännande — eller så hänvisar vi vidare.",
            ].map((p, i) => (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.8, color: i === 0 ? "rgba(237,233,220,0.70)" : i === 1 ? "rgba(237,233,220,0.80)" : "rgba(237,233,220,0.55)", fontFamily: "'Inter',system-ui,sans-serif" }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 07 STATS ────────────────────────────────────────────────────────────── */
const STATS = [
  { val: 6,    suffix: "",    label: "Egna SaaS i drift" },
  { val: 4,    suffix: " år", label: "Aktiv verksamhet" },
  { val: 100,  suffix: "%",   label: "Källkod och drift överlämnas" },
  { val: 24,   suffix: "h",   label: "Svarstid på offert" },
];

function StatNum({ val, suffix }: { val: number; suffix: string }) {
  const n = useCountUp(val);
  return (
    <span style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "clamp(36px,5vw,52px)", lineHeight: 1, color: "#EDE9DC", fontWeight: 400 }}>
      {n}{suffix}
    </span>
  );
}

function Stats() {
  return (
    <section style={{ paddingBlock: 0 }}>
      <div style={{ borderBlock: "0.5px solid rgba(237,233,220,0.10)" }}>
        <div className="wrap" style={{ paddingBlock: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "40px 32px" }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <StatNum val={s.val} suffix={s.suffix} />
                <p style={{ marginTop: 8, fontSize: 12, color: "rgba(237,233,220,0.40)", fontFamily: "'Inter',system-ui,sans-serif", lineHeight: 1.5 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── PAGE ────────────────────────────────────────────────────────────────── */
const Index = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Aurora Media — AI-byrå i Linköping | SaaS, MVP och interna system",
      description: "Vi pratar inte AI. Vi bygger med det. SaaS-produkter, MVP:er och interna system levererade på veckor. Från 14 900 kr.",
      canonical: "/", ogImage: "/og-image-sv.jpg", ogType: "website", ogLocale: "sv_SE",
      keywords: "AI-byrå, SaaS-utveckling, MVP, interna system, Linköping, Aurora Media",
    });
    setHreflang("/", "/en");
    setJsonLd("organization-jsonld", organizationSchema);
    setJsonLd("website-jsonld", websiteSchema);
    setJsonLd("service-jsonld", serviceSchema);
    const m = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prev = m?.getAttribute("content") ?? null;
    if (m) m.setAttribute("content", "#100F0D");
    return () => { if (prev && m) m.setAttribute("content", prev); };
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Products />
        <Testimonial />
        <Services />
        <ProcessSection />
        <About />
        <Stats />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
