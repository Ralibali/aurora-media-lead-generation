// Edge Function: quick-ai-map
// Snabbvarianten av AI-kartan: besökaren beskriver sin vardag i fritext +
// anger sin e-post. AI tolkar texten till samma datastruktur som wizarden
// (processer, scoring, lösningar), leaden sparas i samma tabeller och får
// samma drip – och resultatsidan/PDF:en fungerar exakt som för fulla kartan.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Samma scoring-tabeller som submit-ai-map – deterministiskt och konsekvent.
const FREQ = { daily: 3, weekly: 2, monthly: 1, rare: 0, unknown: 1 } as const;
const TIME = { "0-1": 0, "1-3": 1, "3-5": 2, "5-10": 3, "10+": 4, unknown: 1 } as const;
const RULE = { yes: 3, partial: 2, no: 0, unknown: 1 } as const;
const DATA = { yes: 3, partial: 2, no: 0, unknown: 1 } as const;
const VALUE = { high: 3, medium: 2, low: 1, unknown: 2 } as const;

function potentialFromScore(score: number): string {
  if (score >= 13) return "Direkt AI-case";
  if (score >= 9) return "Hög potential";
  if (score >= 5) return "Medelpotential";
  return "Låg potential";
}

function totalPotentialLabel(avg: number): string {
  if (avg >= 12) return "Mycket hög";
  if (avg >= 9) return "Hög";
  if (avg >= 5) return "Medel";
  return "Låg";
}

const HOURS_PER_WEEK: Record<string, number> = {
  "0-1": 0.5, "1-3": 2, "3-5": 4, "5-10": 7.5, "10+": 12,
};

