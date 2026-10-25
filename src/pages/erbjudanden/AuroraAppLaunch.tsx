import OfferPage from "@/components/verkstad/OfferPage";
import AppLaunchChecker from "@/components/tools/AppLaunchChecker";

const AuroraAppLaunch = () => (
  <OfferPage
    slug="app-release"
    paketValue="Aurora AppLaunch"
    serviceType="Release-förberedelse för App Store och Google Play"
    eyebrow="Aurora AppLaunch"
    title="Är appen redo"
    titleEm="för granskning?"
    intro="Många avslag beror på saker som går att se innan inskick: exempel-ID, saknade behörighetstexter, gammal target SDK eller en app som bara visar en webbplats. Kontrollera era konfigurationsfiler här och få en mänsklig QA-genomgång av Aurora Media."
    seoTitle="Aurora AppLaunch – release-checklista för Capacitor-appar | Aurora Media"
    seoDescription="Gratis kontroll av app-ID, signering, behörigheter, target SDK och Apple 4.2-risk för Capacitor/Fastlane-projekt. Release-hjälp enligt offert."
    contactMessage={"Hej! Vi vill ha hjälp att släppa vår app.\n\nPlattformar (iOS/Android):\nByggverktyg (Capacitor, Fastlane):\nResultat från kontrollen:\n"}
    tool={{ title: "Kontrollera release-konfigurationen", intro: "Klistra in de filer ni har. Kontrollen körs lokalt och ersätter inte App Review eller testning på riktiga enheter.", node: <AppLaunchChecker /> }}
    outcomes={[
      { title: "Hitta blockerare tidigt", body: "App-ID, signering, behörighetstexter och target SDK kontrolleras före inskick." },
      { title: "Förstå 4.2-risken", body: "Appar som främst visar en webbplats avslås ofta enligt Apples regel 4.2. Vi visar vad som behövs för tydligt app-värde." },
      { title: "Mänsklig QA", body: "En person testar kärnflödet på riktiga enheter och går igenom butikstexter och integritetsuppgifter." },
      { title: "Repeterbar release", body: "Fastlane-lanes för test och produktion utan hemligheter i repot." },
    ]}
    includes={["Konfigurationskontroll (Capacitor, Gradle, Info.plist, Fastlane)", "Genomgång av Apple 4.2 och integritetskrav", "Test på riktiga enheter", "Hjälp med butikssida och skärmbilder från riktiga byggen", "Stöd vid avslag"]}
    tiers={[
      { name: "Release-granskning", price: "Offert", featured: true, desc: "Kontroll och mänsklig QA före inskick.", features: ["Åtgärdslista", "Test på enheter", "Genomgång av butiksmaterial"] },
    ]}
    pricingNote={<>Pris enligt offert. Ingen betalning sker på sidan. Apple- och Google-utvecklarkonton betalas av er.</>}
    process={[
      { title: "Kontrollera", body: "Kör gratiskontrollen eller vår CLI i ert repo." },
      { title: "Åtgärda och testa", body: "Blockerare åtgärdas och appen testas på riktiga enheter." },
      { title: "Skicka in", body: "Vi stöttar inskick och eventuella frågor från granskarna." },
    ]}
    honesty={[
      "Ingen checklista garanterar godkännande i App Store eller Google Play.",
      "Kontrollen läser bara filerna ni anger och kan inte se hur appen beter sig när den körs.",
      "Butikernas krav ändras – vi kontrollerar aktuella riktlinjer i varje uppdrag.",
    ]}
    faqs={[
      { q: "Vad är regel 4.2?", a: "Apples riktlinje om minimal funktionalitet: appen måste ge mer än en ompaketerad webbplats." },
      { q: "Behöver ni våra certifikat?", a: "Inte för kontrollen. Vid inskick använder vi behörigheter ni ger oss och lagrar inga nycklar i koden." },
    ]}
    related={[{ name: "Apputveckling", price: "", to: "/tjanster/mobilapp" }, { name: "App-prisräknare", price: "gratis", to: "/verktyg/app-prisraknare" }]}
  />
);
export default AuroraAppLaunch;
