/* eslint-disable @typescript-eslint/no-explicit-any */
import { invokeProductFunction } from '@/modules/shared/server-client';
import { supabase } from '../integrations/supabase/client';
export const getProviderStatus=(options?:{data?:unknown})=>invokeProductFunction<any>('sight','getProviderStatus',options?.data,supabase);
export const getMonitorWorkerStatus=(options?:{data?:unknown})=>invokeProductFunction<any>('sight','getMonitorWorkerStatus',options?.data,supabase);
export const startAuditRun=(options?:{data?:unknown})=>invokeProductFunction<any>('sight','startAuditRun',options?.data,supabase);
export const generateFindings=(options?:{data?:unknown})=>invokeProductFunction<any>('sight','generateFindings',options?.data,supabase);
export const setReportSharing=(options?:{data?:unknown})=>invokeProductFunction<any>('sight','setReportSharing',options?.data,supabase);
