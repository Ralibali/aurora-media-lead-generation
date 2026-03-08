import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import { MapPin, Code, Search, Megaphone, Share2, PenTool, Camera, CheckCircle, ArrowRight } from "lucide-react";

const services = [
  { icon: Code, title: "Webbdesign & Webbutveckling", desc: "Moderna, responsiva hemsidor byggda för att konvertera besökare till kunder. WordPress, e-handel och skräddarsydda lösningar." },
  { icon: Search, title: "SEO – Sökmotoroptimering", desc: "Lokal SEO som får ert företag att synas högst upp i Google. Teknisk SEO, on-page och länkbygge." },
  { icon: Megaphone, title: "Google Ads & Annonsering", desc: "Datadriven annonsering med full transparens. Ni ser exakt vart varje krona går – vi tar bara 15% i administration." },
  { icon: Share2, title: "Sociala Medier", desc: "Strategi, innehåll och hantering av Instagram, Facebook, LinkedIn & TikTok för att bygga ert varumärke lokalt." },
  { icon: PenTool, title: "Content Marketing", desc: "SEO-optimerade bloggartiklar, webbtexter och nyhetsbrev som driver trafik och bygger förtroende." },
  { icon: Camera, title: "Fotografering & Video", desc: "Professionellt foto och video som stärker ert varumärke online och offline." },
];

const benefits = [
  "Lokalt kontor i Linköping – personliga möten",
  "Full transparens i prissättning och resultat",
  "Alla digitala tjänster under ett tak",
  "Månatliga rapporter med konkreta resultat",
  "Snabba leveranser utan att kompromissa med kvalitet",
  "Långsiktigt partnerskap – inte engångsprojekt",
];

