import OfferPage from "@/components/verkstad/OfferPage";
import MailGuardChecker from "@/components/tools/MailGuardChecker";

const AuroraMailGuard = () => (
  <OfferPage
    slug="mailguard"
    paketValue="Aurora MailGuard"
    serviceType="Förvaltning av e-postautentisering (SPF, DKIM, DMARC)"
    eyebrow="Aurora MailGuard"
    title="Kan någon skicka e-post"
    titleEm="i ert namn?"
    intro="SPF, DKIM och DMARC avgör om mottagare kan skilja er riktiga e-post från förfalskningar. Kontrollera era publika DNS-poster gratis här och låt Aurora Media sköta den stegvisa vägen till en striktare DMARC-policy."
    seoTitle="Aurora MailGuard – kontrollera SPF, DKIM och DMARC | Aurora Media"
    seoDescription="Gratis read-only kontroll av MX, SPF, DMARC och DKIM för er domän, med åtgärder på svenska. Förvaltad DMARC-uppföljning enligt offert."
    contactMessage={"Hej! Jag vill ha hjälp med SPF/DKIM/DMARC.\n\nDomän:\nE-postleverantör (t.ex. Microsoft 365, Google Workspace):\nAndra tjänster som skickar e-post åt oss (nyhetsbrev, webbshop, CRM):\n"}
    tool={{ title: "Kontrollera er domän", intro: "Läser endast publika DNS-poster. Resultatet är en ögonblicksbild – inte en garanti för leverans eller skydd.", node: <MailGuardChecker /> }}
    outcomes={[
      { title: "Se vad som saknas", body: "Kontrollen visar om SPF och DMARC finns, vilken DMARC-policy som gäller och om SPF har fel som gör den verkningslös." },
      { title: "Inventera alla avsändare", body: "Vi går igenom vilka system som skickar e-post åt er så att inget legitimt utskick stoppas när policyn skärps." },
      { title: "Skärp stegvis", body: "Från p=none via quarantine till reject, baserat på DMARC-rapporterna – inte på gissningar." },
      { title: "Löpande uppföljning", body: "Vi läser rapporterna och flaggar nya eller okända avsändare." },
    ]}
    includes={["Genomgång av MX, SPF, DKIM och DMARC", "Inventering av avsändande tjänster", "Rättade DNS-poster att publicera hos er DNS-leverantör", "Plan för stegvis DMARC-skärpning", "Uppföljning av DMARC-rapporter vid förvaltning"]}
    tiers={[
      { name: "Genomgång", price: "Offert", desc: "En avgränsad genomgång av en domän med åtgärdslista.", features: ["Kontroll av alla fyra områden", "Åtgärdsförslag på svenska", "Ni publicerar ändringarna eller vi gör det med er behörighet"] },
      { name: "Förvaltning", price: "Offert", featured: true, desc: "Löpande uppföljning tills policyn är strikt och därefter bevakning.", features: ["DMARC-rapporter läses löpande", "Stegvis skärpning", "Avvikelser rapporteras"] },
    ]}
    pricingNote={<>Pris enligt offert efter genomgång av antal domäner och avsändare. Ingen betalning sker på sidan.</>}
    process={[
      { title: "Kör gratiskontrollen", body: "Ni ser direkt vad som saknas i publik DNS." },
      { title: "Inventera avsändare", body: "Tillsammans listar vi alla tjänster som skickar e-post åt er." },
      { title: "Publicera och följ upp", body: "Rättade poster publiceras och rapporterna följs upp innan policyn skärps." },
    ]}
    honesty={[
      "Kontrollen läser publik DNS och kan inte se hur era e-postservrar faktiskt signerar eller levererar.",
      "DKIM kan bara bedömas när selektorn är känd – annars redovisas den som ej avgjord.",
      "Ingen konfiguration gör en domän helt skyddad. Vi lovar inte leveransgrad eller skräppostplacering.",
      "Rapportinsamling via egen DMARC-tjänst är inte byggd ännu; vi använder er eller en extern rapportadress.",
    ]}
    faqs={[
      { q: "Sparas domänen jag kontrollerar?", a: "Nej. Kontrollen svarar direkt och lagrar inte domänen eller resultatet." },
      { q: "Var hittar jag min DKIM-selektor?", a: "I e-postleverantörens administration eller i rubriken DKIM-Signature (s=) i ett mail ni skickat." },
      { q: "Varför räcker inte p=none?", a: "p=none samlar bara rapporter. Först quarantine eller reject gör att mottagare agerar på förfalskad e-post." },
    ]}
    related={[{ name: "Aurora Watch", price: "från 299 kr/mån", to: "/aurora-watch" }, { name: "Aurora Care", price: "från 995 kr/mån", to: "/care" }]}
  />
);
export default AuroraMailGuard;
