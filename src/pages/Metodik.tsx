import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Code2, Database, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setJsonLd, setBreadcrumb, SITE_URL } from "@/lib/seoHelpers";

const steps = [
  {
    title: "1. Idé & scope",
    body: "Vi börjar med att kapa bort fluffet. Vad ska byggas, vem ska använda det, vad måste fungera i första versionen och vad kan vänta? Du får ett tydligt scope och ett fast pris innan start.",
  },
  {
    title: "2. Prototyp",
    body: "Vi bygger en klickbar version snabbt så du, teamet eller kunden kan känna på flödet. Här validerar vi produkten innan den blir dyr eller för stor.",
  },
  {
    title: "3. MVP",
    body: "Vi bygger den första versionen som faktiskt kan användas: login, databas, admin, betalning, e-postflöden och kärnfunktioner beroende på projekt.",
  },
  {
    title: "4. Data & integrationer",
    body: "När grunden sitter kopplar vi på rätt system: Supabase, Stripe, Brevo, Fortnox, interna API:er eller AI-flöden. Behörigheter och datagränser sätts tidigt.",
  },
  {
    title: "5. QA, säkerhet & lansering",
    body: "Jag testar manuellt, kontrollerar edge cases, RLS/behörigheter, prestanda och deployment. Du får GitHub-repo, dokumentation och genomgång.",
  },
  {
    title: "6. Skala vidare",
    body: "När riktiga användare börjar använda produkten bygger vi vidare baserat på data, feedback och affärsnytta — inte gissningar från en workshop.",
  },
];

const principles = [
  { icon: Sparkles, title: "Mindre workshop", body: "Målet är inte en AI-strategi som samlar damm. Målet är en produkt, automation eller app som används." },
  { icon: Code2, title: "Fast pris", body: "Du vet vad det kostar innan vi bygger. Scope först, offert sen, kod därefter." },
  { icon: ShieldCheck, title: "Kod du äger", body: "Repo, databasstruktur och dokumentation lämnas över. Ingen onödig vendor lock-in." },
  { icon: Database, title: "Riktig grund", body: "Datamodell, auth, behörigheter och integrationer byggs för verklig drift — inte bara demo." },
];

const tools = [
  { name: "Lovable", use: "Snabb produktbas, SaaS-prototyper och fullstack-flöden med Supabase." },
  { name: "Bolt", use: "Snabba prototyper, UI-experiment och kodnära exploration i webbläsaren." },
  { name: "Cursor + Claude", use: "Refaktorering, kvalitet, komplex logik och arbete i riktiga repon." },
  { name: "React + TypeScript", use: "Frontend och appar med tydlig struktur, komponenter och bra underhållbarhet." },
  { name: "Supabase", use: "Postgres, Auth, RLS, Storage och Edge Functions." },
  { name: "Stripe, Brevo, Fortnox", use: "Betalning, e-post, automation och svenska affärsintegrationer." },
];

const Metodik = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "Metodik – från AI-idé till färdig produkt | Aurora Media",
      description:
        "Aurora Produktresan: idé, prototyp, MVP, integrationer, säkerhet och lansering. Så bygger Aurora Media SaaS, appar och AI-automationer med fast pris.",
      canonical: "/metodik",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Metodik", url: "/metodik" },
    ]);
    setJsonLd("metodik-howto", {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Aurora Produktresan",
      description: "Så Aurora Media går från AI-idé till fungerande produkt.",
      step: steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.body,
      })),
      author: { "@id": `${SITE_URL}/#organization` },
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="overflow-hidden">
        <section className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <Reveal>
              <p className="label-caps">Metodik · Aurora Produktresan</p>
              <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-tight">
                Från Notion-idé till använd produkt.
              </h1>
              <p className="mt-7 max-w-2xl text-lg text-muted-foreground md:text-xl">
                En rak process för att bygga SaaS, MVP:er, interna appar och AI-automationer utan att fastna i månader av möten.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={open} className="rounded-full">Boka AI-genomgång <ArrowRight className="ml-2 h-4 w-4" /></Button>
                <Button size="lg" variant="outline" asChild className="rounded-full"><Link to="/priser">Se priser</Link></Button>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-white/10 py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <Reveal>
              <p className="label-caps">Steg för steg</p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Så går det till.</h2>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.05} y={16} duration={0.6}>
                  <div className="h-full rounded-[1.5rem] border border-white/12 bg-white/[0.055] p-6 backdrop-blur-2xl">
                    <p className="text-sm font-bold text-blue-200">0{i + 1}</p>
                    <h3 className="mt-4 font-display text-2xl font-bold">{s.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/64">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 bg-secondary/20">
          <div className="container mx-auto px-6 max-w-6xl">
            <p className="label-caps">Principer</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Det här styr varje projekt.</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {principles.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-[1.45rem] border border-white/12 bg-white/[0.055] p-6 backdrop-blur-2xl">
                  <Icon className="h-6 w-6 text-blue-200" />
                  <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/62">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <p className="label-caps">Stack</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Verktygen väljs efter jobbet.</h2>
            <ul className="mt-10 grid gap-4 md:grid-cols-2">
              {tools.map((t) => (
                <li key={t.name} className="rounded-2xl border border-white/12 bg-white/[0.045] p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-200" />
                    <div>
                      <p className="font-display text-lg font-bold">{t.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t.use}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default Metodik;
