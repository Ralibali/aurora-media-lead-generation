import { ArrowUpRight, Clock3, FolderKanban, Inbox, TriangleAlert } from 'lucide-react';
import { useSupportOverview } from '@/lib/supportHub';
import '@/styles/support-hub.css';

export default function SupportOverview() {
  const { data, error } = useSupportOverview();
  const pending = data?.sources.filter(source => !source.active || source.connection_state !== 'connected').length ?? 0;
  return <section className="sh-hub sh-overview" aria-label="Projekt och inkomna ärenden">
    <div className="sh-heading"><div><p className="sh-eyebrow">Din arbetsyta</p><h2>Vad behöver göras idag?</h2><p>Hantera projekt och följ upp inkomna supportmeddelanden och feedback.</p></div><a className="sh-button" href="/admin/projekt"><FolderKanban size={16} />Alla projekt <ArrowUpRight size={16} /></a></div>
    <div className="sh-summary-grid">
      <a href="/admin/arenden?status=new" className="sh-summary-card sh-summary-primary"><Inbox size={19} /><span>Nya inlästa ärenden</span><strong>{data ? data.counts.new : '—'}</strong><small>Öppna support och feedback →</small></a>
      <a href="/admin/arenden" className="sh-summary-card"><Clock3 size={19} /><span>Förfallna uppföljningar</span><strong>{data ? data.counts.overdue : '—'}</strong><small>Av ärendena i den centrala listan</small></a>
      <a href="/admin/arenden#kallor" className="sh-summary-card"><TriangleAlert size={19} /><span>Källor att kontrollera</span><strong>{data ? pending : '—'}</strong><small>{data ? `${data.sources.length - pending} av ${data.sources.length} anslutna` : error || 'Hämtar anslutningsstatus…'}</small></a>
    </div>
    {data && <p className="sh-coverage-note">Siffrorna gäller inlästa ärenden.{pending || !data.sources.length ? ' Saknade anslutningar innebär att fler ärenden kan finnas i projekten.' : ' Källornas senaste uppdatering visas i ärendelistan.'}</p>}
    {error && <p role="status" className="sh-warning">Ärendeöversikten kunde inte hämtas. Öppna ärendelistan för att försöka igen.</p>}
  </section>;
}
