import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";

const statuses = {
  new: "New",
  qualified: "Qualified",
  contacted: "Contacted",
  follow_up: "Follow-up",
  won: "Won",
  lost: "Lost",
};

type Status = keyof typeof statuses;
type Buyer = {
  id: string;
  company_name: string;
  location: string | null;
  phone: string | null;
  source: string | null;
  status: Status;
  updated_at: string;
};
type Activity = {
  id: string;
  kind: "created" | "status_changed" | "note";
  note: string | null;
  old_status: Status | null;
  new_status: Status | null;
  created_at: string;
};

const statusOptions = Object.entries(statuses).map(([value, label]) => (
  <option key={value} value={value}>{label}</option>
));
const pageSize = 25;
const activityPageSize = 20;
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export function Overview({ client }: { client: SupabaseClient }) {
  const [counts, setCounts] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const request = new AbortController();
    async function loadCounts() {
      try {
        const results = await Promise.all(Object.keys(statuses).map((status) =>
          client.from("buyers").select("id", { count: "exact", head: true })
            .eq("status", status).abortSignal(request.signal),
        ));
        if (request.signal.aborted) return;
        if (results.some((result) => result.error || result.count === null)) throw new Error();
        setCounts(results.map((result) => result.count ?? 0));
      } catch {
        if (!request.signal.aborted) setError(true);
      }
    }
    void loadCounts();
    return () => request.abort();
  }, [client, revision]);

  return (
    <>
      <div className="workspace-intro">
        <div>
          <p className="workspace-eyebrow">Team workspace</p>
          <h1>Buyer pipeline</h1>
          <p className="workspace-muted">See where prospects stand and find the next follow-up.</p>
        </div>
        <Button asChild><Link to="/dashboard/buyers">Open Buyer CRM <ArrowRight size={16} /></Link></Button>
      </div>
      <section aria-label="Buyer counts by status" className="workspace-metrics">
        {Object.entries(statuses).map(([status, label], index) => (
          <div className="workspace-card workspace-metric" key={status}>
            <span className={`workspace-badge status-${status}`}>{label}</span>
            <strong>{counts[index] ?? "—"}</strong>
          </div>
        ))}
      </section>
      {error && (
        <div className="workspace-actions">
          <p role="alert" className="workspace-error">Could not load pipeline counts.</p>
          <Button variant="outline" onClick={() => { setError(false); setRevision(revision + 1); }}>Retry</Button>
        </div>
      )}
      {!error && counts.length === 0 && <p role="status" className="workspace-muted">Loading pipeline counts…</p>}
    </>
  );
}

function AddBuyer({ client, onAdded }: { client: SupabaseClient; onAdded: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function addBuyer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name)).trim();
    if (!value("company_name")) {
      setError("Enter a company name.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const { error } = await client.from("buyers").insert({
        company_name: value("company_name"),
        location: value("location") || null,
        phone: value("phone") || null,
        source: value("source") || null,
      });
      if (error) throw error;
      onAdded();
    } catch {
      setError("Could not add this buyer. Refresh the list before retrying.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="workspace-card workspace-form" onSubmit={addBuyer}>
      <h2>Add buyer</h2>
      <div className="workspace-form-grid">
        <label>Company<input name="company_name" maxLength={160} required /></label>
        <label>Location<input name="location" maxLength={160} /></label>
        <label>Phone<input name="phone" type="tel" maxLength={40} /></label>
        <label>Source<input name="source" maxLength={500} /></label>
      </div>
      {error && <p role="alert" className="workspace-error">{error}</p>}
      <Button disabled={saving}>{saving ? "Saving…" : "Save buyer"}</Button>
    </form>
  );
}

