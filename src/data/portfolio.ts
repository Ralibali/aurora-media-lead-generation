// Single source of truth för portfolio. Christoffer kan editera direkt här
// utan AI-kodning. Lägg till nya case längst ner och bumpa `order`.

export type PortfolioCategory = "saas" | "seo" | "development" | "marketing";
export type PortfolioStatus = "live" | "pågående" | "beta" | "planerad";

export interface PortfolioResult {
  label: string;
  labelEn: string;
  value: string;
}

export interface PortfolioItem {
  slug: string;
  name: string;
  domain: string;
  category: PortfolioCategory;
  /** Visningstext för typ. Sv. */
  type: "Byggd SaaS" | "SEO-uppdrag" | "Utvecklingsuppdrag" | "Marknadsföring";
  status: PortfolioStatus;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  stack: string[];
  url: string;
  buildTime?: string;
  featured: boolean;
  order: number;
  /** Path under /public, t.ex. /portfolio/aurora-transport.webp */
  screenshot?: string;
  /** Hörn-label på startsida (legacy från PortfolioSection) */
  shortLabel?: string;
  /** Längre prosa till case-sidan */
  problem?: string;
  solution?: string;
  lessons?: string;
  results?: PortfolioResult[];
}

export const PORTFOLIO: PortfolioItem[] = [
  {
    slug: "aurora-transport",
    name: "Aurora Transport",
    domain: "auroratransport.se",
    category: "saas",
    type: "Byggd SaaS",
    status: "live",
    tagline: "Dispatching-SaaS för svenska transportbolag.",
    taglineEn: "Dispatching SaaS for Swedish transport companies.",
    description:
      "Komplett dispatch- och fakturasystem för åkerier. Bygger schemaläggning, körorder, Fortnox-export och Stripe-fakturering på under 2 veckor.",
    descriptionEn:
      "Full dispatch and invoicing platform for trucking firms. Built scheduling, work orders, Fortnox export and Stripe invoicing in under 2 weeks.",
    stack: ["Lovable", "Supabase", "Stripe", "Fortnox API", "React", "Tailwind"],
    url: "https://auroratransport.se",
    buildTime: "Under 2 veckor",
    featured: true,
    order: 1,
    shortLabel: "FEATURED · TRANSPORT · B2B",
    problem:
      "Svenska transportbolag använder ofta Excel + telefon för dispatching. Det skalar inte när antalet körningar ökar och fakturering tar dagar manuellt.",
    solution:
      "Byggde en SaaS som hanterar hela kedjan: order in → schemaläggning → körorder till chaufför → automatisk Fortnox-export → Stripe-faktura. Allt i ett gränssnitt, optimerat för mobil ute på vägen.",
    results: [
      { label: "Lansering", labelEn: "Launched", value: "Under 2 veckor" },
      { label: "Betalande kund", labelEn: "Paying customer", value: "Dag 1" },
    ],
  },
  {
    slug: "updro",
    name: "Updro",
    domain: "updro.se",
    category: "saas",
    type: "Byggd SaaS",
    status: "live",
    tagline: "Marknadsplats där företag jämför offerter från digitala byråer.",
    taglineEn: "Marketplace where companies compare quotes from digital agencies.",
    description:
      "Tvåsidig marknadsplats. Företag beskriver projekt, byråer skickar jämförbara offerter, Stripe Connect hanterar betalningarna.",
    descriptionEn:
      "Two-sided marketplace. Companies post projects, agencies submit comparable quotes, Stripe Connect handles payouts.",
    stack: ["Lovable", "Supabase", "Stripe Connect", "React"],
    url: "https://updro.se",
    buildTime: "2 veckor",
    featured: false,
    order: 2,
    shortLabel: "MARKNADSPLATS",
    problem:
      "Att hitta rätt digital byrå är opaken process. Företag får ojämförbara offerter, byråer slösar tid på dåliga leads.",
    solution:
      "Standardiserad brief-mall + matchning + Stripe Connect för att ta en provision på avslut. Byråer onboardas löpande.",
    results: [
      { label: "Status", labelEn: "Status", value: "Live 2026" },
      { label: "Onboarding", labelEn: "Onboarding", value: "Löpande" },
    ],
  },
  {
    slug: "agilitymanager",
    name: "AgilityManager",
    domain: "agilitymanager.se",
    category: "saas",
    type: "Byggd SaaS",
    status: "live",
    tagline: "Träningsapp för svenska agility-förare. iOS + Android planerade 2026.",
    taglineEn: "Training app for Swedish agility handlers. iOS + Android planned 2026.",
    description:
      "Träningsdagbok, tävlingsresultat och statistik för agility. Scrapar resultat från SBK med Firecrawl och bygger föraprofiler automatiskt.",
    descriptionEn:
      "Training journal, competition results and statistics for dog agility. Scrapes results from SBK with Firecrawl and auto-builds handler profiles.",
    stack: ["Lovable", "Supabase", "Firecrawl", "React"],
    url: "https://agilitymanager.se",
    buildTime: "Under 2 veckor",
    featured: false,
    order: 3,
    shortLabel: "KONSUMENT · SAAS",
    problem:
      "Agility-förare för manuella anteckningar och loggar in på flera olika sajter för att kolla tävlingsresultat. Statistiken är spridd.",
    solution:
      "Samlat allt i en app: träningslogg, automatisk import av tävlingsresultat, statistik per hund. Premium-funktioner för aktiva tävlingsförare.",
    results: [{ label: "Status", labelEn: "Status", value: "Live, betalande" }],
  },
  {
    slug: "honsgarden",
    name: "Hönsgården",
    domain: "honsgarden.se",
    category: "saas",
    type: "Byggd SaaS",
    status: "live",
    tagline: "Freemium-app för svenska hönsägare. Webb + Google Play-app via Capacitor.",
    taglineEn: "Freemium app for Swedish backyard hen owners. Web + Google Play via Capacitor.",
    description:
      "Vaccinationsschema, flockhantering, äggproduktion. Capacitor-wrap för Play Store, RevenueCat för prenumerationer.",
    descriptionEn:
      "Vaccination schedule, flock management, egg production. Capacitor wrap for Play Store, RevenueCat for subscriptions.",
    stack: ["Lovable", "Supabase", "Capacitor", "RevenueCat", "Google Play"],
    url: "https://honsgarden.se",
    buildTime: "1 vecka",
    featured: false,
    order: 4,
    shortLabel: "KONSUMENT · MOBIL",
    problem:
      "Hobby-hönsägare har inget bra digitalt verktyg på svenska. Existerande appar är på engelska och saknar svensk regelefterlevnad.",
    solution:
      "Byggde svensk freemium-app med vaccinationsschema, flockhantering och premium-funktioner. Lanserade på Google Play via Capacitor utan separat native-bygge.",
    results: [{ label: "Premium-konvertering", labelEn: "Premium conversion", value: "67 % bland aktiva" }],
  },
  {
    slug: "odlingsdagboken",
    name: "Odlingsdagboken",
    domain: "odlingsdagboken.com",
    category: "saas",
    type: "Byggd SaaS",
    status: "live",
    tagline: "Svensk odlings-SaaS med AI-coach.",
    taglineEn: "Swedish gardening SaaS with AI coach.",
    description:
      "Odlingsdagbok med AI-coach byggd på Claude. Råd anpassade per zon, gröda och årstid.",
    descriptionEn:
      "Gardening journal with Claude-powered AI coach. Advice tailored per zone, crop and season.",
    stack: ["Lovable", "Supabase", "Claude API", "Stripe"],
    url: "https://odlingsdagboken.com",
    buildTime: "Under 2 veckor",
    featured: false,
    order: 5,
    shortLabel: "KONSUMENT · AI",
    problem:
      "Svenska hobbyodlare har inget verktyg som kombinerar dagbok med personlig rådgivning baserad på just deras zon och grödor.",
    solution:
      "Kombinerade odlingsdagbok med Claude-baserad AI-coach. Användaren matar in zon + gröda, får specifika råd som anpassas över säsongen.",
    results: [{ label: "Status", labelEn: "Status", value: "Live, betalande" }],
  },
  {
    slug: "goglamping-sweden",
    name: "GoGlamping Sweden",
    domain: "goglampingsweden.se",
    category: "development",
    type: "Utvecklingsuppdrag",
    status: "live",
    tagline: "Bokningssajt för glamping vid Göta kanal.",
    taglineEn: "Booking site for glamping by Göta Canal.",
    description:
      "Bokningssajt med SEO-fokus och Sirvoy-integration. Öppnar maj 2026.",
    descriptionEn:
      "Booking site with SEO focus and Sirvoy integration. Opens May 2026.",
    stack: ["React", "Vite", "Sirvoy API", "Tailwind"],
    url: "https://goglampingsweden.se",
    buildTime: "2 veckor",
    featured: false,
    order: 6,
    shortLabel: "BOKNING",
    problem:
      "Ny glamping-anläggning behövde bokningssajt med direktintegration mot Sirvoy och stark lokal SEO inför säsongsöppning.",
    solution:
      "Byggde React-sajt med Sirvoy-bokning, SEO-optimerad för 'glamping Göta kanal' och relaterade söktermer. Live i tid till säsongen.",
    results: [{ label: "Lansering", labelEn: "Launch", value: "Maj 2026" }],
  },
  {
    slug: "viriditas",
    name: "Viriditas",
    domain: "viriditasmassage.se",
    category: "development",
    type: "Utvecklingsuppdrag",
    status: "live",
    tagline: "Bokningssajt för massagemottagning.",
    taglineEn: "Booking site for massage clinic.",
    description:
      "Snabbsajt med direkttidsbokning. Levererad på en vecka.",
    descriptionEn:
      "Fast site with direct booking. Delivered in one week.",
    stack: ["React", "Vite", "Tailwind"],
    url: "https://viriditasmassage.se",
    buildTime: "1 vecka",
    featured: false,
    order: 7,
    shortLabel: "BOKNING",
    problem:
      "Massör behövde snabbt en professionell sajt med direkttidsbokning – inget krångel, ingen WordPress-administration.",
    solution:
      "Byggde lättviktssajt på React + Vite med direktintegration mot bokningssystem. Live på en vecka, betalande kund.",
    results: [{ label: "Leveranstid", labelEn: "Delivery", value: "1 vecka" }],
  },
  {
    slug: "yachting-sweden",
    name: "Yachting Sweden",
    domain: "yachtingsweden.se",
    category: "seo",
    type: "SEO-uppdrag",
    status: "pågående",
    tagline: "SEO och content för svensk båtbransch.",
    taglineEn: "SEO and content for Swedish yachting industry.",
    description:
      "Technical SEO, keyword-strategi och löpande content-arbete för svensk båt- och yachting-marknadsplats.",
    descriptionEn:
      "Technical SEO, keyword strategy and ongoing content work for Swedish yachting marketplace.",
    stack: ["Technical SEO", "Content strategy", "Schema.org", "Local SEO"],
    url: "https://yachtingsweden.se",
    featured: false,
    order: 8,
    shortLabel: "SEO · BÅT",
    problem:
      "Marknadsplats för båtbranschen behövde tydligare SEO-strategi för att synas på relevanta söktermer kring båtköp och yachting i Sverige.",
    solution:
      "Pågående SEO-arbete: keyword-research, technical audit, on-page-optimering, schema-markup och content-roadmap.",
  },
  {
    slug: "solcellsofferter",
    name: "Solcellsofferter.se",
    domain: "solcellsofferter.se",
    category: "seo",
    type: "SEO-uppdrag",
    status: "live",
    tagline: "SEO för svensk solcellsmarknadsplats.",
    taglineEn: "SEO for Swedish solar panel marketplace.",
    description:
      "SEO-strategi och content för marknadsplats inom solcellsinstallationer i Sverige. Keyword research, on-page och technical SEO.",
    descriptionEn:
      "SEO strategy and content for Swedish solar panel installation marketplace. Keyword research, on-page and technical SEO.",
    stack: ["SEO", "Content", "Keyword research", "Link building"],
    url: "https://solcellsofferter.se",
    featured: false,
    order: 9,
    shortLabel: "SEO · ENERGI",
    problem:
      "Konkurrensutsatt marknad för solcellsofferter där toppositioner i Google avgör volymen kvalificerade leads.",
    solution:
      "Strukturerat SEO-arbete: keyword-mapping per region, on-page-optimering, technical SEO och länkstrategi.",
  },
  {
    slug: "minandel",
    name: "Minandel.se",
    domain: "minandel.se",
    category: "development",
    type: "Utvecklingsuppdrag",
    status: "live",
    tagline: "V85 travtips-sajt med custom tema.",
    taglineEn: "V85 horse racing tips site with custom theme.",
    description:
      "WordPress-sajt med custom tema och API-integration mot ATG. Visar V85-spelsystem, analyser och statistik.",
    descriptionEn:
      "WordPress site with custom theme and ATG API integration. Displays V85 betting systems, analysis and statistics.",
    stack: ["WordPress", "Custom theme", "V85 API", "PHP", "Schema.org"],
    url: "https://minandel.se",
    featured: false,
    order: 10,
    shortLabel: "UTVECKLING · TRAV",
    problem:
      "Travtipsare behövde en plattform för att publicera V85-system, analyser och statistik – med automatisk hämtning av lopp och resultat från ATG.",
    solution:
      "Byggde custom WordPress-tema med API-integration mot ATG:s travbanor. Automatisk uppdatering av lopp, custom post types för spelsystem och statistik.",
  },
];

