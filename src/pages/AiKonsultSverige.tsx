import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Code2, Database, LockKeyhole, Rocket, ShieldCheck, Sparkles, Workflow, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";

const journey = [
  ["01", "Idé & scope", "Vi kokar ner AI-snacket till en tydlig produkt, automation eller intern app."],
  ["02", "Prototyp", "Klickbar version snabbt, så teamet faktiskt ser vad som ska byggas."],
  ["03", "MVP", "Inloggning, databas, betalning, admin och kärnflöden — inget fluff."],
  ["04", "Data & integrationer", "Supabase, Stripe, Brevo, Fortnox, interna API:er och säkra behörigheter."],
  ["05", "Automation", "AI-flöden som gör jobbet, inte bara imponerar på en workshop."],
  ["06", "Skalning", "Kod du äger, dokumentation och en grund som går att bygga vidare på."],
];

const builderVsConsultant = [
  ["Workshops och strategi", "Färdig produkt som går att använda"],
  ["Offert efter analys", "Fast pris från start"],
  ["3–6 månader", "Prototyp på 1–2 veckor"],
  ["Verktygsutbildning", "System, SaaS eller automation som gör jobbet"],
  ["Konsultberoende", "Kod, repo och dokumentation som du äger"],
];

const packages = [
  {
    name: "Aurora Sprint",
    price: "Från 14 900 kr",
    text: "För dig som behöver gå från idé till klickbar prototyp snabbt.",
  },
  {
    name: "Aurora MVP",
    price: "Från 34 900 kr",
    text: "För dig som vill lansera första versionen med riktiga användare.",
  },
  {
    name: "Aurora AI Ops",
    price: "Fast upplägg",
    text: "För företag som vill automatisera processer, AI-flöden och interna system.",
  },
];

const trust = [
  { icon: ShieldCheck, title: "GDPR-tänk från start", text: "Vi bygger med tydliga roller, datagränser och behörigheter." },
  { icon: Database, title: "Riktig datamodell", text: "Inte bara en snygg demo. Databas, RLS och struktur som håller." },
  { icon: LockKeyhole, title: "Du äger koden", text: "GitHub-repo, dokumentation och frihet att ta produkten vidare." },
  { icon: Workflow, title: "AI som process", text: "Automationer och system som passar hur bolaget faktiskt jobbar." },
];

