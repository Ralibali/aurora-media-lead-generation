import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

// Byt detta lösenord till något eget. Det är en enkel grind, inte hård säkerhet.
const AURORA_ADMIN_PASSWORD = "aurora-2026";
const STORAGE_KEY = "aurora-admin-ok";

const TEXT_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "service-page", label: "Tjänstesida" },
  { value: "article", label: "Artikel" },
  { value: "case-study", label: "Case study" },
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

const PasswordGate = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pw, setPw] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pw === AURORA_ADMIN_PASSWORD) {
            sessionStorage.setItem(STORAGE_KEY, "1");
            onUnlock();
          } else {
            toast.error("Fel lösenord");
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
        <Button type="submit" className="w-full">
          Lås upp
        </Button>
      </form>
    </div>
  );
};

const TextGenerator = () => {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
  }, []);

  // Form state
  const [textType, setTextType] = useState("hero");
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [context, setContext] = useState("");
  const [minLength, setMinLength] = useState<string>("");
  const [maxLength, setMaxLength] = useState<string>("");

  // Generation state
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<unknown>(null);
  const [meta, setMeta] = useState<{
    regenerationCount: number;
    blockedPhrasesFound: string[];
    wordCount: number;
    characterCount: number;
  } | null>(null);

  // Library
  const [library, setLibrary] = useState<LibraryRow[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");

  const loadLibrary = async () => {
    const { data, error } = await supabase
      .from("text_library")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    else setLibrary((data as LibraryRow[]) ?? []);
  };

  useEffect(() => {
    if (unlocked) loadLibrary();
  }, [unlocked]);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Ämne krävs");
      return;
    }
    setLoading(true);
    setOutput(null);
    setMeta(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-text", {
        body: {
          textType,
          topic,
          targetKeyword: keyword || undefined,
          context: context || undefined,
          minLength: minLength ? Number(minLength) : undefined,
          maxLength: maxLength ? Number(maxLength) : undefined,
          outputFormat: "json",
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setOutput((data as any).content);
      setMeta((data as any).metadata);
      toast.success("Text genererad");
    } catch (e: any) {
      toast.error(e.message || "Misslyckades");
    } finally {
      setLoading(false);
    }
  };

  const saveToLibrary = async () => {
    if (!output) return;
    const { error } = await supabase.from("text_library").insert({
      text_type: textType,
      topic,
      target_keyword: keyword || null,
      context: context || null,
      generated_content: output as any,
      word_count: meta?.wordCount ?? null,
      character_count: meta?.characterCount ?? null,
      regeneration_count: meta?.regenerationCount ?? 0,
      blocked_phrases_found: meta?.blockedPhrasesFound ?? [],
      status: "draft",
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Sparad i biblioteket");
      loadLibrary();
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    toast.success("Kopierad till clipboard");
  };

  const rate = async (id: string, rating: number) => {
    const { error } = await supabase
      .from("text_library")
      .update({ quality_rating: rating })
      .eq("id", id);
    if (error) toast.error(error.message);
    else loadLibrary();
  };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("text_library")
      .update({ status })
      .eq("id", id);
    if (error) toast.error(error.message);
    else loadLibrary();
  };

  const remove = async (id: string) => {
    if (!confirm("Ta bort denna text?")) return;
    const { error } = await supabase.from("text_library").delete().eq("id", id);
    if (error) toast.error(error.message);
    else loadLibrary();
  };

  const filteredLibrary = useMemo(() => {
    const s = search.toLowerCase();
    return library.filter((row) => {
      if (filterType !== "all" && row.text_type !== filterType) return false;
      if (s && !row.topic.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [library, filterType, search]);

  // Quick actions
  const quickGenerate = async (jobs: Array<{ textType: string; topic: string; context?: string }>) => {
    setLoading(true);
    let success = 0;
    for (const job of jobs) {
      try {
        const { data, error } = await supabase.functions.invoke("generate-text", {
          body: { ...job, outputFormat: "json" },
        });
        if (error) throw error;
        if ((data as any)?.error) throw new Error((data as any).error);
        const content = (data as any).content;
        const m = (data as any).metadata;
        await supabase.from("text_library").insert({
          text_type: job.textType,
          topic: job.topic,
          context: job.context ?? null,
          generated_content: content,
          word_count: m?.wordCount ?? null,
          character_count: m?.characterCount ?? null,
          regeneration_count: m?.regenerationCount ?? 0,
          blocked_phrases_found: m?.blockedPhrasesFound ?? [],
          status: "draft",
        });
        success++;
        toast.success(`(${success}/${jobs.length}) ${job.topic}`);
      } catch (e: any) {
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
      {
        textType: "article",
        topic: `Så väljer du rätt webbyrå i Linköping 2026`,
        context: `Lokal SEO-artikel för ${month}. Keyword: webbbyrå linköping. Ska ranka lokalt och driva leads.`,
      },
      {
        textType: "article",
        topic: `AI-byggda hemsidor vs traditionell webbutveckling`,
        context: `Jämförande artikel för ${month}. Förklara fördelar/nackdelar utan hype. Keyword: ai hemsida.`,
      },
      {
        textType: "article",
        topic: `SEO för småföretag: 5 saker som faktiskt funkar 2026`,
        context: `Praktisk how-to för ${month}. Keyword: seo småföretag. Inga floskler, konkreta steg.`,
      },
      {
        textType: "article",
        topic: `Vad en hemsida bör kosta – ärlig prisguide`,
        context: `Transparent prisartikel för ${month}. Visa Aurora Medias 15% admin-avgift och nämn intervall 4 900–50 000 kr.`,
      },
    ]);
  };

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
              sessionStorage.removeItem(STORAGE_KEY);
              setUnlocked(false);
            }}
          >
            Logga ut
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Quick actions */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg">Snabbstart</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={generateAllBaseTexts} disabled={loading} variant="outline">
              Generera alla basertexter (~13 st)
            </Button>
            <Button onClick={generateFAQs} disabled={loading} variant="outline">
              Generera 5 nya FAQ
            </Button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-lg">Generera text</h2>

            <div className="space-y-2">
              <Label>Typ av text</Label>
              <Select value={textType} onValueChange={setTextType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
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
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Pris, tidslinje, specifik kund eller produkt..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Min längd (tecken)</Label>
                <Input
                  type="number"
                  value={minLength}
                  onChange={(e) => setMinLength(e.target.value)}
                  placeholder="valfritt"
                />
              </div>
              <div className="space-y-2">
                <Label>Max längd (tecken)</Label>
                <Input
                  type="number"
                  value={maxLength}
                  onChange={(e) => setMaxLength(e.target.value)}
                  placeholder="valfritt"
                />
              </div>
            </div>

            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? "Genererar..." : "Generera"}
            </Button>
          </section>

          {/* Output */}
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
                  <RotateCw className="mr-2 h-4 w-4" />
                  Kör om
                </Button>
                <Button onClick={copyOutput} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Kopiera
                </Button>
                <Button onClick={saveToLibrary} size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Spara i bibliotek
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* Library */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-serif text-lg">Textbibliotek ({library.length})</h2>
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Sök ämne..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla typer</SelectItem>
                  {TEXT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
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
                    <Copy className="mr-2 h-3 w-3" />
                    Kopiera
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
