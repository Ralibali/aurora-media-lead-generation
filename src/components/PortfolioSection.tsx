import { ArrowUpRight } from "lucide-react";

export const cases = [
  {
    name: "Aurora Transport",
    domain: "auroratransport.se",
    tagline: "Dispatching-SaaS för svenska transportbolag",
    meta: "3 veckor · Lovable + Supabase + Stripe + Fortnox API",
    status: "Live · Betalande kund",
  },
  {
    name: "Updro",
    domain: "updro.se",
    tagline: "Marknadsplats där företag jämför offerter från digitala byråer",
    meta: "4 veckor · Lovable + Supabase + Stripe Connect",
    status: "Live · Lanserad 2026",
  },
  {
    name: "AgilityManager",
    domain: "agilitymanager.se",
    tagline: "Träningsapp för svenska agility-förare",
    meta: "3 veckor · Lovable + Supabase + Firecrawl",
    status: "Live · Betalande användare",
  },
  {
    name: "Hönsgården",
    domain: "honsgarden.se",
    tagline: "Freemium-app för svenska hönsägare",
    meta: "2 veckor · Lovable + Supabase + RevenueCat",
    status: "Live · 67 procent premium-konvertering",
  },
  {
    name: "Odlingsdagboken",
    domain: "odlingsdagboken.com",
    tagline: "Svensk odlings-SaaS med AI-coach",
    meta: "3 veckor · Lovable + Supabase + Claude API",
    status: "Live · Premium 99 kr/år",
  },
  {
    name: "GoGlamping Sweden",
    domain: "goglampingsweden.se",
    tagline: "Bokningssajt för glamping vid Göta kanal",
    meta: "2 veckor · React + Sirvoy-integration",
    status: "Live · Öppnar maj 2026",
  },
  {
    name: "Viriditas",
    domain: "viriditasmassage.se",
    tagline: "Bokningssajt för massagemottagning",
    meta: "1 vecka · React + Vite",
    status: "Live · Betalande kund",
  },
];

const PortfolioSection = () => {
  return (
    <section id="portfolj" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl">
          <p className="label-caps">Portfölj</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Det jag har byggt</h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Sju produkter jag byggt och driver själv. Alla är live. Alla används av riktiga
            människor. Samma kvalitet levererar jag åt dig.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <a
              key={c.domain}
              href={`https://${c.domain}`}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex aspect-[16/10] items-center justify-center border-b border-border bg-secondary/40">
                <span className="font-serif text-2xl text-foreground/70">{c.domain}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-2xl">{c.name}</h3>
                  <ArrowUpRight className="mt-1 h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <p className="mt-2 text-sm text-foreground/80">{c.tagline}</p>
                <p className="mt-4 text-xs text-muted-foreground">{c.meta}</p>
                <p className="mt-2 text-xs text-primary">{c.status}</p>
              </div>
            </a>
          ))}
        </div>

        <p className="mt-12 max-w-3xl font-serif italic text-2xl text-foreground/80">
          Alla produkter ovan är byggda av mig. Alla är live just nu. Ingen vaporware. Inga mockups.
          Ingen "kommer snart".
        </p>
      </div>
    </section>
  );
};

export default PortfolioSection;
