import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBarSection from "@/components/TrustBarSection";
import PortfolioSection from "@/components/PortfolioSection";
import PaketSection from "@/components/PaketSection";
import VarforSnabbtSection from "@/components/VarforSnabbtSection";
import ProcessSection from "@/components/ProcessSection";
import JagGorAvenSection from "@/components/JagGorAvenSection";
import TargetAudienceSection from "@/components/TargetAudienceSection";
import SiffrorSection from "@/components/SiffrorSection";
import FAQSection from "@/components/FAQSection";
import FinalCTASection from "@/components/FinalCTASection";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import Footer from "@/components/Footer";
import { setSEOMeta, setJsonLd, setHreflang, organizationSchema, websiteSchema, serviceSchema } from "@/lib/seoHelpers";

const Index = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Bygger SaaS med AI – Veckor, inte månader | Aurora Media Linköping",
      description:
        "AI-driven SaaS-utveckling i Linköping. Prototyp från 14 900 kr, MVP från 34 900 kr. Fast pris, leverans på 2–4 veckor. 7 produkter levererade. Boka kostnadsfri rådgivning.",
      canonical: "/",
      ogImage: "/og-image-sv.jpg",
      ogType: "website",
      ogLocale: "sv_SE",
      keywords:
        "SaaS-utveckling, AI-kodning, MVP-utveckling, webbyrå Linköping, Lovable, Bolt, Claude, Cursor, fast pris SaaS, intern verktygsutveckling",
    });
    setHreflang("/", "/en");
    setJsonLd("organization-jsonld", organizationSchema);
    setJsonLd("website-jsonld", websiteSchema);
    setJsonLd("service-jsonld", serviceSchema);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main" className="pt-16">
        <HeroSection />
        <TrustBarSection />
        <PortfolioSection />
        <PaketSection />
        <VarforSnabbtSection />
        <ProcessSection />
        <JagGorAvenSection />
        <TargetAudienceSection />
        <SiffrorSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default Index;
