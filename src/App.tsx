import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContactModalProvider } from "@/components/ContactModal";
import Index from "./pages/Index";
import Arbete from "./pages/Arbete";
import CasePage from "./pages/CasePage";
import Priser from "./pages/Priser";
import Om from "./pages/Om";
import Kontakt from "./pages/Kontakt";
import Tjanster from "./pages/Tjanster";
import Hemsidor from "./pages/tjanster/Hemsidor";
import Ehandel from "./pages/tjanster/Ehandel";
import Mobilapp from "./pages/tjanster/Mobilapp";
import Seo from "./pages/tjanster/Seo";
import GoogleAds from "./pages/tjanster/GoogleAds";
import MetaAds from "./pages/tjanster/MetaAds";
import Content from "./pages/tjanster/Content";
import GrafiskProfil from "./pages/tjanster/GrafiskProfil";
import Fotografering from "./pages/tjanster/Fotografering";
import WebbyraLinkoping from "./pages/WebbyraLinkoping";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CityPage from "./pages/CityPage";
import Metodik from "./pages/Metodik";
import RedaktionellPolicy from "./pages/RedaktionellPolicy";
import TextGenerator from "./pages/admin/TextGenerator";
import FaqRapport from "./pages/admin/FaqRapport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ContactModalProvider>
          <Routes>
            <Route path="/" element={<Index />} />
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
            <Route path="/webbbyra-linkoping" element={<WebbyraLinkoping />} />
            <Route path="/artiklar" element={<Blog />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/artiklar/:slug" element={<BlogPost />} />
            <Route path="/saas-utveckling-:slug" element={<CityPage />} />
            <Route path="/ai-byra-:slug" element={<CityPage />} />
            <Route path="/metodik" element={<Metodik />} />
            <Route path="/redaktionell-policy" element={<RedaktionellPolicy />} />
            <Route path="/admin/texter" element={<TextGenerator />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ContactModalProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
