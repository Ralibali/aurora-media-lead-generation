import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const encoder = new TextEncoder();
const hex = (bytes: Uint8Array) => Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
const hashToken = async (token: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return hex(new Uint8Array(digest));
};
const esc = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");
const safeUrl = (value: unknown) => {
  try {
    const url = new URL(String(value ?? ""));
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
};
const page = (body: string, status = 200) => new Response(`<!doctype html>
<html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Godkänn innehåll · Aurora Media</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#14171a;background:#f6f5f1}*{box-sizing:border-box}body{margin:0}main{max-width:760px;margin:0 auto;padding:32px 18px 64px}.brand{font:700 12px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#44524a}.card{background:white;border:1px solid #dedbd3;border-radius:18px;padding:24px;margin-top:18px;box-shadow:0 12px 35px rgba(20,23,26,.05)}h1{font-size:28px;margin:6px 0 8px}h2{font-size:15px;margin:0 0 8px}.muted{color:#666d69;font-size:14px}.content{white-space:pre-wrap;line-height:1.6;background:#f8f8f5;border-radius:12px;padding:16px;margin:18px 0}.pill{display:inline-block;padding:5px 9px;border-radius:999px;background:#e8eee9;font-size:12px;font-weight:700}.comments{border-top:1px solid #ebe9e3;margin-top:20px;padding-top:16px}.comment{padding:10px 0;border-bottom:1px solid #f0eee8;font-size:14px}label{display:block;font-size:12px;font-weight:700;margin:14px 0 5px}input,textarea{width:100%;border:1px solid #cfcac0;border-radius:10px;padding:11px;font:inherit}textarea{min-height:100px;resize:vertical}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}button{border:0;border-radius:10px;padding:11px 15px;font-weight:700;cursor:pointer}.approve{background:#244a37;color:white}.changes{background:#f1e8df;color:#8a3f17}a{color:#244a37;font-weight:700}.notice{background:#eef6ef;border:1px solid #cadfcd;border-radius:12px;padding:12px 14px;margin-top:14px}</style></head><body><main>${body}</main></body></html>`, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  if (!token || token.length > 256) return page("<div class=card><h1>Länken är ogiltig</h1><p class=muted>Be Aurora Media om en ny godkännandelänk.</p></div>", 404);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRole) return page("<div class=card><h1>Tjänsten är tillfälligt otillgänglig</h1></div>", 503);
  const admin = createClient(supabaseUrl, serviceRole);
  const tokenHash = await hashToken(token);

  const load = async () => {
    const itemResult = await admin
      .from("content_approval_items")
      .select("id,client_name,title,channel,body,media_url,status,expires_at,approved_at,created_at")
      .eq("approval_token_hash", tokenHash)
      .maybeSingle();
    if (itemResult.error) throw itemResult.error;
    if (!itemResult.data) return { item: null, comments: [] as any[] };
    const commentsResult = await admin
      .from("content_approval_comments")
      .select("author_name,comment,created_at")
      .eq("approval_id", itemResult.data.id)
      .order("created_at", { ascending: true });
    if (commentsResult.error) throw commentsResult.error;
    return { item: itemResult.data, comments: commentsResult.data ?? [] };
  };

  let state;
  try { state = await load(); } catch { return page("<div class=card><h1>Kunde inte öppna godkännandet</h1></div>", 500); }
  if (!state.item) return page("<div class=card><h1>Länken är ogiltig eller ersatt</h1><p class=muted>Be Aurora Media om en ny länk.</p></div>", 404);
  if (state.item.expires_at && new Date(state.item.expires_at).getTime() < Date.now()) {
    return page("<div class=card><h1>Länken har gått ut</h1><p class=muted>Be Aurora Media om en ny godkännandelänk.</p></div>", 410);
  }

  if (req.method === "POST" && state.item.status !== "cancelled") {
    const form = await req.formData();
    const action = String(form.get("action") ?? "");
    const authorName = String(form.get("author_name") ?? state.item.client_name ?? "Kund").trim().slice(0, 160) || "Kund";
    const comment = String(form.get("comment") ?? "").trim().slice(0, 4000);
    if (action === "approve" || action === "changes") {
      if (action === "changes" && !comment) {
        return page("<div class=card><h1>Skriv vad som ska ändras</h1><p class=muted>Gå tillbaka och lägg till en kommentar innan du begär ändringar.</p></div>", 400);
      }
      if (comment) {
        await admin.from("content_approval_comments").insert({ approval_id: state.item.id, author_name: authorName, comment });
      }
      await admin.from("content_approval_items").update({
        status: action === "approve" ? "approved" : "changes_requested",
        approved_at: action === "approve" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("id", state.item.id);
      state = await load();
    }
  }

  const item = state.item!;
  const media = safeUrl(item.media_url);
  const statusLabel: Record<string, string> = {
    awaiting_approval: "Väntar på ditt godkännande",
    changes_requested: "Ändringar begärda",
    approved: "Godkänd",
    cancelled: "Avslutad",
    draft: "Utkast",
  };
  const commentsHtml = state.comments.length
    ? `<div class=comments><h2>Kommentarer</h2>${state.comments.map((c: any) => `<div class=comment><strong>${esc(c.author_name)}</strong><br>${esc(c.comment)}</div>`).join("")}</div>`
    : "";
  const locked = ["approved", "cancelled"].includes(item.status);
  const formHtml = locked ? `<div class=notice>${item.status === "approved" ? "Tack – innehållet är godkänt." : "Det här godkännandet är avslutat."}</div>` : `
    <form method="post" action="?token=${encodeURIComponent(token)}">
      <label for=author_name>Ditt namn</label><input id=author_name name=author_name value="${esc(item.client_name)}" maxlength=160>
      <label for=comment>Kommentar ${item.status === "changes_requested" ? "(lägg gärna till mer om det behövs)" : "(valfritt vid godkännande)"}</label>
      <textarea id=comment name=comment placeholder="Skriv vad du vill ändra eller lämna en kommentar..."></textarea>
      <div class=actions><button class=approve name=action value=approve type=submit>Godkänn innehållet</button><button class=changes name=action value=changes type=submit>Begär ändringar</button></div>
    </form>`;

  return page(`<div class=brand>Aurora Media · Kundgodkännande</div><div class=card>
    <span class=pill>${esc(statusLabel[item.status] ?? item.status)}</span>
    <h1>${esc(item.title)}</h1><p class=muted>${esc(item.channel)} · För ${esc(item.client_name)}</p>
    <div class=content>${esc(item.body)}</div>
    ${media ? `<p><a href="${esc(media)}" target=_blank rel="noopener noreferrer">Öppna bifogat media ↗</a></p>` : ""}
    ${commentsHtml}${formHtml}
  </div>`);
});