const WebbyraLinkoping = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="uppercase tracking-[0.3em]">Linköping, Östergötland</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-8 max-w-5xl mx-auto leading-tight">
            Webbbyrå i Linköping – <span className="aurora-text">webbdesign, SEO & digital marknadsföring</span>
          </h1>
          <p className="text-lg md:text-xl text-secondary-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
            Letar du efter en pålitlig <strong>webbbyrå i Linköping</strong> som hjälper ditt företag att synas, växa och sälja mer online? 
            Aurora Media AB erbjuder allt du behöver – från moderna hemsidor och sökmotoroptimering till Google Ads och sociala medier.
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
            Vi kombinerar lokal närvaro i Linköping med expertis inom digital marknadsföring för att leverera mätbara resultat för företag i hela Östergötland.
          </p>
          <a
            href="#kontakt-linkoping"
            className="inline-block aurora-gradient text-primary-foreground font-display font-semibold px-8 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity animate-pulse-glow"
          >
            Få en kostnadsfri offert
          </a>
        </div>
      </section>

      {/* Intro text - SEO rich */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
            Din digitala partner i Linköping
          </h2>
          <div className="prose prose-invert max-w-none text-secondary-foreground text-lg leading-relaxed space-y-6">
            <p>
              I dagens digitala landskap räcker det inte med att bara ha en hemsida – den måste vara snabb, mobilanpassad, 
              SEO-optimerad och bygga förtroende hos besökaren redan inom de första sekunderna. Som <strong>webbbyrå i Linköping</strong> hjälper 
              vi företag att inte bara synas online, utan att faktiskt konvertera besökare till betalande kunder.
            </p>
            <p>
              Aurora Media AB grundades med en enkel vision: att ge lokala företag i Linköping och Östergötland tillgång till 
              samma digitala verktyg och strategier som de stora aktörerna använder. Vi tror på full transparens, mätbara resultat 
              och långsiktiga partnerskap.
            </p>
            <p>
              Oavsett om du driver en restaurang på Stora Torget, en advokatbyrå i centrum eller ett tillverkningsföretag i 
              industriområdet – vi anpassar våra digitala lösningar efter just ditt företags behov och mål. Med oss får du en 
              dedikerad partner som förstår den lokala marknaden i Linköping och levererar resultat du kan mäta.
            </p>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
            Våra tjänster för företag i Linköping
          </h2>
          <p className="text-muted-foreground text-lg text-center mb-12 max-w-2xl mx-auto">
            Allt ni behöver för att lyckas digitalt – under ett och samma tak.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="p-8 rounded-xl bg-card aurora-border hover:aurora-glow transition-all duration-500">
                <s.icon className="w-8 h-8 text-primary mb-5" />
                <h3 className="text-xl font-display font-semibold mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose local */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Varför välja en lokal webbbyrå i Linköping?
              </h2>
              <p className="text-secondary-foreground text-lg leading-relaxed mb-6">
                Att arbeta med en lokal webbbyrå innebär att ni får en partner som förstår er marknad, era kunder och 
                era konkurrenter. Vi kan träffas över en fika, vi förstår lokala sökbeteenden och vi bryr oss om ert företags 
                framgång på riktigt.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Till skillnad från stora, opersonliga byråer i Stockholm eller Göteborg erbjuder vi personlig service med 
                direktkontakt. Ni är aldrig bara ett ärendenummer – ni är vår partner.
              </p>
            </div>
            <div className="space-y-4">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-secondary-foreground">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WordPress section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
            WordPress-hemsidor för företag i Linköping
          </h2>
          <div className="text-secondary-foreground text-lg leading-relaxed space-y-6">
            <p>
              <strong>WordPress</strong> driver över 40% av alla webbplatser i världen – och det finns goda skäl till det. Som{" "}
              <strong>WordPress-webbbyrå i Linköping</strong> bygger vi hemsidor som är enkla att uppdatera, snabba att ladda 
              och fullt optimerade för sökmotorer.
            </p>
            <p>
              Vi skräddarsyr varje WordPress-hemsida efter ert varumärke och era affärsmål. Oavsett om ni behöver en enkel 
              presentationssida, en blogg eller en komplett e-handelsbutik med WooCommerce – vi levererar lösningar som ser 
              professionella ut och fungerar felfritt på alla enheter.
            </p>
            <p>
              Alla våra WordPress-hemsidor levereras med SSL-certifikat, cacheoptimering, säkerhetsuppdateringar och backup-lösning. 
              Vi erbjuder även löpande underhållsavtal så att ni kan fokusera på er kärnverksamhet medan vi tar hand om tekniken.
            </p>
          </div>
        </div>
      </section>

      {/* SEO section */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
            SEO för företag i Linköping – syns ni på Google?
          </h2>
          <div className="text-secondary-foreground text-lg leading-relaxed space-y-6">
            <p>
              75% av alla som söker på Google klickar aldrig förbi första sidan. Om ert företag inte syns där, missar ni potentiella 
              kunder varje dag. Som <strong>SEO-byrå i Linköping</strong> hjälper vi er att klättra i sökresultaten med beprövade 
              strategier som ger långsiktiga resultat.
            </p>
            <p>
              Vår SEO-process börjar alltid med en grundlig analys av er nuvarande webbplats, era konkurrenter och relevanta sökord 
              i er bransch. Vi tittar på allt från teknisk SEO och laddningstider till innehållskvalitet och lokal synlighet i Google Maps.
            </p>
            <p>
              Lokal SEO är särskilt viktigt för företag i Linköping. Vi optimerar er Google Business Profile, bygger lokala 
              citat och säkerställer att ni syns när potentiella kunder söker efter era tjänster i Linköping och Östergötland.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt-linkoping" className="py-20">
        <div className="container mx-auto px-6">
          <div className="aurora-gradient rounded-2xl p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Redo att växa med en webbbyrå i Linköping?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Berätta om ert projekt – vi återkommer med en kostnadsfri analys och offert. Inga förpliktelser, bara möjligheter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/#kontakt"
                className="inline-flex items-center justify-center gap-2 bg-background text-foreground font-display font-semibold px-8 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity"
              >
                Kontakta oss <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@auroramedia.se"
                className="inline-flex items-center justify-center gap-2 border-2 border-primary-foreground/30 text-primary-foreground font-display font-semibold px-8 py-4 rounded-lg text-lg hover:bg-primary-foreground/10 transition-colors"
              >
                info@auroramedia.se
              </a>
            </div>
          </div>
        </div>
      </section>

      <FAQSection />
      <Footer />
    </div>
  );
};

export default WebbyraLinkoping;
