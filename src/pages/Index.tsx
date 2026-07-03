import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { SEO } from "@/components/SEO";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";

const heroImg = "/portfolio/aurora-transport.webp";
const STACK = [
  "React", "TypeScript", "Supabase", "Stripe", "Fortnox", "OpenAI", "Vercel", "PostgreSQL",
];

const useStockholmTime = () => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return time.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
  });
};

const TRUST = [
  "Interna system som ersätter manuellt arbete",
  "AI och automation där det ger affärsnytta",
  "Fast scope, snabb leverans och kod ni äger",
];

const OUTCOMES = [
  {
    n: "01",
    title: "Mindre administration",
    desc: "Koppla ihop mejl, formulär, dokument, kunddata och ekonomi så att informationen inte behöver registreras flera gånger.",
  },
  {
    n: "02",
    title: "Ett system som passar er",
    desc: "Ersätt kalkylblad, lösa listor och omvägar med ett internt verktyg byggt efter hur verksamheten faktiskt arbetar.",
  },
  {
    n: "03",
    title: "Snabbare väg till marknaden",
    desc: "Lansera en prototyp, MVP eller SaaS utan ett halvår av möten och dokument som aldrig blir en fungerande produkt.",
  },
  {
    n: "04",
    title: "Integrationer utan dubbelarbete",
    desc: "Koppla exempelvis Fortnox, Visma, Stripe, Supabase och era befintliga API:er till ett sammanhängande flöde.",
  },
];

const PROCESS = [
  {
    n: "01",
    label: "Kartläggning",
    title: "Vi hittar flaskhalsen",
    desc: "Vi går igenom arbetsflödet, systemen och det manuella arbete som kostar mest tid eller skapar flest fel.",
  },
  {
    n: "02",
    label: "Första veckan",
    title: "Ni får något att testa",
    desc: "Vi bygger en klickbar eller fungerande första version tidigt, så att beslut tas utifrån produkten och inte en presentation.",
  },
  {
    n: "03",
    label: "Leverans",
    title: "Systemet sätts i drift",
    desc: "Vi testar, integrerar, dokumenterar och lämnar över koden. Ni kan fortsätta med oss eller driva lösningen vidare själva.",
  },
];

const PROJECTS = [
  {
    title: "Aurora Transport",
    desc: "Dispatch- och fakturasystem för åkerier med schemaläggning, körorder och ekonomiflöden.",
    meta: "SaaS · Fortnox · Stripe",
    href: "/arbete/aurora-transport",
    thumb: "/portfolio/aurora-transport.webp",
    status: "Live",
  },
  {
    title: "Hönsgården",
    desc: "Freemium-app med statistik, abonnemang och AI-stöd för svenska hönsägare.",
    meta: "App · AI · Supabase",
    href: "/arbete/honsgarden",
    thumb: "/portfolio/honsgarden.webp",
    status: "Live",
  },
  {
    title: "Bergs Slussar Glamping",
    desc: "Digital bokning, gästkommunikation och försäljning av tillval för en lokal besöksverksamhet vid Göta kanal.",
    meta: "Linköping · Bokningsflöde",
    href: "/arbete/goglamping-sweden",
    thumb: "/portfolio/goglamping-sweden.webp",
    status: "Live",
  },
];

const PACKAGES = [
  {
    n: "01",
    name: "Prototyp",
    desc: "För att testa flödet, användarupplevelsen och affärsidén innan en större investering.",
    items: ["Klickbar första version", "Tydligt avgränsat use case", "Leverans på några dagar"],
  },
  {
    n: "02",
    name: "MVP",
    desc: "En första fungerande produkt med databas, användare och den viktigaste integrationen.",
    items: ["Lanseringsklar kärnfunktion", "Auth och databas", "Kod ni äger"],
    featured: true,
  },
  {
    n: "03",
    name: "Skräddarsytt system",
    desc: "För företag som behöver automatisera processer eller bygga en intern plattform.",
    items: ["Anpassad arkitektur", "Integrationer och rollstyrning", "Långsiktig utveckling"],
  },
];

