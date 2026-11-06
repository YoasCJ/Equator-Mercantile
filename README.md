# Equator Mercantile Indonesia

The React/Vite site includes the public landing page and the internal Equator Command Center.
Team members sign in at `/login`, see pipeline counts at `/dashboard`, and manage prospects at `/dashboard/buyers`.

## Run locally

Use Node.js 22 or newer. Docker and the Supabase CLI are required for the local Auth and Data API stack.

1. Run `npm ci`.
2. Start Docker and run `npx supabase start` in this repo. This starts a local project and applies the migration under `supabase/migrations/`.
3. Copy `.env.example` to `.env.local`. Use the local API URL and **publishable** key reported by `npx supabase status`. Use a recent CLI that issues an `sb_publishable_` key. Vite accepts only that key format for `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Open the local Studio URL printed by the CLI. In **Authentication → Users**, create a confirmed email/password user and copy that user's UUID.
5. In the same local Studio's SQL editor, run the following with the UUID substituted:

   ```sql
   insert into public.crm_members (user_id, role)
   values ('00000000-0000-0000-0000-000000000000', 'admin');
   ```

6. Run `npm run dev`. Open the URL Vite prints, select **Login**, and sign in with the test account. Add a test buyer, change its status, and add a note. Reload `/dashboard/buyers` to confirm the session and activity persist. An Auth user without a `crm_members` row should see **Team access required**.

The public page also runs without Supabase configuration. The login and dashboard show a setup message in that case.

## Access and data

- Accounts are provisioned by a Supabase project operator. Public signup is disabled in the local Auth configuration. For an authorized hosted setup, disable signup in that project's Auth settings as well.
- The initial CRM is one shared team workspace. Approved admins and staff both read the same buyer list and may add buyers, change statuses, and append notes. Provisioning and membership changes use privileged project tools. Phase 1 has no browser-side membership management or deletion.
- PostgreSQL row-level security checks current membership on data requests. A signed-in user can only read their own membership. Removing a membership row revokes data access even if the Auth session is still active. For offboarding, also revoke the user's Auth access through the project controls.
- PostgreSQL saves the buyer status and its history in one transaction. Creation and status changes carry the actor identity from the request. Team users can append notes and read history. Database grants prevent them from overriding audit fields or editing history.
- The browser receives the project URL and public key. Keep server credentials, service-role keys, passwords, and bot secrets out of `VITE_*` variables and the repository. Use HTTPS for hosted projects. See [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys) and [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Verification

```sh
npm test
npx playwright install chromium
npm run test:browser
npm run build
```

`npm test` runs the migration in embedded PostgreSQL with synthetic Supabase roles and user claims. The Playwright suite uses a mocked Supabase API and covers mobile navigation, protected URLs, membership, buyer workflows, and sign-out. Use the local Supabase steps above to verify the real Auth and Data API together. To use an installed Edge browser instead of downloading Chromium, set `PLAYWRIGHT_CHANNEL=msedge` before the browser test.

For an authorized deployment, configure the host to serve `index.html` for SPA route requests, including direct visits to `/login` and `/dashboard/buyers`. Use a separate development or staging Supabase project for acceptance testing. Apply the migration to a hosted project only after the target and authorization are confirmed.

## Buyer Finder

Buyer Finder is available at `/dashboard/finder`. The default search mode uses sample data. It never contacts a search provider and cannot add sample candidates to the CRM.

To try it in an existing local stack, apply the new migration and serve the function from a separate terminal:

```sh
npx supabase migration up --local
npx supabase functions serve buyer-finder
```

Sign in, open **Buyer Finder**, and choose **Start search**. The default query is cloves in Bandung. Search results from live mode are unverified leads. Review the business, contact information, and source before saving a candidate.

Live mode requires separate approval. To enable it after approval, provide the following values to the Edge Function through Supabase function secrets or a local ignored env file passed to `supabase functions serve buyer-finder --env-file supabase/functions/.env.local`.

```dotenv
BUYER_FINDER_LIVE=true
BUYER_FINDER_DAILY_LIMIT=3
SERPER_API_KEY=
```

The shown limit is an example. Choose a shared limit of 1–20 requests per day for the team. The allowance resets at midnight WIB and applies to this dashboard only. Each live search uses one Serper request, including failed attempts after a reservation. Keep the key out of Vite environment variables.

The existing daily bot runs separately. See the [Buyer Finder integration plan](docs/buyer-finder-integration.md) for reconciling its historical results and coordinating quotas before sharing a provider account.
