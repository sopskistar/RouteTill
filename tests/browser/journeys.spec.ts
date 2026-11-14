import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {execFileSync} from 'node:child_process';
import {generatePrivateKey,privateKeyToAccount} from 'viem/accounts';
const captures='artifacts/screenshots';mkdirSync(captures,{recursive:true});
function localJudgeCode(){if(process.env.JUDGE_ACCESS_CODE)return process.env.JUDGE_ACCESS_CODE;for(const file of ['.env.local','.env.release-demo.local'])try{const code=parseEnv(readFileSync(file,'utf8')).JUDGE_ACCESS_CODE;if(code)return code;}catch{}return '';}
async function capture(page:any,options:any){await page.evaluate(async()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo({top:0,left:0,behavior:'instant'});await new Promise(requestAnimationFrame);});await page.screenshot(options);}
async function judge(page:any){await page.goto('/lab');await expect(page.getByRole('heading',{name:'Break-It Lab',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Run 5 security checks'})).toBeEnabled();}
test('landing navigation, light/dark, responsive layout and keyboard access',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'Your agent finds the product. You approve the purchase.'})).toBeVisible();await capture(page,{path:captures+'/home-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Switch to dark mode'}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await capture(page,{path:captures+'/home-dark.png',fullPage:true});
 await page.getByRole('button',{name:'Switch to light mode'}).click();
 for(const [name,width,height] of [['tablet',768,1024],['mobile',390,844],['small-phone',360,800]] as const){await page.setViewportSize({width,height});await capture(page,{path:`${captures}/home-${name}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.getByRole('button',{name:'Open navigation'}).click();await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Break-It Lab'})).toBeVisible();
 await page.keyboard.press('Escape');await page.emulateMedia({reducedMotion:'reduce'});expect(await page.locator('html').evaluate(e=>getComputedStyle(e).scrollBehavior)).toBe('auto');
});
test('merchant onboarding, product creation and hosted checkout',async({page})=>{
 await page.goto('/merchant');await expect(page.getByRole('heading',{name:'Your products. Their purchase proof.'})).toBeVisible({timeout:45000});
 await page.getByRole('button',{name:'Open isolated judge workspace'}).click();await expect(page.getByRole('heading',{name:'Merchant workspace',exact:true})).toBeVisible();await capture(page,{path:captures+'/merchant-desktop.png',fullPage:true});
 await page.getByRole('link',{name:'Products & links',exact:true}).click();await page.getByLabel('Product name',{exact:true}).fill('Judge digital handbook');await page.getByRole('textbox',{name:'Description',exact:true}).fill('A synthetic handbook with real downloadable contents.');await page.getByRole('button',{name:'Create product & checkout link'}).click();await expect(page.getByRole('heading',{name:'Judge digital handbook',exact:true})).toBeVisible();
 const product=page.locator('article').filter({has:page.getByRole('heading',{name:'Judge digital handbook'})});await product.getByRole('link',{name:'Open checkout'}).click();await expect(page.getByRole('heading',{name:'A purchase with a paper trail.'})).toBeVisible();await capture(page,{path:captures+'/checkout-desktop.png',fullPage:true});
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Review purchase proposal'}).click();await expect(page.getByRole('heading',{name:'Approve one precise purchase.'})).toBeVisible();
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Authorize this purchase'}).click();await expect(page.getByRole('heading',{name:'Follow the purchase.'})).toBeVisible();await capture(page,{path:captures+'/approval-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Simulate payment & deliver'}).click();await expect(page.getByRole('heading',{name:'Your purchase, accounted for.'})).toBeVisible();await page.getByRole('link',{name:'Get your digital product'}).click();await page.getByRole('button',{name:'Verify delivered file'}).click();await expect(page.getByText('Downloaded bytes match the approved SHA-256.')).toBeVisible();await capture(page,{path:captures+'/delivery-desktop.png',fullPage:true});
 await page.getByRole('link',{name:'Open associated Purchase Passport'}).click();await page.getByRole('button',{name:'Check original record'}).click();await expect(page.getByText('Record integrity passes',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Test a modified recipient'}).click();await expect(page.getByText('Record integrity fails',{exact:true})).toBeVisible();
});
test('five real backend attacks, Passport export, local tamper verification and mobile',async({page})=>{
 await judge(page);await capture(page,{path:captures+'/lab-before-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Run 5 security checks'}).click();await expect(page.getByText('Tampering detected',{exact:true})).toBeVisible({timeout:45000});await expect(page.getByTestId('entitlement-count')).toHaveText('1');await expect(page.getByText('Unsafe change rejected',{exact:true})).toHaveCount(3);await expect(page.getByText('One entitlement stored',{exact:true})).toBeVisible();
 await capture(page,{path:captures+'/lab-after-desktop.png',fullPage:true});
 const desktopAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();writeFileSync('artifacts/lab-axe.json',JSON.stringify(desktopAxe.violations,null,2));expect(desktopAxe.violations).toEqual([]);
 await page.setViewportSize({width:390,height:844});await capture(page,{path:captures+'/lab-mobile.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('link',{name:'Inspect this Purchase Passport'}).click();await expect(page.getByRole('heading',{name:'Purchase Passport',exact:true})).toBeVisible();await page.getByRole('button',{name:'Check original record'}).click();await expect(page.getByText('Record integrity passes',{exact:true})).toBeVisible();
 await capture(page,{path:captures+'/passport-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});await capture(page,{path:captures+'/passport-desktop.png',fullPage:true});
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON'}).click();const download=await downloadPromise;await download.saveAs('artifacts/browser-passport.json');
 await page.getByRole('button',{name:'Test a modified recipient'}).click();await expect(page.getByText('Record integrity fails',{exact:true})).toBeVisible();
 const id=page.url().match(/passport\/([^?]+)/)![1];writeFileSync('artifacts/browser-manifest.json',JSON.stringify({orderId:id,passportUrl:page.url()},null,2));
 await page.getByRole('link',{name:'Open entitled download'}).click();await page.getByRole('button',{name:'Verify delivered file'}).click();await expect(page.getByText('Downloaded bytes match the approved SHA-256.')).toBeVisible();
});
test('public pages, accessible checkout, error states and cross-origin protection',async({page,request})=>{
 await page.goto('/checkout/field-notes');await expect(page.getByRole('heading',{name:'Prepare your purchase',exact:true})).toBeVisible();const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();writeFileSync('artifacts/checkout-axe.json',JSON.stringify(axe.violations,null,2));expect(axe.violations).toEqual([]);
 await page.setViewportSize({width:390,height:844});await capture(page,{path:captures+'/checkout-mobile.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/checkout/no-such-product');await expect(page.getByText('This product does not exist.')).toBeVisible();
 await page.goto('/docs');await expect(page.getByRole('heading',{name:'Understand it. Try it. Verify it.'})).toBeVisible();await page.goto('/privacy');await expect(page.getByRole('heading',{name:'Privacy, plainly.'})).toBeVisible();await page.goto('/does-not-exist');await expect(page.getByRole('heading',{name:'This route ends here.'})).toBeVisible();
 const rejected=await request.post('/api/auth/demo',{headers:{Origin:'https://attacker.invalid'},data:{}});expect(rejected.status()).toBe(403);
 const privateOrder=await request.get('/api/orders/private-unknown');expect(privateOrder.status()).toBe(401);
});
test('working deterministic agent client, human-only approval and entitled artifact retrieval',async({page})=>{
 await judge(page);const origin=new URL(page.url()).origin;
 const guestKey=await page.request.post('/api/auth/api-key',{headers:{Origin:origin},data:{}});expect(guestKey.status()).toBe(403);
 const elevated=await page.request.post('/api/auth/demo',{headers:{Origin:origin},data:{accessCode:localJudgeCode()}});expect(elevated.ok()).toBe(true);
 const credentials=await page.request.post('/api/auth/api-key',{headers:{Origin:origin},data:{}});expect(credentials.ok()).toBe(true);const {token}=await credentials.json();
 const env={...process.env,ROUTETILL_AGENT_TOKEN:token,ROUTETILL_URL:origin};
 const output=execFileSync(process.execPath,['--import','tsx','scripts/agent.ts'],{env,encoding:'utf8'});const proposed=JSON.parse(output);writeFileSync('artifacts/agent-example-run.json',output);
 const id=proposed.proposal.id;const headers={Authorization:'Bearer '+token};
 expect((await page.request.post(`/api/orders/${id}/approve`,{headers,data:{fingerprint:proposed.proposal.fingerprint}})).status()).toBe(403);
 expect((await page.request.post('/api/products',{headers,data:{}})).status()).toBe(403);
 await page.goto('/orders/'+id);await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Authorize this purchase'}).click();await expect(page.getByRole('heading',{name:'Follow the purchase.'})).toBeVisible();
 const settled=await page.request.post('/api/lab/challenge',{headers:{Origin:origin},data:{orderId:id,attack:'replay'}});expect(settled.ok()).toBe(true);expect((await settled.json()).storedEntitlements).toBe(1);
 const observed=execFileSync(process.execPath,['--import','tsx','scripts/agent.ts',id],{env,encoding:'utf8'});expect(JSON.parse(observed).order.state).toBe('FULFILLED');
 const artifact=await page.request.get('/api/entitlements/'+JSON.parse(observed).entitlements[0].id,{headers});expect(artifact.ok()).toBe(true);expect(await artifact.text()).toContain('Agent Purchase Test Vectors');expect(JSON.parse(readFileSync('artifacts/agent/test-plan.json','utf8'))).toMatchObject({caseCount:7,expectedAccept:1,expectedReject:6});
});
test('merchant registration, EIP-191 wallet ownership and secure sign-in',async({page})=>{
 const email=`merchant-${crypto.randomUUID()}@example.invalid`,password='RouteTill test password 2026';
 const account=privateKeyToAccount(generatePrivateKey());
 await page.exposeFunction('signTestOwnershipMessage',async (hex:string)=>account.signMessage({message:Buffer.from(hex.slice(2),'hex').toString('utf8')}));
 await page.addInitScript(({address})=>{(window as any).ethereum={request:async({method,params}:{method:string;params:any[]})=>{if(method==='eth_requestAccounts'||method==='eth_accounts')return [address];if(method==='eth_chainId')return '0xa4b1';if(method==='personal_sign')return (window as any).signTestOwnershipMessage(params[0]);throw new Error('Test wallet only supports ownership messages; transactions are forbidden.');}};},{address:account.address});
 await page.goto('/merchant');await page.getByRole('button',{name:'New merchant? Create an account'}).click();await page.getByLabel('Studio name',{exact:true}).fill('Ownership test studio');await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel(/^Password/).fill(password);await page.getByRole('button',{name:'Create account',exact:true}).click();await expect(page.getByRole('heading',{name:'Merchant workspace',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Settlement & API',exact:true}).click();await page.getByRole('button',{name:'Browser wallet Legacy browser provider'}).click();await page.getByRole('button',{name:'Connect Browser wallet',exact:true}).click();await page.getByRole('button',{name:'Verify selected settlement wallet'}).click();await expect(page.getByText('Settlement wallet ownership verified.')).toBeVisible();await expect(page.getByText('Verified',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Sign out'}).click();await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel(/^Password/).fill('Incorrect password 2026');await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByText('Email or password is incorrect.')).toBeVisible();await page.getByLabel(/^Password/).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('heading',{name:'Merchant workspace',exact:true})).toBeVisible();
});
test('injected Rabby, MetaMask, Coinbase and OKX selection with legacy deduplication (mock providers)',async({page})=>{
 const account='0x2222222222222222222222222222222222222222';
 await page.addInitScript(({account})=>{
  const calls:any[]=[];const listeners:Record<string,Record<string,((...args:any[])=>void)[]>>={};
  function wallet(name:string,rdns:string,uuid:string){let chain='0x1',rejected=false,switched=false;listeners[name]={};return {info:{name,rdns,uuid},provider:{isMetaMask:name!=='Coinbase Wallet',isRabby:name==='Rabby',isOkxWallet:name==='OKX Wallet',isCoinbaseWallet:name==='Coinbase Wallet',on:(event:string,fn:(...args:any[])=>void)=>(listeners[name][event]||=[]).push(fn),removeListener:(event:string,fn:(...args:any[])=>void)=>{listeners[name][event]=(listeners[name][event]||[]).filter(x=>x!==fn);},request:async({method}:any)=>{calls.push({name,method});if(method==='eth_requestAccounts'){if(name==='Rabby'&&!rejected){rejected=true;throw {code:4001};}return [account];}if(method==='eth_accounts')return [account];if(method==='eth_chainId')return chain;if(method==='wallet_switchEthereumChain'){if(!switched){switched=true;throw {code:4001};}chain='0xa4b1';for(const fn of listeners[name].chainChanged||[])fn(chain);return null;}throw new Error('Signing and transfer requests are forbidden in this discovery test');}}};}
  const discovered=[wallet('MetaMask','io.metamask','a'),wallet('Rabby','io.rabby','b'),wallet('Coinbase Wallet','com.coinbase.wallet','c'),wallet('OKX Wallet','com.okex.wallet','d')];
  (window as any).ethereum={...discovered[0].provider,providers:[{...discovered[1].provider},discovered[0].provider]};(window as any).okxwallet={...discovered[3].provider};
  const announce=()=>discovered.forEach(detail=>window.dispatchEvent(new CustomEvent('eip6963:announceProvider',{detail})));
  window.addEventListener('eip6963:requestProvider',announce);
  (window as any).walletTest={calls,emit:(event:string,value:any)=>{for(const fn of listeners.Rabby[event]||[])fn(value);}};
 },{account});
 const origin=new URL(test.info().project.use.baseURL||'http://localhost:3001').origin;
 const response=await page.request.post('/api/auth/login',{headers:{Origin:origin},data:{register:true,name:'Wallet selection test',email:`wallet-${crypto.randomUUID()}@example.invalid`,password:'RouteTill wallet tests 2026'}});expect(response.ok()).toBe(true);
 await page.goto('/merchant?view=settings');
 const wallets=page.getByRole('group',{name:'Detected browser wallets'});await expect(wallets.getByRole('button')).toHaveCount(4);await page.waitForTimeout(500);await expect(wallets.getByRole('button')).toHaveCount(4);
 await expect(wallets.getByRole('button').first()).toContainText('Rabby');
 await wallets.getByRole('button',{name:/^MetaMask/}).click();await page.getByRole('button',{name:'Connect MetaMask',exact:true}).click();
 await expect(page.getByText(account,{exact:true})).toBeVisible();await wallets.getByRole('button',{name:/^OKX Wallet/}).click();await page.getByRole('button',{name:'Connect OKX Wallet',exact:true}).click();await expect(page.getByText(account,{exact:true})).toBeVisible();
 await wallets.getByRole('button',{name:/^Rabby/}).click();await page.getByRole('button',{name:'Connect Rabby',exact:true}).click();await expect(page.getByText('You declined the wallet request. Nothing was sent by RouteTill.')).toBeVisible();
 await page.getByRole('button',{name:'Connect Rabby',exact:true}).click();await expect(page.getByText('Native USDC on Base',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Switch to Arbitrum One'})).toHaveCount(0);await page.evaluate(()=>{(window as any).walletTest.emit('chainChanged','0x2105');});await expect(page.getByText('Base',{exact:true})).toBeVisible();
 await page.evaluate(()=>{(window as any).walletTest.emit('accountsChanged',['0x3333333333333333333333333333333333333333']);});await expect(page.getByText('0x3333333333333333333333333333333333333333',{exact:true})).toBeVisible();
 const calls=await page.evaluate(()=>(window as any).walletTest.calls);expect(calls.filter((c:any)=>c.method==='eth_requestAccounts').map((c:any)=>c.name)).toEqual(['MetaMask','OKX Wallet','Rabby','Rabby']);expect(calls.some((c:any)=>/send|sign/i.test(c.method))).toBe(false);
 await capture(page,{path:captures+'/wallet-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);});await capture(page,{path:captures+'/wallet-mobile.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations).toEqual([]);await page.getByRole('button',{name:'Disconnect',exact:true}).click();await expect(page.getByRole('button',{name:'Connect Rabby',exact:true})).toBeVisible();
});

test('John story stays distinct from verified payment and respects reduced motion',async({page})=>{
 await page.goto('/');const story=page.locator('.john-story');const chapters=story.getByRole('group',{name:'Explore John’s five purchase scenes'}).getByRole('button');await expect(chapters).toHaveCount(5);
 for(let i=0;i<5;i++){await chapters.nth(i).click();await expect(chapters.nth(i)).toHaveAttribute('aria-pressed','true');}
 await expect(story.getByText(/John is an illustrative buyer/)).toBeVisible();await expect(page.getByRole('article',{name:'Verified mainnet Purchase Passport'}).getByText('Fulfilled',{exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'Arbitrum payment',exact:true})).toHaveAttribute('href','https://arbiscan.io/tx/0x1afadae771327b11deb4132df51953bd307e2d13c57a8e276ec95f420e5a4a81');
 await page.emulateMedia({reducedMotion:'reduce'});await expect(story.getByRole('button',{name:'Play story'})).toBeDisabled();await chapters.nth(2).focus();await page.keyboard.press('Enter');await expect(chapters.nth(2)).toHaveAttribute('aria-pressed','true');
 expect(await story.evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length)).toBe(0);
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations).toEqual([]);
});
