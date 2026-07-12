import { ContactModalProvider } from "@/components/ContactModal";
import { SEO } from "@/components/SEO";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/lumina.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";

import AiAutomationForetag from "./pages/AiAutomationForetag";
import AiByraLinkoping from "./pages/AiByraLinkoping";
import AiKarta from "./pages/AiKarta";
import AiKartaStart from "./pages/AiKartaStart";
import AiKartaResultat from "./pages/AiKartaResultat";
import AiKonsultSverige from "./pages/AiKonsultSverige";
import Produkter from "./pages/Produkter";
import Process from "./pages/Process";
import Arbete from "./pages/Arbete";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CasePage from "./pages/CasePage";
import CityPage from "./pages/CityPage";
import Integritetspolicy from "./pages/Integritetspolicy";
import Index from "./pages/Index";
import IndexV5 from "./pages/_versions/IndexV5";
import Kontakt from "./pages/Kontakt";
import Metodik from "./pages/Metodik";
import NotFound from "./pages/NotFound";
import Om from "./pages/Om";
import Priser from "./pages/Priser";
import RedaktionellPolicy from "./pages/RedaktionellPolicy";
import Tjanster from "./pages/Tjanster";
import WebbyraLinkoping from "./pages/WebbyraLinkoping";
import DigitalMarknadsforingLinkoping from "./pages/DigitalMarknadsforingLinkoping";
import SeoByraLinkoping from "./pages/SeoByraLinkoping";
import AiAutomationLinkoping from "./pages/AiAutomationLinkoping";
import AiKonsultLinkoping from "./pages/AiKonsultLinkoping";
import GoogleAdsLinkoping from "./pages/GoogleAdsLinkoping";
import ApputvecklingLinkoping from "./pages/ApputvecklingLinkoping";
import FaqRapport from "./pages/admin/FaqRapport";
import Leads from "./pages/admin/Leads";
import TextGenerator from "./pages/admin/TextGenerator";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminContent from "./pages/admin/Content";
import AdminSeo from "./pages/admin/Seo";
import AdminEmail from "./pages/admin/Email";
const AdminProspektering = lazy(() => import("./pages/admin/Prospektering"));
import EnIndex from "./pages/en/Index";
import Content from "./pages/tjanster/Content";
import Ehandel from "./pages/tjanster/Ehandel";
import Fotografering from "./pages/tjanster/Fotografering";
import GoogleAds from "./pages/tjanster/GoogleAds";
import GrafiskProfil from "./pages/tjanster/GrafiskProfil";
import Hemsidor from "./pages/tjanster/Hemsidor";
import MetaAds from "./pages/tjanster/MetaAds";
import Mobilapp from "./pages/tjanster/Mobilapp";
import Seo from "./pages/tjanster/Seo";
import VerktygIndex from "./pages/verktyg/VerktygIndex";
import RoiKalkylator from "./pages/verktyg/RoiKalkylator";
import AppPrisraknare from "./pages/verktyg/AppPrisraknare";
import SeoKalkylator from "./pages/verktyg/SeoKalkylator";
import AiMognadsanalys from "./pages/verktyg/AiMognadsanalys";
import PersonalkostnadVsAi from "./pages/verktyg/PersonalkostnadVsAi";
import PromptGenerator from "./pages/verktyg/PromptGenerator";

const queryClient = new QueryClient();

type SEOConfig = {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
};

