import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { ModuleRouterProvider } from './router';
import './products.css';
export default function ModuleFrame({id,name,client,children}:{id:string;name:string;client?:SupabaseClient;children:ReactNode}) {
  const [queryClient]=useState(()=>new QueryClient({defaultOptions:{queries:{retry:1,refetchOnWindowFocus:false}}}));
  const [epoch,setEpoch]=useState(0);
  useEffect(()=>{
    if(!client)return;
    let userId:string|null|undefined;
    const {data}=client.auth.onAuthStateChange((_event,session)=>{
      const next=session?.user.id??null;
      if(userId!==undefined&&userId!==next){queryClient.clear();setEpoch(value=>value+1);}
      userId=next;
    });
    return ()=>data.subscription.unsubscribe();
  },[client,queryClient]);
  return <QueryClientProvider client={queryClient}><ModuleRouterProvider basePath={'/portal/'+id}><div className="aurora-product"><div className="product-bar"><Link to="/portal">← Aurora Media · Mina tjänster</Link><span>{name}</span></div><div key={epoch}>{children}</div></div></ModuleRouterProvider></QueryClientProvider>;
}
