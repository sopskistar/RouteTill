import {randomUUID} from 'node:crypto';
import {Database,Sql} from '../db';
import {sha256} from '../core/crypto';
import {DEMO_WALLET} from '../core/policy';
import {Actor,Product,requireThat} from '../core/types';
import {atomic} from '../core/amounts';
import {SAMPLE_ARTIFACT} from '../core/artifact';
import {RESOURCE_ARTIFACT,RESOURCE_TITLE,RESOURCE_DESCRIPTION} from '../core/resource';
export async function seedDemoResource(sql:Sql,id='studio-demo',name='RouteTill Labs'){
 await seedMerchant(sql,id,name);
 const productId=id==='studio-demo'?'purchase-vectors':id+'-purchase-vectors';
 await sql.query('INSERT INTO products(id,merchant_id,slug,title,description,amount,artifact,artifact_hash) VALUES($1,$2,$1,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING',[productId,id,RESOURCE_TITLE,RESOURCE_DESCRIPTION,'10000000',RESOURCE_ARTIFACT,sha256(RESOURCE_ARTIFACT)]);
 return productId;
}
export async function seedMerchant(sql:Sql,id='studio-demo',name='RouteTill Studio'){
 await sql.query('INSERT INTO merchants(id,email,name,wallet,wallet_verified) VALUES($1,$2,$3,$4,false) ON CONFLICT(id) DO NOTHING',[id,id+'@demo.invalid',name,DEMO_WALLET]);
 const productId=id==='studio-demo'?'field-notes':id+'-field-notes';
 await sql.query('INSERT INTO products(id,merchant_id,slug,title,description,amount,artifact,artifact_hash) VALUES($1,$2,$1,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING',[productId,id,'The verification field notes','A concise digital field guide to safer agent purchases. Synthetic product; real, downloadable bytes.','10000000',SAMPLE_ARTIFACT,sha256(SAMPLE_ARTIFACT)]);
 return productId;
}
export async function productById(sql:Sql,id:string){const p=(await sql.query<Product>('SELECT p.*,m.name AS merchant_name,m.wallet,m.wallet_verified FROM products p JOIN merchants m ON m.id=p.merchant_id WHERE p.id=$1 OR p.slug=$1',[id])).rows[0];requireThat(p,'PRODUCT_NOT_FOUND','This product does not exist.',404);return p;}
export async function createProduct(database:Database,actor:Actor,input:{title:string;description:string;price:string;artifact:string}){
 requireThat(Buffer.byteLength(input.artifact,'utf8')<=16000,'ARTIFACT_SIZE','Digital product content must fit within 16 KB of UTF-8 bytes.');
 const amount=atomic(input.price);requireThat(BigInt(amount)>=1000000n&&BigInt(amount)<=1000000000n,'PRODUCT_PRICE','Product prices must be between 1 and 1,000 USDC. Live route minimums are checked again by the provider.');
 if(actor.mode==='live'){const m=(await database.query('SELECT wallet_verified FROM merchants WHERE id=$1',[actor.merchantId])).rows[0];requireThat(m?.wallet_verified,'WALLET_UNVERIFIED','Verify your settlement wallet before publishing a product.');}
 const id=randomUUID();const digest=sha256(input.artifact);
 await database.query('INSERT INTO products(id,merchant_id,slug,title,description,amount,artifact,artifact_hash) VALUES($1,$2,$1,$3,$4,$5,$6,$7)',[id,actor.merchantId,input.title,input.description,amount,input.artifact,digest]);return {id,slug:id,artifactSha256:digest};
}
