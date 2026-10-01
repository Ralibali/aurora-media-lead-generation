# Daily project dashboard

Company: Aurora Media AB
Objective: Give the owner one daily overview of all projects, website checks, GA4 usage and Google Search Console performance at auroramedia.se/admin.

Authority: COMMIT / EMIT for implementing and publishing this dashboard, requested by the owner in this session. The owner explicitly identified Aurora Media Lead Generation and auroramedia.se as the target. No outbound messages, paid services, broad role changes or unrelated site changes are authorized.

VERIFIED FACT: The existing admin has shared-password server authorization, leads, SEO and Website Guardian. Its overview lacks portfolio analytics. The current Google/Lovable inventory includes projects outside Lovable. The native Lovable Analytics connector is send-only and cannot read GA4 reports.

Implementation: Preserve existing admin access and leads. Add service-role-only analytics snapshots and source status, trusted project mapping, authenticated per-source refresh, a readable portfolio dashboard and partial failure states. Imported verified audit figures retain their original periods and import label. Do not claim a working GA4 API connection until it is tested.

Definition of done: Relevant lint/type checks/tests/build pass; private tables reject public access; live anonymous requests reject access; production dashboard is published and reviewed after login; connected sources refresh successfully or identify their exact remaining access requirement.

Business measure: Owner can identify an affected project, its latest measurement and the next useful action without opening each separate admin or Google report.
