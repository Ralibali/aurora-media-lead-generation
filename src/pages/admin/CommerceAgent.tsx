import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, ExternalLink, PackageSearch, Plus, RefreshCw, Store, Trash2 } from "lucide-react";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type StoreRow = {
  id: string;
  name: string;
  platform: string;
  shop_domain: string | null;
  currency: string;
};

type CatalogItem = {
  id: string;
  store_id: string;
  external_id: string;
  title: string;
  description: string | null;
  product_url: string | null;
  price: number | null;
  inventory: number | null;
  category: string | null;
  active: boolean;
  source: string;
  updated_at: string;
};

type Session = {
  id: string;
  store_id: string;
  question: string;
  answer: string | null;
  recommended_product_ids: string[];
  status: string;
  created_at: string;
};

type Data = { stores: StoreRow[]; catalog: CatalogItem[]; sessions: Session[] };
type QueryResult = {
  session_id: string;
  answer: string;
  recommendations: CatalogItem[];
  reasoning_notes: string[];
  missing_facts: string[];
};

const card: React.CSSProperties = { background: "#fff", border: "1px solid var(--linje)", borderRadius: 12, padding: 18 };
const input: React.CSSProperties = { width: "100%", border: "1px solid var(--linje)", borderRadius: 8, padding: "9px 10px", fontSize: 13, background: "#fff" };

const exampleCatalog = JSON.stringify([
  {
    external_id: "hg-001",
    title: "Ägghållare för 12 ägg",
    description: "Praktisk hållare för förvaring och transport av ägg.",
    price: 149,
    inventory: 12,
    category: "Tillbehör",
    product_url: "https://honsgarden.se/",
  },
  {
    external_id: "hg-002",
    title: "Fodertråg för höns",
    description: "Enkel produkt för utfodring i mindre flockar.",
    price: 229,
    inventory: 6,
    category: "Utfodring",
    product_url: "https://honsgarden.se/",
  },
], null, 2);