function BuyerDetails({ buyer, client, onClose, onStatusChanged }: {
  buyer: Buyer;
  client: SupabaseClient;
  onClose: () => void;
  onStatusChanged: () => void;
}) {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [activityError, setActivityError] = useState(false);
  const [activityPage, setActivityPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draftStatus, setDraftStatus] = useState(buyer.status);
  const [template, setTemplate] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const buyerId = buyer.id;

  useEffect(() => {
    heading.current?.focus();
  }, []);

  useEffect(() => {
    const request = new AbortController();
    async function loadActivity() {
      try {
        const offset = activityPage * activityPageSize;
        const { data, error } = await client.from("buyer_activities")
          .select("id,kind,note,old_status,new_status,created_at").eq("buyer_id", buyerId)
          .order("created_at", { ascending: false }).order("id")
          .range(offset, offset + activityPageSize).abortSignal(request.signal);
        if (request.signal.aborted) return;
        if (error) throw error;
        setHasMore(data.length > activityPageSize);
        setActivities(data.slice(0, activityPageSize) as Activity[]);
      } catch {
        if (!request.signal.aborted) setActivityError(true);
      }
    }
    void loadActivity();
    return () => request.abort();
  }, [client, buyerId, activityPage, revision, buyer.updated_at]);

  function showActivityPage(page: number) {
    setActivityError(false);
    setActivities(null);
    setActivityPage(page);
    setRevision((value) => value + 1);
  }

  async function changeStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { data, error } = await client.from("buyers").update({ status: draftStatus })
        .eq("id", buyerId).eq("updated_at", buyer.updated_at).select("id").maybeSingle();
      if (error) throw error;
      if (!data) {
        setError("This buyer changed or is no longer accessible. Refresh the list before saving again.");
        return;
      }
      showActivityPage(0);
      onStatusChanged();
    } catch {
      setError("Could not update the status. Refresh the list before retrying.");
    } finally {
      setSaving(false);
    }
  }

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const note = String(new FormData(form).get("note")).trim();
    setError("");
    if (!note) {
      setError("Enter a note before saving.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await client.from("buyer_activities").insert({ buyer_id: buyerId, note });
      if (error) throw error;
      form.reset();
      showActivityPage(0);
    } catch {
      setError("Could not save the note. Refresh activity before retrying.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="workspace-card workspace-details" aria-label="Buyer details">
      <div className="workspace-section-heading">
        <div>
          <p className="workspace-eyebrow">Buyer record</p>
          <h2 ref={heading} tabIndex={-1}>{buyer.company_name}</h2>
        </div>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
      <dl className="workspace-buyer-meta">
        <div><dt>Location</dt><dd>{buyer.location || "—"}</dd></div>
        <div><dt>Phone</dt><dd>{buyer.phone || "—"}</dd></div>
        <div><dt>Source</dt><dd>{buyer.source || "—"}</dd></div>
      </dl>
      <section className="workspace-form" aria-label="WhatsApp template">
        {template === null ? (
          <Button variant="outline" onClick={() => setTemplate(
            `Selamat siang Pak/Bu, perkenalkan saya Yoas dari PT Equator Mercantile Indonesia. Kami menyediakan komoditas rempah seperti cengkeh, pala, dan lada.\n\nKami ingin memperkenalkan perusahaan kami kepada ${buyer.company_name}. Apakah Bapak/Ibu terbuka untuk berdiskusi mengenai kerja sama pasokan rempah? Terima kasih.`,
          )}>Create template</Button>
        ) : (
          <>
            <label>WhatsApp draft<textarea rows={5} value={template} onChange={(event) => {
              setTemplate(event.target.value);
              setCopyStatus("");
            }} /></label>
            <Button variant="outline" disabled={!template.trim()} onClick={async () => {
              try {
                await navigator.clipboard.writeText(template);
                setCopyStatus("Draft copied.");
              } catch {
                setCopyStatus("Select the draft and copy it manually.");
              }
            }}>Copy template</Button>
            {copyStatus && <p role="status">{copyStatus}</p>}
          </>
        )}
      </section>
      <form className="workspace-form" onSubmit={changeStatus}>
        <label>Status
          <select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value as Status)} disabled={saving}>
            {statusOptions}
          </select>
        </label>
        <Button disabled={saving || draftStatus === buyer.status}>Save status</Button>
      </form>
      <form className="workspace-form" onSubmit={addNote}>
        <label>Activity note<textarea name="note" maxLength={2000} rows={3} required /></label>
        <Button variant="outline" disabled={saving}>Add note</Button>
      </form>
      {error && <p role="alert" className="workspace-error">{error}</p>}
      <h3>Activity history</h3>
      {activityError ? (
        <div className="workspace-actions">
          <p role="alert" className="workspace-error">Could not load activity.</p>
          <Button variant="outline" onClick={() => showActivityPage(activityPage)}>Retry</Button>
        </div>
      ) : activities === null ? (
        <p role="status" className="workspace-muted">Loading activity…</p>
      ) : activities.length === 0 ? (
        <p className="workspace-muted">No activity on this page.</p>
      ) : (
        <ul className="workspace-history">
          {activities.map((entry) => (
            <li key={entry.id}>
              <p>{entry.kind === "note" ? entry.note :
                entry.kind === "created" ? "Buyer added" :
                  `${statuses[entry.old_status!]} → ${statuses[entry.new_status!]}`}</p>
              <time dateTime={entry.created_at}>{dateFormat.format(new Date(entry.created_at))}</time>
            </li>
          ))}
        </ul>
      )}
      {(activityPage > 0 || hasMore) && (
        <div className="workspace-actions" aria-label="Activity pages">
          <Button variant="outline" disabled={activityPage === 0} onClick={() => showActivityPage(activityPage - 1)}>Newer</Button>
          <Button variant="outline" disabled={!hasMore || !activities} onClick={() => showActivityPage(activityPage + 1)}>Older</Button>
        </div>
      )}
    </section>
  );
}

