import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode, type ComponentType, type AnchorHTMLAttributes } from 'react';
import { Link as RouterLink, Navigate as RouterNavigate, Outlet, useLocation, useNavigate as useReactNavigate, useParams as useReactParams, useSearchParams } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
export { Outlet };

// Compatibility at the import boundary; product pages remain ordinary React components.
type Context = {user?:User;[key:string]:unknown};
type Destination = { to: string; params?: Record<string,string>; search?: Record<string,unknown> | ((previous: Record<string,unknown>) => Record<string,unknown>); replace?: boolean; hash?: string };
type RouteOptions = { component?: ComponentType; beforeLoad?: (input: Context) => Promise<Context | void>; loader?: (input: Context) => unknown; [key:string]: unknown };
const ModuleContext = createContext({basePath:'', context:{} as Context});
export function ModuleRouterProvider({basePath,context={},children}:{basePath:string;context?:Context;children:ReactNode}) {
  const value=useMemo(()=>({basePath,context}),[basePath,context]);
  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
}
export function RouteContextProvider({value,children}:{value:Context;children:ReactNode}) {
  const parent=useContext(ModuleContext);
  const next=useMemo(()=>({...parent,context:{...parent.context,...value}}),[parent,value]);
  return <ModuleContext.Provider value={next}>{children}</ModuleContext.Provider>;
}
export function resolveProductPath(basePath:string,destination:Destination):string {
  let path=destination.to.replace(/\$([\w]+)/g,(_,key)=>encodeURIComponent(destination.params?.[key]??''));
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) throw new Error('En intern tjänstelänk krävs.');
  if (!path.startsWith('/')) path='/'+path;
  if (!(path===basePath || path.startsWith(basePath+'/'))) path=basePath+path;
  if (destination.search && typeof destination.search!=='function') {
    const search=new URLSearchParams();
    Object.entries(destination.search).forEach(([key,value])=>{if(value!==undefined&&value!==null)search.set(key,String(value));});
    if(search.toString())path+='?'+search.toString();
  }
  if(destination.hash)path+='#'+destination.hash.replace(/^#/,'');
  return path;
}
export function Link({to,params,search,replace,hash,activeProps: _active,activeOptions:_activeOptions,inactiveProps:_inactive,preload:_preload,...props}:Destination & AnchorHTMLAttributes<HTMLAnchorElement> & {activeProps?:unknown;activeOptions?:unknown;inactiveProps?:unknown;preload?:unknown}) {
  const {basePath}=useContext(ModuleContext);
  return <RouterLink {...props} to={resolveProductPath(basePath,{to,params,search,hash})} replace={replace}/>;
}
export function Navigate(props:Destination) {
  const {basePath}=useContext(ModuleContext);
  return <RouterNavigate to={resolveProductPath(basePath,props)} replace={props.replace}/>;
}
export function useNavigate(_options?:unknown) {
  const navigate=useReactNavigate(); const {basePath}=useContext(ModuleContext);
  return useCallback((destination:Destination)=>navigate(resolveProductPath(basePath,destination),{replace:destination.replace}),[navigate,basePath]);
}
export function useRouterState<T>({select}:{select:(state:{location:{pathname:string;search:Record<string,string>}})=>T}) {
  const {basePath}=useContext(ModuleContext); const location=useLocation();
  return select({location:{pathname:location.pathname.slice(basePath.length)||'/',search:Object.fromEntries(new URLSearchParams(location.search))}});
}
export function useRouter() {
  const queryClient=useQueryClient(); const navigate=useNavigate();
  return useMemo(()=>({navigate,invalidate:()=>queryClient.invalidateQueries()}),[navigate,queryClient]);
}
export function useParams(_options?:unknown):Record<string,string> { return useReactParams() as Record<string,string>; }
export function useSearch(_options?:unknown):Context {const [search]=useSearchParams();return Object.fromEntries(search);}
export function redirect(destination:Destination) {return {productRedirect:true,...destination};}
export function createFileRoute(_path:string) {
  return (options:RouteOptions)=>({options,useParams,useSearch,useRouteContext:()=>useContext(ModuleContext).context});
}
export type ProductRoute = ReturnType<ReturnType<typeof createFileRoute>>;
export function RouteView({route,children}:{route:ProductRoute;children?:ReactNode}) {
  const parent=useContext(ModuleContext); const navigate=useNavigate(); const params=useParams(); const queryClient=useQueryClient();
  const [loaded,setLoaded]=useState<{context:Context;error?:string}|null>(route.options.beforeLoad?null:{context:{}});
  useEffect(()=>{
    let cancelled=false;
    if(!route.options.beforeLoad)return;
    setLoaded(null);
    Promise.resolve().then(()=>route.options.beforeLoad?.({context:{...parent.context,queryClient},params})).then(value=>{if(!cancelled)setLoaded({context:value||{}});}).catch(error=>{
      if(cancelled)return;
      if(error?.productRedirect)navigate({...error,replace:true});
      else setLoaded({context:{},error:error instanceof Error?error.message:'Tjänsten kunde inte laddas.'});
    });
    return ()=>{cancelled=true;};
    // The layout guard is intentionally stable for a mounted product. The backend verifies every request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[route,navigate,queryClient]);
  if(!loaded)return <p role="status" className="p-8">Kontrollerar inloggning…</p>;
  if(loaded.error)return <p role="alert" className="p-8">{loaded.error}</p>;
  const Component=route.options.component;
  return <RouteContextProvider value={loaded.context}>{Component?<Component/>:children??<Outlet/>}</RouteContextProvider>;
}
