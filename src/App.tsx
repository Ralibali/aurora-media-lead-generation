import { ContactModalProvider } from "@/components/ContactModal";
import { SEO } from "@/components/SEO";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/lumina.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import Arbete from "./pages/Arbete";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CasePage from "./pages/CasePage";
import CityPage from "./pages/CityPage";
import Integritetspolicy from "./pages/Integritetspolicy";
import Index from "./pages/Index";
import Kontakt from "./pages/Kontakt";
import Metodik from "./pages/Metodik";
import NotFound from "./pages/NotFound";
import Om from "./pages/Om";
import Priser from "./pages/Priser";
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
    title: "Aurora Media AB – Bygger SaaS med AI",
    description:
      "Aurora Media bygger SaaS, AI-lösningar och skräddarsydd mjukvara för företag som vill växa snabbare.",
    canonical: "https://auroramedia.se/",
  },
  "/en": {
    title: "Aurora Media AB – We build AI-powered SaaS",
    description:
      "Aurora Media builds SaaS, AI solutions and custom software for ambitious businesses.",
    canonical: "https://auroramedia.se/en",
  },
  "/arbete": {
    title: "Case & projekt | Aurora Media AB",
    description:
      "Se case, projekt och digitala lösningar som Aurora Media har byggt för företag i olika branscher.",
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
    title: "Mobilappar | Aurora Media AB",
    description:
      "Vi utvecklar mobilappar med tydlig affärsnytta, snabb prestanda och modern användarupplevelse.",
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
};

function getDynamicSeo(pathname: string): SEOConfig {
  if (pathname.startsWith("/arbete/")) {
    return {
      title: "Case | Aurora Media AB",
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteSEO />
        <ContactModalProvider>
          <div className="aurora-theme lumina-site min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/en" element={<EnIndex />} />
              <Route path="/arbete" element={<Arbete />} />
              <Route path="/arbete/:slug" element={<CasePage />} />
              <Route path="/priser" element={<Priser />} />
              <Route path="/om" element={<Om />} />
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
              <Route path="/saas-utveckling-:slug" element={<CityPage />} />
              <Route path="/ai-byra-:slug" element={<CityPage />} />
              <Route path="/metodik" element={<Metodik />} />
              <Route path="/redaktionell-policy" element={<RedaktionellPolicy />} />
              <Route path="/integritetspolicy" element={<Integritetspolicy />} />
              <Route path="/admin/text-generator" element={<TextGenerator />} />
              <Route path="/admin/texter" element={<TextGenerator />} />
              <Route path="/admin/faq-rapport" element={<FaqRapport />} />
              <Route path="/admin/leads" element={<Leads />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </ContactModalProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
