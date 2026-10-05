import { createRemoteJWKSet, jwtVerify } from 'https://esm.sh/jose@6.1.0';
import { trustedRunnerClaims } from './auth.ts';

const keys = createRemoteJWKSet(new URL('https://token.actions.githubusercontent.com/.well-known/jwks'));

export async function githubRunnerAccess(token: string): Promise<boolean> {
  if (!token || token.length > 16_000 || token.split('.').length !== 3) return false;
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer: 'https://token.actions.githubusercontent.com',
      audience: 'aurora-watch',
      algorithms: ['RS256'],
      requiredClaims: ['exp', 'iat', 'nbf', 'repository', 'repository_id', 'repository_owner_id', 'ref', 'workflow_ref', 'event_name'],
      maxTokenAge: '10m',
    });
    return trustedRunnerClaims(payload);
  } catch { return false; }
}
