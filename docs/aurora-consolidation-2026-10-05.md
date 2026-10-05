# Aurora Media consolidation — 2026-10-05

The owner asked to place Aurora Media-related products in the existing Aurora Media website and GitHub repository. No new Lovable project or repository is created. The existing public offers are retained. `/portal` opens five native React Router modules; no external iframe or copied marketing-only wrapper is used.

| Original product | Native module | Original database |
| --- | --- | --- |
| Aurora Care Portal | `/portal/care` | `tsijqcjxoddkytcaabbw` |
| Aurora Sight | `/portal/sight` | `xsrjgnqhkfjmmhywxnsn` |
| Aurora Connect | `/portal/connect` | `iwypiteuubedpfuiyatu` |
| Aurora Local Boost | `/portal/local-boost` | `ydnyoqfikiybyektvann` |
| Aurora Papers | `/portal/papers` | `mqizbxeifqqibluujlfy` |

## Runtime and authority

The frontend is maintained here in `src/modules`. Original server handlers are adapted to the `aurora-product-api` Edge Function in Aurora Media's existing backend. The gateway has a fixed product-to-database mapping and an explicit function registry. It verifies a customer's JWT against that product's Auth service and executes database operations with the same user token and existing RLS. The Aurora Media owner password is never forwarded to product databases.

Each product retains its own customer accounts and namespaced browser session. Query caches are isolated per module and cleared on account changes. This is not single sign-on or a database merger. Existing account passwords and data have not been copied or changed.

Provider settings are isolated on the server as `AURORA_<PRODUCT>_<ORIGINAL_SETTING>`. The host database's service-role key is never used against a product database. Existing provider keys are not copied into source. Public Supabase configuration is explicitly public and remains protected by Auth/RLS.

Source schemas and evidence are under `company/imports/<product>`. These are references for the ORIGINAL databases, not migrations for Aurora Media's database. Papers' security fixes and Sight's narrow shared-report RPC belong to their original backends. Never apply these schemas to `cyymcdqkpvcvwjoqxbco`.

## Preserved boundaries

- Care's WPMgr contract is unverified and its Stripe checkout is unimplemented in the source. Neither becomes active through this import.
- Sight needs provider configuration for real model runs and a separately verified scheduler. Public report sharing uses a token-checked SQL function without transferring service-role secrets.
- Connect's original voice-provider endpoints are unverified. Real calls and Swedish voice quality remain separate activation work.
- Local Boost's original external data providers return `not_configured` even when credentials are present. No ranking, review publication or Google Business connection is invented.
- Papers stores originals in its existing private bucket; server-side file validation, hash computation, approval locks, CSV export and interrupted-export recovery are preserved. It does not claim accounting-provider or Stripe integration.
- Connect and Local Boost database DNS failed during investigation; reactivation must be verified before reporting those services operational.
- Aurora Watch is already implemented in this repository by another authorized task. Its existing routes, workflow and production behavior must be preserved.

## Verification

Local and production results are recorded after verification. A build or source import alone is not evidence that external integrations or customer account flows are operational.
