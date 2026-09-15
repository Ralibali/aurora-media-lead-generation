# Rank tracking experiment — 2026-09-14

## Constraint
The current SEO admin shows one-off top Search Console queries for auroramedia.se but has no persistent client/project layer or tracked-keyword history.

## Minimum effective change
Add client/site projects, tracked keywords and dated GSC snapshots using the Google Search Console connector already used by `admin-seo`. Keep the data model provider-ready while reporting GSC average position accurately rather than presenting it as city/local-pack ranking.

## Scope boundary
This does not duplicate Aurora Sight (AI/GEO visibility) and does not pretend to replace a dedicated local SERP provider. An external provider should only be added after client demand for city/local-pack accuracy is proven.

## Measurement
Validate with at least 3 active client/site projects and recurring keyword tracking in 30 days. If target client properties are unavailable to the connected GSC account, stop and solve account access before adding more code.
