# Aurora Voice pilot

Aurora Media's public Aurora Voice page contains a pilot configurator for Swedish SMB use cases such as traffic schools, accommodation businesses and service companies.

## What is live in this repository

The configurator collects the business context needed to scope a pilot:

- vertical/use case
- business name
- primary call goal
- opening hours
- optional booking URL
- optional human handoff number
- common questions and guardrails

It generates a deterministic preview of the proposed call flow and passes the approved intake context into Aurora Media's existing contact pipeline. It does **not** activate a telephone number, make calls, book into a third-party system or claim that a voice provider is connected.

## Intended Aurora Connect handoff

The separate Aurora Connect application remains the runtime target for actual voice operations. When that runtime is ready for a stable integration, use a server-to-server adapter rather than exposing credentials in the browser.

Recommended environment contract:

- `AURORA_CONNECT_URL` – server-side base URL for the voice runtime
- `AURORA_CONNECT_TOKEN` – server-side bearer token

A future provisioning endpoint should accept an approved, versioned configuration and return an immutable pilot/provisioning ID. Keep provisioning human-approved: submitting the public Aurora Media form must never create a live phone number or enable outbound calling by itself.

## Safety and privacy defaults

- identify the assistant as digital/AI at the start of the interaction
- use explicit handoff rules for sensitive, angry or unusual calls
- keep direct booking/payment/write actions disabled until the target integration has been separately verified
- document recording/transcription, retention and processor roles before live traffic
- store secrets server-side only
- keep transcripts and personal data tenant-scoped with auditable retention settings
