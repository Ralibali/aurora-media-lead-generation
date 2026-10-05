import { Route, Routes } from 'react-router-dom';
import ModuleFrame from '@/modules/shared/ModuleFrame';
import SharedAuthPage from '@/modules/shared/SharedAuthPage';
import { Link, Navigate, RouteView } from '@/modules/shared/router';
import { supabase } from './integrations/supabase/client';
import { Route as PageRoute0 } from "./routes/_authenticated/kostnader";
import { Route as PageRoute1 } from "./routes/_authenticated/kunder.$orgId";
import { Route as PageRoute2 } from "./routes/_authenticated/kunder.index";
import { Route as PageRoute3 } from "./routes/_authenticated/kvalitet";
import { Route as PageRoute4 } from "./routes/_authenticated/leads";
import { Route as PageRoute5 } from "./routes/_authenticated/logg";
import { Route as PageRoute6 } from "./routes/_authenticated/onboarding";
import { Route as PageRoute7 } from "./routes/_authenticated/oversikt";
import { Route as PageRoute8 } from "./routes/_authenticated/portal";
import { Route as PageRoute9 } from "./routes/_authenticated/rosttester";
import { Route as AuthenticatedRoute } from "./routes/_authenticated/route";
import { Route as PageRoute11 } from "./routes/_authenticated/samtal.$callId";
import { Route as PageRoute12 } from "./routes/_authenticated/samtal.index";

export default function ModuleApp() {
  return (
    <ModuleFrame client={supabase} id="connect" name="AI-receptionist">
      <Routes>
        <Route index element={<Navigate to="/oversikt" replace/>} />
        <Route path="auth" element={<SharedAuthPage name="AI-receptionist" client={supabase} destination="/oversikt"/>} />
        <Route element={<RouteView route={AuthenticatedRoute}/>}>
          <Route path="kostnader" element={<RouteView route={PageRoute0}/>} />
          <Route path="kunder/:orgId" element={<RouteView route={PageRoute1}/>} />
          <Route path="kunder" element={<RouteView route={PageRoute2}/>} />
          <Route path="kvalitet" element={<RouteView route={PageRoute3}/>} />
          <Route path="leads" element={<RouteView route={PageRoute4}/>} />
          <Route path="logg" element={<RouteView route={PageRoute5}/>} />
          <Route path="onboarding" element={<RouteView route={PageRoute6}/>} />
          <Route path="oversikt" element={<RouteView route={PageRoute7}/>} />
          <Route path="portal" element={<RouteView route={PageRoute8}/>} />
          <Route path="rosttester" element={<RouteView route={PageRoute9}/>} />
          <Route path="samtal/:callId" element={<RouteView route={PageRoute11}/>} />
          <Route path="samtal" element={<RouteView route={PageRoute12}/>} />
        </Route>
        <Route path="*" element={<main className="mx-auto max-w-xl px-6 py-16"><h1 className="text-2xl font-semibold">Sidan finns inte</h1><p className="my-4">Den här sidan kunde inte hittas i tjänsten.</p><Link to="/oversikt" className="underline">Till översikten</Link></main>} />
      </Routes>
    </ModuleFrame>
  );
}
