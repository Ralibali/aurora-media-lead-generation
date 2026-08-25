#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { buildInstantPreview, setInstantPreview } from './instant-preview.mjs';

const SITE_URL = 'https://auroramedia.se';
const SITE_NAME = 'Aurora Media AB';
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const SRC_LIB_DIR = path.resolve(process.cwd(), 'src/lib');

const STATIC_PAGES = [
  {
    route: '/',
    title: 'Aurora Media – AI-byrå i Linköping | SaaS & AI från 4 900 kr',
    description: 'AI-byrå i Linköping. Vi bygger SaaS, AI-automationer och interna verktyg med fast pris från 4 900 kr. Leverans på veckor, kod du äger.',
    body: 'Aurora Media AB är en AI-byrå i Linköping. Vi bygger SaaS, MVP:er, interna system, webbappar, mobilappar, e-handel, integrationer och AI-automationer för svenska företag.',
    hreflang: true,
  },
  {
    route: '/ai-byra-linkoping',
    title: 'AI-byrå i Linköping | Fast pris från 4 900 kr – Aurora Media',
    description: 'AI-byrå i Linköping som bygger SaaS, AI-automationer och interna verktyg. Fast pris från 4 900 kr. Leverans på veckor, kod du äger.',
    body: 'Aurora Media är en AI-byrå i Linköping som bygger SaaS, AI-automationer och interna verktyg åt svenska företag. Fast pris från 4 900 kr. Leverans på veckor.',
    cityName: 'Linköping',
  },
  {
    route: '/ai-konsult-sverige',
    title: 'AI-konsult i Sverige – rådgivning och bygge',
    description: 'AI-konsult som både råder och bygger: strategi, utbildning och konsultuppdrag på timme – eller fastprisprojekt med kod ni äger.',
    body: 'Aurora Media är en AI-konsult och AI-byrå i Sverige med två spår: konsultuppdrag inom AI-rådgivning, strategi, utbildning och utveckling i era team (895 kr/timme eller från 12 000 kr/månad) – samt fastprisprojekt där vi bygger SaaS, interna appar och AI-automationer från 4 900 kr. Kod ni äger.',
  },
  {
    route: '/tjanster',
    title: 'Tjänster – SaaS, AI, appar, webb och konsult',
    description: 'Utforska Aurora Medias tjänster: SaaS-utveckling, AI-integration, interna system, webb och konsultuppdrag inom AI-rådgivning och utveckling.',
    body: 'Aurora Media hjälper företag med SaaS-utveckling, AI-system, automatisering, integrationer, hemsidor och interna system – samt konsultuppdrag inom AI-rådgivning, strategi, utbildning och utveckling, på timme eller mot fast månadskostnad.',
  },
  { route: '/tjanster/hemsidor', title: 'Hemsidor som konverterar', description: 'Moderna hemsidor med snabb laddning, stark SEO och tydlig konvertering.', body: 'Aurora Media bygger moderna hemsidor för företag som vill ha bättre synlighet, fler leads och en tydligare digital närvaro.' },
  { route: '/tjanster/ehandel', title: 'E-handel för svenska företag', description: 'Skalbar e-handel med smart UX, betalningar, integrationer och mätbar tillväxt.', body: 'Aurora Media bygger e-handelslösningar med fokus på användarupplevelse, betalflöden, integrationer och lönsam tillväxt.' },
  { route: '/tjanster/mobilapp', title: 'Mobilappar och webbappar', description: 'Mobilappar och webbappar byggda med modern teknik, snabb leverans och tydlig affärsnytta.', body: 'Aurora Media bygger mobilappar och webbappar för företag som behöver digitala produkter som fungerar i verkligheten.' },
  { route: '/tjanster/seo', title: 'SEO för svenska företag', description: 'Teknisk SEO, innehåll, struktur och synlighet för företag som vill växa organiskt.', body: 'Aurora Media arbetar med teknisk SEO, innehållsstrategi, internlänkning, strukturerad data och konverterande landningssidor.' },
  { route: '/tjanster/google-ads', title: 'Google Ads', description: 'Datadriven Google Ads med fokus på leads, konvertering och lönsamhet.', body: 'Aurora Media hjälper företag med Google Ads, sökannonsering, kampanjstruktur och löpande optimering.' },
  { route: '/tjanster/meta-ads', title: 'Meta Ads', description: 'Annonsering på Facebook och Instagram med rätt målgrupp, budskap och konvertering.', body: 'Aurora Media skapar och optimerar Meta Ads-kampanjer för svenska företag.' },
  { route: '/arbete', title: 'Case och projekt', description: 'Se projekt, SaaS-lösningar och digitala system byggda av Aurora Media.', body: 'Aurora Media bygger egna SaaS-produkter och kundprojekt inom AI, transport, marknadsplatser och interna system.' },
  { route: '/priser', title: 'Priser för SaaS, prototyp, MVP och konsult', description: 'Fast pris från 4 900 kr för prototyp, 11 900 kr för MVP och 24 900 kr för skalbar SaaS. Konsultuppdrag 895 kr/timme eller från 12 000 kr/månad.', body: 'Aurora Media erbjuder fast pris för prototyper, MVP:er och skalbara SaaS-projekt – samt konsultuppdrag inom AI-rådgivning och utveckling för 895 kr/timme eller från 12 000 kr/månad. Du vet kostnaden innan arbetet börjar.' },
  { route: '/om', title: 'Om Aurora Media', description: 'Aurora Media AB drivs av Christoffer Holstensson i Linköping och bygger AI-driven mjukvara för svenska bolag.', body: 'Aurora Media AB är en AI-driven mjukvarubyrå från Linköping grundad av Christoffer Holstensson. Bolaget bygger SaaS, appar och skräddarsydda system.' },
  { route: '/oppna-siffror', title: 'Öppna siffror – metrics i realtid', description: 'Aurora Media visar sina siffror öppet: produkter i drift, leveranstider, upptid och deploys. Ingen PowerPoint – facit.', body: 'Aurora Media visar öppna siffror: 7 produkter i drift, snittleverans 2 veckor, 99,9 % upptid och löpande bygglogg. Vi driver det vi bygger – varje dag.' },
  { route: '/villkor', title: 'Villkor för AI-kartan', description: 'Villkoren för AI-kartan: du får kartan på mejl, Aurora Media kan höra av sig för uppföljning, och du kan avsluta när du vill.', body: 'När du fyller i AI-kartan godkänner du att Aurora Media skickar kartan till din mejl tillsammans med upp till fyra uppföljande tipsmejl, och att vi kan höra av oss för uppföljning. Uppgifterna används bara för detta, delas aldrig med tredje part, och du kan avregistrera dig när du vill via länken i varje mejl eller genom att mejla christoffer@auroramedia.se. Behandlingen sker enligt GDPR med ditt samtycke som grund. Aurora Media AB, org.nr 559272-0220, Linköping.' },
  { route: '/ai-snabbanalys', title: 'AI-snabbanalys – beskriv er vardag, få en AI-plan som PDF', description: 'Skriv några meningar om vad som tar tid i er vardag. Vår AI tolkar texten och skickar en personlig AI-plan som PDF – gratis, på någon minut.', body: 'AI-snabbanalysen är snabbvarianten av Aurora Medias AI-karta. Beskriv er vardag i fritext – vad som tar mest tid, vilka system ni använder – så tolkar vår AI texten, identifierar de bästa automationscasen och räknar ut vad de kostar er idag. Ni får en personlig AI-plan som PDF direkt till mejlen: kostnad per process, rekommenderat första bygge med fast pris och återbetalningstid. Gratis och utan köpkrav, från AI-byrån i Linköping.' },
  { route: '/kontakt', title: 'Kontakt', description: 'Kontakta Aurora Media för SaaS, AI, webbappar, integrationer och digital produktutveckling.', body: 'Kontakta Aurora Media AB via info@auroramedia.se för att diskutera SaaS, MVP, AI-system, webbappar och digital utveckling.' },
  { route: '/blogg', title: 'Blogg om AI-kodning och SaaS-utveckling', description: 'Guider om AI-kodning, SaaS, MVP, Lovable, Bolt, Cursor, SEO och digital produktutveckling.', body: 'Aurora Media publicerar guider om AI-kodning, SaaS-utveckling, MVP, prototyper, Lovable, Bolt, Cursor och modern digital produktutveckling.' },
  {
    route: '/ai-karta',
    title: 'AI-kartan – gratis AI-kartläggning för svenska företag',
    description: 'Gratis AI-kartläggning för svenska företag. Svara på 8 frågor och få en konkret PDF-analys med de 3 processer där AI ger störst effekt – tid, potential och rekommenderad lösning.',
    body: 'AI-kartan är en gratis AI-kartläggning från Aurora Media. På ca 2 minuter kartlägger du var i verksamheten AI och automation kan spara mest tid. Du får en PDF-analys direkt i mejlen med de tre processer som har högst potential, uppskattad tidsbesparing per år, rekommenderad lösning och nästa steg. Byggd för svenska företag som vill gå från "vi borde göra något med AI" till ett konkret beslutsunderlag – utan säljmöte.',
  },
  { route: '/metodik', title: 'Metodik', description: 'Så arbetar Aurora Media med strategi, design, AI-kodning, utveckling och lansering.', body: 'Aurora Media arbetar snabbt och strukturerat med tydlig scope, fast pris, AI-assisterad utveckling, testning och överlämning av kod.' },
  { route: '/webbyra-linkoping', title: 'Webbyrå i Linköping', description: 'Aurora Media är en webbyrå och mjukvarupartner i Linköping för SaaS, AI och webb.', body: 'Aurora Media är en webbyrå i Linköping som bygger hemsidor, SaaS, AI-lösningar, integrationer och digitala produkter för svenska företag.', cityName: 'Linköping' },
  { route: '/digital-marknadsforing-linkoping', title: 'Digital marknadsföring i Linköping – SEO, Ads & AI', description: 'Digital marknadsföring i Linköping: SEO, Google Ads, Meta Ads, content och AI-driven marknadsföring. Fast pris, lokal kontakt, mätbara resultat.', body: 'Aurora Media hjälper företag i Linköping och Östergötland med digital marknadsföring: SEO, Google Ads, Meta Ads, content och AI-driven marknadsföring med tydliga leadmål och fast månadsarvode.', cityName: 'Linköping' },
  { route: '/seo-byra-linkoping', title: 'SEO-byrå i Linköping – teknisk SEO, content & lokal synlighet', description: 'SEO-byrå i Linköping som jobbar med teknisk SEO, content, lokal synlighet och länkbygge. Fast pris, mätbara resultat, ägarskap kvar hos er.', body: 'Aurora Media är en SEO-byrå i Linköping som jobbar med teknisk SEO, on-page optimering, lokal SEO, keyword research, content och länkbygge för företag i Östergötland.', cityName: 'Linköping' },
  { route: '/ai-automation-linkoping', title: 'AI-automation för företag i Linköping – från 4 900 kr', description: 'AI-automation i Linköping: mejl, dokument, offerthantering, Fortnox- och Visma-integrationer. Bygg bort manuellt Excel-arbete med lokal partner.', body: 'Aurora Media bygger AI-automation för företag i Linköping: mejlhantering, dokument, offerter, ÄTA-flöden, Fortnox-integration, Visma-integration, RPA och interna AI-assistenter.', cityName: 'Linköping' },
  { route: '/ai-konsult-linkoping', title: 'AI-konsult i Linköping – strategi, implementation & utbildning', description: 'AI-konsult i Linköping. Vi hjälper er välja rätt AI-verktyg, bygga interna assistenter och utbilda teamet. Fast pris, GDPR, EU-datalagring.', body: 'Aurora Media är AI-konsult i Linköping för strategi, verktygsval, GDPR-anpassad implementation, interna AI-assistenter, prompt engineering och utbildning för svenska företag.', cityName: 'Linköping' },
  { route: '/google-ads-linkoping', title: 'Google Ads-byrå i Linköping – kampanjer som konverterar', description: 'Google Ads-byrå i Linköping. Sök, Performance Max, YouTube och Shopping med tydlig konverteringsspårning. Fast månadsarvode från 6 900 kr.', body: 'Aurora Media är Google Ads-byrå i Linköping med sökkampanjer, Performance Max, Shopping, YouTube och konverteringsspårning från annons till affär.', cityName: 'Linköping' },
  { route: '/apputveckling-linkoping', title: 'Apputveckling i Linköping – iOS, Android & webbappar', description: 'Apputveckling i Linköping. iOS, Android och webbappar byggda med React Native/Expo. Från MVP till skalbar produkt. Fast pris från 89 000 kr.', body: 'Aurora Media utvecklar mobilappar och webbappar i Linköping med React Native, Expo och Supabase. iOS och Android från samma kodbas, publicering i App Store och Google Play.', cityName: 'Linköping' },
  { route: '/integritetspolicy', title: 'Integritetspolicy', description: 'Aurora Medias integritetspolicy och information om personuppgifter.', body: 'Aurora Media AB behandlar personuppgifter enligt GDPR och svensk dataskyddslagstiftning.' },
  { route: '/redaktionell-policy', title: 'Redaktionell policy', description: 'Aurora Medias redaktionella principer för artiklar, guider och innehåll.', body: 'Aurora Media publicerar artiklar och guider med fokus på praktisk erfarenhet, transparens och uppdaterad information.' },
  { route: '/verktyg', title: 'Gratis verktyg – kalkylatorer, ROI och AI-mognad', description: 'Aurora Medias gratis verktyg för svenska företag: AI ROI-kalkylator, app-prisräknare, SEO-kalkylator, AI-mognadsanalys, personalkostnadsjämförelse och prompt-generator.', body: 'Sex gratisverktyg byggda av Aurora Media: AI ROI-kalkylator med kassaflödesgraf, app-prisräknare, SEO-kalkylator, AI-mognadsanalys med radardiagram, personalkostnad vs AI och prompt-generator. Allt körs lokalt i webbläsaren – ingen data lämnar sidan.' },
  { route: '/verktyg/ai-roi-kalkylator', title: 'AI ROI-kalkylator – räkna ut besparing & återbetalning', description: 'Räkna ut hur mycket AI och automation kan spara ert företag per år, återbetalningstid och 3-års nettovärde. Live-uppdaterat, gratis, utan inloggning.', body: 'Justera antaganden med sliders, välj scenario och se en transparent uppskattning av besparingar, återbetalningstid och nettovärde – med kassaflödesgraf över 36 månader och PDF-export.' },
  { route: '/verktyg/app-prisraknare', title: 'App-prisräknare – vad kostar en app eller SaaS?', description: 'Uppskatta priset för app, SaaS eller intern plattform. Välj plattform, funktioner och integrationer och få ett transparent prisintervall och rekommenderat paket.', body: 'Konfigurera scope visuellt och se ett rimligt prisintervall baserat på Aurora Medias fasta paket – med visuella kostnadsdrivare och PDF-export av uppskattningen.' },
  { route: '/verktyg/seo-kalkylator', title: 'SEO-kalkylator – räkna ut potentiell omsättning från SEO', description: 'Se hur mycket extra omsättning och bruttovinst SEO kan ge er per månad och år, baserat på trafik, konvertering och ordervärde.', body: 'Ange dagens siffror och en realistisk trafikökning. Kalkylatorn visar potentiell extra omsättning och bruttovinst per månad och år – med 12 månaders upprampsgraf och PDF-export.' },
  { route: '/verktyg/ai-mognadsanalys', title: 'AI-mognadsanalys – gratis test i wizard-format', description: 'Testa er AI-mognad i en tydlig steg-för-steg-wizard. Få nivå, poäng, styrkor, risker och en konkret 30-dagars handlingsplan – gratis och utan inloggning.', body: 'Tio korta frågor ger en poäng, en mognadsnivå, radardiagram per område, era styrkor, risker och en konkret 30-dagars handlingsplan – med PDF-export.' },
  { route: '/verktyg/personalkostnad-vs-ai', title: 'Personalkostnad vs AI – jämför årskostnad', description: 'Jämför årlig personalkostnad med AI/automation baserat på lön, sociala avgifter och driftkostnad. Se frigjord kapacitet – syftet är inte att ersätta människor.', body: 'Jämför årlig personalkostnad med kostnaden för AI/automation. Se frigjord kapacitet per år i jämförelsegrafer – målet är att frigöra tid till kvalificerat arbete, inte ersätta människor.' },
  { route: '/verktyg/prompt-generator', title: 'Prompt-generator – bygg strukturerade AI-prompts på svenska', description: 'Generera strukturerade svenska AI-prompts för ChatGPT, Claude och Gemini. Välj mall, roll, mål, ton, detaljnivå och outputstruktur. Kopiera på ett klick.', body: 'Välj bland nio mallar, justera parametrar och få en tydlig, strukturerad prompt på svenska som fungerar i ChatGPT, Claude, Gemini och Copilot – med kvalitetschecklista och nedladdning.' },
];

