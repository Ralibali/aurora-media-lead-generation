import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { Check } from "lucide-react";
import { setSEOMeta, setBreadcrumb, setJsonLd, removeJsonLd } from "@/lib/seoHelpers";

const lokalaFaqs = [
  {
    q: "Vad kostar en hemsida i Linköping?",
    a: "Min prototyp är 14 900 kr (3–5 dagar). En komplett företagshemsida hamnar oftast i MVP-paketet på 34 900 kr eller SaaS-paketet på 69 000 kr om det ska finnas inloggning, betalningar eller dashboards. Fast pris alltid.",
  },
  {
    q: "Behöver jag verkligen en lokal byrå i Linköping?",
    a: "Inte tekniskt. Men jag är baserad i Linköping och tar gärna fysiska möten i regionen om det underlättar. För 90 procent av kunderna räcker video-möten – jag jobbar med kunder i hela Sverige.",
  },
  {
    q: "Hur skiljer du dig från en traditionell webbyrå i Linköping?",
    a: "Tre saker: jag bygger med AI så det går 3–5 gånger snabbare, jag jobbar fast pris så du vet vad du betalar, och jag är ensam vilket betyder ingen byråkrati och inga mellanled.",
  },
  {
    q: "Bygger du WordPress-sajter?",
    a: "Nej, jag bygger React-sajter med Supabase som backend. Det är snabbare, säkrare och enklare att driftsätta än WordPress för moderna behov. Om du redan har WordPress kan jag bygga om eller komplettera.",
  },
];

const WebbyraLinkoping = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "Webbyrå Linköping – AI-byggda hemsidor & SaaS från 14 900 kr",
      description:
        "Lokal webbyrå i Linköping som bygger snabba hemsidor och SaaS med AI. Fast pris från 14 900 kr, leverans på 1–2 veckor. Möten i centrala Linköping eller Mjärdevi.",
      canonical: "/webbbyra-linkoping",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Webbyrå Linköping", url: "/webbbyra-linkoping" },
    ]);
    setJsonLd("webbyra-faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: lokalaFaqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    return () => {
      removeJsonLd("breadcrumb-jsonld");
      removeJsonLd("webbyra-faq");
    };
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <p className="label-caps">Webbyrå Linköping</p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05]">
              Webbyrå Linköping –{" "}
              <em className="italic text-primary">AI-byggda hemsidor och SaaS</em>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              En traditionell webbyrå i Linköping bygger din hemsida på 2 månader för 80 000 kr.
              Jag bygger den på 1 vecka med AI för en tredjedel av priset. Samma kvalitet,
              snabbare leverans, fast pris.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => open()}>Starta ett projekt</Button>
              <a
                href="mailto:info@auroramedia.se"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm hover:bg-secondary transition-colors"
              >
                info@auroramedia.se
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-20">
          <div className="container mx-auto px-6 max-w-3xl space-y-10">
            <div>
              <h2 className="font-serif text-3xl">Varför Aurora Media som webbyrå i Linköping?</h2>
              <p className="mt-5 text-base leading-relaxed text-foreground/85">
                Jag är Christoffer och driver Aurora Media AB från Linköping. Det här är inte
                en byrå med 15 anställda och projektledare. Det är jag, AI-verktyg som Lovable
                och Bolt, och 7 egna SaaS-produkter live som bevis på att metoden fungerar.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground/85">
                För dig som företagare i Linköping eller Östergötland betyder det: snabbare
                leverans, lägre pris och en enda kontaktperson som faktiskt bygger sajten själv.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl">Vad jag bygger åt företag i Linköping</h2>
              <ul className="mt-5 space-y-3 text-base text-foreground/85">
                <li className="flex gap-2"><Check className="mt-1 h-4 w-4 text-primary shrink-0" /> Företagshemsidor med modern design och stark SEO</li>
                <li className="flex gap-2"><Check className="mt-1 h-4 w-4 text-primary shrink-0" /> Bokningssajter (frisör, massör, restaurang, glamping)</li>
                <li className="flex gap-2"><Check className="mt-1 h-4 w-4 text-primary shrink-0" /> Interna verktyg som ersätter Excel-ark och manuella processer</li>
                <li className="flex gap-2"><Check className="mt-1 h-4 w-4 text-primary shrink-0" /> Betal-SaaS med Stripe och användarkonton</li>
                <li className="flex gap-2"><Check className="mt-1 h-4 w-4 text-primary shrink-0" /> Marknadsplatser och tvåsidiga plattformar</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-3xl">Snabbare än traditionell webbyrå</h2>
              <p className="mt-5 text-base leading-relaxed text-foreground/85">
                En traditionell webbyrå i Linköping skissar i Figma i 2 veckor, kodar i 6 veckor
                och driftsätter i vecka 9. Jag hoppar över hela mockup-fasen. Du loggar in i en
                klickbar prototyp dag 3 och har en färdig produkt på 1–4 veckor beroende på
                omfattning.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground/85">
                Det går snabbare för att AI skriver större delen av koden. Jag styr arkitekturen,
                designen och kvalitetskontrollen. Slutprodukten är standard React + Supabase –
                samma teknologi de stora byråerna använder, bara producerad effektivare.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl">Lokalt baserad, jobbar i hela Sverige</h2>
              <p className="mt-5 text-base leading-relaxed text-foreground/85">
                Jag är baserad i Linköping och tar fysiska möten i Östergötland när det
                underlättar. Större delen av jobbet sker dock digitalt – det är så jag kan jobba
                lika nära med en kund i Malmö som med en kund i Mjölby.
              </p>
            </div>
          </div>
        </section>

        <FAQSection items={lokalaFaqs} title="Vanliga frågor om webbyrå i Linköping" />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default WebbyraLinkoping;
