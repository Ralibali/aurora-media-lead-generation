import { Helmet } from "react-helmet-async";

interface ArticleMeta {
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article" | "profile";
  noindex?: boolean;
  noIndex?: boolean;
  article?: ArticleMeta;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const SITE_URL = "https://auroramedia.se";
export const SITE_NAME = "Aurora Media AB";
export const DEFAULT_OG = `${SITE_URL}/og-image-sv.jpg`;
const DEFAULT_OG_ALT = "Aurora Media AB – AI-driven mjukvarubyrå för svenska bolag";

function stripTrailingSlash(path: string): string {
  if (path === "/") return path;
  return path.replace(/\/+$/, "");
}

function buildCanonical(canonical?: string): string {
  if (!canonical) {
    if (typeof window !== "undefined") {
      return `${SITE_URL}${stripTrailingSlash(window.location.pathname)}`;
    }
    return SITE_URL;
  }

  if (canonical.startsWith("http")) {
    try {
      const url = new URL(canonical);
      url.pathname = stripTrailingSlash(url.pathname);
      url.hash = "";
      return url.toString();
    } catch {
      return canonical;
    }
  }

  const path = canonical.startsWith("/") ? canonical : `/${canonical}`;
  return `${SITE_URL}${stripTrailingSlash(path)}`;
}

function buildTitle(title: string): string {
  const suffix = ` | ${SITE_NAME}`;
  if (title.endsWith(suffix) || title.includes("Aurora Media")) return title;
  return `${title}${suffix}`;
}

function clampMetaDescription(description: string): string {
  const clean = description.replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  return `${clean.slice(0, 157).trimEnd()}…`;
}

export const SEO = ({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG,
  ogImageAlt = DEFAULT_OG_ALT,
  ogType = "website",
  noindex = false,
  noIndex,
  article,
  jsonLd,
}: SEOProps) => {
  const fullTitle = buildTitle(title);
  const safeDescription = clampMetaDescription(description);
  const url = buildCanonical(canonical);
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;
  const shouldNoIndex = noindex || Boolean(noIndex);
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <html lang="sv" />
      <title>{fullTitle}</title>
      <meta name="description" content={safeDescription} />
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={
          shouldNoIndex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="sv_SE" />

      {ogType === "article" && article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {ogType === "article" && article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {ogType === "article" && article?.author && (
        <meta property="article:author" content={article.author} />
      )}
      {ogType === "article" && article?.section && (
        <meta property="article:section" content={article.section} />
      )}
      {ogType === "article" &&
        article?.tags?.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {jsonLdArray.map((schema, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export function buildArticleSchema(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  type?: "Article" | "BlogPosting" | "NewsArticle";
  section?: string;
  keywords?: string[];
}): Record<string, unknown> {
  const fullImage = opts.image
    ? opts.image.startsWith("http")
      ? opts.image
      : `${SITE_URL}${opts.image}`
    : DEFAULT_OG;
  const fullUrl = opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": opts.type ?? "BlogPosting",
    headline: opts.title.slice(0, 110),
    description: opts.description,
    image: [fullImage],
    datePublished: opts.publishedTime,
    dateModified: opts.modifiedTime ?? opts.publishedTime,
    author: {
      "@type": "Person",
      name: opts.author ?? "Christoffer Holstensson",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": fullUrl,
    },
    url: fullUrl,
  };

  if (opts.section) schema.articleSection = opts.section;
  if (opts.keywords?.length) schema.keywords = opts.keywords.join(", ");

  return schema;
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
