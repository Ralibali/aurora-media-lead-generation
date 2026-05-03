import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { Check, ArrowRight } from "lucide-react";
import { setSEOMeta, setBreadcrumb, setJsonLd, removeJsonLd } from "@/lib/seoHelpers";

const lokalaFaqs = [
  {
    q: "Är Aurora Media en webbyrå i Linköping?",
    a: "Ja, Aurora Media AB är baserat i Linköping men jobbar med kunder i hela Sverige. Fokus är inte bara hemsidor, utan SaaS, AI-automationer, interna appar och moderna webbplattformar.",
  },
  {
    q: "Vad kostar en hemsida eller webbplattform?",
    a: "Det beror på scope. En enkel landningssida är billigare än en plattform med databas, login och integrationer. För SaaS och MVP börjar paketen från 14 900 kr för prototyp och 34 900 kr för MVP.",
  },
  {
    q: "Hur skiljer ni er från en traditionell webbyrå?",
    a: "Aurora jobbar som AI-builder snarare än klassisk byrå. Det betyder mindre workshop, snabbare prototyp, fast pris, modern kodbas och direktkontakt med personen som bygger.",
  },
  {
    q: "Bygger ni WordPress?",
    a: "Huvudspåret är inte WordPress. Aurora bygger främst med React, TypeScript, Supabase, Stripe och modern hosting. Det ger bättre kontroll, prestanda och ägande för många moderna projekt.",
  },
];

const WebbyraLinkoping = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "Webbyrå Linköping – AI-builder för SaaS, webb och automation | Aurora Media",
      description:
        "Aurora Media är en AI-driven webbyrå i Linköping som bygger SaaS, MVP, hemsidor, interna appar och AI-automationer med fast pris och kod kunden äger.",
      canonical: "/webbyra-linkoping",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Webbyrå Linköping", url: "/webbyra-linkoping" },
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
        <section className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <p className="label-caps">Webbyrå Linköping · AI-builder</p>
            <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-tight">
              Webbyrå i Linköping för dig som vill bygga mer än en broschyr.
            </h1>
            <p className="mt-7 text-lg text-muted-foreground max-w-2xl md:text-xl">
              Aurora Media bygger hemsidor, SaaS, MVP:er, interna appar och AI-automationer åt företag i Linköping och resten av Sverige. Mindre byråprocess. Mer färdig produkt.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => open()} className="rounded-full">Boka AI-genomgång <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button size="lg" variant="outline" asChild className="rounded-full"><Link to="/ai-konsult-sverige">AI-konsult vs AI-builder</Link></Button>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20">
          <div className="container mx-auto px-6 max-w-5xl grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="label-caps">Varför Aurora</p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Lokal partner. Modern leverans.</h2>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-foreground/85">
              <p>Jag är Christoffer och driver Aurora Media AB från Linköping. Jag bygger inte bara snygga ytor — jag bygger digitala produkter som kan ha login, databas, betalning, admin, automationer och integrationer.</p>
              <p>För dig som företagare i Linköping betyder det en partner som kan ta dig från idé till fungerande system utan att du behöver koordinera designer, utvecklare, SEO-person och projektledare separat.</p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 bg-secondary/20">
          <div className="container mx-auto px-6 max-w-5xl">
            <p className="label-caps">Vad vi bygger</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Från hemsida till SaaS.</h2>
            <ul className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                "Företagshemsidor med stark SEO och modern design",
                "SaaS och MVP med login, databas och betalning",
                "Interna verktyg som ersätter Excel, mejl och manuella flöden",
                "AI-automationer kopplade till riktiga arbetsprocesser",
                "E-handel och betalflöden med Stripe eller Shopify",
                "SEO-hubbar, artiklar och AI-vänlig informationsstruktur",
              ].map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl border border-white/12 bg-white/[0.045] p-5 text-foreground/85">
                  <Check className="mt-1 h-4 w-4 text-blue-200 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-white/10 py-16">
          <div className="container mx-auto px-6 max-w-5xl">
            <p className="label-caps mb-4">Relaterade sidor</p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <li><Link to="/ai-konsult-sverige" className="text-sm underline hover:text-primary">AI-konsult Sverige →</Link></li>
              <li><Link to="/priser" className="text-sm underline hover:text-primary">Priser & paket →</Link></li>
              <li><Link to="/arbete" className="text-sm underline hover:text-primary">Case & projekt →</Link></li>
              <li><Link to="/metodik" className="text-sm underline hover:text-primary">Metodik →</Link></li>
              <li><Link to="/tjanster/hemsidor" className="text-sm underline hover:text-primary">Hemsidor →</Link></li>
              <li><Link to="/tjanster/seo" className="text-sm underline hover:text-primary">SEO →</Link></li>
              <li><Link to="/blogg" className="text-sm underline hover:text-primary">Blogg →</Link></li>
              <li><Link to="/kontakt" className="text-sm underline hover:text-primary">Kontakt →</Link></li>
            </ul>
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