const seoMap: Record<string, SEOConfig> = {
  "/": {
    title: "Aurora Media – Interna AI-system för småföretag | Fast pris",
    description:
      "Jag bygger interna AI-system och automatiseringar åt svenska småföretag. Fast pris, ingen bindningstid och kod ni äger själva. Leverans på veckor.",
    canonical: "https://auroramedia.se/",
  },
  "/index": {
    title: "Aurora Media – Interna AI-system för småföretag | Fast pris",
    description:
      "Jag bygger interna AI-system och automatiseringar åt svenska småföretag. Fast pris, ingen bindningstid och kod ni äger själva. Leverans på veckor.",
    canonical: "https://auroramedia.se/",
  },
  "/ai-karta": {
    title: "AI-kartan | Hitta företagets bästa AI-områden | Aurora Media",
    description:
      "Ladda ner Aurora AI-karta och identifiera vilka arbetsuppgifter, system och processer i företaget som kan automatiseras, effektiviseras eller byggas om med AI.",
    canonical: "https://auroramedia.se/ai-karta",
  },
  "/ai-karta/start": {
    title: "Starta AI-kartan – gratis AI-analys på 3 minuter | Aurora Media",
    description:
      "Svara på några snabba frågor och få en kostnadsfri AI-baserad mini-analys av era största tidstjuvar och bästa möjligheter för automation och AI.",
    canonical: "https://auroramedia.se/ai-karta/start",
    noindex: true,
  },
  "/ai-karta/resultat": {
    title: "AI-kartans resultat | Aurora Media",
    description:
      "Se sammanställningen från AI-kartan och vilka processer som har störst potential för AI och automation.",
    canonical: "https://auroramedia.se/ai-karta/resultat",
    noindex: true,
  },
  "/ai-automation-foretag": {
    title: "AI automation för företag | Automatisera Excel, leads och administration",
    description:
      "Aurora Media hjälper företag att ersätta Excel, manuella rutiner och omoderna system med AI-lösningar, automationer, interna system och smarta digitala arbetsflöden.",
    canonical: "https://auroramedia.se/ai-automation-foretag",
  },
  "/ai-konsult-sverige": {
    title: "AI-konsult Sverige – från strategi till färdig produkt | Aurora Media AB",
    description:
      "Aurora Media är AI-konsulten som bygger produkten: SaaS, interna appar och AI-automationer med fast pris, snabb leverans och kod du äger.",
    canonical: "https://auroramedia.se/ai-konsult-sverige",
  },
  "/ai-byra-linkoping": {
    title: "AI-byrå i Linköping | Fast pris från 14 900 kr – Aurora Media",
    description:
      "AI-byrå i Linköping som bygger SaaS, AI-automationer och interna verktyg. Fast pris från 14 900 kr. Leverans på veckor, kod du äger.",
    canonical: "https://auroramedia.se/ai-byra-linkoping",
  },
  "/digital-marknadsforing-linkoping": {
    title: "Digital marknadsföring i Linköping – SEO, Ads & AI | Aurora Media",
    description: "Digital marknadsföring i Linköping: SEO, Google Ads, Meta Ads, content och AI-driven marknadsföring. Fast pris, lokal kontakt, mätbara resultat.",
    canonical: "https://auroramedia.se/digital-marknadsforing-linkoping",
  },
  "/seo-byra-linkoping": {
    title: "SEO-byrå i Linköping – teknisk SEO, content & lokal synlighet",
    description: "SEO-byrå i Linköping som jobbar med teknisk SEO, content, lokal synlighet och länkbygge. Fast pris, mätbara resultat, ägarskap kvar hos er.",
    canonical: "https://auroramedia.se/seo-byra-linkoping",
  },
  "/ai-automation-linkoping": {
    title: "AI-automation för företag i Linköping – från 14 900 kr | Aurora Media",
    description: "AI-automation i Linköping: mejl, dokument, offerthantering, Fortnox- och Visma-integrationer. Bygg bort manuellt Excel-arbete med lokal partner.",
    canonical: "https://auroramedia.se/ai-automation-linkoping",
  },
  "/ai-konsult-linkoping": {
    title: "AI-konsult i Linköping – strategi, implementation & utbildning",
    description: "AI-konsult i Linköping. Vi hjälper er välja rätt AI-verktyg, bygga interna assistenter och utbilda teamet. Fast pris, GDPR, EU-datalagring.",
    canonical: "https://auroramedia.se/ai-konsult-linkoping",
  },
  "/google-ads-linkoping": {
    title: "Google Ads-byrå i Linköping – kampanjer som konverterar",
    description: "Google Ads-byrå i Linköping. Sök, Performance Max, YouTube och Shopping med tydlig konverteringsspårning. Fast månadsarvode från 6 900 kr.",
    canonical: "https://auroramedia.se/google-ads-linkoping",
  },
  "/apputveckling-linkoping": {
    title: "Apputveckling i Linköping – iOS, Android & webbappar | Aurora Media",
    description: "Apputveckling i Linköping. iOS, Android och webbappar byggda med React Native/Expo. Från MVP till skalbar produkt. Fast pris från 89 000 kr.",
    canonical: "https://auroramedia.se/apputveckling-linkoping",
  },
  "/en": {
    title: "Aurora Media AB – We build AI-powered SaaS",
    description:
      "Aurora Media builds SaaS, AI solutions and custom software for ambitious businesses.",
    canonical: "https://auroramedia.se/en",
  },
  "/arbete": {
    title: "Arbete & projekt | Aurora Media AB",
    description:
      "Se arbeten, projekt och digitala lösningar som Aurora Media har byggt för företag i olika branscher.",
    canonical: "https://auroramedia.se/arbete",
  },
  "/priser": {
    title: "Priser | Aurora Media AB",
    description:
      "Utforska priser och upplägg för SaaS, AI-lösningar, webb och digital utveckling från Aurora Media.",
    canonical: "https://auroramedia.se/priser",
  },
  "/om": {
    title: "Om Aurora Media AB",
    description:
      "Lär känna Aurora Media och hur vi hjälper företag att bygga modern mjukvara, AI-flöden och digital tillväxt.",
    canonical: "https://auroramedia.se/om",
  },
  "/kontakt": {
    title: "Kontakt | Aurora Media AB",
    description:
      "Kontakta Aurora Media för att diskutera SaaS, AI, webb eller skräddarsydd digital utveckling.",
    canonical: "https://auroramedia.se/kontakt",
  },
  "/tjanster": {
    title: "Tjänster | Aurora Media AB",
    description:
      "Upptäck våra tjänster inom SaaS, AI, webbutveckling, annonsering, innehåll och digital tillväxt.",
    canonical: "https://auroramedia.se/tjanster",
  },
  "/tjanster/hemsidor": {
    title: "Hemsidor | Aurora Media AB",
    description:
      "Vi bygger moderna hemsidor som laddar snabbt, konverterar bättre och stärker ditt varumärke online.",
    canonical: "https://auroramedia.se/tjanster/hemsidor",
  },
  "/tjanster/ehandel": {
    title: "E-handel | Aurora Media AB",
    description:
      "Skalbar e-handel med fokus på användarupplevelse, konvertering och smarta integrationer.",
    canonical: "https://auroramedia.se/tjanster/ehandel",
  },
  "/tjanster/mobilapp": {
    title: "React Native apputveckling | Appar för iOS och Android | Aurora Media",
    description:
      "Aurora Media är experter på React Native och bygger moderna appar för iOS och Android: kundappar, interna appar, MVP:er, SaaS-appar och AI-drivna mobila lösningar.",
    canonical: "https://auroramedia.se/tjanster/mobilapp",
  },
  "/tjanster/seo": {
    title: "SEO | Aurora Media AB",
    description:
      "SEO som förbättrar synlighet, ranking och kvalitativ organisk trafik för ditt företag.",
    canonical: "https://auroramedia.se/tjanster/seo",
  },
  "/tjanster/google-ads": {
    title: "Google Ads | Aurora Media AB",
    description:
      "Datadrivna Google Ads-kampanjer som skapar relevant trafik, leads och bättre avkastning.",
    canonical: "https://auroramedia.se/tjanster/google-ads",
  },
  "/tjanster/meta-ads": {
    title: "Meta Ads | Aurora Media AB",
    description:
      "Effektiva annonser på Facebook och Instagram med fokus på rätt målgrupp och fler konverteringar.",
    canonical: "https://auroramedia.se/tjanster/meta-ads",
  },
  "/tjanster/content": {
    title: "Content | Aurora Media AB",
    description:
      "Strategiskt innehåll som bygger förtroende, stärker varumärket och hjälper kunder att välja dig.",
    canonical: "https://auroramedia.se/tjanster/content",
  },
  "/tjanster/grafisk-profil": {
    title: "Grafisk profil | Aurora Media AB",
    description:
      "Grafisk profil och visuell identitet som gör ditt varumärke tydligt, enhetligt och minnesvärt.",
    canonical: "https://auroramedia.se/tjanster/grafisk-profil",
  },
  "/tjanster/fotografering": {
    title: "Fotografering | Aurora Media AB",
    description:
      "Professionell fotografering för webb, kampanjer och varumärken som vill sticka ut visuellt.",
    canonical: "https://auroramedia.se/tjanster/fotografering",
  },
  "/webbyra-linkoping": {
    title: "Webbyrå i Linköping | Aurora Media AB",
    description:
      "Aurora Media är en webbyrå i Linköping som bygger webb, SaaS och AI-lösningar för moderna företag.",
    canonical: "https://auroramedia.se/webbyra-linkoping",
  },
  "/blogg": {
    title: "Blogg | Aurora Media AB",
    description:
      "Artiklar, guider och insikter om SaaS, AI, digital marknadsföring och modern webbutveckling.",
    canonical: "https://auroramedia.se/blogg",
  },
  "/metodik": {
    title: "Metodik | Aurora Media AB",
    description:
      "Så arbetar Aurora Media med strategi, design, utveckling och lansering av digitala produkter.",
    canonical: "https://auroramedia.se/metodik",
  },
  "/redaktionell-policy": {
    title: "Redaktionell policy | Aurora Media AB",
    description:
      "Läs vår redaktionella policy och hur vi arbetar med kvalitet, transparens och innehållsansvar.",
    canonical: "https://auroramedia.se/redaktionell-policy",
  },
  "/integritetspolicy": {
    title: "Integritetspolicy | Aurora Media AB",
    description:
      "Läs hur Aurora Media behandlar personuppgifter och arbetar för att skydda din integritet.",
    canonical: "https://auroramedia.se/integritetspolicy",
  },
  "/verktyg": {
    title: "Gratis verktyg – kalkylatorer, ROI och AI-mognad | Aurora Media",
    description:
      "Aurora Medias gratis verktyg: AI ROI-kalkylator, app-prisräknare, SEO-kalkylator, AI-mognadsanalys, personalkostnadsjämförelse och prompt-generator.",
    canonical: "https://auroramedia.se/verktyg",
  },
  "/verktyg/ai-roi-kalkylator": {
    title: "AI ROI-kalkylator – räkna ut besparing & återbetalning | Aurora Media",
    description:
      "Räkna ut hur mycket AI och automation kan spara ert företag per år, återbetalningstid och 3-års nettovärde. Gratis kalkylator utan inloggning.",
    canonical: "https://auroramedia.se/verktyg/ai-roi-kalkylator",
  },
  "/verktyg/app-prisraknare": {
    title: "App-prisräknare – vad kostar en app eller SaaS? | Aurora Media",
    description:
      "Uppskatta priset för app, SaaS eller intern plattform. Välj funktioner, integrationer och tidsram och få ett transparent prisintervall.",
    canonical: "https://auroramedia.se/verktyg/app-prisraknare",
  },
  "/verktyg/seo-kalkylator": {
    title: "SEO-kalkylator – räkna ut potentiell omsättning från SEO | Aurora Media",
    description:
      "Se hur mycket extra omsättning och bruttovinst SEO kan ge er per månad och år, baserat på trafik, konvertering och ordervärde.",
    canonical: "https://auroramedia.se/verktyg/seo-kalkylator",
  },
  "/verktyg/ai-mognadsanalys": {
    title: "AI-mognadsanalys – gratis test på 2 minuter | Aurora Media",
    description:
      "Testa er AI-mognad på 2 minuter. Få poäng, nivå 1–5 och tre konkreta nästa steg – helt gratis och utan inloggning.",
    canonical: "https://auroramedia.se/verktyg/ai-mognadsanalys",
  },
  "/verktyg/personalkostnad-vs-ai": {
    title: "Personalkostnad vs AI – jämför årskostnad | Aurora Media",
    description:
      "Jämför årlig personalkostnad med AI/automation baserat på lön, sociala avgifter och driftkostnad. Se potentialen utan att ersätta människor.",
    canonical: "https://auroramedia.se/verktyg/personalkostnad-vs-ai",
  },
  "/verktyg/prompt-generator": {
    title: "Prompt-generator – bygg strukturerade AI-prompts på svenska | Aurora Media",
    description:
      "Generera strukturerade svenska AI-prompts för ChatGPT, Claude och Gemini. Fyll i mål, roll, målgrupp och ton – kopiera resultatet med ett klick.",
    canonical: "https://auroramedia.se/verktyg/prompt-generator",
  },
};

