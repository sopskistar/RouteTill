import {DomainError,Mode} from './types';

type Environment=Record<string,string|undefined>;
/** Hosted projects expose exactly one store. Local development can use both. */
export function deploymentMode(env:Environment=process.env):Mode|'local' {
  if(!env.VERCEL)return 'local';
  const live=!!env.DATABASE_URL,demo=!!env.DEMO_DATABASE_URL;
  if(live===demo)throw new Error('Each Vercel project must configure exactly one database: DATABASE_URL or DEMO_DATABASE_URL.');
  if(live&&env.ENABLE_JUDGE_DEMO!=='false')throw new Error('Production must set ENABLE_JUDGE_DEMO=false.');
  if(demo&&env.ENABLE_LIVE_PAYMENTS==='true')throw new Error('The demo deployment cannot enable live payments.');
  return live?'live':'demo';
}
export function assertDeploymentMode(mode:Mode,env:Environment=process.env){
  const active=deploymentMode(env);
  if(active!=='local'&&active!==mode)throw new DomainError('ENVIRONMENT_DISABLED',`This deployment serves ${active} purchases only.`,403);
}
export function defaultMode():Mode {return deploymentMode()==='live'?'live':'demo';}
export function publicRuntime(){
  const mode=deploymentMode();
  let demoUrl:string|null=null;
  if(process.env.DEMO_APP_URL){const u=new URL(process.env.DEMO_APP_URL);if(u.protocol==='https:'&&!u.username&&!u.password)demoUrl=u.origin;}
  return {mode,demoUrl,walletConnectProjectId:process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID||null};
}
