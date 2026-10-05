import type * as Contract from './aurora.contracts';
import { invokeProductFunction } from '@/modules/shared/server-client';
import { supabase } from '@/modules/connect/integrations/supabase/client';

export const QA_CRITERIA = [
  { key: "greeting", label: "Hälsning och AI-information" },
  { key: "understanding", label: "Uppfattade uppringaren korrekt" },
  { key: "accuracy", label: "Korrekta svar utan påhitt" },
  { key: "qualification", label: "Ställde kvalificeringsfrågorna" },
  { key: "next_step", label: "Tydligt nästa steg eller överkoppling" },
] as const;

export const getMe: typeof Contract.getMe = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.getMe>>>('connect', 'getMe', options?.data, supabase);
export const claimFirstAdmin: typeof Contract.claimFirstAdmin = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.claimFirstAdmin>>>('connect', 'claimFirstAdmin', options?.data, supabase);
export const getOverview: typeof Contract.getOverview = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.getOverview>>>('connect', 'getOverview', options?.data, supabase);
export const listOrganizations: typeof Contract.listOrganizations = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.listOrganizations>>>('connect', 'listOrganizations', options?.data, supabase);
export const listTemplates: typeof Contract.listTemplates = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.listTemplates>>>('connect', 'listTemplates', options?.data, supabase);
export const listPlans: typeof Contract.listPlans = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.listPlans>>>('connect', 'listPlans', options?.data, supabase);
export const onboardOrganization: typeof Contract.onboardOrganization = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.onboardOrganization>>>('connect', 'onboardOrganization', options?.data, supabase);
export const getOrganization: typeof Contract.getOrganization = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.getOrganization>>>('connect', 'getOrganization', options?.data, supabase);
export const updateAgent: typeof Contract.updateAgent = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.updateAgent>>>('connect', 'updateAgent', options?.data, supabase);
export const saveKnowledgeItem: typeof Contract.saveKnowledgeItem = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.saveKnowledgeItem>>>('connect', 'saveKnowledgeItem', options?.data, supabase);
export const deleteKnowledgeItem: typeof Contract.deleteKnowledgeItem = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.deleteKnowledgeItem>>>('connect', 'deleteKnowledgeItem', options?.data, supabase);
export const saveOpeningHours: typeof Contract.saveOpeningHours = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.saveOpeningHours>>>('connect', 'saveOpeningHours', options?.data, supabase);
export const saveGuardrails: typeof Contract.saveGuardrails = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.saveGuardrails>>>('connect', 'saveGuardrails', options?.data, supabase);
export const saveIntegration: typeof Contract.saveIntegration = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.saveIntegration>>>('connect', 'saveIntegration', options?.data, supabase);
export const listCalls: typeof Contract.listCalls = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.listCalls>>>('connect', 'listCalls', options?.data, supabase);
export const getCall: typeof Contract.getCall = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.getCall>>>('connect', 'getCall', options?.data, supabase);
export const listLeads: typeof Contract.listLeads = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.listLeads>>>('connect', 'listLeads', options?.data, supabase);
export const updateLeadStatus: typeof Contract.updateLeadStatus = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.updateLeadStatus>>>('connect', 'updateLeadStatus', options?.data, supabase);
export const saveScorecard: typeof Contract.saveScorecard = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.saveScorecard>>>('connect', 'saveScorecard', options?.data, supabase);
export const getUsage: typeof Contract.getUsage = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.getUsage>>>('connect', 'getUsage', options?.data, supabase);
export const listAudit: typeof Contract.listAudit = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.listAudit>>>('connect', 'listAudit', options?.data, supabase);
export const getProviderHealth: typeof Contract.getProviderHealth = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.getProviderHealth>>>('connect', 'getProviderHealth', options?.data, supabase);
export const listVoiceTests: typeof Contract.listVoiceTests = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.listVoiceTests>>>('connect', 'listVoiceTests', options?.data, supabase);
export const recordVoiceTest: typeof Contract.recordVoiceTest = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.recordVoiceTest>>>('connect', 'recordVoiceTest', options?.data, supabase);
export const generateDemoActivity: typeof Contract.generateDemoActivity = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.generateDemoActivity>>>('connect', 'generateDemoActivity', options?.data, supabase);
export const setDemoMode: typeof Contract.setDemoMode = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.setDemoMode>>>('connect', 'setDemoMode', options?.data, supabase);
export const deployAgentToProvider: typeof Contract.deployAgentToProvider = (options) => invokeProductFunction<Awaited<ReturnType<typeof Contract.deployAgentToProvider>>>('connect', 'deployAgentToProvider', options?.data, supabase);
