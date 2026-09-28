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

The admin pilot layer now supports an approved server-to-server runtime handoff. Pipecat is the default runtime label, while Aurora Connect remains a supported target. No runtime is considered live until VOICE_RUNTIME_URL and VOICE_RUNTIME_TOKEN are configured and an approved pilot is explicitly provisioned. When that runtime is ready for a stable integration, use a server-to-server adapter rather than exposing credentials in the browser.

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


## Operational pilot layer

The internal admin now tracks:
- traffic school, accommodation/StayBoost, transport, service and generic pilots
- explicit allowed actions and actions blocked until an integration is verified
- intake → design → approved → provisioning → live/evaluation lifecycle
- setup and monthly pricing metadata
- retention period and human handoff settings
- registered call outcomes, automation rate, handoff rate, qualified leads, minutes and actual recorded cost

Provisioning is only available from an `approved` pilot and uses `VOICE_RUNTIME_URL` + `VOICE_RUNTIME_TOKEN` server-side. Public intake never calls the runtime.
