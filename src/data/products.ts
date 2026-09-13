export type AuroraProductGroup = "platform" | "vertical" | "venture";
export type AuroraProductStatus = "live" | "pilot" | "development";

export interface AuroraProduct {
  name: string;
  tagline: string;
  description: string;
  group: AuroraProductGroup;
  status: AuroraProductStatus;
  tags: string[];
  href: string;
  external?: boolean;
}

/** Publika produkter. Kundcase ligger i portfolio.ts; privata verktyg visas bara i Care. */
export const AURORA_PRODUCTS: AuroraProduct[] = [
  { name: "Aurora Care", tagline: "Gemensam kundportal för webb och löpande förvaltning.", description: "Samlar sajthälsa, support, rapporter, tillgänglighetsgranskning och consent-kontroller för Aurora Medias kunder.", group: "platform", status: "live", tags: ["Kundportal", "Webbdrift", "Rapportering"], href: "/aurora-care" },
  { name: "Aurora Sight", tagline: "Synlighet i AI-sök för svenska varumärken.", description: "Mäter hur ett företag syns i generativa sökmotorer och gör förbättringsarbetet konkret och uppföljningsbart.", group: "platform", status: "pilot", tags: ["AI-sök", "Analys", "Synlighet"], href: "/aurora-sight" },
  { name: "Aurora Local Boost", tagline: "Löpande lokal synlighet för företag med en eller flera platser.", description: "Samlar onboarding, lokala åtgärder, uppföljning och rapportering i ett återkommande arbetsflöde.", group: "platform", status: "pilot", tags: ["Lokal SEO", "Google", "Rapportering"], href: "/aurora-local" },
  { name: "Aurora Connect", tagline: "AI-receptionist som tar hand om inkommande samtal.", description: "Konfigurerbara samtalsflöden för bland annat trafikskolor, hotell och andra verksamheter med återkommande kundfrågor.", group: "platform", status: "pilot", tags: ["AI-röst", "Reception", "Automation"], href: "/aurora-voice" },
  { name: "Aurora Transport", tagline: "Operativ plattform för svenska transportbolag.", description: "Körorder, chaufförer, dispatch, fakturaunderlag, ruttoptimering och fleet-funktioner i samma arbetsflöde.", group: "vertical", status: "live", tags: ["Transport", "B2B SaaS", "Logistik"], href: "https://auroratransport.se", external: true },
  { name: "StayBoost", tagline: "Gästkommunikation och merförsäljning för mindre boenden.", description: "Automatiserar information före ankomst, digital incheckning, guest hub och betalda tillval.", group: "vertical", status: "live", tags: ["Hospitality", "SMS", "Merförsäljning"], href: "https://stayboost-sverige.lovable.app", external: true },
  { name: "Updro", tagline: "Marknadsplats där företag hittar rätt digital byrå.", description: "Standardiserade projektförfrågningar, matchning och jämförbara offerter för företag och byråer.", group: "venture", status: "live", tags: ["Marketplace", "B2B", "Leadgenerering"], href: "https://updro.se", external: true },
  { name: "Cykelhjälpen", tagline: "Marknadsplats för cykelägare och lokala verkstäder.", description: "Cykelägare skickar en serviceförfrågan och kan matchas med verkstäder i sitt område.", group: "venture", status: "live", tags: ["Marketplace", "Cykel", "Lokalt"], href: "https://cykelhjalpen.lovable.app", external: true },
  { name: "Hönsgården", tagline: "Digital flockhantering för svenska hönsägare.", description: "Vaccinationsschema, flocklogg, äggproduktion och återkommande skötsel samlat i en svensk app.", group: "venture", status: "live", tags: ["Mobilapp", "Prenumeration", "Djurhälsa"], href: "https://honsgarden.se", external: true },
  { name: "Agility Companion", tagline: "Träningsdagbok och tävlingsresultat för agility.", description: "Hjälper förare att följa träning, resultat och utveckling per hund i ett mobilanpassat flöde.", group: "venture", status: "live", tags: ["Hundsport", "Träningsdata", "Mobil"], href: "https://agilitymanager.se", external: true },
  { name: "Odlingsboken", tagline: "Digital odlingsdagbok med AI-stöd.", description: "Planering, dokumentation och råd utifrån gröda, odlingszon och årstid för svenska hemmaodlare.", group: "venture", status: "live", tags: ["Odling", "AI", "Konsument"], href: "https://garden-magic-bloom.lovable.app", external: true },
];

export const PRODUCT_GROUPS: Record<AuroraProductGroup, { eyebrow: string; title: string; description: string }> = {
  platform: { eyebrow: "Aurora-plattformen", title: "Tjänster som arbetar tillsammans", description: "De här modulerna säljs av Aurora Media och samlas stegvis i Aurora Care som kundens gemensamma kontrollpanel." },
  vertical: { eyebrow: "Branschplattformar", title: "Egna system för tydliga arbetsflöden", description: "Separata operativa produkter med egen domänlogik, men med Aurora Media som avsändare, byggpartner och kommersiellt paraply." },
  venture: { eyebrow: "Egna digitala produkter", title: "Produkter vi bygger och driver", description: "Fristående varumärken behåller sitt fokus. De kopplas till Aurora Media som ägare och referens, inte genom att all kod pressas in i samma app." },
};

export const PRODUCT_STATUS_LABEL: Record<AuroraProductStatus, string> = { live: "I drift", pilot: "Pilot", development: "Under utveckling" };
