import { ContactModalProvider } from "@/components/ContactModal";
import { SEO } from "@/components/SEO";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/lumina.css";
import "@/styles/aurora-system.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import AiAutomationForetag from "./pages/AiAutomationForetag";
import AiByraLinkoping from "./pages/AiByraLinkoping";
import AiKarta from "./pages/AiKarta";
import AiKartaStart from "./pages/AiKartaStart";
import AiKartaResultat from "./pages/AiKartaResultat";
import AiKonsultSverige from "./pages/AiKonsultSverige";
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
import Process from "./pages/Process";
import Produkter from "./pages/Produkter";
import RedaktionellPolicy from "./pages/RedaktionellPolicy";
import Tjanster from "./pages/Tjanster";
import WebbyraLinkoping from "./pages/WebbyraLinkoping";
import FaqRapport from "./pages/admin/FaqRapport";
import Leads from "./pages/admin/Leads";
import TextGenerator from "./pages/admin/TextGenerator";
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
    title: "Aurora Media AB | AI-driven mjukvarupartner för svenska företag",
    description:
      "Aurora Media bygger AI-lösningar, interna system, appar och SaaS för svenska företag. Tydligt scope, snabb leverans och kod ni äger.",
    canonical: "https://auroramedia.se/",
  },
  "/index": {
    title: "Aurora Media AB | AI-driven mjukvarupartner för svenska företag",
    description:
      "Aurora Media bygger AI-lösningar, interna system, appar och SaaS för svenska företag. Tydligt scope, snabb leverans och kod ni äger.",
    canonical: "https://auroramedia.se/",
  },
  "/ai-karta": {
    title: "AI-kartläggning för företag – kostnadsfri AI-analys | Aurora Media",
    description:
      "Kartlägg företagets bästa områden för AI, automation och interna system. Få prioriterad topp 3, tidsuppskattning och PDF på cirka 3–5 minuter.",
    canonical: "https://auroramedia.se/ai-karta",
  },
  "/ai-karta/start": {
    title: "Starta AI-kartan – kostnadsfri analys på 3–5 minuter | Aurora Media",
    description:
      "Beskriv era största tidstjuvar och få en första bedömning av vilka processer som passar för AI, automation eller ett internt system.",
    canonical: "https://auroramedia.se/ai-karta/start",
    noindex: true,
  },
  "/ai-karta/resultat": {
    title: "Er AI-karta – resultat | Aurora Media",
    description:
      "Se företagets prioriterade AI-områden, uppskattad tidsbesparing och rekommenderade nästa steg.",
    canonical: "https://auroramedia.se/ai-karta/resultat",
    noindex: true,
  },
  "/ai-automation-foretag": {
    title: "AI-automation för företag | Interna system och smartare flöden",
    description:
      "Aurora Media hjälper företag att ersätta manuella rutiner, kalkylblad och systemglapp med AI, automation, integrationer och interna verktyg.",
    canonical: "https://auroramedia.se/ai-automation-foretag",
  },
  "/ai-konsult-sverige": {
    title: "AI-konsult Sverige – från arbetsflöde till färdig lösning | Aurora Media",
    description:
      "Aurora Media bygger AI-automation, interna system, appar och SaaS för svenska företag med tydligt scope och kod kunden äger.",
    canonical: "https://auroramedia.se/ai-konsult-sverige",
  },
  "/ai-byra-linkoping": {
    title: "AI-konsult och AI-byrå i Linköping | Aurora Media",
    description:
      "Aurora Media hjälper företag i Linköping att automatisera administration, ersätta Excel och bygga AI-drivna interna system. Lokal kontakt och tydligt scope.",
    canonical: "https://auroramedia.se/ai-byra-linkoping",
  },
  "/en": {
    title: "Aurora Media AB – AI-powered software partner",
    description:
      "Aurora Media builds SaaS, internal systems, apps and AI automations for ambitious businesses.",
    canonical: "https://auroramedia.se/en",
  },
  "/arbete": {
    title: "Arbete och projekt | Aurora Media AB",
    description:
      "Se produkter, verksamhetssystem och digitala lösningar som Aurora Media har byggt och driver.",
    canonical: "https://auroramedia.se/arbete",
  },
  "/priser": {
    title: "Priser för prototyp, MVP och AI-lösningar | Aurora Media",
    description:
      "Prototyp från 14 900 kr, MVP från 34 900 kr och skalbar lösning från 89 000 kr. Tydligt scope och kod ni äger.",
    canonical: "https://auroramedia.se/priser",
  },
  "/om": {
    title: "Om Aurora Media AB | AI och mjukvara från Linköping",
    description:
      "Lär känna Aurora Media AB och hur vi bygger AI-lösningar, interna system, appar och SaaS för svenska företag.",
    canonical: "https://auroramedia.se/om",
  },
  "/kontakt": {
    title: "Kontakt och kostnadsfri rådgivning | Aurora Media AB",
    description:
      "Kontakta Aurora Media för att diskutera AI-automation, interna system, SaaS, appar eller integrationer.",
    canonical: "https://auroramedia.se/kontakt",
  },
  "/tjanster": {
    title: "Tjänster – AI, interna system, SaaS och appar | Aurora Media",
    description:
      "Aurora Media bygger AI-lösningar, interna verksamhetssystem, SaaS, appar, integrationer och konverterande webb.",
    canonical: "https://auroramedia.se/tjanster",
  },
  "/produkter": {
    title: "Produkter byggda av Aurora Media | SaaS, appar och AI",
    description:
      "Utforska digitala produkter som Aurora Media bygger och driver, från SaaS och interna system till appar med AI-stöd.",
    canonical: "https://auroramedia.se/produkter",
  },
  "/process": {
    title: "Så bygger Aurora Media AI och mjukvara | Process",
    description:
      "Från kartläggning och första test till driftsatt AI-lösning, internt system, app eller SaaS med tydligt scope.",
    canonical: "https://auroramedia.se/process",
  },
  "/tjanster/hemsidor": {
    title: "Hemsidor som konverterar | Aurora Media AB",
    description:
      "Moderna och snabba hemsidor med tydligt budskap, stark teknisk grund och fokus på fler relevanta förfrågningar.",
    canonical: "https://auroramedia.se/tjanster/hemsidor",
  },
  "/tjanster/ehandel": {
    title: "E-handel med smarta integrationer | Aurora Media AB",
    description:
      "Skalbar e-handel med fokus på användarupplevelse, betalflöden, integrationer och konvertering.",
    canonical: "https://auroramedia.se/tjanster/ehandel",
  },
  "/tjanster/mobilapp": {
    title: "React Native apputveckling | Appar för iOS och Android | Aurora Media",
    description:
      "Aurora Media bygger kundappar, interna appar, MVP:er och AI-drivna mobila lösningar med React Native.",
    canonical: "https://auroramedia.se/tjanster/mobilapp",
  },
  "/tjanster/seo": {
    title: "SEO som stärker synlighet och affär | Aurora Media AB",
    description:
      "Teknisk SEO, innehåll, internlänkning och landningssidor som hjälper rätt kunder att hitta och välja företaget.",
    canonical: "https://auroramedia.se/tjanster/seo",
  },
  "/tjanster/google-ads": {
    title: "Google Ads med fokus på relevanta leads | Aurora Media AB",
    description:
      "Datadrivna Google Ads-kampanjer med tydlig spårning, relevanta sökord och fokus på lönsam konvertering.",
    canonical: "https://auroramedia.se/tjanster/google-ads",
  },
  "/tjanster/meta-ads": {
    title: "Meta Ads för Facebook och Instagram | Aurora Media AB",
    description:
      "Meta Ads med genomtänkt målgrupp, budskap, kreativt material och uppföljning mot faktiska affärsmål.",
    canonical: "https://auroramedia.se/tjanster/meta-ads",
  },
  "/tjanster/content": {
    title: "Strategiskt innehåll för webb och sök | Aurora Media AB",
    description:
      "Innehåll som bygger förtroende, svarar på kundernas frågor och stärker webbplatsens organiska synlighet.",
    canonical: "https://auroramedia.se/tjanster/content",
  },
  "/tjanster/grafisk-profil": {
    title: "Grafisk profil och visuell identitet | Aurora Media AB",
    description:
      "En sammanhängande visuell identitet som gör företaget tydligare, mer trovärdigt och lättare att känna igen.",
    canonical: "https://auroramedia.se/tjanster/grafisk-profil",
  },
  "/tjanster/fotografering": {
    title: "Fotografering för webb och varumärke | Aurora Media AB",
    description:
      "Professionella bilder för webb, kampanjer och företag som behöver ett mer trovärdigt och sammanhängande uttryck.",
    canonical: "https://auroramedia.se/tjanster/fotografering",
  },
  "/webbyra-linkoping": {
    title: "Webbyrå i Linköping | Webb, AI och system – Aurora Media",
    description:
      "Aurora Media är en webbyrå och mjukvarupartner i Linköping som bygger webb, AI-lösningar, appar och interna system.",
    canonical: "https://auroramedia.se/webbyra-linkoping",
  },
  "/blogg": {
    title: "Guider om AI, automation och mjukvara | Aurora Media",
    description:
      "Praktiska guider om AI för företag, interna system, SaaS, appar, automation och modern webbutveckling.",
    canonical: "https://auroramedia.se/blogg",
  },
  "/metodik": {
    title: "Metodik för AI och mjukvaruutveckling | Aurora Media",
    description:
      "Så arbetar Aurora Media med kartläggning, design, utveckling, testning och lansering av digitala lösningar.",
    canonical: "https://auroramedia.se/metodik",
  },
  "/redaktionell-policy": {
    title: "Redaktionell policy | Aurora Media AB",
    description:
      "Så arbetar Aurora Media med kvalitet, transparens, förstahandserfarenhet och uppdatering av publicerat innehåll.",
    canonical: "https://auroramedia.se/redaktionell-policy",
  },
  "/integritetspolicy": {
    title: "Integritetspolicy | Aurora Media AB",
    description:
      "Så behandlar Aurora Media personuppgifter och skyddar information som lämnas via webbplatsens formulär.",
    canonical: "https://auroramedia.se/integritetspolicy",
  },
};

