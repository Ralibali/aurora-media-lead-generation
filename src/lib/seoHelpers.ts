// SEO helpers – setting meta tags + JSON-LD blocks dynamically per route.
// Keeps schema.org markup and meta tags consistent across all pages.

interface SEOMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

const SITE_URL = "https://auroramedia.se";

const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export const setSEOMeta = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  noindex = false,
  publishedTime,
  modifiedTime,
}: SEOMeta) => {
  document.title = title;
  setMeta("description", description);
  setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

  const fullCanonical = canonical?.startsWith("http") ? canonical : `${SITE_URL}${canonical ?? ""}`;
  setLink("canonical", fullCanonical);

  setMeta("og:title", title, "property");
  setMeta("og:description", description, "property");
  setMeta("og:url", fullCanonical, "property");
  setMeta("og:type", ogType, "property");
  setMeta("og:locale", "sv_SE", "property");
  setMeta("og:site_name", "Aurora Media AB", "property");
  if (ogImage) setMeta("og:image", ogImage, "property");

  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  if (ogImage) setMeta("twitter:image", ogImage);

  if (publishedTime) setMeta("article:published_time", publishedTime, "property");
  if (modifiedTime) setMeta("article:modified_time", modifiedTime, "property");
};

export const setJsonLd = (id: string, data: Record<string, unknown>) => {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
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
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
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
  logo: `${SITE_URL}/logo.png`,
  description:
    "Bygger SaaS-produkter och interna verktyg åt svenska företag med AI-kodning. Från 14 900 kr. Leverans på veckor.",
  email: "info@auroramedia.se",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Linköping",
    addressRegion: "Östergötlands län",
    addressCountry: "SE",
  },
  areaServed: { "@type": "Country", name: "Sweden" },
  priceRange: "14900-89000 SEK",
  foundingDate: "2020",
  slogan: "Bygger SaaS med AI – veckor, inte månader",
  serviceType: [
    "SaaS-utveckling",
    "AI-kodning",
    "Webbutveckling",
    "MVP-utveckling",
    "Intern verktygsutveckling",
  ],
  makesOffer: [
    { "@type": "Offer", name: "Prototyp", price: "14900", priceCurrency: "SEK" },
    { "@type": "Offer", name: "MVP", price: "34900", priceCurrency: "SEK" },
    { "@type": "Offer", name: "Skalbar SaaS", price: "69000", priceCurrency: "SEK" },
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
  name: "SaaS-utveckling med AI",
  provider: { "@id": `${SITE_URL}/#organization` },
  description: "Bygger SaaS-produkter med AI-kodningsverktyg. Leverans 2-4 veckor.",
  offers: [
    { "@type": "Offer", name: "Prototyp", price: "14900", priceCurrency: "SEK" },
    { "@type": "Offer", name: "MVP", price: "34900", priceCurrency: "SEK" },
    { "@type": "Offer", name: "Skalbar SaaS", price: "69000", priceCurrency: "SEK" },
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
    "Sweden-based AI-augmented developer building SaaS products in 2-4 weeks with Lovable, Bolt and Claude. 7 products shipped. Fixed price from $1,400.",
  email: "info@auroramedia.se",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Linköping",
    addressRegion: "Östergötland County",
    addressCountry: "SE",
  },
  areaServed: { "@type": "Place", name: "Worldwide" },
  priceRange: "$1,400 - $8,500",
  foundingDate: "2020",
  slogan: "I ship SaaS in weeks. Not months.",
  serviceType: [
    "SaaS development",
    "MVP development",
    "AI-augmented coding",
    "Fractional CTO",
    "Web development",
  ],
  makesOffer: [
    { "@type": "Offer", name: "Prototype", price: "1400", priceCurrency: "USD" },
    { "@type": "Offer", name: "MVP", price: "3300", priceCurrency: "USD" },
    { "@type": "Offer", name: "Production SaaS", price: "6500", priceCurrency: "USD" },
    { "@type": "Offer", name: "Custom", price: "8500", priceCurrency: "USD" },
  ],
  identifier: {
    "@type": "PropertyValue",
    propertyID: "orgNr",
    value: "559272-0220",
  },
};

/** Set hreflang alternate links for sv/en pairs. */
export const setHreflang = (svPath: string, enPath: string) => {
  // Clean previous
  document.head
    .querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());

  const add = (lang: string, path: string) => {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", lang);
    link.setAttribute(
      "href",
      path.startsWith("http") ? path : `${SITE_URL}${path}`,
    );
    document.head.appendChild(link);
  };
  add("sv", svPath);
  add("en", enPath);
  add("x-default", svPath);
};

export { SITE_URL };
