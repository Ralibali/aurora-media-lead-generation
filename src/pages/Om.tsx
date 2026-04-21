import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import { ArrowUpRight } from "lucide-react";

const products = [
  { name: "Aurora Transport", url: "https://auroratransport.se" },
  { name: "Updro", url: "https://updro.se" },
  { name: "AgilityManager", url: "https://agilitymanager.se" },
  { name: "Hönsgården", url: "https://honsgarden.se" },
  { name: "Odlingsdagboken", url: "https://odlingsdagboken.com" },
  { name: "GoGlamping Sweden", url: "https://goglampingsweden.se" },
  { name: "Viriditas", url: "https://viriditasmassage.se" },
];

const Om = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="container mx-auto px-6 max-w-3xl">
            <p className="label-caps">Om</p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05]">Om Aurora Media</h1>
          </div>
        </section>

        <section className="pb-24">
          <div className="container mx-auto px-6 max-w-3xl space-y-16">
            <div>
              <h2 className="font-serif text-3xl">Vad är Aurora Media?</h2>
              <p className="mt-5 text-lg text-foreground/85 leading-relaxed">
                Aurora Media AB är ett enmans-konsultbolag baserat i Linköping. Jag bygger
                SaaS-produkter, interna verktyg och webbsystem åt svenska företag – med
                AI-kodningsverktyg som Lovable, Bolt och Emergent som huvudsakligt byggverktyg.
                Fast pris, snabb leverans.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl">Min bakgrund</h2>
              <p className="mt-5 text-lg text-foreground/85 leading-relaxed">
                Innan jag drev Aurora Media på heltid arbetade jag 10 år i säkerhetsbranschen. Det
                är där jag lärde mig rutiner, precision och att leverera på tid även när trycket
                är högt. Sedan 2024 bygger jag SaaS-produkter på heltid – först mina egna sju
                produkter, nu även åt kunder.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl">Varför AI-kodning?</h2>
              <p className="mt-5 text-lg text-foreground/85 leading-relaxed">
                2024 förändrades allt. Verktyg som Lovable och Claude gör det möjligt för en
                erfaren utvecklare att leverera på veckor det som tidigare tog ett team månader.
                Jag började bygga mina egna produkter som test. De blev riktiga företag med
                betalande kunder. Nu vet jag att metoden fungerar – inte bara på papper.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl">Mina egna produkter</h2>
              <ul className="mt-5 space-y-2">
                {products.map((p) => (
                  <li key={p.url}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-base text-foreground/85 hover:text-primary"
                    >
                      {p.name}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-3xl">Företagsinfo</h2>
              <dl className="mt-5 space-y-2 text-base text-foreground/85">
                <div><dt className="inline text-muted-foreground">Bolag: </dt><dd className="inline">Aurora Media AB</dd></div>
                <div><dt className="inline text-muted-foreground">Org.nr: </dt><dd className="inline">559272-0220</dd></div>
                <div><dt className="inline text-muted-foreground">Säte: </dt><dd className="inline">Linköping</dd></div>
                <div><dt className="inline text-muted-foreground">F-skatt: </dt><dd className="inline">Ja</dd></div>
                <div><dt className="inline text-muted-foreground">VAT: </dt><dd className="inline">SE559272022001</dd></div>
                <div><dt className="inline text-muted-foreground">E-post: </dt><dd className="inline"><a href="mailto:info@auroramedia.se" className="hover:text-primary">info@auroramedia.se</a></dd></div>
              </dl>
            </div>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default Om;
