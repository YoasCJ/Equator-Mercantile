import { useState } from "react";

const URL=(import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/,"");
const KEY=import.meta.env.VITE_SUPABASE_ANON_KEY || "";
type Buyer={id?:string,name:string,location:string,phone:string,website:string,source:string,verification:string,category:string,status?:string};
const headers=(token:string)=>({"apikey":KEY,"Authorization":"Bearer "+token,"Content-Type":"application/json"});
const errors=async (res:Response)=>{if(!res.ok){let message=await res.text();throw new Error(message.slice(0,250))}return res};
function draft(b:Buyer){return "Selamat siang Pak/Bu, perkenalkan saya Yoas dari PT Equator Mercantile Indonesia. Kami bergerak dalam penyediaan komoditas rempah seperti cengkeh, pala, dan lada.\n\nKami ingin memperkenalkan perusahaan kami kepada "+b.name+". Apakah Bapak/Ibu terbuka untuk berdiskusi mengenai kemungkinan kerja sama pasokan rempah? Terima kasih.";}
export function InternalApp(){
  const [token,setToken]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [tab,setTab]=useState<"finder"|"crm">("finder");
  const [results,setResults]=useState<Buyer[]>([]);
  const [saved,setSaved]=useState<Buyer[]>([]);
  const [selected,setSelected]=useState<Buyer|null>(null);
  const [query,setQuery]=useState("grosir dan produsen bumbu di Bandung Jawa Barat yang berpotensi membeli cengkeh, pala, atau lada");
  const configured=Boolean(URL&&KEY);

  async function loadCRM(auth=token){
    const res=await errors(await fetch(URL+"/rest/v1/buyers?select=*&order=created_at.desc&limit=200",{headers:headers(auth)}));
    setSaved(await res.json());
  }
  async function login(e:React.FormEvent){
    e.preventDefault();setBusy(true);setError("");
    try{
      if(!configured)throw Error("Konfigurasi Supabase belum tersedia. Lihat .env.example dan panduan setup.");
      const res=await errors(await fetch(URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})}));
      const data=await res.json();setPassword("");
      await loadCRM(data.access_token);
      setToken(data.access_token);
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }
  async function search(){
    setBusy(true);setError("");setResults([]);
    try{
      const r=await errors(await fetch(URL+"/functions/v1/buyer-search",{method:"POST",headers:headers(token),body:JSON.stringify({query:query.slice(0,220)})}));
      const data=await r.json();if(!Array.isArray(data.results))throw Error("Format pencarian tidak dikenal");
      setResults(data.results);
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }
  async function add(b:Buyer){
    setBusy(true);setError("");
    try{
      const r=await fetch(URL+"/rest/v1/buyers?on_conflict=source",{method:"POST",headers:{...headers(token),"Prefer":"resolution=ignore-duplicates,return=minimal"},body:JSON.stringify({...b,status:"New Lead"})});
      await errors(r);await loadCRM();
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }
  async function updateStatus(b:Buyer,status:string){
    if(!b.id)return;setBusy(true);setError("");
    try{
      await errors(await fetch(URL+"/rest/v1/buyers?id=eq."+encodeURIComponent(b.id),{method:"PATCH",headers:headers(token),body:JSON.stringify({status})}));
      await loadCRM();
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }
  const exists=(b:Buyer)=>saved.some(x=>x.source===b.source||(b.phone&&x.phone===b.phone));
  const field="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white";
  const btn="rounded-lg bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white";
  if(!token)return <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center"><div className="bg-white border rounded-2xl shadow-sm max-w-md w-full p-8 space-y-5">
    <a href="/" className="text-sm text-emerald-800">← Kembali ke website</a><h1 className="text-2xl font-bold text-slate-900">Equator Command Center</h1>
    <p className="text-sm text-slate-600">Login khusus tim internal. Akun dibuat oleh administrator.</p>
    <form onSubmit={login} className="grid gap-3"><label className="text-sm">Email</label><input className={field} type="email" required value={email} onChange={e=>setEmail(e.target.value)}/><label className="text-sm">Password</label><input className={field} type="password" required value={password} onChange={e=>setPassword(e.target.value)}/><button className={btn} disabled={busy||!configured}>{busy?"Memverifikasi...":"Login"}</button></form>
    {!configured&&<p className="text-amber-700 text-sm">Supabase belum dikonfigurasi. Halaman ini belum bisa digunakan.</p>}
    {error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}
  </div></main>;
  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="bg-white border-b px-5 py-4 flex flex-wrap gap-4 justify-between items-center"><div><b>Equator Command Center</b><p className="text-xs text-slate-500">Buyer Finder & CRM</p></div><div className="flex gap-3 items-center"><a href="/" className="text-sm underline">Website</a><button onClick={()=>{setToken("");setSaved([]);setResults([]);setSelected(null)}} className="text-sm text-red-700">Logout</button></div></header>
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-5">
      <div className="flex gap-2"><button onClick={()=>setTab("finder")} className={tab==="finder"?btn:field}>Buyer Finder</button><button onClick={()=>{setTab("crm");loadCRM().catch(e=>setError(String(e)))}} className={tab==="crm"?btn:field}>Buyer CRM ({saved.length})</button></div>
      {error&&<p role="alert" className="p-3 bg-red-50 rounded-lg text-red-800 text-sm">{error}</p>}
      {tab==="finder"?<section className="space-y-5">
        <div className="bg-white rounded-xl border p-5 space-y-3"><h2 className="font-bold text-xl">Cari calon buyer potensial</h2><p className="text-sm text-slate-600">Hasil pencarian tidak otomatis disimpan. Periksa kontak dan sumber sebelum menghubungi perusahaan.</p><textarea className={field+" w-full"} rows={3} maxLength={220} value={query} onChange={e=>setQuery(e.target.value)}/><button className={btn} disabled={busy||!query.trim()} onClick={search}>{busy?"Mencari...":"▶ Start Search"}</button></div>
        {results.length>0?<div className="bg-white border rounded-xl overflow-auto"><table className="w-full text-left text-sm min-w-[900px]"><thead className="bg-slate-100"><tr>{["Perusahaan","Lokasi","Nomor / WA","Website","Kategori","Bukti sumber","Action"].map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{results.map((b,i)=><tr key={b.source+i} className="border-t"><td className="p-3 font-semibold">{b.name}</td><td className="p-3">{b.location||"Belum diverifikasi"}</td><td className="p-3">{b.phone||"Belum ditemukan"}<p className="text-xs text-slate-500">{b.verification}</p></td><td className="p-3">{b.website?<a href={b.website} target="_blank" rel="noopener noreferrer" className="underline text-emerald-800">Buka</a>:"Tidak tersedia"}</td><td className="p-3">{b.category}</td><td className="p-3"><a href={b.source} target="_blank" rel="noopener noreferrer" className="underline text-emerald-800">Sumber</a></td><td className="p-3"><button className={btn} disabled={busy||exists(b)} onClick={()=>add(b)}>{exists(b)?"Already Added":"+ Add"}</button></td></tr>)}</tbody></table></div>:<p className="text-sm text-slate-500">Belum ada hasil. Jalankan pencarian. Jika hasil nol, sistem tidak akan mengarang data perusahaan.</p>}
      </section>:<section className="space-y-4">
        <h2 className="text-xl font-bold">Buyer CRM</h2>
        <div className="bg-white border rounded-xl overflow-auto"><table className="w-full min-w-[760px] text-sm text-left"><thead className="bg-slate-100"><tr>{["Perusahaan","Lokasi","Kontak","Status","Pesan"].map(h=><th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{saved.map(b=><tr key={b.id} className="border-t"><td className="p-3 font-medium">{b.name}</td><td className="p-3">{b.location}</td><td className="p-3">{b.phone||"Tidak tersedia"}</td><td className="p-3"><select className={field} value={b.status||"New Lead"} disabled={busy} onChange={e=>updateStatus(b,e.target.value)}>{["New Lead","Contacted","Interested","Quotation","Negotiation","Won","Lost"].map(s=><option key={s}>{s}</option>)}</select></td><td className="p-3"><button className={btn} onClick={()=>setSelected(b)}>Create Template</button></td></tr>)}</tbody></table></div>
        {saved.length===0&&<p className="text-sm text-slate-500">Belum ada buyer yang ditambahkan ke CRM.</p>}
        {selected&&<div className="bg-white border rounded-xl p-5 space-y-3"><div className="flex justify-between"><h3 className="font-semibold">Template WA · {selected.name}</h3><button onClick={()=>setSelected(null)}>✕</button></div><p className="whitespace-pre-wrap text-sm bg-slate-50 p-4 rounded-lg">{draft(selected)}</p><button className={btn} onClick={()=>navigator.clipboard.writeText(draft(selected))}>Copy Template</button><p className="text-xs text-slate-500">Template berbasis data tersimpan, bukan AI berbayar. Tinjau sebelum mengirim.</p></div>}
      </section>}
    </div>
  </main>;
}
