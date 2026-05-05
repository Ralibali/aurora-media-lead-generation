import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, Sparkles } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";

const FOOTER_COLUMNS = [
  {
    title: "Bygg med oss",
    items: [
      { label: "AI-konsult Sverige", href: "/ai-konsult-sverige" },
      { label: "Tjänster", href: "/tjanster" },
      { label: "Priser", href: "/priser" },
      { label: "Metodik", href: "/metodik" },
    ],
  },
  {
    title: "Specialister",
    items: [
      { label: "Hemsidor", href: "/tjanster/hemsidor" },
      { label: "E-handel", href: "/tjanster/ehandel" },
      { label: "Mobilappar", href: "/tjanster/mobilapp" },
      { label: "SEO", href: "/tjanster/seo" },
    ],
  },
  {
    title: "Aurora",
    items: [
      { label: "Case & projekt", href: "/arbete" },
      { label: "Blogg", href: "/blogg" },
      { label: "Om Aurora", href: "/om" },
      { label: "Webbyrå Linköping", href: "/webbyra-linkoping" },
    ],
  },
];

const FooterLink = ({ href, children }: { href: string; children: ReactNode }) => {
  const cls = "block py-1.5 text-sm text-foreground/70 transition hover:text-primary";
  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return <a href={href} className={cls}>{children}</a>;
  }
  return <Link to={href} className={cls}>{children}</Link>;
};

const AuroraFooter = () => {
  const { open } = useContactModal();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-secondary/40 px-6 pb-10 pt-20 sm:px-10 lg:px-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(50% 40% at 15% 20%, hsl(var(--primary)/0.12), transparent 60%), radial-gradient(40% 35% at 85% 70%, hsl(var(--forest-glow-soft)/0.14), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.55)]">
                <span className="font-display text-xl font-bold">A</span>
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-base font-bold uppercase tracking-[0.3em] text-foreground">
                  Aurora Media
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                  SaaS · AI · automation
                </span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Vi bygger SaaS, MVP:er, interna appar och AI-automationer för svenska bolag.
              Fast pris, snabb leverans och kod du äger.
            </p>

            <button
              type="button"
              onClick={open}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_-12px_hsl(var(--primary)/0.6)] transition hover:brightness-110"
            >
              Boka rådgivning <ArrowRight size={16} />
            </button>

            <div className="mt-8 space-y-2.5 text-sm text-foreground/70">
              <a href="mailto:info@auroramedia.se" className="flex items-center gap-2 hover:text-primary">
                <Mail size={15} /> info@auroramedia.se
              </a>
              <Link to="/webbyra-linkoping" className="flex items-center gap-2 hover:text-primary">
                <MapPin size={15} /> Linköping, Sverige
              </Link>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Sparkles size={15} /> Aurora Media AB · 559272-0220
              </p>
            </div>
          </div>

          {/* Columns */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-3">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                  {col.title}
                </p>
                <ul>
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <FooterLink href={item.href}>{item.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Aurora Media AB. Alla rättigheter förbehållna.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/integritetspolicy" className="hover:text-primary">Integritetspolicy</Link>
            <Link to="/redaktionell-policy" className="hover:text-primary">Redaktionell policy</Link>
            <Link to="/kontakt" className="hover:text-primary">Kontakt</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AuroraFooter;
