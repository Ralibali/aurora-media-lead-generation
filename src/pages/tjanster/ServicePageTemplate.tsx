import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

const RULE = {
  height: "0.5px",
  background: "rgba(237,233,220,0.12)",
  marginBottom: "clamp(40px,6vw,64px)",
} as const;

const eyebrow = {
  fontFamily: M,
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "rgba(237,233,220,0.35)",
  marginBottom: 16,
};

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

const ServicePageTemplate = (props: ServicePageProps) => {
  useEffect(() => {
    setSEOMeta({
      title: props.seoTitle,
      description: props.seoDescription,
      canonical: `/tjanster/${props.slug}`,
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: props.label ?? props.title, url: `/tjanster/${props.slug}` },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, [props.slug, props.seoTitle, props.seoDescription, props.title, props.label]);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a
        href="#main"
        className="skip-link"
        style={{
          position: "absolute",
          left: -9999,
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        Hoppa till innehåll
      </a>
      <SiteHeader />
      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="wrap"
          style={{
            paddingTop: "clamp(120px,14vw,160px)",
            paddingBottom: "clamp(64px,8vw,96px)",
          }}
        >
          <p style={eyebrow}>{props.label ?? props.title}</p>
          <h1
            style={{
              fontFamily: F,
              fontSize: "clamp(2.8rem,6vw,5.5rem)",
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: C,
              maxWidth: 820,
              marginBottom: "clamp(20px,3vw,32px)",
            }}
          >
            {props.title}
            {props.titleEm && (
              <em
                style={{
                  display: "block",
                  fontStyle: "italic",
                  color: "rgba(237,233,220,0.65)",
                }}
              >
                {props.titleEm}
              </em>
            )}
          </h1>
          <p
            style={{
              fontFamily: I,
              fontSize: "clamp(1rem,1.8vw,1.2rem)",
              color: "rgba(237,233,220,0.60)",
              lineHeight: 1.7,
              maxWidth: 640,
              marginBottom: "clamp(32px,4vw,48px)",
            }}
          >
            {props.intro}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/kontakt" className="btn-primary">
              Boka genomgång →
            </Link>
            <Link to="/priser" className="btn-ghost">
              Se priser
            </Link>
          </div>
        </section>

        {/* ── Features / Vad som ingår ─────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "clamp(64px,8vw,96px)" }}>
          <div style={RULE} />
          <p style={eyebrow}>vad som ingår</p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {props.includes.map((item, i) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 20,
                }}
              >
                <span
                  style={{
                    fontFamily: M,
                    fontSize: 10,
                    color: "rgba(237,233,220,0.25)",
                    letterSpacing: "0.05em",
                    minWidth: 24,
                    paddingTop: 3,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontFamily: I,
                    fontSize: "clamp(0.9rem,1.4vw,1rem)",
                    color: "rgba(237,233,220,0.72)",
                    lineHeight: 1.6,
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Process / Så jobbar vi ───────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "clamp(64px,8vw,96px)" }}>
          <div style={RULE} />
          <p style={eyebrow}>så jobbar vi</p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              borderTop: "0.5px solid rgba(237,233,220,0.10)",
            }}
          >
            {props.process.map((step, i) => (
              <div
                key={step.title}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 2fr",
                  gap: "clamp(16px,2vw,32px)",
                  padding: "clamp(20px,3vw,28px) 0",
                  borderBottom: "0.5px solid rgba(237,233,220,0.10)",
                  alignItems: "start",
                }}
              >
                <span
                  style={{
                    fontFamily: M,
                    fontSize: 10,
                    color: "rgba(237,233,220,0.25)",
                    letterSpacing: "0.05em",
                    paddingTop: 3,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontFamily: F,
                    fontSize: "clamp(1rem,1.6vw,1.15rem)",
                    fontWeight: 400,
                    color: C,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {step.title}
                </span>
                <span
                  style={{
                    fontFamily: I,
                    fontSize: "clamp(0.875rem,1.3vw,0.95rem)",
                    color: "rgba(237,233,220,0.55)",
                    lineHeight: 1.65,
                  }}
                >
                  {step.body}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "clamp(80px,10vw,120px)" }}>
          <div style={RULE} />
          <h2
            style={{
              fontFamily: F,
              fontSize: "clamp(2rem,4vw,3.2rem)",
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: "-0.02em",
              color: C,
              maxWidth: 600,
              marginBottom: "clamp(16px,2vw,24px)",
              lineHeight: 1.15,
            }}
          >
            Redo att komma igång?
          </h2>
          <p
            style={{
              fontFamily: I,
              fontSize: "clamp(0.95rem,1.5vw,1.05rem)",
              color: "rgba(237,233,220,0.55)",
              lineHeight: 1.7,
              maxWidth: 520,
              marginBottom: "clamp(24px,3vw,36px)",
            }}
          >
            Berätta om ditt projekt så återkommer jag med ett konkret förslag inom 24 timmar.
          </p>
          <Link to="/kontakt" className="btn-primary">
            Kontakta mig →
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default ServicePageTemplate;
