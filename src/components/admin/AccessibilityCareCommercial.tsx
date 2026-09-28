import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Plus, RefreshCw, ScanSearch, ShieldCheck } from "lucide-react";
import { ACCESSIBILITY_PLAN_DEFAULTS, accessibilityHealth, openRemediationCount, type AccessibilityPlan } from "@/lib/accessibilityCare";
import { adminFetch, AdminStatus } from "@/pages/admin/AdminShell";

type Account = { id:string; customer_name:string; site_name:string; base_url:string; plan:AccessibilityPlan; monthly_price_sek:number; scan_frequency:"manual"|"weekly"|"daily"; status:string; onboarding_status:string; manual_review_due_at:string|null; notes:string|null };
type Scan = { id:string; account_id:string; generated_at:string; pages_scanned:number; critical_count:number; serious_count:number; moderate_count:number; minor_count:number; scan_errors:number; report_url:string|null };
type Task = { id:string; account_id:string; title:string; severity:string; status:string; owner_name:string|null; estimated_minutes:number|null; issue_url:string|null };
type Data={accounts:Account[];scans:Scan[];tasks:Task[]};

const card:React.CSSProperties={background:"#fff",border:"1px solid var(--linje)",borderRadius:12,padding:18};
const input:React.CSSProperties={width:"100%",border:"1px solid var(--linje)",borderRadius:8,padding:"9px 10px",fontSize:13,background:"#fff"};

