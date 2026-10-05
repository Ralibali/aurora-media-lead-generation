// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { flowInterval, validateFlowSteps, validateFlowResult, validateScreenshots, type FlowStep } from '../../supabase/functions/website-guardian/flows';
import { equalSecret, runnerActionAllowed, trustedRunnerClaims } from '../../supabase/functions/website-guardian/auth';

const steps: FlowStep[] = [{ type: 'navigate', url: 'https://example.se/' }, { type: 'assert_visible', selector: 'main' }];
const evidence = [{ index: 0, type: 'navigate', status: 'passed', duration_ms: 10 }, { index: 1, type: 'assert_visible', status: 'passed', duration_ms: 1 }];
const claims = { repository: 'Ralibali/aurora-media-lead-generation', repository_id: '1172996823', repository_owner_id: '36996821', ref: 'refs/heads/main', workflow_ref: 'Ralibali/aurora-media-lead-generation/.github/workflows/aurora-watch.yml@refs/heads/main', event_name: 'schedule' };

describe('Aurora Watch authorization boundary', () => {
  it('pins OIDC identity to immutable repository/owner IDs and the approved main workflow', () => {
    expect(trustedRunnerClaims(claims)).toBe(true);
    for (const field of Object.keys(claims)) expect(trustedRunnerClaims({ ...claims, [field]: 'untrusted' })).toBe(false);
    expect(trustedRunnerClaims({ ...claims, event_name: 'pull_request' })).toBe(false);
    expect(trustedRunnerClaims({ ...claims, event_name: 'workflow_dispatch' })).toBe(true);
  });
  it('separates cron, runner and admin capabilities and rejects empty secrets', () => {
    expect(equalSecret('', '')).toBe(false); expect(equalSecret('abc', 'abc')).toBe(true); expect(equalSecret('abc', 'abd')).toBe(false);
    expect(runnerActionAllowed('run_due', false)).toBe(true);
    expect(runnerActionAllowed('complete_flow', false)).toBe(false);
    expect(runnerActionAllowed('claim_due', true)).toBe(true);
    expect(runnerActionAllowed('complete_flow', true)).toBe(true);
    for (const action of ['run_due','list','create_flow','toggle','update']) expect(runnerActionAllowed(action, true)).toBe(false);
  });
});

describe('Aurora Watch flow and evidence validation', () => {
  it('permits a bounded public navigation and assertion flow on an approved origin', () => {
    expect(validateFlowSteps(steps,'https://example.se',['https://example.se'])).toEqual(steps);
    expect(()=>validateFlowSteps(steps,'https://example.se',['https://other.se'])).toThrow();
    expect(()=>flowInterval(15)).toThrow(); expect(flowInterval(60)).toBe(60);
    expect(()=>validateFlowSteps([steps[0]],'https://example.se',['https://example.se'])).toThrow();
    expect(()=>validateFlowSteps(Array(9).fill(steps[0]),'https://example.se',['https://example.se'])).toThrow();
  });
  it('rejects form actions, credentials, different origins and state-changing links', () => {
    for(const url of ['https://evil.se','http://example.se','https://u:p@example.se','https://example.se/logout','https://example.se/reset-password','https://example.se/%64elete','https://example.se/?token=secret','https://example.se/?%74oken=secret']) {
      expect(()=>validateFlowSteps([{type:'navigate',url},steps[1]],'https://example.se',['https://example.se'])).toThrow();
    }
    for(const type of ['click','fill','submit','evaluate']) expect(()=>validateFlowSteps([steps[0],{type,selector:'form'}],'https://example.se',['https://example.se'])).toThrow();
    expect(()=>validateFlowSteps([steps[0],{type:'click_link',selector:'a'}],'https://example.se',['https://example.se'])).toThrow();
  });
  it('requires complete ordered evidence and classifies a successful retry as flaky', () => {
    const result={status:'passed',attempts:1,duration_ms:11,steps:evidence};
    expect(validateFlowResult(result,steps).status).toBe('passed');
    expect(()=>validateFlowResult({...result,steps:evidence.slice(0,1)},steps)).toThrow();
    expect(()=>validateFlowResult({...result,attempts:2},steps)).toThrow();
    expect(()=>validateFlowResult({...result,steps:[evidence[1],evidence[0]]},steps)).toThrow();
    expect(()=>validateFlowResult({...result,status:'failed',steps:[]},steps)).toThrow();
    const flaky={...result,status:'flaky',attempts:2};
    expect(()=>validateFlowResult(flaky,steps)).toThrow();
    expect(validateFlowResult({...flaky,attempts_detail:[{attempt:1,status:'failed',duration_ms:10,steps:[],error:'timeout'},{attempt:2,status:'passed',duration_ms:11,steps:evidence}]},steps).status).toBe('flaky');
    expect(validateFlowResult({...result,artifact_url:'https://evil.se',screenshots:[{path:'secret'}]},steps)).not.toHaveProperty('artifact_url');
  });
  it('accepts only bounded JPEG screenshots and unique matching attempts', () => {
    const jpeg=btoa(String.fromCharCode(255,216,255,217));
    expect(validateScreenshots([{attempt:1,base64:jpeg}],1)[0].bytes.length).toBe(4);
    expect(()=>validateScreenshots([{attempt:2,base64:jpeg}],1)).toThrow();
    expect(()=>validateScreenshots([{attempt:1,base64:jpeg},{attempt:1,base64:jpeg}],2)).toThrow();
    expect(()=>validateScreenshots([{attempt:1,base64:btoa('not jpeg')}],1)).toThrow();
    expect(()=>validateScreenshots([{attempt:1,base64:'A'.repeat(700000)}],1)).toThrow();
    expect(validateScreenshots(undefined,1)).toEqual([]);
  });
  it('records infrastructure failures without asserting customer-flow failure', () => {
    const result = { status:'inconclusive',attempts:0,duration_ms:12,steps:[],error:'Browser could not start' };
    expect(validateFlowResult(result,steps).status).toBe('inconclusive');
    expect(()=>validateFlowResult({...result,attempts:1},steps)).toThrow();
    expect(()=>validateFlowResult({...result,steps:evidence},steps)).toThrow();
    expect(()=>validateFlowResult({...result,error:undefined},steps)).toThrow();
  });
});
