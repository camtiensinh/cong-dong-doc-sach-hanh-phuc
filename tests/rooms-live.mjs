import nextEnv from '@next/env';
import {neon} from '@neondatabase/serverless';
import {randomBytes,createHash} from 'node:crypto';
import assert from 'node:assert/strict';
nextEnv.loadEnvConfig(process.cwd());
const sql=neon(process.env.DATABASE_URL),base=process.env.SMOKE_URL||'http://localhost:3000';
const nonce=randomBytes(6).toString('hex'),roomId='qa-room-'+nonce,otherId='qa-other-'+nonce,ids=[],clients=[];
async function client(i){const id='qa-'+nonce+'-'+i,token=randomBytes(32).toString('hex');ids.push(id);
 await sql`INSERT INTO reading_members(id,phone,password,name,province,role,data) VALUES(${id},${'qa-'+nonce+'-'+i},'unusable-qa-password',${'QA '+i},'QA',${i===0?'admin':'member'},${JSON.stringify({startDate:'2026-11-22',avatar:{gender:i%2?'male':'female',color:'#315b47'}})}::jsonb)`;
 await sql`INSERT INTO reading_sessions VALUES(${createHash('sha256').update(token).digest('hex')},${id},now()+interval '10 minutes')`;
 return async(body,room=roomId)=>{const start=performance.now();const r=await fetch(base+'/api/rooms'+(!body?'?room='+room:''),{method:body?'POST':'GET',headers:{Cookie:'reading_session='+token,Origin:base,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,body:await r.json(),ms:performance.now()-start};};
}
try{
 await fetch(base+'/api/state');
 for(let i=0;i<12;i++)clients.push(await client(i));
 let r=await clients[0]();assert.equal(r.status,200,JSON.stringify(r.body));
 r=await clients[0]({action:'admin',name:'QA capacity room',id:roomId,style:'hoi-an',capacity:4,is_open:true});assert.equal(r.status,200,JSON.stringify(r.body));
 r=await clients[0]({action:'admin',name:'QA second room',id:otherId,style:'tre-xanh',capacity:4,is_open:true});assert.equal(r.status,200);
 const joins=await Promise.all(clients.map(c=>c({action:'join',room:roomId})));
 const admitted=joins.flatMap((r,i)=>r.status===200?[i]:[]);assert.equal(admitted.length,4,JSON.stringify(joins.map(r=>r.status)));assert.equal(joins.filter(r=>r.status===409).length,8);console.log('PASS 12 simultaneous joins: exactly 4 admitted, 8 rejected at capacity');
 const seats=await Promise.all(admitted.map(i=>clients[i]({action:'seat',room:roomId,seat:0})));
 assert.equal(seats.filter(r=>r.status===200).length,1);assert.equal(seats.filter(r=>r.status===409).length,3);console.log('PASS simultaneous seat claim: exactly one owner');
 const owner=admitted[seats.findIndex(r=>r.status===200)];
 r=await clients[owner]({action:'avatar',gender:'male',color:'#567e98'});assert.equal(r.status,200);
 r=await clients[owner]();assert.equal(r.body.people.find(p=>p.member_id===ids[owner]).gender,'male');assert.ok(r.body.people.length<=4);console.log('PASS avatar persistence and room-scoped snapshots');
 const outsider=joins.findIndex(r=>r.status===409);
 r=await clients[outsider]({action:'join',room:otherId});assert.equal(r.status,200);r=await clients[outsider]({action:'seat',room:otherId,seat:0});assert.equal(r.status,200);console.log('PASS separate rooms have independent seat ownership');
 r=await clients[outsider]({action:'admin',name:'Forbidden room',style:'hoi-an',capacity:4});assert.equal(r.status,403);console.log('PASS room management is admin-only');
 r=await clients[0]({action:'admin',id:otherId,name:'Closed QA',style:'tre-xanh',capacity:4,is_open:false});assert.equal(r.status,200);r=await clients[outsider]({action:'leave'});assert.equal(r.status,200);r=await clients[outsider]({action:'join',room:otherId});assert.equal(r.status,409);console.log('PASS closed rooms reject entry');
 await sql`UPDATE reading_room_presence SET last_seen=now()-interval '61 seconds' WHERE member_id=${ids[owner]}`;
 r=await clients[owner]({action:'heartbeat',room:roomId});assert.equal(r.status,410);r=await clients[outsider]({action:'join',room:roomId});assert.equal(r.status,200);r=await clients[outsider]({action:'seat',room:roomId,seat:0});assert.equal(r.status,200);console.log('PASS expired presence releases capacity and reserved seat');
 const snapshots=await Promise.all(Array.from({length:24},(_,i)=>clients[outsider]()));assert.ok(snapshots.every(r=>r.status===200));const times=snapshots.map(r=>r.ms).sort((a,b)=>a-b);console.log('PASS 24 concurrent room snapshot requests; p50='+Math.round(times[12])+'ms p95='+Math.round(times[22])+'ms');
 console.log('All live room checks passed');
}finally{
 for(const id of ids)await sql`DELETE FROM reading_members WHERE id=${id}`;
 await sql`DELETE FROM reading_rooms WHERE id=${roomId} OR id=${otherId}`;
 console.log('Cleaned only QA-owned members, sessions, presence and rooms');
}
