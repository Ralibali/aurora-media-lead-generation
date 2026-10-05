import { Routes,Route,Navigate as GlobalNavigate } from 'react-router-dom';
import { RouteView,Navigate } from '@/modules/shared/router';
import ModuleFrame from '@/modules/shared/ModuleFrame';
import SharedAuthPage from '@/modules/shared/SharedAuthPage';
import { supabase } from './integrations/supabase/client';
import {Route as Page0} from "./routes/_authenticated/installningar";
import {Route as Page1} from "./routes/_authenticated/klienter";
import {Route as Page2} from "./routes/_authenticated/korning.$runId";
import {Route as Page3} from "./routes/_authenticated/oversikt";
import {Route as Page4} from "./routes/_authenticated/route";
import {Route as Page5} from "./routes/_authenticated/varumarke.$brandId";
import {Route as Page6} from "./routes/rapport.$token";
export default function ModuleApp(){return <ModuleFrame client={supabase} id="sight" name="Aurora Sight"><Routes><Route index element={<Navigate to="/oversikt" replace/>}/><Route path="auth" element={<SharedAuthPage name="Aurora Sight" client={supabase} destination="/oversikt"/>}/><Route element={<RouteView route={Page4}/>}><Route path="installningar" element={<RouteView route={Page0}/>}/><Route path="klienter" element={<RouteView route={Page1}/>}/><Route path="korning/:runId" element={<RouteView route={Page2}/>}/><Route path="oversikt" element={<RouteView route={Page3}/>}/><Route path="varumarke/:brandId" element={<RouteView route={Page5}/>}/></Route><Route path="rapport/:token" element={<RouteView route={Page6}/>}/><Route path="priser" element={<GlobalNavigate to="/ai-synlighet" replace/>}/><Route path="tjanster" element={<GlobalNavigate to="/ai-synlighet" replace/>}/><Route path="kontakt" element={<GlobalNavigate to="/ai-synlighet" replace/>}/><Route path="vanliga-fragor" element={<GlobalNavigate to="/ai-synlighet" replace/>}/><Route path="*" element={<p className="p-8">Sidan finns inte i tjänsten.</p>}/></Routes></ModuleFrame>;}
