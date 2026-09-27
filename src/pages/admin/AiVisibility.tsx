import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Plus, Radar, RefreshCw, Sparkles } from "lucide-react";
import { citationRate, competitorShare, mentionRate, weightedVisibilityScore, type VisibilityObservation } from "@/lib/aiVisibility";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type Project = { id:string; customer_name:string; brand_name:string; domain:string; plan:"scan"|"monitor"|"managed"; monthly_price_sek:number; status:string; last_measured_at:string|null; notes:string|null };
type Prompt = { id:string; project_id:string; prompt:string; category:string; weight:number; active:boolean };
type Observation = VisibilityObservation & { id:string; project_id:string; prompt_id:string; answer_excerpt:string|null };
type ActionItem = { id:string; project_id:string; title:string; rationale:string|null; kind:string; priority:string; status:string };
type Data = { projects:Project[]; prompts:Prompt[]; observations:Observation[]; actions:ActionItem[] };

const card:React.CSSProperties={background:"#fff",border:"1px solid var(--linje)",borderRadius:12,padding:18};
const input:React.CSSProperties={width:"100%",border:"1px solid var(--linje)",borderRadius:8,padding:"9px 10px",fontSize:13,background:"#fff"};

export default function AiVisibility() {
  const [data,setData]=useState<Data|null>(null);
  const [error,setError]=useState<unknown>(null);
  const [busy,setBusy]=useState(false);
  const [selectedId,setSelectedId]=useState("");
  const [newProject,setNewProject]=useState({customer_name:"",brand_name:"",domain:"",plan:"monitor"});
  const [newPrompt,setNewPrompt]=useState("");
  const [observation,setObservation]=useState({prompt_id:"",engine:"chatgpt",brand_mentioned:true,position:"",cited_urls:"",competitors:"",answer_excerpt:""});

  const load=useCallback(async()=>{try{const next=await adminFetch("admin-ai-visibility",{method:"POST",body:JSON.stringify({action:"list"})}) as Data;setData(next);setSelectedId(v=>v||next.projects[0]?.id||"");setError(null);}catch(e){setError(e);}},[]);
  useEffect(()=>{void load();},[load]);

  const mutate=async(payload:Record<string,unknown>)=>{setBusy(true);try{const next=await adminFetch("admin-ai-visibility",{method:"POST",body:JSON.stringify(payload)}) as Data;setData(next);setError(null);return true;}catch(e){setError(e);return false;}finally{setBusy(false);}};

  const selected=useMemo(()=>data?.projects.find(p=>p.id===selectedId)??null,[data,selectedId]);
  const prompts=useMemo(()=>data?.prompts.filter(p=>p.project_id===selectedId)??[],[data,selectedId]);
  const observations=useMemo(()=>data?.observations.filter(o=>o.project_id===selectedId)??[],[data,selectedId]);
  const actions=useMemo(()=>data?.actions.filter(a=>a.project_id===selectedId)??[],[data,selectedId]);
  const competitors=competitorShare(observations);
  const pct=(value:number)=>Math.round(value*100)+"%";

  return <AdminShell title="AI Visibility" kicker="Aurora Sight · GEO-monitorering">
    <AdminStatus loading={!data&&!error} error={error} onRetry={load}/>
    <section style={card}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <div><p className="vk-mono" style={{margin:0,color:"var(--granbark-mut)"}}>AURORA SIGHT MONITOR</p><h2 style={{margin:"6px 0 0"}}>Mät det som faktiskt observerats</h2><p style={{margin:"6px 0 0",maxWidth:760,fontSize:13,color:"var(--granbark-mut)"}}>Prompts, omnämnanden, citations och konkurrenter sparas som verifierade observationer. Ingen ranking eller effekt hittas på när data saknas.</p></div>
        <button className="vk-btn" onClick={()=>void load()}><RefreshCw size={14}/> Uppdatera</button>
      </div>
      <form onSubmit={async e=>{e.preventDefault();const ok=await mutate({action:"create_project",...newProject});if(ok)setNewProject({customer_name:"",brand_name:"",domain:"",plan:"monitor"});}} style={{marginTop:16,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
        <input required style={input} placeholder="Kund" value={newProject.customer_name} onChange={e=>setNewProject(v=>({...v,customer_name:e.target.value}))}/>
        <input required style={input} placeholder="Varumärke" value={newProject.brand_name} onChange={e=>setNewProject(v=>({...v,brand_name:e.target.value}))}/>
        <input required style={input} placeholder="example.se" value={newProject.domain} onChange={e=>setNewProject(v=>({...v,domain:e.target.value}))}/>
        <select style={input} value={newProject.plan} onChange={e=>setNewProject(v=>({...v,plan:e.target.value}))}><option value="scan">Gratis scan</option><option value="monitor">Monitor · 499 kr/mån</option><option value="managed">Managed · 2 495 kr/mån</option></select>
        <button className="vk-btn vk-btn-primary" disabled={busy}><Plus size={14}/> Lägg till</button>
      </form>
    </section>

    {data&&<div style={{marginTop:16,display:"grid",gridTemplateColumns:"minmax(220px,.7fr) minmax(0,2fr)",gap:16}}>
      <section style={card}><p className="vk-mono">KUNDER</p><div style={{display:"grid",gap:7,marginTop:10}}>{data.projects.map(p=><button key={p.id} onClick={()=>setSelectedId(p.id)} style={{textAlign:"left",padding:11,borderRadius:9,border:"1px solid "+(p.id===selectedId?"var(--gran)":"var(--linje)"),background:p.id===selectedId?"#0f51320a":"#fff",cursor:"pointer"}}><strong>{p.brand_name}</strong><span style={{display:"block",fontSize:11,color:"var(--granbark-mut)"}}>{p.domain} · {p.plan} · {p.monthly_price_sek} kr</span></button>)}</div></section>
      <div style={{display:"grid",gap:16}}>
        {selected&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
            <Metric label="Visibility score" value={String(weightedVisibilityScore(observations))} icon={Radar}/>
            <Metric label="Mention rate" value={pct(mentionRate(observations))} icon={Sparkles}/>
            <Metric label="Citation rate" value={pct(citationRate(observations))} icon={BarChart3}/>
            <Metric label="Observationer" value={String(observations.length)} icon={CheckCircle2}/>
          </div>
          <section style={card}>
            <p className="vk-mono">PROMPTS</p>
            <form onSubmit={async e=>{e.preventDefault();if(!newPrompt.trim())return;const ok=await mutate({action:"create_prompt",project_id:selected.id,prompt:newPrompt,category:"commercial",weight:1});if(ok)setNewPrompt("");}} style={{display:"flex",gap:8,marginTop:10}}><input style={input} value={newPrompt} onChange={e=>setNewPrompt(e.target.value)} placeholder="Vilken är bästa… / vem hjälper med…?"/><button className="vk-btn" disabled={busy}><Plus size={14}/> Lägg prompt</button></form>
            <div style={{display:"grid",gap:7,marginTop:12}}>{prompts.map(p=><div key={p.id} style={{border:"1px solid var(--linje)",borderRadius:8,padding:10,fontSize:12}}><strong>{p.prompt}</strong><span style={{float:"right",color:"var(--granbark-mut)"}}>{p.category}</span></div>)}</div>
          </section>
          <section style={card}>
            <p className="vk-mono">REGISTRERA VERIFIERAD OBSERVATION</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:8,marginTop:10}}>
              <select style={input} value={observation.prompt_id} onChange={e=>setObservation(v=>({...v,prompt_id:e.target.value}))}><option value="">Välj prompt</option>{prompts.map(p=><option key={p.id} value={p.id}>{p.prompt.slice(0,70)}</option>)}</select>
              <select style={input} value={observation.engine} onChange={e=>setObservation(v=>({...v,engine:e.target.value}))}><option value="chatgpt">ChatGPT</option><option value="perplexity">Perplexity</option><option value="google_ai">Google AI</option><option value="copilot">Copilot</option><option value="other">Annan</option></select>
              <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}><input type="checkbox" checked={observation.brand_mentioned} onChange={e=>setObservation(v=>({...v,brand_mentioned:e.target.checked}))}/> Varumärket nämns</label>
              <input style={input} type="number" min="1" max="50" placeholder="Position, om mätbar" value={observation.position} onChange={e=>setObservation(v=>({...v,position:e.target.value}))}/>
              <input style={input} placeholder="Citerade URL:er, komma" value={observation.cited_urls} onChange={e=>setObservation(v=>({...v,cited_urls:e.target.value}))}/>
              <input style={input} placeholder="Konkurrenter, komma" value={observation.competitors} onChange={e=>setObservation(v=>({...v,competitors:e.target.value}))}/>
            </div>
            <textarea style={{...input,resize:"vertical",marginTop:8}} rows={3} placeholder="Kort svarsexcerpt / verifieringsnotering" value={observation.answer_excerpt} onChange={e=>setObservation(v=>({...v,answer_excerpt:e.target.value}))}/>
            <button className="vk-btn vk-btn-primary" style={{marginTop:8}} disabled={busy||!observation.prompt_id} onClick={()=>void mutate({action:"record_observation",project_id:selected.id,prompt_id:observation.prompt_id,engine:observation.engine,brand_mentioned:observation.brand_mentioned,position:observation.position||null,cited_urls:observation.cited_urls.split(",").map(x=>x.trim()).filter(Boolean),competitor_mentions:observation.competitors.split(",").map(x=>x.trim()).filter(Boolean),answer_excerpt:observation.answer_excerpt,source:"manual"})}>Spara observation</button>
          </section>
          <section style={card}>
            <p className="vk-mono">KONKURRENTSIGNALER & ÅTGÄRDER</p>
            <p style={{fontSize:13,color:"var(--granbark-mut)"}}>{competitors.length?competitors.slice(0,5).map(c=>c.name+" ("+c.mentions+")").join(" · "):"Inga konkurrentomnämnanden registrerade ännu."}</p>
            <div style={{display:"grid",gap:7,marginTop:10}}>{actions.map(a=><div key={a.id} style={{border:"1px solid var(--linje)",borderRadius:8,padding:10,fontSize:12}}><strong>{a.title}</strong><span style={{float:"right"}}>{a.status}</span></div>)}</div>
          </section>
        </>}
      </div>
    </div>}
  </AdminShell>;
}

function Metric({label,value,icon:Icon}:{label:string;value:string;icon:typeof Radar}){return <div style={{...card,padding:14}}><Icon size={16}/><span style={{display:"block",fontSize:11,color:"var(--granbark-mut)",marginTop:6}}>{label}</span><strong style={{display:"block",fontSize:26,marginTop:2}}>{value}</strong></div>;}
