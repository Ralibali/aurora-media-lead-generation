import { Camera, Code, Search, Share2, PenTool, Megaphone, TrendingUp, BarChart3, Users, Target, Zap, Heart } from "lucide-react";

const services = [
  {
    icon: Share2,
    title: "Sociala Medier",
    description: "Vi tar över hela ert sociala medielandskap.",
    details: [
      "Strategisk innehållsplanering och content-kalender",
      "Daglig hantering av Instagram, Facebook, TikTok & LinkedIn",
      "Community management – vi svarar, kommenterar och engagerar",
      "Månatliga rapporter med insikter om räckvidd, engagemang och tillväxt",
      "Hashtag-strategi och trendbevakning för maximal synlighet",
    ],
    stat: "70%",
    statLabel: "av konsumenter föredrar att lära känna varumärken via sociala medier",
  },
  {
    icon: Camera,
    title: "Fotografering",
    description: "Professionella bilder som stärker ert varumärke.",
    details: [
      "Produktfotografering för e-handel och sociala medier",
      "Porträtt och profilbilder för team och ledning",
      "Eventfotografering och reportage",
      "Bildbehandling och retuschering ingår alltid",
      "Leverans av bilder i alla format – webb, print och sociala medier",
    ],
    stat: "94%",
    statLabel: "mer engagemang med professionella bilder vs. stockfoton",
  },
  {
    icon: PenTool,
    title: "Content & Blogg",
    description: "Texter som både människor och Google älskar.",
    details: [
      "SEO-optimerade bloggartiklar som rankar högt i sökresultaten",
      "Copywriting för hemsida, landningssidor och nyhetsbrev",
      "Content-strategi baserad på sökordanalys och målgruppsinsikter",
      "Tonalitetsdokument så att ert varumärke alltid låter konsekvent",
      "Löpande uppdatering av befintligt innehåll för bättre ranking",
    ],
    stat: "3x",
    statLabel: "fler leads genereras av content marketing jämfört med traditionell annonsering",
  },
  {
    icon: Code,
    title: "Webbutveckling & Design",
    description: "Hemsidor som konverterar besökare till kunder.",
    details: [
      "Responsiva hemsidor med modern design och snabb laddningstid",
      "E-handelsbutiker med WooCommerce eller Shopify",
      "Logotyp och grafisk identitet – från grunden eller uppdatering",
      "UX/UI-design som prioriterar användarupplevelse och konvertering",
      "Löpande underhåll, uppdateringar och teknisk support",
    ],
    stat: "53%",
    statLabel: "av besökare lämnar en sida som laddar långsammare än 3 sekunder",
  },
  {
    icon: Search,
    title: "Sökmotoroptimering (SEO)",
    description: "Hamna högst på Google – organiskt och hållbart.",
    details: [
      "Teknisk SEO-audit för att hitta och åtgärda dolda problem",
      "On-page-optimering av titlar, meta-beskrivningar och struktur",
      "Sökordanalys och konkurrentbevakning för er bransch",
      "Länkbygge och off-page-strategier som stärker er auktoritet",
      "Månatliga SEO-rapporter med konkreta förbättringsförslag",
    ],
    stat: "75%",
    statLabel: "av användare scrollar aldrig förbi första sidan på Google",
  },
  {
    icon: Megaphone,
    title: "Digital Marknadsföring",
    description: "Annonsering med full transparens – ni ser varje krona.",
    details: [
      "Kampanjer på Meta Ads, Google Ads, TikTok Ads & Snapchat Ads",
      "A/B-testning av annonser, målgrupper och budskap",
      "Retargeting-strategier som fångar upp tveksamma besökare",
      "Konverteringsspårning och ROI-analys i realtid",
      "Endast 15% av spenderat belopp i administrationsavgift – helt transparent",
    ],
    stat: "200%",
    statLabel: "genomsnittlig ROI på väl optimerade digitala annonskampanjer",
  },
];

const ServicesSection = () => {
  return (
    <section id="tjanster" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Vad vi gör</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Våra tjänster</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Vi erbjuder ett komplett utbud av digitala tjänster under ett tak. Oavsett om ni behöver synas mer i sociala medier, 
            ranka högre på Google eller bygga en ny hemsida – vi har lösningen.
          </p>
        </div>

        {/* Quick overview grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {services.map((service) => (
            <a
              key={service.title}
              href={`#service-${service.title.toLowerCase().replace(/[^a-zåäö0-9]/g, '-')}`}
              className="group p-8 rounded-xl bg-card aurora-border hover:aurora-glow transition-all duration-500"
            >
              <service.icon className="w-8 h-8 text-primary mb-5 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-display font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              <p className="text-primary text-sm mt-4 font-medium group-hover:underline">Läs mer ↓</p>
            </a>
          ))}
        </div>

        {/* Detailed service breakdowns */}
        <div className="space-y-20">
          {services.map((service, i) => (
            <div
              key={service.title}
              id={`service-${service.title.toLowerCase().replace(/[^a-zåäö0-9]/g, '-')}`}
              className={`grid md:grid-cols-2 gap-12 items-center scroll-mt-24 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg aurora-gradient flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold">{service.title}</h3>
                </div>
                <p className="text-muted-foreground text-lg mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-3">
                      <Zap className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span className="text-secondary-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="bg-card rounded-2xl p-10 aurora-border text-center">
                  <p className="text-5xl md:text-6xl font-display font-bold aurora-text mb-3">{service.stat}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{service.statLabel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
