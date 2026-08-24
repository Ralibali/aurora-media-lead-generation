# Inbound / CRM audit — 2026-08-25

- **Company / objective:** Aurora Media AB / first qualified åkeri batch (do not treat row counts as pipeline)
- **Skill / version:** b2b-prospect-qualification v1.0
- **Authority:** PREPARE
- **Source:** Lovable / product DB snapshot dated 2026-08-25, as reported by the Growth agent. This worker did not re-query production and did not change any rows.
- **Constraint this answers:** `revenue-growth.yml` priority "close_qualified_pipeline" before "create_new_qualified_pipeline"

Evidence labels: **VERIFIED FACT** (snapshot as handed off), **INFERENCE**, **HYPOTHESIS**, **UNKNOWN**.

---

## Snapshot (Lovable DB, 2026-08-25)

| Table / source | Count | What the rows actually are | Pipeline? |
|---|---|---|---|
| Contact leads (`leads` / kontakt) | 3 | All internal tests | No |
| AI-karta (`ai_map_leads`) | 9 | 8 self / own brands; 1 Demo / "Morris forlorad" | No |
| Genomlysning (`genomlysning_leads`) | 0 | Empty | No booked throughlysningar |
| Prospecting leads (`prospecting_leads`) | 5 | Glamping / Östergötland Firecrawl campaign that hit travel blogs | Reject — not operating åkerier |
| Close-existing-pipeline | empty | No CRM rows marked as closable existing deals | Empty ≠ "no relationships in the world" |

**Alex is not in this DB.** **VERIFIED FACT** relative to the snapshot only. Whether Alex exists in another mailbox, spreadsheet or head is **UNKNOWN**.

---

## Contact leads (3)

All three are internal tests. **VERIFIED FACT** (Growth-agent classification of this snapshot).

- Not qualified external demand.
- Do not email them as customers.
- Do not count toward `qualified_leads` or `booked_meetings`.

---

## AI-karta (9)

- 8 rows are self / own-brand exercises (Aurora products or internal trials). **VERIFIED FACT** of the snapshot classification.
- 1 row is Demo / "Morris forlorad" — not a live buyer. **VERIFIED FACT** of the snapshot classification.
- 0 of 9 are an external åkeri asking for work.

**INFERENCE:** AI-karta is being used as a product/demo surface, not yet as an inbound engine for this segment.

---

## Genomlysning (0)

No `genomlysning_leads` in the snapshot. **VERIFIED FACT**.

The default outbound ask in `2026-08-25-top3-drafts.md` is therefore a **new** 20-min AI-genomlysning, not a follow-up on an existing booking.

---

## Prospecting leads (5) — reject

Five `prospecting_leads` from a Firecrawl campaign aimed at glamping / Östergötland. Hits were travel blogs, not operating companies with an operational signal.

**Decision:** REJECT the five rows as prospects. Do not recycle them into outreach. Learning recorded in `2026-08-25-learning.md`.

This is consistent with the batch-1 reject line "Firecrawl glamping blogs".

---

## Close-existing-pipeline

Empty in this CRM snapshot. **VERIFIED FACT**.

**INFERENCE:** There is no closable inbound or leftover CRM deal to work before outbound. That is why this packet creates **new** qualified åkeri pipeline instead of a close-existing motion.

**UNKNOWN:** Off-CRM conversations (phone, private mail, "Alex") are not represented here. Empty CRM is not proof that no human relationship exists.

---

## What this snapshot is not

- Not revenue.
- Not qualified pipeline.
- Not permission to send mail.
- Not a count of website visitors or GSC queries.
- Not a claim that the Firecrawl feature is broken — only that this campaign's query/source mix selected blogs.

---

## Implication for WP-20260825-001

1. Do not spend this packet on "nurture the 3+9+5 rows".
2. Do spend it on the 8 public-site keepers in `2026-08-25-akeri-batch-1.md`.
3. Require EMIT before any of the three drafts leave the building.
