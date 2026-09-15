# Third-party references

## WACRM

- Source: https://github.com/ArnasDon/wacrm
- Reviewed revision: `80c3f9a1aecdaf21b98311f230fdaaaec7d85f7d`
- License: MIT, copyright 2026 Arnas Donauskas

Aurora Managed Channels integrates with WACRM through its documented `/api/v1`
contract. WACRM itself is not bundled in this repository. The required MIT notice
remains in the upstream deployment.

## Claude Commerce Agents

- Source: https://github.com/anthropics/commerce-agents
- Reviewed revision: `fd4d59224ab96b43c6dc6888207c67b3bd5a24cf`
- License: Apache License 2.0, copyright 2026 Anthropic PBC

Aurora Commerce Ops adopts the reference implementation's staged-change,
guardrail and host-approval architecture. The Python packages are not bundled;
the implementation here is native to Aurora Media's React/Supabase stack.
