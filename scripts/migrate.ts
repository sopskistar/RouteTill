import {createDatabase,db,migrate} from '../src/db';
const mode=process.argv.includes('--demo')?'demo':'live';
const url=process.env[mode==='demo'?'DEMO_DATABASE_URL':'DATABASE_URL'];
if(process.argv.includes('--neon-ws')&&!url)throw new Error('Configure the actual Neon URL; no local fallback is allowed for --neon-ws.');
const database=process.argv.includes('--neon-ws')?await createDatabase(url!,undefined,'neon-ws'):await db(mode);await migrate(database);console.log(`Migrated ${mode}: ${database.backend}`);await database.close();
