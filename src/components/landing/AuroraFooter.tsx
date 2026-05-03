import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, Sparkles } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";

const FOOTER_COLUMNS = [
  {
    title: "Bygg med oss",
    items: [
      { label: "AI-konsult Sverige", href: "/ai-konsult-sverige", desc: "Från strategi till färdig produkt" },
      { label: "Tjänster", href: "/tjanster", desc: "SaaS, appar, webb och automation" },
      { label: "Priser", href: "/priser", desc: "Fast pris från 14 900 kr" },
      { label: "Metodik", href: "/metodik", desc: "Så går vi från idé till lansering" },
    ],
  },
  {
    title: "Specialister",
    items: [
      { label: "Hemsidor", href: "/tjanster/hemsidor", desc: "Snabba sidor som konverterar" },
      { label: "E-handel", href: "/tjanster/ehandel", desc: "Butiker, betalflöden och integrationer" },
      { label: "Mobilappar", href: "/tjanster/mobilapp", desc: "Appar och webbappar" },
      { label: "SEO", href: "/tjanster/seo", desc: "Teknisk SEO och content" },
    ],
  },
  {
    title: "Aurora",
    items: [
      { label: "Case & projekt", href: "/arbete", desc: "Se vad vi bygger" },
      { label: "Blogg", href: "/blogg", desc: "AI-kodning, SaaS och SEO" },
      { label: "Om Aurora", href: "/om", desc: "Bolaget bakom produkterna" },
      { label: "Webbyrå Linköping", href: "/webbyra-linkoping", desc: "Lokal partner i Östergötland" },
    ],
  },
];

const FooterLink = ({ href, children }: { href: string; children: ReactNode }) => {
  const isExternal = href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http");
  const className = "group block rounded-2xl border border-white/0 px-3 py-2 transition hover:border-white/10 hover:bg-white/[0.045]";

  if (isExternal) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
};

const AuroraFooter = () => {
  const { open } = useContactModal();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black px-6 pb-8 pt-16 sm:px-10 lg:px-[70px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.16),transparent_30rem),radial-gradient(circle_at_82%_74%,rgba(168,85,247,0.12),transparent_32rem)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1.35fr] lg:gap-16">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-blue-300/35 bg-blue-500/10 text-sm font-bold text-blue-100 shadow-[0_0_34px_rgba(59,130,246,0.38)]">
                A
              </span>
              <span>
                <span className="block font-display text-lg font-bold uppercase tracking-[0.28em] text-white">
                  Aurora Media
                </span>
                <span className="mt-1 block text-xs text-white/45">
                  AI-builder · SaaS · automation · webb
                </span>
              </span>
            </Link>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/62">
              Vi bygger SaaS, MVP:er, interna appar och AI-automationer för svenska bolag.
              Mindre workshop. Mer fungerande produkt. Fast pris, snabb leverans och kod du äger.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={open}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/12 px-5 py-3 text-sm font-bold text-white backdrop-blur-xl transition hover:border-blue-200/55 hover:bg-blue-400/20"
              >
                Boka AI-genomgång
                <ArrowRight size={16} />
              </button>
              <Link
                to="/ai-konsult-sverige"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.055] px-5 py-3 text-sm font-bold text-white/82 backdrop-blur-xl transition hover:border-white/28 hover:bg-white/[0.085] hover:text-white"
              >
                AI-konsult vs AI-builder
              </Link>
            </div>

            <div className="mt-7 space-y-3 text-sm text-white/58">
              <a href="mailto:info@auroramedia.se" className="flex items-center gap-2 transition hover:text-white">
                <Mail size={16} /> info@auroramedia.se
              </a>
              <Link to="/webbyra-linkoping" className="flex items-center gap-2 transition hover:text-white">
                <MapPin size={16} /> Linköping, Sverige
              </Link>
              <p className="flex items-center gap-2">
                <Sparkles size={16} /> Aurora Media AB · Org.nr 559272-0220
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className="rounded-[1.55rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-2xl">
                <p className="mb-3 px-3 font-mono-au text-[10px] font-bold uppercase tracking-[0.24em] text-white/36">
                  {col.title}
                </p>
                <ul className="space-y-1">
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <FooterLink href={item.href}>
                        <span className="block text-sm font-semibold text-white/78 transition group-hover:text-white">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-white/42 transition group-hover:text-white/58">
                          {item.desc}
                        </span>
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/42 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Aurora Media AB. Alla rättigheter förbehållna.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/integritetspolicy" className="transition hover:text-white/82">
              Integritetspolicy
            </Link>
            <Link to="/redaktionell-policy" className="transition hover:text-white/82">
              Redaktionell policy
            </Link>
            <Link to="/kontakt" className="transition hover:text-white/82">
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AuroraFooter;
