import {db,migrate} from '../src/db';
const mode=process.argv.includes('--demo')?'demo':'live';
const database=await db(mode);await migrate(database);console.log(`Migrated ${mode}: ${database.backend}`);await database.close();
