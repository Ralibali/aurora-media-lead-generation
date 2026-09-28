import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, PhoneCall, Plus, Rocket, ShieldCheck, Users } from "lucide-react";
import { VOICE_VERTICALS, voicePilotMetrics, type VoiceVertical } from "@/lib/voicePilot";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type Pilot={id:string;customer_name:string;vertical:VoiceVertical;use_case:string;status:string;setup_price_sek:number;monthly_price_sek:number;runtime_provider:string;integration_target:string|null;opening_hours:string|null;handoff_number:string|null;retention_days:number;external_pilot_id:string|null;notes:string|null};
type Call={id:string;pilot_id:string;duration_seconds:number;outcome:string;automated:boolean;cost_ore:number|null;occurred_at:string};
type Data={pilots:Pilot[];calls:Call[];runtimeConfigured:boolean};

const card:React.CSSProperties={background:"#fff",border:"1px solid var(--linje)",borderRadius:12,padding:18};
const input:React.CSSProperties={width:"100%",border:"1px solid var(--linje)",borderRadius:8,padding:"9px 10px",fontSize:13,background:"#fff"};

export default function VoicePilots(){
  const [data,setData]=useState<Data|null>(null);
  const [error,setError]=useState<unknown>(null);
  const [busy,setBusy]=useState(false);
  const [selectedId,setSelectedId]=useState("");
  const [form,setForm]=useState({customer_name:"",vertical:"traffic_school" as VoiceVertical,use_case:VOICE_VERTICALS.traffic_school.firstUseCase,opening_hours:"Vardagar 08:00–17:00",handoff_number:"",integration_target:""});

  const load=useCallback(async()=>{try{const next=await adminFetch("admin-voice-pilots",{method:"POST",body:JSON.stringify({action:"list"})}) as Data;setData(next);setSelectedId(v=>v||next.pilots[0]?.id||"");setError(null);}catch(e){setError(e);}},[]);
  useEffect(()=>{void load();},[load]);
  const mutate=async(payload:Record<string,unknown>)=>{setBusy(true);try{const next=await adminFetch("admin-voice-pilots",{method:"POST",body:JSON.stringify(payload)}) as Data;setData(next);setError(null);return true;}catch(e){setError(e);return false;}finally{setBusy(false);}};

  const selected=useMemo(()=>data?.pilots.find(p=>p.id===selectedId)??null,[data,selectedId]);
  const calls=useMemo(()=>data?.calls.filter(c=>c.pilot_id===selectedId)??[],[data,selectedId]);
  const metrics=voicePilotMetrics(calls);

  const setVertical=(vertical:VoiceVertical)=>setForm(v=>({...v,vertical,use_case:VOICE_VERTICALS[vertical].firstUseCase}));

  return <AdminShell title="Aurora Voice Pilots" kicker="Aurora Voice · pilotdrift">
    <AdminStatus loading={!data&&!error} error={error} onRetry={load}/>
    {data&&<>
      <section style={card}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div><p className="vk-mono" style={{margin:0,color:"var(--granbark-mut)"}}>VOICE PILOT OPS</p><h2 style={{margin:"6px 0 0"}}>Sälj pilot först. Provisionera efter godkännande.</h2><p style={{margin:"6px 0 0",maxWidth:760,fontSize:13,color:"var(--granbark-mut)"}}>Tre branschflöden har hårda guardrails. Publika formulär kan aldrig aktivera telefoni. Runtime-provisionering kräver approved-status och server-side VOICE_RUNTIME_URL/TOKEN.</p></div>
          <span className="vk-mono" style={{color:data.runtimeConfigured?"#217A4B":"#8A6518"}}>{data.runtimeConfigured?"RUNTIME KONFIGURERAD":"RUNTIME EJ KONFIGURERAD"}</span>
        </div>
        <form onSubmit={async e=>{e.preventDefault();const ok=await mutate({action:"create_pilot",...form,runtime_provider:"pipecat"});if(ok)setForm({customer_name:"",vertical:"traffic_school",use_case:VOICE_VERTICALS.traffic_school.firstUseCase,opening_hours:"Vardagar 08:00–17:00",handoff_number:"",integration_target:""});}} style={{display:"grid",gap:8,marginTop:16}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
            <input required style={input} placeholder="Kund" value={form.customer_name} onChange={e=>setForm(v=>({...v,customer_name:e.target.value}))}/>
            <select style={input} value={form.vertical} onChange={e=>setVertical(e.target.value as VoiceVertical)}>{(["traffic_school","stay","transport","service","other"] as VoiceVertical[]).map(v=><option key={v} value={v}>{VOICE_VERTICALS[v].label}</option>)}</select>
            <input style={input} placeholder="Öppettider" value={form.opening_hours} onChange={e=>setForm(v=>({...v,opening_hours:e.target.value}))}/>
            <input style={input} placeholder="Överlämningsnummer" value={form.handoff_number} onChange={e=>setForm(v=>({...v,handoff_number:e.target.value}))}/>
            <input style={input} placeholder="Integration, t.ex. Aurora Transport" value={form.integration_target} onChange={e=>setForm(v=>({...v,integration_target:e.target.value}))}/>
          </div>
          <textarea required style={{...input,resize:"vertical"}} rows={3} value={form.use_case} onChange={e=>setForm(v=>({...v,use_case:e.target.value}))}/>
          <div><button className="vk-btn vk-btn-primary" disabled={busy}><Plus size={14}/> Skapa pilot</button></div>
        </form>
      </section>

      <div style={{display:"grid",gridTemplateColumns:"minmax(220px,.7fr) minmax(0,2fr)",gap:16,marginTop:16}}>
        <section style={card}><p className="vk-mono">PILOTER</p><div style={{display:"grid",gap:7,marginTop:10}}>{data.pilots.map(p=><button key={p.id} onClick={()=>setSelectedId(p.id)} style={{textAlign:"left",padding:11,borderRadius:9,border:"1px solid "+(p.id===selectedId?"var(--gran)":"var(--linje)"),background:p.id===selectedId?"#0f51320a":"#fff",cursor:"pointer"}}><strong>{p.customer_name}</strong><span style={{display:"block",fontSize:11,color:"var(--granbark-mut)"}}>{VOICE_VERTICALS[p.vertical].label} · {p.status}</span></button>)}</div></section>
        {selected&&<div style={{display:"grid",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
            <Metric label="Samtal" value={String(metrics.total)} icon={PhoneCall}/>
            <Metric label="Automation" value={Math.round(metrics.automationRate*100)+"%"} icon={CheckCircle2}/>
            <Metric label="Leads/bokningsunderlag" value={String(metrics.qualifiedLeads)} icon={Users}/>
            <Metric label="Kostnad" value={metrics.costSek.toLocaleString("sv-SE")+" kr"} icon={Rocket}/>
          </div>

          <section style={card}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><strong>{selected.customer_name}</strong><span style={{display:"block",fontSize:12,color:"var(--granbark-mut)"}}>{VOICE_VERTICALS[selected.vertical].label} · {selected.setup_price_sek.toLocaleString("sv-SE")} kr setup · {selected.monthly_price_sek.toLocaleString("sv-SE")} kr/mån</span></div><span className="vk-mono">{selected.status.toUpperCase()}</span></div>
            <p style={{fontSize:13,lineHeight:1.6}}>{selected.use_case}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10,marginTop:12}}>
              <Guard title="Tillåtet i pilot" items={VOICE_VERTICALS[selected.vertical].allowedActions} good/>
              <Guard title="Kräver verifierad integration" items={VOICE_VERTICALS[selected.vertical].prohibitedUntilVerified}/>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}>
              {selected.status==="intake"&&<button className="vk-btn" disabled={busy} onClick={()=>void mutate({action:"update_pilot",pilot_id:selected.id,status:"design",runtime_provider:selected.runtime_provider,retention_days:selected.retention_days,setup_price_sek:selected.setup_price_sek,monthly_price_sek:selected.monthly_price_sek,opening_hours:selected.opening_hours,handoff_number:selected.handoff_number,integration_target:selected.integration_target,notes:selected.notes})}>Starta design</button>}
              {selected.status==="design"&&<button className="vk-btn vk-btn-primary" disabled={busy} onClick={()=>void mutate({action:"update_pilot",pilot_id:selected.id,status:"approved",runtime_provider:selected.runtime_provider,retention_days:selected.retention_days,setup_price_sek:selected.setup_price_sek,monthly_price_sek:selected.monthly_price_sek,opening_hours:selected.opening_hours,handoff_number:selected.handoff_number,integration_target:selected.integration_target,notes:selected.notes})}><ShieldCheck size={14}/> Godkänn pilot</button>}
              {selected.status==="approved"&&<button className="vk-btn vk-btn-primary" disabled={busy||!data.runtimeConfigured} onClick={()=>void mutate({action:"provision",pilot_id:selected.id})}><Rocket size={14}/> Provisionera runtime</button>}
            </div>
          </section>

          <section style={card}><p className="vk-mono">PILOTBEVIS</p><p style={{fontSize:13,color:"var(--granbark-mut)"}}>Automation {Math.round(metrics.automationRate*100)}% · Handoff {Math.round(metrics.handoffRate*100)}% · {metrics.minutes} samtalsminuter. Måtten kommer endast från registrerade pilotutfall.</p><div style={{display:"grid",gap:7,marginTop:10}}>{calls.slice(0,20).map(c=><div key={c.id} style={{border:"1px solid var(--linje)",borderRadius:8,padding:10,fontSize:12}}><strong>{c.outcome}</strong><span style={{float:"right"}}>{Math.round(c.duration_seconds/60)} min</span><div style={{marginTop:4,color:"var(--granbark-mut)"}}>{c.automated?"Automatiserat":"Mänsklig/överlämnad"} · {new Date(c.occurred_at).toLocaleString("sv-SE")}</div></div>)}</div></section>
        </div>}
      </div>
    </>}
  </AdminShell>;
}

function Guard({title,items,good=false}:{title:string;items:string[];good?:boolean}){return <div style={{border:"1px solid "+(good?"#217A4B33":"#B4531A33"),borderRadius:10,padding:12,background:good?"#217A4B08":"#B4531A08"}}><strong style={{fontSize:12}}>{title}</strong><ul style={{fontSize:12,lineHeight:1.7,paddingLeft:18,marginBottom:0}}>{items.map(i=><li key={i}>{i}</li>)}</ul></div>}
function Metric({label,value,icon:Icon}:{label:string;value:string;icon:typeof PhoneCall}){return <div style={{...card,padding:14}}><Icon size={16}/><span style={{display:"block",fontSize:11,color:"var(--granbark-mut)",marginTop:6}}>{label}</span><strong style={{display:"block",fontSize:22,marginTop:3}}>{value}</strong></div>}
