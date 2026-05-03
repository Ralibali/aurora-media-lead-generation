import { useEffect } from "react";
import { ArrowUpRight, Code2, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import FinalCTASection from "@/components/FinalCTASection";
import Reveal from "@/components/Reveal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const products = [
  { name: "Aurora Transport", url: "https://auroratransport.se", desc: "B2B-system för transport, dispatch och orderflöden." },
  { name: "Updro", url: "https://updro.se", desc: "Svensk marknadsplats för digitala tjänster." },
  { name: "AgilityManager", url: "https://agilitymanager.se", desc: "Tränings- och planeringsapp för agilityförare." },
  { name: "Hönsgården", url: "https://honsgarden.se", desc: "SaaS för hönsägare med flock, ägg, hälsa och rutiner." },
  { name: "Odlingsdagboken", url: "https://odlingsdagboken.com", desc: "Svensk odlingsplattform med struktur och AI-stöd." },
];

const principles = [
  { icon: Sparkles, title: "Output före workshop", body: "Strategi är bra. Men värdet kommer när idén blir en produkt som går att använda." },
  { icon: Code2, title: "Kod du äger", body: "GitHub-repo, databasstruktur och dokumentation ska kunna tas vidare utan leverantörslåsning." },
  { icon: ShieldCheck, title: "Säkert från start", body: "Behörigheter, RLS, datamodell och driftbarhet byggs in tidigt — inte som eftertanke." },
];

const Om = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Om Aurora Media – AI-builder i Linköping | Aurora Media AB",
      description:
        "Aurora Media AB bygger SaaS, MVP:er, interna appar och AI-automationer åt svenska företag. Fast pris, snabb leverans och kod kunden äger.",
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
      <main className="overflow-hidden">
        <section className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <Reveal>
              <p className="label-caps">Om Aurora Media</p>
              <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-tight">
                AI-buildern bakom Aurora Media.
              </h1>
              <p className="mt-7 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Jag heter Christoffer Holstensson och driver Aurora Media AB i Linköping. Jag bygger SaaS, MVP:er, interna appar och AI-automationer åt svenska bolag — snabbt, konkret och med kod kunden äger.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <p className="label-caps">Vad Aurora är</p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Inte ännu en AI-workshop.</h2>
            </Reveal>
            <Reveal>
              <div className="space-y-5 text-lg leading-relaxed text-white/72">
                <p>Aurora Media är byggt runt en enkel idé: företag behöver inte fler slides om AI. De behöver fungerande system, prototyper, MVP:er och automationer som gör jobbet.</p>
                <p>Jag använder AI-kodning, moderna verktyg och tydlig produktstruktur för att leverera snabbare än klassiska byråflöden — men utan att tumma på datamodell, säkerhet eller ägande.</p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <p className="label-caps">Principer</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Så jobbar jag.</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {principles.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-[1.5rem] border border-white/12 bg-white/[0.055] p-6 backdrop-blur-2xl">
                  <Icon className="h-6 w-6 text-blue-200" />
                  <h3 className="mt-5 font-display text-2xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/62">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <Reveal>
              <p className="label-caps">Egna produkter</p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Jag bygger inte bara åt andra.</h2>
              <p className="mt-4 max-w-2xl text-white/62">Aurora bygger och driver även egna produkter. Det gör att jag tänker som founder, inte bara leverantör.</p>
            </Reveal>
            <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {products.map((p) => (
                <li key={p.url}>
                  <a href={p.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 py-5 transition-colors hover:bg-white/[0.035]">
                    <div className="min-w-0">
                      <p className="font-display text-xl md:text-2xl">{p.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground truncate">{p.desc}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <p className="label-caps">Företagsinfo</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Aurora Media AB.</h2>
            <dl className="mt-8 grid gap-x-8 gap-y-5 text-base sm:grid-cols-2">
              <div><dt className="label-caps">Bolag</dt><dd className="mt-1 text-foreground/85">Aurora Media AB</dd></div>
              <div><dt className="label-caps">Org.nr</dt><dd className="mt-1 text-foreground/85">559272-0220</dd></div>
              <div><dt className="label-caps">Säte</dt><dd className="mt-1 text-foreground/85">Linköping</dd></div>
              <div><dt className="label-caps">VAT</dt><dd className="mt-1 text-foreground/85">SE559272022001</dd></div>
              <div><dt className="label-caps">E-post</dt><dd className="mt-1"><a href="mailto:info@auroramedia.se" className="text-foreground/85 underline-offset-4 hover:text-primary hover:underline">info@auroramedia.se</a></dd></div>
              <div><dt className="label-caps">Fokus</dt><dd className="mt-1 text-foreground/85">SaaS, MVP, AI-automation och digitala produkter</dd></div>
            </dl>
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
