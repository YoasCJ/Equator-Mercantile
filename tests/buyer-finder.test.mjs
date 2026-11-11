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

test("live results exclude unsafe links, marketplaces, and duplicate domains", () => {
  const organic = [
    { title: "Unsafe", link: "javascript:alert(1)" },
    { title: "Marketplace", link: "https://www.tokopedia.com/example" },
    { title: "Company", link: "https://example.com/company", snippet: "Contact https://wa.me/628123456789" },
    { title: "Duplicate", link: "https://www.example.com/duplicate" },
  ];
  assert.deepEqual(serperCandidates(organic), [
    {
      name: "Company", source: "https://example.com/company", website: "https://example.com",
      phone: "628123456789", evidence: "Contact https://wa.me/628123456789",
    },
  ]);
});

test("a live search makes one bounded provider request", async () => {
  let calls = 0;
  const mockFetch = async (url, request) => {
    calls += 1;
    assert.equal(url, "https://google.serper.dev/search");
    assert.equal(request.headers["X-API-KEY"], "test-key");
    assert.match(JSON.parse(request.body).q, /"Cengkeh" "Bandung"/);
    assert.equal(request.redirect, "error");
    return Response.json({ organic: [] });
  };
  assert.deepEqual(await searchSerper({ product: "Cengkeh", location: "Bandung" }, "test-key", mockFetch), []);
  assert.equal(calls, 1);
});

test("only Indonesian mobile numbers appear as phone contacts", () => {
  assert.equal(mobilePhone("0812-3456-7890"), "+6281234567890");
  assert.equal(mobilePhone("+62 857 3456 7890"), "+6285734567890");
  assert.equal(mobilePhone("+62 22 1234567"), "");
  assert.equal(mobilePhone("(021) 1234567"), "");
  assert.equal(mobilePhone("+65 81234567"), "");
});

test("Places returns at most five unique operational candidates and tolerates missing photos", async () => {
  const businesses = Array.from({ length: 7 }, (_, index) => ({
    id: `place-${index}`,
    displayName: { text: `Company ${index}` },
    businessStatus: "OPERATIONAL",
    internationalPhoneNumber: index === 0 ? "+62 22 123456" : "+62 812 3456 7890",
    googleMapsUri: "https://maps.google.com/?cid=123",
    photos: [{ name: `places/place-${index}/photos/example` }],
  }));
  let photos = 0;
  const fetcher = async (url, request) => {
    assert.equal(request.headers["X-Goog-Api-Key"], "test-key");
    if (url.endsWith("places:searchText")) {
      assert.match(JSON.parse(request.body).textQuery, /lada hitam di Bandung/);
      return Response.json({ places: [
        { ...businesses[0], id: "closed", businessStatus: "CLOSED_PERMANENTLY" },
        businesses[0], ...businesses,
      ] });
    }
    photos++;
    assert.match(url, /\/media\?maxWidthPx=240&skipHttpRedirect=true$/);
    if (url.includes("/place-0/")) return new Response(null, { status: 404 });
    return Response.json({ photoUri: "https://lh3.googleusercontent.com/test" });
  };
  const candidates = await searchPlaces({ product: "lada hitam", location: "Bandung" }, "test-key", fetcher);
  assert.equal(photos, 5);
  assert.equal(candidates.length, 5);
  assert.equal(candidates[0].phone, "");
  assert.equal(candidates[0].photo, null);
  assert.equal(candidates[1].phone, "+6281234567890");
  assert.equal(candidates[1].photo.url, "https://lh3.googleusercontent.com/test");
  assert.equal(candidates[1].mapsUrl, "https://maps.google.com/?cid=123");
  assert.match(candidates[1].source, /query_place_id=place-1$/);
});
