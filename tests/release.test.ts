import {afterEach,describe,it,expect,vi} from 'vitest';
import {generateKeyPairSync} from 'node:crypto';
import {deploymentMode,assertDeploymentMode} from '../src/core/deployment';
import {announcedWallet,mergeWallets,legacyWallets,assertTransfer,transferData,walletError,chainNumber} from '../src/wallet/evm';
import {inspectPayment} from '../src/services/payment-preflight';
import {ARB_TOKEN,BASE_TOKEN,ARB_USDC,BASE_USDC,DEMO_WALLET} from '../src/core/constants';
import {Policy} from '../src/core/types';
import {RESOURCE_ARTIFACT,analyseResource} from '../src/core/resource';
import {verifySource,TRANSFER_TOPIC} from '../src/integrations/settlement';
import {publicKeyPem} from '../src/core/crypto';
const address='0x2222222222222222222222222222222222222222';
const policy=():Policy=>({version:1,authorizationId:crypto.randomUUID(),merchantId:'m',merchantName:'M',productId:'p',productName:'Resource',recipient:DEMO_WALLET,sourceAsset:ARB_USDC,destinationAsset:BASE_USDC,sourceChain:42161,destinationChain:8453,destinationToken:BASE_TOKEN,destinationAmount:'10000000',maxSourceAmount:'11000000',refundAddress:address,artifactSha256:'a'.repeat(64),mode:'live',expiresAt:new Date(Date.now()+600000).toISOString()});
const quote=()=>({quote:{depositAddress:DEMO_WALLET,amountIn:'10105320',amountOut:'10000000',deadline:new Date(Date.now()+300000).toISOString(),timeWhenInactive:new Date(Date.now()+300000).toISOString()}});
const reader=(overrides:Record<string,any>={})=>vi.fn(async(method:string,params:unknown[],source?:boolean)=>{
 const key=method+(source?':source':':destination');if(key in overrides)return overrides[key];
 if(method==='eth_chainId')return source?'0xa4b1':'0x2105';
 if(method==='eth_getBalance')return '0xde0b6b3a7640000';
 if(method==='eth_estimateGas')return '0x186a0';
 if(method==='eth_gasPrice')return '0x989680';
 if(method==='eth_call')return (params[0] as any).data==='0x313ce567'?'0x6':'0x9896800';
 throw new Error('Unexpected read-only RPC request');
});
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
describe('hosted deployment isolation',()=>{
 it('allows the local dual-store workspace',()=>expect(deploymentMode({})).toBe('local'));
 it('selects only the live store on production',()=>expect(deploymentMode({VERCEL:'1',DATABASE_URL:'present',ENABLE_JUDGE_DEMO:'false'})).toBe('live'));
 it('selects only the demo store on the judge deployment',()=>expect(deploymentMode({VERCEL:'1',DEMO_DATABASE_URL:'present',ENABLE_LIVE_PAYMENTS:'false'})).toBe('demo'));
 it.each([{}, {DATABASE_URL:'a',DEMO_DATABASE_URL:'b'},{DATABASE_URL:'a',ENABLE_JUDGE_DEMO:'true'},{DEMO_DATABASE_URL:'b',ENABLE_LIVE_PAYMENTS:'true'}])('rejects unsafe hosted configuration %j',env=>expect(()=>deploymentMode({...env,VERCEL:'1'})).toThrow());
 it('rejects demo access from the live deployment',()=>expect(()=>assertDeploymentMode('demo',{VERCEL:'1',DATABASE_URL:'a',ENABLE_JUDGE_DEMO:'false'})).toThrow('live purchases only'));
 it('rejects live access from the demo deployment',()=>expect(()=>assertDeploymentMode('live',{VERCEL:'1',DEMO_DATABASE_URL:'b'})).toThrow('demo purchases only'));
 it('uses distinct configured Passport signing identities',()=>{for(const name of ['PASSPORT_PRIVATE_KEY','DEMO_PASSPORT_PRIVATE_KEY'])vi.stubEnv(name,generateKeyPairSync('ed25519').privateKey.export({type:'pkcs8',format:'pem'}).toString());expect(publicKeyPem('live')).not.toBe(publicKeyPem('demo'));});
 it('rejects reused signing keys',()=>{const key=generateKeyPairSync('ed25519').privateKey.export({type:'pkcs8',format:'pem'}).toString();vi.stubEnv('PASSPORT_PRIVATE_KEY',key);vi.stubEnv('DEMO_PASSPORT_PRIVATE_KEY',key);expect(()=>publicKeyPem('demo')).toThrow('identities must differ');});
});
describe('explicit EVM provider selection',()=>{
 const provider=()=>({request:vi.fn()});
 it('keeps Rabby distinct when it also advertises MetaMask compatibility',()=>{const rabby={...provider(),isRabby:true,isMetaMask:true},metamask={...provider(),isMetaMask:true};const wallets=legacyWallets({...provider(),providers:[metamask,rabby]});expect(wallets.map(w=>w.name)).toEqual(['MetaMask','Rabby']);expect(wallets[1].provider).toBe(rabby);});
 it('recognizes Coinbase injected wallets',()=>expect(legacyWallets({...provider(),isCoinbaseWallet:true})[0].name).toBe('Coinbase Wallet'));
 it('keeps arbitrary EIP-6963 wallets discoverable and ranks Rabby first',()=>{const a=announcedWallet({info:{uuid:'a',rdns:'io.metamask',name:'MetaMask'},provider:provider()})!,b=announcedWallet({info:{uuid:'b',rdns:'io.rabby',name:'Rabby'},provider:provider()})!;expect(mergeWallets([a],b)[0]).toBe(b);});
 it('cannot replace an announced provider with the same identifier',()=>{const a=announcedWallet({info:{uuid:'a',rdns:'io.rabby',name:'Rabby'},provider:provider()})!;expect(mergeWallets([a],{...a,provider:provider()})).toEqual([a]);});
 it('ignores malformed provider announcements',()=>expect(announcedWallet({info:{uuid:'a'},provider:{}})).toBeNull());
 it('accepts only the exact native USDC transfer',()=>{const details={chainId:42161,from:address,to:ARB_TOKEN,value:'0',data:transferData(DEMO_WALLET,'10105320')};expect(()=>assertTransfer(details,{account:address,depositAddress:DEMO_WALLET,amount:'10105320'})).not.toThrow();});
 it.each([{chainId:1},{from:DEMO_WALLET},{to:BASE_TOKEN},{value:'1'},{data:transferData(DEMO_WALLET,'10105321')}])('rejects changed transaction details %j',change=>{const details={chainId:42161,from:address,to:ARB_TOKEN,value:'0',data:transferData(DEMO_WALLET,'10105320')};expect(()=>assertTransfer({...details,...change},{account:address,depositAddress:DEMO_WALLET,amount:'10105320'})).toThrow('no longer match');});
 it('explains a rejected wallet request',()=>expect(walletError({code:4001})).toContain('declined'));
 it('explains an unavailable network',()=>expect(walletError({code:4902})).toContain('Arbitrum One'));
 it('rejects an invalid chain identifier',()=>expect(chainNumber('invalid')).toBeNull());
});
describe('read-only independent payment preflight (mock RPC)',()=>{
 it('checks both chains, exact contracts, balances and buffered gas using integer units',async()=>{const read=reader();const packet=await inspectPayment(policy(),quote(),read);expect(packet.source.amount).toBe('10105320');expect(packet.destination.expectedAmount).toBe('10000000');expect(packet.gas).toMatchObject({estimatedGasWei:'1000000000000',gasLimit:'120000',reserveWei:'1500000000000'});expect(packet.transaction.to).toBe(ARB_TOKEN);expect(read.mock.calls).toHaveLength(8);expect(read.mock.calls.every(c=>!c[0].includes('send')&&!c[0].includes('sign'))).toBe(true);});
 it('fails on the wrong source RPC network',async()=>{await expect(inspectPayment(policy(),quote(),reader({'eth_chainId:source':'0x1'}))).rejects.toThrow('networks do not match');});
 it('fails on the wrong destination RPC network',async()=>{await expect(inspectPayment(policy(),quote(),reader({'eth_chainId:destination':'0x1'}))).rejects.toThrow('networks do not match');});
 it('fails on an incorrect native token precision',async()=>{await expect(inspectPayment(policy(),quote(),reader({'eth_call:destination':'0x12'}))).rejects.toThrow('six decimals');});
 it('fails on insufficient native USDC',async()=>{await expect(inspectPayment(policy(),quote(),reader({'eth_call:source':'0x6'}))).rejects.toThrow('insufficient native USDC');});
 it('fails on insufficient Arbitrum ETH',async()=>{await expect(inspectPayment(policy(),quote(),reader({'eth_getBalance:source':'0x0'}))).rejects.toThrow('more Arbitrum ETH');});
 it('fails when quote lifetime is insufficient',async()=>{const q=quote();q.quote.deadline=new Date(Date.now()+16000).toISOString();await expect(inspectPayment(policy(),q,reader())).rejects.toThrow('Too little quote lifetime');});
});
describe('source transaction association (mock RPC)',()=>{
 const hash='0x'+'3'.repeat(64),block='0x'+'4'.repeat(64);
 const attempt={deposit_address:DEMO_WALLET,quote:{response:quote()}};
 function facts(){return {chain:'0xa4b1',transaction:{hash,from:address,to:ARB_TOKEN,value:'0x0',input:transferData(DEMO_WALLET,'10105320')},receipt:{status:'0x1',transactionHash:hash,blockHash:block,blockNumber:'0x123',logs:[{address:ARB_TOKEN,topics:[TRANSFER_TOPIC,'0x'+address.slice(2).padStart(64,'0'),'0x'+DEMO_WALLET.slice(2).padStart(64,'0')],data:'0x'+BigInt('10105320').toString(16).padStart(64,'0')}]},canonical:{hash:block}};}
 function mock(f:ReturnType<typeof facts>){vi.stubGlobal('fetch',vi.fn(async(_url,init)=>{const {method}=JSON.parse(init.body);return {ok:true,json:async()=>({result:({eth_chainId:f.chain,eth_getTransactionByHash:f.transaction,eth_getTransactionReceipt:f.receipt,eth_getBlockByNumber:f.canonical} as any)[method]})};}));}
 it('accepts the exact confirmed transaction and token log',async()=>{mock(facts());expect(await verifySource(hash,attempt,policy())).toMatchObject({chainId:'0xa4b1'});});
 it('rejects a transaction sent by another account',async()=>{const f=facts();f.transaction.from=DEMO_WALLET;mock(f);await expect(verifySource(hash,attempt,policy())).rejects.toThrow('exact approved');});
 it('rejects a modified transfer amount even when a matching log is supplied',async()=>{const f=facts();f.transaction.input=transferData(DEMO_WALLET,'10105321');mock(f);await expect(verifySource(hash,attempt,policy())).rejects.toThrow('exact approved');});
 it('rejects a noncanonical source receipt',async()=>{const f=facts();f.canonical.hash='0x'+'5'.repeat(64);mock(f);await expect(verifySource(hash,attempt,policy())).rejects.toThrow('canonical block');});
 it('rejects ambiguous duplicate token logs',async()=>{const f=facts();f.receipt.logs.push(f.receipt.logs[0]);mock(f);await expect(verifySource(hash,attempt,policy())).rejects.toThrow('one exact');});
});
describe('actual developer resource processing',()=>{
 it('produces a useful deterministic plan from the exact delivered resource',()=>expect(analyseResource(RESOURCE_ARTIFACT)).toMatchObject({caseCount:7,expectedAccept:1,expectedReject:6,processor:'Deterministic fixture processing; no LLM'}));
 it('preserves generic files by rejecting unsupported processing formats',()=>expect(()=>analyseResource('generic product')).toThrow('Generic digital downloads remain available'));
 it('does not accept malformed dataset records',()=>expect(()=>analyseResource('```json\n{"format":"routetill.purchase-vectors.v1","cases":[{}]}\n```')).toThrow('Invalid purchase-vector'));
});

describe('deployment Passport key serialization',()=>{
 it('preserves the same signing identity for PEM, escaped lines and quoted env-file values',async()=>{const {passportPrivateKey}=await import('../src/core/crypto');const {createPublicKey}=await import('node:crypto');const pem=generateKeyPairSync('ed25519').privateKey.export({type:'pkcs8',format:'pem'}).toString();const identity=(v:string)=>createPublicKey(passportPrivateKey(v)).export({type:'spki',format:'pem'});expect(identity(pem.replaceAll('\n','\\n'))).toBe(identity(pem));expect(identity(JSON.stringify(pem.replaceAll('\n','\\n')))).toBe(identity(pem));expect(identity(JSON.stringify(pem))).toBe(identity(pem));});
 it('fails with a useful configuration code without exposing the supplied value',async()=>{const {passportPrivateKey}=await import('../src/core/crypto');try{passportPrivateKey('deliberately-invalid-private-value');throw new Error('Unexpected acceptance');}catch(e:any){expect(e.code).toBe('PASSPORT_KEY_CONFIGURATION');expect(e.message).not.toContain('deliberately-invalid-private-value');}});
});
