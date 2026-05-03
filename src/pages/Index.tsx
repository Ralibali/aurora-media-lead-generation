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
      title: "AI, automation och skräddarsydda system för företag | Aurora Media",
      description:
        "Aurora Media hjälper företag att ersätta Excel, manuella rutiner och omoderna system med AI-lösningar, automationer, SaaS, interna system och smarta digitala arbetsflöden.",
      canonical: "/",
      ogImage: "/og-image-sv.jpg",
      ogType: "website",
      ogLocale: "sv_SE",
      keywords:
        "AI automation företag, automatisera Excel, AI konsult Sverige, skräddarsydda system, SaaS-utveckling, CRM automation, digitalisering företag, Aurora Media",
    });
    setHreflang("/", "/en");
    setJsonLd("organization-jsonld", organizationSchema);
    setJsonLd("website-jsonld", websiteSchema);
    setJsonLd("service-jsonld", serviceSchema);

    // iOS Safari: paint status bar + overscroll dark to match Aurora theme.
    let themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previous = themeMeta?.getAttribute("content") ?? null;
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.name = "theme-color";
      document.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute("content", "#06120e");
    return () => {
      if (previous !== null) themeMeta!.setAttribute("content", previous);
      else themeMeta?.remove();
    };
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
