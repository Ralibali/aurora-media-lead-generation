import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta } from "@/lib/seoHelpers";

const BORDER = "rgba(237, 233, 220, 0.15)";
const SectionBorder = () => <div style={{ height: "0.5px", backgroundColor: BORDER }} />;

const STEPS = [
  {
    num: "01",
    name: "Samtal",
    time: "30 min",
    desc: "Ni berättar om problemet eller idén. Vi ställer frågor. Vi säger ja eller nej och varför — det är ett av de viktigaste momenten. Inget värde i att dra igång ett projekt som inte borde startas.",
    deliverable: "Tydlig bild av om vi ska jobba ihop.",
  },
  {
    num: "02",
    name: "Offert",
    time: "inom 24h",
    desc: "Skriftligt förslag med fast pris, fast omfattning och fast deadline. Inga löpande timmar. Inga obehagliga överraskningar. Ni vet exakt vad ni betalar och vad ni får.",
    deliverable: "Skriftlig offert med specifikation.",
  },
  {
    num: "03",
    name: "Bygge",
    time: "1–6 veckor",
    desc: "Ni har tillgång till live-versionen från dag ett och kan följa varje deploy i realtid. Ingen lång tyst period. Körstämning varje vecka — kort, fokuserat. Vi använder moderna AI-verktyg som Lovable och Cursor för att hålla tempot uppe utan att kompromissa med kvaliteten.",
    deliverable: "Driftsatt produkt som ni kan använda.",
  },
  {
    num: "04",
    name: "Lansering",
    time: "1 dag",
    desc: "Domän, repo, databas, dokumentation och drift överlämnas med en genomgång. Allt är ert. Ni kan driva vidare själva, anlita vem som helst för underhåll, eller fortsätta med oss på supportavtal.",
    deliverable: "Fullständig kodöverlämning och dokumentation.",
  },
];

const FAQS = [
  {
    q: "Vad händer om något går fel under bygget?",
    a: "Vi kommunicerar det direkt och löser det — utan extra kostnad om det är inom scopet. Vi sätter ett fast pris just för att undvika den friktion som uppstår när varje timme debiteras.",
  },
  {
    q: "Kan ni ta er an projekt utanför Linköping?",
    a: "Ja. Vi arbetar med kunder i hela Sverige och hanterar allt digitalt. Fysiska möten kan arrangeras vid behov.",
  },
  {
    q: "Vad äger vi när projektet är klart?",
    a: "Allt. Källkod, databas, domän, hosting-konton. Vi behåller ingenting. Ni ska inte vara beroende av oss för att er produkt ska fortsätta leva.",
  },
  {
    q: "Kan ni ta hand om drift och underhåll?",
    a: "Ja, vi erbjuder supportavtal för löpande underhåll, säkerhetsuppdateringar och vidareutveckling. Det är valfritt — inte obligatoriskt.",
  },
  {
    q: "Hur snabbt kan ni börja?",
    a: "Oftast inom en vecka från att offert är accepterad. Vi kör inte parallella projekt — det är en av anledningarna till att leveranstakten är hög.",
  },
  {
    q: "Vad ingår inte i fast pris?",
    a: "Tredjepartstjänster (Stripe, Twilio, externa API:er), domäner och hosting betalas av er direkt. Vi sätter upp allt och guider er — men kostnaderna faller på er, inte på oss.",
  },
];