function automationFactor(p: { rule_based: string; data_available: string }): number {
  let f = 0.3;
  if (p.rule_based === "yes") f += 0.3;
  else if (p.rule_based === "partial") f += 0.15;
  if (p.data_available === "yes") f += 0.25;
  else if (p.data_available === "partial") f += 0.1;
  return Math.min(f, 0.85);
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function normalizeCompanyName(name: string): string {
  if (!name) return "ert företag";
  const trimmed = name.trim();
  if (trimmed === trimmed.toLowerCase() || trimmed === trimmed.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (/^(ab|hb|kb|as)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(" ");
  }
  return trimmed;
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

interface AiProcess {
  process_name: string;
  frequency: string;
  weekly_time: string;
  systems?: string | null;
  rule_based: string;
  data_available: string;
  business_value: string;
  recommended_solution: string;
  next_step: string;
  quick_wins?: string[];
}

interface AiQuickResult {
  company_name?: string;
  industry?: string;
  employee_count?: string;
  summary: string;
  processes: AiProcess[];
}

const VALID_FREQ = new Set(["daily", "weekly", "monthly", "rare"]);
const VALID_TIME = new Set(["0-1", "1-3", "3-5", "5-10", "10+"]);
const VALID_YPN = new Set(["yes", "partial", "no"]);
const VALID_VALUE = new Set(["high", "medium", "low"]);

// ---------- Yrkesmönster (84 yrken) ----------
// Första lagret i fallbacken: skräddarsydda processer per yrke/bransch.
// Matchar det besökaren skriver till ett känt yrke får de en analys med
// processer, lösningar och quick wins som är typiska för just det yrket.
interface ProcSeed {
  name: string;
  frequency: string;
  weekly_time: string;
  rule_based: string;
  data_available: string;
  business_value: string;
  solution: string;
  step: string;
  wins: string[];
}

const proc = (
  name: string, frequency: string, weekly_time: string,
  rule_based: string, data_available: string, business_value: string,
  solution: string, step: string, ...wins: string[]
): ProcSeed => ({ name, frequency, weekly_time, rule_based, data_available, business_value, solution, step, wins });

interface ProfSeed { re: RegExp; industry: string; procs: ProcSeed[] }

const PROFESSION_PATTERNS: ProfSeed[] = [
  // --- Bygg & hantverk ---
  { re: /elektrik|elektriker|elfirma|elinstallation|elbehörig|elektro/i, industry: "Bygg & hantverk", procs: [
    proc("Offerter på installationsjobb", "weekly", "3-5", "yes", "yes", "high",
      "Offertgenerator tränad på era eljobb – mata in förfrågan, få ett färdigt prissatt utkast med material och arbetstid.",
      "Samla 5–10 gamla elofferter som kan bli mallar.",
      "Mall för de vanligaste jobben (laddbox, renovering)", "Fast materialprislista som AI kan läsa"),
    proc("Serviceblad och fakturaunderlag", "daily", "3-5", "yes", "partial", "high",
      "Digitalt serviceblad i mobilen – montören kryssar klart jobbet på plats och fakturautkastet skapas direkt.",
      "Räkna hur många serviceblad som blir liggande per vecka.",
      "Foto på jobbet sparas automatiskt", "Faktura samma dag som jobbet"),
  ]},
  { re: /rörmok|\bvvs\b|värmepump|värmeanlägg|vvs-firma/i, industry: "Bygg & hantverk", procs: [
    proc("Offerter på VVS-jobb", "weekly", "3-5", "yes", "yes", "high",
      "Offertgenerator för VVS-jobben – förfrågan in, prissatt utkast med material och tid ut.",
      "Samla gamla offerter på de jobb ni gör oftast.",
      "Mallpriser för standardjobb (WC, blandare, värmepump)", "Digital förfrågan direkt från hemsidan"),
    proc("Jour- och serviceärenden till faktura", "daily", "3-5", "yes", "partial", "high",
      "Mobilt ärendeflöde där jour- och servicejobb dokumenteras med foto och blir fakturaunderlag automatiskt.",
      "Skriv ner alla steg ett serviceärende passerar idag.",
      "Ett ärendenummer per jobb", "Fakturautkast direkt efter avslutat jobb"),
  ]},
  { re: /snick/i, industry: "Bygg & hantverk", procs: [
    proc("Offerter och projektpriser", "weekly", "3-5", "yes", "yes", "high",
      "AI som räknar på material och timmar utifrån era tidigare snickerijobb och skriver offertutkastet.",
      "Samla priser från de senaste tio jobben i ett dokument.",
      "Prisbild per jobbtyp (kök, altan, innervägg)", "Offertmall med era villkor"),
    proc("Materialbeställningar och tidrapporter", "weekly", "3-5", "yes", "partial", "high",
      "Digital beställningslista kopplad till projektet, och tidrapportering i mobilen som räknar ihop veckan automatiskt.",
      "Räkna timmarna som går åt att pussla material och tider.",
      "En beställningslista per projekt", "Tidrapportering i mobilen"),
  ]},
  { re: /målar|måleri|tapetser/i, industry: "Bygg & hantverk", procs: [
    proc("Offerter på målerijobb", "weekly", "3-5", "yes", "yes", "high",
      "Offertgenerator från ytor och jobbtyp – kunden får snygg PDF inom en timme istället för nästa vecka.",
      "Lista era tre vanligaste jobbtyper och vad de kostar.",
      "Kvadratmeterpriser i ett blad", "Offertmall med färger och villkor"),
    proc("Projektdokumentation och fakturaunderlag", "weekly", "1-3", "yes", "partial", "high",
      "Foto + krysslista per projekt som automatiskt blir underlag för faktura och ROT.",
      "Börja fota före/efter på varje jobb systematiskt.",
      "Fast fotopunkt per rum", "ROT-underlag samlat per projekt"),
  ]},
  { re: /byggfirma|byggentrepren|entreprenad|byggprojekt|byggbolag/i, industry: "Bygg & hantverk", procs: [
    proc("ÄTA-hantering och projektmejl", "daily", "5-10", "partial", "partial", "high",
      "AI som sorterar projektmejlen per projekt, föreslår svar och flaggar möjliga ÄTA-arbeten direkt.",
      "Lista de senaste tio ÄTA:erna och hur de dokumenterades.",
      "ÄTA-mall med foto och datum", "En inkorgsvy per projekt"),
    proc("Tidrapporter och fakturaunderlag per projekt", "weekly", "3-5", "yes", "partial", "high",
      "Mobil tidrapportering per projekt som rullar ihop till fakturaunderlag utan kvällspussel.",
      "Räkna tidrapporterna som hanteras per vecka.",
      "En kanal för tider – inte SMS+papper", "Veckosammanställning automatiskt"),
  ]},
  { re: /taklägg|takrenover|takbyte|takarbet/i, industry: "Bygg & hantverk", procs: [
    proc("Offerter och besiktningsrapporter", "weekly", "3-5", "yes", "yes", "high",
      "AI som bygger offert från mått och bilder och skriver besiktningsrapporten automatiskt efter besöket.",
      "Standardisera vad som alltid dokumenteras på ett takbesök.",
      "Fast checklista för besiktning", "Offertmall per taktyp"),
    proc("Fakturering och ROT-underlag", "monthly", "1-3", "yes", "partial", "high",
      "Automation som samlar foton, materialkvitton och ROT-uppgifter till färdigt fakturaunderlag.",
      "Skapa en fast mappstruktur per jobb redan idag.",
      "Foto direkt i jobbmappen", "ROT-koll innan faktura skickas"),
  ]},
  { re: /golvlägg|golvslip|parkett|kakel|klinker|plattsätt/i, industry: "Bygg & hantverk", procs: [
    proc("Offerter med ytor och material", "weekly", "3-5", "yes", "yes", "high",
      "Offertgenerator där yta + material ger pris direkt – kunden får svar samma dag.",
      "Lägg era kvadratmeterpriser i ett fast blad.",
      "Pris per yta och materialtyp", "Offertutkast på 10 minuter"),
    proc("Fakturaunderlag och ROT", "monthly", "1-3", "yes", "partial", "high",
      "Digitalt jobbkort per projekt som samlar tider, material och foto till fakturaunderlag.",
      "Ett jobbkort per projekt, alltid ifyllt på plats.",
      "Materialkvitton fotas direkt", "ROT-underlag automatiskt"),
  ]},
  { re: /plåtslag|ventilation|ovk|plåtarbet/i, industry: "Bygg & hantverk", procs: [
    proc("Offerter och anbud", "weekly", "3-5", "yes", "yes", "high",
      "AI som skriver anbudssvaren utifrån era tidigare projekt och förfrågningsunderlaget.",
      "Samla tre vinnande anbud som får bli förebilder.",
      "Bibliotek av tidigare anbudstexter", "Fast prisstruktur för standardjobb"),
    proc("Protokoll och besiktningshandlingar", "weekly", "3-5", "yes", "partial", "high",
      "AI som fyller funktions- och OVK-protokoll från montörens anteckningar och foton på plats.",
      "Digitalisera en protokollmall i taget.",
      "Protokoll i mobilen på plats", "Foto kopplat till varje punkt"),
  ]},
  { re: /murar|murning|tegel|fasadputs|putsarbet/i, industry: "Bygg & hantverk", procs: [
    proc("Offerter på mur- och putsjobb", "weekly", "3-5", "yes", "yes", "high",
      "Offertgenerator räknad på ytor, material och tid från era tidigare jobb.",
      "Samla prisbilder från de senaste jobben.",
      "Prisbank per jobbtyp", "Offertmall med era villkor"),
    proc("Tidrapporter och fakturaunderlag", "weekly", "1-3", "yes", "partial", "high",
      "Mobil tidrapportering som automatiskt blir underlag för faktura och ROT.",
      "Börja rapportera tid per projekt i mobilen.",
      "En kanal för tider", "Veckosammanställning utan handpåläggning"),
  ]},
  { re: /trädgårdsanlägg|trädgårdssköt|trädgårdsfirma|trädgårdstjänst|gräsklipp|häckklipp/i, industry: "Bygg & hantverk", procs: [
    proc("Säsongsplanering och körscheman", "weekly", "3-5", "partial", "partial", "high",
      "Digitalt ruttschema där alla uppdrag och ändringar samlas – teamet ser dagen i mobilen utan morgonsamtal.",
      "Skriv ner alla återkommande uppdrag per kund och vecka.",
      "En tavla alla ser", "Auto-besked vid ändring"),
    proc("Offerter och återkommande kunder", "weekly", "1-3", "yes", "yes", "high",
      "Offertmallar för säsongsavtalen + automatisk påminnelse när det är dags att förnya.",
      "Räkna era återkommande kunder och deras säsongsupplägg.",
      "Standardpaket vår/sommar/höst", "Påminnelse om förnyelse automatiskt"),
  ]},
  { re: /trädfäll|arborist|stubbfräs|trädbeskär|trädvård/i, industry: "Bygg & hantverk", procs: [
    proc("Offerter och riskbedömningar", "weekly", "3-5", "partial", "partial", "high",
      "AI som skriver offert och riskbedömning från dina anteckningar och foton från platsbesöket.",
      "Gör en fast mall för vad som dokumenteras på plats.",
      "Foto + punkter på plats", "Riskbedömning som fylls i automatiskt"),
    proc("Fakturering och underlag", "monthly", "1-3", "yes", "partial", "high",
      "Jobbkort i mobilen som samlar tid, bilder och ROT-uppgifter till färdigt fakturaunderlag.",
      "Ett digitalt jobbkort per uppdrag.",
      "Foton sparas per jobb", "Faktura utan kvällsarbete"),
  ]},

  // --- Fastighet, städ & säkerhet ---
  { re: /städfir|städtjänst|hemstäd|kontorsstäd|flyttstäd|städare|städbolag/i, industry: "Städ & facility services", procs: [
    proc("Schema och schemaändringar", "daily", "5-10", "yes", "yes", "high",
      "Digitalt schema i mobilen där ändringar når städarna direkt – ingen SMS-rond på söndagskvällen.",
      "Räkna hur många schemaändringar som sker per vecka.",
      "Gemensam kanal för ändringar", "Auto-besked vid ändring"),
    proc("Fakturaunderlag och kvalitetsrundor", "weekly", "3-5", "yes", "partial", "high",
      "Digital kvalitetsrunda med foto som automatiskt blir underlag till kund och faktura.",
      "Välj en kund och börja dokumentera rundorna digitalt.",
      "Checklista per objekt", "Underlag direkt till faktura"),
  ]},
  { re: /fönsterputs|putsar fönster/i, industry: "Städ & facility services", procs: [
    proc("Ruttplanering och återkommande kunder", "weekly", "3-5", "yes", "partial", "high",
      "Smart ruttplanering per veckodag med automatiskt schema för återkommande kunder.",
      "Lista alla stamkunder och deras intervall.",
      "Fasta rutter per område", "Påminnelse till kund dagen innan"),
    proc("Offerter och kundpåminnelser", "weekly", "1-3", "yes", "yes", "medium",
      "Offertmallar + automation som hör av sig när det gått ett halvår sedan senaste putsen.",
      "Skriv ett återkomstmejl som kan gå ut automatiskt.",
      "Prislista per hustyp", "Halvårspåminnelse automatiskt"),
  ]},
  { re: /fastighetssköt|fastighetsförvalt|hyresadministration|bostadsrättsförvalt|\bbrf\b|felanmäl/i, industry: "Fastighet", procs: [
    proc("Felanmälningar och ärenden", "daily", "5-10", "partial", "yes", "high",
      "Digitalt ärendeflöde där felanmälan via formulär sorteras, tilldelas rätt entreprenör och återkopplas automatiskt.",
      "Räkna felanmälningarna per vecka och var de landar idag.",
      "Ett formulär istället för mejl+telefon", "Statusbesked till hyresgästen automatiskt"),
    proc("Besiktningar, avtal och rapporter", "monthly", "3-5", "yes", "partial", "medium",
      "Digitala besiktningsprotokoll med foto som arkiveras och blir återrapporter automatiskt.",
      "Digitalisera en besiktningsmall först.",
      "Protokoll i mobilen", "Påminnelse om förfallande avtal"),
  ]},
  { re: /säkerhetsföretag|vaktbolag|bevakning|säkerhetsvakt|ordningsvakt/i, industry: "Säkerhet", procs: [
    proc("Rapportering och händelseloggar", "daily", "3-5", "yes", "yes", "high",
      "Digital händelselogg i mobilen som sammanställer kundens rapport automatiskt – ingen omskrivning på kontoret.",
      "Standardisera vad en händelserapport alltid ska innehålla.",
      "Rapport på plats i mobilen", "Kundrapport varje vecka automatiskt"),
    proc("Schemaläggning av vakter", "weekly", "5-10", "partial", "partial", "high",
      "Schemaläggningsstöd som fördelar pass efter behörighet och bemannar om automatiskt vid sjukdom.",
      "Skriv ner reglerna ni lägger schemat efter.",
      "Pass mallade per objekt", "Auto-fråga vid ledigt pass"),
  ]},

  // --- Fordon ---
  { re: /bilverkstad|bilservice|bilreparation|mekaniker|bilmeck|verkstadsbokning/i, industry: "Fordon & verkstad", procs: [
    proc("Bokningar och kundåterkoppling", "daily", "3-5", "yes", "yes", "high",
      "Onlinebokning med automatiska SMS-påminnelser och statusbesked när bilen är klar – telefonen tystnar.",
      "Räkna dagens telefonsamtal om bokning och status.",
      "Bokningslänk på hemsidan", "SMS när bilen är klar"),
    proc("Arbetsorder och fakturaunderlag", "daily", "3-5", "yes", "partial", "high",
      "Digital arbetsorder där mekanikerns tid och delar automatiskt blir fakturaunderlag.",
      "Följ en arbetsorder från bokning till faktura idag.",
      "Delar registrerade direkt", "Faktura utan dubbelregistrering"),
  ]},
  { re: /däckverkstad|däckhotell|däckbyte|hjulskifte/i, industry: "Fordon & verkstad", procs: [
    proc("Säsongsbokningar för däckbyte", "weekly", "3-5", "yes", "yes", "high",
      "Bokningslänk inför säsongen – kunderna bokar själva, påminnelser och köhantering sker automatiskt.",
      "Öppna säsongsbokningen tidigt med en länk i sociala medier.",
      "Tidsbokning online", "SMS-påminnelse dagen innan"),
    proc("Däckhotell och stamkundsadministration", "weekly", "1-3", "yes", "partial", "medium",
      "Digitalt däckhotellsregister med automatisk säsongspåminnelse till varje förvaringskund.",
      "Samla kundlistan i ett digitalt register.",
      "Registreringsnummer kopplat till kund", "Påminnelse varje säsong automatiskt"),
  ]},
  { re: /rekond|biltvätt|bilvård|lackskydd|bilpolering/i, industry: "Fordon & verkstad", procs: [
    proc("Bokningar och betalning", "daily", "3-5", "yes", "yes", "high",
      "Onlinebokning där kunden väljer paket, betalar och får påminnelse – ni ser veckan i en vy.",
      "Lägg era paket i en bokningslänk.",
      "Paketpriser online", "Betalning vid bokning"),
    proc("Offerter till företagskunder", "weekly", "1-3", "yes", "yes", "medium",
      "Offertmallar för flottor och företagsavtal som går ut samma dag som förfrågan.",
      "Samla era företagspriser i en mall.",
      "Fasta paketpriser för företag", "Uppföljning automatiskt efter tre dagar"),
  ]},
  { re: /bilhandlare|bilförsälj|begagnade bilar|bilfirma|bilaffär/i, industry: "Fordon & verkstad", procs: [
    proc("Bilannonser och inköpsvärdering", "weekly", "3-5", "partial", "yes", "medium",
      "AI som skriver bilannonserna från registreringsnummer och bilder – och publicerar på alla kanaler samtidigt.",
      "Samla era fem bästa annonstexter som förebilder.",
      "Annonsutkast per bil automatiskt", "Publicering i alla kanaler samtidigt"),
    proc("Kundförfrågningar och provkörningar", "daily", "3-5", "partial", "yes", "high",
      "AI som svarar på förstaförfrågningarna, bokar provkörning och lägger kunden i uppföljningslistan.",
      "Skriv svaren på de fem vanligaste kundfrågorna.",
      "Auto-svar inom en minut", "Provkörning bokas direkt i kalendern"),
  ]},
  { re: /cykelverkstad|cykelreparation|cykelservice|elcykel/i, industry: "Fordon & verkstad", procs: [
    proc("Servicebokningar", "daily", "3-5", "yes", "yes", "high",
      "Onlinebokning för service med automatiska påminnelser och SMS när cykeln är klar.",
      "Mät hur många samtal som bara är 'är den klar?'.",
      "Bokningslänk på hemsidan", "SMS vid klar cykel"),
    proc("Delar och lager", "weekly", "1-3", "yes", "partial", "medium",
      "Digital lagerlista över reservdelar med larm när slitdelarna tar slut.",
      "Börja med de 20 delar ni byter oftast.",
      "Min/max-nivåer på slitdelar", "Beställningsförslag automatiskt"),
  ]},
  { re: /båtverkstad|båtservice|båtmotor|marinmotor|båtunderhåll/i, industry: "Fordon & verkstad", procs: [
    proc("Säsongsprojekt och arbetsorder", "weekly", "3-5", "partial", "partial", "high",
      "Digital arbetsorder per båt där tid, delar och foto samlas och blir fakturaunderlag automatiskt.",
      "En digital mapp per båt från dag ett.",
      "Foto före/efter per jobb", "Underlag till faktura utan omskrivning"),
    proc("Offerter och kunduppdateringar", "weekly", "1-3", "yes", "partial", "medium",
      "Offertmallar för vinterförvaring, service och reparationer + automatiska statusmejl till båtägaren.",
      "Samla priserna på era tre vanligaste tjänster.",
      "Paketpriser vinterförvaring/service", "Statusmejl per projektfas"),
  ]},

  // --- Transport & logistik ---
  { re: /åkeri|transportfirma|lastbil|fraktbolag|distributionskör/i, industry: "Transport & logistik", procs: [
    proc("Körorder och planering", "daily", "5-10", "partial", "partial", "high",
      "Digitalt orderflöde där uppdrag fördelas automatiskt och föraren ser dagens körning i mobilen.",
      "Skriv ner reglerna ni fördelar uppdrag efter idag.",
      "En tavla med dagens uppdrag", "Auto-besked till förare vid ändring"),
    proc("Fraktsedlar och fakturaunderlag", "daily", "3-5", "yes", "partial", "high",
      "Digital fraktsedel med foto vid leverans som automatiskt blir fakturaunderlag.",
      "Räkna pappersfraktsedlarna per vecka.",
      "Foto vid leverans", "Faktura direkt efter veckans körningar"),
  ]},
  { re: /taxi|taxibolag|färdtjänst/i, industry: "Transport & logistik", procs: [
    proc("Bokningar och färdtjänstorder", "daily", "5-10", "yes", "yes", "high",
      "Digitalt ordermottag där bokningar och färdtjänstorder fördelas automatiskt till rätt bil.",
      "Kartlägg vilka kanaler bokningarna kommer in via idag.",
      "Ett ordermottag för alla kanaler", "Auto-fördelning efter zon"),
    proc("Körjournaler och underlag", "weekly", "1-3", "yes", "yes", "medium",
      "Automatiska körjournaler från uppdragen – inga efterhandskrivna papper inför fakturering.",
      "Digitalisera körjournalen för en bil först.",
      "Journal ifylld automatiskt", "Underlag klart till faktura"),
  ]},
  { re: /budfirma|kurir|expressbud|paketleverans|sista milen/i, industry: "Transport & logistik", procs: [
    proc("Ruttplanering och kunduppdateringar", "daily", "3-5", "partial", "partial", "high",
      "Ruttoptimering som bygger dagens körning automatiskt och skickar ETA till mottagarna.",
      "Notera hur lång tid morgonens ruttplanering tar.",
      "Rutter byggs automatiskt", "SMS till mottagare med tid"),
    proc("Leveransbevis och kvitton", "daily", "3-5", "yes", "yes", "medium",
      "Digitalt leveransbevis med foto och signatur i mobilen – direkt till kundens system.",
      "Inför foto vid leverans som standard.",
      "Bevis direkt i mobilen", "Reklamationer halveras med foto"),
  ]},
  { re: /flyttfirma|flyttar|flyttjänst|magasinering|flyttbil/i, industry: "Transport & logistik", procs: [
    proc("Offerter efter besiktning", "weekly", "3-5", "partial", "yes", "high",
      "Offertgenerator från besöksanteckningarna – kubik, våningar och avstånd in, prisförslag ut.",
      "Standardisera vad som noteras på varje besiktning.",
      "Fast checklista vid besök", "Offert inom en timme efter besök"),
    proc("Bokningar och bekräftelser", "daily", "3-5", "yes", "yes", "high",
      "Bokningsflöde med automatiska bekräftelser, påminnelser och packtips till kunden.",
      "Skriv mejlen en gång – låt dem gå ut automatiskt.",
      "Bekräftelse direkt vid bokning", "Påminnelse dagen innan flytt"),
  ]},

  // --- Handel & e-handel ---
  { re: /webbshop|e-handel|nätbutik|onlinebutik|shopify|woocommerce|säljer online|webshop/i, industry: "Handel & e-handel", procs: [
    proc("Orderflöde och kundmejl", "daily", "5-10", "yes", "yes", "high",
      "AI som svarar på orderfrågorna ('var är mitt paket?') direkt från ordersystemet – dygnet runt.",
      "Lista de fem vanligaste orderfrågorna ni får.",
      "Auto-svar på statusfrågor", "Eskalering till människa vid reklamation"),
    proc("Produktbeskrivningar och lager", "weekly", "3-5", "partial", "yes", "medium",
      "AI som skriver produkttexterna från leverantörsdatan och flaggar när lagersaldot blir lågt.",
      "Välj en produktkategori och testa AI-texter där först.",
      "Texter i er tonalitet automatiskt", "Larm vid lågt saldo"),
  ]},
  { re: /klädbutik|modebutik|kläder.{0,15}butik|butik.{0,15}kläder/i, industry: "Handel & e-handel", procs: [
    proc("Lager och varupåfyllning", "weekly", "3-5", "yes", "partial", "high",
      "Digital lagerbok som visar vad som säljer och föreslår påfyllning innan hyllan gapar tom.",
      "Börja med topp-50 plaggen och deras omsättning.",
      "Säljsiffror per artikel synliga", "Påfyllnadsförslag automatiskt"),
    proc("Kundklubb och marknadsmejl", "monthly", "1-3", "partial", "yes", "medium",
      "Automation som skickar personliga erbjudanden baserat på vad kunden faktiskt köpt.",
      "Samla kundlistan på ett ställe.",
      "Segment: stamkund vs ny", "Utskick vid nyheter automatiskt"),
  ]},
  { re: /blomsterbutik|florist|blomsterhandel/i, industry: "Handel & e-handel", procs: [
    proc("Beställningar och eventförfrågningar", "daily", "3-5", "partial", "partial", "high",
      "Digitalt beställningsflöde för bröllop, begravning och företag – förfrågan blir offert samma dag.",
      "Gör ett fast formulär för eventförfrågningar.",
      "Offertmallar per eventtyp", "Bekräftelse och påminnelse automatiskt"),
    proc("Inköp och svinnkoll", "weekly", "1-3", "partial", "partial", "medium",
      "Enkel inköpslista kopplad till säsong och försäljning som håller svinnet nere.",
      "Notera svinnet en vecka – då vet ni vad det kostar.",
      "Inköp efter säsongskalender", "Daglig koll på kort datum"),
  ]},
  { re: /bokhandel|bokhandlare/i, industry: "Handel & e-handel", procs: [
    proc("Kundbeställningar och inköp", "daily", "3-5", "yes", "partial", "medium",
      "Digitalt beställningsregister där kundens önskemål blir inköpsorder och avisering sker automatiskt.",
      "Samla beställningslistan från pappret till digitalt.",
      "Avisering när boken kommit", "Inköpsförslag från önskemål"),
    proc("Nyhetsbrev och event", "monthly", "1-3", "partial", "yes", "low",
      "AI som skriver nyhetsbrevet utifrån månadens nyheter och era kommande kvällsevent.",
      "Samla kundmejlen i ett verktyg med samtycke.",
      "Fast nyhetsbrev varje månad", "Eventpåminnelse automatiskt"),
  ]},
  { re: /second ?hand|loppis|vintage|återbruksbutik/i, industry: "Handel & e-handel", procs: [
    proc("Prissättning och varuinlämning", "daily", "3-5", "partial", "partial", "medium",
      "AI som föreslår pris från foto och märke – och skriver varubeskrivningen direkt vid inlämningen.",
      "Testa fotobaserad prissättning på en varugrupp först.",
      "Prisförslag direkt vid inlämning", "Beskrivning utan handskrivande"),
    proc("Försäljningsrapporter till lämnare", "monthly", "3-5", "yes", "yes", "high",
      "Automation som räknar ut varje lämnares andel och skickar rapport + utbetalningsunderlag automatiskt.",
      "Digitalisera lämnarregistret först.",
      "Rapport per lämnare automatiskt", "Inga manuella uträkningar i månadsskiftet"),
  ]},
  { re: /matbutik|lanthandel|livsmedelsbutik|\bkiosk\b|närbutik|handelsbod/i, industry: "Handel & e-handel", procs: [
    proc("Beställningar och varupåfyllning", "daily", "3-5", "yes", "partial", "high",
      "Beställningsförslag utifrån försäljning och säsong – mindre tid i lagerrummet, färre tomma hyllor.",
      "Börja med de varugrupper som tar mest tid.",
      "Påfyllnadsförslag automatiskt", "Säsongsjustering utan handpåläggning"),
    proc("Bäst-före och svinnkoll", "daily", "1-3", "partial", "partial", "medium",
      "Digital bäst-före-lista som flaggar vad som ska prissänkas idag istället för att kastas i morgon.",
      "Räkna svinnet en vecka för att se kostnaden.",
      "Daglig flagglista", "Automatisk nedsättningsrutin"),
  ]},
  { re: /möbelbutik|inredningsbutik|inredningshandel|möbler.{0,15}butik/i, industry: "Handel & e-handel", procs: [
    proc("Kundförfrågningar och leveransbokningar", "daily", "3-5", "partial", "partial", "high",
      "AI som svarar på lagersaldo- och leveransfrågor direkt och bokar hemleverans automatiskt.",
      "Lista de fem vanligaste kundfrågorna.",
      "Auto-svar på standardfrågor", "Leverans bokas utan telefon"),
    proc("Lager och utställningsplanering", "weekly", "1-3", "partial", "partial", "medium",
      "Digital överblick över lager och utställning så beställningar sker i tid.",
      "Koppla försäljning till lagersaldon digitalt.",
      "Saldon synliga i mobilen", "Påminnelse om efterbeställning"),
  ]},

  // --- Restaurang & café ---
  { re: /restaurang|krog(?!värden)|à la carte|lunchservering|meny.{0,20}gäster/i, industry: "Restaurang & café", procs: [
    proc("Bordsbokningar och no-shows", "daily", "3-5", "yes", "yes", "high",
      "Bordsbokning online med automatiska påminnelser och väntelista – telefonbokningarna och no-showsen minskar.",
      "Räkna no-showsen senaste månaden – det är kostnaden.",
      "SMS-påminnelse 24 h innan", "Väntelista som fyller avbokningar"),
    proc("Inköp, lager och menykostnader", "weekly", "3-5", "partial", "partial", "medium",
      "Digital lagerlista som räknar marginalen per rätt automatiskt – ni ser vilka rätter som faktiskt bär sig.",
      "Räkna kostnaden på era fem mest sålda rätter.",
      "Marginal per rätt synlig", "Inköpsförslag från försäljning"),
  ]},
  { re: /café|kafé|fikaställe|espressobar|kaffebar/i, industry: "Restaurang & café", procs: [
    proc("Personalschema och bemanning", "weekly", "3-5", "partial", "partial", "high",
      "Schemaläggningsstöd där pass byts i appen och bemanningen följer försäljningskurvan.",
      "Skriv ner reglerna ni lägger schemat efter.",
      "Passbyten i appen", "Bemanning efter försäljning"),
    proc("Inköp och försäljningssammanställning", "weekly", "1-3", "yes", "partial", "medium",
      "Automatisk veckosammanställning av försäljning och inköp i inkorgen varje måndag.",
      "Bestäm de tre siffror ni faktiskt styr efter.",
      "Veckorapport automatiskt", "Ingen copy-paste från kassan"),
  ]},
  { re: /bageri|konditori|surdegs|bullbak/i, industry: "Restaurang & café", procs: [
    proc("Förhandsbeställningar", "daily", "3-5", "yes", "yes", "high",
      "Beställningsformulär för tårtor, semlor och catering – sammanställningen till produktion sker automatiskt.",
      "Lägg beställningsformuläret på hemsidan och i sociala medier.",
      "Beställningar samlas digitalt", "Produktionslista varje kväll automatiskt"),
    proc("Produktionsplanering och svinn", "daily", "1-3", "partial", "partial", "medium",
      "Produktionsplan utifrån beställningar och historisk försäljning – mindre svinn, färre slut-i-laget.",
      "Notera vad som blir över en vecka.",
      "Bakplan från data", "Svinnstatistik per produkt"),
  ]},
  { re: /pizzeria|food ?truck|gatukök|hamburgerbar|grillkiosk|sushibar/i, industry: "Restaurang & café", procs: [
    proc("Beställningar i flera kanaler", "daily", "3-5", "yes", "yes", "high",
      "Samlad orderinlåda för telefon, plattformar och egen sida – ingen manuell dubbelregistrering.",
      "Räkna hur många kanaler ni tar order i idag.",
      "En skärm för alla ordrar", "Bekräftelse till kund automatiskt"),
    proc("Inköp och kassasammanställning", "weekly", "1-3", "yes", "partial", "medium",
      "Automatisk veckosammanställning av kassa och inköp som landar i inkorgen.",
      "Välj de tre siffror ni vill se varje måndag.",
      "Rapport utan handpåläggning", "Avvikelser flaggas direkt"),
  ]},
  { re: /catering|festvåning|konferensmat|eventmat|sällskapsmat/i, industry: "Restaurang & café", procs: [
    proc("Förfrågningar och offerter", "weekly", "3-5", "yes", "yes", "high",
      "Offertgenerator för catering – antal gäster, meny och tillägg in, prissatt PDF ut samma timme.",
      "Gör fasta menypaket med priser.",
      "Paketpriser redo", "Offert inom en timme"),
    proc("Produktionsplanering per event", "weekly", "3-5", "partial", "partial", "high",
      "Digital produktionsplan per event: inköp, tider och personal samlat i en vy.",
      "Standardisera planen för ett genomsnittsevent.",
      "Checklista per event", "Inköpslista genereras automatiskt"),
  ]},
  { re: /nattklubb|cocktailbar|vinbar|\bpub\b|sportsbar/i, industry: "Restaurang & café", procs: [
    proc("Bokningar, gästlistor och eventkommunikation", "weekly", "3-5", "partial", "yes", "medium",
      "Digital gästlista och bordsbokning med automatiska bekräftelser och eventutskick.",
      "Samla bokningarna i ett system istället för DM+SMS.",
      "Gästlista digital", "Utskick inför event automatiskt"),
    proc("Lager och inköp", "weekly", "1-3", "yes", "partial", "medium",
      "Digital lagerbok för baren med beställningsförslag innan helgen.",
      "Börja med de 20 artiklar som omsätts mest.",
      "Larmsaldo på toppartiklar", "Beställningsförslag varje vecka"),
  ]},

  // --- Hälsa & friskvård ---
  { re: /\bfrisör|hårsalong|frisörsalong|klippning/i, industry: "Hälsa & friskvård", procs: [
    proc("Bokningar och ombokningar", "daily", "3-5", "yes", "yes", "high",
      "Onlinebokning med automatiska påminnelser och väntelista som fyller tomma tider – mindre telefon, färre hål i schemat.",
      "Mät no-shows och telefonbokningar en vecka.",
      "SMS-påminnelse 24 h innan", "Väntelista fyller återbud"),
    proc("Kundhistorik och återförsäljning", "weekly", "1-3", "partial", "partial", "medium",
      "Digitalt kundkort med färg- och formulärhistorik + automatiskt 'dags för klippning'-mejl efter sex veckor.",
      "Börja spara behandlingshistoriken digitalt.",
      "Historik per kund synlig", "Återbesökspåminnelse automatiskt"),
  ]},
  { re: /barberar|skäggtrim|barbershop/i, industry: "Hälsa & friskvård", procs: [
    proc("Bokningar och drop-in-hantering", "daily", "3-5", "yes", "yes", "high",
      "Onlinebokning med kölapp för drop-in – kunderna ser väntetiden och ni styr flödet.",
      "Mät hur många tider som står tomma per vecka.",
      "Bokning + kö i samma vy", "SMS när det närmar sig"),
    proc("Stamkundspåminnelser", "monthly", "1-3", "yes", "yes", "medium",
      "Automatiskt 'dags för trim'-mejl tre veckor efter besöket – stolarna fylls även svaga veckor.",
      "Samla kundernas mejl med samtycke vid betalning.",
      "Påminnelse efter tre veckor", "Erbjudande till bortfaller"),
  ]},
  { re: /nagelteknolog|nagelsalong|naglar|nagelvård/i, industry: "Hälsa & friskvård", procs: [
    proc("Bokningar och återbesök", "daily", "3-5", "yes", "yes", "high",
      "Onlinebokning där kunden bokar återbesöket direkt – plus automatisk påminnelse när det gått fyra veckor.",
      "Se till att varje kund lämnar med nästa tid bokad.",
      "Återbokning direkt i stolen", "Påminnelse efter fyra veckor"),
    proc("Kundregister och bildgalleri", "weekly", "1-3", "partial", "partial", "low",
      "Digitalt kundkort med bilder på tidigare arbeten som även blir material till sociala medier.",
      "Fota varje jobb systematiskt.",
      "Bildbank per kund", "Innehåll till sociala medier gratis"),
  ]},
  { re: /massage|massör|massageterapeut/i, industry: "Hälsa & friskvård", procs: [
    proc("Bokningar och intäktsluckor", "daily", "3-5", "yes", "yes", "high",
      "Onlinebokning med automatiska påminnelser och väntelista – luckorna fylls utan att du ringer runt.",
      "Räkna tomma timmar per vecka – det är intäkten.",
      "Påminnelse 24 h innan", "Väntelista vid återbud"),
    proc("Journalföring och kvitton", "weekly", "1-3", "yes", "partial", "medium",
      "Enkelt journalstöd där anteckningarna dikteras in och kvittona skapas automatiskt.",
      "Diktera anteckningen direkt efter behandlingen.",
      "Journal utan handskrivande", "Kvittens automatiskt"),
  ]},
  { re: /personlig tränare|\bpt\b|träningscoach|onlinecoach/i, industry: "Hälsa & friskvård", procs: [
    proc("Uppföljning av klienter och program", "weekly", "3-5", "partial", "partial", "high",
      "AI som skickar veckans check-in, samlar svaren och flaggar klienter som börjar tappa – du ser allt i en vy.",
      "Standardisera de fem frågor du alltid ställer.",
      "Check-in automatiskt varje vecka", "Flagga när någon tappar"),
    proc("Schema och betalningar", "weekly", "1-3", "yes", "yes", "medium",
      "Bokning + betalning i samma flöde, med automatiska påminnelser och förnyelse av klippkort.",
      "Sätt betalning vid bokning som standard.",
      "Klippkort som förnyas automatiskt", "Inga förfallna obetalda pass"),
  ]},
  { re: /\bgym\b|träningsstudio|fitnessstudio|crossfit|gymmet/i, industry: "Hälsa & friskvård", procs: [
    proc("Medlemskommunikation och bortfall", "weekly", "3-5", "partial", "yes", "high",
      "Automation som fångar medlemmar som slutat komma och skickar personlig win-back innan de säger upp.",
      "Definiera 'inaktiv' – t.ex. inget pass på 21 dagar.",
      "Flagga inaktiva automatiskt", "Win-back-mejl i din ton"),
    proc("Passbokning och bemanning", "daily", "3-5", "yes", "yes", "medium",
      "Passbokning med väntelista och automatisk instruktörsbemanning vid sjukdom.",
      "Mät passfylldheten per vecka.",
      "Väntelista fyller passen", "Bemanningslarm direkt"),
  ]},
  { re: /yoga|pilates|dansstudio|danskurs|meditation/i, industry: "Hälsa & friskvård", procs: [
    proc("Kursanmälningar och terminsadministration", "weekly", "3-5", "yes", "yes", "high",
      "Anmälningsflöde med betalning, bekräftelser och väntelista – terminsstarten sköter sig själv.",
      "Lägg nästa terms anmälan online med betalning direkt.",
      "Anmälan + betalning i ett steg", "Väntelista automatiskt"),
    proc("Schema och instruktörsbemanning", "weekly", "1-3", "partial", "partial", "medium",
      "Digitalt passchema där vikarier bokas in automatiskt vid frånvaro.",
      "Skriv ner reglerna för vem som kan hoppa in var.",
      "Vikarieförfrågan automatiskt", "Deltagarna får besked direkt"),
  ]},
  { re: /\bspa\b|dagspa|spahotell|spabehandling|hudvårdssalong|ansiktsbehandling|hudterapeut/i, industry: "Hälsa & friskvård", procs: [
    proc("Bokningar och paketförsäljning", "daily", "3-5", "yes", "yes", "high",
      "Onlinebokning för behandlingar och paket med automatiska påminnelser och presentkort i samma flöde.",
      "Lägg era tre mest bokade behandlingar online först.",
      "Paket bokningsbara online", "Presentkort säljer sig själva"),
    proc("Stamkunder och återbesök", "monthly", "1-3", "yes", "yes", "medium",
      "Automatisk påminnelse när det gått åtta veckor sedan behandlingen – med bokningslänk direkt.",
      "Märk kunder som inte varit inne på två månader.",
      "Återbesöksmejl automatiskt", "Personligt erbjudande till stamkunder"),
  ]},
  { re: /optiker|glasögon|synundersökning|linser/i, industry: "Hälsa & friskvård", procs: [
    proc("Undersökningsbokningar och påminnelser", "daily", "3-5", "yes", "yes", "high",
      "Automatisk återkallelse av kunder vartannat år + onlinebokning med SMS-påminnelser.",
      "Räkna kunder som inte varit inne på två år – det är potentialen.",
      "Återkallelse automatiskt", "Bokningslänk direkt i mejlet"),
    proc("Lager och leverantörsorder", "weekly", "1-3", "yes", "partial", "medium",
      "Digital lagerkoll på bågar och linser med beställningsförslag.",
      "Börja med linserna – de har tydligast omsättning.",
      "Larmsaldo på toppartiklar", "Orderförslag automatiskt"),
  ]},

  // --- Vård & djur ---
  { re: /tandläkar|tandvård|tandhygienist|tandtekniker/i, industry: "Vård & omsorg", procs: [
    proc("Bokningar, påminnelser och avbokningar", "daily", "3-5", "yes", "yes", "high",
      "Automatiska SMS-påminnelser och en väntelista som fyller avbokade tider samma timme – receptionen slipper ringa ut.",
      "Mät hur många avbokade tider som blir oifyllda per vecka.",
      "SMS-påminnelse 24 h innan", "Digital väntelista vid återbud"),
    proc("Återkallelser av patienter", "weekly", "1-3", "yes", "yes", "high",
      "Automatisk återkallelse sex månader efter besök med bokningslänk – stolarna står inte tomma.",
      "Räkna hur många återkallelsesamtal ni ringer per vecka.",
      "Fast utskick varje vecka", "Bokningslänk direkt i påminnelsen"),
  ]},
  { re: /vårdcentral|\bläkarmottagning|vårdmottagning|mottagning.{0,20}patienter|patienter.{0,20}mottagning/i, industry: "Vård & omsorg", procs: [
    proc("Patientflöde och återbud", "daily", "5-10", "partial", "yes", "high",
      "Digital köhantering med automatiska påminnelser och väntelista som fyller återbuden direkt.",
      "Mät antalet uteblivna besök per vecka.",
      "Påminnelser automatiskt", "Väntelista fyller luckorna"),
    proc("Journalkommunikation och remisser", "daily", "3-5", "partial", "partial", "high",
      "AI som strukturerar anteckningar och remissutkast från diktamen – läkaren granskar istället för att skriva.",
      "Testa diktering av journalanteckningar en vecka.",
      "Utkast istället för blankt papper", "Remissmallar ifyllda automatiskt"),
  ]},
  { re: /fysioterap|kiropraktor|naprapat|sjukgymnast/i, industry: "Vård & omsorg", procs: [
    proc("Bokningar och patientpåminnelser", "daily", "3-5", "yes", "yes", "high",
      "Onlinebokning med automatiska påminnelser och väntelista som fyller återbud.",
      "Räkna uteblivna besök per vecka.",
      "SMS-påminnelse automatiskt", "Väntelista fyller luckorna"),
    proc("Behandlingsplaner och hemmaträning", "weekly", "1-3", "partial", "partial", "medium",
      "AI som bygger hemmaträningsprogrammet från dina anteckningar och mejlar patienten automatiskt.",
      "Standardisera era tre vanligaste program.",
      "Program mejlas direkt", "Uppföljning automatiskt efter en vecka"),
  ]},
  { re: /psykolog|psykoterapeut|\bkbt\b|samtalsterapi|\bkurator\b/i, industry: "Vård & omsorg", procs: [
    proc("Bokningar och väntelistor", "weekly", "3-5", "yes", "yes", "high",
      "Onlinebokning med automatisk väntelista och påminnelser – återbuden fylls utan telefonrond.",
      "Digitalisera väntelistan först.",
      "Påminnelse 24 h innan", "Väntelistan jobbar själv"),
    proc("Sessionsanteckningar och administration", "daily", "3-5", "partial", "partial", "high",
      "AI som strukturerar anteckningsutkast från diktamen efter sessionen – du granskar, inte skriver.",
      "Testa dikterade anteckningar en vecka.",
      "Anteckning klar samma dag", "Mer tid mellan patienterna"),
  ]},
  { re: /veterinär|djurklinik|djursjukhus|djurmottagning/i, industry: "Djurvård", procs: [
    proc("Bokningar och påminnelser", "daily", "3-5", "yes", "yes", "high",
      "Onlinebokning med automatiska påminnelser och återkallelser för vaccination och hälsokontroll.",
      "Räkna telefontiden på bokning per dag.",
      "Vaccinationspåminnelse automatiskt", "Bokningslänk i påminnelsen"),
    proc("Journaler och ägarinformation", "daily", "3-5", "partial", "partial", "high",
      "AI som skriver journalutkast från diktamen och skickar hemvårdsinstruktionen till ägaren automatiskt.",
      "Standardisera hemvårdsinstruktionerna för de vanligaste besöken.",
      "Journal utan kvällsskrivande", "Ägaren får instruktionen direkt"),
  ]},
  { re: /hundfrisör|hundtrim|hundsalong/i, industry: "Djurvård", procs: [
    proc("Bokningar och ras-specifika tider", "daily", "3-5", "yes", "yes", "high",
      "Onlinebokning där ras och storlek ger rätt tid automatiskt – schemat håller hela dagen.",
      "Sätt tider per ras/storlek i bokningen.",
      "Rätt tid per hund automatiskt", "SMS-påminnelse dagen innan"),
    proc("Stamkundspåminnelser", "monthly", "1-3", "yes", "yes", "medium",
      "Automatiskt 'dags för trim'-mejl åtta veckor efter besöket.",
      "Samla kundregistret digitalt.",
      "Påminnelse efter åtta veckor", "Stamkunderna bokar om själva"),
  ]},
  { re: /hunddagis|hundpensionat|djurpensionat|katthem/i, industry: "Djurvård", procs: [
    proc("Bokningar och närvarolistor", "daily", "3-5", "yes", "yes", "high",
      "Bokningsflöde där ägarna bokar dagar själva och ni ser veckans närvaro i en vy.",
      "Digitalisera veckoschemat först.",
      "Närvarolista per dag automatiskt", "Ägarna bokar själva"),
    proc("Ägarkommunikation och fakturering", "weekly", "1-3", "yes", "partial", "medium",
      "Automatiska dagsuppdateringar med foto till ägarna + fakturering på faktisk närvaro.",
      "Skicka dagens foto automatiskt.",
      "Glada ägare utan extra jobb", "Faktura matchar närvaron"),
  ]},

  // --- Ekonomi, juridik & fastighet ---
  { re: /redovisningsbyrå|redovisning|bokföringsbyrå|bokföring|deklaration/i, industry: "Ekonomi & juridik", procs: [
    proc("Underlagsinsamling från klienter", "monthly", "5-10", "yes", "partial", "high",
      "Automation som jagar kvitton och underlag per klient med påminnelser tills allt är inne – du slutar leta i mejlen.",
      "Lista vad som saknas hos era fem största klienter varje månad.",
      "Påminnelser automatiskt", "Underlagen samlas per klient"),
    proc("Rapportering och deadlines", "monthly", "3-5", "yes", "yes", "high",
      "Deadline-kalender med automatiska klientmejl och rapportutkast som fylls i från bokföringen.",
      "Lägg alla deadlines i ett delat flöde.",
      "Klienten påminns automatiskt", "Rapportutkast klart till granskning"),
  ]},
  { re: /advokat|juristbyrå|advokatbyrå|juridisk byrå/i, industry: "Ekonomi & juridik", procs: [
    proc("Klientintag och ärendeupplägg", "weekly", "3-5", "partial", "partial", "high",
      "Strukturerat intagsformulär där nya ärenden sorteras, får rätt mall och dokumenteras från första stund.",
      "Standardisera frågorna ni ställer till nya klienter.",
      "Intag via formulär", "Ärendemall automatiskt"),
    proc("Tidrapportering och fakturaunderlag", "weekly", "3-5", "yes", "partial", "high",
      "AI som bygger tidunderlaget från kalender och mejl per ärende – du godkänner bara.",
      "För kalender per ärende konsekvent en vecka.",
      "Tid per ärende automatiskt", "Fakturaunderlag utan letande"),
  ]},
  { re: /fastighetsmäklare|\bmäklare\b|bostadsförsäljning|budgivning/i, industry: "Fastighet", procs: [
    proc("Objektstexter och annonser", "weekly", "3-5", "partial", "yes", "high",
      "AI som skriver objektbeskrivningen från visningsanteckningarna i din tonalitet – utkast på minuter.",
      "Samla dina tre bästa objektstexter som förebilder.",
      "Utkast per objekt automatiskt", "Publicering i alla kanaler samtidigt"),
    proc("Spekulantregister och uppföljning", "daily", "3-5", "yes", "yes", "high",
      "Digitalt spekulantregister där intressenter automatiskt får nya objekt som matchar – innan de hör av sig.",
      "Börja tagga spekulanter efter vad de söker.",
      "Matchning automatiskt", "Uppföljning utan manuellt letande"),
  ]},

  // --- Konsult & tjänster ---
  { re: /konsult|konsultbolag|rådgivningsbolag|management/i, industry: "Konsult & tjänster", procs: [
    proc("Tidrapportering och fakturering", "weekly", "3-5", "yes", "yes", "high",
      "Tidregistrering som bygger fakturaunderlaget automatiskt per kund och projekt.",
      "En projektkod per uppdrag, alltid.",
      "Tid in i mobilen direkt", "Fakturaunderlag klart i månadsslutet"),
    proc("Offerter och upplägg", "weekly", "1-3", "partial", "yes", "medium",
      "AI som bygger offert- och uppläggsutkast från era tidigare uppdrag i er tonalitet.",
      "Samla era tre bästa upplägg som förebilder.",
      "Utkast på minuter", "Uppföljning automatiskt efter en vecka"),
  ]},
  { re: /marknadsföringsbyrå|reklambyrå|marknadsbyrå|contentbyrå|pr-byrå|kommunikationsbyrå/i, industry: "Konsult & tjänster", procs: [
    proc("Rapportering till kunder", "monthly", "3-5", "yes", "yes", "high",
      "Automatisk månadsrapport som hämtar siffrorna från annonsverktygen och skriver sammanfattningen i er ton.",
      "Bestäm vilka fem siffror kunderna faktiskt bryr sig om.",
      "Rapporten bygger sig själv", "Ingen copy-paste i månadsskiftet"),
    proc("Briefs och innehållsproduktion", "weekly", "3-5", "partial", "yes", "medium",
      "AI som strukturerar kundbriefs till produktionsklara underlag och första utkast.",
      "Standardisera briefmallen först.",
      "Brief blir utkast automatiskt", "Mindre fram-och-tillbaka med kund"),
  ]},
  { re: /rekryter|bemanning|personaluthyrning|headhunting|bemanningsföretag/i, industry: "Konsult & tjänster", procs: [
    proc("Kandidatsortering och återkoppling", "weekly", "5-10", "partial", "yes", "high",
      "AI som sorterar inkomna ansökningar mot kravprofilen och skriver personliga återkopplingar till alla.",
      "Standardisera kravprofilerna för era tre vanligaste roller.",
      "Sortering på timmar inte dagar", "Alla får svar – alltid"),
    proc("Intervjubokningar och schema", "weekly", "3-5", "yes", "yes", "medium",
      "Självbokning av intervjuer direkt i kalendern med automatiska påminnelser.",
      "Skicka bokningslänk istället för att mejla tider.",
      "Inga tids-mejl", "Påminnelser automatiskt"),
  ]},
  { re: /översättar|copywriter|skribent|frilansjournalist|textbyrå/i, industry: "Kreativa yrken", procs: [
    proc("Offerter och projektupplägg", "weekly", "1-3", "yes", "yes", "medium",
      "Offertmallar per uppdragstyp som går ut samma dag – med uppföljning automatiskt.",
      "Fasta priser per ord/sida/timme i en mall.",
      "Offert inom en timme", "Automatisk uppföljning"),
    proc("Research och utkastproduktion", "daily", "3-5", "partial", "yes", "medium",
      "AI-researchassistent som sammanställer bakgrundsmaterialet så du börjar skriva direkt.",
      "Testa på nästa uppdrag: låt AI göra researchsammandraget.",
      "Research sammanställd automatiskt", "Du skriver, inte letar"),
  ]},
  { re: /fotograf|fotografering|bröllopsfoto|fotostudio/i, industry: "Kreativa yrken", procs: [
    proc("Bokningsförfrågningar och offerter", "weekly", "3-5", "partial", "yes", "high",
      "Automatiska svar på förfrågningar med paketpriser och lediga tider – offerten går samma dag.",
      "Gör tre fasta paket med priser.",
      "Svar inom en timme", "Bokningslänk direkt"),
    proc("Bildleverans och urval", "weekly", "3-5", "partial", "yes", "medium",
      "Digitalt urvalsgalleri där kunden väljer bilder själv – faktura skapas vid godkännande.",
      "Testa ett galleriverktyg på nästa uppdrag.",
      "Kunden väljer själv", "Faktura automatiskt vid val"),
  ]},
  { re: /videograf|filmproduktion|videoproduktion|drönarfilm|filmbolag/i, industry: "Kreativa yrken", procs: [
    proc("Offertskrivande och upplägg", "weekly", "3-5", "partial", "yes", "medium",
      "AI som bygger offert och produktionsupplägg från kundens brief och era tidigare projekt.",
      "Malla era tre vanligaste produktionstyper.",
      "Offertutkast automatiskt", "Uppföljning efter tre dagar"),
    proc("Kundfeedback på material", "weekly", "3-5", "partial", "partial", "medium",
      "Samlad granskningslänk där kundens kommentarer landar tidskodat – ingen mejltråd med 'i sekund 32'.",
      "Inför en granskningslänk per projekt.",
      "Kommentarer på tidslinjen", "Versioner utan kaos"),
  ]},
  { re: /arkitekt|arkitektbyrå|arkitektritade|bygglovsritning/i, industry: "Kreativa yrken", procs: [
    proc("Projektadministration och handlingar", "weekly", "3-5", "partial", "partial", "high",
      "Digital projektstruktur där handlingar, versioner och kommunikation samlas per projekt automatiskt.",
      "Standardisera mappstrukturen för alla nya projekt.",
      "En sanning per projekt", "Versionskaoset försvinner"),
    proc("Tidrapportering per projekt", "weekly", "1-3", "yes", "partial", "high",
      "Tidregistrering per projektfas som bygger fakturaunderlaget automatiskt.",
      "Fas-koder per projekt från start.",
      "Tid per fas synlig", "Faktura utan efterarbete"),
  ]},
  { re: /inredare|inredningsdesign|homestyling|inredningsbyrå/i, industry: "Kreativa yrken", procs: [
    proc("Offerter och moodboards", "weekly", "3-5", "partial", "yes", "medium",
      "AI som bygger moodboard-utkast och offerter från kundens brief och era tidigare projekt.",
      "Samla era bästa tidigare moodboards som referens.",
      "Utkast på timmar inte dagar", "Offert i samma flöde"),
    proc("Inköpslistor och leverantörskontakt", "weekly", "3-5", "partial", "partial", "medium",
      "Digital inköpslista per projekt med status per artikel – kunden ser leveransläget själv.",
      "En inköpslista per projekt, alltid uppdaterad.",
      "Status per artikel synlig", "Färre 'när kommer soffan?'-mejl"),
  ]},

  // --- Event & upplevelser ---
  { re: /eventbyrå|eventproduktion|företagsevent|konferensarrangör|eventfirma/i, industry: "Event & upplevelser", procs: [
    proc("Deltagaradministration", "weekly", "3-5", "yes", "yes", "high",
      "Anmälningsflöde med automatiska bekräftelser, påminnelser och namnlistor – ingen manuell deltagarhantering.",
      "Lägg nästa events anmälan i ett digitalt flöde.",
      "Bekräftelser automatiskt", "Namnlistor uppdaterar sig själva"),
    proc("Offerter och leverantörslogistik", "weekly", "3-5", "partial", "partial", "high",
      "Offertgenerator för event + digital checklista per leverantör med automatiska påminnelser.",
      "Standardisera offertupplägget för ert vanligaste event.",
      "Offert på en dag", "Leverantörer påminda automatiskt"),
  ]},
  { re: /bröllopsplaner|bröllopskoordinator|bröllop.{0,20}planering/i, industry: "Event & upplevelser", procs: [
    proc("Gästadministration och OSA", "monthly", "3-5", "yes", "yes", "high",
      "Digitalt OSA-flöde där gästerna svarar själva och listan uppdateras automatiskt – allergier och bordsplacering i en vy.",
      "Skicka nästa OSA digitalt.",
      "Gästlistan uppdaterar sig själv", "Allergier samlade automatiskt"),
    proc("Leverantörsbokningar och tidslinjer", "weekly", "3-5", "partial", "partial", "high",
      "Digital projektplan per bröllop där alla leverantörer ser sin tid och får påminnelser automatiskt.",
      "Malla tidslinjen för ett standardbröllop.",
      "Alla ser samma plan", "Påminnelser går ut själva"),
  ]},
  { re: /\bdj\b|musiker|livemusik|spelningar|\bgig\b/i, industry: "Event & upplevelser", procs: [
    proc("Bokningsförfrågningar och offerter", "weekly", "1-3", "yes", "yes", "medium",
      "Automatiska svar med presskit, priser och lediga datum – bokningarna landar även när du spelar.",
      "Gör ett presskit och tre fasta priser.",
      "Svar inom en timme", "Offert automatiskt"),
    proc("Avtal, rider och logistik", "weekly", "1-3", "partial", "partial", "medium",
      "Digitala avtal och ridrar med e-signering och automatiska påminnelser inför spelningen.",
      "Standardisera din rider och ditt avtal.",
      "E-signering", "Logistikinfo ut automatiskt"),
  ]},
  { re: /begravningsbyrå|begravningsceremoni|begravningsentrepren/i, industry: "Personliga tjänster", procs: [
    proc("Ceremoniadministration och dokument", "weekly", "3-5", "yes", "partial", "high",
      "Digital checklista per ceremoni där dokument, beställningar och bokningar samlas och följs upp automatiskt.",
      "Standardisera checklistan för en vanlig ceremoni.",
      "Inget faller mellan stolarna", "Påminnelser automatiskt"),
    proc("Anhörigkommunikation", "weekly", "1-3", "partial", "partial", "medium",
      "Strukturerade uppdateringar till anhöriga i varje steg – varmt men utan dubbelarbete.",
      "Skriv standardtexterna en gång med omsorg.",
      "Uppdateringar i rätt ögonblick", "Mindre telefon, samma värme"),
  ]},

  // --- Turism & boende ---
  { re: /\bhotell|hotellrum|hotellgäster|hotellreception/i, industry: "Turism & boende", procs: [
    proc("Bokningar och gästkommunikation", "daily", "5-10", "yes", "yes", "high",
      "AI som svarar på gästfrågorna dygnet runt (Wi-Fi, utcheckning, parkering) och sköter bokningsändringar automatiskt.",
      "Lista de tio vanligaste gästfrågorna.",
      "Svar dygnet runt", "Receptionen får lugnare nätter"),
    proc("Recensioner och uppföljning", "weekly", "1-3", "partial", "yes", "medium",
      "Automatiskt tackmejl efter utcheckning med recensionslänk – AI skriver svar-utkast på recensionerna.",
      "Aktivera uppföljningsmejlet först.",
      "Fler recensioner utan tjat", "Svar-utkast klara att skicka"),
  ]},
  { re: /glamping|camping(?!platsen)|stugby|campingplats|husbilsplats/i, industry: "Turism & boende", procs: [
    proc("Bokningar och säsongspåslag", "daily", "5-10", "yes", "yes", "high",
      "Bokningsmotor för platser och enheter med automatiska bekräftelser och påminnelser – telefonen tystnar i högsäsong.",
      "Lägg bokningen online innan nästa säsong.",
      "Gästerna bokar själva", "Bekräftelse och påminnelse automatiskt"),
    proc("Gästfrågor och informationsmejl", "daily", "3-5", "partial", "yes", "medium",
      "AI-svarbot tränad på era frågor (incheckning, ved, aktiviteter) som svarar direkt – även när ni är ute på området.",
      "Skriv ner svaren på de tio vanligaste frågorna.",
      "Svar direkt dygnet runt", "Infomejl före ankomst automatiskt"),
  ]},
  { re: /vandrarhem|bed ?n? ?breakfast|\bb&b\b|gästhem/i, industry: "Turism & boende", procs: [
    proc("Bokningar och gästkommunikation", "daily", "3-5", "yes", "yes", "high",
      "Samlad bokningsvy för alla kanaler med automatiska bekräftelser och infomejl – inga dubbelbokningar.",
      "Synka kanalerna i en kanalhanterare.",
      "En kalender för allt", "Gästen får all info automatiskt"),
    proc("Städschema och rumsplanering", "daily", "1-3", "yes", "partial", "high",
      "Automatiskt städschema utifrån dagens in- och utcheckningar.",
      "Koppla städlistan till bokningarna.",
      "Rätt rum städas i rätt ordning", "Personalen ser dagen i mobilen"),
  ]},
  { re: /stuguthyrning|stugor.{0,15}uthyrning|fjällstuga|sommarstuga.{0,10}hyr|hyr.{0,10}ut.{0,10}stug|uthyrning av stugor/i, industry: "Turism & boende", procs: [
    proc("Bokningsförfrågningar och kalendersynk", "weekly", "3-5", "yes", "yes", "high",
      "Synkat kalender mellan plattformarna och egen sida + auto-svar på förfrågningar – inga dubbelbokningar.",
      "Inför en kanalhanterare för kalendern.",
      "En kalender för allt", "Svar på förfrågan inom en timme"),
    proc("Gästinformation och avstämningsmejl", "weekly", "1-3", "yes", "yes", "medium",
      "Automatiska infomejl före ankomst (nyckel, packlista) och uppföljning efter vistelsen.",
      "Skriv informationsmejlet en gång – låt det gå ut automatiskt.",
      "Gästen vet allt innan ankomst", "Recensioner rullar in"),
  ]},
  { re: /fiskecamp|fiskeguide|fisketur|fisketurism|guidetur|guidade turer/i, industry: "Turism & boende", procs: [
    proc("Bokningar och gruppförfrågningar", "weekly", "3-5", "yes", "yes", "high",
      "Bokningsflöde för turer och paket med automatiska bekräftelser och betalningslänkar.",
      "Lägg era tre mest sålda paket online med bokning.",
      "Bokning utan mejltrådar", "Bekräftelse direkt"),
    proc("Gästkommunikation före och efter tur", "weekly", "1-3", "partial", "yes", "medium",
      "Automatiskt infomejl (packlista, väder, träffpunkt) före turen och uppföljning med bilder efteråt.",
      "Skriv infomejlet en gång för alla.",
      "Gästerna kommer förberedda", "Uppföljning som ger återbokningar"),
  ]},
  { re: /aktivitetsföretag|äventyrsföretag|skiduthyrning|skidskola|klättring|kajak|paddling|zipline|höghöjdsbana/i, industry: "Turism & boende", procs: [
    proc("Bokningar och gruppindelning", "daily", "3-5", "yes", "yes", "high",
      "Bokningsflöde där gäster bokar aktivitet och tid själva – grupper och guider fördelas automatiskt.",
      "Lägg aktiviteterna i ett bokningsflöde med kapacitet.",
      "Gästerna bokar själva", "Grupplistor klara på morgonen"),
    proc("Deltagarlistor och säkerhetsunderlag", "daily", "1-3", "yes", "partial", "medium",
      "Digitala deltagarlistor med friskförklaring och nödkontakter – alltid aktuella i guide-mobilen.",
      "Digitalisera friskförklaringen först.",
      "Listor utan papper", "Säkerhetsinfo samlad"),
  ]},
  { re: /resebyrå|gruppresor|skräddarsydda resor|researrangör/i, industry: "Turism & boende", procs: [
    proc("Reseförslag och offerter", "weekly", "3-5", "partial", "yes", "high",
      "AI som bygger reseförslag med hotell och aktiviteter från kundens önskemål på minuter – du finslipar.",
      "Standardisera era tre mest sålda upplägg.",
      "Förslag samma dag", "Offert i snygg PDF automatiskt"),
    proc("Resedokument och bekräftelser", "weekly", "1-3", "yes", "yes", "medium",
      "Automation som samlar biljetter, bokningar och program till ett snyggt resepärm per kund.",
      "Malla resepärmen en gång.",
      "Dokument samlas automatiskt", "Kunden har allt i mobilen"),
  ]},

  // --- Utbildning & omsorg ---
  { re: /förskola|\bdagis\b|barnomsorg|förskoleklass/i, industry: "Utbildning & omsorg", procs: [
    proc("Närvaro, schema och föräldrakommunikation", "daily", "3-5", "yes", "partial", "high",
      "Digital närvarorapportering och schemaläggning med automatisk föräldrakommunikation vid ändringar.",
      "Kartlägg var informationen fastnar idag.",
      "Närvaro digitalt", "Föräldrarna får besked direkt"),
    proc("Dokumentation och utvecklingssamtal", "monthly", "3-5", "partial", "partial", "high",
      "AI som strukturerar observationer till dokumentationsutkast – pedagogerna granskar istället för att skriva från noll.",
      "Standardisera observationsmallen först.",
      "Utkast istället för blankt papper", "Mer tid med barnen"),
  ]},
  { re: /grundskol|gymnasieskol|friskol|\bskolan\b|skolans|utbildningsföretag|kursverksamhet|komvux|vuxenutbildning/i, industry: "Utbildning & omsorg", procs: [
    proc("Kursadministration och anmälningar", "weekly", "3-5", "yes", "yes", "high",
      "Anmälningsflöde med automatiska bekräftelser, intyg och deltagarlistor.",
      "Digitalisera anmälan för nästa kursomgång.",
      "Anmälan utan handpåläggning", "Intyg skapas automatiskt"),
    proc("Elev- och deltagarkommunikation", "weekly", "1-3", "partial", "partial", "medium",
      "Automatiska utskick inför kursstart, schemaändringar och uppföljningar.",
      "Skriv standardutskicken en gång.",
      "Alla får info i tid", "Mindre administration per kurs"),
  ]},

  // --- Jordbruk & natur ---
  { re: /lantbruk|jordbruk|mjölkkor|spannmål|grönsaksodling|gårdsbutik|lantgård/i, industry: "Jordbruk & natur", procs: [
    proc("Dokumentation och djurregister", "weekly", "3-5", "yes", "partial", "high",
      "Röstanteckning i fält som blir strukturerade journaler och rapporter – ingen kvällsadministration.",
      "Testa röstanteckning en vecka på ett område.",
      "Anteckna medan du jobbar", "Rapporterna skriver sig själva"),
    proc("Beställningar och gårdsförsäljning", "weekly", "1-3", "partial", "partial", "medium",
      "Digitalt ordermottag för gårdsbutik och leveranser med automatiska bekräftelser.",
      "Lägg beställningsformuläret där kunderna redan hör av sig.",
      "Ordrar samlas digitalt", "Bekräftelser automatiskt"),
  ]},
  { re: /ridskola|ridlektion|\bstall\b|hästpensionat|ridklubb/i, industry: "Jordbruk & natur", procs: [
    proc("Lektionsbokningar och hästschema", "weekly", "3-5", "yes", "yes", "high",
      "Bokningssystem där elever bokar lektioner själva och hästschemat uppdateras automatiskt – ingen dubbelbokad häst.",
      "Lägg lektionerna online med kapacitet per häst.",
      "Eleverna bokar själva", "Hästschemat håller själv"),
    proc("Medlems- och boxplatsadministration", "monthly", "1-3", "yes", "partial", "medium",
      "Digitalt register över medlemmar och boxplatser med automatisk fakturering.",
      "Samla registret digitalt.",
      "Fakturor ut automatiskt", "Väntelista på boxplatser digital"),
  ]},
  { re: /växthus|handelsträdgård|plantskola|blomsterodling|odling.{0,15}försäljning/i, industry: "Jordbruk & natur", procs: [
    proc("B2B-beställningar och leveranser", "weekly", "3-5", "yes", "partial", "high",
      "Digitalt ordermottag för återförsäljarna med automatiska orderbekräftelser och leveranslistor.",
      "Flytta beställningarna från telefon till formulär.",
      "Orderbekräftelse automatiskt", "Leveranslistan skriver sig själv"),
    proc("Odlingsplanering", "weekly", "1-3", "partial", "partial", "medium",
      "Digital odlingskalender som påminner om sådd, sticklingar och leveransveckor.",
      "Lägg nästa säsong i en digital kalender.",
      "Inget glöms i säsongspåslaget", "Planen synlig för hela teamet"),
  ]},
  { re: /skogsbruk|skogsägare|avverkning|skogsplantering|röjning/i, industry: "Jordbruk & natur", procs: [
    proc("Uppdragsdokumentation och fakturaunderlag", "weekly", "3-5", "yes", "partial", "high",
      "Mobil dokumentation per uppdrag – foto, ytor och tider blir fakturaunderlag automatiskt.",
      "Ett digitalt jobbkort per uppdrag.",
      "Underlag direkt från skogen", "Faktura utan efterarbete"),
    proc("Avtal och planering med skogsägare", "monthly", "1-3", "partial", "partial", "medium",
      "Digitalt uppdragsregister med avtal, kartor och status per fastighet.",
      "Samla pågående uppdrag i en vy.",
      "Status per fastighet synlig", "Påminnelser om återväxt automatiskt"),
  ]},

  // --- IT & teknik ---
  { re: /it-support|helpdesk|it-drift|supportärenden|it-avdelning|it-tekniker/i, industry: "IT & teknik", procs: [
    proc("Supportärenden och återkommande frågor", "daily", "5-10", "partial", "yes", "high",
      "AI som löser standardärendena (lösenord, åtkomst, utskrifter) direkt och eskalerar resten med färdig sammanfattning.",
      "Lista de tio vanligaste ärendena – de är botens bas.",
      "Standardärenden löses automatiskt", "Eskalering med kontext"),
    proc("Dokumentation och kunskapsbas", "weekly", "1-3", "partial", "yes", "medium",
      "AI som förvandlar lösta ärenden till kunskapsbasartiklar automatiskt.",
      "Börja med de fem vanligaste guiderna.",
      "Kunskapsbasen växer själv", "Färre upprepade ärenden"),
  ]},
  { re: /webbdesign|webbyrå|designbyrå|ux-design|ui-design|grafisk design/i, industry: "Kreativa yrken", procs: [
    proc("Kundbriefs och offertskrivande", "weekly", "1-3", "partial", "yes", "medium",
      "AI som strukturerar kundbriefen och skriver offertutkastet i er tonalitet.",
      "Standardisera brief- och offertmallarna.",
      "Offert samma dag", "Mindre administration per lead"),
    proc("Projektrapportering och kunduppdateringar", "weekly", "1-3", "yes", "yes", "medium",
      "Automatiska statusuppdateringar till kunderna varje vecka – utan att någon skriver dem.",
      "Bestäm vad kunden alltid vill veta.",
      "Uppdateringar automatiskt", "Färre 'hur går det?'-mejl"),
  ]},
];

// ---------- Nyckelords-fallback ----------
// Om LLM-anropet fallerar byggs analysen ändå på det som skrivits – via
// yrkesmönstren ovan + generiska svenska nyckelordsmönster för vanliga
// manuella processer. Garanterar att besökaren alltid får en analys
// grundad i sin egen text.
const KEYWORD_PATTERNS: {
  re: RegExp;
  name: string;
  frequency: string;
  weekly_time: string;
  rule_based: string;
  data_available: string;
  business_value: string;
  solution: string;
  step: string;
  wins: string[];
}[] = [
  {
    re: /offert|anbud|prisförfrågan/i,
    name: "Skapa och skicka offerter",
    frequency: "weekly", weekly_time: "3-5", rule_based: "yes", data_available: "yes", business_value: "high",
    solution: "Offertgenerator: AI som bygger färdiga offertutkast från förfrågan – du granskar och skickar.",
    step: "Samla 5–10 gamla offerter som kan bli mallar.",
    wins: ["Mallar för de vanligaste jobbtyperna", "Fast prisstruktur i Excel som AI kan läsa"],
  },
  {
    re: /faktur/i,
    name: "Fakturering och fakturaunderlag",
    frequency: "weekly", weekly_time: "3-5", rule_based: "yes", data_available: "partial", business_value: "high",
    solution: "Automation som samlar underlag automatiskt och skapar fakturautkast i ert ekonomisystem.",
    step: "Kartlägg var underlagen föds idag – mejl, app, papper?",
    wins: ["Digitalt underlagsflöde direkt i mobilen", "Auto-matchning mot projekt/kund"],
  },
  {
    re: /tidrapport|tidsredovis|tidrapporterna|stämpling/i,
    name: "Samla in och sammanställa tidrapporter",
    frequency: "weekly", weekly_time: "3-5", rule_based: "yes", data_available: "partial", business_value: "high",
    solution: "Tidrapportering i mobilen med automatisk sammanställning till lön och fakturering.",
    step: "Räkna hur många tidrapporter som hanteras per vecka.",
    wins: ["En kanal för tider – inte SMS+Excel+papper", "Veckosammanställning automatiskt"],
  },
  {
    re: /excel|kalkylblad|google sheets/i,
    name: "Manuellt arbete i Excel/kalkylblad",
    frequency: "weekly", weekly_time: "3-5", rule_based: "yes", data_available: "yes", business_value: "medium",
    solution: "Ersätt kalkylbladet med ett enkelt internt system som validerar och räknar automatiskt.",
    step: "Välj det ena blad som ändras oftast – börja där.",
    wins: ["En sanning istället för filversioner", "Automatiska summeringar och larm"],
  },
  {
    re: /mejl|mail|e-post|inkorg/i,
    name: "Svara på och sortera mejl",
    frequency: "daily", weekly_time: "3-5", rule_based: "partial", data_available: "yes", business_value: "medium",
    solution: "AI-assistent som svarar på återkommande mejl och sorterar in resten rätt.",
    step: "Lista de 5 vanligaste mejlfrågorna ni får.",
    wins: ["Svarsmallar för topp-5 frågorna", "Auto-utkast du bara godkänner"],
  },
  {
    re: /bokning|boka|bokningar|schema(?!t)|kalender/i,
    name: "Hantera bokningar och schema",
    frequency: "daily", weekly_time: "3-5", rule_based: "yes", data_available: "yes", business_value: "high",
    solution: "Självbetjäningsbokning med automatiska påminnelser via SMS/mejl.",
    step: "Mät antal no-shows senaste månaden – det är kostnaden.",
    wins: ["SMS-påminnelse 24 h innan", "Ombokningslänk istället för telefon"],
  },
  {
    re: /lager|inventer|inleverans|beställ/i,
    name: "Lagerhantering och beställningar",
    frequency: "daily", weekly_time: "3-5", rule_based: "yes", data_available: "partial", business_value: "high",
    solution: "Digital lagerbok med automatlarm vid lågt saldo och beställningsförslag.",
    step: "Börja med de 20 artiklar som omsätts snabbast.",
    wins: ["Min/max-nivåer på toppartiklarna", "Skanning vid inleverans"],
  },
  {
    re: /rapport|rapportera|sammanställ|statistik|uppfölj/i,
    name: "Sammanställa rapporter och uppföljning",
    frequency: "weekly", weekly_time: "1-3", rule_based: "yes", data_available: "partial", business_value: "medium",
    solution: "Automatisk rapport som hämtar siffrorna och landar i inkorgen varje vecka/månad.",
    step: "Bestäm de 3 siffror som faktiskt styr beslut.",
    wins: ["En sida per vecka, automatiskt", "Inga fler copy-paste-sessioner"],
  },
  {
    re: /kundfrågor|support|kundservice|kundärenden|reklamation/i,
    name: "Svara på återkommande kundfrågor",
    frequency: "daily", weekly_time: "3-5", rule_based: "partial", data_available: "partial", business_value: "medium",
    solution: "AI-svarbot på er kunskapsbas som löser standardfrågorna direkt.",
    step: "Skriv ner svaren på de 10 vanligaste frågorna – det är botens bas.",
    wins: ["FAQ-sidan som svarar direkt", "Eskalering till människa vid svåra fall"],
  },
  {
    re: /sociala medier|instagram|facebook|linkedin|tiktok|marknadsför|innehåll|poster/i,
    name: "Producera innehåll för sociala medier",
    frequency: "weekly", weekly_time: "3-5", rule_based: "partial", data_available: "yes", business_value: "medium",
    solution: "AI som förvandlar ert material till färdiga inläggsutkast i er tonalitet.",
    step: "Samla 10 gamla inlägg som visar er röst.",
    wins: ["Veckoplan av utkast på måndagar", "Återbruk av befintligt material"],
  },
  {
    re: /lön|löner|lönekörning|personaladmin/i,
    name: "Löneunderlag och personaladministration",
    frequency: "monthly", weekly_time: "3-5", rule_based: "yes", data_available: "partial", business_value: "high",
    solution: "Automation som samlar löneunderlaget och flaggar avvikelser innan körning.",
    step: "Lista allt som ska in i en lönekörning och var det bor idag.",
    wins: ["Checklista som fylls i automatiskt", "Avvikelselarm före körning"],
  },
  {
    re: /kvitto|kvitton|resa|reseavräkning|utlägg/i,
    name: "Kvitton och reseavräkningar",
    frequency: "weekly", weekly_time: "1-3", rule_based: "yes", data_available: "yes", business_value: "medium",
    solution: "Fota kvittot – AI läser av och bokför direkt i ekonomisystemet.",
    step: "Inför 'fota direkt'-regeln i stället för skopappar.",
    wins: ["Mobilfoto → bokfört utkast", "Ingen månadsstack med kvitton"],
  },
  {
    re: /planering|planera|rutt|körschema|dispatch|logistik|transport/i,
    name: "Planering och koordinering av körningar/jobb",
    frequency: "daily", weekly_time: "5-10", rule_based: "partial", data_available: "partial", business_value: "high",
    solution: "Planeringsstöd som föreslår upplägg och uppdaterar alla automatiskt vid ändringar.",
    step: "Skriv ner reglerna ni planerar efter – ofta kan 80 % automatiseras.",
    wins: ["En tavla alla ser – inga dubbelbokningar", "Auto-besked vid ändring"],
  },
  {
    re: /order|ordrar|beställning(ar)? från/i,
    name: "Ta emot och registrera ordrar",
    frequency: "daily", weekly_time: "3-5", rule_based: "yes", data_available: "yes", business_value: "high",
    solution: "AI som läser inkomna ordrar (mejl/PDF) och registrerar dem direkt i systemet.",
    step: "Samla 20 exempelordrar för att se mönstren.",
    wins: ["Auto-utkast från mejl", "Bekräftelse till kund direkt"],
  },
];

function seedToProcess(s: ProcSeed): AiProcess {
  return {
    process_name: s.name,
    frequency: s.frequency,
    weekly_time: s.weekly_time,
    systems: null,
    rule_based: s.rule_based,
    data_available: s.data_available,
    business_value: s.business_value,
    recommended_solution: s.solution,
    next_step: s.step,
    quick_wins: s.wins,
  };
}

// Två lager: (1) skräddarsydda yrkesprocesser om texten nämner ett känt yrke,
// (2) generiska processnyckelord för det texten uttryckligen säger – utan
// att dubblera det yrkesprocesserna redan täcker. Max 3 processer totalt.
function keywordFallback(fritext: string): { processes: AiProcess[]; industry: string | null } {
  const processes: AiProcess[] = [];
  const seen = new Set<string>();
  let industry: string | null = null;

  const tokens = (s: string) => s.toLowerCase().match(/[a-zåäö]{4,}/g) ?? [];
  const commonPrefixLen = (a: string, b: string) => {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i;
  };
  // Ord räknas som samma även i böjd/sammansatt form:
  // "tidrapporter"≈"tidrapportering", "bokningar"≈"bordsbokningar".
  const tokenOverlap = (a: string[], b: string[]) =>
    a.some((x) => b.some((y) =>
      commonPrefixLen(x, y) >= 6 ||
      (x.length >= 6 && y.includes(x)) ||
      (y.length >= 6 && x.includes(y))
    ));
  const overlapsExisting = (name: string) => {
    const t = tokens(name);
    return processes.some((p) => tokenOverlap(t, tokens(p.process_name)));
  };
  const push = (p: AiProcess) => {
    const key = p.process_name.toLowerCase();
    if (seen.has(key) || processes.length >= 3) return;
    seen.add(key);
    processes.push(p);
  };

  // 1. Yrkesmönster – processer skräddarsydda för det/de yrken som nämns
  const profHits = PROFESSION_PATTERNS.filter((p) => p.re.test(fritext)).slice(0, 2);
  for (const prof of profHits) {
    if (!industry) industry = prof.industry;
    for (const s of prof.procs) push(seedToProcess(s));
  }

  // 2. Generiska nyckelord – det texten uttryckligen nämner
  for (const k of KEYWORD_PATTERNS) {
    if (processes.length >= 3) break;
    if (!k.re.test(fritext) || overlapsExisting(k.name)) continue;
    push(seedToProcess(k));
  }

  return { processes, industry };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return json({ ok: true });
    }

    const fritext = String(body.fritext ?? "").trim().slice(0, 2500);
    const email = String(body.email ?? "").trim().slice(0, 160);
    const contact_name = String(body.contact_name ?? "").trim().slice(0, 80);
    const companyInput = String(body.company_name ?? "").trim().slice(0, 120);
    const consent = body.consent === true;

    if (fritext.length < 30) return json({ error: "Beskriv gärna lite mer – minst några meningar om er vardag." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Ogiltig e-postadress." }, 400);
    if (!consent) return json({ error: "Samtycke krävs." }, 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI-tjänst ej konfigurerad." }, 500);

    // ---------- 1. Tolka fritexten med AI ----------
    const systemPrompt = `Du är en senior AI- och automationsrådgivare på Aurora Media (Linköping).
Du analyserar en fri text där ett företag beskriver sin vardag, och identifierar vilka manuella processer som kan automatiseras.
Tjänsten används av alla sorters företag och yrken – hantverkare, vårdpersonal, butiksägare, restauranger, bönder, konsulter, frisörer, turismföretag, föreningar. Du ska kunna analysera vilken vardag som helst och anpassar alltid processnamn och lösningar efter just deras yrke och deras egna ord.
Du svarar ALLTID på svenska – även om texten är på engelska eller annat språk.
Du skriver enkelt och tydligt för en VD som INTE är tekniker. Konkret, mänskligt, aldrig säljigt. Inga emojis.

STRIKTA REGLER:
- Utgå ENBART från vad texten faktiskt säger. Ta bara med processer som nämns eller tydligt antyds i texten. Hitta aldrig på egna.
- Nämn gärna deras egna ord/system i processnamn och lösningar (t.ex. "Word", "Fortnox", "SMS") så de känner igen sig.
- Uppskatta tider KONSERVATIVT utifrån vad som är rimligt för den typen av företag och storlek. Bättre för lågt än för högt.
- recommended_solution: konkret och specifik för Deras situation, inte generisk. Nämn vad som byggs och vad det gör.
- next_step: ett enkelt första steg de kan ta själva, utan oss.
- quick_wins: 2-3 korta konkreta saker de kan göra direkt.
- Om företagsnamn framgår av texten, ange det i company_name – annars utelämna det helt.
- Gissa industry utifrån texten (t.ex. "Bygg & hantverk", "Transport & logistik", "Ekonomi & redovisning").
- Ge 1-3 processer – bara så många som texten faktiskt stödjer.`;

    const userPrompt = `EXEMPEL på hur en bra analys ser ut:

Text: "Vi är en städfirma med 6 anställda. Schemat lägger jag i Excel varje söndag och skickar på SMS. Kunderna ringer och ändrar hela tiden. Faktureringen gör jag i Fortnox en gång i månaden och letar underlag i min mail."
Bra analys:
- process_name: "Lägga schema och kommunicera ändringar", frequency: "weekly", weekly_time: "3-5", rule_based: "yes", data_available: "yes", business_value: "high", recommended_solution: "Digitalt schema i mobilen där ändringar når personalen direkt – ingen SMS-rond på söndagskvällen.", next_step: "Räkna hur många schemaändringar som sker per vecka.", quick_wins: ["Gemensam kanal för ändringar", "Auto-besked vid ändring"]
- process_name: "Samla fakturaunderlag från mejlen", frequency: "monthly", weekly_time: "3-5", rule_based: "yes", data_available: "partial", business_value: "high", recommended_solution: "Automation som hämtar underlag ur mejlen och skapar fakturautkast i Fortnox löpande – inte allt sista veckan.", next_step: "Skapa en mapp/regel som samlar underlagsmejl automatiskt.", quick_wins: ["Underlag digitalt direkt", "Fast körning varje fredag"]
- summary: "Ni lägger mest tid på schemaändringar och fakturaunderlag – två klassiska automationscase. Schemat påverkar vardagen mest och bör byggas först; underlagen frigör flera timmar i månads-slutet."

TILL EXEMPEL, en helt annan bransch:

Text: "Jag driver en tandläkarmottagning med tre stolar. Receptionen ringer hela dagarna om bokningar och avbokningar, och vi ringer manuellt ut återkallelser när det gått sex månader. Journalföringen tar en timme varje kväll."
Bra analys:
- process_name: "Bokningar, påminnelser och avbokningar", frequency: "daily", weekly_time: "3-5", rule_based: "yes", data_available: "yes", business_value: "high", recommended_solution: "Automatiska SMS-påminnelser och en väntelista som fyller avbokade tider direkt – receptionen slipper ringa ut.", next_step: "Mät hur många avbokningar som blir oifyllda per vecka.", quick_wins: ["SMS-påminnelse 24 h innan", "Digital väntelista vid återbud"]
- process_name: "Manuella återkallelser av patienter", frequency: "weekly", weekly_time: "1-3", rule_based: "yes", data_available: "yes", business_value: "high", recommended_solution: "Automatisk återkallelse sex månader efter besök med bokningslänk – stolarna står inte tomma.", next_step: "Räkna hur många återkallelsesamtal ni ringer per vecka.", quick_wins: ["Fast utskick varje vecka", "Bokningslänk direkt i påminnelsen"]
- summary: "Mottagningens största tidstjuvar sitter i receptionen: bokningshantering och manuella återkallelser. Båda följer tydliga regler och kan automatiseras direkt, vilket frigör tid till patienterna."

FÖRETAGETS TEXT SOM DU SKA ANALYSERA:
"""
${fritext}
"""
${companyInput ? `De uppgav själva företagsnamnet: ${companyInput}` : ""}

Gör motsvarande analys för just denna text. Kom ihåg: bara processer texten stödjer, deras egna ord i lösningarna, konservativa tider.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "deliver_quick_analysis",
              description: "Strukturerad snabbanalys av fritext på svenska",
              parameters: {
                type: "object",
                properties: {
                  company_name: { type: "string" },
                  industry: { type: "string" },
                  employee_count: { type: "string" },
                  summary: { type: "string" },
                  processes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        process_name: { type: "string" },
                        frequency: { type: "string", enum: ["daily", "weekly", "monthly", "rare"] },
                        weekly_time: { type: "string", enum: ["0-1", "1-3", "3-5", "5-10", "10+"] },
                        systems: { type: "string" },
                        rule_based: { type: "string", enum: ["yes", "partial", "no"] },
                        data_available: { type: "string", enum: ["yes", "partial", "no"] },
                        business_value: { type: "string", enum: ["high", "medium", "low"] },
                        recommended_solution: { type: "string" },
                        next_step: { type: "string" },
                        quick_wins: { type: "array", items: { type: "string" } },
                      },
                      required: [
                        "process_name", "frequency", "weekly_time", "rule_based",
                        "data_available", "business_value", "recommended_solution", "next_step",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["summary", "processes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "deliver_quick_analysis" } },
      }),
    });

    let ai: AiQuickResult | null = null;
    let analysisSource = "llm";
    if (aiResp.ok) {
      const aiJson = await aiResp.json();
      const argsStr = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      try {
        ai = argsStr ? JSON.parse(argsStr) : null;
      } catch (e) {
        console.error("[quick-ai-map] parse failed", e);
      }
    } else {
      const txt = await aiResp.text();
      console.error("[quick-ai-map] AI error", aiResp.status, txt);
    }

    // Fallback: bygg analysen på nyckelord ur texten om LLM:n fallerar –
    // besökaren ska alltid få något som speglar det hen faktiskt skrev.
    if (!ai || !Array.isArray(ai.processes) || ai.processes.length === 0) {
      const fb = keywordFallback(fritext);
      if (fb.processes.length > 0) {
        analysisSource = "keywords";
        ai = { summary: "", industry: fb.industry ?? undefined, processes: fb.processes };
        console.log("[quick-ai-map] LLM misslyckades – fallback gav", fb.processes.length, "processer, bransch:", fb.industry ?? "okänd");
      } else {
        return json({ error: "Kunde inte tolka texten – försök beskriva lite mer konkret vad som tar tid i er vardag (vilka uppgifter, vilka system, hur ofta)." }, 422);
      }
    }

    // Fallback-summary om LLM:n inte levererade någon
    if (!ai.summary || ai.summary.trim().length < 20) {
      const first = ai.processes[0]?.process_name ?? "administrationen";
      const branch = ai.industry ? ` inom ${String(ai.industry).toLowerCase()}` : "";
      ai.summary = `Utifrån er beskrivning hittade vi ${ai.processes.length} ${ai.processes.length === 1 ? "process" : "processer"}${branch} med tydlig automationspotential. Största hävstången ligger i "${first}" – det är den vi rekommenderar att börja med. Siffrorna är en försiktig uppskattning baserad på det ni skrev; i ett kort samtal kan vi vässa dem exakt.`;
    }

    // ---------- 2. Scora deterministiskt (samma logik som wizarden) ----------
    const scored = ai.processes.slice(0, 3).map((p, idx) => {
      const frequency = VALID_FREQ.has(p.frequency) ? p.frequency : "weekly";
      const weekly_time = VALID_TIME.has(p.weekly_time) ? p.weekly_time : "1-3";
      const rule_based = VALID_YPN.has(p.rule_based) ? p.rule_based : "partial";
      const data_available = VALID_YPN.has(p.data_available) ? p.data_available : "partial";
      const business_value = VALID_VALUE.has(p.business_value) ? p.business_value : "medium";
      const score = (FREQ as any)[frequency] + (TIME as any)[weekly_time] + (RULE as any)[rule_based] + (DATA as any)[data_available] + (VALUE as any)[business_value];
      const weeklyHours = HOURS_PER_WEEK[weekly_time] ?? 2;
      const savedHoursPerWeek = Math.round(weeklyHours * automationFactor({ rule_based, data_available }) * 10) / 10;
      return {
        position: idx,
        process_name: String(p.process_name).trim().slice(0, 160),
        frequency, weekly_time, rule_based, data_available, business_value,
        systems: p.systems ? String(p.systems).slice(0, 200) : null,
        score,
        potential: potentialFromScore(score),
        recommended_solution: String(p.recommended_solution ?? "Skräddarsydd AI-automation").slice(0, 300),
        next_step: String(p.next_step ?? "").slice(0, 300),
        saved_hours_per_week: savedHoursPerWeek,
        quick_wins: Array.isArray(p.quick_wins) ? p.quick_wins.slice(0, 3).map((s) => String(s).slice(0, 200)) : [],
      };
    });

    const totalScore = scored.reduce((s, p) => s + p.score, 0);
    const avg = scored.length ? totalScore / scored.length : 0;
    const total_potential = totalPotentialLabel(avg);
    const totalSavedPerWeek = Math.round(scored.reduce((s, p) => s + (p.saved_hours_per_week || 0), 0) * 10) / 10;
    const totalSavedPerYear = Math.round(totalSavedPerWeek * 46);
    const top3 = [...scored].sort((a, b) => b.score - a.score).slice(0, 3);

    const company_name = normalizeCompanyName(companyInput || ai.company_name || "");
    const industry = String(ai.industry ?? "Annan bransch").slice(0, 80);
    const employee_count = String(ai.employee_count ?? "okänt").slice(0, 20);

    const aiAnalysis = {
      executive_summary: String(ai.summary ?? "").slice(0, 1200),
      maturity_note: "",
      overall_recommendation: "",
      cases: scored.map((p) => ({
        process_name: p.process_name,
        why_it_matters: "",
        deep_analysis: "",
        concrete_example: "",
        quick_wins: p.quick_wins,
        risks: "",
      })),
    };

    // ---------- 3. Spara lead + processer + drip ----------
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: "server_misconfigured" }, 500);
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: lead, error: leadErr } = await admin
      .from("ai_map_leads")
      .insert({
        company_name: company_name || "Okänt företag",
        industry,
        employee_count,
        contact_name: contact_name || "–",
        email,
        phone: null,
        pain_areas: ["Snabbanalys (fritext)"],
        consent,
        total_score: totalScore,
        total_potential,
        ai_analysis: aiAnalysis,
        ip: getClientIp(req),
        user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      })
      .select("id, share_token")
      .single();

    if (leadErr || !lead) {
      console.error("[quick-ai-map] lead insert failed", leadErr);
      return json({ error: "Kunde inte spara analysen." }, 500);
    }

    const leadId = lead.id;
    const shareToken = lead.share_token as string;

    const procRows = scored.map((p) => ({
      lead_id: leadId,
      position: p.position,
      process_name: p.process_name,
      frequency: p.frequency,
      weekly_time: p.weekly_time,
      systems: p.systems,
      rule_based: p.rule_based,
      data_available: p.data_available,
      business_value: p.business_value,
      score: p.score,
      potential: p.potential,
      recommended_solution: p.recommended_solution,
      next_step: p.next_step,
      saved_hours_per_week: p.saved_hours_per_week,
    }));
    const { error: procErr } = await admin.from("ai_map_processes").insert(procRows);
    if (procErr) console.error("[quick-ai-map] process insert failed", procErr);

    // Drip-sekvens (samma som wizarden)
    try {
      const { error: dripErr } = await admin.from("ai_map_email_sequence").insert({ lead_id: leadId, email });
      if (dripErr) console.error("[quick-ai-map] drip enqueue failed", dripErr);
    } catch (e) {
      console.error("[quick-ai-map] drip enqueue threw", e);
    }

    // Intern notis (samma mönster som wizarden)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const internalHtml = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;color:#0f172a;">
          <h2 style="margin:0 0 12px;">Ny SNABBANALYS (fritext)</h2>
          <p><strong>Företag:</strong> ${escape(company_name || "–")} (${escape(industry)})</p>
          <p><strong>Kontakt:</strong> ${escape(contact_name || "–")} · ${escape(email)}</p>
          <p><strong>Total potential:</strong> ${escape(total_potential)} · Sparad tid: ~${totalSavedPerWeek} h/vecka · Källa: ${analysisSource}</p>
          <h3 style="margin-top:16px;">Fritexten:</h3>
          <p style="background:#f1f5f9;padding:12px;border-radius:8px;font-size:13px;line-height:1.6;">${escape(fritext.slice(0, 900))}</p>
          <h3>Topp-case</h3>
          <ol>${top3.map((t) => `<li><strong>${escape(t.process_name)}</strong> – ${escape(t.potential)} (${t.score} p)</li>`).join("")}</ol>
          <p>Lead-ID: ${leadId}</p>
        </div>`;
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Aurora Media <noreply@auroramedia.se>",
          to: [Deno.env.get("INTERNAL_LEADS_EMAIL")?.trim() || "info@auroramedia.se"],
          reply_to: email,
          subject: `Snabbanalys – ${company_name || "okänt"} (${total_potential})`,
          html: internalHtml,
        }),
      }).catch((e) => console.error("[quick-ai-map] internal mail threw", e));
    }

    // ---------- 4. Samma svar som wizarden ----------
    return json({
      ok: true,
      leadId,
      shareToken,
      totalScore,
      avg: Number(avg.toFixed(1)),
      total_potential,
      processes: scored,
      top3,
      totalSavedPerWeek,
      totalSavedPerYear,
      pain_areas: ["Snabbanalys (fritext)"],
      ai_analysis: aiAnalysis,
      meta: { company_name: company_name || "Okänt företag", contact_name: contact_name || "", email, industry, employee_count },
    });
  } catch (err) {
    console.error("[quick-ai-map] error", err);
    return json({ error: "Internal error" }, 500);
  }
});