// ============================================================================
// AI-KONTORET (/grok-bot) — crawlbar statisk sida med riktigt innehåll
// ----------------------------------------------------------------------------
// FAQ och kapitel speglar src/config/aiKontoret.ts — håll i synk vid ändringar.
// Lanseringsläget läses direkt ur konfigen så statisk copy följer PRODUCT_STATUS.
// ============================================================================

function readAiKontoretStatus() {
  try {
    const src = readFileSync(path.resolve(process.cwd(), 'src/config/aiKontoret.ts'), 'utf8');
    const m = src.match(/PRODUCT_STATUS:\s*"prelaunch"\s*\|\s*"live"\s*=\s*"(prelaunch|live)"/);
    return m ? m[1] : 'prelaunch';
  } catch {
    return 'prelaunch';
  }
}

const GROK_BOT_FAQ = [
  ['Jag är ny på Grok Bot – funkar guiden ändå?', 'Ja. Guiden börjar från noll: din första Bot byggs steg för steg i kapitel 2, innan vi går vidare till Skills, Routines och Groups. Du behöver inte ha använt Grok Bot tidigare.'],
  ['Behöver jag vara programmerare?', 'Nej. Upplägget är skrivet för operatörer, inte utvecklare. Allt byggs i Grok Bots egna ytor med copy-paste-mallar. Kan du beskriva ett jobb på svenska kan du bygga en Bot.'],
  ['Är det bara prompts?', 'Nej – det är hela poängen. En prompt säger "gör den här uppgiften". Guiden lär dig bygga Botar som äger ett jobb: roll, verktyg, Skills, Routines, evidence och handoffs. Promptar är bara ett av materialen.'],
  ['Vad är skillnaden mellan Bot, Skill och Routine?', 'En Bot är en AI-medarbetare – en digital kollega med ett definierat jobb. En Skill är ett inlärt, återkommande arbetsflöde som Boten kan. En Routine bestämmer när jobbet körs – schemalagt eller triggat av en händelse.'],
  ['Kan jag använda detta i ett vanligt småföretag?', 'Ja. Exemplen kommer från verklig drift: research, innehåll, uppföljning, sales outreach och QA. Det är AI-automatisering anpassad för företag utan teknikavdelning – upplägget skalar ner till en enda Bot lika väl som det skalar upp till ett helt AI-kontor.'],
  ['Fungerar det om jag använder Cursor?', 'Ja. Principerna – Bot Charter, Skills, Routines, handoffs, owner gates – är desamma. Guiden visar upplägget i Grok Bot, men strukturen följer med dig oavsett vilket AI-verktyg du kör.'],
  ['Hur mycket kan Botarna göra helt själva?', 'Mer än du tror – men inte allt. Guiden bygger medvetet på owner gates: repetitiva delar som research, utkast och sammanställningar kör autonomt, medan pengar, publicering och riskfyllda åtgärder alltid kräver ditt godkännande.'],
  ['Hur behåller jag kontrollen?', 'Genom tre mekanismer som genomsyrar guiden: owner gates (inga riskåtgärder utan ditt godkännande), evidence receipts (varje leverans ska kunna bevisas) och usage-styrning (du ser vad varje Bot kostar i kapacitet).'],
  ['Blir guiden gammal när Grok ändras?', 'Verktyg ändras – operativsystem består. Det mesta i guiden är plattformsoberoende: roller, Skills, handoffs och kontrollstrukturer. Guiden är dessutom versionerad och faktagranskad mot aktuella officiella källor; du ser alltid vilken version du har, när den uppdaterades och när fakta senast verifierades.'],
  ['Har varje Bot en egen dator?', 'Nej – det är en vanlig missuppfattning. Alla Botar delar en och samma beständiga molndator som är knuten till ditt konto, men varje Bot arbetar på sin egen arbetsyta. Guiden visar hur du organiserar dem så att de samarbetar istället för att krocka.'],
  ['Vad får jag i Prompt Vault?', 'Ett växande bibliotek av de färdiga prompts, templates och operating rules som används i upplägget: roller som CEO/Chief of Staff, Growth, Sales, QA och Engineer, plus system som Opportunity Engine, AI Usage Governor, Work Packets, owner gates och weekly reviews – redo att kopiera rakt in. Guiden är fullständig utan Vault; det här är genvägen för dig som vill kopiera implementeringen direkt.'],
];

