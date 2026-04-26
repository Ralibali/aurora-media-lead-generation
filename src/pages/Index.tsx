import { useEffect } from "react";
import AuroraNavbar from "@/components/landing/AuroraNavbar";
import AuroraHero from "@/components/landing/AuroraHero";
import AuroraServices from "@/components/landing/AuroraServices";
import AuroraProducts from "@/components/landing/AuroraProducts";
import AuroraIndustries from "@/components/landing/AuroraIndustries";
import AuroraIntegrations from "@/components/landing/AuroraIntegrations";
import AuroraProcess from "@/components/landing/AuroraProcess";
import AuroraPricing from "@/components/landing/AuroraPricing";
import AuroraFinalCTA from "@/components/landing/AuroraFinalCTA";
import AuroraFooter from "@/components/landing/AuroraFooter";
import AuroraStickyMobileCTA from "@/components/landing/AuroraStickyMobileCTA";
import {
  setSEOMeta,
  setJsonLd,
  setHreflang,
  organizationSchema,
  websiteSchema,
  serviceSchema,
} from "@/lib/seoHelpers";

const Index = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Idén finns. Produkten saknas. | Aurora Media – AI-driven mjukvara",
      description:
        "Vi bygger SaaS, appar och skräddarsydda system med fast pris från 14 900 kr. Leverans på 2–4 veckor. Du äger alltid koden. Boka kostnadsfri rådgivning.",
      canonical: "/",
      ogImage: "/og-image-sv.jpg",
      ogType: "website",
      ogLocale: "sv_SE",
      keywords:
        "SaaS-utveckling, AI-driven mjukvara, MVP-utveckling, integrationer, webbyrå Linköping, Aurora Media",
    });
    setHreflang("/", "/en");
    setJsonLd("organization-jsonld", organizationSchema);
    setJsonLd("website-jsonld", websiteSchema);
    setJsonLd("service-jsonld", serviceSchema);
  }, []);

  return (
    <div className="aurora-theme min-h-screen">
      <AuroraNavbar />
      <main id="main">
        <AuroraHero />
        <AuroraServices />
        <AuroraProducts />
        <AuroraIndustries />
        <AuroraIntegrations />
        <AuroraProcess />
        <AuroraPricing />
        <AuroraFinalCTA />
      </main>
      <AuroraFooter />
      <AuroraStickyMobileCTA />
    </div>
  );
};

export default Index;
