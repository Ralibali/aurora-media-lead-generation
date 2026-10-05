import { invokeProductFunction } from '@/modules/shared/server-client';
import { supabase } from '../../integrations/supabase/client';
import type { WpmgrConnectionResult } from './contract';
export type WpmgrSyncResult={mode:'demo'|'live';ok:boolean;sitesConsidered:number;sitesUpdated:number;message:string;ranAt:string};
export const testWpmgrConnection=(_options?:unknown)=>invokeProductFunction<WpmgrConnectionResult>('care','testWpmgrConnection',null,supabase);
export const runWpmgrSync=(_options?:unknown)=>invokeProductFunction<WpmgrSyncResult>('care','runWpmgrSync',null,supabase);
