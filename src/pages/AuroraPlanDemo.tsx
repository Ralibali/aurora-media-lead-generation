import { ExternalLink } from "lucide-react";
import { useEffect } from "react";

const PLANNER_URL = "https://bk-ljungsbro-vinterplaneraren-2026-27.lovable.app/planera";

export default function AuroraPlanDemo() {
  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <main className="flex h-[100svh] min-h-[100svh] flex-col overflow-hidden bg-[#111827]">
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#111827] px-3 text-white sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#e8500a] text-sm font-extrabold">
            A
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold sm:text-base">Aurora Plan</p>
            <p className="truncate text-xs text-white/60">BK Ljungsbro · arbetsyta 2026/27</p>
          </div>
        </div>

        <a
          href={PLANNER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="hidden sm:inline">Öppna i eget fönster</span>
          <span className="sm:hidden">Öppna</span>
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      </header>

      <section className="relative min-h-0 flex-1 bg-white" aria-label="BK Ljungsbros vinterplanerare">
        <p className="absolute inset-0 grid place-items-center bg-[#f6f5f1] text-sm font-medium text-[#4a5058]">
          Laddar planeringen …
        </p>
        <iframe
          title="BK Ljungsbro – Vinterplaneraren 2026/27"
          src={PLANNER_URL}
          className="absolute inset-0 h-full w-full border-0 bg-white"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </section>
    </main>
  );
}
