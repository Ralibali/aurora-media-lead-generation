import { render,screen,waitFor } from '@testing-library/react';
import { MemoryRouter,Route,Routes } from 'react-router-dom';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import { describe,expect,it } from 'vitest';
import { ModuleRouterProvider,RouteView,createFileRoute,redirect,resolveProductPath } from './router';
describe('product routing boundaries',()=>{
  it('keeps parameterized links in their own module and encodes IDs',()=>{
    expect(resolveProductPath('/portal/papers',{to:'/o/$orgId/documents/$docId',params:{orgId:'one',docId:'two/three'},search:{tab:'review'}})).toBe('/portal/papers/o/one/documents/two%2Fthree?tab=review');
    expect(resolveProductPath('/portal/care',{to:'/admin'})).toBe('/portal/care/admin');
  });
  it('rejects external or script URLs in internal navigation',()=>{
    for(const to of ['https://example.com','//example.com','javascript:alert(1)'])expect(()=>resolveProductPath('/portal/care',{to})).toThrow();
  });
  it('waits for the original authentication guard before rendering protected pages',async()=>{
    const denied=createFileRoute('/_authenticated')({beforeLoad:async()=>{throw redirect({to:'/auth'});},component:()=> <p>Private records</p>});
    render(<QueryClientProvider client={new QueryClient()}><MemoryRouter initialEntries={['/portal/care/admin']}><ModuleRouterProvider basePath="/portal/care"><Routes><Route path="/portal/care/admin" element={<RouteView route={denied}/>}/><Route path="/portal/care/auth" element={<p>Care login</p>}/></Routes></ModuleRouterProvider></MemoryRouter></QueryClientProvider>);
    expect(screen.queryByText('Private records')).toBeNull();
    await waitFor(()=>expect(screen.getByText('Care login')).toBeTruthy());
    expect(screen.queryByText('Private records')).toBeNull();
  });
});
