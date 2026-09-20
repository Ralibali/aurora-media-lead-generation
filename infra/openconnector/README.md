# Aurora OpenConnector runtime

This directory is the deployment template for the connector runtime used by Aurora Media's
**Integrations Hub** and approval-gated **AI Coworkers**.

It deliberately keeps provider credentials outside Aurora Media's application database.
Aurora stores only connection aliases, action allowlists and an execution ledger.

## Pinned upstream

The image is pinned to `ghcr.io/oomol-lab/open-connector:v1.6.1`.

Do not change it to `latest` in production. Review upstream release notes, test, then update the
pin in a normal commit.

## First start

1. Copy `.env.example` to `.env`.
2. Generate three independent secrets:

   ```sh
   openssl rand -base64 32  # encryption key
   openssl rand -base64 32  # admin token
   openssl rand -base64 32  # runtime token
   ```

3. Save the encryption key in a password manager/secrets vault. Losing it makes encrypted stored
   credentials unrecoverable.
4. Set `OOMOL_CONNECT_ORIGIN` to the final HTTPS origin.
5. Keep `OOMOL_CONNECT_ALLOWED_ACTIONS` and proxy access narrow.
6. Start:

   ```sh
   docker compose up -d
   docker compose ps
   ```

7. Verify locally:

   ```sh
   curl -fsS http://127.0.0.1:3000/health
   ```

The compose file binds only to loopback by default. Put a TLS reverse proxy in front of it rather
than changing the bind address casually.

## Connect Aurora Media

Set these **server-side** secrets in Aurora Media/Lovable Cloud:

- `OPENCONNECTOR_BASE_URL=https://connect.example.se`
- `OPENCONNECTOR_RUNTIME_TOKEN=<the runtime token>`

Do not put either value in `VITE_*` variables or client code.

Then use **Admin → Integrationer**:

1. Create a logical connection record with service + alias.
2. Configure the real provider credential/OAuth connection in OpenConnector's console.
3. Add only the exact Action IDs Aurora is allowed to stage.
4. Run the health check and action discovery.
5. Stage an action.
6. Review it.
7. Approve it.
8. Execute the approved run.

Aurora's ledger uses an idempotency key and never lets a Coworker execute an external Action
directly; a Coworker may only prepare/stage it.

## Security defaults

- Provider secrets live behind OpenConnector, not in the AI prompt or Aurora's tables.
- Credential encryption is enabled by requiring `OOMOL_CONNECT_ENCRYPTION_KEY`.
- Admin and runtime APIs require separate bearer tokens.
- Private-network access is explicitly disabled.
- Deployment-level action/proxy policy is used in addition to Aurora's own allowlist.
- The runtime port is loopback-only in Compose.
- Never log tokens, OAuth credentials or raw provider secrets.
- Back up the persistent Docker volume and the encryption key separately.

## PostgreSQL later

The pilot uses the runtime's persistent SQLite volume. If Aurora needs multiple runtime instances,
move to PostgreSQL 15+ and shared S3-compatible transit storage.

OpenConnector does **not** apply PostgreSQL migrations during server startup. Before starting a new
pinned version against PostgreSQL, run the same image tag with its `migrate` command first.

## Upgrade checklist

1. Read upstream release notes.
2. Change the image pin in this directory.
3. Pull the image on staging.
4. If using PostgreSQL, run that exact image's migration command.
5. Verify `/health`.
6. Test one read-only Action.
7. Test one staged → approved → executed Aurora Action.
8. Verify no credentials appear in Aurora logs.
9. Roll production only after those checks pass.
