import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import FinalCTASection from "@/components/FinalCTASection";
import {
  setSEOMeta,
  setBreadcrumb,
  removeJsonLd,
  setJsonLd,
  SITE_URL,
} from "@/lib/seoHelpers";
import { cn } from "@/lib/utils";
import {
  getPortfolioBySlug,
  getRelatedPortfolio,
  CATEGORY_LABEL,
  CATEGORY_BADGE,
  STATUS_LABEL,
  STATUS_DOT,
} from "@/data/portfolio";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

const CasePage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const project = getPortfolioBySlug(slug);

  useEffect(() => {
    if (!project) return;
    setSEOMeta({
      title: `${project.name} – Case | Aurora Media`,
      description: project.description,
      canonical: `/arbete/${project.slug}`,
      ogType: "article",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Arbete", url: "/arbete" },
      { name: project.name, url: `/arbete/${project.slug}` },
    ]);
    setJsonLd("case-creativework", {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: project.name,
      url: `${SITE_URL}/arbete/${project.slug}`,
      description: project.description,
      creator: { "@id": `${SITE_URL}/#organization` },
      keywords: project.stack.join(", "),
    });
    return () => {
      removeJsonLd("breadcrumb-jsonld");
      removeJsonLd("case-creativework");
    };
  }, [project]);

  if (!project) {
    return <Navigate to="/arbete" replace />;
  }

  const related = getRelatedPortfolio(project.slug, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Back-link */}
        <div className="container mx-auto max-w-5xl px-6 pt-10">
          <Link
            to="/arbete"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till arbete
          </Link>
        </div>

        {/* Hero */}
        <section className="pt-8 pb-12 md:pt-12 md:pb-16">
          <div className="container mx-auto max-w-5xl px-6">
            <motion.div {...fadeUp}>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                    CATEGORY_BADGE[project.category],
                  )}
                >
                  {CATEGORY_LABEL[project.category]}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[project.status])} />
                  {STATUS_LABEL[project.status]}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  · {project.type}
                </span>
              </div>

              <h1 className="mt-5 font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-[-0.02em]">
                {project.name}
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                {project.tagline}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground py-2 pl-5 pr-2 text-sm text-background transition-all hover:shadow-lg"
                >
                  <span className="font-medium">Besök {project.domain}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Screenshot / Placeholder */}
        <section className="pb-16 md:pb-24">
          <div className="container mx-auto max-w-5xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
              className="bezel-shell"
            >
              <div className="bezel-core overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                    {project.domain}
                  </span>
                </div>
                {project.screenshot ? (
                  <img
                    src={project.screenshot}
                    alt={`Skärmavbild av ${project.name}`}
                    className="aspect-[4/3] w-full object-cover md:aspect-[16/10]"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-secondary via-accent/40 to-secondary md:aspect-[16/10]">
                    <div className="text-center">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Preview
                      </p>
                      <p className="mt-3 font-serif text-3xl text-foreground/70 md:text-6xl">
                        {project.domain}
                      </p>
                    </div>
                    <span className="absolute bottom-4 right-4 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
                      Skärmavbild kommer
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content grid */}
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto max-w-5xl px-6">
            <div className="grid gap-12 md:grid-cols-3 md:gap-16">
              {/* Vänster: prosa */}
              <div className="md:col-span-2 space-y-12">
                {project.problem && (
                  <div>
                    <p className="label-caps">Problemet</p>
                    <p className="mt-4 text-lg leading-relaxed text-foreground/85">
                      {project.problem}
                    </p>
                  </div>
                )}

                {project.solution && (
                  <div>
                    <p className="label-caps">Vad jag gjorde</p>
                    <p className="mt-4 text-lg leading-relaxed text-foreground/85">
                      {project.solution}
                    </p>
                  </div>
                )}

                {project.lessons && (
                  <div>
                    <p className="label-caps">Lärdomar</p>
                    <p className="mt-4 text-lg leading-relaxed text-foreground/85">
                      {project.lessons}
                    </p>
                  </div>
                )}
              </div>

              {/* Höger: meta */}
              <aside className="space-y-8 md:sticky md:top-24 md:self-start">
                <div>
                  <p className="label-caps">Teknisk stack</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>

                {project.buildTime && (
                  <div>
                    <p className="label-caps">Leveranstid</p>
                    <p className="mt-3 font-serif text-2xl">{project.buildTime}</p>
                  </div>
                )}

                {project.results && project.results.length > 0 && (
                  <div>
                    <p className="label-caps">Resultat</p>
                    <ul className="mt-4 space-y-3">
                      {project.results.map((r) => (
                        <li key={r.label} className="border-t border-border pt-3">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            {r.label}
                          </p>
                          <p className="mt-1 font-serif text-xl">{r.value}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="label-caps">Live på</p>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 font-mono text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {project.domain}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-border py-20 md:py-28">
            <div className="container mx-auto max-w-5xl px-6">
              <p className="label-caps">Andra projekt</p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">Mer arbete i samma anda</h2>

              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/arbete/${r.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                  >
                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                        CATEGORY_BADGE[r.category],
                      )}
                    >
                      {CATEGORY_LABEL[r.category]}
                    </span>
                    <h3 className="mt-4 font-serif text-2xl">{r.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{r.tagline}</p>
                    <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Läs caset
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <FinalCTASection />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default CasePage;