const GROK_BOT_LEARN = [
  ['Botar', 'Så skriver du riktiga job descriptions istället för engångspromptar.'],
  ['Skills', 'Så lär du Grok ett återkommande arbetsflöde.'],
  ['Routines', 'Så får jobbet att köras automatiskt på rätt tid.'],
  ['Groups & handoffs', 'Så låter du AI-medarbetare lämna över arbete utan att du blir mellanhand.'],
  ['AI-usage', 'Så undviker du att flera Botar bränner kapacitet på samma problem.'],
  ['Owner gates', 'Så låter du AI arbeta själv utan att ge bort kontroll över pengar, publicering eller riskfyllda åtgärder.'],
  ['Evidence', 'Så kräver du bevis på att jobbet faktiskt blev gjort.'],
  ['Growth', 'Så bygger du återkommande research-, content-, SEO- och sales-loopar.'],
];

const GROK_BOT_CHAPTERS = [
  'Från chatbot till AI-medarbetare',
  'Din första Bot',
  'Så skriver du en Bot Charter',
  'Skills',
  'Routines',
  'Groups & handoffs',
  'Chief of Staff',
  'AI-företaget',
  'Säkerhet & owner gates',
  'Usage och AI-kapital',
  'Growth & sales automation',
  'Så bygger du vidare',
];

