import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, Clock3, Code2, Workflow, MessageSquare, Layers3 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { Reveal, VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import "@/styles/verkstad.css";
import "@/styles/aurora-home.css";
export { Reveal, VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
const LiveBuildDemo = lazy(() => import("@/components/verkstad/LiveBuildDemo"));

const USE_CASES = [
  { name: "Administration", icon: Workflow, before: "Mejl → Excel → dubbelarbete", title: "Ett flöde hela vägen.", text: "Samla förfrågningar, underlag och uppföljning i ett system. Låt återkommande moment skötas automatiskt och behåll kontrollen över besluten.", steps: ["Förfrågan kommer in", "Underlaget samlas", "Du granskar och godkänner"], note: "Administration och systemintegrationer" },
  { name: "Kundkontakt", icon: MessageSquare, before: "Samma frågor. Om och om igen.", title: "Ge kunden ett tydligt nästa steg.", text: "Bygg en kundportal, ett bokningsflöde eller en assistent som använder ert underlag. Frågor som kräver en människa går vidare till rätt person.", steps: ["Kunden ställer en fråga", "Svar från ert underlag", "Personlig hjälp vid behov"], note: "Kundportal, bokning och AI-assistent" },
  { name: "Egen produkt", icon: Layers3, before: "En idé som behöver bli testbar", title: "Från idé till något ni kan prova.", text: "Börja med den viktigaste funktionen. Testa en klickbar prototyp med riktiga användare innan ni bygger vidare till app eller SaaS.", steps: ["Avgränsa kärnflödet", "Testa prototypen", "Bygg vidare på det som fungerar"], note: "Prototyp, app eller SaaS" },
];
const FAQS = [
  { q: "Vad händer i det första samtalet?", a: "Vi går igenom ett arbetsflöde, vilka system ni använder och vad ni vill förbättra. Ni får en rekommendation om nästa steg. Samtalet är kostnadsfritt och ni förbinder er inte till ett projekt." },
  { q: "Vad kostar ett projekt?", a: "En avgränsad prototyp börjar på 4 900 kr exklusive moms. MVP börjar på 11 900 kr och en större plattform på 24 900 kr. Det är riktpriser: innehåll, leveranstid, drift och eventuella externa tjänster specificeras i offerten innan start." },
  { q: "Måste lösningen använda AI?", a: "Nej. Ibland räcker en integration, ett formulär eller tydligare rutiner. Vi väljer den lösning som passar uppgiften. AI används där den tillför nytta." },
  { q: "Kan ni arbeta med våra befintliga system?", a: "Ja, när systemen har lämpliga API:er eller exportmöjligheter. Vi kontrollerar åtkomst, datakvalitet och begränsningar innan vi lovar en integration." },
  { q: "Äger vi koden och vad händer efter lansering?", a: "Ni får projektets kod och dokumentation enligt offerten. Vi kommer överens om drift, support, behörigheter och överlämning före start. Externa tjänster har sina egna licenser och avgifter." },
];

export default function Index() {
  const { open } = useContactModal();
  const [activeCase, setActiveCase] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const selected = USE_CASES[activeCase];
  const contact = (source: string, note?: string) => {
    trackEvent("home_contact_click", { source });
    open({ internalNote: note || `Förfrågan från startsidan: ${source}` });
  };
  return <>
    <SEO title="AI-system och automation för företag | Aurora Media" description="Mindre manuellt arbete. Mer tid för affären. Aurora Media i Linköping bygger AI-lösningar, integrationer och interna system. Börja med ett kostnadsfritt samtal." canonical="/" jsonLd={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    <div className="verkstad aurora-home">
      <VkNav />
      <main id="main">
        <section className="am-hero">
          <div className="vk-wrap am-hero-grid">
            <div>
              <p className="vk-mono am-eyebrow"><span /> Din utvecklingspartner · Linköping & hela Sverige</p>
              <h1>Mindre handpåläggning.<br /><span>Mer affär.</span></h1>
              <p className="am-intro">AI, automation och egna system som får vardagen att fungera. Jag hjälper er från första problemet till en lösning ni kan använda.</p>
              <div className="am-actions">
                <button className="vk-btn vk-btn-primary" onClick={() => contact("hero")}><span>Prata om ert projekt</span><ArrowRight size={17} /></button>
                <Link to="/ai-karta/start" className="am-text-link" onClick={() => trackEvent("home_hero_ai_karta_click")}>Gör gratis AI-kartan <ArrowUpRight size={17} /></Link>
              </div>
              <p className="am-micro">Kostnadsfritt första samtal · Tydlig offert före start</p>
              <div className="am-person"><div className="am-monogram" aria-hidden>AM</div><div><strong>Aurora Media AB</strong><span>Byggare, inte rådgivare. Samma team följer projektet hela vägen.</span></div></div>
            </div>
            <div className="am-workflow">
              <div className="am-panel-top"><span className="vk-mono">Vad vill ni få ordning på?</span><span className="am-status">Börja här</span></div>
              <div className="am-selector" aria-label="Välj ett användningsfall">
                {USE_CASES.map((c, i) => <button key={c.name} type="button" aria-pressed={activeCase === i} onClick={() => { setActiveCase(i); trackEvent("home_use_case_selected", { use_case: c.name }); }}><c.icon size={16} />{c.name}</button>)}
              </div>
              <div className="am-workflow-content" aria-live="polite">
                <p className="am-before">{selected.before}</p>
                <h2>{selected.title}</h2><p>{selected.text}</p>
                <ol className="am-flow">{selected.steps.map((s, i) => <li key={s}><span>{String(i + 1).padStart(2, "0")}</span>{s}{i === 2 && <Check size={16} />}</li>)}</ol>
                <button className="am-panel-link" onClick={() => contact("use_case", selected.note)}>Det här vill vi lösa <ArrowRight size={17} /></button>
              </div>
              <div className="am-panel-bottom">Exempel på upplägg. Vi anpassar lösningen till er verksamhet.</div>
            </div>
          </div>
        </section>
        <div className="am-trust"><div className="vk-wrap am-trust-inner"><span><Workflow size={18} /> Befintliga system kan kopplas ihop</span><span><Code2 size={18} /> Kod och överlämning ingår i upplägget</span><span><Clock3 size={18} /> Ett avgränsat första steg</span></div></div>

        <section className="vk-section" id="losningar"><div className="vk-wrap">
          <Reveal><div className="am-section-head"><div><p className="vk-mono">01 / Det vi bygger</p><h2>Börja med det som<br />stjäl mest tid.</h2></div><p>Ni behöver inte ha en teknisk kravspecifikation. Ett konkret problem räcker för att börja prata.</p></div></Reveal>
          <div className="am-services">{[
            { n: "01", name: "Automation & integrationer", text: "Koppla ihop kundförfrågningar, offerter, rapporter och ekonomisystem. Färre manuella överlämningar.", link: "/ai-automation-foretag", label: "Se automationsmöjligheterna" },
            { n: "02", name: "Interna system & portaler", text: "Samla det som i dag ligger i kalkylblad och mejltrådar. Rätt information, behörigheter och nästa uppgift på samma plats.", link: "/tjanster", label: "Utforska lösningar" },
            { n: "03", name: "Appar & digitala produkter", text: "Gör en idé testbar med en prototyp. Bygg sedan vidare med användare, betalning och de funktioner som behövs.", link: "/tjanster/mobilapp", label: "Från idé till app" },
          ].map(c => <Link className="am-service" to={c.link} key={c.n}><span className="vk-mono">{c.n}</span><h3>{c.name}</h3><p>{c.text}</p><span className="am-text-link">{c.label}<ArrowUpRight size={18} /></span></Link>)}</div>
        </div></section>

        <section className="vk-section am-cases" id="case"><div className="vk-wrap">
          <Reveal><div className="am-section-head"><div><p className="vk-mono">02 / Från våra egna verksamheter</p><h2>Byggt för en<br />verklig vardag.</h2></div><p>Egna produkter och verksamheter ger oss erfarenhet av hela vägen: utveckling, användning och fortsatt förbättring.</p></div></Reveal>
          <div className="am-case-grid">
            <Link className="am-case" to="/arbete/bergs-slussar-stayboost"><div className="am-case-image"><img src="/portfolio/goglamping-sweden.webp" alt="Bergs Slussar Glamping – bokningssajten" loading="lazy" width="1440" height="900" /></div><div className="am-case-content"><p className="vk-mono">Egen verksamhet · Besöksnäring</p><h3>Från bokning till gästupplevelse.<ArrowUpRight size={24} /></h3><p>Stayboost på Bergs Slussar Glamping: digital incheckning, gästinformation och tillägg i ett sammanhängande flöde.</p><span className="am-text-link">Se arbetsflödet och det daterade underlaget <ArrowRight size={16} /></span></div></Link>
            <Link className="am-case" to="/arbete/aurora-transport"><div className="am-case-image"><img src="/portfolio/aurora-transport.webp" alt="Aurora Transport – översikt över transportplanering" loading="lazy" width="1440" height="900" /></div><div className="am-case-content"><p className="vk-mono">Egen produkt · Transport</p><h3>Ordning från körorder till faktura.<ArrowUpRight size={24} /></h3><p>Ett system för transportledning, körorder och fakturaunderlag. Byggt kring arbetsflödet i ett åkeri.</p><span className="am-text-link">Se Aurora Transport <ArrowRight size={16} /></span></div></Link>
          </div><Link className="am-text-link am-all-cases" to="/arbete">Se fler projekt, bland annat Hönsgården och Updro <ArrowRight size={17} /></Link>
        </div></section>

        <section className="vk-section"><div className="vk-wrap">
          <div className="am-section-head"><div><p className="vk-mono">03 / Ett tydligt upplägg</p><h2>Litet första steg.<br />Tydlig väg framåt.</h2></div><p>Omfattningen avgör leveranstiden. Ni vet vad som ingår, hur vi testar och vad det kostar innan arbetet börjar.</p></div>
          <ol className="am-process">{[
            ["Vi hittar rätt problem", "Vi går igenom er vardag, era system och vad ni vill uppnå. Sedan väljer vi ett arbetsflöde att börja med."],
            ["Ni provar lösningen", "Ni får en tydligt avgränsad offert och en testbar version. Vi stämmer av med dem som faktiskt ska använda den."],
            ["Vi lanserar och följer upp", "Vi testar, lämnar över och följer upp det vi ville förbättra. Drift och fortsatt stöd bestäms i förväg."],
          ].map(([title, text], i) => <li key={title}><span className="am-step-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
          <div className="am-offer"><div><p className="vk-mono">En bra början</p><h3>En avgränsad prototyp.</h3><p>För er som vill prova idén innan ni investerar i hela systemet.</p></div><div className="am-offer-price">Från 4 900 kr<span>exkl. moms · innehåll enligt offert</span></div><Link to="/priser" className="vk-btn vk-btn-ghost">Se priser & upplägg <ArrowRight size={16} /></Link></div>
        </div></section>

        <section className="am-map-section"><div className="vk-wrap am-map-grid"><div><p className="vk-mono">Gratis AI-karta · 3 steg</p><h2>Var gör automation<br />mest nytta hos er?</h2><p>Beskriv 1–5 återkommande arbetsuppgifter. Få en prioriterad karta, ett uppskattat tidsvärde och förslag på vad ni bör undersöka först.</p><Link to="/ai-karta/start" className="vk-btn vk-btn-primary" onClick={() => trackEvent("home_ai_karta_section_click")}><span>Hitta ert första steg</span><ArrowRight size={17} /></Link><p className="am-micro">Cirka 3–5 minuter · Resultat på skärmen · Kostnadsfritt</p></div><div className="am-map-preview"><span className="vk-mono">Det här får ni</span>{["Prioritering av era arbetsuppgifter", "Tydliga antaganden bakom beräkningen", "Förslag på ett avgränsat första test"].map((s, i) => <div key={s}><span>0{i + 1}</span><p>{s}</p><Check size={18} /></div>)}<p className="am-map-note">En första indikation utifrån era svar. Exakt lösning, pris och möjlig besparing kräver en genomgång.</p></div></div></section>

        <section className="vk-section"><div className="vk-wrap am-faq-grid"><div><p className="vk-mono">Innan vi börjar</p><h2>Raka svar.<br />Från början.</h2><p className="am-faq-intro">Har ni ett speciellt system eller en knepig process? Beskriv den så tittar vi på förutsättningarna.</p><button className="am-text-link" onClick={() => contact("faq")}>Ställ en fråga <ArrowRight size={16} /></button></div><div>{FAQS.map(f => <details className="am-faq" key={f.q}><summary>{f.q}<span aria-hidden>+</span></summary><p>{f.a}</p></details>)}</div></div></section>
        <section className="am-lab"><div className="vk-wrap"><div className="am-lab-heading"><div><p className="vk-mono">Utforska på egen hand</p><h3>Prova en idéskiss eller räkna på ett scenario.</h3></div><div className="am-actions"><button className="vk-btn vk-btn-ghost" aria-expanded={showDemo} onClick={() => setShowDemo(!showDemo)}>{showDemo ? "Stäng idéskissen" : "Prova idéskissen"}<ArrowRight size={16} /></button><Link className="am-text-link" to="/verktyg">Alla gratisverktyg <ArrowUpRight size={16} /></Link></div></div>{showDemo && <div className="am-demo"><p>En simulerad skiss med exempeldata. En färdig lösning kräver utveckling och test.</p><Suspense fallback={<p role="status">Laddar idéskissen…</p>}><LiveBuildDemo /></Suspense></div>}</div></section>
        <section className="am-final"><div className="vk-wrap"><p className="vk-mono">Låt oss börja med er vardag</p><h2>Vilket arbetsmoment<br />har ni tröttnat på?</h2><p>Berätta vad som krånglar. Vi återkommer med hur vi kan ta det vidare.</p><div className="am-actions"><button className="vk-btn vk-btn-primary" onClick={() => contact("final")}><span>Prata med Aurora Media</span><ArrowRight size={18} /></button><a className="am-text-link" href="mailto:info@auroramedia.se">info@auroramedia.se <ArrowUpRight size={17} /></a></div></div></section>
      </main><VkFooter />
    </div>
  </>;
}
