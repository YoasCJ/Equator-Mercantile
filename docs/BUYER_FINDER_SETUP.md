# Buyer Finder staging and merge checklist

Use a separate staging Supabase project and synthetic buyer data for acceptance testing. The internal routes are `/login`, `/dashboard/buyers`, and `/dashboard/finder`. The public homepage uses its existing navigation.

## Project owner setup

1. Create or identify an empty staging project. In the Dashboard, disable public signups, keep email/password sign-in enabled, and create two confirmed test users under Authentication. Use a unique password for each.
2. Apply all SQL files in `supabase/migrations/` in order. From the CLI, explicitly link to the staging project ref and inspect `npx supabase db push --dry-run` before running `npx supabase db push`. An earlier prototype used the same first migration version with a different `buyers` table and an `allowed_users` table. If either prototype table exists, stop and reconcile its schema and data before applying these migrations. Keep any existing CRM data backed up.
3. Give one test user team access in the SQL Editor. Replace the UUID with the user's ID from Authentication. Leave the second user unenrolled for the access test.

   ```sql
   insert into public.crm_members (user_id, role)
   values ('00000000-0000-0000-0000-000000000000', 'staff');
   ```

4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the staging frontend. Copy the project URL and the `sb_publishable_…` key from the staging Dashboard. For local Vite use the ignored `.env.local` file. For an authorized hosted preview use that environment's settings, then rebuild. Keep database passwords, Auth passwords, project access tokens and secret keys in the owner’s project or local secret storage.
5. In staging Edge Function secrets set `BUYER_FINDER_LIVE=false`. Deploy the `buyer-finder` function to the explicit staging project ref with `npx supabase functions deploy buyer-finder --project-ref <staging-ref>`. The function config uses handler-level JWT verification with Supabase Auth and checks current CRM membership before executing any search. See [Supabase authorization headers](https://supabase.com/docs/guides/functions/auth-headers) and [function secrets](https://supabase.com/docs/guides/functions/secrets).

## Acceptance tests

- Open the landing page and check desktop and mobile navigation. Open `/login` and the dashboard routes directly to test hosting rewrites.
- Verify anonymous and invalid-token requests cannot use Buyer Finder. An authenticated non-member should see **Team access required** and be unable to read or write CRM data. Remove a test member and confirm their existing session loses data and search access.
- With a team account, run **Preview with sample data**. Confirm the result table appears with no Add button, and compare CRM contents before and after. Select **Live buyer search** and confirm the server reports that live search is disabled. Keep live provider secrets unset during this acceptance test.
- Add a synthetic buyer manually, change its status, add a note, and reload. Open that buyer's details, click **Create template**, and confirm the editable WhatsApp draft includes the saved company name. Browser tests cover the Finder Add step with a simulated live response.
- Review candidate data before adding it. Treat snippets, page titles, website links, and public WhatsApp links as unverified. The reviewer can correct the company name and enter a checked location and phone. The CRM stores the reviewed fields and source URL. Finder additions skip duplicate source URLs or normalized company names. Team members share the buyer workspace.

## Merge gate

Run `npm test`, `npm run test:browser`, `npm run build`, and the staging checks above. Review the diff against the latest `main` and confirm the hosting project's production branch and environment settings before merging. Keep the changes on the feature branch until acceptance. Its Vercel Git deployment is disabled in `vercel.json`. The main-branch deploy and hosted Supabase migration are separate operations.

To enable live Maps search, configure `GOOGLE_PLACES_API_KEY`, `BUYER_FINDER_DAILY_LIMIT` (1–20 shared dashboard requests per day), and `BUYER_FINDER_LIVE=true` as Edge Function secrets. Each reservation covers one provider search. The daily counter resets at midnight WIB. Verify Maps links and that landlines appear as unavailable. An existing Serper key supports web results with Google Maps search links when no Places key is set. Keep the existing bot's usage separate when budgeting. Outreach remains an editable draft for manual use.
