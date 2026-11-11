import {writeFileSync,mkdirSync} from 'node:fs';
const origin=process.env.ROUTETILL_URL||'http://localhost:3001';const token=process.env.ROUTETILL_AGENT_TOKEN;
if(!token)throw new Error('Set ROUTETILL_AGENT_TOKEN to a scoped token created in RouteTill Settings. This client never approves purchases or signs transactions.');
async function request(path:string,body?:unknown){const r=await fetch(origin+'/api/'+path,{headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},method:body?'POST':'GET',...(body?{body:JSON.stringify(body)}:{})});const v=await r.json();if(!r.ok)throw new Error(JSON.stringify(v));return v;}
const mode=token.startsWith('rt_demo_')?'demo':'live';
const args=process.argv.slice(2);const orderId=args.find(a=>!a.startsWith('--'));
if(orderId){const state=await request('orders/'+orderId);
 if(args.includes('--quote'))console.log(JSON.stringify(await request(`orders/${orderId}/quote`,{}),null,2));
 else if(args.includes('--execute')){if(state.order.state!=='APPROVED')throw new Error('A human must approve the proposal before executable payment instructions can be requested.');console.log(JSON.stringify(await request(`orders/${orderId}/execute`,{policy:state.order.policy,idempotencyKey:crypto.randomUUID()}),null,2));}
 else console.log(JSON.stringify(state,null,2));
 if(state.order.state==='FULFILLED'){const receipt=await fetch(`${origin}/api/passports/${orderId}?mode=${mode}`).then(r=>r.json());mkdirSync('artifacts/agent',{recursive:true});writeFileSync('artifacts/agent/passport.json',JSON.stringify(receipt,null,2));const file=await fetch(`${origin}/api/entitlements/${state.entitlements[0].id}`,{headers:{Authorization:'Bearer '+token}});if(!file.ok)throw new Error('Artifact access denied');writeFileSync('artifacts/agent/product.md',Buffer.from(await file.arrayBuffer()));}process.exit(0);}
const catalog=await request('products?mode='+mode);const p=catalog.products.find((p:any)=>BigInt(p.amount)<=10000000n);if(!p)throw new Error('No product within deterministic 10 USDC destination budget.');
if(mode==='live'&&!process.env.REFUND_ADDRESS)throw new Error('Set your actual Arbitrum REFUND_ADDRESS for a live proposal. Fixture addresses are demo-only defaults.');
const proposal=await request('orders',{productId:p.id,maxSourceAmount:'11000000',refundAddress:process.env.REFUND_ADDRESS||'0x1111111111111111111111111111111111111111'});
console.log(JSON.stringify({client:'deterministic rules; no LLM or autonomous signing',proposal,approvalUrl:`${origin}/orders/${proposal.id}`,next:'A human owner must approve in the browser. Use the order ID to observe status.'},null,2));
