import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, RotateCw, Save, Star, Trash2, Sparkles } from "lucide-react";
import { getFunctionUrl } from "@/lib/functionUrl";

// Delar samma admin-lösenord som resten av /admin (verifieras server-side via list-leads).
const ADMIN_STORAGE_KEY = "faq_analytics_pwd";
const VERIFY_URL = getFunctionUrl("list-leads");
const LIB_URL = getFunctionUrl("admin-text-library");
const GEN_URL = getFunctionUrl("generate-text");

const TEXT_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "service-page", label: "Tjänstesida" },
  { value: "article", label: "Artikel" },
  { value: "case-study", label: "Kundcase" },
  { value: "faq-answer", label: "FAQ-svar" },
  { value: "email-response", label: "E-postsvar" },
  { value: "landing-section", label: "Landningssektion" },
  { value: "cta-block", label: "CTA-block" },
  { value: "about-section", label: "Om-sektion" },
];

type LibraryRow = {
  id: string;
  text_type: string;
  topic: string;
  generated_content: unknown;
  status: string;
  quality_rating: number | null;
  blocked_phrases_found: string[];
  character_count: number | null;
  created_at: string;
  used_on_page: string | null;
};

async function bearerFetch(url: string, body: unknown) {
  const pwd = sessionStorage.getItem(ADMIN_STORAGE_KEY) ?? "";
  if (!pwd) throw new Error("Inte inloggad");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pwd}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    throw new Error("Fel lösenord – logga in igen");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `HTTP ${res.status}`);
  return data as any;
}

const PasswordGate = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!pw) return;
          setLoading(true);
          try {
            const res = await fetch(VERIFY_URL, {
              method: "POST",
              headers: { Authorization: `Bearer ${pw}`, "Content-Type": "application/json" },
              body: JSON.stringify({ action: "list" }),
            });
            if (res.status === 401 || res.status === 403) {
              toast.error("Fel lösenord");
              return;
            }
            if (!res.ok) {
              toast.error(`Serverfel (${res.status})`);
              return;
            }
            sessionStorage.setItem(ADMIN_STORAGE_KEY, pw);
            onUnlock();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Nätverksfel");
          } finally {
            setLoading(false);
          }
        }}
        className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-8"
      >
        <h1 className="font-serif text-2xl">Aurora Admin</h1>
        <p className="text-sm text-muted-foreground">Lösenord krävs.</p>
        <Input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="••••••"
          autoFocus
        />
        <Button type="submit" className="w-full" disabled={loading || !pw}>
          {loading ? "Verifierar…" : "Lås upp"}
        </Button>
      </form>
    </div>
  );
};

