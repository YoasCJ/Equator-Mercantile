# Buyer Finder integration plan

The private `YoasCJ/equator-daily-leads` repo documents a GitHub Actions workflow that uses Serper to find candidate buyers, Google Sheets for deduplication, and Telegram to send draft outreach for human review. Treat the current sheet as the source for a one-time reconciliation when the integration is approved.

The dashboard's on-demand Buyer Finder is a separate path. It invokes the `buyer-finder` Edge Function, checks the caller's CRM membership, and uses a database reservation before each live request. Saving a result is a separate review action in the dashboard. The shared quota covers dashboard requests only. See the [README](../README.md) for local preview setup.

## Ingestion and review

1. Use sanitized fixtures to build and test a server-side ingest endpoint. Define a strict payload with a stable bot lead ID, company, location, phone, source URL, contact evidence, and discovery time. Enforce length and batch limits. Treat evidence and draft copy as untrusted input.
2. Have the workflow authenticate to the endpoint with a dedicated ingest credential stored in GitHub Actions Secrets. Scope it to staging candidates and rotate it separately from other credentials. Verify authorization before accepting a request. Add rate limits and log only request IDs, counts, and outcomes. Keep Supabase database credentials and provider keys in server-side secret storage.
3. Write candidates to a separate review table through a narrowly scoped database role or function. Use a unique source-plus-lead-ID constraint so retries are idempotent. Use normalized company, phone, and website matches to flag possible duplicates. Keep public contact evidence and candidate verification separate from active buyer status.
4. Let a designated reviewer approve or reject each candidate. In one transaction, promote an approved candidate to the CRM or link it to an existing buyer, recording the reviewer and provenance. Preserve existing CRM status, notes, and contact history during deduplication.
5. Rehearse reconciliation with an anonymized sheet export. After approval, map the real sheet rows in a dry run and resolve conflicts before the import. Switch the bot's deduplication source only after comparing accepted, rejected, and duplicate counts.

## Activation

Keep live search and bot ingestion disabled by default. Before wiring in the bot, verify replay handling, oversized and unauthorized requests, duplicate detection, review permissions, and redaction using fixtures. Enable Serper use, workflow schedule changes, or new notifications only after explicit approval with a documented quota and cost cap. Template-based outreach remains a draft for manual review.
