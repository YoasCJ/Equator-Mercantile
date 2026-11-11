import assert from "node:assert/strict";
import test from "node:test";
import { mobilePhone, searchPlaces, previewCandidates, searchCriteria, searchSerper, serperCandidates } from "../supabase/functions/buyer-finder/search.mjs";

test("preview validates the search criteria and returns clearly labeled sample data", () => {
  assert.equal(searchCriteria({ product: "cloves", location: "https://example.com" }), null);
  assert.equal(searchCriteria({ product: "a".repeat(81), location: "Bandung" }), null);
  const criteria = searchCriteria({ product: " Cengkeh ", location: " Bandung " });
  assert.deepEqual(criteria, { product: "Cengkeh", location: "Bandung" });
  assert.match(previewCandidates(criteria)[0].evidence, /sample data/);
});

test("buyer results exclude suppliers and informational pages, and rank purchase signals first", () => {
  const organic = [
    { title: "Jual Cengkeh - PT Pemasok", link: "https://supplier.example/", snippet: "Supplier cengkeh Bandung. Minimum pembelian 11 ton." },
    { title: "Meraih Peluang", link: "https://example.org/blog/cengkeh", snippet: "Saya mempunyai kebun cengkeh di Bandung." },
    { title: "Persyaratan", link: "https://jabarprov.go.id/cengkeh", snippet: "Buruh tani cengkeh di Bandung." },
    { title: "PT Bumbu Bandung", link: "https://bumbu.example/", snippet: "Produsen bumbu Bandung. Komposisi: cengkeh dan pala." },
    { title: "PT Pangan Bandung", link: "https://pangan.example/", snippet: "Kami membeli cengkeh untuk pabrik Bandung. https://wa.me/628123456789" },
    { title: "PT Pangan Bandung", link: "https://pangan.example/contact", snippet: "Pabrik Bandung memakai cengkeh sebagai bahan baku." },
    { title: "PT Pangan", link: "javascript:alert(1)", snippet: "Kami membeli cengkeh Bandung." },
  ];
  const candidates = serperCandidates(organic, { product: "cengkeh", location: "Bandung" });
  assert.deepEqual(candidates.map(candidate => candidate.name), ["PT Pangan Bandung", "PT Bumbu Bandung"]);
  assert.equal(candidates[0].phone, "+628123456789");
  assert.match(candidates[0].evidence, /^Indikasi pengadaan/);
  assert.match(candidates[1].evidence, /^Indikasi penggunaan bahan baku/);
  assert.deepEqual(serperCandidates(organic.slice(0, 3), { product: "cengkeh", location: "Bandung" }), []);
});

test("a live search makes one bounded provider request", async () => {
  let calls = 0;
  const mockFetch = async (url, request) => {
    calls += 1;
    assert.equal(url, "https://google.serper.dev/search");
    assert.equal(request.headers["X-API-KEY"], "test-key");
    assert.match(JSON.parse(request.body).q, /"Cengkeh" "Bandung"/);
    assert.equal(request.redirect, "error");
    return Response.json({ organic: [{ title: "PT Bumbu & Rempah", link: "https://example.com/company", snippet: "Pabrik Bandung memakai cengkeh sebagai bahan baku." }] });
  };
  const [candidate] = await searchSerper({ product: "Cengkeh", location: "Bandung" }, "test-key", mockFetch);
  const maps = new URL(candidate.mapsSearchUrl);
  assert.equal(maps.origin + maps.pathname, "https://www.google.com/maps/search/");
  assert.equal(maps.searchParams.get("api"), "1");
  assert.equal(maps.searchParams.get("query"), "PT Bumbu & Rempah Bandung");
  assert.equal(calls, 1);
});

test("only Indonesian mobile numbers appear as phone contacts", () => {
  assert.equal(mobilePhone("0812-3456-7890"), "+6281234567890");
  assert.equal(mobilePhone("+62 857 3456 7890"), "+6285734567890");
  assert.equal(mobilePhone("+62 22 1234567"), "");
  assert.equal(mobilePhone("(021) 1234567"), "");
  assert.equal(mobilePhone("+65 81234567"), "");
});

test("Places returns at most five unique operational candidates without requesting photos", async () => {
  const businesses = Array.from({ length: 7 }, (_, index) => ({
    id: `place-${index}`,
    displayName: { text: `Company ${index}` },
    businessStatus: "OPERATIONAL",
    internationalPhoneNumber: index === 0 ? "+62 22 123456" : "+62 812 3456 7890",
    googleMapsUri: "https://maps.google.com/?cid=123",
  }));
  let calls = 0;
  const fetcher = async (url, request) => {
    assert.equal(request.headers["X-Goog-Api-Key"], "test-key");
    calls++;
    assert.ok(url.endsWith("places:searchText"));
    assert.match(JSON.parse(request.body).textQuery, /lada hitam di Bandung/);
    return Response.json({ places: [
      { ...businesses[0], id: "closed", businessStatus: "CLOSED_PERMANENTLY" },
      businesses[0], ...businesses,
    ] });
  };
  const candidates = await searchPlaces({ product: "lada hitam", location: "Bandung" }, "test-key", fetcher);
  assert.equal(calls, 1);
  assert.equal(candidates.length, 5);
  assert.equal(candidates[0].phone, "");

  assert.equal(candidates[1].phone, "+6281234567890");

  assert.equal(candidates[1].mapsUrl, "https://maps.google.com/?cid=123");
  assert.match(candidates[1].source, /query_place_id=place-1$/);
});