const TextGenerator = () => {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_STORAGE_KEY)) setUnlocked(true);
  }, []);

  const [textType, setTextType] = useState("hero");
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [context, setContext] = useState("");
  const [minLength, setMinLength] = useState<string>("");
  const [maxLength, setMaxLength] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<unknown>(null);
  const [meta, setMeta] = useState<{
    regenerationCount: number;
    blockedPhrasesFound: string[];
    wordCount: number;
    characterCount: number;
  } | null>(null);

  const [library, setLibrary] = useState<LibraryRow[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");

  const loadLibrary = async () => {
    try {
      const data = await bearerFetch(LIB_URL, { action: "list" });
      setLibrary((data.rows as LibraryRow[]) ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kunde inte ladda bibliotek");
    }
  };

  useEffect(() => {
    if (unlocked) loadLibrary();
  }, [unlocked]);

  const runGenerate = async (payload: Record<string, unknown>) => {
    const data = await bearerFetch(GEN_URL, payload);
    if ((data as any)?.error) throw new Error((data as any).error);
    return data as any;
  };

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Ämne krävs");
      return;
    }
    setLoading(true);
    setOutput(null);
    setMeta(null);
    try {
      const data = await runGenerate({
        textType,
        topic,
        targetKeyword: keyword || undefined,
        context: context || undefined,
        minLength: minLength ? Number(minLength) : undefined,
        maxLength: maxLength ? Number(maxLength) : undefined,
        outputFormat: "json",
      });
      setOutput(data.content);
      setMeta(data.metadata);
      toast.success("Text genererad");
    } catch (e: any) {
      toast.error(e.message || "Misslyckades");
    } finally {
      setLoading(false);
    }
  };

  const saveToLibrary = async () => {
    if (!output) return;
    try {
      await bearerFetch(LIB_URL, {
        action: "insert",
        row: {
          text_type: textType,
          topic,
          target_keyword: keyword || null,
          context: context || null,
          generated_content: output,
          word_count: meta?.wordCount ?? null,
          character_count: meta?.characterCount ?? null,
          regeneration_count: meta?.regenerationCount ?? 0,
          blocked_phrases_found: meta?.blockedPhrasesFound ?? [],
          status: "draft",
        },
      });
      toast.success("Sparad i biblioteket");
      loadLibrary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Misslyckades");
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    toast.success("Kopierad till clipboard");
  };

  const rate = async (id: string, rating: number) => {
    try {
      await bearerFetch(LIB_URL, { action: "update", id, patch: { quality_rating: rating } });
      loadLibrary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Misslyckades");
    }
  };

  const setStatus = async (id: string, status: string) => {
    try {
      await bearerFetch(LIB_URL, { action: "update", id, patch: { status } });
      loadLibrary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Misslyckades");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Ta bort denna text?")) return;
    try {
      await bearerFetch(LIB_URL, { action: "delete", id });
      loadLibrary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Misslyckades");
    }
  };

  const filteredLibrary = useMemo(() => {
    const s = search.toLowerCase();
    return library.filter((row) => {
      if (filterType !== "all" && row.text_type !== filterType) return false;
      if (s && !row.topic.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [library, filterType, search]);

  const quickGenerate = async (jobs: Array<{ textType: string; topic: string; context?: string }>) => {
    setLoading(true);
    let success = 0;
    for (const job of jobs) {
      try {
        const data = await runGenerate({ ...job, outputFormat: "json" });
        await bearerFetch(LIB_URL, {
          action: "insert",
          row: {
            text_type: job.textType,
            topic: job.topic,
            context: job.context ?? null,
            generated_content: data.content,
            word_count: data.metadata?.wordCount ?? null,
            character_count: data.metadata?.characterCount ?? null,
            regeneration_count: data.metadata?.regenerationCount ?? 0,
            blocked_phrases_found: data.metadata?.blockedPhrasesFound ?? [],
            status: "draft",
          },
        });
        success++;
        toast.success(`(${success}/${jobs.length}) ${job.topic}`);
      } catch {
        toast.error(`Misslyckades: ${job.topic}`);
      }
    }
    setLoading(false);
    loadLibrary();
  };

  const generateAllBaseTexts = () =>
    quickGenerate([
      { textType: "hero", topic: "Aurora Media startsida", context: "AI-byggd SaaS i Linköping" },
      { textType: "service-page", topic: "Hemsidor", context: "Från 4 900 kr, 3-10 dagar" },
      { textType: "service-page", topic: "E-handel", context: "Från 14 900 kr" },
      { textType: "service-page", topic: "SEO", context: "Från 4 900 kr" },
      { textType: "service-page", topic: "Google Ads", context: "3 900 kr setup + drift" },
      { textType: "service-page", topic: "Meta Ads", context: "3 900 kr setup" },
      { textType: "service-page", topic: "Content", context: "1 490 kr per artikel" },
      { textType: "service-page", topic: "Grafisk profil", context: "Från 6 900 kr" },
      { textType: "service-page", topic: "Fotografering", context: "Från 4 900 kr" },
      { textType: "about-section", topic: "Vem är Christoffer" },
      { textType: "about-section", topic: "Hur jag jobbar" },
      { textType: "about-section", topic: "Varför AI-kodning" },
      { textType: "about-section", topic: "Aurora Media som företag" },
    ]);

  const generateFAQs = () =>
    quickGenerate([
      { textType: "faq-answer", topic: "Vad kostar en hemsida?" },
      { textType: "faq-answer", topic: "Hur lång tid tar ett projekt?" },
      { textType: "faq-answer", topic: "Äger jag koden efteråt?" },
      { textType: "faq-answer", topic: "Vad händer om något går sönder?" },
      { textType: "faq-answer", topic: "Kan du ta över ett befintligt projekt?" },
    ]);

  const generateMonthlyArticles = () => {
    const month = new Date().toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
    return quickGenerate([
      { textType: "article", topic: `Så väljer du rätt webbyrå i Linköping 2026`, context: `Lokal SEO-artikel för ${month}. Keyword: webbbyrå linköping.` },
      { textType: "article", topic: `AI-byggda hemsidor vs traditionell webbutveckling`, context: `Jämförande artikel för ${month}. Keyword: ai hemsida.` },
      { textType: "article", topic: `SEO för småföretag: 5 saker som faktiskt funkar 2026`, context: `Praktisk how-to för ${month}. Keyword: seo småföretag.` },
      { textType: "article", topic: `Vad en hemsida bör kosta – ärlig prisguide`, context: `Transparent prisartikel för ${month}. 15% admin-avgift, intervall 4 900–50 000 kr.` },
    ]);
  };

  const generateMobileAppArticles = () =>
    quickGenerate([
      { textType: "article", topic: "Capacitor vs React Native 2026 – vilket ska jag välja?", context: "Jämförelse för utvecklare och produktägare." },
      { textType: "article", topic: "Vad kostar det att göra en app för iOS och Android 2026?", context: "Transparent prisartikel. Capacitor från 24 900 kr." },
      { textType: "article", topic: "Från webb-SaaS till app – steg för steg-guide", context: "Praktisk guide via Capacitor." },
      { textType: "article", topic: "Apple Developer Program – så här sätter du upp det", context: "99 USD/år, certifikat." },
      { textType: "article", topic: "Google Play Console vs App Store Connect – skillnader", context: "Jämförelse av inlämningsprocess." },
      { textType: "article", topic: "Push-notiser i Capacitor-appar – praktisk guide", context: "OneSignal vs Firebase vs APN." },
      { textType: "article", topic: "In-app purchase eller Stripe? Så väljer du rätt betalningsmodell", context: "15-30% Apple/Google fee vs Stripe." },
      { textType: "article", topic: "PWA eller native app – när räcker det med en PWA?", context: "Pragmatisk guide." },
    ]);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-serif text-2xl">Aurora Text Generator</h1>
            <p className="text-sm text-muted-foreground">Gemini 2.5 Pro · anti-AI röst · validation pipeline</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem(ADMIN_STORAGE_KEY);
              setUnlocked(false);
            }}
          >
            Logga ut
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg">Snabbstart</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={generateAllBaseTexts} disabled={loading} variant="outline">
              Generera alla basertexter (~13 st)
            </Button>
            <Button onClick={generateMonthlyArticles} disabled={loading} variant="outline">
              Månadens 4 artiklar
            </Button>
            <Button onClick={generateMobileAppArticles} disabled={loading} variant="outline">
              Mobilapp-artiklar (8 st)
            </Button>
            <Button onClick={generateFAQs} disabled={loading} variant="outline">
              Generera 5 nya FAQ
            </Button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-lg">Generera text</h2>

            <div className="space-y-2">
              <Label>Typ av text</Label>
              <Select value={textType} onValueChange={setTextType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEXT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ämne / topic *</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="t.ex. Hemsidor" />
            </div>

            <div className="space-y-2">
              <Label>Keyword (valfritt)</Label>
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="t.ex. webbbyrå linköping" />
            </div>

            <div className="space-y-2">
              <Label>Extra kontext</Label>
              <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Pris, tidslinje, specifik kund eller produkt..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Min längd (tecken)</Label>
                <Input type="number" value={minLength} onChange={(e) => setMinLength(e.target.value)} placeholder="valfritt" />
              </div>
              <div className="space-y-2">
                <Label>Max längd (tecken)</Label>
                <Input type="number" value={maxLength} onChange={(e) => setMaxLength(e.target.value)} placeholder="valfritt" />
              </div>
            </div>

            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? "Genererar..." : "Generera"}
            </Button>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg">Output</h2>
              {meta && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{meta.characterCount} tecken</Badge>
                  <Badge variant="secondary">{meta.wordCount} ord</Badge>
                  {meta.regenerationCount > 0 && (
                    <Badge variant="outline">{meta.regenerationCount} regen</Badge>
                  )}
                </div>
              )}
            </div>

            {meta && meta.blockedPhrasesFound.length > 0 && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs">
                <strong>Blockerade fraser kvar:</strong> {meta.blockedPhrasesFound.join(", ")}
              </div>
            )}

            {output ? (
              <pre className="max-h-[480px] overflow-auto rounded-md bg-muted p-4 text-xs whitespace-pre-wrap break-words">
                {JSON.stringify(output, null, 2)}
              </pre>
            ) : (
              <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                Inget genererat än.
              </div>
            )}

            {output && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={generate} disabled={loading} variant="outline" size="sm">
                  <RotateCw className="mr-2 h-4 w-4" /> Kör om
                </Button>
                <Button onClick={copyOutput} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" /> Kopiera
                </Button>
                <Button onClick={saveToLibrary} size="sm">
                  <Save className="mr-2 h-4 w-4" /> Spara i bibliotek
                </Button>
              </div>
            )}
          </section>
        </div>

        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-serif text-lg">Textbibliotek ({library.length})</h2>
            <div className="flex gap-2 flex-wrap">
              <Input placeholder="Sök ämne..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla typer</SelectItem>
                  {TEXT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredLibrary.length === 0 && (
              <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Inga texter än.
              </div>
            )}
            {filteredLibrary.map((row) => (
              <div key={row.id} className="rounded-md border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{row.text_type}</Badge>
                      <Badge variant={row.status === "published" ? "default" : "outline"}>{row.status}</Badge>
                      {row.character_count && (
                        <span className="text-xs text-muted-foreground">{row.character_count} tecken</span>
                      )}
                    </div>
                    <h3 className="mt-2 font-medium">{row.topic}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString("sv-SE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => rate(row.id, n)}
                        className="p-1 hover:scale-110 transition-transform"
                        title={`${n} stjärnor`}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            row.quality_rating && row.quality_rating >= n
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <details>
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    Visa innehåll
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-3 text-xs whitespace-pre-wrap break-words">
                    {JSON.stringify(row.generated_content, null, 2)}
                  </pre>
                </details>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(row.generated_content, null, 2))}
                  >
                    <Copy className="mr-2 h-3 w-3" /> Kopiera
                  </Button>
                  {row.status !== "published" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(row.id, "published")}>
                      Markera publicerad
                    </Button>
                  )}
                  {row.status !== "archived" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(row.id, "archived")}>
                      Arkivera
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remove(row.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TextGenerator;
