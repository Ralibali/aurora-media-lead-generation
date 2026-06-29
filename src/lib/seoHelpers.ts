// SEO helpers – setting meta tags + JSON-LD blocks dynamically per route.
// Keeps schema.org markup and meta tags consistent across all pages.

interface SEOMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  ogLocale?: string;
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string;
}

const SITE_URL = "https://auroramedia.se";

const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
  if (!content) return;
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const setLink = (rel: string, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

export const setSEOMeta = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  ogLocale = "sv_SE",
  noindex = false,
  publishedTime,
  modifiedTime,
  keywords,
}: SEOMeta) => {
  document.title = title;
  setMeta("description", description);
  setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");
  if (keywords) setMeta("keywords", keywords);

  const fullCanonical = canonical?.startsWith("http")
    ? canonical
    : `${SITE_URL}${canonical ?? ""}`;
  setLink("canonical", fullCanonical);

  const fullOgImage = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${SITE_URL}${ogImage}`
    : `${SITE_URL}/og-image-sv.jpg`;

  setMeta("og:title", title, "property");
  setMeta("og:description", description, "property");
  setMeta("og:url", fullCanonical, "property");
  setMeta("og:type", ogType, "property");
  setMeta("og:locale", ogLocale, "property");
  setMeta("og:site_name", "Aurora Media AB", "property");
  setMeta("og:image", fullOgImage, "property");
  setMeta("og:image:width", "1200", "property");
  setMeta("og:image:height", "630", "property");
  setMeta("og:image:alt", title, "property");

  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", fullOgImage);

  if (publishedTime) setMeta("article:published_time", publishedTime, "property");
  if (modifiedTime) setMeta("article:modified_time", modifiedTime, "property");
};

export const setJsonLd = (id: string, data: Record<string, unknown>) => {
  document.getElementById(id)?.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

export const removeJsonLd = (id: string) => {
  document.getElementById(id)?.remove();
};

export const setBreadcrumb = (items: { name: string; url: string }[]) => {
  setJsonLd("breadcrumb-jsonld", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  });
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#organization`,
  name: "Aurora Media AB",
  alternateName: "Aurora Media",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image-sv.jpg`,
  image: `${SITE_URL}/og-image-sv.jpg`,
  description:
    "AI-driven mjukvarupartner i Linköping som bygger AI-lösningar, interna system, appar, integrationer och SaaS för svenska företag.",
  email: "info@auroramedia.se",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Linköping",
    addressRegion: "Östergötlands län",
    addressCountry: "SE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 58.4108,
    longitude: 15.6214,
  },
  areaServed: [
    { "@type": "City", name: "Linköping" },
    { "@type": "AdministrativeArea", name: "Östergötland" },
    { "@type": "Country", name: "Sweden" },
  ],
  priceRange: "14900-89000+ SEK",
  foundingDate: "2020",
  slogan: "Manuellt arbete in. Ett smartare system ut.",
  founder: {
    "@type": "Person",
    name: "Christoffer Holstensson",
  },
  sameAs: [
    "https://github.com/Ralibali",
    "https://www.allabolag.se/5592720220/aurora-media-ab",
  ],
  serviceType: [
    "AI-konsulting",
    "AI-automation",
    "Interna verksamhetssystem",
    "SaaS-utveckling",
    "Apputveckling",
    "API-integrationer",
  ],
  makesOffer: [
    { "@type": "Offer", name: "Prototyp", price: "14900", priceCurrency: "SEK" },
    { "@type": "Offer", name: "MVP", price: "34900", priceCurrency: "SEK" },
    { "@type": "Offer", name: "Skalbar lösning", price: "89000", priceCurrency: "SEK" },
  ],
  identifier: {
    "@type": "PropertyValue",
    propertyID: "orgNr",
    value: "559272-0220",
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Aurora Media AB",
  inLanguage: "sv-SE",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "AI-lösningar och skräddarsydd mjukvara",
  provider: { "@id": `${SITE_URL}/#organization` },
  description:
    "Aurora Media bygger AI-automation, interna system, appar och SaaS med tydligt scope, snabb återkoppling och kod kunden äger.",
  offers: [
    { "@type": "Offer", name: "Prototyp", price: "14900", priceCurrency: "SEK" },
    { "@type": "Offer", name: "MVP", price: "34900", priceCurrency: "SEK" },
    { "@type": "Offer", name: "Skalbar lösning", price: "89000", priceCurrency: "SEK" },
  ],
  areaServed: "SE",
};

/** English variant of the Organization schema for /en. */
export const organizationSchemaEn = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/en#organization`,
  name: "Aurora Media AB",
  alternateName: "Aurora Media",
  url: `${SITE_URL}/en`,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Sweden-based AI-augmented software partner building SaaS products, internal systems, apps and AI automations.",
  email: "info@auroramedia.se",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Linköping",
    addressRegion: "Östergötland County",
    addressCountry: "SE",
  },
  areaServed: { "@type": "Place", name: "Worldwide" },
  priceRange: "$1,400 - $8,500+",
  foundingDate: "2020",
  slogan: "Manual work in. A smarter system out.",
  serviceType: [
    "AI consulting",
    "SaaS development",
    "MVP development",
    "Internal software",
    "App development",
    "API integrations",
  ],
  identifier: {
    "@type": "PropertyValue",
    propertyID: "orgNr",
    value: "559272-0220",
  },
};

export { SITE_URL };
