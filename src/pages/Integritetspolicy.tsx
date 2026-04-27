import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import RelatedLinks from "@/components/RelatedLinks";
import { setSEOMeta, setBreadcrumb, setJsonLd, SITE_URL } from "@/lib/seoHelpers";

const updatedDate = "27 april 2026";

const sections = [
  {
    h: "1. Personuppgiftsansvarig",
    content: [
      "Aurora Media AB, org.nr 559272-0220, är personuppgiftsansvarig för behandlingen av personuppgifter som sker via denna webbplats, våra kontaktformulär, offertförfrågningar, leadformulär och digitala marknadsföringskanaler.",
      "Kontakt vid frågor om personuppgifter: info@auroramedia.se. Bolaget är baserat i Linköping, Sverige.",
    ],
  },
  {
    h: "2. Vilka personuppgifter vi behandlar",
    content: [
      "När du kontaktar oss, fyller i ett formulär eller bokar en genomgång kan vi behandla namn, e-postadress, telefonnummer, företagsnamn, webbplats, meddelanden du själv lämnar samt information om vilken tjänst du är intresserad av.",
      "När du besöker webbplatsen kan vi, beroende på dina cookieval, behandla teknisk information som IP-adress, enhetsinformation, webbläsare, besökta sidor, klick, trafikkälla och annan användningsdata.",
      "Vi ber dig att inte skicka känsliga personuppgifter via formulär eller e-post, exempelvis uppgifter om hälsa, politiska åsikter, religion eller andra känsliga förhållanden.",
    ],
  },
  {
    h: "3. Varför vi behandlar personuppgifter",
    content: [
      "Vi behandlar personuppgifter för att kunna besvara förfrågningar, lämna offerter, boka möten, leverera våra tjänster, administrera kundrelationer och följa upp pågående dialoger.",
      "Vi kan även använda uppgifter för att förbättra webbplatsen, mäta annonsering, analysera vilka tjänster som efterfrågas och marknadsföra relevanta tjänster inom exempelvis hemsidor, SEO, Google Ads, Meta Ads, e-handel och digital leadgenerering.",
    ],
  },
  {
    h: "4. Laglig grund",
    content: [
      "När du kontaktar oss eller begär offert behandlar vi dina uppgifter med stöd av berättigat intresse, eftersom vi behöver kunna svara på din förfrågan och föra en affärsdialog.",
      "När behandlingen krävs för att ingå eller fullgöra avtal behandlar vi uppgifter med stöd av avtal.",
      "För bokföring, fakturering och andra lagkrav behandlar vi uppgifter med stöd av rättslig förpliktelse.",
      "För icke nödvändiga cookies, analysverktyg, remarketing och liknande spårning behandlar vi uppgifter med stöd av ditt samtycke där sådant krävs.",
    ],
  },
  {
    h: "5. Cookies, analys och annonsering",
    content: [
      "Webbplatsen kan använda cookies och liknande tekniker. Vissa cookies är tekniskt nödvändiga för att webbplatsen ska fungera. Andra används endast om du samtycker till dem.",
      "Vi kan använda verktyg som Google Analytics, Google Ads och Meta Pixel för att mäta trafik, förstå hur webbplatsen används, följa upp annonser och skapa mer relevanta målgrupper för marknadsföring.",
      "Om Meta Pixel eller liknande annonsteknik används ska den vara konfigurerad så att den inte skickar känsliga personuppgifter eller onödiga formuläruppgifter till tredje part. Vi strävar efter dataminimering och använder inte spårning för att medvetet behandla känsliga personuppgifter.",
      "Du kan när som helst ändra eller återkalla ditt samtycke via webbplatsens cookieinställningar, om sådan funktion finns tillgänglig.",
    ],
  },
  {
    h: "6. Leadformulär och annonser i sociala medier",
    content: [
      "Om du lämnar uppgifter via ett leadformulär på exempelvis Facebook, Instagram eller annan plattform får Aurora Media AB tillgång till de uppgifter du själv skickar in i formuläret.",
      "Plattformen kan samtidigt behandla personuppgifter för egna ändamål enligt sina egna villkor och integritetspolicys. Vi ansvarar för vår behandling av de uppgifter vi tar emot och använder dem för att kontakta dig, lämna information, boka möte eller följa upp din förfrågan.",
    ],
  },
  {
    h: "7. Mottagare och personuppgiftsbiträden",
    content: [
      "Vi kan dela personuppgifter med leverantörer som hjälper oss med webbhotell, drift, formulär, e-post, CRM, analys, annonsering, bokföring, support och teknisk utveckling.",
      "Sådana leverantörer får endast behandla personuppgifter enligt våra instruktioner när de agerar personuppgiftsbiträden. I vissa fall kan en leverantör vara självständigt personuppgiftsansvarig för sin egen behandling, till exempel vissa annonsplattformar.",
    ],
  },
  {
    h: "8. Överföring till länder utanför EU/EES",
    content: [
      "Vissa digitala verktyg och molntjänster kan innebära att personuppgifter behandlas utanför EU/EES, exempelvis i USA. När sådan överföring sker ska den bygga på en giltig överföringsmekanism, exempelvis EU-kommissionens standardavtalsklausuler, beslut om adekvat skyddsnivå eller annan tillåten grund enligt GDPR.",
    ],
  },
  {
    h: "9. Hur länge vi sparar uppgifter",
    content: [
      "Vi sparar personuppgifter så länge det behövs för ändamålet. Förfrågningar och leaduppgifter sparas normalt så länge dialogen är aktiv och därefter så länge det är rimligt för uppföljning, dokumentation och kundrelationer.",
      "Kund- och avtalsuppgifter sparas under den tid som krävs för att fullgöra avtal och hantera rättsliga krav. Bokföringsunderlag sparas enligt gällande bokföringsregler.",
      "Uppgifter som behandlas med stöd av samtycke sparas tills du återkallar samtycket eller tills uppgifterna inte längre behövs för ändamålet.",
    ],
  },
  {
    h: "10. Dina rättigheter",
    content: [
      "Du har rätt att begära tillgång till de personuppgifter vi behandlar om dig. Du kan även begära rättelse, radering, begränsning av behandling, invända mot behandling som sker med stöd av berättigat intresse och i vissa fall begära dataportabilitet.",
      "Om behandlingen bygger på samtycke har du rätt att när som helst återkalla samtycket. Återkallelsen påverkar inte lagligheten av behandling som skett innan samtycket återkallades.",
      "För att använda dina rättigheter kontaktar du oss på info@auroramedia.se. Vi kan behöva säkerställa din identitet innan vi hanterar begäran.",
    ],
  },
  {
    h: "11. Klagomål",
    content: [
      "Om du anser att vi behandlar dina personuppgifter på ett felaktigt sätt kan du kontakta oss så försöker vi lösa frågan. Du har även rätt att lämna klagomål till Integritetsskyddsmyndigheten, IMY.",
    ],
  },
  {
    h: "12. Ändringar i policyn",
    content: [
      "Vi kan uppdatera denna integritetspolicy när webbplatsen, våra tjänster, våra leverantörer eller gällande regler ändras. Den senaste versionen finns alltid på denna sida.",
    ],
  },
];

