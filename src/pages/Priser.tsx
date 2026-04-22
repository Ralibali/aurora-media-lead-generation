import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { paket } from "@/components/PaketSection";
import { Check } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import FAQSection from "@/components/FAQSection";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const tillagg = [
  { name: "Extra feature", price: "Från 8 000 kr", desc: "En ny funktion utöver det som ingår i paketet." },
  { name: "SEO-paket", price: "Från 12 000 kr", desc: "Teknisk audit, on-page-optimering och innehållsplan." },
  { name: "Löpande underhåll", price: "1 990 kr/mån", desc: "Bugfixar, säkerhetsuppdateringar, mindre justeringar (upp till 2 timmar/mån)." },
  { name: "Retainer", price: "Från 12 000 kr/mån", desc: "Löpande utveckling om du behöver nya features varje månad." },
];

const prisFaqs = [
  {
    q: "Hur betalar jag?",
    a: "50 procent vid projektstart, 50 procent vid leverans. Faktura med 30 dagars betalningsvillkor. F-skatt via Aurora Media AB.",
  },
  {
    q: "Vad ingår i garantin?",
    a: "Om prototypen dag 3 inte motsvarar förväntningarna, betalar du inget. Då går vi skilda vägar utan kostnad.",
  },
  {
    q: "Är moms inkluderad?",
    a: "Alla priser är exklusive moms. 25 procent moms tillkommer för svenska företag.",
  },
  {
    q: "Vad händer om scope ändras under projektet?",
    a: "Mindre justeringar ingår. Större tillägg offereras separat innan vi börjar bygga – aldrig i efterhand.",
  },
];

const Priser = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "Priser – fast pris från 14 900 kr | SaaS, MVP & webb",
      description:
        "Transparenta paket för AI-byggd SaaS: Prototyp 14 900 kr, MVP 34 900 kr, Skalbar SaaS 69 000 kr. Fast pris, ingen timdebitering, leverans på 1–4 veckor.",
      canonical: "/priser",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Priser", url: "/priser" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <p className="label-caps">Priser</p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05]">
              Fast pris. <em className="italic text-primary">Inga timmar.</em>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Du vet exakt vad du betalar innan vi börjar. Ingen löpande räkning, inga "det blev
              lite mer komplext än vi trodde".
            </p>
          </div>
        </section>

        <section className="pb-24">
          <div className="container mx-auto px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {paket.map((p) => (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-lg border bg-card p-6 ${
                    p.featured ? "border-primary shadow-sm" : "border-border"
                  }`}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary-foreground">
                      Populärast
                    </span>
                  )}
                  <p className="label-caps">{p.name}</p>
                  <p className="mt-3 font-serif text-3xl">{p.price}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.time}</p>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/80">{p.desc}</p>
                  <ul className="mt-5 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => open(p.id)}
                    variant={p.featured ? "default" : "outline"}
                    className="mt-6 w-full"
                  >
                    {p.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border py-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <p className="label-caps">Tillägg</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Utöver paketen</h2>
            <div className="mt-10 divide-y divide-border border-y border-border">
              {tillagg.map((t) => (
                <div key={t.name} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-serif text-xl">{t.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{t.desc}</p>
                  </div>
                  <p className="text-primary font-medium sm:text-right">{t.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border py-20">
          <div className="container mx-auto px-6 max-w-4xl grid gap-10 md:grid-cols-2">
            <div>
              <p className="label-caps">Betalningsvillkor</p>
              <h2 className="mt-3 font-serif text-3xl">Hur det funkar</h2>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary shrink-0" /> 50 procent vid projektstart, 50 procent vid leverans</li>
                <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary shrink-0" /> Faktura med 30 dagars betalningsvillkor</li>
                <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary shrink-0" /> F-skatt via Aurora Media AB</li>
              </ul>
            </div>
            <div>
              <p className="label-caps">Garanti</p>
              <h2 className="mt-3 font-serif text-3xl">Du tar ingen risk</h2>
              <p className="mt-6 text-base text-foreground/85 leading-relaxed">
                Om prototypen dag 3 inte motsvarar förväntningarna, betalar du inget. Då går vi
                skilda vägar utan kostnad.
              </p>
            </div>
          </div>
        </section>

        <FAQSection items={prisFaqs} title="Frågor om priser" />

        <section className="border-t border-border py-20">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl">Klar att starta?</h2>
            <Button className="mt-8" size="lg" onClick={() => open()}>
              Starta ett projekt
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Priser;
