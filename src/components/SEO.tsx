import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

const SITE_URL = "https://auroramedia.se";

export const SEO = ({
  title,
  description,
  canonical,
  ogImage = "/og-image-sv.jpg",
  noindex = false,
}: SEOProps) => {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const url = canonical || `${SITE_URL}${pathname}`;
  const safeDescription = description.slice(0, 155);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={safeDescription} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={`${SITE_URL}${ogImage}`} />
      <meta property="og:locale" content="sv_SE" />
      <meta property="og:site_name" content="Aurora Media AB" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={`${SITE_URL}${ogImage}`} />

      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
    </Helmet>
  );
};
