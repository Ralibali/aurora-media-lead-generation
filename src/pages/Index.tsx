import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBarSection from "@/components/TrustBarSection";
import PaketSection from "@/components/PaketSection";
import ToolsStackSection from "@/components/ToolsStackSection";
import PortfolioSection from "@/components/PortfolioSection";
import ProcessSection from "@/components/ProcessSection";
import VarforSnabbtSection from "@/components/VarforSnabbtSection";
import TargetAudienceSection from "@/components/TargetAudienceSection";
import FAQSection from "@/components/FAQSection";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import { setSEOMeta, setJsonLd, organizationSchema, websiteSchema, serviceSchema } from "@/lib/seoHelpers";

const Index = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Aurora Media AB – Bygger SaaS med AI i Linköping | Från 14 900 kr",
      description:
        "Bygger SaaS-produkter och interna verktyg med AI-kodning. Prototyp från 14 900 kr. MVP från 34 900 kr. Fast pris, veckor istället för månader. Linköping, Sverige.",
      canonical: "/",
    });
    setJsonLd("organization-jsonld", organizationSchema);
    setJsonLd("website-jsonld", websiteSchema);
    setJsonLd("service-jsonld", serviceSchema);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustBarSection />
        <PaketSection />
        <ToolsStackSection />
        <PortfolioSection />
        <ProcessSection />
        <VarforSnabbtSection />
        <TargetAudienceSection />
        <FAQSection />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
