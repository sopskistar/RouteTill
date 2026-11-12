import {NextRequest,NextResponse} from 'next/server';
import {createHmac,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {isAddress} from 'viem';
import {db} from '@/db';
import {DomainError,Policy,requireThat} from '@/core/types';
import {auth,checkOrigin,COOKIE,confirmWallet,judgeSession,login,newSession,rateLimit,safeEqual,walletChallenge} from '@/services/auth';
import {createProduct,productById,seedDemoResource} from '@/services/catalog';
import {approve,execute,getOrder,propose} from '@/services/orders';
import {assets,provider,quote} from '@/integrations/near';
import {verifySource} from '@/integrations/settlement';
import {prepareLab,runChallenge} from '@/services/lab';
import {publicKeyPem,sha256} from '@/core/crypto';
import {verifyPassport} from '@/core/verifier';
import {sweep,reconcile} from '@/services/reconcile';
import {assertDeploymentMode,defaultMode,deploymentMode,publicRuntime} from '@/core/deployment';
import {paymentPreflight} from '@/services/payment-preflight';
import {guestSession,guestScope,guestBudget} from '@/services/guest';
export const runtime='nodejs';export const dynamic='force-dynamic';
const evm=z.string().refine(x=>isAddress(x),'Enter a valid EVM address');
const idSchema=z.string().min(1).max(100);
const policySchema=z.object({version:z.literal(1),authorizationId:z.uuid(),merchantId:idSchema,merchantName:z.string().max(100),recipient:evm,productId:idSchema,productName:z.string().max(100),artifactSha256:z.string().regex(/^[a-f0-9]{64}$/),sourceAsset:z.string().max(200),destinationAsset:z.string().max(200),sourceChain:z.literal(42161),destinationChain:z.literal(8453),destinationToken:evm,destinationAmount:z.string().regex(/^[1-9]\d{0,29}$/),maxSourceAmount:z.string().regex(/^[1-9]\d{0,29}$/),refundAddress:evm,expiresAt:z.iso.datetime(),mode:z.enum(['demo','live'])}).strict();
async function json(request:NextRequest){requireThat(Number(request.headers.get('content-length')||0)<=40000,'BODY_TOO_LARGE','Request is too large.',413);const raw=await request.text();requireThat(Buffer.byteLength(raw)<=40000,'BODY_TOO_LARGE','Request is too large.',413);try{return JSON.parse(raw);}catch{throw new DomainError('INVALID_JSON','Send a valid JSON request body.');}}
function response(data:unknown,status=200){return NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});}
async function handle(request:NextRequest,{params}: {params:Promise<{path:string[]}>}){
 try{
  const path=(await params).path;const [resource,id,action]=path;const method=request.method;
  if(resource==='health')return response({service:'RouteTill',deployment:deploymentMode(),mainnetSettlement:'UNVERIFIED',livePayments:deploymentMode()!=='demo'&&process.env.ENABLE_LIVE_PAYMENTS==='true',...publicRuntime()});
  if(resource==='keys'&&method==='GET'){const mode=request.nextUrl.searchParams.get('mode')||defaultMode();requireThat(mode==='live'||mode==='demo','MODE','Unknown evidence environment.');assertDeploymentMode(mode);return new NextResponse(publicKeyPem(mode),{headers:{'Content-Type':'application/x-pem-file','Cache-Control':'public, max-age=300'}});}
  if(resource==='cron'){
   requireThat(process.env.CRON_SECRET&&safeEqual(request.headers.get('authorization')||'','Bearer '+process.env.CRON_SECRET),'CRON_AUTH','Invalid reconciliation credential.',401);
   requireThat(method==='GET','METHOD','Use GET for scheduled reconciliation.',405);const mode=defaultMode();return response(await sweep(await db(mode),mode));
  }
  if(resource==='webhooks'){
   requireThat(method==='POST'&&process.env.RECONCILE_WEBHOOK_SECRET,'WEBHOOK_DISABLED','Webhook reconciliation is not configured.',403);
   const timestamp=request.headers.get('x-routetill-timestamp')||'';requireThat(/^\d{13}$/.test(timestamp)&&Math.abs(Date.now()-Number(timestamp))<300000,'WEBHOOK_EXPIRED','Webhook timestamp expired.',401);
   const raw=await request.text();requireThat(Buffer.byteLength(raw)<=4096,'BODY_TOO_LARGE','Webhook is too large.',413);
   const expected=createHmac('sha256',process.env.RECONCILE_WEBHOOK_SECRET).update(timestamp+'.'+raw).digest('hex');requireThat(safeEqual(request.headers.get('x-routetill-signature')||'',expected),'WEBHOOK_SIGNATURE','Webhook signature is invalid.',401);
   const input=z.object({attemptId:idSchema}).strict().parse(JSON.parse(raw));const database=await db('live');await rateLimit(database,'webhook',60);return response(await reconcile(database,input.attemptId));
  }
  checkOrigin(request);
  if(resource==='auth'&&id==='guest'&&method==='POST'){
   z.object({}).strict().parse(await json(request));
   assertDeploymentMode('demo');
   if(request.cookies.get(COOKIE))try{const existing=await auth(request);if(existing.actor.mode==='demo'&&['guest','judge'].includes(existing.actor.role))return response({mode:'demo',role:existing.actor.role,reused:true});}catch(error){if(!(error instanceof DomainError))throw error;}
   const database=await db('demo');const ip=sha256((request.headers.get('x-forwarded-for')?.split(',')[0]||'local').slice(0,100));
   const session=await guestSession(database,ip);const r=response({mode:'demo',role:'guest',expiresIn:1800});
   r.cookies.set(COOKIE,session.token,{httpOnly:true,secure:!!process.env.VERCEL,sameSite:'strict',maxAge:1800,path:'/'});return r;
  }
  if(resource==='auth'&&id==='demo'&&method==='POST'){
   const database=await db('demo');await rateLimit(database,'demo-session',100,3600);
   const input=z.object({accessCode:z.string().max(200).optional()}).strict().parse(await json(request));const session=await judgeSession(input.accessCode||'');
   const r=response({mode:'demo',merchantId:session.actor.merchantId});r.cookies.set(COOKIE,session.token,{httpOnly:true,secure:!!process.env.VERCEL,sameSite:'strict',maxAge:43200,path:'/'});return r;
  }
  if(resource==='auth'&&id==='login'&&method==='POST'){
   const database=await db('live');await rateLimit(database,'login:'+sha256(request.headers.get('x-forwarded-for')?.split(',')[0]||'local'),10,300);
   const input=z.object({email:z.email().max(160),password:z.string().min(12).max(128),name:z.string().min(2).max(80).optional(),register:z.boolean().optional()}).strict().parse(await json(request));
   const session=await login(input);const r=response({mode:'live'});r.cookies.set(COOKIE,session.token,{httpOnly:true,secure:!!process.env.VERCEL,sameSite:'strict',maxAge:43200,path:'/'});return r;
  }
  if(resource==='products'&&method==='GET'){
   const mode=request.nextUrl.searchParams.get('mode')==='live'?'live':request.nextUrl.searchParams.get('mode')==='demo'?'demo':defaultMode();const database=await db(mode);if(mode==='demo')await seedDemoResource(database);
   if(id){const p=await productById(database,id);const {artifact,...publicProduct}=p;void artifact;return response({...publicProduct,mode,acceptedSettlement:'Base USDC',supportedSource:'Arbitrum USDC'});}
   return response({mode,products:(await database.query('SELECT p.id,p.slug,p.title,p.description,p.amount,p.artifact_hash,m.name AS merchant_name,m.wallet,m.wallet_verified FROM products p JOIN merchants m ON m.id=p.merchant_id '+(mode==='demo'?"WHERE p.id='purchase-vectors'":"WHERE m.wallet_verified=true")+' ORDER BY p.created_at DESC LIMIT 50')).rows});
  }
  if(resource==='passports'&&method==='GET'){
   const mode=request.nextUrl.searchParams.get('mode')==='live'?'live':request.nextUrl.searchParams.get('mode')==='demo'?'demo':defaultMode();const database=await db(mode);const p=(await database.query('SELECT document FROM passports WHERE order_id=$1',[id])).rows[0];requireThat(p,'PASSPORT_PENDING','No final Purchase Passport is available for this order.',404);return response(p.document);
  }
  const {actor,database}=await auth(request);await rateLimit(database,'session:'+actor.sessionHash,100);
  guestScope(actor,method,resource,id,action);
  if(actor.role==='agent')requireThat((method==='GET'&&['products','orders','assets','entitlements'].includes(resource))||(method==='POST'&&resource==='orders'&&(!id||['quote','execute','preflight','deposit','reconcile'].includes(action))),'AGENT_SCOPE','Agent tokens can discover, propose, quote, execute approved purchases, and retrieve their evidence only. Human approval and merchant administration are excluded.',403);
  if(resource==='auth'&&id==='me'){
   const m=(await database.query('SELECT id,name,email,wallet,wallet_verified FROM merchants WHERE id=$1',[actor.merchantId])).rows[0];return response({actor:{...actor,sessionHash:undefined},merchant:m,storage:database.backend,guestLimits:await guestBudget(database,actor)});
  }
  if(resource==='auth'&&id==='logout'&&method==='POST'){await database.query('DELETE FROM sessions WHERE token_hash=$1',[actor.sessionHash]);const r=response({ok:true});r.cookies.delete(COOKIE);return r;}
  if(resource==='auth'&&id==='api-key'&&method==='POST'){requireThat(actor.role!=='agent','AGENT_SCOPE','Only a human session can create an agent token.',403);const s=await newSession(database,actor.mode,actor.merchantId,'agent');return response({token:s.token,expiresIn:'12 hours',scope:'propose, quote, execute owner-approved orders, observe and download; cannot approve'});}
  if(resource==='wallet'&&method==='POST'){
   requireThat(actor.role==='merchant','MERCHANT_REQUIRED','A live merchant account is required.',403);
   if(id==='challenge'){const input=z.object({wallet:evm}).strict().parse(await json(request));return response(await walletChallenge(database,actor,input.wallet,process.env.APP_ORIGIN||request.nextUrl.origin));}
   const input=z.object({id:idSchema,signature:z.string().regex(/^0x[0-9a-fA-F]{130}$/)}).strict().parse(await json(request));return response(await confirmWallet(database,actor,input.id,input.signature as `0x${string}`));
  }
  if(resource==='merchant'&&method==='GET'){
   return response({products:(await database.query('SELECT id,slug,title,description,amount,artifact_hash,created_at FROM products WHERE merchant_id=$1 ORDER BY created_at DESC',[actor.merchantId])).rows,orders:(await database.query('SELECT o.*,a.id AS attempt_id,a.state AS attempt_state,a.evidence,a.last_error,e.id AS entitlement_id FROM orders o LEFT JOIN attempts a ON a.order_id=o.id LEFT JOIN entitlements e ON e.order_id=o.id WHERE o.merchant_id=$1 ORDER BY o.created_at DESC LIMIT 50',[actor.merchantId])).rows,outbox:(await database.query('SELECT b.id,b.topic,b.attempts,b.delivered_at,b.last_error FROM outbox b JOIN orders o ON o.id=b.order_id WHERE o.merchant_id=$1 ORDER BY b.next_at LIMIT 20',[actor.merchantId])).rows});
  }
  if(resource==='products'&&method==='POST'){
   const input=z.object({title:z.string().min(3).max(100),description:z.string().min(10).max(600),price:z.string().max(40),artifact:z.string().min(1).max(16000)}).strict().parse(await json(request));return response(await createProduct(database,actor,input),201);
  }
  if(resource==='assets'&&method==='GET'){await rateLimit(database,'catalog',60,3600);const list=await assets();return response({count:list.length,assets:list,supportedExecutionRoute:'Arbitrum USDC → Base USDC',checkedAt:new Date().toISOString()});}
  if(resource==='orders'){
   if(method==='POST'&&!id){const input=z.object({productId:idSchema,maxSourceAmount:z.string().regex(/^[1-9]\d{0,29}$/),refundAddress:evm,sourceAsset:z.string().max(200).optional()}).strict().parse(await json(request));return response(await propose(database,actor,input),201);}
   idSchema.parse(id);const order=await getOrder(database,id,actor);
   if(method==='GET'){
    const attempt=(await database.query('SELECT * FROM attempts WHERE order_id=$1',[id])).rows[0]||null;const entitlements=(await database.query('SELECT id,artifact_hash,created_at FROM entitlements WHERE order_id=$1',[id])).rows;const events=(await database.query('SELECT id,kind,data,created_at FROM events WHERE order_id=$1 ORDER BY created_at LIMIT 100',[id])).rows;return response({order,attempt,entitlements,events,viewerRole:actor.role});
   }
   requireThat(method==='POST','METHOD','Method not supported.',405);
   if(action==='approve'){const input=z.object({fingerprint:z.string().regex(/^[0-9a-f]{64}$/)}).strict().parse(await json(request));return response(await approve(database,actor,id,input.fingerprint));}
   if(action==='quote'){
    await rateLimit(database,'quote:global',60,3600);await rateLimit(database,'quote:'+actor.merchantId,12,3600);
    const q=await quote(order.policy,true);return response(q);
   }
   if(action==='execute'){const input=z.object({policy:policySchema,idempotencyKey:z.uuid()}).strict().parse(await json(request));await rateLimit(database,'executable:'+actor.merchantId,5,3600);return response(await execute(database,actor,id,input.policy as Policy,input.idempotencyKey));}
   if(action==='preflight'){await rateLimit(database,'preflight:'+actor.merchantId,12,3600);return response(await paymentPreflight(database,actor,id));}
   if(action==='deposit'){
    requireThat(actor.mode==='live','DEMO_PAYMENT_BLOCKED','Synthetic orders cannot submit a real deposit.',403);const input=z.object({txHash:z.string().regex(/^0x[0-9a-fA-F]{64}$/)}).strict().parse(await json(request));
    await rateLimit(database,'deposit:'+actor.merchantId,20,3600);
    const attempt=(await database.query('SELECT * FROM attempts WHERE order_id=$1',[id])).rows[0];requireThat(attempt?.deposit_address,'NO_DEPOSIT','Create authorized payment instructions first.');const evidence=await verifySource(input.txHash,attempt,order.policy);
    const bound=await database.query('UPDATE attempts SET source_tx=$1,source_receipt=$2 WHERE id=$3 AND (source_tx IS NULL OR source_tx=$1) RETURNING id',[input.txHash.toLowerCase(),JSON.stringify(evidence),attempt.id]);requireThat(bound.rows.length===1,'SOURCE_ALREADY_BOUND','This attempt already has a different source transaction.',409);await provider('/v0/deposit/submit',{depositAddress:attempt.deposit_address,txHash:input.txHash});return response({accepted:true});
   }
   if(action==='reconcile'){const a=(await database.query('SELECT id FROM attempts WHERE order_id=$1',[id])).rows[0];requireThat(a,'NO_ATTEMPT','No payment attempt exists.');return response(await reconcile(database,a.id,actor));}
  }
  if(resource==='entitlements'&&method==='GET'){
   const e=(await database.query('SELECT * FROM entitlements WHERE id=$1',[id])).rows[0];requireThat(e,'ENTITLEMENT_NOT_FOUND','Entitlement not found.',404);await getOrder(database,e.order_id,actor);
   requireThat(sha256(e.artifact)===e.artifact_hash,'ARTIFACT_CORRUPTION','Stored artifact integrity check failed.',500);
   return new NextResponse(e.artifact,{headers:{'Content-Type':'text/markdown; charset=utf-8','Content-Disposition':'attachment; filename="routetill-resource.md"','X-Artifact-SHA256':e.artifact_hash,'Cache-Control':'private, no-store'}});
  }
  if(resource==='lab'&&method==='POST'){
   await rateLimit(database,'lab:'+actor.sessionHash,30,3600);
   if(id==='prepare')return response(await prepareLab(database,actor));
   if(id==='reset'){const o=await prepareLab(database,actor,true);return response({order:o,note:'A fresh isolated order was created. Prior evidence remains in the audit history.'});}
   const input=z.object({orderId:z.uuid(),attack:z.enum(['merchant','price','reuse','replay','tamper'])}).strict().parse(await json(request));return response(await runChallenge(database,actor,input.orderId,input.attack));
  }
  if(resource==='verify'&&method==='POST'){
   const input=z.object({document:z.unknown(),artifact:z.string().max(16000)}).strict().parse(await json(request));return response(verifyPassport(input.document,{trustedKey:publicKeyPem(actor.mode),artifact:input.artifact}));
  }
  throw new DomainError('NOT_FOUND','API endpoint not found.',404);
 }catch(error){
  if(error instanceof z.ZodError)return response({error:'VALIDATION',message:error.issues.map(x=>`${x.path.join('.')}: ${x.message}`).join('; ')},400);
  if(error instanceof DomainError)return response({error:error.code,message:error.message},error.status);
  if((error as any)?.code==='23505')return response({error:'CONFLICT',message:'This unique record already exists. No duplicate operation was committed.'},409);
  const trace=randomUUID();const candidate=(error as {code?:unknown})?.code;const safeCode=typeof candidate==='string'&&/^[A-Z0-9_]{2,40}$/.test(candidate)?candidate:undefined;console.error('RouteTill request failed',{trace,type:error instanceof Error?error.name:'Unknown',...(safeCode?{code:safeCode}:{})});return response({error:'SERVICE_UNAVAILABLE',message:'The operation could not complete. No successful payment or fulfillment is implied. Check configuration and retry.',trace},503);
 }
}
export const GET=handle;export const POST=handle;
