import { useEffect, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useNavigate, Link } from './router';
export default function SharedAuthPage({name,client,destination}:{name:string;client:SupabaseClient;destination:string}) {
  const navigate=useNavigate();const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{let cancelled=false;client.auth.getSession().then(({data})=>{if(data.session&&!cancelled)navigate({to:destination,replace:true});});return ()=>{cancelled=true;};},[client,destination,navigate]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();const form=new FormData(event.currentTarget);setBusy(true);setError('');
    try {const {error:loginError}=await client.auth.signInWithPassword({email:String(form.get('email')).trim(),password:String(form.get('password'))});if(loginError)throw loginError;navigate({to:destination,replace:true});}
    catch{setError('Det gick inte att logga in. Kontrollera kontouppgifterna och försök igen.');}finally{setBusy(false);}
  }
  return <main className="mx-auto max-w-md px-6 py-14"><h1 className="text-3xl font-semibold">Logga in i {name}</h1><p className="my-4 text-sm text-muted-foreground">Använd ditt befintliga konto för tjänsten. Den ligger nu hos Aurora Media; ditt konto och dina behörigheter är kvar.</p><form onSubmit={submit} className="grid gap-4"><label className="grid gap-1">E-post<input className="rounded-md border bg-background p-3" name="email" type="email" autoComplete="username" required disabled={busy}/></label><label className="grid gap-1">Lösenord<input className="rounded-md border bg-background p-3" name="password" type="password" autoComplete="current-password" required disabled={busy}/></label>{error&&<p role="alert">{error}</p>}<button className="rounded-md bg-primary px-4 py-3 text-primary-foreground" disabled={busy}>{busy?'Loggar in…':'Logga in'}</button></form><p className="mt-6 text-sm">Behöver du åtkomst? <a href="mailto:info@auroramedia.se" className="underline">Kontakta Aurora Media</a>.</p><Link to="/" className="mt-5 inline-block text-sm underline">Till tjänsten</Link></main>;
}
