/* ─────────────────────────────────────────────────────────────────────────
   AURORA — Nordic Noir design tokens
   Scoped under .aur to avoid leaking into pages som ännu inte är konverterade.
   Importeras av <NordicLayout /> som monterar dem en gång per sida.
   ───────────────────────────────────────────────────────────────────────── */

export const NORDIC_TOKENS = `
  .aur {
    --ink:#0B0E0C;
    --ink-2:#121613;
    --bone:#E9E4D6;
    --bone-soft:rgba(233,228,214,0.74);
    --bone-mute:rgba(233,228,214,0.5);
    --bone-faint:rgba(233,228,214,0.22);
    --hair:rgba(233,228,214,0.13);
    --moss:#7FE3B0;
    --moss-soft:#5FBE8E;
    --font-mono:"JetBrains Mono", ui-monospace, monospace;
    --font-display:"Fraunces", Georgia, serif;
    --font-body:"Inter", system-ui, sans-serif;
    background:var(--ink);
    color:var(--bone);
    font-family:var(--font-body);
    font-size:15px; line-height:1.6;
    min-height:100vh; overflow-x:clip; position:relative;
  }
  .aur *::selection{ background:var(--moss); color:var(--ink); }
  .aur .wrap{ max-width:1320px; margin-inline:auto; padding-inline:clamp(20px,4vw,56px); }

  .aur .mono{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.06em; color:var(--moss); font-weight:500; }
  .aur .mono-md{ font-family:var(--font-mono); font-size:13px; letter-spacing:0.02em; color:var(--bone); font-weight:500; }
  .aur .meta-label{ color:var(--bone-mute); font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; }

  .aur .hero-line{
    font-family:var(--font-mono); font-weight:500;
    font-size:clamp(2rem, 6vw, 5rem);
    line-height:1.04; letter-spacing:-0.03em; color:var(--bone);
  }
  .aur .hero-line .it{ font-family:var(--font-display); font-style:italic; font-weight:400; color:var(--moss); letter-spacing:-0.02em; }
  .aur .h2{
    font-family:var(--font-mono); font-weight:500;
    font-size:clamp(1.8rem,4.4vw,3.4rem);
    line-height:1.08; letter-spacing:-0.025em; color:var(--bone);
  }
  .aur .h2 .it{ font-family:var(--font-display); font-style:italic; color:var(--moss); font-weight:400; }
  .aur .h3{ font-family:var(--font-mono); font-weight:500; font-size:clamp(1.05rem,1.6vw,1.35rem); letter-spacing:-0.01em; color:var(--bone); }
  .aur .lead{ font-size:clamp(1rem,1.18vw,1.12rem); line-height:1.65; color:var(--bone-soft); max-width:54ch; }
  .aur .body{ color:var(--bone-soft); font-size:0.97rem; line-height:1.7; }
  .aur a.text-link{ color:var(--moss); text-decoration:none; border-bottom:1px solid var(--bone-faint); transition:border-color 200ms; }
  .aur a.text-link:hover{ border-bottom-color:var(--moss); }

  /* Buttons */
  .aur .btn{
    display:inline-flex; align-items:center; gap:10px;
    padding:11px 20px 11px 22px; border-radius:9999px;
    font-family:var(--font-mono); font-size:12px; letter-spacing:0.04em;
    font-weight:500; cursor:pointer; text-decoration:none;
    transition:all 220ms cubic-bezier(0.2,0.8,0.2,1);
    border:1px solid transparent; white-space:nowrap;
  }
  .aur .btn .a{ display:inline-flex; transition:transform 220ms cubic-bezier(0.2,0.8,0.2,1); }
  .aur .btn:hover .a{ transform:translateX(3px); }
  .aur .btn-moss{ background:var(--moss); color:var(--ink); }
  .aur .btn-moss:hover{ background:var(--bone); }
  .aur .btn-ghost{ background:transparent; color:var(--bone); border-color:var(--bone-faint); }
  .aur .btn-ghost:hover{ border-color:var(--moss); color:var(--moss); }

  /* Nav */
  .aur .nav{
    position:fixed; inset:0 0 auto 0; z-index:50;
    padding:18px clamp(20px,4vw,56px);
    display:flex; align-items:center; justify-content:space-between;
    transition:background 240ms ease, backdrop-filter 240ms ease, border-color 240ms ease;
    border-bottom:1px solid transparent;
  }
  .aur .nav.scrolled{
    background:rgba(11,14,12,0.78);
    backdrop-filter:saturate(140%) blur(14px);
    -webkit-backdrop-filter:saturate(140%) blur(14px);
    border-bottom-color:var(--hair);
  }
  .aur .brand{ font-family:var(--font-mono); font-size:18px; letter-spacing:-0.02em; color:var(--moss); text-decoration:none; font-weight:500; display:inline-flex; align-items:center; gap:6px; }
  .aur .brand .glyph{ color:var(--bone); font-style:italic; font-family:var(--font-display); }
  .aur .nav-menu{ display:none; gap:26px; align-items:center; }
  @media(min-width:980px){ .aur .nav-menu{ display:flex; } }
  .aur .nav-menu a{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-soft); text-decoration:none; transition:color 180ms; }
  .aur .nav-menu a:hover, .aur .nav-menu a.active{ color:var(--moss); }
  .aur .nav-progress{ width:120px; height:1px; background:var(--hair); position:relative; overflow:hidden; display:none; margin:0 16px; }
  @media(min-width:760px){ .aur .nav-progress{ display:block; } }
  .aur .nav-progress::after{ content:""; position:absolute; left:0; top:0; bottom:0; width:var(--p,8%); background:var(--moss); box-shadow:0 0 10px var(--moss); }
  .aur .nav-burger{ display:inline-flex; flex-direction:column; gap:5px; align-items:flex-end; background:none; border:none; padding:8px; cursor:pointer; margin-left:12px; }
  @media(min-width:980px){ .aur .nav-burger{ display:none; } }
  .aur .nav-burger span{ display:block; height:1px; background:var(--bone); transition:transform 200ms, opacity 200ms, width 200ms; }
  .aur .nav-burger span:nth-child(1){ width:22px; }
  .aur .nav-burger span:nth-child(2){ width:16px; }
  .aur .nav-burger span:nth-child(3){ width:22px; }
  .aur .nav-burger.open span:nth-child(1){ transform:translateY(6px) rotate(45deg); }
  .aur .nav-burger.open span:nth-child(2){ opacity:0; }
  .aur .nav-burger.open span:nth-child(3){ transform:translateY(-6px) rotate(-45deg); }
  .aur .mob-menu{ position:fixed; inset:0; z-index:49; background:var(--ink); padding:84px clamp(20px,4vw,56px) 40px; display:flex; flex-direction:column; }
  @media(min-width:980px){ .aur .mob-menu{ display:none; } }
  .aur .mob-menu a{ display:block; font-family:var(--font-display); font-style:italic; font-size:clamp(28px,6vw,40px); color:var(--bone); text-decoration:none; padding:14px 0; border-bottom:1px solid var(--hair); }
  .aur .mob-menu a:hover{ color:var(--moss); }

  /* Hero */
  .aur .hero{ position:relative; display:flex; flex-direction:column; isolation:isolate; background:var(--ink); }
  .aur .hero::before{
    content:""; position:absolute; inset:0; z-index:-1; pointer-events:none;
    background:
      radial-gradient(60% 50% at 85% 15%, rgba(127,227,176,0.08), transparent 70%),
      radial-gradient(50% 60% at 5% 90%, rgba(127,227,176,0.05), transparent 70%);
  }
  .aur .hero-content{ position:relative; padding-bottom:clamp(40px, 6vh, 72px); padding-top:clamp(96px, 14vh, 132px); display:grid; grid-template-columns:1fr; gap:clamp(20px, 4vw, 40px); align-items:center; }
  @media(min-width:980px){ .aur .hero-content{ grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.6fr); } }
  .aur .hero-text{ display:flex; flex-direction:column; justify-content:center; }
  .aur .hero-figure-wrap{ display:flex; justify-content:center; align-items:center; order:-1; }
  @media(min-width:980px){ .aur .hero-figure-wrap{ order:0; justify-content:flex-end; } }
  .aur .hero-figure{ position:relative; width:100%; max-width:min(82vw, 320px); aspect-ratio: 4/5; border-radius:6px; overflow:hidden; border:1px solid var(--hair); background:var(--ink-soft); box-shadow:0 24px 60px -36px rgba(0,0,0,0.8); }
  @media(min-width:980px){ .aur .hero-figure{ max-width:340px; } }
  .aur .hero-figure img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:saturate(0.92) brightness(0.88); }
  .aur .hero-figure-overlay{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(11,14,12,0.05) 0%, rgba(11,14,12,0.35) 75%, rgba(11,14,12,0.7) 100%); pointer-events:none; }
  .aur .hero-figure-tag{ position:absolute; left:14px; bottom:12px; font-family:var(--font-mono); font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--bone); padding:5px 9px; border:1px solid rgba(245,242,234,0.2); border-radius:999px; background:rgba(11,14,12,0.4); backdrop-filter:blur(6px); }

  .aur .clock{ display:inline-flex; align-items:center; gap:8px; font-family:var(--font-mono); font-size:11px; letter-spacing:0.1em; color:var(--bone); }
  .aur .clock::before{ content:""; width:6px; height:6px; border-radius:50%; background:var(--moss); box-shadow:0 0 10px var(--moss); animation:aur-pulse 2.4s ease-in-out infinite; }
  @keyframes aur-pulse{ 0%,100%{opacity:1; transform:scale(1);} 50%{opacity:.4; transform:scale(.65);} }

  .aur .hero-trust{ display:grid; grid-template-columns:1fr; gap:14px; margin-top:30px; max-width:560px; }
  @media(min-width:760px){ .aur .hero-trust{ grid-template-columns:repeat(2,1fr); } }
  .aur .trust-item{ display:flex; gap:10px; align-items:flex-start; color:var(--bone-soft); font-size:0.92rem; line-height:1.45; }
  .aur .trust-item .ic{ color:var(--moss); margin-top:2px; flex-shrink:0; }

  /* Page hero (no bg image) used by inner pages */
  .aur .page-hero{ padding-top:clamp(140px,16vw,200px); padding-bottom:clamp(48px,7vw,88px); position:relative; }
  .aur .page-hero::before{
    content:""; position:absolute; inset:0; z-index:-1; pointer-events:none;
    background:
      radial-gradient(60% 50% at 80% 0%, rgba(127,227,176,0.10), transparent 70%),
      radial-gradient(40% 40% at 10% 20%, rgba(127,227,176,0.06), transparent 70%);
  }

  /* Section base */
  .aur .section{ padding-block:clamp(80px, 11vw, 150px); position:relative; }
  .aur .section + .section{ border-top:1px solid var(--hair); }
  .aur .sec-head{ display:grid; grid-template-columns:1fr; gap:24px; margin-bottom:clamp(48px,7vw,88px); }
  @media(min-width:900px){ .aur .sec-head{ grid-template-columns:1fr 2fr; gap:clamp(32px,5vw,80px); align-items:start; } }

  /* Aurora-metoden timeline */
  .aur .timeline{
    display:grid; grid-template-columns:1fr; gap:1px;
    background:var(--hair); border:1px solid var(--hair);
    margin-top:clamp(40px,6vw,72px);
  }
  @media(min-width:760px){ .aur .timeline{ grid-template-columns:repeat(3,1fr); } }
  .aur .tl-step{ background:var(--ink); padding:clamp(28px,3.4vw,44px); transition:background 200ms; }
  .aur .tl-step:hover{ background:var(--ink-2); }
  .aur .tl-num{ font-family:var(--font-display); font-style:italic; font-size:2.4rem; line-height:1; color:var(--moss); display:block; margin-bottom:18px; }
  .aur .tl-day{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-mute); margin-bottom:10px; display:block; }
  .aur .tl-title{ font-family:var(--font-mono); font-size:1.25rem; color:var(--bone); margin-bottom:10px; letter-spacing:-0.01em; font-weight:500; }

  /* Services 3-col */
  .aur .svc-grid{
    display:grid; grid-template-columns:1fr; gap:1px;
    background:var(--hair); border:1px solid var(--hair);
    margin-top:clamp(40px,6vw,72px);
  }
  @media(min-width:700px){ .aur .svc-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(min-width:1000px){ .aur .svc-grid{ grid-template-columns:repeat(3,1fr); } }
  .aur .svc-cell{ background:var(--ink); padding:clamp(24px,2.4vw,32px); transition:background 200ms; display:block; text-decoration:none; color:inherit; }
  .aur .svc-cell:hover{ background:var(--ink-2); }
  .aur .svc-num{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.06em; color:var(--moss); display:block; margin-bottom:14px; }
  .aur .svc-title{ font-family:var(--font-mono); font-size:1.1rem; color:var(--bone); margin-bottom:6px; font-weight:500; letter-spacing:-0.01em; }
  .aur .svc-tag{ font-family:var(--font-display); font-style:italic; color:var(--moss-soft); font-size:0.95rem; margin-bottom:10px; display:block; }

  /* Work / projects */
  .aur .work-feature{
    border:1px solid var(--hair); padding:clamp(28px,3.4vw,48px);
    border-radius:8px; margin-bottom:24px;
    background:linear-gradient(180deg, rgba(127,227,176,0.04), transparent 60%);
    display:grid; grid-template-columns:1fr; gap:18px;
  }
  @media(min-width:900px){ .aur .work-feature{ grid-template-columns:auto 1fr auto; align-items:start; gap:36px; } }
  .aur .work-feature .badge{ font-family:var(--font-mono); font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--ink); background:var(--moss); padding:5px 10px; border-radius:4px; align-self:start; display:inline-block; }
  .aur .work-feature h3{ font-family:var(--font-mono); font-size:clamp(1.4rem,2.4vw,2rem); letter-spacing:-0.02em; color:var(--bone); margin-bottom:10px; font-weight:500; }
  .aur .work-grid{ display:grid; grid-template-columns:1fr; gap:1px; background:var(--hair); border:1px solid var(--hair); }
  @media(min-width:700px){ .aur .work-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(min-width:1000px){ .aur .work-grid{ grid-template-columns:repeat(3,1fr); } }
  .aur .work-card{ background:var(--ink); padding:clamp(22px,2.2vw,28px); transition:background 200ms; display:block; text-decoration:none; color:inherit; }
  .aur .work-card:hover{ background:var(--ink-2); }
  .aur .work-card h4{ font-family:var(--font-mono); font-size:1.05rem; color:var(--bone); margin-bottom:8px; font-weight:500; }
  .aur .work-card .url{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.04em; color:var(--moss); }
  .aur .work-card .meta{ font-family:var(--font-mono); font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--bone-mute); margin-top:14px; }

  /* Pills row */
  .aur .pill{ display:inline-block; padding:6px 12px; border:1px solid var(--hair); border-radius:9999px; font-family:var(--font-mono); font-size:11px; letter-spacing:0.04em; color:var(--bone-soft); margin:4px 4px 0 0; transition:all 180ms; }
  .aur .pill:hover{ border-color:var(--moss); color:var(--moss); }

  /* Industries */
  .aur .ind-grid{ display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--hair); border:1px solid var(--hair); margin-top:clamp(40px,6vw,72px); }
  @media(min-width:760px){ .aur .ind-grid{ grid-template-columns:repeat(4,1fr); } }
  .aur .ind-cell{ background:var(--ink); padding:clamp(20px,2.2vw,30px); font-family:var(--font-mono); font-size:0.95rem; color:var(--bone); transition:background 200ms; letter-spacing:-0.005em; }
  .aur .ind-cell:hover{ background:var(--ink-2); color:var(--moss); }

  /* Integrations columns */
  .aur .int-grid{ display:grid; grid-template-columns:1fr; gap:1px; background:var(--hair); border:1px solid var(--hair); margin-top:clamp(40px,6vw,72px); }
  @media(min-width:700px){ .aur .int-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(min-width:1000px){ .aur .int-grid{ grid-template-columns:repeat(3,1fr); } }
  .aur .int-cell{ background:var(--ink); padding:clamp(22px,2.4vw,30px); }
  .aur .int-cell h4{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--moss); margin-bottom:10px; }
  .aur .int-cell p{ color:var(--bone-soft); font-size:0.95rem; line-height:1.55; }

  /* Process steps stacked */
  .aur .proc-grid{ display:grid; grid-template-columns:1fr; border-top:1px solid var(--hair); border-bottom:1px solid var(--hair); margin-top:clamp(40px,6vw,72px); }
  @media(min-width:900px){ .aur .proc-grid{ grid-template-columns:repeat(5,1fr); } }
  .aur .proc-step{ padding:clamp(26px,2.8vw,40px); border-bottom:1px solid var(--hair); }
  @media(min-width:900px){ .aur .proc-step{ border-bottom:none; border-right:1px solid var(--hair); } .aur .proc-step:last-child{ border-right:none; } }
  .aur .proc-num{ font-family:var(--font-display); font-style:italic; font-size:2.6rem; line-height:1; color:var(--moss); display:block; margin-bottom:16px; }
  .aur .proc-name{ font-family:var(--font-mono); font-size:1.1rem; color:var(--bone); margin-bottom:10px; font-weight:500; letter-spacing:-0.01em; }

  /* Pricing */
  .aur .price-grid{ display:grid; grid-template-columns:1fr; gap:18px; margin-top:clamp(40px,6vw,72px); }
  @media(min-width:880px){ .aur .price-grid{ grid-template-columns:repeat(3,1fr); align-items:stretch; } }
  .aur .price-card{ border:1px solid var(--hair); border-radius:10px; padding:clamp(28px,3vw,40px); display:flex; flex-direction:column; background:var(--ink); position:relative; transition:border-color 200ms, transform 200ms; }
  .aur .price-card:hover{ border-color:var(--bone-faint); transform:translateY(-2px); }
  .aur .price-card.featured{ border-color:var(--moss); background:linear-gradient(180deg, rgba(127,227,176,0.08), transparent 60%); }
  .aur .price-num{ font-family:var(--font-display); font-style:italic; font-size:2.2rem; color:var(--moss); display:block; margin-bottom:8px; }
  .aur .price-tag{ position:absolute; top:-10px; right:24px; background:var(--moss); color:var(--ink); font-family:var(--font-mono); font-size:10px; letter-spacing:0.16em; padding:5px 10px; border-radius:4px; text-transform:uppercase; }
  .aur .price-card h3{ font-family:var(--font-mono); font-size:1.5rem; color:var(--bone); margin-bottom:10px; font-weight:500; letter-spacing:-0.01em; }
  .aur .price-list{ list-style:none; padding:0; margin:22px 0; display:flex; flex-direction:column; gap:10px; }
  .aur .price-list li{ display:flex; gap:10px; color:var(--bone-soft); font-size:0.95rem; line-height:1.5; }
  .aur .price-list li svg{ color:var(--moss); flex-shrink:0; margin-top:3px; }
  .aur .price-card .btn{ margin-top:auto; }

  /* Generic feature row (used by Om, Process, Metodik) */
  .aur .feat-list{ display:grid; grid-template-columns:1fr; gap:0; border-top:1px solid var(--hair); margin-top:clamp(40px,6vw,72px); }
  .aur .feat-row{ display:grid; grid-template-columns:60px 1fr; gap:clamp(16px,2vw,32px); padding:clamp(22px,2.6vw,30px) 0; border-bottom:1px solid var(--hair); align-items:start; }
  @media(min-width:760px){ .aur .feat-row{ grid-template-columns:80px 1fr 2fr; } }
  .aur .feat-num{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.08em; color:var(--bone-mute); padding-top:4px; }
  .aur .feat-title{ font-family:var(--font-mono); font-size:clamp(1rem,1.5vw,1.15rem); color:var(--bone); font-weight:500; letter-spacing:-0.01em; }
  .aur .feat-body{ color:var(--bone-soft); font-size:0.95rem; line-height:1.65; }

  /* CTA */
  .aur .cta-band{ padding-block:clamp(96px,14vw,180px); position:relative; overflow:hidden; border-top:1px solid var(--hair); }
  .aur .cta-band::after{ content:""; position:absolute; inset:0; background:radial-gradient(50% 60% at 80% 20%, rgba(127,227,176,0.18), transparent 70%); pointer-events:none; }
  .aur .cta-email{ font-family:var(--font-display); font-style:italic; font-size:clamp(1.6rem,3.2vw,2.4rem); color:var(--bone); text-decoration:none; border-bottom:1px solid var(--bone-faint); padding-bottom:6px; letter-spacing:-0.02em; transition:color 200ms, border-color 200ms; display:inline-block; }
  .aur .cta-email:hover{ color:var(--moss); border-bottom-color:var(--moss); }

  /* Forms (Kontakt) */
  .aur .field{ display:flex; flex-direction:column; gap:8px; margin-bottom:18px; }
  .aur .field label{ font-family:var(--font-mono); font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--bone-mute); }
  .aur .field input, .aur .field textarea, .aur .field select{
    background:transparent; border:1px solid var(--hair); border-radius:6px;
    color:var(--bone); padding:12px 14px; font-family:var(--font-body); font-size:15px;
    transition:border-color 180ms;
  }
  .aur .field input:focus, .aur .field textarea:focus, .aur .field select:focus{
    outline:none; border-color:var(--moss);
  }

  /* Footer */
  .aur .foot{ padding-block:clamp(56px,7vw,88px); border-top:1px solid var(--hair); color:var(--bone-mute); font-family:var(--font-mono); font-size:12px; letter-spacing:0.04em; }
  .aur .foot a{ color:var(--bone-soft); text-decoration:none; transition:color 180ms; display:block; padding:5px 0; }
  .aur .foot a:hover{ color:var(--moss); }
  .aur .foot-grid{ display:grid; grid-template-columns:1fr; gap:32px; }
  @media(min-width:760px){ .aur .foot-grid{ grid-template-columns:2fr 1fr 1fr 1fr; } }

  @media (prefers-reduced-motion: reduce){
    .aur *, .aur *::before, .aur *::after{ animation:none !important; transition:none !important; }
  }
`;
