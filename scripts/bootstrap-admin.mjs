import nextEnv from '@next/env';
import {neon} from '@neondatabase/serverless';
import {randomBytes,scryptSync} from 'node:crypto';
nextEnv.loadEnvConfig(process.cwd());
if(process.stdin.isTTY)process.stdin.setRawMode(true);
process.stdout.write('Ready for administrator password on hidden stdin.\n');
let input='';
process.stdin.setEncoding('utf8');
process.stdin.on('data',async chunk=>{
 input+=chunk;if(!/[\r\n]/.test(input))return;process.stdin.pause();if(process.stdin.isTTY)process.stdin.setRawMode(false);
 const password=input.trim();input='';if(password.length<8)throw Error('Minimum eight characters');
 const salt=randomBytes(16).toString('hex'),stored=salt+':'+scryptSync(password,salt,64).toString('hex');
 const sql=neon(process.env.DATABASE_URL);
 await sql`INSERT INTO reading_members(id,phone,password,name,province,role,data) VALUES(${randomBytes(12).toString('hex')},'admin',${stored},'Quản trị cộng đồng','Hà Nội','admin',${JSON.stringify({startDate:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}).format(new Date()),group:1,avatar:{gender:'male',color:'#315b47'}})}::jsonb) ON CONFLICT(phone) DO UPDATE SET password=EXCLUDED.password,role='admin'`;
 process.stdout.write('Administrator configured. Password stored as salted scrypt hash.\n');process.exit(0);
});
