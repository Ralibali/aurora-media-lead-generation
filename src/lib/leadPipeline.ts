export type PipelineLead = {
  id: string; source: string; name: string; company: string | null; email: string;
  status: string; created_at: string; followup_at: string | null;
};
export function needsFollowup(lead: PipelineLead, now = new Date()) {
  if (lead.status === "kund" || lead.status === "forlorad" || !lead.followup_at) return false;
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const date = new Date(lead.followup_at.length === 10 ? `${lead.followup_at}T00:00:00` : lead.followup_at);
  return Number.isFinite(date.getTime()) && date <= end;
}
export function pipelineSummary(leads: PipelineLead[], now = new Date()) {
  return {
    unhandled: leads.filter(l => l.status === "ny").length,
    followups: leads.filter(l => needsFollowup(l, now)).length,
    meetings: leads.filter(l => l.status === "mote_bokat").length,
    offers: leads.filter(l => l.status === "offert_skickad").length,
    customers: leads.filter(l => l.status === "kund").length,
  };
}
export function followupQueue(leads: PipelineLead[], now = new Date()) {
  return leads.filter(l => l.status === "ny" || needsFollowup(l, now)).sort((a, b) => {
    const due = Number(needsFollowup(b, now)) - Number(needsFollowup(a, now));
    return due || new Date(a.followup_at || a.created_at).getTime() - new Date(b.followup_at || b.created_at).getTime();
  });
}
export function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  // Spreadsheet programs must treat lead-supplied formulas as text.
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
