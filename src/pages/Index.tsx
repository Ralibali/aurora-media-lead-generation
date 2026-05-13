import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { SEO } from "@/components/SEO";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import heroImg from "@/assets/aurora-hero-nordic.jpg";

/* ─────────────────────────────────────────────────────────────────────────
   AURORA MEDIA — AI-driven mjukvarubyrå (Linköping)
   Nordic Noir shell levereras av <NordicLayout />.
   ───────────────────────────────────────────────────────────────────────── */

const useStockholmTime = () => {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
  });
};

/* ───── Hero ───── */
const TRUST = [
  "SaaS, appar och digitala produkter",
  "AI, automation och effektivisering",
  "Byggt för affärsnytta och tillväxt",
];

const Hero = () => {
  const { open } = useContactModal();
  const time = useStockholmTime();
  return (
    <section id="top" className="hero">
      <div className="wrap hero-content">
        <div className="hero-text">
        <Reveal>
          <p className="mono">aurora media · ai-driven mjukvarubyrå · linköping</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="hero-line" style={{ marginTop: 4 }}>Idén finns.</h1>
        </Reveal>
        <Reveal delay={0.2}>
          <h1 className="hero-line" style={{ paddingLeft: "clamp(0px,4vw,56px)" }}>
            Vi <span className="it">bygger</span> systemet.
          </h1>
        </Reveal>
        <Reveal delay={0.35}>
          <p className="lead" style={{ marginTop: 18 }}>
            Aurora Media bygger SaaS, appar, AI-lösningar och skräddarsydda system för företag som vill växa
            snabbare, effektivisera arbetet och ersätta manuella rutiner med smarta digitala flöden.
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <div className="hero-trust">
            {TRUST.map((t) => (
              <div key={t} className="trust-item">
                <Check size={14} className="ic" strokeWidth={2.5} /> {t}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.55}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 24 }}>
            <button onClick={() => open()} className="btn btn-moss">
              Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
            </button>
            <Link to="/ai-automation-foretag" className="btn btn-ghost">
              AI &amp; effektivisering <span className="a"><ArrowUpRight size={14} /></span>
            </Link>
            <span className="clock" style={{ marginLeft: 4 }}>Linköping · {time}</span>
          </div>
        </Reveal>
        </div>
        <div className="hero-figure-wrap">
          <Reveal delay={0.15}>
            <div className="hero-figure">
              <img
                src={heroImg}
                alt="Dimmig svensk sjö i gryningen med skog och berg"
                width={1024}
                height={1280}
                fetchPriority="high"
              />
              <div className="hero-figure-overlay" />
              <span className="hero-figure-tag">Östergötland · Gryning</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ───── Aurora-metoden ───── */
const TIMELINE = [
  { n: "01", day: "Dag 1", title: "Kostnadsfri rådgivning", desc: "Vi kartlägger affärsmål, system och flaskhalsar." },
  { n: "02", day: "Dag 2–7", title: "Prototyp & arkitektur", desc: "Du ser en klickbar version av lösningen." },
  { n: "03", day: "Vecka 2–4", title: "Lansering", desc: "Vi bygger, integrerar och driftsätter." },
];

const MetodSection = () => (
  <section className="section" id="metoden">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Aurora-metoden</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2"><span className="it">"Från idé</span> till lansering på under fyra veckor."</h2>
        </Reveal>
      </div>
      <div className="timeline">
        {TIMELINE.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08}>
            <div className="tl-step">
              <span className="tl-num">{s.n}</span>
              <span className="tl-day">{s.day}</span>
              <h3 className="tl-title">{s.title}</h3>
              <p className="body">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ───── Tjänster ───── */
const SERVICES = [
  { n: "01", title: "System", tag: "Affärssystem som växer med er.", desc: "Robusta affärssystem som växer med er — byggda i modern stack." },
  { n: "02", title: "Integrationer", tag: "Fortnox, Visma, Stripe & mer.", desc: "Sömlösa kopplingar mellan Fortnox, Visma, Stripe och era befintliga verktyg." },
  { n: "03", title: "Appar", tag: "iOS, Android & PWA.", desc: "iOS, Android och progressiva webbappar som folk faktiskt vill använda." },
  { n: "04", title: "Redesign", tag: "UI/UX som konverterar.", desc: "Modern UI/UX som lyfter varumärket och ökar konvertering." },
  { n: "05", title: "Webb & plattformar", tag: "Från landningssida till SaaS.", desc: "Snabba, säkra och skalbara lösningar — från landningssida till SaaS." },
  { n: "06", title: "Landningssidor", tag: "Sidor som säljer dygnet runt.", desc: "Konverterande sidor som driver leads och säljer hela dygnet." },
  { n: "07", title: "Digital marknadsföring", tag: "Meta & Google Ads med ROAS.", desc: "Meta Ads och Google Ads — datadriven annonsering med tydlig ROAS." },
  { n: "08", title: "SEO & innehåll", tag: "SEO som rankar & konverterar.", desc: "Programmatic SEO och innehåll som rankar — och konverterar." },
  { n: "09", title: "AI-integration", tag: "GPT, chatbottar & automation.", desc: "GPT-driven automation, chatbottar och AI-coacher inbyggda i din produkt." },
  { n: "10", title: "Strategi & rådgivning", tag: "Audits, MVP & strategi.", desc: "Tekniska audits, MVP-validering och digital strategi för bolag som vill växa rätt." },
  { n: "11", title: "CRO & analys", tag: "GA4, Hotjar & A/B-tester.", desc: "Datadriven optimering med GA4, Hotjar och A/B-testning som höjer konvertering." },
  { n: "12", title: "Underhåll & support", tag: "Drift, support & hosting.", desc: "Löpande utveckling, säkerhetsuppdateringar och hosting — vi sover så du slipper." },
];

const ServicesSection = () => (
  <section className="section" id="tjanster">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Tjänster</div></Reveal>
        <Reveal delay={0.1}>
          <div>
            <h2 className="h2">Vi utvecklar mjukvara med <span className="it">intention.</span></h2>
            <p className="lead" style={{ marginTop: 22 }}>
              Varje system vi bygger är skräddarsytt efter er verksamhet — inte tvärtom. Snabb leverans,
              transparent kommunikation och kod du äger från dag ett. Vi kombinerar utveckling, marknadsföring
              och AI för att leverera något som faktiskt rör nålen.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="svc-grid">
        {SERVICES.map((s) => (
          <div key={s.n} className="svc-cell">
            <span className="svc-num">→ {s.n}</span>
            <h3 className="svc-title">{s.title}</h3>
            <span className="svc-tag">{s.tag}</span>
            <p className="body">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ───── Arbeten ───── */
const FLAGSHIP = {
  title: "Aurora Transport",
  desc: "Komplett dispatch- och fakturasystem för åkerier. Bygger schemaläggning, körorder, Fortnox-export och Stripe-fakturering på under två veckor.",
  url: "auroratransport.se",
  meta: "Live · Under 2 veckor",
  tags: ["SaaS", "Lovable", "Supabase", "Stripe", "Fortnox API"],
  href: "/arbete/aurora-transport",
};

const PROJECTS = [
  { title: "Updro", desc: "Marknadsplats där företag jämför offerter från digitala byråer.", url: "updro.se", meta: "Live · 2 veckor", tags: ["SaaS", "Lovable", "Supabase"], href: "/arbete/updro" },
  { title: "AgilityManager", desc: "Träningsapp för svenska agility-förare. iOS + Android planerade 2026.", url: "agilitymanager.se", meta: "Live · Under 2 veckor", tags: ["SaaS", "Lovable", "Supabase"], href: "/arbete/agilitymanager" },
  { title: "Hönsgården", desc: "Freemium-app för svenska hönsägare. Webb + Google Play-app via Capacitor.", url: "honsgarden.se", meta: "Live · 1 vecka", tags: ["SaaS", "Lovable", "Supabase"], href: "/arbete/honsgarden" },
  { title: "Odlingsdagboken", desc: "Svensk odlings-SaaS med AI-coach.", url: "odlingsdagboken.com", meta: "Live · Under 2 veckor", tags: ["SaaS", "Lovable", "Supabase"], href: "/arbete/odlingsdagboken" },
  { title: "GoGlamping Sweden", desc: "Bokningssajt för glamping vid Göta kanal.", url: "goglampingsweden.se", meta: "Live · 1 vecka", tags: ["Utveckling", "React", "Vite"], href: "/arbete/goglamping-sweden" },
  { title: "Viriditas", desc: "Bokningssajt för massagemottagning.", url: "viriditasmassage.se", meta: "Live · Några dagar", tags: ["Utveckling", "React", "Vite"], href: "/arbete/viriditas" },
  { title: "Yachting Sweden", desc: "SEO och content för svensk båtbransch.", url: "yachtingsweden.se", meta: "Pågående", tags: ["SEO", "Technical SEO", "Content"], href: "/arbete/yachting-sweden" },
  { title: "Solcellsofferter.se", desc: "SEO för svensk solcellsmarknadsplats.", url: "solcellsofferter.se", meta: "Live", tags: ["SEO", "Content"], href: "/arbete/solcellsofferter" },
  { title: "Minandel.se", desc: "V85 travtips-sajt med custom tema.", url: "minandel.se", meta: "Live", tags: ["WordPress", "Custom theme"], href: "/arbete/minandel" },
];

const WorkSection = () => (
  <section className="section" id="arbeten">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Referenser · 10 projekt</div></Reveal>
        <Reveal delay={0.1}>
          <div>
            <h2 className="h2">9 live just nu. <span className="it">Inga exempel</span> från praktiken.</h2>
            <p className="lead" style={{ marginTop: 22 }}>
              Aurora Media driver en egen portfölj av SaaS-produkter med riktiga kunder, prenumerationer och
              MRR — plus utvecklings- och SEO-uppdrag åt svenska bolag. Klicka och se. Allt nedan är på riktigt.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <Link to={FLAGSHIP.href} className="work-feature" style={{ textDecoration: "none", color: "inherit" }}>
          <span className="badge">Flaggskepp</span>
          <div>
            <h3>{FLAGSHIP.title}</h3>
            <p className="body" style={{ marginBottom: 16, maxWidth: "60ch" }}>{FLAGSHIP.desc}</p>
            <div>
              {FLAGSHIP.tags.map((t) => <span key={t} className="pill">{t}</span>)}
            </div>
          </div>
          <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
            <div className="mono" style={{ marginBottom: 8 }}>{FLAGSHIP.url}</div>
            <div className="meta-label">{FLAGSHIP.meta}</div>
          </div>
        </Link>
      </Reveal>

      <div className="work-grid">
        {PROJECTS.map((p) => (
          <Link to={p.href} key={p.title} className="work-card">
            <h4>{p.title}</h4>
            <p className="body">{p.desc}</p>
            <div className="url" style={{ marginTop: 14 }}>{p.url}</div>
            <div className="meta">{p.meta}</div>
            <div style={{ marginTop: 10 }}>
              {p.tags.map((t) => <span key={t} className="pill">{t}</span>)}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 36, textAlign: "center" }}>
        <Link to="/arbete" className="btn btn-ghost">
          Se alla 10 projekt i detalj <span className="a"><ArrowUpRight size={14} /></span>
        </Link>
      </div>
    </div>
  </section>
);

/* ───── Branscher ───── */
const INDUSTRIES = [
  "Industri & Logistik", "Vård & Hälsa", "Fintech & Kassa", "Skönhet & Wellness",
  "SaaS & Tech", "E-handel", "Bygg & Hantverk", "Lantbruk & Hippologi",
];

const IndustriesSection = () => (
  <section className="section" id="branscher">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Branscher</div></Reveal>
        <Reveal delay={0.1}>
          <div>
            <h2 className="h2">Byggt för <span className="it">verkliga</span> verksamheter.</h2>
            <p className="lead" style={{ marginTop: 22 }}>
              Vi har levererat till svenska bolag i åtta olika branscher — från transportbolag och
              massageföretag till barnpsykiatri och e-handel.
            </p>
          </div>
        </Reveal>
      </div>
      <div className="ind-grid">
        {INDUSTRIES.map((i) => (
          <div key={i} className="ind-cell">{i}</div>
        ))}
      </div>
    </div>
  </section>
);

/* ───── Integrationer ───── */
const INTEGRATIONS = [
  { cat: "Ekonomi", list: "Fortnox, Visma, Bokio" },
  { cat: "Betalning", list: "Stripe, Klarna, Swish, PayPal, Adyen" },
  { cat: "Auth & ID", list: "BankID, Auth0, Clerk" },
  { cat: "Kommunikation", list: "Slack, Microsoft 365, Teams, Google Workspace" },
  { cat: "E-post & SMS", list: "Mailgun, Resend, Postmark, Twilio, 46elks" },
  { cat: "Marknadsföring", list: "Meta Ads, Google Ads, Mailchimp, Klaviyo, HubSpot, ActiveCampaign" },
  { cat: "E-handel & CMS", list: "Shopify, WooCommerce, WordPress, Webflow, Strapi" },
  { cat: "AI", list: "OpenAI, Anthropic, Google Gemini, Mistral, ElevenLabs" },
  { cat: "Backend & hosting", list: "Supabase, Vercel, Cloudflare, AWS, Firebase" },
  { cat: "Automation", list: "Zapier, Make, n8n" },
  { cat: "CRM", list: "Pipedrive, HubSpot, Salesforce" },
  { cat: "Övrigt", list: "Google Maps, Calendly, Notion, Airtable, Linear, Sentry" },
];

const IntegrationsSection = () => {
  const { open } = useContactModal();
  return (
    <section className="section" id="integrationer">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="meta-label">Integrationer</div></Reveal>
          <Reveal delay={0.1}>
            <div>
              <h2 className="h2">Sömlöst kopplat till <span className="it">din verksamhet.</span></h2>
              <p className="lead" style={{ marginTop: 22 }}>
                Vi bygger anpassade integrationer mot REST/GraphQL-API:er, OAuth 2.0-flöden och webhooks. Det
                här är bara ett urval — kan ditt verktyg prata API, kan vi koppla det.
              </p>
            </div>
          </Reveal>
        </div>
        <div className="int-grid">
          {INTEGRATIONS.map((i) => (
            <div key={i.cat} className="int-cell">
              <h4>{i.cat}</h4>
              <p>{i.list}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, padding: "clamp(28px,3vw,40px)", border: "1px solid var(--hair)", borderRadius: 10, display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ maxWidth: "52ch" }}>
            <h3 className="h3" style={{ marginBottom: 10 }}>Alla verktyg du inte ser</h3>
            <p className="body">
              Om ditt system pratar API, kan vi koppla det. OAuth 2.0, REST, GraphQL, webhooks — vi bygger
              anpassade integrationer på begäran.
            </p>
          </div>
          <button onClick={() => open()} className="btn btn-ghost">
            Diskutera din integration <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </div>
    </section>
  );
};

/* ───── Process ───── */
const PROCESS = [
  { n: "i.", name: "Vi kartlägger behovet", desc: "Workshop där vi förstår er verksamhet och målbild." },
  { n: "ii.", name: "Vi designar flödet", desc: "Wireframes, UX och tekniskt arkitekturförslag." },
  { n: "iii.", name: "Vi bygger första versionen", desc: "MVP byggd i modern stack med daglig avstämning." },
  { n: "iv.", name: "Vi testar med riktiga användare", desc: "Iterationer baserat på faktisk användning." },
  { n: "v.", name: "Du lanserar och äger koden", desc: "Full överlämning — kod, dokumentation och support." },
];

const ProcessSection = () => (
  <section className="section" id="process">
    <div className="wrap">
      <div className="sec-head">
        <Reveal><div className="meta-label">Process</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2">Från idé till lansering <span className="it">utan kaos.</span></h2>
        </Reveal>
      </div>
      <div className="proc-grid">
        {PROCESS.map((s) => (
          <div className="proc-step" key={s.n}>
            <span className="proc-num">{s.n}</span>
            <h3 className="proc-name">{s.name}</h3>
            <p className="body">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ───── Paket ───── */
const PACKAGES = [
  {
    n: "01", featured: false, name: "Prototyp",
    desc: "För dig som vill testa en idé snabbt innan större investering.",
    items: ["Klickbar prototyp", "1–2 användarflöden", "UX-genomgång", "Leverans på några dagar"],
    cta: "Starta med prototyp",
  },
  {
    n: "02", featured: true, name: "MVP",
    desc: "För dig som vill lansera en första fungerande produkt med riktiga kunder.",
    items: ["Fungerande webb-/mobilapp", "Auth, betalningar, databas", "Stripe + valfri integration", "Leverans 1–2 veckor", "Du äger koden"],
    cta: "Bygg min MVP",
  },
  {
    n: "03", featured: false, name: "Skräddarsytt system",
    desc: "För bolag som behöver affärssystem, integrationer eller intern plattform.",
    items: ["Anpassad arkitektur", "Fortnox/Visma-integration", "BankID & rollstyrning", "Multi-tenant SaaS", "Långsiktig utveckling"],
    cta: "Boka rådgivning",
  },
];

const PackagesSection = () => {
  const { open } = useContactModal();
  return (
    <section className="section" id="paket">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="meta-label">Paket</div></Reveal>
          <Reveal delay={0.1}>
            <div>
              <h2 className="h2">Välj hur snabbt du <span className="it">vill komma igång.</span></h2>
              <p className="lead" style={{ marginTop: 22 }}>
                Tre tydliga paketnivåer — från snabb prototyp till skräddarsytt affärssystem. Inga konstiga
                tilläggsfakturor, ingen abonnemangsfälla. Tydlig leveranstid, helt utan överraskningar.
              </p>
            </div>
          </Reveal>
        </div>
        <div className="price-grid">
          {PACKAGES.map((p) => (
            <Reveal key={p.n}>
              <div className={`price-card ${p.featured ? "featured" : ""}`}>
                {p.featured && <span className="price-tag">Populär</span>}
                <span className="price-num">{p.n}</span>
                <h3>{p.name}</h3>
                <p className="body">{p.desc}</p>
                <ul className="price-list">
                  {p.items.map((it) => (
                    <li key={it}><Check size={14} strokeWidth={2.5} /> {it}</li>
                  ))}
                </ul>
                <button onClick={() => open()} className={`btn ${p.featured ? "btn-moss" : "btn-ghost"}`}>
                  {p.cta} <span className="a"><ArrowRight size={14} /></span>
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ───── CTA ───── */
const CTA = () => {
  const { open } = useContactModal();
  return (
    <section id="kontakt" className="cta-band">
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <Reveal><div className="meta-label">Nästa steg</div></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h2" style={{ marginTop: 18, maxWidth: "20ch" }}>
            Din idé förtjänar mer än <span className="it">att ligga i anteckningar.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="lead" style={{ marginTop: 22 }}>
            Berätta vad du vill bygga. Vi återkommer inom 24 timmar med förslag, tidsplan och ungefärlig
            budget — helt utan kostnad och bindning.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
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

/* ───── Page ───── */
const Index = () => (
  <>
    <SEO
      title="Aurora Media AB — AI-driven mjukvarubyrå i Linköping"
      description="Aurora Media bygger SaaS, MVP:er, interna system, webbappar, mobilappar, e-handel, integrationer och AI-automationer för svenska företag. Från idé till lansering på under fyra veckor."
    />
    <NordicLayout>
      <Hero />
      <MetodSection />
      <ServicesSection />
      <WorkSection />
      <IndustriesSection />
      <IntegrationsSection />
      <ProcessSection />
      <PackagesSection />
      <CTA />
    </NordicLayout>
  </>
);

export default Index;
