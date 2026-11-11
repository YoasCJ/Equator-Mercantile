import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import { previewCandidates, searchCriteria, searchPlaces, searchSerper } from "./search.mjs";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};
const json = (value: unknown, status = 200) => Response.json(value, { status, headers });

function defaultKey(single: string, named: string, legacy: string) {
  return Deno.env.get(single) || JSON.parse(Deno.env.get(named) ?? "{}").default || Deno.env.get(legacy);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return json({ message: "Use POST to start a search." }, 405);

  try {
    const token = request.headers.get("Authorization")?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return json({ message: "Sign in to start a search." }, 401);
    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const publicKey = defaultKey("SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");
    const auth = { persistSession: false, autoRefreshToken: false };
    const client = createClient(url, publicKey, { auth, global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user }, error: authError } = await client.auth.getUser(token);
    if (authError || !user) return json({ message: "Sign in again to start a search." }, 401);

    const { data: membership, error: membershipError } = await client.from("crm_members")
      .select("user_id").eq("user_id", user.id).maybeSingle();
    if (membershipError) return json({ message: "Could not verify team access." }, 503);
    if (!membership) return json({ message: "Team access required." }, 403);

    const body = await request.json().catch(() => null);
    const criteria = searchCriteria(body);
    if (!criteria || typeof body.preview !== "boolean") {
      return json({ message: "Enter a product and location using 2–80 characters each." }, 400);
    }
    if (body.preview) return json({ candidates: previewCandidates(criteria) });
    if (Deno.env.get("BUYER_FINDER_LIVE") !== "true") {
      return json({ message: "Live search is disabled. You can run a preview with sample data." }, 503);
    }

    const placesKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const serperKey = Deno.env.get("SERPER_API_KEY");
    const dailyLimit = Number(Deno.env.get("BUYER_FINDER_DAILY_LIMIT"));
    if ((!placesKey && !serperKey) || !Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 20) {
      return json({ message: "Live search needs a server key and a daily limit between 1 and 20." }, 503);
    }
    const secret = defaultKey("SUPABASE_SECRET_KEY", "SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
    const admin = createClient(url, secret, { auth });
    const { data: reserved, error: limitError } = await admin.rpc("reserve_buyer_search", { daily_limit: dailyLimit });
    if (limitError) return json({ message: "Could not verify the daily search limit." }, 503);
    if (!reserved) return json({ message: "The team has reached its daily search limit." }, 429);

    try {
      return json({ candidates: placesKey ? await searchPlaces(criteria, placesKey) : await searchSerper(criteria, serperKey) });
    } catch {
      return json({ message: "The search provider did not return results. The attempt counts toward the daily limit." }, 502);
    }
  } catch {
    return json({ message: "Could not start Buyer Finder." }, 500);
  }
});