const Hero = () => {
  const { open } = useContactModal();
  const time = useStockholmTime();

  return (
    <section id="top" className="hero lumina-hero">
      <div className="wrap hero-content">
        <div className="hero-text">
          <Reveal>
            <p className="mono">aurora media · ai-driven mjukvarupartner · linköping</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, maxWidth: "17ch" }}>
              Manuellt arbete in. <span className="it">Ett smartare system ut.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24, maxWidth: "62ch" }}>
              Vi bygger AI-lösningar, interna system, appar och SaaS för svenska företag som vill arbeta
              snabbare utan att fastna i fler verktyg, fler kalkylblad och mer administration.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="hero-trust">
              {TRUST.map((item) => (
                <div key={item} className="trust-item">
                  <Check size={14} className="ic" strokeWidth={2.5} /> {item}
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 24 }}>
              <button onClick={() => open()} className="btn btn-moss">
                Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
              </button>
              <Link to="/arbete" className="btn btn-ghost">
                Se fungerande projekt <span className="a"><ArrowUpRight size={14} /></span>
              </Link>
              <span className="clock" style={{ marginLeft: 4 }}>Linköping · {time}</span>
            </div>
          </Reveal>
          <Reveal delay={0.45}>
            <div style={{ marginTop: 14 }}>
              <span className="risk-note">30 min · Kostnadsfritt · Ingen säljpitch efteråt</span>
            </div>
          </Reveal>
        </div>

        <div className="hero-figure-wrap">
          <Reveal delay={0.15}>
            <div className="hero-figure">
              <img
                src={heroImg}
                alt="Aurora Transport – dispatch- och fakturasystem byggt av Aurora Media"
                width={1024}
                height={1280}
                fetchPriority="high"
              />
              <div className="hero-figure-overlay" />
              <span className="hero-figure-tag">Aurora Transport · Live</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const StackStripSection = () => (
  <section className="section" style={{ paddingTop: "clamp(28px,4vw,48px)", paddingBottom: "clamp(28px,4vw,48px)" }}>
    <div className="wrap" style={{ display: "grid", gap: "clamp(18px,2.4vw,28px)", gridTemplateColumns: "1fr", alignItems: "center" }}>
      <Reveal>
        <div className="meta-label">Byggd med verktyg som skalar</div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="stack-strip">
          {STACK.map((s) => (
            <span key={s} className="stack-chip"><span className="dot" /> {s}</span>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

const OutcomesSection = () => (
  <section className="section" id="resultat">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Vad vi förändrar</div></Reveal>
        <Reveal delay={0.1}>
          <div>
            <h2 className="h2">Tekniken är inte målet. <span className="it">Ett bättre arbetsflöde är.</span></h2>
            <p className="lead" style={{ marginTop: 22, maxWidth: "64ch" }}>
              Vi börjar i det som tar tid, skapar fel eller hindrar tillväxt. Därefter bygger vi den minsta
              lösningen som ger verklig effekt.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="work-grid">
        {OUTCOMES.map((item, index) => (
          <Reveal key={item.n} delay={index * 0.05}>
            <article className="work-card" style={{ height: "100%" }}>
              <div className="meta-label">{item.n}</div>
              <h3 style={{ marginTop: 18 }}>{item.title}</h3>
              <p className="body" style={{ marginTop: 12 }}>{item.desc}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const ProcessSection = () => (
  <section className="section" id="process">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Arbetssätt</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2">Från flaskhals till fungerande lösning <span className="it">utan onödiga omvägar.</span></h2>
        </Reveal>
      </div>
      <div className="timeline">
        {PROCESS.map((step, index) => (
          <Reveal key={step.n} delay={index * 0.08}>
            <div className="tl-step">
              <span className="tl-num">{step.n}</span>
              <span className="tl-day">{step.label}</span>
              <h3 className="tl-title">{step.title}</h3>
              <p className="body">{step.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const WorkSection = () => (
  <section className="section" id="arbete">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Utvalda projekt</div></Reveal>
        <Reveal delay={0.1}>
          <div>
            <h2 className="h2">Inte bara idéer. <span className="it">Produkter som går att använda.</span></h2>
            <p className="lead" style={{ marginTop: 22, maxWidth: "62ch" }}>
              Aurora Media bygger och driver egna produkter parallellt med kunduppdrag. Det gör att våra beslut
              prövas mot riktiga användare, drift, betalningar och support.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="work-grid">
        {PROJECTS.map((project) => (
          <Link to={project.href} key={project.title} className="work-card">
            <h3>{project.title}</h3>
            <p className="body">{project.desc}</p>
            <div className="meta" style={{ marginTop: 18 }}>{project.meta}</div>
            <div className="url" style={{ marginTop: 14 }}>Läs projektet →</div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 36 }}>
        <Link to="/arbete" className="btn btn-ghost">
          Se alla projekt <span className="a"><ArrowRight size={14} /></span>
        </Link>
      </div>
    </div>
  </section>
);

const PackagesSection = () => {
  const { open } = useContactModal();

  return (
    <section className="section" id="upplagg">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="meta-label">Upplägg</div></Reveal>
          <Reveal delay={0.1}>
            <div>
              <h2 className="h2">Börja så litet som behövs. <span className="it">Bygg vidare när det fungerar.</span></h2>
              <p className="lead" style={{ marginTop: 22, maxWidth: "62ch" }}>
                Ni får ett tydligt scope, en konkret leverans och full insyn. Inga långa förstudier som slutar i
                ännu ett dokument.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="price-grid">
          {PACKAGES.map((pack) => (
            <Reveal key={pack.n}>
              <div className={`price-card ${pack.featured ? "featured" : ""}`}>
                {pack.featured && <span className="price-tag">Vanlig start</span>}
                <span className="price-num">{pack.n}</span>
                <h3>{pack.name}</h3>
                <p className="body">{pack.desc}</p>
                <ul className="price-list">
                  {pack.items.map((item) => (
                    <li key={item}><Check size={14} strokeWidth={2.5} /> {item}</li>
                  ))}
                </ul>
                <button onClick={() => open()} className={`btn ${pack.featured ? "btn-moss" : "btn-ghost"}`}>
                  Diskutera upplägget <span className="a"><ArrowRight size={14} /></span>
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const LocalSection = () => (
  <section className="section" aria-labelledby="local-ai-heading">
    <div className="wrap">
      <div
        style={{
          border: "1px solid var(--hair)",
          borderRadius: 12,
          padding: "clamp(28px,5vw,64px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "clamp(28px,5vw,72px)",
          alignItems: "center",
        }}
      >
        <div>
          <Reveal><div className="meta-label">Lokal AI-partner</div></Reveal>
          <Reveal delay={0.1}>
            <h2 id="local-ai-heading" className="h2" style={{ marginTop: 18 }}>
              Söker ni en <span className="it">AI-konsult i Linköping?</span>
            </h2>
          </Reveal>
        </div>
        <div>
          <Reveal delay={0.15}>
            <p className="lead">
              Vår lokala sida samlar konkreta exempel på AI-automation, interna system, integrationer och hur ett
              samarbete med företag i Linköping går till.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Link to="/ai-byra-linkoping" className="btn btn-moss">
                AI-konsult i Linköping <span className="a"><ArrowRight size={14} /></span>
              </Link>
              <Link to="/ai-karta" className="btn btn-ghost">
                Gör kostnadsfri AI-kartläggning
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

const CTA = () => {
  const { open } = useContactModal();

  return (
    <section id="kontakt" className="cta-band">
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <Reveal><div className="meta-label">Nästa steg</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2" style={{ marginTop: 18, maxWidth: "21ch" }}>
            Visa oss processen ni är trötta på att göra <span className="it">manuellt.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="lead" style={{ marginTop: 22, maxWidth: "60ch" }}>
            Ni får en rak bedömning av vad som går att förbättra, vad som inte behöver AI och vilket första steg
            som är rimligt.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div style={{ marginTop: 34, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
            <button onClick={() => open()} className="btn btn-moss">
              Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
            </button>
            <a href="mailto:info@auroramedia.se" className="cta-email">info@auroramedia.se →</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Index = () => (
  <>
    <SEO
      title="Aurora Media AB | AI-driven mjukvarupartner för svenska företag"
      description="Aurora Media bygger AI-lösningar, interna system, appar och SaaS för svenska företag. Snabb leverans, tydligt scope och kod ni äger."
      canonical="/"
    />
    <NordicLayout>
      <Hero />
      <OutcomesSection />
      <ProcessSection />
      <WorkSection />
      <PackagesSection />
      <LocalSection />
      <CTA />
    </NordicLayout>
  </>
);

export default Index;
