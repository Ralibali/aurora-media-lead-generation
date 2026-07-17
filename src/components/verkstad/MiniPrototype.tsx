import { useMemo, type FC } from "react";

/* ── Miniatyrprototyp: en riktig liten hemsida genererad av besökarens idé ── */

export type ProtoBranch =
  | "transport"
  | "ehandel"
  | "bokning"
  | "bygg"
  | "restaurang"
  | "ekonomi"
  | "saas";

type ProtoContent = {
  nav: string[];
  cta: string;
  kicker: string;
  heroTitle: string;
  heroSub: string;
  defaultName: string;
};

const CONTENT: Record<ProtoBranch, ProtoContent> = {
  transport: {
    nav: ["Tjänster", "Spårning", "Priser"],
    cta: "Boka transport",
    kicker: "Dispatch · Fortnox · ETA",
    heroTitle: "Körorder utan Excel-kaos.",
    heroSub: "Alla uppdrag, chaufförer och fakturor i ett system – uppdaterat i realtid.",
    defaultName: "Nordic Åkeri",
  },
  ehandel: {
    nav: ["Produkter", "Om oss", "Kontakt"],
    cta: "Handla nu",
    kicker: "Fri frakt över 800 kr",
    heroTitle: "Handgjort. Levererat.",
    heroSub: "Varje produkt tillverkas på beställning – och betalas smidigt online.",
    defaultName: "Snickeri & Co",
  },
  bokning: {
    nav: ["Tjänster", "Priser", "Om oss"],
    cta: "Boka tid",
    kicker: "Svar direkt · Betala online",
    heroTitle: "Boka på 30 sekunder.",
    heroSub: "Välj tjänst, tid och betala – bekräftelse och påminnelse skickas automatiskt.",
    defaultName: "Rent & Klart",
  },
  bygg: {
    nav: ["Tjänster", "Referenser", "ROT"],
    cta: "Få offert",
    kicker: "Offert inom 24 h",
    heroTitle: "Offert på 5 minuter.",
    heroSub: "Beskriv jobbet, få pris direkt – med ROT-avdraget uträknat automatiskt.",
    defaultName: "Bygg & Fix",
  },
  restaurang: {
    nav: ["Meny", "Boka bord", "Hitta hit"],
    cta: "Boka bord",
    kicker: "Öppet idag 11–22",
    heroTitle: "Boka bord. Beställ mat.",
    heroSub: "Se kvällens meny, boka bord och förbeställ – allt innan ni kliver in.",
    defaultName: "Bord & Bar",
  },
  ekonomi: {
    nav: ["Tjänster", "Portalen", "Priser"],
    cta: "Logga in",
    kicker: "Fortnox-integrerat",
    heroTitle: "Alla kvitton. Noll stress.",
    heroSub: "Ladda upp, godkänn, klart – er ekonomi sköter sig själv i portalen.",
    defaultName: "Ekonomi & Co",
  },
  saas: {
    nav: ["Funktioner", "Priser", "Logga in"],
    cta: "Starta gratis",
    kicker: "Klart på 2 minuter",
    heroTitle: "Hela flödet. Ett verktyg.",
    heroSub: "Samla teamet, datan och automationerna – byggd för att användas varje dag.",
    defaultName: "FlowOS",
  },
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/[ä]/g, "a")
    .replace(/[ö]/g, "o")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24) || "dittbolag";

export const protoDefaultName = (branch: ProtoBranch): string =>
  (CONTENT[branch] || CONTENT.saas).defaultName;

/* ── Branschspecifika modul-mockar ── */

const BookingMock = () => (
  <div className="vk-proto-mock">
    <div className="vk-proto-mocktitle">Välj tid denna vecka</div>
    <div className="vk-proto-week">
      {["Mån", "Tis", "Ons", "Tor", "Fre"].map((d, i) => (
        <div key={d} className={`vk-proto-day ${i === 2 ? "active" : ""}`}>
          <span>{d}</span>
          <b>{i === 2 ? "10:00" : ["09:00", "13:00", "11:30", "15:00", "08:30"][i]}</b>
          {i === 2 && <em>Ledig</em>}
        </div>
      ))}
    </div>
    <div className="vk-proto-btn">Bekräfta & betala →</div>
  </div>
);

const ShopMock = () => (
  <div className="vk-proto-mock">
    <div className="vk-proto-mocktitle">Populärt just nu</div>
    <div className="vk-proto-products">
      {[
        { n: "Bord ‘Ek’", p: "4 900 kr" },
        { n: "Stol ‘Björk’", p: "1 895 kr" },
        { n: "Hylla ‘Gran’", p: "2 450 kr" },
      ].map((x, i) => (
        <div key={x.n} className="vk-proto-product">
          <div className={`vk-proto-pimg g${i}`} />
          <span>{x.n}</span>
          <b>{x.p}</b>
          <div className="vk-proto-buy">Köp</div>
        </div>
      ))}
    </div>
  </div>
);

