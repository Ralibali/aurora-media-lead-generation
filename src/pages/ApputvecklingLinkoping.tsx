import LocalLandingPage from "@/components/nordic/LocalLandingPage";

const ApputvecklingLinkoping = () => (
  <LocalLandingPage
    slug="apputveckling-linkoping"
    metaTitle="Apputveckling i Linköping – iOS, Android & webbappar"
    metaDesc="Apputveckling i Linköping. iOS, Android och webbappar byggda med React Native/Expo. Från MVP till skalbar produkt. Fast pris från 89 000 kr."
    keywords="apputveckling Linköping, mobilapp Linköping, iOS-utveckling Linköping, Android-app Linköping, React Native"
    crumbLabel="Apputveckling i Linköping"
    eyebrow="aurora media · apputveckling · linköping"
    h1="Apputveckling"
    h1Italic="i Linköping."
    lead="Vi bygger iOS-, Android- och webbappar för företag i Östergötland – från MVP till skalbar produkt. Modern teknik (React Native, Expo, Supabase), fast pris och kod ni äger själva."
    serviceType={["Mobile app development", "iOS development", "Android development", "React Native"]}
    problems={[
      { n: "01", title: "Idén finns – men ingen bygger den", desc: "Ni har validerat behovet med kunder eller egen personal, men konsultbyråerna offererar 800 000 kr för en MVP." },
      { n: "02", title: "Befintlig app är död", desc: "En byrå byggde en app 2019, ingen underhåller den, den kraschar på nya iOS-versioner och koden är oåtkomlig." },
      { n: "03", title: "Två plattformar dubbla budgeten", desc: "Ni tror att iOS + Android = två separata projekt. Med rätt stack är det ett kodbas som ger båda." },
      { n: "04", title: "App Store-processen är en gåta", desc: "Ingen vet vad Apple/Google kräver för review, hur TestFlight funkar eller hur man ens skapar en utvecklarkonto rätt." },
    ]}
    services={[
      { title: "MVP-app på 4–8 veckor", desc: "Native app för iOS + Android från samma kodbas, med inloggning, databas, push och betalningar. Live i App Store och Google Play." },
      { title: "React Native / Expo", desc: "Modern stack som är underhållbar, snabb att utveckla i och som ni lätt kan lämna över till nästa utvecklare senare." },
      { title: "Backend och Supabase", desc: "Databas, autentisering, filer och realtidsfunktioner utan att drifta egen server. Skalar från 10 till 100 000 användare." },
      { title: "In-app purchases och abonnemang", desc: "Freemium- och prenumerationsmodeller med RevenueCat. Vi hanterar Apple/Google-avgifter, kvitton och receipt validation." },
      { title: "Push, analytics och crash reporting", desc: "OneSignal/Expo push, PostHog för produktanalys, Sentry för crash-tracking – ingropat från dag ett." },
      { title: "App Store & Google Play-lansering", desc: "Vi hanterar dev-konton, screenshots, metadata, review-processen och de vanliga Apple-avslag som annars kostar veckor." },
    ]}
    faqs={[
      { q: "Vad kostar apputveckling i Linköping?", a: "MVP med basfunktioner: 89 000–149 000 kr. Bredare produkter (flera användarroller, backend-logik, integrationer): 200 000–450 000 kr. Löpande underhåll från 4 900 kr/mån." },
      { q: "iOS, Android eller båda?", a: "Vi bygger normalt båda samtidigt med React Native/Expo – kostnaden blir bara marginellt högre än en plattform. Ren native (Swift/Kotlin) gör vi när prestandakraven är extrema." },
      { q: "Vem äger koden?", a: "Ni. Kod och konton (Apple Developer, Google Play, Supabase, RevenueCat) står i ert bolagsnamn. Vi lämnar över allt om ni någon gång byter leverantör." },
      { q: "Har ni byggt egna appar?", a: "Ja. Hönsgården (iOS/Android, freemium med abonnemang) och Aurora Transport är två egna produkter som vi driftar dagligen – så vi vet hur det är att både bygga och drifta." },
      { q: "Kan ni fixa vår befintliga app?", a: "Oftast. Vi gör en teknisk audit där vi bedömer om koden är räddbar eller om det är billigare att bygga om från grunden. Ärligt svar, inte säljsnack." },
    ]}
    relatedLinks={[
      { label: "Tjänst – Mobilapp", to: "/tjanster/mobilapp", desc: "Djupgående info om vår mobilapp-tjänst, stack och leveransmodell." },
      { label: "Case – Hönsgården", to: "/arbete/honsgarden", desc: "Egen freemium-app i App Store och Google Play med statistik, abonnemang och AI." },
      { label: "AI-byrå i Linköping", to: "/ai-byra-linkoping", desc: "Om appen ska ha AI-funktioner (bildanalys, chat, rekommendationer) bygger vi det i samma team." },
      { label: "Priser", to: "/priser", desc: "Se våra fastprispaket för MVP, appar och SaaS-produkter." },
    ]}
  />
);

export default ApputvecklingLinkoping;
