// Browser-only integrity check. The independent CLI additionally queries chain RPC.
function canonical(v:any):string {if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';return '{'+Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';}
export async function browserHash(bytes:BufferSource){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');}
export async function browserVerify(doc:any,trustedKey:string){
 try{
  const der=Uint8Array.from(atob(trustedKey.replace(/-----[^-]+-----/g,'').replace(/\s/g,'')),c=>c.charCodeAt(0));
  const key=await crypto.subtle.importKey('spki',der,{name:'Ed25519'},false,['verify']);
  const signature=Uint8Array.from(atob(doc.signature.value),c=>c.charCodeAt(0));
  const signatureValid=await crypto.subtle.verify({name:'Ed25519'},key,signature,new TextEncoder().encode(canonical(doc.payload)));
  const fingerprint=await browserHash(new TextEncoder().encode(canonical(doc.payload.approvedTerms)));
  const termsValid=fingerprint===doc.payload.approvedTermsHash;
  return {signatureValid,termsValid,keyMatches:trustedKey===doc.signature.publicKey,pass:signatureValid&&termsValid&&trustedKey===doc.signature.publicKey};
 }catch{return {signatureValid:false,termsValid:false,keyMatches:false,pass:false};}
}