export const CATEGORY_LABEL: Record<PortfolioCategory, string> = {
  saas: "SaaS",
  seo: "SEO",
  development: "Utveckling",
  marketing: "Marknadsföring",
};

export const STATUS_LABEL: Record<PortfolioStatus, string> = {
  live: "Live",
  pågående: "Pågående",
  beta: "Beta",
  planerad: "Planerad",
};

/** HSL-tokens som mappar mot index.css. Färgerna är subtila men igenkännbara. */
export const CATEGORY_BADGE: Record<PortfolioCategory, string> = {
  saas: "bg-primary/10 text-primary border-primary/30",
  seo: "bg-[hsl(28_85%_55%)]/10 text-[hsl(28_70%_45%)] border-[hsl(28_70%_45%)]/30",
  development: "bg-[hsl(210_75%_55%)]/10 text-[hsl(210_70%_45%)] border-[hsl(210_70%_45%)]/30",
  marketing: "bg-[hsl(270_60%_60%)]/10 text-[hsl(270_55%_50%)] border-[hsl(270_55%_50%)]/30",
};

export const STATUS_DOT: Record<PortfolioStatus, string> = {
  live: "bg-[hsl(154_44%_45%)]",
  pågående: "bg-[hsl(45_90%_55%)]",
  beta: "bg-[hsl(210_75%_55%)]",
  planerad: "bg-muted-foreground/50",
};

export const getPortfolioBySlug = (slug: string) =>
  PORTFOLIO.find((p) => p.slug === slug);

export const getLocalizedTagline = (item: PortfolioItem, lang: "sv" | "en") =>
  lang === "en" ? item.taglineEn : item.tagline;

export const getLocalizedDescription = (item: PortfolioItem, lang: "sv" | "en") =>
  lang === "en" ? item.descriptionEn : item.description;

export const getRelatedPortfolio = (slug: string, count = 3) => {
  const current = getPortfolioBySlug(slug);
  if (!current) return [];
  // Same-category first, then fall back to others.
  const sameCat = PORTFOLIO.filter((p) => p.slug !== slug && p.category === current.category);
  const others = PORTFOLIO.filter((p) => p.slug !== slug && p.category !== current.category);
  return [...sameCat, ...others].slice(0, count);
};
