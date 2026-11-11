const skippedDomains = ["facebook.com", "instagram.com", "tiktok.com", "youtube.com",
  "linkedin.com", "shopee.co.id", "tokopedia.com", "bukalapak.com", "indotrading.com",
  "kompas.com", "detik.com", "scribd.com", "researchgate.net", "wordpress.com", "blogspot.com", "pinterest.com", "wikipedia.org", "wa.me", "whatsapp.com"];

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
    website: "https://example.com",
    phone: "",
    evidence: `Illustrative result for ${product} in ${location}. This is sample data.`,
  }];
}

function matchesTerm(text, term) {
  return text.toLowerCase().includes(term.toLowerCase());
}

export function serperCandidates(results, { product, location }) {
  const ranked = [];
  for (const hit of Array.isArray(results) ? results : []) {
    if (typeof hit?.title !== "string" || !hit.title.trim() ||
        typeof hit.link !== "string" || hit.link.length > 500) continue;
    let source;
    try { source = new URL(hit.link); } catch { continue; }
    if (source.protocol !== "https:" || source.username || source.password) continue;
    const domain = source.hostname.replace(/^www\./, "");
    if (/\.(go|ac|sch)\.id$/.test(domain) ||
        skippedDomains.some(skip => domain === skip || domain.endsWith(`.${skip}`)) ||
        /(?:^|\/)(?:blog|berita|news|artikel|article|journal|jurnal|forum|karir|career|tag)(?:\/|$)|\.pdf$/i.test(source.pathname)) continue;

    const title = hit.title.trim();
    const snippet = typeof hit.snippet === "string" ? hit.snippet.slice(0, 500) : "";
    const evidence = `${title} ${snippet}`;
    if (!matchesTerm(evidence, location)) continue;
    const mentionsProduct = matchesTerm(evidence, product);
    const kretekManufacturer = /^(?:cengkeh|cloves?)$/i.test(product) &&
      /\b(?:pabrik|produsen|memproduksi|manufactur\w*)\b[^.!?]{0,65}\bkretek\b/i.test(evidence);
    if (/\b(?:jual|penjual|supplier|pemasok|harga jual|bibit|jual beli|dijual)\b/i.test(title) ||
        /\b(?:supplier|pemasok|menjual|menyediakan|membudidayakan)\b[^.!?]{0,45}/i.test(snippet) &&
        /\b(?:minimum pembelian|lihat produk|kebun|stok tersedia)\b/i.test(snippet)) continue;

    const buyerIntent = mentionsProduct && /\b(?:kami (?:membeli|menerima|mencari|membutuhkan)|mencari pemasok|dibutuhkan|pengadaan|tender|procurement|purchase inquiry|buying requirement)\b/i.test(evidence);
    const ingredientUse = mentionsProduct && /\b(?:bahan baku|bahan utama|komposisi|ingredients|menggunakan|diolah menjadi)\b/i.test(evidence);
    const businessName = title.match(/\b(?:PT|CV)\.?\s+[^|–—-]+/i)?.[0] ??
      title.split(/\s+[|–—-]\s+/).at(-1)?.trim();
    if ((!buyerIntent && !ingredientUse && !kretekManufacturer) || !businessName ||
        !/\b(?:PT|CV|pabrik|produsen|manufacturer|manufacturing|industri|pengolahan|perusahaan)\b/i.test(evidence) ||
        /\b(?:peluang|persyaratan|cara membuat|manfaat|jurnal|penelitian|lowongan|membaca)\b/i.test(businessName)) continue;

    const phone = snippet.match(/https:\/\/(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=)([1-9]\d{9,14})(?![\d.-])/i)?.[1];
    ranked.push({
      domain,
      priority: buyerIntent ? 2 : ingredientUse ? 1 : 0,
      candidate: {
        name: businessName.slice(0, 160),
        source: source.href,
        website: source.origin,
        phone: mobilePhone(phone),
        location,
        evidence: `${buyerIntent ? "Indikasi pengadaan" : ingredientUse ? "Indikasi penggunaan bahan baku" : "Prospek industri kretek, kebutuhan beli belum dikonfirmasi"}: ${snippet || title}`,
      },
    });
  }
  ranked.sort((a, b) => b.priority - a.priority);
  const domains = new Set();
  return ranked.filter(({ domain }) => {
    if (domains.has(domain)) return false;
    domains.add(domain);
    return true;
  }).slice(0, 5).map(({ candidate }) => candidate);
}

export async function searchSerper(criteria, key, fetcher = fetch) {
  const query = /^(?:cengkeh|cloves?)$/i.test(criteria.product)
    ? `"${criteria.location}" (("cengkeh" ("membeli" OR "pengadaan" OR "bahan baku" OR "komposisi")) OR ("pabrik rokok kretek" OR "produsen kretek" OR "memproduksi rokok kretek")) -bibit -filetype:pdf`
    : `"${criteria.product}" "${criteria.location}" ("membeli" OR "mencari pemasok" OR "pengadaan" OR "bahan baku" OR "komposisi") (pabrik OR produsen OR perusahaan) -bibit -filetype:pdf`;
  const response = await fetcher("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      q: query,
      gl: "id",
      hl: "id",
      num: 10,
    }),
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });
  if (!response.ok) {
    console.warn("Buyer Finder Serper HTTP status", response.status);
    throw new Error("Buyer search provider unavailable");
  }
  return serperCandidates((await response.json()).organic, criteria).map(candidate => ({
    ...candidate,
    mapsSearchUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${candidate.name} ${criteria.location}`)}`,
  }));
}

export function mobilePhone(value) {
  const digits = typeof value === "string" ? value.trim().replace(/[\s().-]/g, "") : "";
  const number = digits.replace(/^(?:\+62|62|0)/, "");
  return /^(?:\+62|62|0)8\d{8,11}$/.test(digits) ? `+62${number}` : "";
}

function httpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

export async function searchPlaces({ product, location }, key, fetcher = fetch) {
  const response = await fetcher("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.primaryTypeDisplayName,places.businessStatus,places.internationalPhoneNumber,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.attributions",
    },
    body: JSON.stringify({ textQuery: `grosir distributor ${product} di ${location}`, regionCode: "ID", languageCode: "id", pageSize: 10 }),
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("Google Places unavailable");
  const { places } = await response.json();
  const ids = new Set();
  const shortlist = (Array.isArray(places) ? places : []).filter(place => {
    if (!/^[\w-]+$/.test(place?.id ?? "") || !place.displayName?.text ||
        (place.businessStatus && place.businessStatus !== "OPERATIONAL") || ids.has(place.id)) return false;
    ids.add(place.id);
    return true;
  }).slice(0, 5);
  return shortlist.map(place => {
    const source = `https://www.google.com/maps/search/?api=1&query=Indonesia&query_place_id=${encodeURIComponent(place.id)}`;
    return {
      name: place.displayName.text.slice(0, 160),
      source,
      mapsUrl: httpsUrl(place.googleMapsUri) || source,
      website: httpsUrl(place.websiteUri),
      location: place.formattedAddress ?? "",
      phone: mobilePhone(place.internationalPhoneNumber) || mobilePhone(place.nationalPhoneNumber),
      evidence: place.primaryTypeDisplayName?.text ?? "",
      attributions: (place.attributions ?? []).filter(item => item?.provider).map(item => ({
        name: item.provider, url: httpsUrl(item.providerUri),
      })),
    };
  });
}
