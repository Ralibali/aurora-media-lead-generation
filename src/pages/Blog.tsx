import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock, Sparkles, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { articles, articleCategories } from "@/lib/articles";
import { setSEOMeta, setJsonLd, setBreadcrumb, SITE_URL } from "@/lib/seoHelpers";

const formatDate = (date: string) => new Date(date).toLocaleDateString("sv-SE");

const Blog = () => {
  const [featured, ...restArticles] = articles;
  const latest = articles.slice(0, 3);
  const visibleCategories = articleCategories.slice(0, 7);

  useEffect(() => {
    setSEOMeta({
      title: "Artiklar om AI-kodning och SaaS-utveckling | Aurora Media",
      description:
        "Artiklar om att bygga SaaS med AI-verktyg som Lovable, Bolt och Emergent. Konkreta erfarenheter, jämförelser och prisguider från Aurora Media.",
      canonical: "/blogg",
    });

    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Blogg", url: "/blogg" },
    ]);

    setJsonLd("blog-collection-jsonld", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Blogg – Aurora Media",
      url: `${SITE_URL}/blogg`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: articles.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/blogg/${a.slug}`,
          name: a.title,
        })),
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="blog-page overflow-hidden">
        <section className="blog-hero relative px-6 pb-14 pt-24 sm:px-10 sm:pt-28 lg:px-[70px] lg:pb-20 lg:pt-32">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_16%,rgba(59,130,246,0.24),transparent_34rem),radial-gradient(circle_at_10%_55%,rgba(168,85,247,0.17),transparent_30rem),linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.88))]" />

          <div className="mx-auto max-w-7xl">
            <div className="mb-9 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <p className="label-caps mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.055] px-4 py-2 backdrop-blur-xl">
                  <Sparkles size={13} /> Aurora Insights
                </p>
                <h1 className="font-display text-[clamp(3.1rem,7vw,6.7rem)] font-bold leading-[0.92] tracking-tight text-white">
                  Artiklar som gör idéer till produkter.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/66 sm:text-lg">
                  Raka guider om AI-kodning, SaaS-utveckling, MVP:er och interna verktyg —
                  skrivna från verkliga projekt, inte från konferensslides.
                </p>
              </div>

              <div className="grid max-w-xl grid-cols-3 gap-3 lg:w-[420px]">
                <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur-2xl sm:p-5">
                  <p className="text-3xl font-bold text-white sm:text-4xl">{articles.length}</p>
                  <p className="mt-1 text-xs text-white/55 sm:text-sm">guider</p>
                </div>
                <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur-2xl sm:p-5">
                  <p className="text-3xl font-bold text-white sm:text-4xl">{articleCategories.length}</p>
                  <p className="mt-1 text-xs text-white/55 sm:text-sm">ämnen</p>
                </div>
                <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur-2xl sm:p-5">
                  <p className="text-3xl font-bold text-white sm:text-4xl">AI</p>
                  <p className="mt-1 text-xs text-white/55 sm:text-sm">byggt</p>
                </div>
              </div>
            </div>

            {featured && (
              <Link
                to={`/blogg/${featured.slug}`}
                className="group relative grid overflow-hidden rounded-[2rem] border border-white/14 bg-white/[0.07] shadow-[0_44px_130px_-62px_rgba(59,130,246,0.9)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-blue-300/35 lg:grid-cols-[1.04fr_0.96fr]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(59,130,246,0.24),transparent_30rem),radial-gradient(circle_at_18%_84%,rgba(236,72,153,0.15),transparent_26rem)] opacity-95" />
                <div className="relative p-7 sm:p-10 lg:p-12">
                  <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-white/62">
                    <span className="label-caps !text-[10px] rounded-full border border-blue-300/25 bg-blue-400/10 px-3 py-1.5 text-blue-100">
                      Rekommenderad
                    </span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {featured.readMinutes} min</span>
                    <span>{formatDate(featured.publishedDate)}</span>
                  </div>

                  <h2 className="font-display text-[clamp(2.45rem,4.4vw,4.7rem)] font-bold leading-[0.98] tracking-tight text-white">
                    {featured.title}
                  </h2>
                  <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/68 sm:text-lg">
                    {featured.intro}
                  </p>

                  <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-xl transition group-hover:border-blue-300/45 group-hover:bg-blue-400/15">
                    Läs huvudartikeln
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                <div className="relative hidden min-h-[360px] overflow-hidden border-l border-white/10 lg:block">
                  <div className="absolute inset-7 rounded-[1.75rem] border border-white/14 bg-black/42 p-5 shadow-[inset_0_0_80px_rgba(59,130,246,0.12)] backdrop-blur-2xl">
                    <div className="mb-4 flex items-center justify-between gap-4 text-xs text-white/48">
                      <span className="font-bold uppercase tracking-[0.18em]">Article stack</span>
                      <span className="truncate text-right">{featured.keyword}</span>
                    </div>
                    <div className="space-y-3">
                      {featured.sections.slice(0, 4).map((section, index) => (
                        <div key={section.heading} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition group-hover:border-blue-300/18 group-hover:bg-white/[0.07]">
                          <p className="text-xs font-bold text-blue-200/85">0{index + 1}</p>
                          <p className="mt-1 text-sm font-semibold leading-snug text-white/86">{section.heading}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {visibleCategories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-white/12 bg-white/[0.045] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 backdrop-blur-xl"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 pt-4 sm:px-10 lg:px-[70px]">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="mb-7 flex items-end justify-between gap-6 border-b border-white/10 pb-6">
                <div>
                  <p className="label-caps mb-3">Alla artiklar</p>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Läs vidare
                  </h2>
                </div>
                <p className="hidden max-w-sm text-sm leading-relaxed text-white/54 md:block">
                  Praktiska artiklar för dig som bygger, köper eller validerar digitala produkter.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {restArticles.map((a, index) => {
                  const wide = index % 5 === 0;
                  return (
                    <Link
                      key={a.slug}
                      to={`/blogg/${a.slug}`}
                      className={`group relative overflow-hidden rounded-[1.65rem] border border-white/12 bg-white/[0.055] p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/40 hover:bg-white/[0.085] ${
                        wide ? "md:col-span-2 md:p-7" : ""
                      }`}
                    >
                      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/12 blur-3xl transition group-hover:bg-purple-500/18" />
                      <div className="relative">
                        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-white/54">
                          <span className="label-caps !text-[10px] rounded-full border border-white/12 bg-white/[0.045] px-3 py-1.5">
                            {a.category}
                          </span>
                          <span>·</span>
                          <span>{a.readMinutes} min</span>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline">{formatDate(a.publishedDate)}</span>
                        </div>
                        <h3 className={`font-display font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-blue-100 ${wide ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>
                          {a.title}
                        </h3>
                        <p className={`mt-4 text-sm leading-relaxed text-white/62 ${wide ? "line-clamp-2 max-w-3xl" : "line-clamp-3"}`}>
                          {a.intro}
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-100/88">
                          Läs artikeln
                          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[1.65rem] border border-white/12 bg-white/[0.06] p-6 backdrop-blur-2xl">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl border border-blue-300/25 bg-blue-400/10 text-blue-100">
                    <BookOpen size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">Senast publicerat</p>
                    <p className="text-xs text-white/50">Direkt från Aurora Media</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {latest.map((article, index) => (
                    <Link key={article.slug} to={`/blogg/${article.slug}`} className="group block rounded-2xl border border-white/10 bg-black/22 p-4 transition hover:border-blue-300/30 hover:bg-blue-400/10">
                      <p className="text-xs font-bold text-blue-100/75">0{index + 1}</p>
                      <p className="mt-1 text-sm font-semibold leading-snug text-white/84 group-hover:text-white">{article.title}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.65rem] border border-white/12 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(168,85,247,0.14),rgba(236,72,153,0.1))] p-6 backdrop-blur-2xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-blue-100">
                  <TrendingUp size={19} />
                </div>
                <p className="label-caps mb-4">Vill du bygga?</p>
                <h3 className="font-display text-2xl font-bold leading-tight text-white">
                  Har du en SaaS-idé som behöver bli verklig?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/64">
                  Prototyp från 14 900 kr. MVP från 34 900 kr. Fast pris och kod du äger.
                </p>
                <Link
                  to="/kontakt"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/18 bg-white/12 px-5 py-3 text-sm font-bold text-white backdrop-blur-xl transition hover:border-blue-300/45 hover:bg-blue-400/15"
                >
                  Starta ett projekt
                  <ArrowRight size={15} />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
