import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta } from "@/lib/seoHelpers";

const TRACKS = [
  {
    n: "Spår 01",
    name: "Konsult",
    price: "895 kr/timme",
    desc: "Rådgivning, strategi och utveckling i era egna team. 895 kr/timme, dagpris eller fast månadskostnad från 12 000 kr – utan bindningstid.",
    items: [
      "AI-strategi och use case-workshops",
      "Utvecklingskonsult i era projekt",
      "AI-CTO on demand för ledning och styrelse",
      "Utbildning och prompt-rutiner för teamet",
      "Genomlysning av system, kod och dataflöden",
    ],
    cta: "Boka konsult",
    modal: "Konsult",
  },
  {
    n: "Spår 02",
    name: "Bygge",
    price: "fast pris från 14 900 kr",
    desc: "Avgränsat scope, fast pris och en produkt som går att använda på riktigt – på veckor, inte månader.",
    items: [
      "Prototyp på 3–5 dagar",
      "MVP på cirka två veckor",
      "Interna system och AI-automationer",
      "Integrationer: Fortnox, Stripe, interna API:er",
      "Kod och repo ni äger",
    ],
    cta: "Se fasta paket",
    href: "/priser",
  },
];

const JOURNEY = [
  { n: "01", name: "Idé & scope",      desc: "Vi kokar ner AI-snacket till en tydlig produkt, automation eller konsultinsats." },
  { n: "02", name: "Prototyp",         desc: "Klickbar version snabbt — ni ser vad som ska byggas." },
  { n: "03", name: "MVP",              desc: "Inloggning, databas, betalning, admin och kärnflöden — inget fluff." },
  { n: "04", name: "Integrationer",    desc: "Supabase, Stripe, Brevo, Fortnox, interna API:er och behörigheter." },
  { n: "05", name: "AI-automation",    desc: "Flöden som gör jobbet, inte bara imponerar på en workshop." },
  { n: "06", name: "Kodöverlämning",   desc: "Repo, dokumentation och en grund ni kan bygga vidare på." },
];

const TRUST = [
  { title: "GDPR från start",    desc: "Tydliga roller, datagränser och behörigheter inbyggt." },
  { title: "Riktig datamodell",  desc: "Databas, RLS och struktur som håller för produktion." },
  { title: "Ni äger koden",      desc: "GitHub-repo och frihet att ta produkten vidare." },
  { title: "AI som process",     desc: "Automationer som passar hur bolaget faktiskt jobbar." },
];

const AiKonsultSverige = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "AI-konsult i Sverige – rådgivning och bygge | Aurora Media AB",
      description: "AI-konsult som både råder och bygger: strategi, utbildning och konsultuppdrag på timme – eller fastprisprojekt med kod ni äger. Aurora Media AB.",
      canonical: "/ai-konsult-sverige",
      keywords: "AI-konsult Sverige, AI-rådgivning, AI-CTO, konsultuppdrag AI, utvecklingskonsult AI",
    });
  }, []);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">ai-konsult sverige · två spår · samma person</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "18ch" }}>
              AI-konsult som råder. <span className="it">Och bygger.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>
              Vissa behöver en konsult i ledningsrummet eller dev-teamet. Andra behöver en färdig produkt till fast pris. Vi gör båda – och ni kan börja i det spår som passar just nu och byta när behovet ändras.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => open("Konsult")} className="btn btn-moss">
                Boka konsult <span className="a"><ArrowRight size={14} /></span>
              </button>
              <Link to="/priser" className="btn btn-ghost">Se fasta paket</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Två sätt att jobba med oss</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Konsult när ni behöver riktning. <span className="it">Bygge när ni är redo.</span></h2>
            </Reveal>
          </div>
          <div className="work-grid">
            {TRACKS.map((track, index) => (
              <Reveal key={track.n} delay={index * 0.05}>
                <article className="work-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <div className="meta-label">{track.n}</div>
                  <h3 style={{ marginTop: 18 }}>{track.name} · {track.price}</h3>
                  <p className="body" style={{ marginTop: 12 }}>{track.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "grid", gap: 10, flex: 1 }}>
                    {track.items.map((item) => (
                      <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.92rem", color: "var(--bone-soft)" }}>
                        <Check size={14} style={{ color: "var(--moss)", flexShrink: 0, marginTop: 3 }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 24 }}>
                    {track.href ? (
                      <Link to={track.href} className="btn btn-ghost" style={{ display: "inline-flex" }}>
                        {track.cta} <span className="a"><ArrowRight size={14} /></span>
                      </Link>
                    ) : (
                      <button onClick={() => open(track.modal)} className="btn btn-ghost">
                        {track.cta} <span className="a"><ArrowRight size={14} /></span>
                      </button>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <p className="body" style={{ marginTop: 24, maxWidth: "64ch", opacity: 0.75 }}>
              Vanligaste kombinationen: börja med en strategiworkshop, fortsätt med en prototyp – och behåll oss som konsult i bakgrunden när produkten växer.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Från idé till leverans</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Resan tar <span className="it">veckor</span>, inte månader.</h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {JOURNEY.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.05}>
                <div className="feat-row">
                  <span className="feat-num">{s.n}</span>
                  <span className="feat-title">{s.name}</span>
                  <span className="feat-body">{s.desc}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Varför ni kan lita på oss</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Byggt för <span className="it">produktion.</span></h2>
            </Reveal>
          </div>
          <div className="ind-grid">
            {TRUST.map((t) => (
              <div key={t.title} className="ind-cell" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="meta-label">{t.title}</span>
                <span className="body" style={{ fontSize: "0.9rem" }}>{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Nästa steg</div>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Berätta vad ni behöver – <span className="it">vi föreslår spåret.</span>
          </h2>
          <p className="lead" style={{ marginTop: 22 }}>Svar inom 24 timmar. Ärligt råd om vilket upplägg som passar – även om svaret är att ni inte behöver oss.</p>
          <button onClick={() => open("Konsult")} className="btn btn-moss" style={{ marginTop: 28 }}>
            Boka rådgivning <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
};

export default AiKonsultSverige;