const Process = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Process — från samtal till lansering på veckor | Aurora Media",
      description:
        "Hur Aurora Media jobbar: samtal, fast offert, bygge med live-access från dag ett, och en fullständig kodöverlämning vid lansering.",
      canonical: "/process",
      ogImage: "/og-image-sv.jpg",
    });
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">
        <section className="section-pad pt-[120px]">
          <div className="site-container">
            <p className="eyebrow mb-4">Process</p>
            <h1 className="hero-h1 text-cream max-w-[580px]">
              Från första samtal till live{" "}
              <em>på fyra veckor.</em>
            </h1>
            <p className="mt-4 max-w-[460px] font-sans text-[14px] leading-relaxed" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
              Vi använder moderna AI-verktyg som accelererar varje del av processen. Ni betalar
              för bygget — inte för att vi lär oss nya ramverk för varje projekt.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="section-pad">
          <SectionBorder />
          <div className="site-container pt-14">
            <p className="eyebrow mb-8">Fyra steg</p>
            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className="grid gap-6 py-8 sm:grid-cols-[32px_1fr_1fr]"
                style={{ borderBottom: i < STEPS.length - 1 ? `0.5px solid ${BORDER}` : "none" }}
              >
                <span className="mono-accent pt-0.5" style={{ color: "rgba(237, 233, 220, 0.40)" }}>{s.num}</span>
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="font-sans text-[15px] font-medium text-cream">{s.name}</h2>
                    <span className="mono-accent" style={{ color: "rgba(237, 233, 220, 0.50)" }}>{s.time}</span>
                  </div>
                  <p className="font-sans text-[13px] leading-relaxed" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
                    {s.desc}
                  </p>
                </div>
                <div>
                  <p className="eyebrow mb-1">Ni får</p>
                  <p className="font-sans text-[13px] text-cream">{s.deliverable}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What you get */}
        <section className="section-pad">
          <SectionBorder />
          <div className="site-container pt-14">
            <p className="eyebrow mb-4">Vad ni får tillbaka</p>
            <h2 className="section-h2 text-cream mb-8">Allt är ert. <em>Alltid.</em></h2>
            <div className="grid gap-0 sm:grid-cols-2">
              {[
                "Fullständig källkod i ert GitHub-repo",
                "Databas och alla data",
                "Domän och DNS-konfiguration",
                "Hosting-konton (Vercel, Supabase, m.fl.)",
                "Teknisk dokumentation",
                "Genomgång vid överlämning",
                "Inga låsningsklausuler",
                "Rätt att modifiera och vidareutveckla",
              ].map((item, i) => (
                <div
                  key={item}
                  className="flex items-center gap-3 py-3"
                  style={{ borderBottom: `0.5px solid ${BORDER}` }}
                >
                  <span className="font-sans text-[12px]" style={{ color: "rgba(237, 233, 220, 0.30)" }}>→</span>
                  <span className="font-sans text-[13px] text-cream">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-pad">
          <SectionBorder />
          <div className="site-container pt-14">
            <p className="eyebrow mb-8">Vanliga frågor</p>
            <div>
              {FAQS.map((f, i) => (
                <div
                  key={f.q}
                  className="grid gap-4 py-5 sm:grid-cols-[1fr_1.4fr]"
                  style={{ borderBottom: i < FAQS.length - 1 ? `0.5px solid ${BORDER}` : "none" }}
                >
                  <p className="font-sans text-[14px] font-medium text-cream">{f.q}</p>
                  <p className="font-sans text-[13px] leading-relaxed" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-pad">
          <SectionBorder />
          <div className="site-container pt-14">
            <p className="eyebrow mb-4">Redo?</p>
            <h2 className="section-h2 text-cream mb-3">Starta med ett samtal.</h2>
            <p className="max-w-[460px] font-sans text-[14px] leading-relaxed mb-8" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
              30 minuter. Ni berättar vad ni vill bygga. Vi berättar om det är genomförbart och vad det kostar.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/kontakt"
                className="inline-flex items-center rounded-lg px-[18px] py-[10px] font-sans text-[13px] font-medium transition-opacity hover:opacity-85"
                style={{ backgroundColor: "#EDE9DC", color: "#100F0D" }}
              >
                Begär offert →
              </Link>
              <a
                href="https://cal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border px-[18px] py-[10px] font-sans text-[13px] transition-opacity hover:opacity-85"
                style={{ borderWidth: "0.5px", borderColor: "rgba(237, 233, 220, 0.30)", color: "#EDE9DC" }}
              >
                Boka 30 min direkt ↗
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Process;
