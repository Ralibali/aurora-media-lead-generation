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
import AuroraLeadCTA from "@/components/landing/AuroraLeadCTA";
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
      title: "SaaS-MVP på 3–4 veckor | Lovable-byrån Aurora Media",
      description:
        "Aurora Media bygger fungerande SaaS-MVP:er på 3–4 veckor åt svenska entreprenörer som vill testa idéer snabbt med fast pris, Lovable, Supabase och Stripe.",
      canonical: "/",
      ogImage: "/og-image-sv.jpg",
      ogType: "website",
      ogLocale: "sv_SE",
      keywords:
        "SaaS MVP, Lovable byrå, bygga MVP, SaaS utveckling Sverige, MVP byrå, Supabase, Stripe, Aurora Media",
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

  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash;
    const t = setTimeout(() => {
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="aurora-theme min-h-screen">
      <AuroraNavbar />
      <main id="main">
        <AuroraHero />
        <AuroraServices />
        <AuroraProducts />
        <AuroraLeadCTA
          variant="compact"
          eyebrow="Redo att testa idén?"
          title="Få ett konkret MVP-förslag inom 24 timmar."
          description="Beskriv idén, målgruppen och vad som måste fungera i första versionen — så återkommer vi med rekommenderat paket och nästa steg."
          ctaLabel="Skicka MVP-förfrågan"
        />
        <AuroraIndustries />
        <AuroraIntegrations />
        <AuroraProcess />
        <AuroraPricing />
        <AuroraLeadCTA />
        <AuroraFinalCTA />
      </main>
      <AuroraFooter />
      <AuroraStickyMobileCTA />
    </div>
  );
};

export default Index;
