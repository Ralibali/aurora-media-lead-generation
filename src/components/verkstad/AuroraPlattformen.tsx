import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/verkstad/VerkstadLayout";

const italic = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 500,
  color: "var(--gran)",
};

export const PLATFORM_PARTS = [
  {
    slug: "tjanster/hemsidor",
    name: "Web",
    role: "Grunden",
    body: "Sajt eller system som laddar snabbt, konverterar och går att bygga vidare på.",
  },
  {
    slug: "care",
    name: "Aurora Care",
    role: "Driften",
    body: "WordPress-drift, uppdateringar, backup och säkerhet varje månad.",
  },
  {
    slug: "lokal-synlighet",
    name: "Aurora Local",
    role: "Närområdet",
    body: "Google-företagsprofil, lokal SEO och recensioner som ger samtal från trakten.",
  },
  {
    slug: "ai-synlighet",
    name: "Aurora Sight",
    role: "AI-sökningen",
    body: "Syns ni när kunder frågar ChatGPT, Perplexity och Googles AI-svar? Vi mäter och åtgärdar.",
  },
  {
    slug: "ai-receptionist",
    name: "Aurora Voice",
    role: "Bemanningen",
    body: "AI-receptionist som svarar, kvalificerar och bokar när ni inte hinner.",
  },
];

const AuroraPlattformen = ({ activeSlug }: { activeSlug?: string }) => (
  <section className="vk-section">
    <div className="vk-wrap">
      <Reveal><p className="vk-mono">Aurora-plattformen</p></Reveal>
      <Reveal delay={0.05}>
        <h2 style={{ marginTop: 14 }}>Fem delar, <span style={italic}>ett system</span>.</h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p style={{ marginTop: 18, maxWidth: "62ch", fontSize: 17, lineHeight: 1.7, color: "#3E444B" }}>
          Allt hör ihop under Aurora Media. Ni kan börja med en del och lägga till fler när det ger
          affärsnytta – samma kontaktperson, samma faktura, inga separata leverantörer.
        </p>
      </Reveal>

      <div className="vk-platform-grid">
        {PLATFORM_PARTS.map((p, i) => {
          const active = activeSlug === p.slug;
          return (
            <Reveal key={p.slug} delay={Math.min(i * 0.05, 0.2)}>
              <Link
                to={`/${p.slug}`}
                aria-current={active ? "page" : undefined}
                className="vk-platform-card"
                style={active ? { borderColor: "var(--gran)", background: "var(--bjork-djup)" } : undefined}
              >
                <span className="vk-mono" style={{ color: "var(--granbark-mut)" }}>
                  {String(i + 1).padStart(2, "0")} · {p.role}
                </span>
                <h3 style={{ marginTop: 10 }}>{p.name}</h3>
                <p style={{ marginTop: 8, fontSize: 15, lineHeight: 1.6, color: "#3E444B" }}>{p.body}</p>
                <span style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, color: "var(--gran)", fontWeight: 600, fontSize: 14 }}>
                  {active ? "Du är här" : "Läs mer"} <ArrowRight size={14} />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

export default AuroraPlattformen;
