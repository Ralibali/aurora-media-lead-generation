import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const packages = [
  {
    name: "Aurora Sprint",
    price: "Från 14 900 kr",
    time: "1–2 veckor",
    desc: "Klickbar prototyp eller första fungerande version för att validera idén snabbt.",
    features: ["Produktworkshop light", "Klickbart huvudflöde", "Modern design", "Demo-URL", "Nästa-steg-rekommendation"],
  },
  {
    name: "Aurora MVP",
    price: "Från 34 900 kr",
    time: "3–5 veckor",
    desc: "Lanseringsbar MVP med riktiga användare, data och kärnfunktioner.",
    features: ["Inloggning", "Databas", "Adminvy", "Stripe eller annat betalflöde", "GitHub-repo och dokumentation"],
    featured: true,
  },
  {
    name: "Aurora Scale",
    price: "Från 89 000 kr",
    time: "6–10 veckor",
    desc: "Skalbar SaaS eller intern plattform med roller, integrationer och automation.",
    features: ["Multi-tenant-struktur", "Roller och behörigheter", "Integrationer", "AI-flöden", "Teknisk överlämning"],
  },
  {
    name: "Aurora AI Ops",
    price: "Fast offert",
    time: "Efter scope",
    desc: "AI-automationer och interna verktyg för företag som vill kapa manuellt arbete.",
    features: ["Processkartläggning", "AI-flöden", "API-kopplingar", "Behörigheter", "Driftbar lösning"],
  },
];

const rows = [
  ["Fast pris innan start", true, true, true, true],
  ["Kod/repo du äger", true, true, true, true],
  ["Klickbar produkt", true, true, true, true],
  ["Databas och autentisering", false, true, true, true],
  ["Betalningar", false, true, true, false],
  ["Roller och behörigheter", false, false, true, true],
  ["Integrationer", false, "Enkel", true, true],
  ["AI-automation", false, "Tillägg", true, true],
];

const Priser = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "Priser – SaaS, MVP och AI-automation med fast pris | Aurora Media",
      description:
        "Aktuella priser hos Aurora Media: prototyp från 14 900 kr, MVP från 34 900 kr och skalbar SaaS från 89 000 kr. Fast pris, snabb leverans och kod du äger.",
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
      <main className="overflow-hidden">
        <section className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <p className="label-caps">Priser · fast scope · ingen timrapport</p>
            <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-tight">
              Du ska veta priset innan vi bygger.
            </h1>
            <p className="mt-7 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Inga diffusa timbanker. Inga “vi får återkomma”. Vi ramar in scope, pris och leverans — sedan bygger vi en produkt som faktiskt går att använda.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => open()} className="rounded-full">Boka AI-genomgång <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button size="lg" variant="outline" asChild className="rounded-full"><Link to="/ai-konsult-sverige">Se AI-builder-upplägget</Link></Button>
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {packages.map((p) => (
                <div key={p.name} className={`relative flex flex-col rounded-[1.7rem] border p-7 backdrop-blur-2xl ${p.featured ? "border-blue-300/40 bg-blue-400/10 shadow-[0_34px_100px_-52px_rgba(59,130,246,0.9)]" : "border-white/12 bg-white/[0.055]"}`}>
                  {p.featured && <span className="absolute -top-3 left-6 rounded-full border border-blue-300/30 bg-blue-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-50">Populärast</span>}
                  <Sparkles className="h-6 w-6 text-blue-200" />
                  <h2 className="mt-5 font-display text-2xl font-bold">{p.name}</h2>
                  <p className="mt-3 text-3xl font-bold text-white">{p.price}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.time}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">{p.desc}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/70"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />{f}</li>
                    ))}
                  </ul>
                  <Button onClick={() => open(p.name)} className="mt-7 w-full rounded-full" variant={p.featured ? "default" : "outline"}>Välj upplägg</Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <p className="label-caps">Jämförelse</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Vad ingår?</h2>
            <div className="mt-10 overflow-x-auto rounded-2xl border border-white/12 bg-white/[0.045]">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead><tr className="border-b border-white/10 bg-white/[0.06]"><th className="p-4"></th>{packages.map((p) => <th key={p.name} className="p-4 text-white">{p.name}</th>)}</tr></thead>
                <tbody>
                  {rows.map((row) => <tr key={row[0] as string} className="border-b border-white/10 last:border-0"><td className="p-4 text-white/80">{row[0]}</td>{row.slice(1).map((v, i) => <td key={i} className="p-4 text-white/65">{typeof v === "boolean" ? (v ? <Check className="h-4 w-4 text-blue-200" /> : "—") : v}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 md:py-24">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-blue-200" />
            <h2 className="mt-5 font-display text-4xl font-bold">Osäker på nivå?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Boka 30 minuter. Du får ett ärligt svar på om du behöver prototyp, MVP, scale eller om idén behöver tänkas om först.</p>
            <Button size="lg" onClick={() => open()} className="mt-8 rounded-full">Boka AI-genomgång</Button>
          </div>
        </section>
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default Priser;
