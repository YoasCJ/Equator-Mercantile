import { useId, useState, type FormEvent } from "react";
import { FunctionsHttpError, type SupabaseClient } from "@supabase/supabase-js";
import { ExternalLink, ImageOff, Search } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";

type Credit = { name: string; url: string };
type Candidate = {
  name: string;
  source: string;
  website: string;
  phone: string;
  evidence: string;
  location?: string;
  mapsUrl?: string;
  photo?: { url: string; authors: Credit[] } | null;
  attributions?: Credit[];
};

function Credits({ credits }: { credits?: Credit[] }) {
  if (!credits?.length) return null;
  return <ul className="workspace-photo-credits">
    {credits.map(({ name, url }, index) => (
      <li key={index}>{url ? <a href={url} target="_blank" rel="noopener noreferrer">{name}</a> : name}</li>
    ))}
  </ul>;
}
type SearchResult = { candidates: Candidate[]; preview: boolean };

function CandidateReview({ candidate, client, preview }: {
  candidate: Candidate;
  client: SupabaseClient;
  preview: boolean;
}) {
  const [status, setStatus] = useState<"ready" | "saving" | "saved" | "duplicate" | "error">("ready");
  const formId = useId();
  const [photoFailed, setPhotoFailed] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const mobile = /^(?:\+62|62)8\d{8,11}$/.test(candidate.phone)
    ? candidate.phone.replace(/^62/, "+62")
    : "";

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
      <th scope="row">
        <div className="workspace-candidate">
          <div className="workspace-candidate-media">
            {candidate.photo && !photoFailed ? (
              <>
                <img src={candidate.photo.url} alt={`Foto ${candidate.name}`} width={104} height={72}
                  referrerPolicy="no-referrer" onError={() => setPhotoFailed(true)} />
                <Credits credits={candidate.photo.authors} />
              </>
            ) : <div className="workspace-photo-empty" aria-label="Foto tidak tersedia"><ImageOff size={20} aria-hidden="true" /></div>}
          </div>
          <div>
            {preview || candidate.mapsUrl ? candidate.name : (
              <input form={formId} aria-label="Company name" name="name" defaultValue={candidate.name} maxLength={160} required />
            )}
            <Credits credits={candidate.attributions} />
          </div>
        </div>
      </th>
      <td>{preview || candidate.mapsUrl ? candidate.location || "Unverified" : (
        <input form={formId} aria-label="Verified location" name="location" maxLength={160}
          defaultValue={candidate.location?.slice(0, 160)} placeholder="Tidak tersedia" />
      )}</td>
      <td>{preview || candidate.mapsUrl ? mobile || "Tidak tersedia" : (
        <input form={formId} aria-label="Verified phone" name="phone" type="tel" maxLength={16}
          pattern="[+]628[0-9]{8,11}" defaultValue={mobile} placeholder="Tidak tersedia"
          title="Gunakan nomor seluler Indonesia dalam format +628…" />
      )}</td>
      <td><p className="workspace-muted">{candidate.evidence || "—"}</p></td>
      <td>
        <a className="workspace-back" href={candidate.mapsUrl || candidate.source} target="_blank" rel="noopener noreferrer">
          {candidate.mapsUrl ? "Buka Maps" : "Open source"} <ExternalLink size={14} aria-hidden="true" />
        </a>
        {candidate.website && <a className="workspace-back workspace-candidate-website" href={candidate.website}
          target="_blank" rel="noopener noreferrer">Website</a>}
      </td>
      <td>{preview ? "Sample only" : candidate.mapsUrl && !reviewing ? (
        <Button type="button" onClick={() => setReviewing(true)}>+ Add</Button>
      ) : (
        <form id={formId} className="workspace-form" onSubmit={saveCandidate}>
          {candidate.mapsUrl && status !== "saved" && status !== "duplicate" && (
            <>
              <p className="workspace-muted">Isi data yang lu konfirmasi dari website bisnis atau langsung dari usaha.</p>
              <label>Nama usaha<input name="name" maxLength={160} required /></label>
              <label>Lokasi<input name="location" maxLength={160} /></label>
              <label>HP bisnis<input name="phone" type="tel" maxLength={16} pattern="[+]628[0-9]{8,11}" placeholder="+628…" /></label>
            </>
          )}
          <Button aria-label={status === "ready" || status === "error" ? "Add to CRM" : undefined} disabled={status === "saving" || status === "saved" || status === "duplicate"}>
            {status === "saving" ? "Saving…" : status === "saved" || status === "duplicate" ? "✓ Tersimpan" : candidate.mapsUrl ? "Simpan" : "+ Add"}
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
          <h2>{result.candidates.length} {result.preview ? "kandidat · Data simulasi" : "kandidat"}</h2>
          {result.candidates.some(candidate => candidate.mapsUrl) && <span className="workspace-maps-credit" translate="no">Google Maps</span>}
          <p className="workspace-muted">
            {result.preview ? "Sample results are for testing the screen and cannot be saved." :
              "Search results are leads. Check the source to confirm the business, contact details, and buying interest."}
          </p>
          {result.candidates.length === 0 && <p role="status">No candidates found for this search.</p>}
          {result.candidates.length > 0 && (
            <div className="workspace-card workspace-finder-results" role="region" aria-label="Buyer candidates table" tabIndex={0}>
              <table>
                <thead><tr>
                  {["Nama usaha", "Lokasi", "HP bisnis", "Kenapa relevan", "Sumber", "CRM"].map((column) => (
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
