import { expect, test, type Page } from "@playwright/test";

const endpoint = "https://equator-test.invalid/**";
const user = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "test@example.invalid",
  aud: "authenticated",
  role: "authenticated",
};

async function mockAuth(page: Page, member: boolean) {
  let status = "new";
  let companyName = "";
  let note = "";
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = [
    encode({ alg: "HS256", typ: "JWT" }),
    encode({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 }),
    "test",
  ].join(".");

  await page.route(endpoint, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    if (path === "/auth/v1/token") {
      if (request.postDataJSON().password !== "local-test-password") {
        return route.fulfill({ status: 400, json: { message: "Invalid login credentials" } });
      }
      return route.fulfill({ json: {
        access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, user,
      } });
    }
    if (path === "/auth/v1/logout") return route.fulfill({ status: 204 });
    if (path === "/rest/v1/crm_members") return route.fulfill({ json: member ? [{ role: "staff" }] : [] });
    if (!member) throw new Error("A non-member should never request CRM data.");

    if (path === "/functions/v1/buyer-finder") {
      const { preview } = request.postDataJSON();
      return route.fulfill({ json: {
        candidates: [{
          name: preview ? "Sample Company" : "Test Prospect",
          source: "https://example.com/",
          website: "https://example.com",
          phone: "",
          evidence: "Test source",
        }],
      } });
    }
    if (path === "/rest/v1/rpc/save_buyer_candidate") {
      companyName = request.postDataJSON().candidate_name;
      return route.fulfill({ json: user.id });
    }

    const buyer = () => ({
      id: user.id, company_name: companyName, location: "Bandung", phone: null, source: null,
      status, updated_at: status === "new" ? "2026-11-06T00:00:00Z" : "2026-11-06T01:00:00Z",
    });

    if (path === "/rest/v1/buyers") {
      if (method === "POST") {
        companyName = request.postDataJSON().company_name;
        return route.fulfill({ status: 201 });
      }
      if (method === "PATCH") {
        status = request.postDataJSON().status;
        return route.fulfill({ json: [buyer()] });
      }
      const requestedStatus = new URL(request.url()).searchParams.get("status");
      const rows = companyName && (!requestedStatus || requestedStatus === `eq.${status}`) ? [buyer()] : [];
      const headers = {
        "content-range": rows.length ? "0-0/1" : "*/0",
        "access-control-expose-headers": "content-range",
      };
      return method === "HEAD" ? route.fulfill({ headers }) : route.fulfill({ json: rows, headers });
    }
    if (path === "/rest/v1/buyer_activities") {
      if (method === "POST") {
        note = request.postDataJSON().note;
        return route.fulfill({ status: 201 });
      }
      const entries: Record<string, string>[] = status === "new" ? [] : [{
        id: "status", kind: "status_changed", old_status: "new", new_status: status,
        created_at: "2026-11-06T01:00:00Z",
      }];
      if (note) entries.unshift({
        id: "note", kind: "note", note, created_at: "2026-11-06T02:00:00Z",
      });
      return route.fulfill({ json: entries });
    }
    throw new Error(`Unexpected request to ${path}`);
  });
}

async function login(page: Page) {
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill("local-test-password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("the public site and direct login still open on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator("#home")).toBeVisible();
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Team sign in" })).toBeVisible();
});

test("a direct CRM URL requires sign-in and refuses a non-member", async ({ page }) => {
  await mockAuth(page, false);
  await page.goto("/dashboard/buyers");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill("wrong");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toContainText("Sign-in failed");
  await login(page);
  await expect(page).toHaveURL(/\/dashboard\/buyers$/);
  await expect(page.getByRole("heading", { name: "Team access required" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Buyer CRM" })).toHaveCount(0);
});

test("a member can add a buyer, update status, review notes, and sign out on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockAuth(page, true);
  await page.goto("/dashboard/buyers");
  await login(page);
  await expect(page.getByText("No buyers yet.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Add buyer" }).click();
  await page.getByLabel("Company").fill("Test Spices");
  await page.getByLabel("Location").fill("Bandung");
  await page.getByRole("button", { name: "Save buyer" }).click();
  await page.getByRole("button", { name: "Details for Test Spices" }).click();
  await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("qualified");
  await page.getByRole("button", { name: "Save status" }).click();
  await expect(page.getByText("New → Qualified")).toBeVisible();
  await page.getByLabel("Activity note").fill("Follow up on Monday");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Follow up on Monday")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  await page.reload();
  await page.getByRole("button", { name: "Details for Test Spices" }).click();
  await expect(page.getByText("Follow up on Monday")).toBeVisible();
  await page.getByRole("combobox", { name: "Filter by status" }).selectOption("new");
  await expect(page.getByText("No buyers with this status.")).toBeVisible();
  await page.getByRole("link", { name: "Overview" }).click();
  await expect(page.getByRole("heading", { name: "Buyer pipeline" })).toBeVisible();
  await expect(page.locator(".workspace-metric").filter({ hasText: "Qualified" }).getByText("1")).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

test("Finder previews are read-only and reviewed live candidates can enter the CRM", async ({ page }) => {
  await mockAuth(page, true);
  await page.goto("/dashboard/finder");
  await login(page);
  await expect(page.getByRole("heading", { name: "Buyer Finder" })).toBeVisible();
  await page.getByRole("button", { name: "Start search" }).click();
  await expect(page.getByRole("rowheader", { name: "Sample Company" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to CRM" })).toHaveCount(0);

  await page.getByRole("combobox", { name: "Search mode" }).selectOption("live");
  await page.getByRole("button", { name: "Start search" }).click();
  await page.getByLabel("Company name").fill("Verified Prospect");
  await page.getByRole("button", { name: "Add to CRM" }).click();
  await page.getByRole("link", { name: "Open Buyer CRM" }).click();
  await expect(page.getByText("Verified Prospect")).toBeVisible();
  await page.getByRole("button", { name: "Details for Verified Prospect" }).click();
  await page.getByRole("button", { name: "Create template" }).click();
  await expect(page.getByLabel("WhatsApp draft")).toHaveValue(/Verified Prospect/);
});