function buildGrokBotBody(status) {
  const live = status === 'live';
  const ctaText = live
    ? `Köp AI-KONTORET för 199 kr – eller lanseringspaketet med Prompt Vault för 349 kr (ord. 398 kr).`
    : 'Guiden färdigställs just nu – ställ dig i väntelistan så får du besked först, till lanseringspriset.';
  return `<main>
<h1>AI-KONTORET – Bygg ett AI-team som faktiskt gör jobbet</h1>
<p>Den praktiska svenska guiden till Grok Bot — från din första Bot till Skills, Routines, Groups, handoffs och ett AI-kontor som arbetar även när du inte sitter framför datorn. Praktiskt. Svenskt. Copy-paste-vänligt. Byggt från verklig användning. Version 1.0, augusti 2026. Senast uppdaterad och faktaverifierad 2026-08-25 mot aktuella officiella källor. ${ctaText}</p>
<p>Det här är inte information om Grok Bot – den fria engelska dokumentationen täcker grundinställningarna. AI-KONTORET är det svenska operativsystemet ovanpå: så bygger du AI-medarbetare och digitala kollegor som äger riktiga jobb – AI-agenter med roller, inte engångspromptar – med AI-automatisering anpassad för företag och småföretag utan teknikavdelning. Ersätt inte hela teamet – ge EN uppgift till EN bot, och bygg det minsta AI-teamet som faktiskt kan slutföra jobbet.</p>
<section>
<h2>En Bot är inte en prompt</h2>
<p>En prompt säger "gör den här uppgiften". En Bot äger jobbet och utför det varje gång det behövs: roll, verktyg, skill, routine, evidence, handoff, result. Guiden lär dig hela kedjan, kapitel för kapitel.</p>
</section>
<section>
<h2>Vad du lär dig</h2>
<ul>
${GROK_BOT_LEARN.map(([t, d]) => `<li><strong>${escapeHtml(t)}</strong> – ${escapeHtml(d)}</li>`).join('\n')}
</ul>
</section>
<section>
<h2>Så ser ett riktigt AI-kontor ut</h2>
<p>Ägare → HQ / Chief of Staff → Company CEO → specialister (Growth &amp; Sales, Engineering, QA, Research). Målet är inte flest Botar – målet är det minsta team som slutför ett riktigt uppdrag end-to-end. Tekniskt sett delar alla Botar en och samma beständiga molndator knuten till ditt konto, med separata arbetsytor per Bot – guiden visar hur du organiserar dem utan krockar.</p>
</section>
<section>
<h2>Guideinnehåll – tolv kapitel</h2>
<ol>
${GROK_BOT_CHAPTERS.map((c) => `<li>${escapeHtml(c)}</li>`).join('\n')}
</ol>
</section>
<section>
<h2>Pris och paket</h2>
<p>AI-KONTORET kostar 199 kr (engångspris, ingen prenumeration). Prompt Vault – ett växande bibliotek av de färdiga prompts, templates och operating rules som används i upplägget – säljs som tillägg för 199 kr. Lanseringspaketet med båda kostar 349 kr (199 + 199 = 398 kr, du sparar 49 kr). Digital leverans direkt efter köp.</p>
</section>
<section>
<h2>Vanliga frågor om AI-KONTORET och Grok Bot</h2>
${GROK_BOT_FAQ.map(([q, a]) => `<h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p>`).join('\n')}
</section>
</main>`;
}

