export function equalSecret(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < b.length; i++) diff |= (a.charCodeAt(i) || 0) ^ b.charCodeAt(i);
  return !!a && !!b && diff === 0;
}

// Called only AFTER cryptographic signature, issuer, audience and expiry validation.
export function trustedRunnerClaims(claims: Record<string, unknown>): boolean {
  return claims.repository === 'Ralibali/aurora-media-lead-generation'
    && claims.repository_id === '1172996823'
    && claims.repository_owner_id === '36996821'
    && claims.ref === 'refs/heads/main'
    && claims.workflow_ref === 'Ralibali/aurora-media-lead-generation/.github/workflows/aurora-watch.yml@refs/heads/main'
    && ['schedule', 'workflow_dispatch'].includes(String(claims.event_name));
}

export function runnerActionAllowed(action: unknown, oidc: boolean): boolean {
  return (oidc ? ['claim_due', 'complete_flow'] : ['run_due']).includes(String(action));
}
