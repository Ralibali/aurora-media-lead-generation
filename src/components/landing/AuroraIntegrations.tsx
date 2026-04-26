import { Plus, ArrowRight } from "lucide-react";

type Logo =
  | { name: string; kind: "simple"; slug: string; hex: string; darkText?: boolean; darkBg?: boolean }
  | { name: string; kind: "custom"; bg: string; label: string; fg?: string; smallText?: boolean };

const ROW_1: Logo[] = [
  { name: "Stripe",         kind: "simple", slug: "stripe",        hex: "635BFF" },
  { name: "Klarna",         kind: "simple", slug: "klarna",        hex: "FFA8CD", darkText: true },
  { name: "Swish",          kind: "custom", bg: "#EE2A7B",         label: "S" },
  { name: "PayPal",         kind: "simple", slug: "paypal",        hex: "003087" },
  { name: "Adyen",          kind: "simple", slug: "adyen",         hex: "0ABF53" },
  { name: "BankID",         kind: "custom", bg: "#193E8F",         label: "BID", smallText: true },
  { name: "Fortnox",        kind: "custom", bg: "#005A45",         label: "F" },
  { name: "Visma",          kind: "custom", bg: "#E1251B",         label: "V" },
  { name: "Bokio",          kind: "custom", bg: "#00C896",         label: "B" },
  { name: "Stripe Connect", kind: "simple", slug: "stripe",        hex: "635BFF" },
  { name: "Auth0",          kind: "simple", slug: "auth0",         hex: "EB5424" },
  { name: "Clerk",          kind: "simple", slug: "clerk",         hex: "6C47FF" },
];

const ROW_2: Logo[] = [
  { name: "Slack",            kind: "simple", slug: "slack",            hex: "4A154B" },
  { name: "Microsoft 365",    kind: "simple", slug: "microsoft",        hex: "5E5E5E" },
  { name: "Google Workspace", kind: "simple", slug: "google",           hex: "4285F4" },
  { name: "Microsoft Teams",  kind: "simple", slug: "microsoftteams",   hex: "6264A7" },
  { name: "Mailchimp",        kind: "simple", slug: "mailchimp",        hex: "FFE01B", darkText: true },
  { name: "Klaviyo",          kind: "simple", slug: "klaviyo",          hex: "232627" },
  { name: "HubSpot",          kind: "simple", slug: "hubspot",          hex: "FF7A59" },
  { name: "ActiveCampaign",   kind: "simple", slug: "activecampaign",   hex: "356AE6" },
  { name: "Meta Ads",         kind: "simple", slug: "meta",             hex: "0467DF" },
  { name: "Google Ads",       kind: "custom", bg: "#4285F4",            label: "G" },
  { name: "Shopify",          kind: "simple", slug: "shopify",          hex: "7AB55C" },
  { name: "WooCommerce",      kind: "simple", slug: "woocommerce",      hex: "96588A" },
  { name: "WordPress",        kind: "simple", slug: "wordpress",        hex: "21759B" },
  { name: "Webflow",          kind: "simple", slug: "webflow",          hex: "146EF5" },
];

const ROW_3: Logo[] = [
  { name: "OpenAI",        kind: "simple", slug: "openai",      hex: "412991" },
  { name: "Anthropic",     kind: "simple", slug: "anthropic",   hex: "D97757" },
  { name: "Google Gemini", kind: "custom", bg: "#1B72E8",       label: "G" },
  { name: "Mistral AI",    kind: "custom", bg: "#FF7000",       label: "M" },
  { name: "ElevenLabs",    kind: "custom", bg: "#000000",       label: "11" },
  { name: "Supabase",      kind: "simple", slug: "supabase",    hex: "3FCF8E" },
  { name: "Vercel",        kind: "simple", slug: "vercel",      hex: "FFFFFF", darkBg: true },
  { name: "Cloudflare",    kind: "simple", slug: "cloudflare",  hex: "F38020" },
  { name: "AWS",           kind: "simple", slug: "amazonaws",   hex: "232F3E" },
  { name: "Firebase",      kind: "simple", slug: "firebase",    hex: "FFCA28" },
  { name: "Twilio",        kind: "simple", slug: "twilio",      hex: "F22F46" },
  { name: "46elks",        kind: "custom", bg: "#0066FF",       label: "46" },
  { name: "Zapier",        kind: "simple", slug: "zapier",      hex: "FF4A00" },
  { name: "Make",          kind: "simple", slug: "make",        hex: "6D00CC" },
];