function buildGrokBotSchemas(status) {
  const availability = status === 'live' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder';
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${SITE_URL}/grok-bot#produkt`,
      name: 'AI-KONTORET – Så bygger du ett AI-drivet företag med Grok Bot',
      description:
        'Svenska guiden till Grok Bot: bygg AI-medarbetare och digitala kollegor med Skills, Routines, Groups, handoffs och owner gates – ett AI-kontor som jobbar åt dig.',
      image: [`${SITE_URL}/og-grok-bot.jpg`],
      brand: { '@type': 'Brand', name: 'Aurora Media' },
      category: 'Digital guide',
      inLanguage: 'sv-SE',
      version: '1.0',
      dateModified: '2026-08-25',
      offers: [
        {
          '@type': 'Offer',
          name: 'AI-KONTORET – guiden',
          price: '199',
          priceCurrency: 'SEK',
          url: `${SITE_URL}/grok-bot#priser`,
          availability,
        },
        {
          '@type': 'Offer',
          name: 'AI-KONTORET + Prompt Vault (lanseringspaket)',
          price: '349',
          priceCurrency: 'SEK',
          url: `${SITE_URL}/grok-bot#priser`,
          availability,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: GROK_BOT_FAQ.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'AI-KONTORET', item: `${SITE_URL}/grok-bot` },
      ],
    },
  ];
}

