# Aurora Media portfolio hub

- Company: Aurora Media AB
- Objective: make the existing project portfolio discoverable under Aurora Media without merging unrelated product codebases.
- Why now: the owner explicitly approved adding earlier projects to the current Aurora Media projects.
- Evidence: 25 Lovable projects were inventoried on 2026-09-13; Aurora Media already has public product, work and Aurora Care surfaces.
- Owner: Aurora Media CEO
- Skill: site-revenue-experiment 1.0
- Authority: COMMIT and EMIT, granted by the owner in the active request.
- Definition of done: public products are grouped by role, client work stays under Work, private/duplicate projects are excluded from public pages, Care contains the complete internal overview, checks pass and connected projects are published.
- KPI: visits from `/produkter` to an offer, external product or contact action. Baseline is UNKNOWN and must be measured after release.

## Architecture decision

Aurora Media AB is the commercial umbrella. Aurora Care is the shared customer/control surface. Vertical products keep independent code and data boundaries. Client sites remain portfolio cases. Private utilities and verification copies remain internal.
