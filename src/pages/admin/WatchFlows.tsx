import { useState } from 'react';
import { watchScreenshotUrl, watchRunLabel, watchScheduleLabel, watchWeeklyReport, type WatchFlow, type WatchStep, type WatchStepEvidence } from '@/lib/auroraWatch';

type Site = { id: string; name: string; url: string; active: boolean; flows?: WatchFlow[] };
type Request = (body: Record<string, unknown>) => Promise<boolean>;
const inputClass = 'mt-1 block w-full rounded border bg-white p-2';
const dateLabel = (value: string) => new Date(value).toLocaleString('sv-SE');

function emptyStep(type: WatchStep['type'], url: string): WatchStep {
  if (type === 'navigate') return { type, url };
  if (type === 'assert_text') return { type, selector: 'body', text: '' };
  return { type, selector: '' };
}

function FlowEditor({ site, flow, busy, request, onClose }: { site: Site; flow?: WatchFlow; busy: boolean; request: Request; onClose: () => void }) {
  const [name, setName] = useState(flow?.name ?? '');
  const [interval, setInterval] = useState(flow?.check_interval_minutes ?? 1440);
  const [steps, setSteps] = useState<WatchStep[]>(flow?.steps ?? [{ type: 'navigate', url: site.url }, { type: 'assert_text', selector: 'body', text: '' }]);
  const patch = (index: number, step: WatchStep) => setSteps(current => current.map((value, i) => i === index ? step : value));
  const hasAssertion = steps.some(step => step.type === 'assert_visible' || step.type === 'assert_text');
  return (
    <form className="space-y-4 rounded-lg border bg-muted/20 p-4" onSubmit={async e => {
      e.preventDefault();
      const ok = await request({ action: flow ? 'update_flow' : 'create_flow', ...(flow ? { id: flow.id } : { site_id: site.id }), name, check_interval_minutes: interval, steps });
      if (ok) onClose();
    }}>
      <h4 className="font-semibold">{flow ? 'Redigera kundflöde' : 'Lägg till kundflöde'}</h4>
      <div className="grid gap-3 md:grid-cols-2">
        <label>Flödets namn<input className={inputClass} required maxLength={160} value={name} onChange={e => setName(e.target.value)} placeholder="Från startsida till kontaktformulär" /></label>
        <label>Kontrollintervall<select className={inputClass} value={interval} onChange={e => setInterval(Number(e.target.value))}><option value={60}>Varje timme</option><option value={360}>Var 6:e timme</option><option value={1440}>Varje dygn</option></select></label>
      </div>
      <p className="text-sm text-muted-foreground">Börja med en HTTPS-sida på samma domän som monitorn. Klick får endast följa länkar. Lägg till en synlig text eller ett element som bevisar att besökaren nått rätt. Inga inloggningar, formulärinskick eller betalningar körs.</p>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="space-y-3 rounded border bg-white p-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-0 flex-1">Steg {index + 1}<select aria-label={`Typ för steg ${index + 1}`} className={inputClass} value={step.type} disabled={index === 0} onChange={e => patch(index, emptyStep(e.target.value as WatchStep['type'], site.url))}>
                <option value="navigate">Öppna sida</option><option value="click_link">Följ länk</option><option value="assert_visible">Kontrollera synligt element</option><option value="assert_text">Kontrollera synlig text</option>
              </select></label>
              {index > 0 && <button type="button" className="vk-btn" aria-label={`Ta bort steg ${index + 1}`} onClick={() => setSteps(current => current.filter((_, i) => i !== index))}>Ta bort</button>}
            </div>
            {step.type === 'navigate' ? <label className="block">HTTPS-adress<input type="url" required className={inputClass} value={step.url} onChange={e => patch(index, { ...step, url: e.target.value })} /></label> : <label className="block">Elementets CSS-selektor<input required maxLength={500} className={inputClass} placeholder={step.type === 'click_link' ? 'a[href="/kontakt"]' : 'main'} value={step.selector} onChange={e => patch(index, { ...step, selector: e.target.value })} /></label>}
            {step.type === 'assert_text' && <label className="block">Text som måste vara synlig<input required maxLength={500} className={inputClass} value={step.text} onChange={e => patch(index, { ...step, text: e.target.value })} placeholder="Kontakta oss" /></label>}
          </li>
        ))}
      </ol>
      {!hasAssertion && <p role="status" className="text-sm">Lägg till minst en kontroll av synligt innehåll innan du sparar.</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="vk-btn" disabled={steps.length >= 8 || busy} onClick={() => setSteps(current => [...current, emptyStep('assert_visible', site.url)])}>Lägg till steg ({steps.length}/8)</button>
        <button className="vk-btn vk-btn-primary" disabled={busy || steps.length < 2 || !hasAssertion}>Spara flöde</button>
        <button type="button" className="vk-btn" onClick={onClose} disabled={busy}>Avbryt</button>
      </div>
    </form>
  );
}

function StepResults({ steps }: { steps: WatchStepEvidence[] }) {
  return <ol className="mt-2 space-y-1">{steps.map(step => <li key={step.index}>Steg {step.index + 1}: {step.status === 'passed' ? 'OK' : 'Avvikelse'}{step.message ? ` · ${step.message}` : ''}</li>)}</ol>;
}