function getDynamicSeo(pathname: string): SEOConfig {
  if (pathname.startsWith("/arbete/")) {
    return {
      title: "Projekt | Aurora Media AB",
      description:
        "Läs mer om vårt arbete, processen bakom lösningen och resultatet i det här caset.",
      canonical: `https://auroramedia.se${pathname}`,
    };
  }

  if (pathname.startsWith("/blogg/")) {
    return {
      title: "Bloggartikel | Aurora Media AB",
      description:
        "Läs en artikel från Aurora Media om AI, SaaS, marknadsföring och digital tillväxt.",
      canonical: `https://auroramedia.se${pathname}`,
    };
  }

  if (pathname.startsWith("/saas-utveckling-") || pathname.startsWith("/ai-byra-")) {
    return {
      title: "Lokal digital partner | Aurora Media AB",
      description:
        "Aurora Media hjälper företag lokalt med webb, AI, SaaS och digital tillväxt.",
      canonical: `https://auroramedia.se${pathname}`,
    };
  }

  if (pathname.startsWith("/admin")) {
    return {
      title: "Aurora Media Admin",
      description: "Internt administrationsgränssnitt för Aurora Media.",
      canonical: `https://auroramedia.se${pathname}`,
      noindex: true,
    };
  }

  return {
    title: "Aurora Media AB",
    description:
      "Aurora Media bygger moderna digitala lösningar inom SaaS, AI och webbutveckling.",
    canonical: `https://auroramedia.se${pathname}`,
  };
}

