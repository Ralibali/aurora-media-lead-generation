import { useEffect, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

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
  const { open } = useContactModal();

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
    <NordicLayout>
      {/* Hero */}
      <section className="page-hero">
        <div className="wrap">
          <Reveal>
            <p className="mono">{(props.label ?? props.title).toLowerCase()} · fast scope · kod ni äger</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "20ch" }}>
              {props.title}
              {props.titleEm && <> <span className="it">{props.titleEm}</span></>}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>{props.intro}</p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => open()} className="btn btn-moss">
                Boka genomgång <span className="a"><ArrowRight size={14} /></span>
              </button>
              <a href="/priser" className="btn btn-ghost">Se priser</a>
            </div>
          </Reveal>
          <Reveal delay={0.35}>
            <div style={{ marginTop: 14 }}>
              <span className="risk-note">30 min · Kostnadsfritt · Ingen säljpitch efteråt</span>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="stack-strip" style={{ marginTop: 24 }}>
              {["React", "TypeScript", "Supabase", "Stripe", "OpenAI", "Vercel"].map((s) => (
                <span key={s} className="stack-chip"><span className="dot" /> {s}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Vad ingår */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Vad som ingår</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Det här <span className="it">levereras</span>.</h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {props.includes.map((item, i) => (
              <Reveal key={item} delay={i * 0.04}>
                <div className="feat-row" style={{ gridTemplateColumns: "60px 1fr" }}>
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-body">{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Så jobbar vi</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2"><span className="it">Process</span> utan onödiga möten.</h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {props.process.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.05}>
                <div className="feat-row">
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-title">{step.title}</span>
                  <span className="feat-body">{step.body}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {props.faqs.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <Reveal><div className="meta-label">Vanliga frågor</div></Reveal>
              <Reveal delay={0.1}>
                <h2 className="h2"><span className="it">Frågor</span> vi får ofta.</h2>
              </Reveal>
            </div>
            <div className="feat-list">
              {props.faqs.map((f, i) => (
                <Reveal key={f.q} delay={i * 0.04}>
                  <div className="feat-row">
                    <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="feat-title">{f.q}</span>
                    <span className="feat-body">{f.a}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {props.extra}
      {props.postFaq}

      {/* CTA */}
      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Nästa steg</div>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Redo att <span className="it">komma igång?</span>
          </h2>
          <p className="lead" style={{ marginTop: 22 }}>Berätta om projektet — konkret förslag inom 24 timmar.</p>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Kontakta oss <span className="a"><ArrowRight size={14} /></span>
          </button>
          <div style={{ marginTop: 18 }}>
            <span className="risk-note">Svar inom 24 h · Inget avtal krävs · GDPR & EU-datalagring</span>
          </div>
        </div>
      </section>
    </NordicLayout>
  );
};

export default ServicePageTemplate;