const CATEGORIES: { name: string; tools: string }[] = [
  { name: "Ekonomi",          tools: "Fortnox, Visma, Bokio" },
  { name: "Betalning",        tools: "Stripe, Klarna, Swish, PayPal, Adyen" },
  { name: "Auth & ID",        tools: "BankID, Auth0, Clerk" },
  { name: "Kommunikation",    tools: "Slack, Microsoft 365, Teams, Google Workspace" },
  { name: "E-post & SMS",     tools: "Mailgun, Resend, Postmark, Twilio, 46elks" },
  { name: "Marknadsföring",   tools: "Meta Ads, Google Ads, Mailchimp, Klaviyo, HubSpot, ActiveCampaign" },
  { name: "E-handel & CMS",   tools: "Shopify, WooCommerce, WordPress, Webflow, Strapi" },
  { name: "AI",               tools: "OpenAI, Anthropic, Google Gemini, Mistral, ElevenLabs" },
  { name: "Backend & hosting",tools: "Supabase, Vercel, Cloudflare, AWS, Firebase" },
  { name: "Automation",       tools: "Zapier, Make, n8n" },
  { name: "CRM",              tools: "Pipedrive, HubSpot, Salesforce" },
  { name: "Övrigt",           tools: "Google Maps, Calendly, Notion, Airtable, Linear, Sentry" },
];

const LogoMark = ({ logo }: { logo: Logo }) => {
  if (logo.kind === "simple") {
    const wrapBg = logo.darkBg ? "#0a0a0a" : "transparent";
    return (
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md"
        style={{ background: wrapBg }}
      >
        <img
          src={`https://cdn.simpleicons.org/${logo.slug}/${logo.hex}`}
          alt=""
          width={22}
          height={22}
          loading="lazy"
          className="h-[22px] w-[22px] object-contain"
        />
      </span>
    );
  }
  return (
    <span
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md font-display font-bold"
      style={{
        background: logo.bg,
        color: logo.fg ?? "#fff",
        fontSize: logo.smallText ? "9px" : "12px",
        letterSpacing: "-0.02em",
      }}
    >
      {logo.label}
    </span>
  );
};

const Row = ({ logos, animClass }: { logos: Logo[]; animClass: string }) => {
  // Duplicate the list for seamless loop
  const items = [...logos, ...logos];
  return (
    <div className="au-marquee-wrap au-marquee-mask group relative overflow-hidden">
      <div className={`au-marquee-track ${animClass} gap-3`}>
        {items.map((logo, i) => (
          <div key={`${logo.name}-${i}`} className="au-logo-pill">
            <LogoMark logo={logo} />
            <span className="text-sm font-medium text-[hsl(var(--au-cream)/0.9)]">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AuroraIntegrations = () => (
  <section id="integrationer" className="aurora-section-bg relative overflow-hidden py-24 md:py-32">
    <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="au-eyebrow">INTEGRATIONER</p>
          <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.035em]">
            Sömlöst kopplat till din{" "}
            <span style={{ color: "hsl(152 80% 60%)" }}>verksamhet.</span>
          </h2>
        </div>
        <div className="lg:col-span-7 lg:pt-2">
          <p className="text-base leading-relaxed text-[hsl(var(--au-cream)/0.7)] md:text-lg">
            Vi bygger anpassade integrationer mot REST/GraphQL-API:er, OAuth
            2.0-flöden och webhooks. Det här är bara ett urval — kan ditt
            verktyg prata API, kan vi koppla det.
          </p>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="mt-14 flex flex-col gap-3">
        <Row logos={ROW_1} animClass="au-marquee-left" />
        <Row logos={ROW_2} animClass="au-marquee-right" />
        <Row logos={ROW_3} animClass="au-marquee-slow" />
      </div>

      {/* Category grid */}
      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "hsl(152 80% 60%)" }}
              />
              <p
                className="font-mono-au text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "hsl(152 80% 65%)" }}
              >
                {cat.name}
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--au-cream)/0.7)]">
              {cat.tools}
            </p>
          </div>
        ))}
      </div>

      {/* Callout */}
      <div
        className="mt-12 flex flex-col items-start gap-5 rounded-2xl px-6 py-6 sm:flex-row sm:items-center"
        style={{
          background: "hsl(152 80% 48% / 0.06)",
          border: "1px solid hsl(152 80% 48% / 0.25)",
        }}
      >
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
          style={{
            background: "hsl(152 80% 48% / 0.14)",
            border: "1px solid hsl(152 80% 48% / 0.35)",
            color: "hsl(152 80% 70%)",
          }}
        >
          <Plus size={22} strokeWidth={2.5} />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-[hsl(var(--au-cream))]">
            Alla verktyg du inte ser
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--au-cream)/0.7)]">
            Om ditt system pratar API, kan vi koppla det. OAuth 2.0, REST,
            GraphQL, webhooks — vi bygger anpassade integrationer på begäran.
          </p>
        </div>
        <a
          href="#kontakt"
          className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold transition-transform hover:translate-x-0.5"
          style={{ color: "hsl(152 80% 65%)" }}
        >
          Diskutera din integration
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  </section>
);

export default AuroraIntegrations;
