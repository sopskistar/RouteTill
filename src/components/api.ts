'use client';
export async function api(path:string,body?:unknown){const r=await fetch('/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});const data=await r.json();if(!r.ok)throw new Error(data.message||'Request failed. Please retry.');return data;}
export async function ensureDemo(){try{return await api('auth/me');}catch{await api('auth/demo',{});return api('auth/me');}}
export function downloadJSON(value:unknown,name='purchase-passport.json'){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