const aiKontoretStatus = readAiKontoretStatus();
STATIC_PAGES.push({
  route: '/grok-bot',
  title: 'AI-KONTORET – Bygg ett AI-drivet företag med Grok Bot | Guide 199 kr',
  description:
    'Svenska guiden till Grok Bot: bygg AI-medarbetare och digitala kollegor med Skills, Routines, Groups och owner gates – ett AI-kontor som jobbar åt dig. 199 kr.',
  body: 'AI-KONTORET är Aurora Medias praktiska svenska guide till Grok Bot.',
  htmlBody: buildGrokBotBody(aiKontoretStatus),
  schemas: buildGrokBotSchemas(aiKontoretStatus),
  ogImage: '/og-grok-bot.jpg',
  mono: 'AI-KONTORET · GUIDE · VERSION 1.0',
  ctas:
    aiKontoretStatus === 'live'
      ? [
          { label: 'Köp AI-KONTORET – 199 kr', href: '/grok-bot#priser' },
          { label: 'Se vad som ingår', href: '/grok-bot', ghost: true },
        ]
      : [
          { label: 'Få besked när AI-KONTORET släpps', href: '/kontakt' },
          { label: 'Testa AI-snabbanalysen gratis', href: '/ai-snabbanalys', ghost: true },
        ],
});

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizePath(route) {
  if (route === '/') return '/';
  return route.replace(/\/+$/, '');
}

function fullUrl(route) {
  return `${SITE_URL}${normalizePath(route)}`;
}

function buildPageSchema({ route, title, description }) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: fullUrl(route),
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
        ...(route === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: title, item: fullUrl(route) }]),
      ],
    },
  ];
}

function buildArticleSchema(article) {
  const url = fullUrl(`/blogg/${article.slug}`);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.metaTitle || article.title,
      description: article.metaDesc || article.intro,
      image: [`${SITE_URL}/og-image-sv.jpg`],
      datePublished: article.publishedDate,
      dateModified: article.updatedDate || article.publishedDate,
      author: { '@type': 'Person', name: 'Christoffer Holstensson' },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      articleSection: article.category,
      keywords: article.keyword,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blogg', item: `${SITE_URL}/blogg` },
        { '@type': 'ListItem', position: 3, name: article.title, item: url },
      ],
    },
    ...(article.faq?.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }]
      : []),
  ];
}

function buildCityServiceSchema({ route, title, description, cityName }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${fullUrl(route)}#service`,
    name: title,
    description,
    url: fullUrl(route),
    image: `${SITE_URL}/og-image-sv.jpg`,
    priceRange: '4900-89000 SEK',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Linköping',
      addressRegion: 'Östergötlands län',
      addressCountry: 'SE',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 58.4108, longitude: 15.6214 },
    areaServed: { '@type': 'City', name: cityName },
    makesOffer: [
      { '@type': 'Offer', name: 'Prototyp', price: '4900', priceCurrency: 'SEK' },
      { '@type': 'Offer', name: 'MVP', price: '11900', priceCurrency: 'SEK' },
      { '@type': 'Offer', name: 'Skalbar SaaS', price: '24900', priceCurrency: 'SEK' },
    ],
  };
}