const DispatchMock = () => (
  <div className="vk-proto-mock">
    <div className="vk-proto-mocktitle">Dagens körorder</div>
    {[
      { r: "Linköping → Jönköping", m: "07:40 · A. Lund", s: "OK" },
      { r: "Norrköping → Växjö", m: "09:15 · M. Ek", s: "PÅGÅR" },
    ].map((o) => (
      <div key={o.r} className="vk-proto-order">
        <div><b>{o.r}</b><span>{o.m}</span></div>
        <em>{o.s}</em>
      </div>
    ))}
    <div className="vk-proto-badge">✓ Faktureras via Fortnox</div>
  </div>
);

const QuoteMock = () => (
  <div className="vk-proto-mock">
    <div className="vk-proto-mocktitle">Offert #1042 – Badrumsrenovering</div>
    {[
      { r: "Arbete 32 h", p: "18 400 kr" },
      { r: "Material", p: "21 900 kr" },
      { r: "ROT-avdrag −30 %", p: "−5 520 kr" },
    ].map((x) => (
      <div key={x.r} className="vk-proto-line"><span>{x.r}</span><b>{x.p}</b></div>
    ))}
    <div className="vk-proto-line total"><span>Totalt</span><b>34 780 kr</b></div>
    <div className="vk-proto-btn">Skicka offert →</div>
  </div>
);

const MenuMock = () => (
  <div className="vk-proto-mock">
    <div className="vk-proto-mocktitle">Kvällens meny</div>
    {[
      { n: "Wallenbergare", p: "215 kr" },
      { n: "Rydbergssallad", p: "145 kr" },
      { n: "Vaniljglass & hjortron", p: "95 kr" },
    ].map((x) => (
      <div key={x.n} className="vk-proto-line"><span>{x.n}</span><b>{x.p}</b></div>
    ))}
    <div className="vk-proto-btn">Boka bord 19:00 →</div>
  </div>
);

const PortalMock = () => (
  <div className="vk-proto-mock">
    <div className="vk-proto-mocktitle">Att göra i mars</div>
    {[
      { t: "Kvitton uppladdade", done: true },
      { t: "Momsdeklaration skickad", done: true },
      { t: "Löner väntar på godkännande", done: false },
    ].map((x) => (
      <div key={x.t} className="vk-proto-task">
        <span className={x.done ? "done" : "todo"}>{x.done ? "✓" : "○"}</span>
        <b style={{ opacity: x.done ? 0.55 : 1 }}>{x.t}</b>
      </div>
    ))}
    <div className="vk-proto-badge">✓ Synkat med Fortnox</div>
  </div>
);

const DashMock = () => (
  <div className="vk-proto-mock">
    <div className="vk-proto-mocktitle">Denna vecka</div>
    <div className="vk-proto-stats">
      {[
        { l: "Användare", v: "1 240" },
        { l: "Nöjdhet", v: "4,8/5" },
        { l: "Sparad tid", v: "31 h" },
      ].map((s) => (
        <div key={s.l} className="vk-proto-stat"><b>{s.v}</b><span>{s.l}</span></div>
      ))}
    </div>
    <div className="vk-proto-bars">
      {[42, 68, 55, 90, 74, 100, 83].map((h, i) => (
        <i key={i} style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

const MOCKS: Record<ProtoBranch, FC> = {
  transport: DispatchMock,
  ehandel: ShopMock,
  bokning: BookingMock,
  bygg: QuoteMock,
  restaurang: MenuMock,
  ekonomi: PortalMock,
  saas: DashMock,
};

/* ── Självprototypen ── */

const MiniPrototype = ({
  branch,
  name,
  idea,
}: {
  branch: ProtoBranch;
  name: string;
  idea: string;
}) => {
  const c = CONTENT[branch] || CONTENT.saas;
  const displayName = name.trim() || c.defaultName;
  const Mock = useMemo(() => MOCKS[branch] || MOCKS.saas, [branch]);

  return (
    <div className="vk-proto">
      <div className="vk-proto-nav">
        <span className="vk-proto-logo">{displayName}</span>
        <span className="vk-proto-links">
          {c.nav.map((n) => (
            <i key={n}>{n}</i>
          ))}
        </span>
        <span className="vk-proto-cta">{c.cta}</span>
      </div>

      <div className="vk-proto-hero">
        <span className="vk-proto-kicker">{c.kicker}</span>
        <h4>{c.heroTitle}</h4>
        <p>{c.heroSub}</p>
        <span className="vk-proto-herocta">{c.cta} →</span>
      </div>

      <div className="vk-proto-body">
        <Mock />
      </div>

      <div className="vk-proto-foot">
        <span>© {displayName}</span>
        <span title={idea}>Er idé, som produkt</span>
      </div>
    </div>
  );
};

export default MiniPrototype;