export default function CommerceAgent() {
  const [data, setData] = useState<Data | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [catalogText, setCatalogText] = useState(exampleCatalog);
  const [question, setQuestion] = useState("Jag har en liten flock och vill ha något praktiskt för vardagen. Vad passar bäst?");
  const [result, setResult] = useState<QueryResult | null>(null);

  const load = useCallback(async (storeId?: string) => {
    try {
      const next = await adminFetch("admin-commerce-agent", {
        method: "POST",
        body: JSON.stringify({ action: "list", ...(storeId ? { store_id: storeId } : {}) }),
      }) as Data;
      setData(next);
      setError(null);
      setSelectedId((current) => storeId || current || next.stores[0]?.id || "");
    } catch (nextError) {
      setError(nextError);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (selectedId) void load(selectedId);
  }, [selectedId, load]);

  const selected = useMemo(
    () => data?.stores.find((store) => store.id === selectedId) ?? null,
    [data, selectedId],
  );

  const mutate = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const next = await adminFetch("admin-commerce-agent", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as Data;
      setData(next);
      setError(null);
      return true;
    } catch (nextError) {
      setError(nextError);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const importCatalog = async () => {
    if (!selected) return;
    let items: unknown;
    try {
      items = JSON.parse(catalogText);
      if (!Array.isArray(items)) throw new Error();
    } catch {
      setError(new Error("Katalogen måste vara en JSON-array."));
      return;
    }
    await mutate({ action: "import_catalog", store_id: selected.id, items, source: "manual" });
  };

  const ask = async () => {
    if (!selected || !question.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const next = await adminFetch("admin-commerce-agent", {
        method: "POST",
        body: JSON.stringify({ action: "shopping_query", store_id: selected.id, question }),
      }) as QueryResult;
      setResult(next);
      setError(null);
      await load(selected.id);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell title="Commerce Agent" kicker="Admin · Grounded shopping pilot">
      <AdminStatus loading={!data && !error} error={error} onRetry={() => load(selectedId || undefined)} />

      <section style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
          <div>
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>AURORA COMMERCE AGENT</p>
            <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>Shoppinghjälp som bara får använda verklig katalogdata</h2>
            <p style={{ margin: "7px 0 0", maxWidth: 800, fontSize: 13, color: "var(--granbark-mut)" }}>
              Piloten använder samma butik som Commerce Ops. AI:n får inte hitta på produkt, pris, lager eller leveranstid.
              Rekommendationer valideras server-side mot aktiva katalograder innan de visas.
            </p>
          </div>
          <a href="https://github.com/anthropics/commerce-agents" target="_blank" rel="noreferrer" className="vk-btn" style={{ textDecoration: "none", height: 38 }}>
            Referens <ExternalLink size={13} />
          </a>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="vk-btn"
            disabled={busy}
            onClick={async () => {
              const ok = await mutate({ action: "ensure_honsgarden_pilot" });
              if (ok) {
                const honsgarden = (data?.stores ?? []).find((store) => store.name === "Hönsgården");
                if (honsgarden) setSelectedId(honsgarden.id);
                else await load();
              }
            }}
          >
            <Store size={13} /> Skapa/Hämta Hönsgården-pilot
          </button>
          {(data?.stores ?? []).map((store) => (
            <button
              key={store.id}
              className={selectedId === store.id ? "vk-btn vk-btn-primary" : "vk-btn"}
              onClick={() => setSelectedId(store.id)}
            >
              {store.name}
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,410px),1fr))", marginTop: 16 }}>
          <section style={card}>
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>KATALOG · {selected.name.toUpperCase()}</p>
            <p style={{ margin: "7px 0 10px", fontSize: 12, color: "var(--granbark-mut)" }}>
              {data?.catalog.length ?? 0} produkter i pilotkatalogen. Senare kan samma schema fyllas via Shopify/WooCommerce genom Integrations Hub.
            </p>
            <textarea
              rows={16}
              style={{ ...input, fontFamily: "var(--font-mono)", resize: "vertical" }}
              value={catalogText}
              onChange={(event) => setCatalogText(event.target.value)}
              aria-label="Katalog JSON"
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <button className="vk-btn vk-btn-primary" disabled={busy} onClick={importCatalog}>
                <Plus size={13} /> Importera / uppdatera
              </button>
              <button
                className="vk-btn"
                disabled={busy || (data?.catalog.length ?? 0) === 0}
                onClick={async () => {
                  if (window.confirm("Rensa pilotkatalogen för den valda butiken?")) {
                    await mutate({ action: "clear_catalog", store_id: selected.id, confirmation: "CLEAR_CATALOG" });
                  }
                }}
              >
                <Trash2 size={13} /> Rensa
              </button>
            </div>

            <div style={{ display: "grid", gap: 7, marginTop: 14 }}>
              {(data?.catalog ?? []).slice(0, 30).map((item) => (
                <div key={item.id} style={{ border: "1px solid var(--linje)", borderRadius: 9, padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ fontSize: 12 }}>{item.title}</strong>
                    <span className="vk-mono" style={{ fontSize: 10 }}>{item.external_id}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--granbark-mut)" }}>
                    {item.price == null ? "Pris saknas" : `${Number(item.price).toLocaleString("sv-SE")} ${selected.currency}`}
                    {" · "}
                    {item.inventory == null ? "Lager okänt" : `${item.inventory} i lager`}
                    {item.category ? ` · ${item.category}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section style={card}>
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>SHOPPER TEST</p>
            <textarea
              rows={5}
              style={{ ...input, resize: "vertical", marginTop: 10 }}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              aria-label="Kundfråga"
            />
            <button className="vk-btn vk-btn-primary" style={{ marginTop: 8 }} disabled={busy || !question.trim() || (data?.catalog.length ?? 0) === 0} onClick={ask}>
              <Bot size={14} /> Fråga Commerce Agent
            </button>

            {result && (
              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                <div style={{ border: "1px solid var(--linje)", borderRadius: 10, padding: 12 }}>
                  <strong>Svar</strong>
                  <p style={{ whiteSpace: "pre-wrap", margin: "7px 0 0", fontSize: 13 }}>{result.answer}</p>
                </div>
                {result.recommendations.length > 0 && (
                  <div>
                    <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: "0 0 7px" }}>VALIDERADE PRODUKTER</p>
                    <div style={{ display: "grid", gap: 7 }}>
                      {result.recommendations.map((item) => (
                        <div key={item.id} style={{ border: "1px solid #2D6A4F44", background: "#2D6A4F08", borderRadius: 9, padding: 10 }}>
                          <strong style={{ fontSize: 12 }}>{item.title}</strong>
                          <p style={{ margin: "4px 0 0", fontSize: 11 }}>
                            {item.price == null ? "Pris saknas" : `${Number(item.price).toLocaleString("sv-SE")} ${selected.currency}`}
                            {" · "}
                            {item.inventory == null ? "Lager okänt" : `${item.inventory} i lager`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.missing_facts.length > 0 && (
                  <p style={{ margin: 0, fontSize: 11, color: "#8A6518" }}>
                    Saknad fakta: {result.missing_facts.join(" · ")}
                  </p>
                )}
                {result.reasoning_notes.length > 0 && (
                  <p style={{ margin: 0, fontSize: 11, color: "var(--granbark-mut)" }}>
                    Evidensnotering: {result.reasoning_notes.join(" · ")}
                  </p>
                )}
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>SENASTE TESTER</p>
              <div style={{ display: "grid", gap: 7, marginTop: 8 }}>
                {(data?.sessions ?? []).slice(0, 12).map((session) => (
                  <div key={session.id} style={{ border: "1px solid var(--linje)", borderRadius: 9, padding: 9 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <PackageSearch size={13} />
                      <strong style={{ fontSize: 11 }}>{session.question}</strong>
                    </div>
                    {session.answer && <p style={{ margin: "5px 0 0", fontSize: 11, color: "var(--granbark-mut)" }}>{session.answer}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {!selected && data && (
        <section style={{ ...card, marginTop: 16 }}>
          <p style={{ margin: 0, color: "var(--granbark-mut)", fontSize: 13 }}>Skapa Hönsgården-piloten eller lägg först till en butik i Commerce Ops.</p>
        </section>
      )}
    </AdminShell>
  );
}
