import { useId, useState, type FormEvent } from "react";
import { FunctionsHttpError, type SupabaseClient } from "@supabase/supabase-js";
import { ExternalLink, Search } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";

type Candidate = { name: string; source: string; website: string; phone: string; evidence: string };
type SearchResult = { candidates: Candidate[]; preview: boolean };

function CandidateReview({ candidate, client, preview }: {
  candidate: Candidate;
  client: SupabaseClient;
  preview: boolean;
}) {
  const [status, setStatus] = useState<"ready" | "saving" | "saved" | "duplicate" | "error">("ready");
  const formId = useId();

  async function saveCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("saving");
    try {
      const { data, error } = await client.rpc("save_buyer_candidate", {
        candidate_name: String(form.get("name")).trim(),
        candidate_location: String(form.get("location")).trim(),
        candidate_phone: String(form.get("phone")).trim(),
        candidate_source: candidate.source,
      });
      if (error) throw error;
      setStatus(data ? "saved" : "duplicate");
    } catch {
      setStatus("error");
    }
  }

  return (
    <tr>
      <th scope="row">{preview ? candidate.name : (
        <input form={formId} aria-label="Company name" name="name" defaultValue={candidate.name} maxLength={160} required />
      )}</th>
      <td>{preview ? "Unverified" : (
        <input form={formId} aria-label="Verified location" name="location" maxLength={160} placeholder="Unverified" />
      )}</td>
      <td>
        {candidate.phone ? <p>{candidate.phone} · Unverified WhatsApp link</p> : <p>Not found</p>}
        {!preview && <input form={formId} aria-label="Verified phone" name="phone" type="tel" maxLength={40} placeholder="Enter verified phone" />}
      </td>
      <td><a className="workspace-back" href={candidate.website} target="_blank" rel="noopener noreferrer">Website</a></td>
      <td>
        <a className="workspace-back" href={candidate.source} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={16} /> Open source
        </a>
        {candidate.evidence && <p className="workspace-muted">{candidate.evidence}</p>}
      </td>
      <td>{preview ? "Sample only" : (
        <form id={formId} className="workspace-form" onSubmit={saveCandidate}>
          <Button disabled={status === "saving" || status === "saved" || status === "duplicate"}>
            {status === "saving" ? "Saving…" : status === "saved" || status === "duplicate" ? "Already added" : "Add to CRM"}
          </Button>
          {status === "saved" && <p role="status">Buyer saved. <Link className="underline" to="/dashboard/buyers">Open Buyer CRM</Link></p>}
          {status === "duplicate" && <p role="status">A buyer with this name or source already exists in CRM.</p>}
          {status === "error" && <p role="alert" className="workspace-error">Could not save this candidate. Check the details and try again.</p>}
        </form>
      )}</td>
    </tr>
  );
}

export function BuyerFinder({ client }: { client: SupabaseClient }) {
  const [preview, setPreview] = useState(true);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");

  async function findBuyers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setResult(null);
    setError("");
    const fallback = "Could not reach Buyer Finder. Check that the Supabase function is running.";
    try {
      const { data, error } = await client.functions.invoke<{ candidates: Candidate[] }>("buyer-finder", {
        body: {
          product: String(form.get("product")).trim(),
          location: String(form.get("location")).trim(),
          preview,
        },
      });
      if (error) throw error;
      if (!Array.isArray(data?.candidates)) throw new Error();
      setResult({ candidates: data.candidates, preview });
    } catch (failure) {
      const details = failure instanceof FunctionsHttpError
        ? await failure.context.json().catch(() => null)
        : null;
      setError(typeof details?.message === "string" ? details.message : fallback);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="workspace-intro">
        <div>
          <p className="workspace-eyebrow">Buyer research</p>
          <h1>Buyer Finder</h1>
          <p className="workspace-muted">Search by product and location, then review each source before saving a candidate.</p>
        </div>
      </div>
      <form className="workspace-card workspace-form" onSubmit={findBuyers}>
        <div className="workspace-form-grid">
          <label>Product<input name="product" defaultValue="cengkeh" minLength={2} maxLength={80} required /></label>
          <label>Location<input name="location" defaultValue="Bandung" minLength={2} maxLength={80} required /></label>
          <label>Search mode
            <select value={preview ? "preview" : "live"} onChange={(event) => setPreview(event.target.value === "preview")}>
              <option value="preview">Preview with sample data</option>
              <option value="live">Live buyer search</option>
            </select>
          </label>
        </div>
        <Button disabled={pending}><Search size={16} /> {pending ? "Searching…" : "Start search"}</Button>
        {pending && <p role="status">Looking for candidates…</p>}
        {error && <p role="alert" className="workspace-error">{error}</p>}
      </form>
      {result && (
        <section aria-label="Search results" className="grid gap-3">
          <h2>{result.preview ? "Sample results" : "Buyer candidates"}</h2>
          <p className="workspace-muted">
            {result.preview ? "Sample results are for testing the screen and cannot be saved." :
              "Search results are leads. Check the source to confirm the business, contact details, and buying interest."}
          </p>
          {result.candidates.length === 0 && <p role="status">No candidates found for this search.</p>}
          {result.candidates.length > 0 && (
            <div className="workspace-card workspace-finder-results" role="region" aria-label="Buyer candidates table" tabIndex={0}>
              <table>
                <thead><tr>
                  {["Company", "Location", "Phone / WhatsApp", "Website", "Source", "Action"].map((column) => (
                    <th scope="col" key={column}>{column}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {result.candidates.map((candidate) => (
                    <CandidateReview key={candidate.source} candidate={candidate} client={client} preview={result.preview} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
