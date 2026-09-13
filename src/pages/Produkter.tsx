import { useEffect } from "react";
import { ArrowRight, ArrowUpRight, Boxes, Check, Network } from "lucide-react";
import { Link } from "react-router-dom";

import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { AURORA_PRODUCTS, PRODUCT_GROUPS, PRODUCT_STATUS_LABEL, type AuroraProduct, type AuroraProductGroup } from "@/data/products";
import { setSEOMeta } from "@/lib/seoHelpers";

const GROUP_ORDER: AuroraProductGroup[] = ["platform", "vertical", "venture"];

const ProductLink = ({ product }: { product: AuroraProduct }) => {
  const content = <>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
      <div>
        <span className="mono" style={{ color: "var(--moss)" }}>{PRODUCT_STATUS_LABEL[product.status]}</span>
        <h3 style={{ marginTop: 10 }}>{product.name}</h3>
      </div>
      <ArrowUpRight size={17} style={{ color: "var(--moss)", flexShrink: 0 }} />
    </div>
    <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--moss-soft)", fontSize: 15, marginTop: 8 }}>{product.tagline}</p>
    <p className="body" style={{ marginTop: 14 }}>{product.description}</p>
    <div style={{ marginTop: "auto", paddingTop: 20 }}>
      {product.tags.map((tag) => <span key={tag} className="pill">{tag}</span>)}
    </div>
  </>;
  const style = { display: "flex", flexDirection: "column" } as const;

  return product.external
    ? <a href={product.href} target="_blank" rel="noopener noreferrer" className="work-card" style={style}>{content}</a>
    : <Link to={product.href} className="work-card" style={style}>{content}</Link>;
};

const Produkter = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "Produkter och plattformar | Aurora Media AB",
      description: "Utforska Aurora Medias gemensamma plattform, branschsystem och egna digitala produkter – från Aurora Care till Aurora Transport och StayBoost.",
      canonical: "/produkter",
      ogImage: "/og-image-sv.jpg",
    });
  }, []);

  const liveCount = AURORA_PRODUCTS.filter((product) => product.status === "live").length;

  return <NordicLayout>
    <main id="main">
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">Aurora Media AB · produktportfölj</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "18ch" }}>Ett bolag. Flera produkter. <span className="it">En tydlig helhet.</span></h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24, maxWidth: 760 }}>Aurora Media är paraplyet. Gemensamma tjänster möts i Aurora Care, medan branschplattformar och egna varumärken behåller de arbetsflöden som gör dem värdefulla.</p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ display: "flex", gap: "clamp(28px,5vw,64px)", flexWrap: "wrap", marginTop: 42 }}>
              <div><span className="stat-num bone">{AURORA_PRODUCTS.length}</span><p className="kicker" style={{ marginTop: 6 }}>publika produkter</p></div>
              <div><span className="stat-num bone">{liveCount}</span><p className="kicker" style={{ marginTop: 6 }}>i drift</p></div>
              <div><span className="stat-num bone">1</span><p className="kicker" style={{ marginTop: 6 }}>kommersiellt paraply</p></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="surface surface-pad featured" style={{ display: "grid", gap: 28, gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))" }}>
            <div><p className="eyebrow">Så hänger det ihop</p><h2 className="h3" style={{ marginTop: 12 }}>Gemensam ingång utan en enda jätteapp</h2></div>
            <div className="body" style={{ display: "grid", gap: 12 }}>
              <p style={{ display: "flex", gap: 10 }}><Network size={18} style={{ color: "var(--moss)", flexShrink: 0, marginTop: 2 }} />auroramedia.se visar och säljer hela erbjudandet.</p>
              <p style={{ display: "flex", gap: 10 }}><Boxes size={18} style={{ color: "var(--moss)", flexShrink: 0, marginTop: 2 }} />Aurora Care blir kontrollpanel för gemensamma kundtjänster.</p>
              <p style={{ display: "flex", gap: 10 }}><Check size={18} style={{ color: "var(--moss)", flexShrink: 0, marginTop: 2 }} />Specialistprodukterna behåller egen kod, data och domän.</p>
            </div>
          </div>
        </div>
      </section>

      {GROUP_ORDER.map((group) => {
        const meta = PRODUCT_GROUPS[group];
        const products = AURORA_PRODUCTS.filter((product) => product.group === group);
        return <section key={group} className="section">
          <div className="wrap">
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", alignItems: "end", marginBottom: 34 }}>
              <div><p className="mono">{meta.eyebrow} · {products.length}</p><h2 className="h2" style={{ marginTop: 12 }}>{meta.title}</h2></div>
              <p className="body" style={{ maxWidth: 620 }}>{meta.description}</p>
            </div>
            <div className="work-grid">{products.map((product) => <ProductLink key={product.name} product={product} />)}</div>
          </div>
        </section>;
      })}

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Kundprojekt och leveranser</div>
          <h2 className="h2" style={{ marginTop: 18 }}>Se även det vi har byggt <span className="it">åt andra.</span></h2>
          <p className="lead" style={{ marginTop: 22 }}>Kundsajter, utvecklingsuppdrag och verifierade case ligger samlade under Arbete.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            <Link to="/arbete" className="btn btn-moss">Se alla case <span className="a"><ArrowRight size={14} /></span></Link>
            <button onClick={() => open()} className="btn">Diskutera ett projekt</button>
          </div>
        </div>
      </section>
    </main>
  </NordicLayout>;
};

export default Produkter;