export default function AccessibilityCareCommercial() {
  const [data,setData]=useState<Data|null>(null);
  const [error,setError]=useState<unknown>(null);
  const [busy,setBusy]=useState(false);
  const [selectedId,setSelectedId]=useState("");
  const [form,setForm]=useState({customer_name:"",site_name:"",base_url:"https://",plan:"monitor" as AccessibilityPlan});

  const load=useCallback(async()=>{try{const next=await adminFetch("admin-accessibility-care",{method:"POST",body:JSON.stringify({action:"list"})}) as Data;setData(next);setSelectedId(v=>v||next.accounts[0]?.id||"");setError(null);}catch(e){setError(e);}},[]);
  useEffect(()=>{void load();},[load]);
  const mutate=async(payload:Record<string,unknown>)=>{setBusy(true);try{const next=await adminFetch("admin-accessibility-care",{method:"POST",body:JSON.stringify(payload)}) as Data;setData(next);setError(null);return true;}catch(e){setError(e);return false;}finally{setBusy(false);}};

  const selected=useMemo(()=>data?.accounts.find(a=>a.id===selectedId)??null,[data,selectedId]);
  const scans=useMemo(()=>data?.scans.filter(s=>s.account_id===selectedId)??[],[data,selectedId]);
  const tasks=useMemo(()=>data?.tasks.filter(t=>t.account_id===selectedId)??[],[data,selectedId]);
  const latest=scans[0]??null;
  const health=accessibilityHealth(latest);

  return <section style={{marginBottom:20}}>
    <AdminStatus loading={!data&&!error} error={error} onRetry={load}/>
    {data&&<>
      <section style={card}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div><p className="vk-mono" style={{margin:0,color:"var(--granbark-mut)"}}>ACCESSIBILITY CARE · KUNDLAGER</p><h2 style={{margin:"6px 0 0"}}>Monitoring som går att sälja och följa upp</h2><p style={{margin:"6px 0 0",fontSize:13,color:"var(--granbark-mut)",maxWidth:760}}>Guard fortsätter hitta tekniska fynd. Här ligger kund, paket, baseline, scan-historik och remediation. Automatiska fynd är inte en juridisk compliance-bedömning.</p></div>
          <button className="vk-btn" onClick={()=>void load()}><RefreshCw size={14}/> Uppdatera</button>
        </div>
        <form onSubmit={async e=>{e.preventDefault();const ok=await mutate({action:"create_account",...form});if(ok)setForm({customer_name:"",site_name:"",base_url:"https://",plan:"monitor"});}} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginTop:16}}>
          <input required style={input} placeholder="Kund" value={form.customer_name} onChange={e=>setForm(v=>({...v,customer_name:e.target.value}))}/>
          <input required style={input} placeholder="Sajtnamn" value={form.site_name} onChange={e=>setForm(v=>({...v,site_name:e.target.value}))}/>
          <input required style={input} placeholder="https://kund.se" value={form.base_url} onChange={e=>setForm(v=>({...v,base_url:e.target.value}))}/>
          <select style={input} value={form.plan} onChange={e=>setForm(v=>({...v,plan:e.target.value as AccessibilityPlan}))}>{(Object.keys(ACCESSIBILITY_PLAN_DEFAULTS) as AccessibilityPlan[]).map(plan=><option key={plan} value={plan}>{ACCESSIBILITY_PLAN_DEFAULTS[plan].label} · {ACCESSIBILITY_PLAN_DEFAULTS[plan].price} kr</option>)}</select>
          <button className="vk-btn vk-btn-primary" disabled={busy}><Plus size={14}/> Lägg kund</button>
        </form>
      </section>

      <div style={{display:"grid",gridTemplateColumns:"minmax(220px,.7fr) minmax(0,2fr)",gap:16,marginTop:16}}>
        <section style={card}><p className="vk-mono">KUNDER</p><div style={{display:"grid",gap:7,marginTop:10}}>{data.accounts.map(a=><button key={a.id} onClick={()=>setSelectedId(a.id)} style={{textAlign:"left",padding:11,borderRadius:9,border:"1px solid "+(a.id===selectedId?"var(--gran)":"var(--linje)"),background:a.id===selectedId?"#0f51320a":"#fff",cursor:"pointer"}}><strong>{a.site_name}</strong><span style={{display:"block",fontSize:11,color:"var(--granbark-mut)"}}>{a.plan} · {a.monthly_price_sek} kr</span></button>)}</div></section>
        {selected&&<div style={{display:"grid",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
            <Metric label="Status" value={health.label} icon={ShieldCheck}/>
            <Metric label="Öppna åtgärder" value={String(openRemediationCount(tasks))} icon={CreditCard}/>
            <Metric label="Scaner" value={String(scans.length)} icon={ScanSearch}/>
            <Metric label="Kritiska + allvarliga" value={String((latest?.critical_count??0)+(latest?.serious_count??0))} icon={ShieldCheck}/>
          </div>
          <section style={card}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}><div><strong>{selected.customer_name}</strong><span style={{display:"block",fontSize:12,color:"var(--granbark-mut)"}}>{selected.base_url} · {selected.scan_frequency}</span></div><span className="vk-mono">{selected.onboarding_status.toUpperCase()}</span></div>
            {latest&&<p style={{fontSize:12,color:"var(--granbark-mut)",marginTop:10}}>Senaste scan: {new Date(latest.generated_at).toLocaleString("sv-SE")} · {latest.pages_scanned} sidor · {latest.critical_count} kritiska · {latest.serious_count} allvarliga · {latest.moderate_count} måttliga.</p>}
          </section>
          <section style={card}><p className="vk-mono">REMEDIATION</p><div style={{display:"grid",gap:7,marginTop:10}}>{tasks.slice(0,20).map(t=><div key={t.id} style={{border:"1px solid var(--linje)",borderRadius:8,padding:10,fontSize:12}}><strong>{t.title}</strong><span style={{float:"right"}}>{t.status}</span><div style={{marginTop:4,color:"var(--granbark-mut)"}}>{t.severity}{t.owner_name?" · "+t.owner_name:""}{t.estimated_minutes?" · "+t.estimated_minutes+" min":""}</div></div>)}{tasks.length===0&&<p style={{fontSize:12,color:"var(--granbark-mut)"}}>Inga kommersiellt triagerade åtgärder ännu. Guard-kön visas nedanför.</p>}</div></section>
        </div>}
      </div>
    </>}
  </section>;
}

function Metric({label,value,icon:Icon}:{label:string;value:string;icon:typeof ShieldCheck}){return <div style={{...card,padding:14}}><Icon size={16}/><span style={{display:"block",fontSize:11,color:"var(--granbark-mut)",marginTop:6}}>{label}</span><strong style={{display:"block",fontSize:20,marginTop:3}}>{value}</strong></div>}
