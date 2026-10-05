<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Tenant isolation, role checks, status transitions, duplicate detection, vendor rules and audit logging live in the database (RLS + triggers), so every client path is covered.
- Org-scoped app pages live under `src/routes/_authenticated/o/$orgId/` and read data with the browser client under RLS.
- Privileged multi-step actions (file hashing/extraction, CSV export) are server functions in `src/lib/documents.functions.ts` using `requireSupabaseAuth`; `src/start.ts` attaches the bearer token.
- Original files are stored at `originals/<org_id>/<uuid>.<ext>` because storage policies key on the first folder.
- CSV building is a pure module (`src/lib/csv.ts`) so escaping stays unit-testable.
- Integration tests create and delete their own synthetic users/orgs; never seed test data into the live database.

