const COLS = [
  {
    title: "Tjänster",
    items: [
      { label: "System & SaaS", href: "#tjanster" },
      { label: "Integrationer", href: "#integrationer" },
      { label: "Appar", href: "#tjanster" },
      { label: "Webb & plattformar", href: "#tjanster" },
      { label: "AI-integration", href: "#tjanster" },
    ],
  },
  {
    title: "Företaget",
    items: [
      { label: "Process", href: "#process" },
      { label: "Projekt", href: "#projekt" },
      { label: "Branscher", href: "#branscher" },
      { label: "Paket", href: "#paket" },
    ],
  },
  {
    title: "Kontakt",
    items: [
      { label: "info@auroramedia.se", href: "mailto:info@auroramedia.se" },
      { label: "Org.nr 559272-0220", href: "#" },
      { label: "Linköping, Sverige", href: "#" },
    ],
  },
];

const AuroraFooter = () => (
  <footer className="aurora-section-bg relative overflow-hidden border-t border-[hsl(var(--au-cream)/0.08)] pt-16 pb-10">
    <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-lg font-display text-base"
              style={{
                background: "linear-gradient(135deg, hsl(152 80% 50%), hsl(160 70% 28%))",
                color: "hsl(160 24% 6%)",
              }}
            >
              A
            </span>
            <span className="font-display text-base text-[hsl(var(--au-cream))]">
              AURORA MEDIA
            </span>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[hsl(var(--au-cream)/0.62)]">
            AI-driven mjukvarubyrå för svenska bolag. Vi bygger SaaS, appar
            och skräddarsydda system — med fast pris, snabb leverans och kod
            du äger från dag ett.
          </p>
        </div>

        {COLS.map((col) => (
          <div key={col.title} className="md:col-span-2">
            <p className="font-mono-au text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--au-cream)/0.4)]">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.items.map((it) => (
                <li key={it.label}>
                  <a
                    href={it.href}
                    className="text-sm text-[hsl(var(--au-cream)/0.75)] transition-colors hover:text-[hsl(152 80% 65%)]"
                  >
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="mt-14 flex flex-col-reverse gap-3 border-t pt-6 text-xs text-[hsl(var(--au-cream)/0.45)] sm:flex-row sm:justify-between"
        style={{ borderColor: "hsl(var(--au-cream) / 0.08)" }}
      >
        <p>© {new Date().getFullYear()} Aurora Media AB · Org.nr 559272-0220</p>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-[hsl(var(--au-cream)/0.85)]">Integritetspolicy</a>
          <a href="#" className="hover:text-[hsl(var(--au-cream)/0.85)]">Villkor</a>
        </div>
      </div>
    </div>
  </footer>
);

export default AuroraFooter;
