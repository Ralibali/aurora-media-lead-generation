import { Route, Routes } from 'react-router-dom';
import ModuleFrame from '@/modules/shared/ModuleFrame';
import SharedAuthPage from '@/modules/shared/SharedAuthPage';
import { Link, Navigate, RouteView } from '@/modules/shared/router';
import { supabase } from './integrations/supabase/client';
import { Route as PageRoute0 } from "./routes/_authenticated/ai-synlighet";
import { Route as PageRoute1 } from "./routes/_authenticated/atgarder";
import { Route as PageRoute2 } from "./routes/_authenticated/citeringar";
import { Route as PageRoute3 } from "./routes/_authenticated/dashboard";
import { Route as PageRoute4 } from "./routes/_authenticated/installningar";
import { Route as PageRoute5 } from "./routes/_authenticated/konkurrenter";
import { Route as PageRoute6 } from "./routes/_authenticated/logg";
import { Route as PageRoute7 } from "./routes/_authenticated/onboarding";
import { Route as PageRoute8 } from "./routes/_authenticated/platser.$id";
import { Route as PageRoute9 } from "./routes/_authenticated/platser.index";
import { Route as PageRoute10 } from "./routes/_authenticated/portal";
import { Route as PageRoute11 } from "./routes/_authenticated/rankning";
import { Route as PageRoute12 } from "./routes/_authenticated/rapporter";
import { Route as PageRoute13 } from "./routes/_authenticated/recensioner";
import { Route as AuthenticatedRoute } from "./routes/_authenticated/route";

export default function ModuleApp() {
  return (
    <ModuleFrame client={supabase} id="local-boost" name="Lokal synlighet">
      <Routes>
        <Route index element={<Navigate to="/dashboard" replace/>} />
        <Route path="auth" element={<SharedAuthPage name="Lokal synlighet" client={supabase} destination="/dashboard"/>} />
        <Route element={<RouteView route={AuthenticatedRoute}/>}>
          <Route path="ai-synlighet" element={<RouteView route={PageRoute0}/>} />
          <Route path="atgarder" element={<RouteView route={PageRoute1}/>} />
          <Route path="citeringar" element={<RouteView route={PageRoute2}/>} />
          <Route path="dashboard" element={<RouteView route={PageRoute3}/>} />
          <Route path="installningar" element={<RouteView route={PageRoute4}/>} />
          <Route path="konkurrenter" element={<RouteView route={PageRoute5}/>} />
          <Route path="logg" element={<RouteView route={PageRoute6}/>} />
          <Route path="onboarding" element={<RouteView route={PageRoute7}/>} />
          <Route path="platser/:id" element={<RouteView route={PageRoute8}/>} />
          <Route path="platser" element={<RouteView route={PageRoute9}/>} />
          <Route path="portal" element={<RouteView route={PageRoute10}/>} />
          <Route path="rankning" element={<RouteView route={PageRoute11}/>} />
          <Route path="rapporter" element={<RouteView route={PageRoute12}/>} />
          <Route path="recensioner" element={<RouteView route={PageRoute13}/>} />
        </Route>
        <Route path="*" element={<main className="mx-auto max-w-xl px-6 py-16"><h1 className="text-2xl font-semibold">Sidan finns inte</h1><p className="my-4">Den här sidan kunde inte hittas i tjänsten.</p><Link to="/dashboard" className="underline">Till översikten</Link></main>} />
      </Routes>
    </ModuleFrame>
  );
}
