import assert from "node:assert/strict";
import test from "node:test";
import { previewCandidates, searchCriteria, searchSerper, serperCandidates } from "../supabase/functions/buyer-finder/search.mjs";

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
