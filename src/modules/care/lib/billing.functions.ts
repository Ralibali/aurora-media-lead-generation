import { invokeProductFunction } from '@/modules/shared/server-client';
import { supabase } from '../integrations/supabase/client';
export type CheckoutResult={status:'unconfigured';message:string}|{status:'redirect';url:string};
export const createCheckoutSession=(options:{data:{planSlug:string;email?:string}})=>invokeProductFunction<CheckoutResult>('care','createCheckoutSession',options.data,supabase);