function getDynamicSeo(pathname: string): SEOConfig {
  if (pathname.startsWith("/arbete/")) {
    return {
      title: "Projekt | Aurora Media AB",
      description:
        "Läs om problemet, processen och lösningen bakom ett projekt byggt av Aurora Media.",
      canonical: `https://auroramedia.se${pathname}`,
    };
  }

  if (pathname.startsWith("/blogg/")) {
    return {
      title: "Guide | Aurora Media AB",
      description:
        "Praktisk vägledning från Aurora Media om AI, automation, SaaS och modern mjukvaruutveckling.",
      canonical: `https://auroramedia.se${pathname}`,
    };
  }

  if (pathname.startsWith("/saas-utveckling-") || pathname.startsWith("/ai-byra-")) {
    const isLinkoping = pathname.endsWith("-linkoping");
    return {
      title: "Lokal digital partner | Aurora Media AB",
      description:
        "Aurora Media hjälper företag med AI, interna system, SaaS, appar och digital utveckling.",
      canonical: `https://auroramedia.se${pathname}`,
      noindex: !isLinkoping,
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
      "Aurora Media bygger AI-lösningar, interna system, appar och SaaS för svenska företag.",
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
          <div className="lumina-site min-h-screen" style={{ backgroundColor: "#100F0D", color: "#EDE9DC" }}>
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
              <Route path="/admin/leads" element={<Leads />} />
              <Route path="/admin/text-generator" element={<TextGenerator />} />
              <Route path="/admin/faq-rapport" element={<FaqRapport />} />
              <Route path="/ai-byra-linkoping" element={<AiByraLinkoping />} />
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
