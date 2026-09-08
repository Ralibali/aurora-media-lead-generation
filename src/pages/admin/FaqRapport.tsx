import { useEffect, useState } from "react";
import { Loader2, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setSEOMeta } from "@/lib/seoHelpers";
import AdminShell, { adminFetch } from "./AdminShell";

type TopOpened = {
  question: string;
  opens: number;
  top_queries: string[];
};

type TopTerm = {
  term: string;
  clicks: number;
  sample_questions: string[];
};

type Report = {
  range: "7d" | "30d" | "all";
  totals: {
    searches: number;
    cta_clicks: number;
    searches_with_open: number;
    cta_with_query: number;
  };
  top_opened_after_search: TopOpened[];
  top_query_terms_to_cta: TopTerm[];
};

const ranges: { value: Report["range"]; label: string }[] = [
  { value: "7d", label: "7 dagar" },
  { value: "30d", label: "30 dagar" },
  { value: "all", label: "Allt" },
];

const FaqRapport = () => {
  const [range, setRange] = useState<Report["range"]>("30d");
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSEOMeta({
      title: "FAQ-rapport · Aurora Media",
      description: "Intern rapport över FAQ-sökningar och kontaktklick.",
      noindex: true,
    });
  }, []);

  const fetchReport = async (r: Report["range"]) => {
    setLoading(true); setError(null);
    try { setData(await adminFetch(`faq-analytics?range=${r}`)); }
    catch (error) { setError(error instanceof Error ? error.message : "Kunde inte hämta rapporten."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void fetchReport(range); }, [range]);
  const onChangeRange = (r: Report["range"]) => setRange(r);

  return (
    <AdminShell title="FAQ-rapport" kicker="Frågor & kontaktklick">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Intern rapport
            </p>
            <p className="mt-2 font-serif text-2xl">
              Vad behöver besökarna veta?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vilka frågor öppnas efter sökning och vilka söktermer driver kontakter.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              role="tablist"
              aria-label="Tidsperiod"
              className="flex rounded-full border border-border bg-card p-1"
            >
              {ranges.map((r) => (
                <button
                  key={r.value}
                  role="tab"
                  aria-selected={range === r.value}
                  onClick={() => onChangeRange(r.value)}
                  className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                    range === r.value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchReport(range)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Sökningar" value={data?.totals?.searches ?? 0} />
          <Stat
            label="Sökningar med öppnad fråga"
            value={data?.totals?.searches_with_open ?? 0}
          />
          <Stat label="CTA-klick" value={data?.totals?.cta_clicks ?? 0} />
          <Stat
            label="CTA-klick efter sökterm"
            value={data?.totals?.cta_with_query ?? 0}
          />
        </div>

        {/* Top opened-after-search */}
        <Section
          title="Mest öppnade frågor efter sökning"
          empty={!data || data.top_opened_after_search.length === 0}
          emptyText="Inga sökningar med öppnade frågor i vald period än."
        >
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 pr-4 font-medium">Fråga</th>
                <th className="py-3 pr-4 font-medium">Öppningar</th>
                <th className="py-3 font-medium">Vanliga söktermer</th>
              </tr>
            </thead>
            <tbody>
              {data?.top_opened_after_search.map((row) => (
                <tr key={row.question} className="border-b border-border/60">
                  <td className="py-3 pr-4 align-top text-foreground">
                    {row.question}
                  </td>
                  <td className="py-3 pr-4 align-top font-mono">
                    {row.opens}
                  </td>
                  <td className="py-3 align-top text-muted-foreground">
                    {row.top_queries.length === 0
                      ? "—"
                      : row.top_queries.map((q) => `"${q}"`).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Top terms → CTA */}
        <Section
          title="Söktermer som leder till flest CTA-klick"
          empty={!data || data.top_query_terms_to_cta.length === 0}
          emptyText="Inga CTA-klick efter sökning i vald period än."
        >
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 pr-4 font-medium">Sökterm</th>
                <th className="py-3 pr-4 font-medium">CTA-klick</th>
                <th className="py-3 font-medium">Frågor som öppnades</th>
              </tr>
            </thead>
            <tbody>
              {data?.top_query_terms_to_cta.map((row) => (
                <tr key={row.term} className="border-b border-border/60">
                  <td className="py-3 pr-4 align-top font-mono text-foreground">
                    {row.term}
                  </td>
                  <td className="py-3 pr-4 align-top font-mono">
                    {row.clicks}
                  </td>
                  <td className="py-3 align-top text-muted-foreground">
                    {row.sample_questions.length === 0
                      ? "—"
                      : row.sample_questions.join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </AdminShell>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </p>
    <p className="mt-2 font-serif text-3xl">{value}</p>
  </div>
);

const Section = ({
  title,
  empty,
  emptyText,
  children,
}: {
  title: string;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) => (
  <section className="mt-12">
    <h2 className="font-serif text-2xl">{title}</h2>
    <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card p-2">
      {empty ? (
        <p className="px-4 py-8 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        children
      )}
    </div>
  </section>
);

export default FaqRapport;