function buildCityFaqSchema(faqs) {
  if (!faqs?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function injectHtml({ template, route, title, description, ogType = 'website', jsonLd = [], body, hreflang = false, ogImage, mono, ctas }) {
  const canonical = fullUrl(route);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const ogImageUrl = ogImage ? `${SITE_URL}${ogImage}` : `${SITE_URL}/og-image-sv.jpg`;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`);

  if (/<meta\s+name="description"[^>]*>/.test(html)) {
    html = html.replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  } else {
    html = html.replace('</head>', `    <meta name="description" content="${escapeHtml(description)}" />\n  </head>`);
  }

  const headTags = [
    `<link rel="canonical" href="${canonical}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:image" content="${ogImageUrl}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="sv_SE" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${ogImageUrl}" />`,
    ...(hreflang
      ? [
          `<link rel="alternate" hreflang="sv" href="${SITE_URL}/" />`,
          `<link rel="alternate" hreflang="en" href="${SITE_URL}/en" />`,
          `<link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />`,
        ]
      : []),
    ...jsonLd.map((schema) => `<script type="application/ld+json">${escapeJsonLd(schema)}</script>`),
  ];

  html = html
    .replace(/<link\s+rel="canonical"[^>]*>\s*/g, '')
    .replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>\s*/g, '')
    .replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/g, '')
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/g, '')
    .replace(/<meta\s+name="robots"[^>]*>\s*/g, '');

  html = html.replace('</head>', `    ${headTags.join('\n    ')}\n  </head>`);

  // Synlig statisk förhandsvisning i #root (ersätter den gamla dolda SEO-diven).
  // Besökaren ser riktigt innehåll direkt – React byter ut det när appen bootar.
  const preview = buildInstantPreview({
    title,
    body,
    mono:
      mono ??
      (route === '/ai-karta' ? 'Gratis · 2 min · Resultat direkt' : route === '/' ? 'Aurora Media · Linköping' : undefined),
    ctas:
      ctas ??
      (route === '/ai-karta'
        ? [
            { label: 'Starta kartläggningen', href: '/ai-karta/start' },
            { label: 'Hellre prata direkt?', href: '/kontakt', ghost: true },
          ]
        : route === '/'
          ? [
              { label: 'Starta AI-kartan – gratis', href: '/ai-karta' },
              { label: 'Boka samtal', href: '/kontakt', ghost: true },
            ]
          : [{ label: 'Boka samtal', href: '/kontakt' }]),
  });
  html = setInstantPreview(html, preview);

  return html;
}

function routeToOutput(route) {
  if (route === '/') return path.join(DIST_DIR, 'index.html');
  return path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');
}

async function writeRoute(route, html) {
  const out = routeToOutput(route);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, html, 'utf8');
}

function extractString(block, key) {
  const re = new RegExp(`${key}:\\s*\"([\\s\\S]*?)\"`, 'm');
  const m = block.match(re);
  return m ? m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';
}

function splitArticleBlocks(text) {
  const blocks = [];
  const marker = /\n\s*\{\s*\n\s*slug:\s*"/g;
  const starts = [];
  let m;
  while ((m = marker.exec(text))) starts.push(m.index + 1);
  for (let i = 0; i < starts.length; i++) {
    blocks.push(text.slice(starts[i], starts[i + 1] || text.lastIndexOf('\n];')));
  }
  return blocks;
}

function extractSections(block) {
  const sections = [];
  const re = /heading:\s*"([\s\S]*?)"[\s\S]*?content:\s*(?:`([\s\S]*?)`|"([\s\S]*?)")/g;
  let m;
  while ((m = re.exec(block))) {
    const heading = (m[1] || '').replace(/\\"/g, '"');
    const content = (m[2] || m[3] || '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
    if (heading && content) sections.push({ heading, content });
  }
  return sections;
}

function extractFaq(block) {
  const faq = [];
  const re = /q:\s*"([\s\S]*?)"[\s\S]*?a:\s*"([\s\S]*?)"/g;
  let m;
  while ((m = re.exec(block))) {
    faq.push({ q: m[1].replace(/\\"/g, '"'), a: m[2].replace(/\\"/g, '"') });
  }
  return faq;
}

function extractArticles() {
  const files = ['articlesData1.ts', 'articlesData2.ts', 'articlesData3.ts', 'articlesData4.ts', 'articlesData5.ts', 'articlesData6.ts', 'articlesData7.ts'];
  const articles = [];

  for (const file of files) {
    const filePath = path.join(SRC_LIB_DIR, file);
    if (!existsSync(filePath)) continue;
    const text = readFileSync(filePath, 'utf8');
    for (const block of splitArticleBlocks(text)) {
      const slug = extractString(block, 'slug');
      if (!slug) continue;
      const article = {
        slug,
        keyword: extractString(block, 'keyword'),
        category: extractString(block, 'category'),
        title: extractString(block, 'title'),
        metaTitle: extractString(block, 'metaTitle'),
        metaDesc: extractString(block, 'metaDesc'),
        publishedDate: extractString(block, 'publishedDate'),
        updatedDate: extractString(block, 'updatedDate'),
        intro: extractString(block, 'intro'),
        sections: extractSections(block),
        faq: extractFaq(block),
      };
      articles.push(article);
    }
  }

  const seen = new Set();
  return articles.filter((a) => {
    if (seen.has(a.slug)) return false;
    seen.add(a.slug);
    return true;
  });
}

function buildArticleBody(article) {
  const sections = article.sections
    .map((s) => `<section><h2>${escapeHtml(s.heading)}</h2><p>${escapeHtml(stripTags(s.content))}</p></section>`)
    .join('\n');
  const faq = article.faq?.length
    ? `<section><h2>Vanliga frågor</h2>${article.faq.map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join('\n')}</section>`
    : '';
  return `<article><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.intro)}</p>${sections}${faq}</article>`;
}

// ───── City extraction (parse src/lib/cityContent.ts) ─────
function extractCities() {
  const filePath = path.join(SRC_LIB_DIR, 'cityContent.ts');
  if (!existsSync(filePath)) return [];
  const text = readFileSync(filePath, 'utf8');

  // Parse cities array
  const citiesMatch = text.match(/export const cities[^=]*=\s*\[([\s\S]*?)\n\];/);
  const citiesBlock = citiesMatch ? citiesMatch[1] : '';

  const cities = [];
  const cityRe = /\{\s*slug:\s*"([^"]+)",\s*city:\s*"([^"]+)",\s*region:\s*"([^"]+)",\s*intro:\s*"([\s\S]*?)",\s*localContext:\s*"([\s\S]*?)",\s*comparison:\s*"([\s\S]*?)",/g;
  let m;
  while ((m = cityRe.exec(citiesBlock))) {
    // Find the matching block to extract faqs as well
    const blockStart = m.index;
    // crude: faqs are within this object until next `\n  {` or end
    const restStart = m.index + m[0].length;
    const restEnd = citiesBlock.indexOf('\n  },\n', restStart);
    const fullBlock = citiesBlock.slice(blockStart, restEnd > 0 ? restEnd : undefined);
    const faqs = extractFaq(fullBlock);
    cities.push({
      slug: m[1],
      city: m[2],
      region: m[3],
      intro: m[4],
      localContext: m[5],
      comparison: m[6],
      faqs,
    });
  }

  // Parse citySeo object
  const seoMatch = text.match(/export const citySeo[^=]*=\s*\{([\s\S]*?)\n\};/);
  const seoBlock = seoMatch ? seoMatch[1] : '';

  const seoMap = {};
  // Split by top-level slug keys (one level of indent)
  const seoEntryRe = /\n {2}(\w+):\s*\{([\s\S]*?)\n {2}\},/g;
  while ((m = seoEntryRe.exec(seoBlock + '\n  };'))) {
    const slug = m[1];
    const entryText = m[2];
    seoMap[slug] = {
      metaTitleSaaS: extractString(entryText, 'metaTitleSaaS'),
      metaDescSaaS: extractString(entryText, 'metaDescSaaS'),
      metaTitleAI: extractString(entryText, 'metaTitleAI'),
      metaDescAI: extractString(entryText, 'metaDescAI'),
      h1Pre: extractString(entryText, 'h1Pre'),
      h1Em: extractString(entryText, 'h1Em'),
    };
  }

  return cities
    .map((c) => ({ ...c, seo: seoMap[c.slug] }))
    .filter((c) => c.seo && c.seo.metaTitleAI);
}

function buildCityBody({ city, intro, localContext, comparison, variantH1, variantSubtitle }) {
  return `
    <main>
      <h1>${escapeHtml(variantH1)}</h1>
      <p>${escapeHtml(variantSubtitle)}</p>
      <p>${escapeHtml(intro)}</p>
      <h2>Lokal kontext – ${escapeHtml(city)}</h2>
      <p>${escapeHtml(localContext)}</p>
      <h2>Så skiljer vi oss</h2>
      <p>${escapeHtml(comparison)}</p>
      <p><a href="/kontakt">Kontakta oss för en kostnadsfri rådgivning</a> eller läs mer om våra <a href="/priser">priser</a>.</p>
    </main>
  `;
}

async function main() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  const template = await fs.readFile(templatePath, 'utf8');

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-image-sv.jpg`,
    image: `${SITE_URL}/og-image-sv.jpg`,
    email: 'info@auroramedia.se',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Linköping',
      addressRegion: 'Östergötlands län',
      addressCountry: 'SE',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 58.4108, longitude: 15.6214 },
    founder: { '@type': 'Person', name: 'Christoffer Holstensson' },
    sameAs: [
      'https://github.com/Ralibali',
      'https://www.allabolag.se/5592720220/aurora-media-ab',
    ],
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'sv-SE',
  };

  // Static pages
  for (const page of STATIC_PAGES) {
    const extraSchemas = page.cityName
      ? [buildCityServiceSchema({ route: page.route, title: page.title, description: page.description, cityName: page.cityName })]
      : [];
    const html = injectHtml({
      template,
      route: page.route,
      title: page.title,
      description: page.description,
      jsonLd: [organizationSchema, websiteSchema, ...buildPageSchema(page), ...extraSchemas, ...(page.schemas ?? [])],
      body: page.htmlBody ?? `<main><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.body)}</p></main>`,
      hreflang: page.hreflang === true,
      ogImage: page.ogImage,
      mono: page.mono,
      ctas: page.ctas,
    });
    await writeRoute(page.route, html);
  }

  // City pages (both /ai-byra-{slug} and /saas-utveckling-{slug}) — skip /ai-byra-linkoping (pillar)
  const cities = extractCities();
  const staticRoutes = new Set(STATIC_PAGES.map((p) => p.route));
  let cityCount = 0;
  for (const c of cities) {
    const variants = [
      {
        route: `/ai-byra-${c.slug}`,
        title: c.seo.metaTitleAI,
        description: c.seo.metaDescAI,
        h1: `AI-byrå i ${c.city}`,
        subtitle: `${c.seo.h1Pre} ${c.seo.h1Em}`,
      },
      {
        route: `/saas-utveckling-${c.slug}`,
        title: c.seo.metaTitleSaaS,
        description: c.seo.metaDescSaaS,
        h1: `SaaS-utveckling i ${c.city}`,
        subtitle: `${c.seo.h1Pre} ${c.seo.h1Em}`,
      },
    ];

    for (const v of variants) {
      if (staticRoutes.has(v.route)) continue; // pillar page handled in STATIC_PAGES

      const breadcrumbName = v.route.startsWith('/ai-byra-')
        ? `AI-byrå ${c.city}`
        : `SaaS-utveckling ${c.city}`;

      const pageSchemas = [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: v.title,
          description: v.description,
          url: fullUrl(v.route),
          isPartOf: { '@id': `${SITE_URL}/#website` },
          about: { '@id': `${SITE_URL}/#organization` },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: breadcrumbName, item: fullUrl(v.route) },
          ],
        },
        buildCityServiceSchema({ route: v.route, title: v.title, description: v.description, cityName: c.city }),
      ];
      const faqSchema = buildCityFaqSchema(c.faqs);
      if (faqSchema) pageSchemas.push(faqSchema);

      const body = buildCityBody({
        city: c.city,
        intro: c.intro,
        localContext: c.localContext,
        comparison: c.comparison,
        variantH1: v.h1,
        variantSubtitle: v.subtitle,
      });

      const html = injectHtml({
        template,
        route: v.route,
        title: v.title,
        description: v.description,
        jsonLd: [organizationSchema, websiteSchema, ...pageSchemas],
        body,
      });
      await writeRoute(v.route, html);
      cityCount++;
    }
  }

  // Blog articles
  let articleCount = 0;
  for (const article of extractArticles()) {
    const route = `/blogg/${article.slug}`;
    const html = injectHtml({
      template,
      route,
      title: article.metaTitle || article.title,
      description: article.metaDesc || article.intro,
      ogType: 'article',
      jsonLd: [organizationSchema, websiteSchema, ...buildArticleSchema(article)],
      body: buildArticleBody(article),
    });
    await writeRoute(route, html);
    articleCount++;
  }

  console.log(`Generated ${STATIC_PAGES.length} static pages, ${cityCount} city pages, ${articleCount} blog posts.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
