import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

const migration = await readFile(
  new URL("../supabase/migrations/20261106000000_buyer_crm.sql", import.meta.url),
  "utf8",
);
const finderMigration = await readFile(
  new URL("../supabase/migrations/20261106000100_buyer_finder.sql", import.meta.url),
  "utf8",
);
const admin = "00000000-0000-4000-8000-000000000001";
const staff = "00000000-0000-4000-8000-000000000002";
const outsider = "00000000-0000-4000-8000-000000000003";

test("buyer CRM migration enforces the shared team boundary and records activity", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());

  // Model the Supabase roles and request claim consumed by the migration.
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    grant usage on schema auth to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
  `);
  await db.exec(migration);
  await db.exec(finderMigration);
  await db.query("insert into auth.users (id) values ($1), ($2), ($3)", [admin, staff, outsider]);
  await db.query("insert into public.crm_members values ($1, 'admin'), ($2, 'staff')", [admin, staff]);

  async function assume(role, user = "") {
    await db.exec(`set role ${role}`);
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user]);
  }

  await assume("authenticated", admin);
  const { rows: [buyer] } = await db.query(
    "insert into public.buyers (company_name, location) values ('Test Exporter', 'Bandung') returning id, status, created_by",
  );
  assert.deepEqual(buyer, { id: buyer.id, status: "new", created_by: admin });

  await t.test("anonymous requests have no table access", async () => {
    await assume("anon");
    for (const table of ["buyers", "buyer_activities", "crm_members"]) {
      await assert.rejects(db.query(`select * from public.${table}`), { code: "42501" });
    }
    await assert.rejects(db.query("insert into public.buyers (company_name) values ('Denied')"), { code: "42501" });
  });

  await t.test("authenticated outsiders cannot see, write, or grant themselves access", async () => {
    await assume("authenticated", outsider);
    for (const table of ["buyers", "buyer_activities", "crm_members"]) {
      assert.deepEqual((await db.query(`select * from public.${table}`)).rows, []);
    }
    assert.deepEqual((await db.query("update public.buyers set status = 'won' where id = $1 returning id", [buyer.id])).rows, []);
    await assert.rejects(db.query("insert into public.buyers (company_name) values ('Denied')"), { code: "42501" });
    await assert.rejects(db.query("insert into public.buyer_activities (buyer_id, note) values ($1, 'Denied')", [buyer.id]), { code: "42501" });
    await assert.rejects(db.query("insert into public.crm_members values ($1, 'admin')", [outsider]), { code: "42501" });
  });

  await t.test("staff can update shared buyers and append notes with attributed history", async () => {
    await assume("authenticated", staff);
    assert.deepEqual((await db.query("select role from public.crm_members")).rows, [{ role: "staff" }]);
    assert.deepEqual((await db.query("select status from public.buyers")).rows, [{ status: "new" }]);
    const result = await db.query("update public.buyers set status = 'qualified' where id = $1 returning status", [buyer.id]);
    assert.deepEqual(result.rows, [{ status: "qualified" }]);
    await db.query("update public.buyers set status = 'qualified' where id = $1", [buyer.id]);
    await db.query("insert into public.buyer_activities (buyer_id, note) values ($1, 'Follow up next week')", [buyer.id]);
    assert.deepEqual((await db.query(`
      select kind, actor_id, old_status, new_status, note
      from public.buyer_activities where buyer_id = $1 order by kind
    `, [buyer.id])).rows, [
      { kind: "created", actor_id: admin, old_status: null, new_status: "new", note: null },
      { kind: "note", actor_id: staff, old_status: null, new_status: null, note: "Follow up next week" },
      { kind: "status_changed", actor_id: staff, old_status: "new", new_status: "qualified", note: null },
    ]);
  });

  await t.test("even CRM admins cannot impersonate actors, tamper with history, or delete buyers", async () => {
    await assume("authenticated", admin);
    const denied = [
      ["insert into public.buyers (company_name, created_by) values ('Spoof', $1)", [staff]],
      ["update public.buyers set created_by = $1 where id = $2", [staff, buyer.id]],
      ["insert into public.buyer_activities (buyer_id, note, actor_id) values ($1, 'Spoof', $2)", [buyer.id, staff]],
      ["insert into public.buyer_activities (buyer_id, kind, new_status) values ($1, 'created', 'new')", [buyer.id]],
      ["update public.buyer_activities set note = 'Tampered' where buyer_id = $1", [buyer.id]],
      ["delete from public.buyer_activities where buyer_id = $1", [buyer.id]],
      ["delete from public.buyers where id = $1", [buyer.id]],
      ["update public.crm_members set role = 'admin' where user_id = $1", [staff]],
    ];
    for (const [sql, params] of denied) {
      await assert.rejects(db.query(sql, params), { code: "42501" });
    }
  });

  await t.test("revoking membership cuts off an already authenticated user's data access", async () => {
    await db.exec("reset role");
    await db.query("delete from public.crm_members where user_id = $1", [staff]);
    await assume("authenticated", staff);
    assert.deepEqual((await db.query("select id from public.buyers")).rows, []);
    assert.deepEqual((await db.query("select id from public.buyer_activities")).rows, []);
  });

  await t.test("only the backend can reserve live search quota, and the cap holds", async () => {
    await assume("authenticated", admin);
    await assert.rejects(db.query("select public.reserve_buyer_search(2)"), { code: "42501" });
    await assume("service_role");
    for (const expected of [true, true, false]) {
      const { rows } = await db.query("select public.reserve_buyer_search(2) as reserved");
      assert.deepEqual(rows, [{ reserved: expected }]);
    }
    await assert.rejects(db.query("select public.reserve_buyer_search(21)"), { code: "22023" });
  });

  await t.test("reviewed candidates save as new buyers and duplicate sources or names are skipped", async () => {
    const sql = "select public.save_buyer_candidate($1, $2, $3) as id";
    const candidate = ["Candidate Co", "Bandung", "https://example.com/source"];
    await assume("authenticated", outsider);
    await assert.rejects(db.query(sql, candidate), { code: "42501" });
    await assume("authenticated", admin);
    const { rows: [saved] } = await db.query(sql, candidate);
    assert.ok(saved.id);
    assert.deepEqual((await db.query("select status from public.buyers where id = $1", [saved.id])).rows, [{ status: "new" }]);
    assert.deepEqual((await db.query(sql, ["Other Name", "Bandung", candidate[2]])).rows, [{ id: null }]);
    assert.deepEqual((await db.query(sql, [" candidate co ", "Bandung", "https://example.org/"])).rows, [{ id: null }]);
  });
});
