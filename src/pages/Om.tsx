import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import FinalCTASection from "@/components/FinalCTASection";
import Reveal from "@/components/Reveal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const products = [
  { name: "Aurora Transport", url: "https://auroratransport.se", desc: "Dispatching-SaaS för transport." },
  { name: "Updro", url: "https://updro.se", desc: "Marknadsplats för digitala tjänster." },
  { name: "AgilityManager", url: "https://agilitymanager.se", desc: "Träningsapp för agility-förare." },
  { name: "Hönsgården", url: "https://honsgarden.se", desc: "Värphönsapp för svenska hobbyhönsägare." },
  { name: "Odlingsdagboken", url: "https://odlingsdagboken.com", desc: "Svensk odlings-SaaS med AI-coach." },
  { name: "GoGlamping Sweden", url: "https://goglampingsweden.se", desc: "Bokningssajt för glamping vid Göta kanal." },
  { name: "Viriditas", url: "https://viriditasmassage.se", desc: "Bokningssajt för massagemottagning." },
];

const Section = ({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) => (
  <Reveal className="border-t border-border pt-12 md:pt-16">
    <p className="label-caps">{label}</p>
    <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em]">
      {title}
    </h2>
    <div className="mt-7 max-w-2xl text-lg leading-relaxed text-foreground/85">{children}</div>
  </Reveal>
);

const Om = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Om Aurora Media – AI-byrå i Linköping | Aurora Media AB",
      description:
        "Aurora Media AB är ett enmans-konsultbolag i Linköping. Bygger SaaS-produkter med AI-kodning. 7 egna produkter live, 10 år i säkerhetsbranschen. Org.nr 559272-0220.",
      canonical: "/om",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Om Aurora Media", url: "/om" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="pt-16 pb-16 md:pt-24 md:pb-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <Reveal>
              <p className="label-caps">Om</p>
              <h1 className="mt-4 font-serif text-[clamp(2.75rem,7vw,6rem)] leading-[1.05] tracking-[-0.02em]">
                Om Aurora Media.
              </h1>
              <p className="mt-7 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Ett enmans-konsultbolag i Linköping som bygger SaaS med AI-kodning. Här är hela
                historien.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Body sections */}
        <section className="pb-24">
          <div className="container mx-auto px-6 max-w-3xl space-y-16 md:space-y-20">
            <Section label="Sektion 1 · Vad" title="Vad är Aurora Media?">
              <p>
                Aurora Media AB är ett enmans-konsultbolag baserat i Linköping. Jag bygger
                SaaS-produkter, interna verktyg och webbsystem åt svenska företag med
                AI-kodningsverktyg. Fast pris, snabb leverans.
              </p>
            </Section>

            <Section label="Sektion 2 · Bakgrund" title="Min bakgrund.">
              <p>
                Innan jag drev Aurora Media på heltid arbetade jag 10 år i säkerhetsbranschen. Det
                är där jag lärde mig rutiner, precision och att leverera på tid även när trycket
                är högt. Sedan 2024 bygger jag SaaS på heltid – först mina egna produkter, nu även
                åt kunder.
              </p>
            </Section>

            <Section label="Sektion 3 · Metodik" title="Varför AI-kodning?">
              <p>
                2024 förändrades allt. Verktyg som Lovable och Claude gör det möjligt för en
                erfaren utvecklare att leverera på veckor det som tidigare tog team månader. Jag
                började bygga egna produkter som test. De blev riktiga företag med betalande
                kunder. Nu vet jag att metoden fungerar.
              </p>
            </Section>

            {/* Products */}
            <Reveal className="border-t border-border pt-12 md:pt-16">
              <p className="label-caps">Sektion 4 · Produkter</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em]">
                Mina egna produkter.
              </h2>
              <ul className="mt-8 divide-y divide-border border-y border-border">
                {products.map((p) => (
                  <li key={p.url}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-4 py-5 transition-colors hover:bg-secondary/40"
                    >
                      <div className="min-w-0">
                        <p className="font-serif text-xl md:text-2xl">{p.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground truncate">{p.desc}</p>
                      </div>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Company info */}
            <Reveal className="border-t border-border pt-12 md:pt-16">
              <p className="label-caps">Sektion 5 · Företagsinfo</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] tracking-[-0.02em]">
                Företagsinfo.
              </h2>
              <dl className="mt-8 grid gap-x-8 gap-y-3 text-base sm:grid-cols-2">
                <div>
                  <dt className="label-caps">Bolag</dt>
                  <dd className="mt-1 text-foreground/85">Aurora Media AB</dd>
                </div>
                <div>
                  <dt className="label-caps">Org.nr</dt>
                  <dd className="mt-1 text-foreground/85">559272-0220</dd>
                </div>
                <div>
                  <dt className="label-caps">Säte</dt>
                  <dd className="mt-1 text-foreground/85">Linköping</dd>
                </div>
                <div>
                  <dt className="label-caps">F-skatt</dt>
                  <dd className="mt-1 text-foreground/85">Ja</dd>
                </div>
                <div>
                  <dt className="label-caps">Moms (VAT)</dt>
                  <dd className="mt-1 text-foreground/85">SE559272022001</dd>
                </div>
                <div>
                  <dt className="label-caps">E-post</dt>
                  <dd className="mt-1">
                    <a
                      href="mailto:info@auroramedia.se"
                      className="text-foreground/85 underline-offset-4 hover:text-primary hover:underline"
                    >
                      info@auroramedia.se
                    </a>
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </section>

        <FinalCTASection />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default Om;
