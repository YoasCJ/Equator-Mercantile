# Equator Buyer Finder MVP

Implemented only on feature branch feat/internal-buyer-finder; the public main branch stays unchanged.

## Flow
1. Login with Supabase Auth (administrator-invited account).
2. Finder: manually press Start Search. The Edge Function checks JWT and internal allowlist and uses one Serper request.
3. Inspect results, source and WhatsApp evidence. Search does NOT save any prospects.
4. Add individual candidates to Supabase buyers CRM. Duplicate source links are skipped.
5. CRM: track status and create/copy a basic personalized WhatsApp message. No AI calls or automatic messaging.

## Setup
1. Create Supabase project. Apply supabase/migrations/20261106000000_buyer_crm.sql in SQL editor.
2. Disable public signups; invite internal users in Auth and insert their user UUID into allowed_users as described in migration.
3. Set frontend environment based on .env.example. Never expose a service-role key in the Vite frontend.
4. Set Supabase Edge Function secrets SERPER_API_KEY and ALLOWED_ORIGIN (exact production website origin).
5. Deploy buyer-search with JWT verification ENABLED.
6. Configure SPA rewrites in hosting; vercel.json is included for Vercel.
7. Run npm install and npm run build and verify authentication/authorization before merging to main.

## Security checks before production
- Anonymous buyer table requests must be denied by RLS.
- Logged-in but unapproved users must be denied.
- Search must not create CRM rows. Clicking Add should create one row only.
- Check wrong-origin CORS, expired token, source dedupe, staff permissions, site navigation, and backups.
- Add server-side per-user quota/rate limiting before exposing this endpoint to regular operations.
- Data discovered from search snippets is unverified; confirm identity, phone number and purchasing need manually.

## Known limitations
- No OpenAI API costs. Serper searches may use existing provider credits.
- Search requests may return zero or irrelevant candidates; never invent a buyer or contact.
- Session currently lives in React memory, so reloading requires signing in again.
- Dedupe currently uses unique source URLs; it does not dedupe every alias of one company.
- Manual security testing and deployment are outstanding. No live credentials have been configured here.
