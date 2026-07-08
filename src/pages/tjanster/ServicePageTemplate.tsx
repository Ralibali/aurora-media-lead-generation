import { useEffect, type ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import { Reveal, VkNav, VkFooter } from "@/pages/Index";
import { setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";
import "@/styles/verkstad.css";

export type ServiceTier = {
  name: string;
  price: string;
  time: string;
  desc?: string;
  features?: string[];
  featured?: boolean;
  paketValue?: string;
};

export type RelatedService = {
  name: string;
  price: string;
  to: string;
};

export type ServicePageProps = {
  slug: string;
  label?: string;
  title: string;
  titleEm?: string;
  intro: string;
  paketName: string;
  seoTitle: string;
  seoDescription: string;
  includes: string[];
  process: { label: string; title: string; body: string }[];
  tiers?: ServiceTier[];
  pricingNote?: ReactNode;
  whyAffordable: string;
  faqs: { q: string; a: string; category?: string }[];
  related: RelatedService[];
  extra?: ReactNode;
  postFaq?: ReactNode;
};

const italic = { fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic" as const, fontWeight: 500, color: "var(--gran)" };

const ServicePageTemplate = (props: ServicePageProps) => {
  const { open } = useContactModal();

  useEffect(() => {
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: props.label ?? props.title, url: `/tjanster/${props.slug}` },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, [props.slug, props.title, props.label]);

  return (
    <>
      <SEO title={props.seoTitle} description={props.seoDescription} canonical={`/tjanster/${props.slug}`} />
      <div className="verkstad">
        <VkNav />
        <main>
          {/* Hero */}
          <section className="vk-section vk-hero">
            <div className="vk-wrap">
              <Reveal>
                <p className="vk-mono">{(props.label ?? props.title).toLowerCase()} · fast scope · kod ni äger</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 style={{ marginTop: 18, maxWidth: "20ch" }}>
                  {props.title}
                  {props.titleEm && <> <span style={italic}>{props.titleEm}</span></>}
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="vk-hero-sub">{props.intro}</p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="vk-hero-cta">
                  <button onClick={() => open()} className="vk-btn vk-btn-primary">
                    Boka genomgång <ArrowRight size={16} />
                  </button>
                  <a href="/priser" className="vk-btn vk-btn-ghost">Se priser</a>
                </div>
              </Reveal>
              <Reveal delay={0.35}>
                <p className="vk-mono" style={{ marginTop: 18, color: "var(--granbark-mut)" }}>
                  30 min · Kostnadsfritt · Ingen säljpitch efteråt
                </p>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* Vad ingår */}
          <section className="vk-section">
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">Vad som ingår</p></Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ marginTop: 14 }}>Det här <span style={italic}>levereras</span>.</h2>
              </Reveal>
              <div style={{ marginTop: 40, borderTop: "1px solid var(--linje)" }}>
                {props.includes.map((item, i) => (
                  <Reveal key={item} delay={Math.min(i * 0.03, 0.2)}>
                    <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 20, padding: "22px 0", borderBottom: "1px solid var(--linje)", alignItems: "start" }}>
                      <span className="vk-mono" style={{ color: "var(--gran)" }}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontSize: 17, color: "var(--granbark)", lineHeight: 1.55 }}>{item}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* Process */}
          <section className="vk-section">
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">Så jobbar vi</p></Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ marginTop: 14 }}><span style={italic}>Process</span> utan onödiga möten.</h2>
              </Reveal>
              <div style={{ marginTop: 40, borderTop: "1px solid var(--linje)" }}>
                {props.process.map((step, i) => (
                  <Reveal key={step.title} delay={Math.min(i * 0.04, 0.2)}>
                    <div className="process-row" style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 20, padding: "26px 0", borderBottom: "1px solid var(--linje)", alignItems: "start" }}>
                      <span className="vk-mono" style={{ color: "var(--gran)" }}>{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 style={{ marginBottom: 8 }}>{step.title}</h3>
                        <p style={{ fontSize: 16, lineHeight: 1.65, color: "#3E444B" }}>{step.body}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          {props.faqs.length > 0 && (
            <>
              <hr className="vk-hair" />
              <section className="vk-section">
                <div className="vk-wrap">
                  <Reveal><p className="vk-mono">Vanliga frågor</p></Reveal>
                  <Reveal delay={0.05}>
                    <h2 style={{ marginTop: 14 }}><span style={italic}>Frågor</span> vi får ofta.</h2>
                  </Reveal>
                  <div style={{ marginTop: 40, borderTop: "1px solid var(--linje)" }}>
                    {props.faqs.map((f, i) => (
                      <Reveal key={f.q} delay={Math.min(i * 0.03, 0.2)}>
                        <div style={{ padding: "26px 0", borderBottom: "1px solid var(--linje)" }}>
                          <h3 style={{ marginBottom: 10, display: "flex", gap: 16 }}>
                            <span className="vk-mono" style={{ color: "var(--gran)", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                            <span>{f.q}</span>
                          </h3>
                          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3E444B", paddingLeft: 44 }}>{f.a}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {props.related && props.related.length > 0 && (
            <section className="vk-section" style={{ paddingBlock: "clamp(48px, 6vw, 80px)" }}>
              <div className="vk-wrap">
                <p className="vk-mono" style={{ marginBottom: 24 }}>Fler tjänster</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                  {props.related.map((r) => (
                    <li key={r.to}>
                      <a href={r.to} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 22px", border: "1px solid var(--linje)", borderRadius: 12, background: "#fff", color: "var(--granbark)", textDecoration: "none", fontWeight: 600, transition: "border-color .2s, transform .2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gran)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--linje)"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        <span>{r.name}<br /><span className="vk-mono" style={{ color: "var(--granbark-mut)" }}>{r.price}</span></span>
                        <ArrowRight size={16} style={{ color: "var(--gran)", flexShrink: 0 }} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {props.extra}
          {props.postFaq}

          {/* CTA */}
          <section className="vk-dark">
            <div className="vk-wrap">
              <Reveal><p className="vk-mono">Nästa steg</p></Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ marginTop: 14 }}>
                  Redo att{" "}
                  <span style={{ color: "#F6F5F1", fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontWeight: 500 }}>komma igång?</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ marginTop: 20, fontSize: 18, maxWidth: "58ch" }}>Berätta om projektet — konkret förslag inom 24 timmar.</p>
              </Reveal>
              <Reveal delay={0.15}>
                <div style={{ marginTop: 28 }}>
                  <button onClick={() => open()} className="vk-btn vk-btn-primary">
                    Kontakta oss <ArrowRight size={16} />
                  </button>
                </div>
              </Reveal>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default ServicePageTemplate;

// Legacy shim for pages that used to import Check from the template context.
export { Check };
