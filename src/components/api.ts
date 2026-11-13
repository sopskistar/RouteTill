'use client';
export async function api(path:string,body?:unknown,options:{signal?:AbortSignal}={}){
 const r=await fetch('/api/'+path,{method:body===undefined?'GET':'POST',cache:'no-store',signal:options.signal,headers:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 let data;try{data=await r.json();}catch{throw Object.assign(new Error('The response was interrupted. Check the saved purchase status before repeating an action.'),{code:'RESPONSE_INTERRUPTED',status:r.status});}
 if(!r.ok)throw Object.assign(new Error(data.message||'The request could not complete. Check the saved purchase status.'),{code:data.error,status:r.status});return data;
}
export async function ensureDemo(){try{return await api('auth/me');}catch{await api('auth/demo',{});return api('auth/me');}}
export function downloadJSON(value:unknown,name='purchase-passport.json'){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
