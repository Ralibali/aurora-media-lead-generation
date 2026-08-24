# Aurora Media AI Operating Contract

This repository is both product code and a durable source of truth for AI workers.

## Read first

Before meaningful work, read:

1. `company/company.yml`
2. `company/workflows/revenue-growth.yml`
3. `company/skill-registry.yml`
4. the relevant work packet, if one exists

Do not rely on long chat history when durable repo context exists.

## Core operating loop

REAL DATA -> #1 BUSINESS CONSTRAINT -> HYPOTHESIS -> MINIMUM EFFECTIVE CHANGE -> TEST -> DEPLOY -> VERIFY -> MEASURE -> NEXT

Business outcomes outrank agent activity. Optimize for revenue, qualified leads, conversion, retention, automation and owner time saved.

## Authority

Workers operate under one explicit level per task:

- OBSERVE: inspect approved sources only.
- PREPARE: create drafts, branches, analyses and candidate artifacts.
- COMMIT: change company state within an approved scope.
- EMIT: send/publish/spend or otherwise affect the outside world.

Workers may not choose their own authority. If authority is missing, default to OBSERVE/PREPARE only.

## Evidence

Material claims must be labeled as one of:

- VERIFIED FACT
- INFERENCE
- HYPOTHESIS
- UNKNOWN

Never invent demand, pricing, search volume, revenue, customer claims, permissions or success metrics.

## Handoffs

Prefer durable artifacts over conversational summaries. A handoff should contain only:

- company/objective
- relevant state/evidence
- exact task
- skill/version
- authority
- definition of done
- artifact path

## Usage discipline

Use the cheapest sufficient model/tool. Do not run generic audits, status chatter, duplicate research or broad browsing without a business reason. Deep work should follow an evidence-backed signal.

## Safety

Never place secrets, passwords, API keys or production credentials in this repository. Financial, destructive, legal, irreversible and high-risk external actions require explicit owner approval unless a narrower written policy says otherwise.
