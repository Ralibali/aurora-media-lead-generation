import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContactModalProvider } from "@/components/ContactModal";
import Index from "./pages/Index";
import Arbete from "./pages/Arbete";
import Priser from "./pages/Priser";
import Om from "./pages/Om";
import Kontakt from "./pages/Kontakt";
import WebbyraLinkoping from "./pages/WebbyraLinkoping";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CityPage from "./pages/CityPage";
import Metodik from "./pages/Metodik";
import RedaktionellPolicy from "./pages/RedaktionellPolicy";
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
            <Route path="/priser" element={<Priser />} />
            <Route path="/om" element={<Om />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/webbbyra-linkoping" element={<WebbyraLinkoping />} />
            <Route path="/artiklar" element={<Blog />} />
            <Route path="/artiklar/:slug" element={<BlogPost />} />
            <Route path="/saas-utveckling-:slug" element={<CityPage />} />
            <Route path="/ai-byra-:slug" element={<CityPage />} />
            <Route path="/metodik" element={<Metodik />} />
            <Route path="/redaktionell-policy" element={<RedaktionellPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ContactModalProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