export default function WatchFlows({ site, busy, request }: { site: Site; busy: boolean; request: Request }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [queued, setQueued] = useState<string | null>(null);
  const flows = site.flows ?? [];
  const download = (flow: WatchFlow) => {
    const url = URL.createObjectURL(new Blob([watchWeeklyReport(site.name, flow)], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurora-watch-${flow.id}-7-dagar.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-4 border-t pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-lg font-semibold">Kundflöden i webbläsare</h3><p className="text-sm text-muted-foreground">Navigering, länkar och synligt innehåll på den godkända domänen.</p></div>
        <button className="vk-btn" disabled={busy || editing !== null} onClick={() => setEditing('new')}>Nytt kundflöde</button>
      </div>
      {editing === 'new' && <FlowEditor site={site} busy={busy} request={request} onClose={() => setEditing(null)} />}
      {!flows.length && <p className="text-sm">Inga kundflöden finns ännu. En godkänd sidkontroll ovan betyder inte att ett kundflöde har testats.</p>}
      {queued && <p role="status" className="rounded border p-3 text-sm">En extra kontroll har begärts. Resultatet visas när kontrollen har slutförts. Uppdatera historiken för senaste status.</p>}
      {flows.map(flow => {
        const latest = flow.runs[0];
        const isRunning = flow.runs.some(run => run.status === 'running');
        return (
          <section key={flow.id} className="space-y-3 rounded-lg border p-4">
            <div><h4 className="font-semibold">{flow.name}</h4><p className="text-sm">{watchScheduleLabel(flow, site.active)} · {flow.check_interval_minutes === 60 ? 'Varje timme' : flow.check_interval_minutes === 360 ? 'Var 6:e timme' : 'Varje dygn'}</p></div>
            <p className="text-sm">Senaste utfall: <strong>{latest ? watchRunLabel(latest) : 'Inte testat'}</strong>{latest && ` · ${dateLabel(latest.completed_at ?? latest.created_at)}`}</p>
            <p className="text-xs text-muted-foreground">{flow.last_run_at ? `Senaste körstart: ${dateLabel(flow.last_run_at)}. ` : 'Ingen registrerad körstart. '}{flow.active && site.active ? `Planerad körning: ${dateLabel(flow.next_run_at)}. Schemat kan fördröjas; ett gammalt grönt resultat är ingen aktuell verifiering.` : 'Schemat är pausat.'}</p>
            <div className="flex flex-wrap gap-2">
              <button className="vk-btn vk-btn-primary" disabled={busy || !flow.active || !site.active || isRunning} onClick={async () => { if (await request({ action: 'queue_flow', id: flow.id })) setQueued(flow.id); }}>Köa kontroll</button>
              <button className="vk-btn" disabled={busy} onClick={() => void request({ action: 'toggle_flow', id: flow.id, active: !flow.active })}>{flow.active ? 'Pausa flöde' : 'Aktivera flöde'}</button>
              <button className="vk-btn" disabled={busy || editing !== null || isRunning} onClick={() => setEditing(flow.id)}>Redigera flöde</button>
              <button className="vk-btn" onClick={() => download(flow)}>Hämta 7-dagarsrapport</button>
            </div>
            {editing === flow.id && <FlowEditor site={site} flow={flow} busy={busy} request={request} onClose={() => setEditing(null)} />}
            <details><summary className="cursor-pointer text-sm font-medium">Definierade steg ({flow.steps.length})</summary><ol className="mt-2 list-inside list-decimal space-y-1 text-sm">{flow.steps.map((step, i) => <li key={i} className="break-all">{step.type === 'navigate' ? `Öppna ${step.url}` : step.type === 'click_link' ? `Följ länk: ${step.selector}` : step.type === 'assert_visible' ? `Synligt element: ${step.selector}` : `Synlig text ”${step.text}” i ${step.selector}`}</li>)}</ol></details>
            <details><summary className="cursor-pointer text-sm font-medium">Resultat och underlag ({flow.runs.length})</summary>
              <p className="my-2 text-xs text-muted-foreground">De senaste högst 20 körningarna visas. Instabilt betyder att första försöket misslyckades men omkontrollen lyckades. Skärmbilder lagras privat och öppnas med länkar som gäller i tio minuter.</p>
              <ul className="space-y-2">{flow.runs.map(run => {
                const screenshots = run.details.screenshots ?? [];
                const color = run.status === 'passed' && run.attempts === 1 ? 'border-emerald-200 bg-emerald-50' : run.status === 'failed' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50';
                return <li key={run.id} className={`rounded border p-3 text-sm ${color}`}>
                  <p className="font-medium">{watchRunLabel(run)} · {dateLabel(run.completed_at ?? run.created_at)}</p>
                  <p>{run.attempts} försök · {run.duration_ms ?? '–'} ms</p>
                  {run.details.error && <p className="mt-1 break-words">{run.details.error}</p>}
                  {run.details.attempts_detail?.length ? run.details.attempts_detail.map(attempt => <div key={attempt.attempt} className="mt-2 border-t pt-2">
                    <p className="font-medium">Försök {attempt.attempt}: {attempt.status === 'passed' ? 'Godkänt' : 'Avvikelse'}</p>
                    {attempt.error && <p className="break-words">{attempt.error}</p>}
                    <StepResults steps={attempt.steps} />
                  </div>) : !!run.details.steps?.length && <StepResults steps={run.details.steps} />}
                  {!!screenshots.length && <div className="mt-2 flex flex-wrap gap-3">{screenshots.map(screenshot => {
                    const href = watchScreenshotUrl(screenshot);
                    return href ? <a key={screenshot.attempt} href={href} target="_blank" rel="noreferrer" className="underline">Privat skärmbild · försök {screenshot.attempt}</a> : <span key={screenshot.attempt}>Bildlänken har gått ut. Uppdatera historiken för att hämta en ny.</span>;
                  })}</div>}
                </li>;
              })}</ul>
            </details>
          </section>
        );
      })}
    </div>
  );
}
