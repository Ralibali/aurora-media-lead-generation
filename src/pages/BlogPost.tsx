import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { getArticle, getRelatedArticles } from "@/lib/articles";
import { setSEOMeta, setJsonLd, setBreadcrumb, SITE_URL } from "@/lib/seoHelpers";

const BlogPost = () => {
  const { slug = "" } = useParams();
  const article = getArticle(slug);
  const { open } = useContactModal();

  useEffect(() => {
    if (!article) return;
    setSEOMeta({
      title: article.metaTitle,
      description: article.metaDesc,
      canonical: `/blogg/${article.slug}`,
      ogType: "article",
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate,
    });

    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Blogg", url: "/blogg" },
      { name: article.title, url: `/blogg/${article.slug}` },
    ]);

    setJsonLd("blogpost-jsonld", {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.metaDesc,
      datePublished: article.publishedDate,
      dateModified: article.updatedDate,
      author: {
        "@type": "Organization",
        name: "Aurora Media AB",
        url: SITE_URL,
      },
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      mainEntityOfPage: `${SITE_URL}/blogg/${article.slug}`,
      keywords: article.keyword,
      articleSection: article.category,
    });
    setJsonLd("blogpost-faq-jsonld", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }, [article]);

  if (!article) return <Navigate to="/blogg" replace />;

  const related = getRelatedArticles(article.relatedSlugs);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-24">
        <article className="max-w-3xl mx-auto">
          <nav className="text-sm text-muted-foreground mb-8" aria-label="Brödsmulor">
            <Link to="/" className="hover:text-foreground">Hem</Link>
            <span className="mx-2">›</span>
            <Link to="/blogg" className="hover:text-foreground">Blogg</Link>
            <span className="mx-2">›</span>
            <span className="text-foreground">{article.category}</span>
          </nav>

          <header className="mb-10">
            <p className="label-caps mb-4">{article.category}</p>
            <h1 className="font-serif text-4xl md:text-5xl leading-[1.1]">{article.title}</h1>
            <p className="mt-6 text-sm text-muted-foreground">
              Publicerad {new Date(article.publishedDate).toLocaleDateString("sv-SE")} ·
              Uppdaterad {new Date(article.updatedDate).toLocaleDateString("sv-SE")} ·
              {" "}{article.readMinutes} min läsning
            </p>
          </header>

          <p className="text-lg leading-relaxed font-medium mb-12">{article.intro}</p>

          <div className="space-y-10">
            {article.sections.map((s, i) => (
              <section key={i}>
                <h2 className="font-serif text-3xl mb-4">{s.heading}</h2>
                <p className="text-base leading-relaxed text-foreground/90">{s.content}</p>
                {i === Math.floor(article.sections.length / 2) && (
                  <div className="mt-8 rounded-lg border border-border bg-accent/30 p-6">
                    <p className="font-serif text-xl mb-2">Behöver du det här byggt?</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Prototyp från 14 900 kr. Fast pris. Skriv till mig.
                    </p>
                    <Button onClick={() => open()}>Starta ett projekt</Button>
                  </div>
                )}
              </section>
            ))}
          </div>

          <section className="mt-16">
            <h2 className="font-serif text-3xl mb-6">Vanliga frågor</h2>
            <div className="space-y-3">
              {article.faq.map((f, i) => (
                <details key={i} className="rounded-lg border border-border bg-card p-5 group">
                  <summary className="cursor-pointer font-medium list-none flex justify-between items-center gap-4">
                    <span>{f.q}</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">⌄</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="font-serif text-3xl mb-3">Har du en idé värd att bygga?</h2>
            <p className="text-muted-foreground mb-6">
              Skicka ett mejl så svarar jag inom 24 timmar. Fast pris från 14 900 kr.
            </p>
            <Button size="lg" onClick={() => open()}>Starta ett projekt</Button>
          </section>

          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="font-serif text-3xl mb-6">Relaterade artiklar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blogg/${r.slug}`}
                    className="rounded-lg border border-border bg-card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    <p className="label-caps !text-[10px] mb-2">{r.category}</p>
                    <p className="font-serif text-lg leading-snug">{r.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