const Integritetspolicy = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Integritetspolicy – Aurora Media AB",
      description:
        "Integritetspolicy för Aurora Media AB. Läs hur vi behandlar personuppgifter, cookies, kontaktformulär, leadformulär, analys och annonsering.",
      canonical: "/integritetspolicy",
      noindex: false,
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Integritetspolicy", url: "/integritetspolicy" },
    ]);
    setJsonLd("privacy-policy-webpage", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Integritetspolicy",
      url: `${SITE_URL}/integritetspolicy`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      about: "Privacy policy, GDPR, cookies, analytics and advertising",
      inLanguage: "sv-SE",
      dateModified: "2026-04-27",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <p className="label-caps">Juridik & integritet</p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05]">
              Integritetspolicy
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Här förklarar vi hur Aurora Media AB behandlar personuppgifter när du använder
              webbplatsen, kontaktar oss, lämnar en offertförfrågan eller interagerar med våra
              annonser. Senast uppdaterad {updatedDate}.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="rounded-3xl border border-border bg-card/60 p-6 md:p-8 mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Kort sammanfattning
              </p>
              <p className="text-foreground/85 leading-relaxed">
                Vi samlar främst in uppgifter som du själv lämnar när du kontaktar oss, samt
                teknisk användningsdata från webbplatsen om du godkänner relevanta cookies. Vi
                använder uppgifterna för att svara på förfrågningar, leverera tjänster, förbättra
                webbplatsen och följa upp marknadsföring.
              </p>
            </div>

            <div className="space-y-12">
              {sections.map((section) => (
                <section key={section.h}>
                  <h2 className="font-serif text-3xl mb-4">{section.h}</h2>
                  <div className="space-y-4">
                    {section.content.map((paragraph) => (
                      <p key={paragraph} className="text-foreground/85 leading-relaxed text-lg">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-14 rounded-3xl border border-border bg-muted/30 p-6 md:p-8">
              <h2 className="font-serif text-3xl mb-4">Kontakt</h2>
              <p className="text-foreground/85 leading-relaxed text-lg">
                Frågor om integritet och personuppgifter skickas till{" "}
                <a className="underline underline-offset-4" href="mailto:info@auroramedia.se">
                  info@auroramedia.se
                </a>.
              </p>
            </div>

            <RelatedLinks
              heading="Läs vidare"
              links={[
                { to: "/kontakt", title: "Kontakta Aurora Media", caption: "Kontakt" },
                { to: "/redaktionell-policy", title: "Redaktionell policy", caption: "Transparens" },
                { to: "/tjanster/meta-ads", title: "Meta Ads", caption: "Annonsering" },
              ]}
            />
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default Integritetspolicy;
