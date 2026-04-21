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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ContactModalProvider>
      </Toaster>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
