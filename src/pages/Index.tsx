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

const Index = () => {
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
