const skippedDomains = ["facebook.com", "instagram.com", "tiktok.com", "youtube.com",
  "linkedin.com", "shopee.co.id", "tokopedia.com", "bukalapak.com", "indotrading.com"];

export function searchCriteria(value) {
  const valid = (input) => typeof input === "string" && input.trim().length >= 2 &&
    input.trim().length <= 80 && /^[\p{L}\p{N} ,&.'()-]+$/u.test(input.trim());
  if (!value || !valid(value.product) || !valid(value.location)) return null;
  return { product: value.product.trim(), location: value.location.trim() };
}

export function previewCandidates({ product, location }) {
  return [{
    name: "Example Food Manufacturer",
    source: "https://example.com/",
    evidence: `Illustrative result for ${product} in ${location}. This is sample data.`,
  }];
}

export function serperCandidates(results) {
  const candidates = [];
  const domains = new Set();
  for (const hit of Array.isArray(results) ? results : []) {
    if (typeof hit?.title !== "string" || !hit.title.trim() ||
        typeof hit.link !== "string" || hit.link.length > 500) continue;
    let source;
    try { source = new URL(hit.link); } catch { continue; }
    if (source.protocol !== "https:" || source.username || source.password) continue;
    const domain = source.hostname.replace(/^www\./, "");
    if (domains.has(domain) || skippedDomains.some((skip) => domain === skip || domain.endsWith(`.${skip}`))) continue;
    domains.add(domain);
    candidates.push({
      name: Array.from(hit.title.trim()).slice(0, 160).join(""),
      source: hit.link,
      evidence: typeof hit.snippet === "string" ? hit.snippet.slice(0, 500) : "",
    });
    if (candidates.length === 5) break;
  }
  return candidates;
}

export async function searchSerper(criteria, key, fetcher = fetch) {
  const response = await fetcher("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      q: `"${criteria.product}" "${criteria.location}" (produsen OR pabrik OR distributor OR grosir) kontak`,
      gl: "id",
      hl: "id",
      num: 10,
    }),
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("Buyer search provider unavailable");
  return serperCandidates((await response.json()).organic);
}
