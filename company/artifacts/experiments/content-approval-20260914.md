# Content approval experiment — 2026-09-14

## Constraint
Client approval currently happens outside the Aurora Media delivery surface, creating handoff friction and weak status visibility.

## Minimum effective change
Add a service-role-only approval data model, an authenticated admin function inside the existing Content admin, and a token-scoped public approval page. No social-publishing code is forked; approved content remains provider-agnostic and can later be handed to Postiz or another publisher.

## Safety
- Approval tables have RLS enabled with no public policies.
- Public clients access one item through a SHA-256 hashed bearer token.
- Links expire after 30 days and can be rotated or cancelled.
- Public output HTML-escapes client/content text and restricts media links to HTTP(S).

## Measurement
Baseline is manual/off-platform approval. Validate with at least 3 real client approvals in 30 days before adding deeper publisher automation.
