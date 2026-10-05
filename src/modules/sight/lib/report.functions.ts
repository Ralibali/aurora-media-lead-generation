/* eslint-disable @typescript-eslint/no-explicit-any */
import { invokeProductFunction } from '@/modules/shared/server-client';
import { supabase } from '../integrations/supabase/client';
export const getSharedReport=(options?:{data?:unknown})=>invokeProductFunction<any>('sight','getSharedReport',options?.data,supabase);