const AiKonsultSverige = () => {
  const { open } = useContactModal();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="overflow-hidden">
        <section className="relative px-6 pb-20 pt-32 sm:px-10 lg:px-[70px] lg:pt-36">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_16%,rgba(59,130,246,0.24),transparent_34rem),radial-gradient(circle_at_12%_55%,rgba(236,72,153,0.14),transparent_32rem)]" />
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <p className="label-caps mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.055] px-4 py-2 backdrop-blur-xl">
                <Sparkles size={13} /> AI-konsult Sverige · fast pris · kod du äger
              </p>
              <h1 className="font-display text-[clamp(3.2rem,7.4vw,7rem)] font-bold leading-[0.92] tracking-tight text-white">
                AI-konsulter pratar strategi. Vi bygger produkten.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/68">
                Behöver du ännu en workshop om AI? Förmodligen inte. Du behöver ett system,
                en SaaS, en intern app eller en automation som faktiskt används. Aurora Media
                bygger det på veckor — med fast pris, modern stack och kod du äger.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={open} className="rounded-full">
                  Boka AI-genomgång <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link to="/priser" className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/8 px-6 py-3 text-sm font-bold text-white/82 backdrop-blur-xl transition hover:border-blue-300/45 hover:bg-blue-400/12">
                  Se fasta paket
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/12 bg-white/[0.06] p-6 shadow-[0_40px_120px_-60px_rgba(59,130,246,0.9)] backdrop-blur-2xl">
              <p className="label-caps mb-5">Mindre workshop. Mer output.</p>
              <div className="space-y-3">
                {["SaaS-prototyp på 1–2 veckor", "MVP från 34 900 kr", "AI-automationer som kopplas till riktiga system", "React, TypeScript, Supabase, Stripe, Brevo", "GitHub-repo och kodägande från dag ett"].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/22 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-200" />
                    <span className="text-sm leading-relaxed text-white/76">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:px-10 lg:px-[70px]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="label-caps mb-3">AI-konsult vs AI-builder</p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Skillnaden är brutal: snack eller leverans.
              </h2>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.055] backdrop-blur-2xl">
              <div className="grid grid-cols-2 border-b border-white/10 bg-white/[0.06] text-sm font-bold text-white">
                <div className="p-5">Traditionell AI-konsult</div>
                <div className="border-l border-white/10 p-5">Aurora Media</div>
              </div>
              {builderVsConsultant.map(([left, right]) => (
                <div key={left} className="grid grid-cols-2 border-b border-white/10 last:border-0">
                  <div className="flex gap-3 p-5 text-white/58"><XCircle className="h-5 w-5 shrink-0 text-red-200/60" />{left}</div>
                  <div className="flex gap-3 border-l border-white/10 p-5 text-white/82"><CheckCircle2 className="h-5 w-5 shrink-0 text-blue-200" />{right}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:px-10 lg:px-[70px]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="label-caps mb-3">Aurora Produktresan</p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Från Notion-idé till använd produkt.
              </h2>
              <p className="mt-4 text-white/62">Ett enkelt flöde som gör AI konkret. Inte mer komplicerat än det behöver vara.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {journey.map(([num, title, text]) => (
                <div key={title} className="rounded-[1.6rem] border border-white/12 bg-white/[0.055] p-6 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-blue-300/35">
                  <p className="text-sm font-bold text-blue-200/80">{num}</p>
                  <h3 className="mt-4 font-display text-2xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/62">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:px-10 lg:px-[70px]">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="label-caps mb-3">AI utan kaos</p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Vi bygger inte AI-flöden som blir ännu ett experiment.
              </h2>
              <p className="mt-5 text-white/64">
                AI blir värdefullt först när det sitter i ett riktigt arbetsflöde med data,
                behörigheter, ansvar och tydlig output. Annars är det bara en demo.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {trust.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-[1.4rem] border border-white/12 bg-white/[0.055] p-5 backdrop-blur-2xl">
                  <Icon className="h-6 w-6 text-blue-200" />
                  <h3 className="mt-4 font-display text-xl font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/62">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:px-10 lg:px-[70px]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="label-caps mb-3">Paket som går att köpa</p>
                <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Inget ludd. Välj output.</h2>
              </div>
              <Link to="/priser" className="text-sm font-bold text-blue-100 hover:text-white">Se alla priser →</Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {packages.map((pkg) => (
                <div key={pkg.name} className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] p-7 backdrop-blur-2xl">
                  <Code2 className="h-7 w-7 text-blue-200" />
                  <h3 className="mt-5 font-display text-2xl font-bold text-white">{pkg.name}</h3>
                  <p className="mt-2 text-lg font-bold text-blue-100">{pkg.price}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/62">{pkg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:px-10 lg:px-[70px]">
          <div className="mx-auto overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(168,85,247,0.14),rgba(236,72,153,0.12))] p-8 text-center backdrop-blur-2xl sm:p-12 lg:p-16">
            <Rocket className="mx-auto h-9 w-9 text-blue-100" />
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
              Har du ett AI-projekt som behöver bli verkligt, inte bara analyserat?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-white/68">
              Boka 30 minuter. Du får ett ärligt svar: bygga, skrota eller tänka om.
              Ingen säljpitch. Bara konkret nästa steg.
            </p>
            <div className="mt-8 flex justify-center">
              <Button size="lg" onClick={open} className="rounded-full">
                Boka AI-genomgång <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AiKonsultSverige;
