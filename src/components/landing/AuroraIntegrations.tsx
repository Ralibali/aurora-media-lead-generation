import { Plus, ArrowRight } from "lucide-react";

type Integration = {
  name: string;
  initial: string;
  color: string;
  textDark?: boolean;
};

const ROW_1: Integration[] = [
  { name: "Stripe",         initial: "St",  color: "#635BFF" },
  { name: "Klarna",         initial: "K",   color: "#FFA8CD", textDark: true },
  { name: "Swish",          initial: "S",   color: "#EE2A7B" },
  { name: "PayPal",         initial: "PP",  color: "#003087" },
  { name: "Adyen",          initial: "A",   color: "#0ABF53" },
  { name: "BankID",         initial: "BID", color: "#193E8F" },
  { name: "Fortnox",        initial: "F",   color: "#005A45" },
  { name: "Visma",          initial: "V",   color: "#E1251B" },
  { name: "Bokio",          initial: "B",   color: "#00C896" },
  { name: "Stripe Connect", initial: "SC",  color: "#635BFF" },
  { name: "Auth0",          initial: "A0",  color: "#EB5424" },
  { name: "Clerk",          initial: "Cl",  color: "#6C47FF" },
];

const ROW_2: Integration[] = [
  { name: "Slack",            initial: "Sl", color: "#4A154B" },
  { name: "Microsoft 365",    initial: "M",  color: "#0078D4" },
  { name: "Google Workspace", initial: "G",  color: "#4285F4" },
  { name: "Microsoft Teams",  initial: "T",  color: "#6264A7" },
  { name: "Mailchimp",        initial: "MC", color: "#FFE01B", textDark: true },
  { name: "Klaviyo",          initial: "Kl", color: "#232627" },
  { name: "HubSpot",          initial: "HS", color: "#FF7A59" },
  { name: "ActiveCampaign",   initial: "AC", color: "#356AE6" },
  { name: "Meta Ads",         initial: "M",  color: "#0467DF" },
  { name: "Google Ads",       initial: "G",  color: "#4285F4" },
  { name: "Shopify",          initial: "Sh", color: "#7AB55C" },
  { name: "WooCommerce",      initial: "Wo", color: "#96588A" },
  { name: "WordPress",        initial: "WP", color: "#21759B" },
  { name: "Webflow",          initial: "Wf", color: "#146EF5" },
];

const ROW_3: Integration[] = [
  { name: "OpenAI",        initial: "AI", color: "#10A37F" },
  { name: "Anthropic",     initial: "An", color: "#D97757" },
  { name: "Google Gemini", initial: "G",  color: "#1B72E8" },
  { name: "Mistral AI",    initial: "Mi", color: "#FF7000" },
  { name: "ElevenLabs",    initial: "11", color: "#000000" },
  { name: "Supabase",      initial: "Sb", color: "#3FCF8E" },
  { name: "Vercel",        initial: "V",  color: "#000000" },
  { name: "Cloudflare",    initial: "Cf", color: "#F38020" },
  { name: "AWS",           initial: "AW", color: "#FF9900" },
  { name: "Firebase",      initial: "Fb", color: "#FFCA28", textDark: true },
  { name: "Twilio",        initial: "Tw", color: "#F22F46" },
  { name: "46elks",        initial: "46", color: "#0066FF" },
  { name: "Zapier",        initial: "Z",  color: "#FF4A00" },
  { name: "Make",          initial: "Mk", color: "#6D00CC" },
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

const IntegrationLogo = ({ logo }: { logo: Integration }) => (
  <span
    aria-hidden
    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg font-display font-bold"
    style={{
      background: logo.color,
      color: logo.textDark ? "#0a0f0d" : "#ffffff",
      fontSize: logo.initial.length >= 3 ? "9px" : logo.initial.length === 2 ? "11px" : "13px",
      letterSpacing: "-0.02em",
      lineHeight: 1,
    }}
  >
    {logo.initial}
  </span>
);

const Row = ({ logos, animClass }: { logos: Integration[]; animClass: string }) => {
  // Duplicate the list for a seamless infinite loop
  const items = [...logos, ...logos];
  return (
    <div className="au-marquee-wrap au-marquee-mask group relative overflow-hidden">
      <div className={`au-marquee-track ${animClass} gap-3`}>
        {items.map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="au-logo-pill"
            aria-hidden={i >= logos.length}
          >
            <IntegrationLogo logo={logo} />
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
