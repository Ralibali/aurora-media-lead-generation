import { getFunctionUrl } from '@/lib/functionUrl';
export type ProductSessionClient = { auth: { getSession: () => Promise<{data:{session:{access_token:string}|null}}> } };
export async function invokeProductFunction<T>(product:string,operation:string,data:unknown,client:ProductSessionClient):Promise<T> {
  const {data:{session}}=await client.auth.getSession();
  const headers=new Headers({'Content-Type':'application/json'});
  if(session)headers.set('Authorization',`Bearer ${session.access_token}`);
  const response=await fetch(getFunctionUrl('aurora-product-api'),{method:'POST',headers,body:JSON.stringify({product,operation,data}),signal:AbortSignal.timeout(120000)});
  const result=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(result?.error||(response.status===401?'Logga in i tjänsten för att fortsätta.':'Tjänsten kunde inte nås. Försök igen.'));
  return result?.result as T;
}
export function useServerFn<T>(fn:T):T {return fn;}
