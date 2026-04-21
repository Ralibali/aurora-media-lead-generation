import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { articles } from "@/lib/articles";
import { setSEOMeta, setJsonLd, setBreadcrumb, SITE_URL } from "@/lib/seoHelpers";

const Blog = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Artiklar om AI-kodning och SaaS-utveckling | Aurora Media",
      description:
        "Artiklar om att bygga SaaS med AI-verktyg som Lovable, Bolt och Emergent. Konkreta erfarenheter, jämförelser och prisguider från Aurora Media.",
      canonical: "/artiklar",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Artiklar", url: "/artiklar" },
    ]);
    setJsonLd("blog-collection-jsonld", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Artiklar – Aurora Media",
      url: `${SITE_URL}/artiklar`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: articles.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/artiklar/${a.slug}`,
          name: a.title,
        })),
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-24">
        <header className="max-w-3xl mb-16">
          <p className="label-caps mb-4">Artiklar</p>
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05]">
            Artiklar om AI-kodning och <em className="italic text-primary">SaaS-utveckling</em>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            Jag skriver om det jag lär mig av att bygga SaaS med AI-verktyg.
            Erfarenheter, jämförelser, konkreta siffror.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link
              key={a.slug}
              to={`/artiklar/${a.slug}`}
              className="group rounded-lg border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className="label-caps !text-[10px]">{a.category}</span>
                <span>·</span>
                <span>{a.readMinutes} min</span>
              </div>
              <h2 className="font-serif text-2xl leading-snug group-hover:text-primary transition-colors">
                {a.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{a.intro}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                Publicerad {new Date(a.publishedDate).toLocaleDateString("sv-SE")}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
