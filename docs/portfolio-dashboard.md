# Daily portfolio dashboard

The owner overview is at `https://auroramedia.se/admin`. Existing lead management remains beneath the project dashboard.

## Data and access

`admin-portfolio` verifies the existing `ADMIN_SECRET` or `FAQ_ANALYTICS_PASSWORD` before creating a privileged database client. Its `verify_jwt=false` setting is required for this existing custom admin protocol; it does not make the endpoint anonymous. All four `portfolio_*` tables use RLS and explicitly deny public, anon and authenticated access. Only the server role may read or write them. The project registry and imported analytics must not be committed to this public repository.

Overview requests use `{ action: 'overview', rangeDays: 7 | 28 | 90 }`. Refresh requests additionally supply a stored `projectId` and source (`health`, `ga4`, `gsc`). Arbitrary URLs and property IDs are never accepted from the browser. Refreshes return the current overview; callers must inspect the selected `sourceStates` record to determine the outcome. HTTP 200 alone does not mean the Google request succeeded.

Refreshes happen when the dashboard opens or the owner requests them. Health responses are cached for 15 minutes and Google reports for six hours. Refresh claims prevent duplicate requests for two minutes per project, source and period. Failed sources retain their previous report and display the error. This feature does not add email alerts or an unattended scheduler.

Health means an observed HTTP/HTML response, not verified signup, checkout or booking. Redirects are flagged rather than followed. Unknown status and absent analytics are not zeros. Summed project users are not deduplicated people across the portfolio. Different report periods are not silently combined.

## Google reporting connections

Search Console reuses the existing Lovable connection through server secrets `LOVABLE_API_KEY` and `GOOGLE_SEARCH_CONSOLE_API_KEY`. Every mapped property still needs read access. An alternative is the service account below, granted Search Console access.

GA4 requires reporting access. Lovable's native Google Analytics connector only sends browser measurements and cannot read reports. Choose one server-only configuration:

- `GOOGLE_ANALYTICS_CLIENT_ID`, `GOOGLE_ANALYTICS_CLIENT_SECRET`, `GOOGLE_ANALYTICS_REFRESH_TOKEN`: an OAuth client and refresh token authorized for `https://www.googleapis.com/auth/analytics.readonly`.
- `GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON`: a service account JSON key. Enable the Google Analytics Data API and grant that service account Viewer access to the relevant GA4 properties. Do not give owner/editor access merely to read reports.

Keep secrets in Lovable Cloud, never Git, frontend environment variables or database payloads. After connection, refresh one known property and confirm a new API snapshot, correct dates, totals and successful source state before refreshing the rest. GA4 reporting properties use numeric IDs; `G-…` measurement IDs cannot replace them.

The imported audit reports are explicitly historical imports. They are initial evidence, not proof of a working live API connection. Google API snapshots replace only the requested project, source and period after successful storage.

References: [GA4 Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries), [Search Console query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query), [Lovable Analytics limitations](https://docs.lovable.dev/integrations/google-analytics).
