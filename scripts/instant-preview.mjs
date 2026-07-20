#!/usr/bin/env node
/*
 * INSTANT PREVIEW – synligt statiskt innehåll direkt i <div id="root">.
 *
 * Tidigare låg SEO-texten i en dold div (konverterad till <noscript>), vilket
 * gav en helt vit sida tills JS-bundlen laddat – dödligt för kall mobiltrafik.
 * Nu renderas en verkstad-stylad förhandsvisning av sidan direkt i HTML:en.
 * Den syns på ~0 ms, React ersätter den när appen bootar, och länkarna i den
 * fungerar till och med utan JavaScript.
 */

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const PREVIEW_CSS = `
#instant-preview{background:#F6F5F1;color:#14171A;min-height:100vh;font-family:'Schibsted Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif;display:flex;flex-direction:column}
#instant-preview *,#instant-preview *::before,#instant-preview *::after{box-sizing:border-box}
#instant-preview h1,#instant-preview h2,#instant-preview h3,#instant-preview p,#instant-preview ul{margin:0}
#instant-preview a{color:inherit;text-decoration:none}
.ip-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px clamp(20px,5vw,48px);border-bottom:1px solid #E2E0DA}
.ip-logo{display:inline-flex;align-items:center;gap:9px;font-weight:700;font-size:17px;letter-spacing:-.01em}
.ip-dot{width:9px;height:9px;background:#E8500A;border-radius:2px;display:inline-block}
.ip-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid #14171A;border-radius:999px;padding:9px 16px;font-size:13.5px;font-weight:600;white-space:nowrap}
.ip-main{flex:1;width:100%;max-width:880px;padding:clamp(44px,8vh,96px) clamp(20px,5vw,48px)}
.ip-mono{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:#3E444B;margin-bottom:16px}
.ip-mono i{width:7px;height:7px;background:#E8500A;border-radius:50%;display:inline-block;margin-right:8px;vertical-align:1px}
.ip-h1{font-size:clamp(32px,5.4vw,58px);line-height:1.06;letter-spacing:-.025em;font-weight:800;max-width:20ch;margin-bottom:20px}
.ip-body{font-size:16.5px;line-height:1.65;color:#4A5058;max-width:64ch}
.ip-body p{margin-bottom:14px}
.ip-body h1{font-size:clamp(28px,4.6vw,46px);line-height:1.1;letter-spacing:-.02em;color:#14171A;margin-bottom:16px}
.ip-body h2{font-size:22px;line-height:1.25;letter-spacing:-.015em;color:#14171A;margin:30px 0 10px}
.ip-body h3{font-size:18px;color:#14171A;margin:22px 0 8px}
.ip-body ul{padding-left:20px;margin:0 0 14px}
.ip-body li{margin-bottom:6px}
.ip-cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.ip-btn{display:inline-flex;align-items:center;gap:8px;background:#E8500A;color:#fff;font-size:15px;font-weight:600;border-radius:10px;padding:14px 22px;min-height:48px}
.ip-btn.ghost{background:transparent;color:#14171A;border:1px solid #14171A}
.ip-progress{position:fixed;left:0;right:0;bottom:0;height:3px;background:rgba(20,23,26,.08);z-index:10}
.ip-progress span{display:block;height:100%;width:38%;background:linear-gradient(90deg,#E8500A,#0F5132);animation:ip-slide 1.1s ease-in-out infinite}
@keyframes ip-slide{0%{transform:translateX(-100%)}100%{transform:translateX(270%)}}
@media (prefers-reduced-motion:reduce){.ip-progress span{animation:none;width:100%}}
`;

/**
 * Bygger förhandsvisnings-HTML för en sida.
 * @param {object} opts
 * @param {string} opts.title      Sidans titel (används som H1 om body saknar egen h1)
 * @param {string} opts.body       Brödtext – ren text eller HTML
 * @param {string} [opts.mono]     Liten mono-etikett ovanför rubriken
 * @param {Array<{label:string,href:string,ghost?:boolean}>} [opts.ctas]
 */
export function buildInstantPreview({ title, body, mono, ctas }) {
  const bodyStr = String(body ?? "");
  const bodyIsHtml = /<[a-z][\s\S]*?>/i.test(bodyStr);
  const bodyHasH1 = bodyIsHtml && /<h1[\s>]/i.test(bodyStr);
  const inner = bodyIsHtml ? bodyStr : `<p>${escapeHtml(bodyStr)}</p>`;
  const ctaHtml = (ctas ?? [])
    .map(
      (c) =>
        `<a class="ip-btn${c.ghost ? " ghost" : ""}" href="${escapeHtml(c.href)}">${escapeHtml(c.label)} <span aria-hidden="true">→</span></a>`,
    )
    .join("");

  return `<!-- instant-preview:start -->
<div id="instant-preview">
<style>${PREVIEW_CSS}</style>
<nav class="ip-nav" aria-label="Översta navigering">
  <a class="ip-logo" href="/"><span class="ip-dot" aria-hidden="true"></span>aurora media</a>
  <a class="ip-pill" href="/kontakt">Boka samtal <span aria-hidden="true">→</span></a>
</nav>
<main class="ip-main">
  ${mono ? `<p class="ip-mono"><i aria-hidden="true"></i>${escapeHtml(mono)}</p>` : ""}
  ${bodyHasH1 ? "" : `<h1 class="ip-h1">${escapeHtml(title)}</h1>`}
  <div class="ip-body">${inner}</div>
  ${ctaHtml ? `<div class="ip-cta-row">${ctaHtml}</div>` : ""}
</main>
<div class="ip-progress" aria-hidden="true"><span></span></div>
</div>
<!-- instant-preview:end -->`;
}

/**
 * Sätter (eller ersätter) förhandsvisningen i en HTML-sträng.
 * Hanterar både orörd mall (`<div id="root"></div>`) och en sida som redan
 * har en preview (t.ex. när dist/index.html används som mall).
 */
export function setInstantPreview(html, preview) {
  const block = `<div id="root">${preview}</div>`;
  if (html.includes('<div id="root"></div>')) {
    return html.replace('<div id="root"></div>', block);
  }
  const replaced = html.replace(
    /<div id="root">\s*<!-- instant-preview:start -->[\s\S]*?<!-- instant-preview:end -->\s*<\/div>/,
    block,
  );
  if (replaced === html) {
    throw new Error("Kunde inte sätta instant preview: varken tom #root eller befintlig preview hittades.");
  }
  return replaced;
}
