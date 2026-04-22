import ServicePageTemplate from "./ServicePageTemplate";

const GrafiskProfil = () => (
  <ServicePageTemplate
    slug="grafisk-profil"
    title="Grafisk profil från 5 900 kr."
    intro="Logo, färger, typografi och mallar. Tillräckligt för att se ut som ett riktigt varumärke – inte mer, inte mindre."
    paketName="Annat"
    seoTitle="Grafisk profil från 5 900 kr – logo, färger, typografi | Aurora Media"
    seoDescription="Komplett grafisk profil: logo, färgpalett, typografi och mallar. Levereras på 5 dagar. Från 5 900 kr."
    includes={[
      "Logo i 3 varianter (primär, monokrom, ikon)",
      "Färgpalett (HEX, RGB, CMYK)",
      "Typografi (display + body, med fallback)",
      "Visitkort-mall (PDF + Canva-template)",
      "Brevmall (Word + Google Docs)",
      "Social media-mallar (Instagram, LinkedIn-cover)",
      "Logofil i SVG, PNG och AI-format",
      "Korta brand guidelines (1-sidig PDF)",
    ]}
    process={[
      { label: "Steg 1", title: "Brief", body: "Vad gör företaget, vilken känsla, vilka konkurrenter att inte likna." },
      { label: "Steg 2", title: "Riktning", body: "Tre logoutkast i olika riktningar. Du väljer en att utveckla." },
      { label: "Steg 3", title: "Färdigställa", body: "Vald riktning förfinas, mallar produceras." },
      { label: "Steg 4", title: "Leverans", body: "Komplett mappstruktur med alla filer + guidelines." },
    ]}
    tiers={[
      { name: "Liten", price: "5 900 kr", time: "5 dagar", desc: "Logo, färger, typografi. Det grundläggande.", features: ["Logo i 3 varianter", "Färgpalett", "Typografi", "Logofiler"] },
      { name: "Komplett", price: "9 900 kr", time: "1 vecka", desc: "Alla mallar och brand guidelines.", features: ["Allt i Liten", "Visitkort + brevmall", "Sociala mallar", "Brand guidelines"], featured: true },
      { name: "Refresh", price: "3 900 kr", time: "3 dagar", desc: "Du har en logo, men allt annat har glidit. Återställning.", features: ["Färgöversyn", "Typografival", "Logofil-cleanup", "Brand guidelines"] },
    ]}
    whyAffordable="Med bra AI-verktyg och 15 års förmåga att se vad som funkar visuellt, behövs inte en designerstudio i en vecka för en liten profil. Större varumärken kräver mer – då säger jag det och kopplar in en designerpartner."
    faqs={[
      { q: "Vad om jag bara vill ha en logo?", a: "Då räcker logo-paketet i mitt webbpaket – ingår från 1 900 kr som tillval." },
      { q: "Vem äger rättigheterna?", a: "Du. Komplett upphovsrättsöverlåtelse i avtalet." },
      { q: "Hjälper du med tryckproduktion?", a: "Nej, men jag levererar i tryckklara format så vilken tryckare som helst kan ta över." },
      { q: "Kan jag få fler revisioner?", a: "Två revisionsrundor ingår. Fler debiteras med 895 kr/h, men sällan nödvändigt." },
    ]}
    related={[
      { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
      { name: "Fotografering", price: "4 900 kr/halvdag", to: "/tjanster/fotografering" },
      { name: "Content", price: "1 490 kr/artikel", to: "/tjanster/content" },
    ]}
  />
);

export default GrafiskProfil;
