import { ArrowRight } from "lucide-react";
import ServicePageTemplate from "./ServicePageTemplate";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";

const Seo = () => {
  const { open } = useContactModal();

  return (
    <ServicePageTemplate
      slug="seo"
      title="SEO från 2 490 kr."
      intro="Teknisk SEO, on-page och lokal SEO för Linköping. Inga 12-månaderskontrakt. Bara mätbara förbättringar."
      paketName="SEO"
      seoTitle="SEO Linköping från 2 490 kr – teknisk + lokal SEO | Aurora Media"
      seoDescription="Tekniskt SEO-paket för svenska sajter. Audit, on-page, lokal SEO för Linköping och Östergötland. Fast pris från 2 490 kr. Inga månadsbindningar."
      includes={[
        "Teknisk audit (Core Web Vitals, indexering, schema)",
        "Sitemap, robots.txt och canonical-strategi",
        "On-page-optimering av nyckelsidor",
        "Schema.org-markup (Organization, FAQ, Article)",
        "Lokal SEO (Google Business Profile, citations)",
        "Search Console- och GA4-uppsättning",
        "Konkurrentanalys på dina viktigaste sökord",
        "Rapport med 30-dagars åtgärdslista",
      ]}
      process={[
        { label: "Steg 1", title: "Audit", body: "Crawl + manuell genomgång. Du får en prioriterad lista." },
        { label: "Steg 2", title: "Quick wins", body: "Allt som kan fixas på en vecka körs först. Tekniska fel, schema, indexering." },
        { label: "Steg 3", title: "On-page", body: "Titlar, meta, intern länkning, innehåll. Sida för sida." },
        { label: "Steg 4", title: "Mätning", body: "GSC + GA4-uppsättning så du själv kan följa effekten." },
      ]}
      tiers={[
        { name: "Audit", price: "2 490 kr", time: "Två dagar", desc: "Teknisk audit + åtgärdslista. Du fixar själv eller betalar för implementation.", features: ["Teknisk crawl", "On-page review", "Konkurrentanalys", "Prioriterad åtgärdslista"] },
        { name: "Audit + fix", price: "6 900 kr", time: "En vecka", desc: "Allt i Audit – plus jag fixar de tekniska och on-page-bitarna.", features: ["Allt i Audit", "Tekniska fixar", "On-page-implementation", "Schema-markup"], featured: true },
        { name: "Lokal SEO", price: "Från 4 900 kr", time: "En vecka", desc: "Google Business Profile, citations, lokala sidor.", features: ["GBP-optimering", "Citations & länkar", "Lokala landningssidor", "Recensionsstrategi"] },
      ]}
      pricingNote={
        <>
          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border bg-secondary/50 px-6 py-4">
              <p className="label-caps">Snabb jämförelse</p>
              <h3 className="mt-1 font-serif text-xl md:text-2xl">Audit vs. Audit + fix</h3>
            </div>
            <ul className="divide-y divide-border text-sm">
              {[
                { label: "Teknisk crawl & rapport", a: true, b: true },
                { label: "On-page review", a: true, b: true },
                { label: "Konkurrentanalys", a: true, b: true },
                { label: "Prioriterad åtgärdslista", a: true, b: true },
                { label: "Tekniska fixar implementeras", a: false, b: true },
                { label: "On-page-optimering körs av mig", a: false, b: true },
                { label: "Schema-markup installeras", a: false, b: true },
                { label: "Du behöver göra jobbet själv", a: true, b: false },
              ].map((row) => (
                <li key={row.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-3">
                  <span className="text-foreground/85">{row.label}</span>
                  <span className={`w-20 text-center text-xs font-medium ${row.a ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {row.a ? "✓ Audit" : "—"}
                  </span>
                  <span className={`w-24 text-center text-xs font-medium ${row.b ? "text-primary" : "text-muted-foreground/50"}`}>
                    {row.b ? "✓ Audit + fix" : "—"}
                  </span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-secondary/30">
              <div className="px-6 py-4">
                <p className="text-xs text-muted-foreground">Audit</p>
                <p className="mt-1 font-serif text-2xl">2 490 kr</p>
              </div>
              <div className="px-6 py-4">
                <p className="text-xs text-primary">Audit + fix</p>
                <p className="mt-1 font-serif text-2xl text-primary">6 900 kr</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 px-8 py-10 text-center sm:px-12">
            <h3 className="font-serif text-2xl md:text-3xl tracking-[-0.01em]">
              Osäker på vilket paket som passar?
            </h3>
            <p className="max-w-xl text-base text-muted-foreground">
              Skicka några rader om din sajt så återkommer jag inom 24 timmar med en konkret offert – kostnadsfritt och utan förpliktelser.
            </p>
            <Button size="lg" onClick={() => open("SEO")} className="group mt-2">
              Be om offert
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </>
      }
      whyAffordable="SEO är hantverk, men 80% är samma checklista varje gång. Jag använder mina egna verktyg och AI för att speed-runa audit och on-page – utan att kompromissa på kvalitet."
      faqs={[
        { q: "Hur lång tid tar det att se resultat?", a: "Tekniska fixar syns ofta inom 2–4 veckor. On-page tar 1–3 månader. Innehållsbaserad ranking 3–6 månader. Inga garantier på exakta positioner – det vore fusk." },
        { q: "Kan ni garantera plats 1 på Google?", a: "Nej. Den som lovar det ljuger. Jag lovar mätbara förbättringar i synlighet, klick och konvertering." },
        { q: "Behöver jag löpande SEO?", a: "Inte alltid. Många klarar sig med en grundlig audit + fix, sen content varje månad. Jag säger till om du behöver mer." },
        { q: "Hjälper du med innehåll?", a: "Ja, se Content-tjänsten. SEO-optimerade artiklar från 995 kr/styck." },
        { q: "Lite dyrt va?", a: "Jag förstår reaktionen, men jämför med vad du faktiskt får. I Audit ingår teknisk crawl, on-page-genomgång, konkurrentanalys och en prioriterad åtgärdslista – arbete som tar mig två fulla dagar. Audit + fix lägger till själva implementationen av tekniska fixar, on-page och schema, vilket annars motsvarar 8–12 timmars utvecklarjobb hos en byrå (15 000–25 000 kr). Jag jobbar med fast pris så att du vet exakt vad du betalar – inga timmar som tickar, inga överraskningar och inga månadsbindningar." },
      ]}
      related={[
        { name: "Content", price: "995 kr/artikel", to: "/tjanster/content" },
        { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
        { name: "Google Ads", price: "3 900 kr setup", to: "/tjanster/google-ads" },
      ]}
    />
  );
};

export default Seo;
