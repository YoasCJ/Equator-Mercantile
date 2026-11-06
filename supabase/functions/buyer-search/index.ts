// Supabase Edge Function. Set SERPER_API_KEY using Supabase secrets.
// Deploy with JWT verification enabled. Check allowlist again server-side.
const allowOrigin=Deno.env.get("ALLOWED_ORIGIN")||"";
const supa=(Deno.env.get("SUPABASE_URL")||"").replace(/\/$/,"");
const anon=Deno.env.get("SUPABASE_ANON_KEY")||"";
const serper=Deno.env.get("SERPER_API_KEY")||"";
function cors(origin:string){return {"Access-Control-Allow-Origin":origin===allowOrigin?allowOrigin:"null","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"};}
function json(data:unknown,status=200,origin=""){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json",...cors(origin)}})}
type Lead={name:string,location:string,phone:string,website:string,source:string,verification:string,category:string};
Deno.serve(async req=>{
  const origin=req.headers.get("origin")||"";
  if(origin!==allowOrigin)return json({error:"Origin not allowed"},403,origin);
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(origin)});
  if(req.method!=="POST")return json({error:"POST required"},405,origin);
  const auth=req.headers.get("authorization")||"";
  if(!auth.startsWith("Bearer ")||!supa||!anon||!serper)return json({error:"Not configured or unauthorized"},403,origin);
  try{
    // Never trust a JWT without validation.
    const user=await fetch(supa+"/auth/v1/user",{headers:{Authorization:auth,apikey:anon}});
    if(!user.ok)return json({error:"Unauthorized"},401,origin);
    const profile=await user.json();
    if(!profile.id)return json({error:"Unauthorized"},401,origin);
    const access=await fetch(supa+"/rest/v1/allowed_users?select=user_id&user_id=eq."+encodeURIComponent(profile.id),{headers:{Authorization:auth,apikey:anon}});
    if(!access.ok||(await access.json()).length===0)return json({error:"Internal access required"},403,origin);
    let body:{query?:unknown}={};try{body=await req.json()}catch{return json({error:"Invalid JSON"},400,origin)}
    const query=typeof body.query==="string"?body.query.trim().slice(0,220):"";
    if(query.length<12)return json({error:"Provide a more specific search"},400,origin);
    // One Serper request per click; no unbounded chaining. Search results are candidates, not verified customers.
    const sr=await fetch("https://google.serper.dev/search",{method:"POST",
      headers:{"X-API-KEY":serper,"Content-Type":"application/json"},
      body:JSON.stringify({q:query+" perusahaan distributor grosir pabrik bumbu Indonesia",gl:"id",hl:"id",num:10})});
    if(!sr.ok)return json({error:"Search provider unavailable"},502,origin);
    const data=await sr.json();
    const forbidden=["youtube.com","facebook.com","instagram.com","shopee.co.id","tokopedia.com","kompas.com","detik.com","pinterest.com","wikipedia.org"];
    const seen=new Set<string>(),results:Lead[]=[];
    for(const row of Array.isArray(data.organic)?data.organic:[]){
      const source=String(row.link||"");
      let url:URL;try{url=new URL(source)}catch{continue}
      if(url.protocol!=="https:"||forbidden.some(d=>url.hostname===d||url.hostname.endsWith("."+d)))continue;
      const title=String(row.title||"");
      const snippet=String(row.snippet||"");
      if(!/rempah|bumbu|cengkeh|pala|lada|spice|seasoning|distributor|grosir/i.test(title+" "+snippet))continue;
      const name=title.split(/\s+[|–-]\s+/)[0].replace(/\b(jual|murah|terbaru|promo|harga)\b/ig,"").trim().slice(0,140);
      if(name.length<5||seen.has(url.hostname+"|"+name.toLowerCase()))continue;
      seen.add(url.hostname+"|"+name.toLowerCase());
      const potential=/produsen|pabrik|manufactur/i.test(title+" "+snippet)?"Produsen bumbu":/distributor/i.test(title+" "+snippet)?"Distributor":"Calon prospek rempah";
      const waMatch=(source+" "+snippet).match(/(?:https?:\/\/)?(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=)(\d{10,15})/i);
      const phone=waMatch?waMatch[1]:"";
      // Do not infer address or WhatsApp verification from an ordinary phone number.
      results.push({name,location:"Belum diverifikasi",phone,website:url.origin,source,
        verification:phone?"Tautan WhatsApp publik di hasil pencarian (belum diuji)":"WhatsApp belum ditemukan",
        category:potential});
      if(results.length>=10)break;
    }
    return json({results},200,origin);
  }catch(e){console.error("buyer-search",e instanceof Error?e.message:"error");return json({error:"Search failed"},500,origin)}
});