export function BuyerCrm({ client }: { client: SupabaseClient }) {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{ rows: Buyer[]; count: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const buyer = result?.rows.find((row) => row.id === selectedId);

  useEffect(() => {
    const request = new AbortController();
    async function loadBuyers() {
      try {
        const start = page * pageSize;
        let query = client.from("buyers").select("id,company_name,location,phone,source,status,updated_at", { count: "exact" });
        if (filter !== "all") query = query.eq("status", filter);
        const { data, error, count } = await query.order("created_at", { ascending: false }).order("id")
          .range(start, start + pageSize - 1).abortSignal(request.signal);
        if (request.signal.aborted) return;
        if (error && error.code !== "PGRST103") throw error;
        if (page > 0 && (count ?? 0) <= start) {
          setPage(Math.max(0, Math.ceil((count ?? 0) / pageSize) - 1));
          return;
        }
        setResult({ rows: (data ?? []) as Buyer[], count: count ?? 0 });
      } catch {
        if (!request.signal.aborted) setError(true);
      }
    }
    void loadBuyers();
    return () => request.abort();
  }, [client, filter, page, revision]);

  function refresh() {
    setError(false);
    setResult(null);
    setRevision((value) => value + 1);
  }

  function showPage(nextPage: number) {
    setSelectedId(undefined);
    setPage(nextPage);
    refresh();
  }

  return (
    <>
      <div className="workspace-intro">
        <div>
          <p className="workspace-eyebrow">Prospect management</p>
          <h1>Buyer CRM</h1>
          <p className="workspace-muted">Track buyer contacts, pipeline status, and follow-up notes.</p>
        </div>
        <Button variant={adding ? "outline" : "default"} onClick={() => setAdding(!adding)} aria-expanded={adding}>
          {adding ? "Close form" : <><Plus size={16} /> Add buyer</>}
        </Button>
      </div>
      {adding && <AddBuyer client={client} onAdded={() => {
        setAdding(false);
        setFilter("all");
        showPage(0);
      }} />}
      <div className={buyer ? "workspace-crm-grid" : ""}>
        <section className="workspace-card" aria-label="Buyer list">
          <div className="workspace-section-heading">
            <h2>Buyers {result && <small>({result.count})</small>}</h2>
            <div className="workspace-actions">
              <label className="workspace-filter">Filter by status
                <select value={filter} onChange={(event) => {
                  setFilter(event.target.value as Status | "all");
                  showPage(0);
                }}>
                  <option value="all">All statuses</option>
                  {statusOptions}
                </select>
              </label>
              <Button variant="outline" onClick={refresh}>Refresh</Button>
            </div>
          </div>
          {error ? (
            <p role="alert" className="workspace-error">Could not load buyers. Try refreshing the list.</p>
          ) : !result ? (
            <p role="status" className="workspace-muted">Loading buyers…</p>
          ) : result.rows.length === 0 ? (
            <p className="workspace-muted">{filter === "all" ? "No buyers yet. Add your first buyer to begin." : "No buyers with this status."}</p>
          ) : (
            <ul className="workspace-buyers">
              {result.rows.map((row) => (
                <li key={row.id}>
                  <div><strong>{row.company_name}</strong><p>{row.location || "Location not recorded"}</p></div>
                  <span className={`workspace-badge status-${row.status}`}>{statuses[row.status]}</span>
                  <Button variant="outline" aria-label={`Details for ${row.company_name}`}
                    aria-expanded={selectedId === row.id}
                    onClick={() => setSelectedId(selectedId === row.id ? undefined : row.id)}>Details</Button>
                </li>
              ))}
            </ul>
          )}
          {result && result.count > pageSize && (
            <div className="workspace-actions" aria-label="Buyer pages">
              <Button variant="outline" disabled={page === 0} onClick={() => showPage(page - 1)}>Previous</Button>
              <p>Page {page + 1} of {Math.ceil(result.count / pageSize)}</p>
              <Button variant="outline" disabled={(page + 1) * pageSize >= result.count}
                onClick={() => showPage(page + 1)}>Next</Button>
            </div>
          )}
        </section>
        {buyer && <BuyerDetails key={buyer.id} buyer={buyer} client={client}
          onClose={() => setSelectedId(undefined)} onStatusChanged={refresh} />}
      </div>
    </>
  );
}