function RouteSEO() {
  const { pathname } = useLocation();
  const is404 =
    pathname !== "/" &&
    !Object.keys(seoMap).includes(pathname) &&
    !pathname.startsWith("/arbete/") &&
    !pathname.startsWith("/blogg/") &&
    !pathname.startsWith("/saas-utveckling-") &&
    !pathname.startsWith("/ai-byra-") &&
    !pathname.startsWith("/admin") &&
    !["/artiklar", "/blog", "/webbbyra-linkoping"].includes(pathname) &&
    !pathname.startsWith("/artiklar/");

  const seo = is404
    ? {
        title: "Sidan kunde inte hittas | Aurora Media AB",
        description: "Sidan du försöker nå finns inte.",
        canonical: `https://auroramedia.se${pathname}`,
        noindex: true,
      }
    : seoMap[pathname] ?? getDynamicSeo(pathname);

  return (
    <SEO
      title={seo.title}
      description={seo.description}
      canonical={seo.canonical}
      ogImage={seo.ogImage}
      noindex={seo.noindex}
    />
  );
}

function PreviewOnlyV5() {
  const hostname = window.location.hostname;
  const isPreview =
    import.meta.env.DEV || hostname.includes("id-preview--") || hostname.includes("localhost");

  return isPreview ? <IndexV5 /> : <Navigate to="/" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteSEO />
        <ContactModalProvider>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/index" element={<Navigate to="/" replace />} />
              <Route path="/v5" element={<PreviewOnlyV5 />} />
              <Route path="/ai-karta" element={<AiKarta />} />
              <Route path="/ai-karta/start" element={<AiKartaStart />} />
              <Route path="/ai-karta/resultat" element={<AiKartaResultat />} />
              <Route path="/ai-automation-foretag" element={<AiAutomationForetag />} />
              <Route path="/ai-konsult-sverige" element={<AiKonsultSverige />} />
              <Route path="/en" element={<EnIndex />} />
              <Route path="/arbete" element={<Arbete />} />
              <Route path="/arbete/:slug" element={<CasePage />} />
              <Route path="/priser" element={<Priser />} />
              <Route path="/om" element={<Om />} />
              <Route path="/produkter" element={<Produkter />} />
              <Route path="/process" element={<Process />} />
              <Route path="/kontakt" element={<Kontakt />} />
              <Route path="/tjanster" element={<Tjanster />} />
              <Route path="/tjanster/hemsidor" element={<Hemsidor />} />
              <Route path="/tjanster/ehandel" element={<Ehandel />} />
              <Route path="/tjanster/mobilapp" element={<Mobilapp />} />
              <Route path="/tjanster/seo" element={<Seo />} />
              <Route path="/tjanster/google-ads" element={<GoogleAds />} />
              <Route path="/tjanster/meta-ads" element={<MetaAds />} />
              <Route path="/tjanster/content" element={<Content />} />
              <Route path="/tjanster/grafisk-profil" element={<GrafiskProfil />} />
              <Route path="/tjanster/fotografering" element={<Fotografering />} />
              <Route path="/webbyra-linkoping" element={<WebbyraLinkoping />} />
              <Route path="/webbbyra-linkoping" element={<Navigate to="/webbyra-linkoping" replace />} />
              <Route path="/blogg" element={<Blog />} />
              <Route path="/blog" element={<Navigate to="/blogg" replace />} />
              <Route path="/artiklar" element={<Navigate to="/blogg" replace />} />
              <Route path="/blogg/:slug" element={<BlogPost />} />
              <Route path="/artiklar/:slug" element={<BlogPost />} />
              <Route path="/metodik" element={<Metodik />} />
              <Route path="/redaktionell-policy" element={<RedaktionellPolicy />} />
              <Route path="/integritetspolicy" element={<Integritetspolicy />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/leads" element={<Leads />} />
              <Route path="/admin/content" element={<AdminContent />} />
              <Route path="/admin/seo" element={<AdminSeo />} />
              <Route path="/admin/email" element={<AdminEmail />} />
              <Route path="/admin/text-generator" element={<TextGenerator />} />
              <Route path="/admin/faq-rapport" element={<FaqRapport />} />
              <Route path="/admin/prospektering" element={<AdminProspektering />} />
              <Route path="/ai-byra-linkoping" element={<AiByraLinkoping />} />
              <Route path="/digital-marknadsforing-linkoping" element={<DigitalMarknadsforingLinkoping />} />
              <Route path="/seo-byra-linkoping" element={<SeoByraLinkoping />} />
              <Route path="/ai-automation-linkoping" element={<AiAutomationLinkoping />} />
              <Route path="/ai-konsult-linkoping" element={<AiKonsultLinkoping />} />
              <Route path="/google-ads-linkoping" element={<GoogleAdsLinkoping />} />
              <Route path="/apputveckling-linkoping" element={<ApputvecklingLinkoping />} />
              <Route path="/verktyg" element={<VerktygIndex />} />
              <Route path="/verktyg/ai-roi-kalkylator" element={<RoiKalkylator />} />
              <Route path="/verktyg/app-prisraknare" element={<AppPrisraknare />} />
              <Route path="/verktyg/seo-kalkylator" element={<SeoKalkylator />} />
              <Route path="/verktyg/ai-mognadsanalys" element={<AiMognadsanalys />} />
              <Route path="/verktyg/personalkostnad-vs-ai" element={<PersonalkostnadVsAi />} />
              <Route path="/verktyg/prompt-generator" element={<PromptGenerator />} />
              <Route path="/saas-utveckling-:city" element={<CityPage />} />
              <Route path="/ai-byra-:city" element={<CityPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </ContactModalProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
