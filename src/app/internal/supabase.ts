import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

function validProjectUrl(value: string) {
  try {
    const parsed = new URL(value);
    const isLocalHttp = parsed.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    return (parsed.protocol === "https:" || isLocalHttp) &&
      parsed.pathname === "/" && !parsed.search && !parsed.hash &&
      !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

export const supabase = url && key?.startsWith("sb_publishable_") && validProjectUrl(url)
  ? createClient(url, key, { auth: { detectSessionInUrl: false } })
  : null;
