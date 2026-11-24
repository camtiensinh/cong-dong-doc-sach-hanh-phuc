import nextEnv from '@next/env';
import {neon} from '@neondatabase/serverless';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
nextEnv.loadEnvConfig(process.cwd());
const sql=neon(process.env.DATABASE_URL);
const base=process.env.SMOKE_URL||'https://cong-dong-doc-sach-hanh-phuc.vercel.app';
const ids=[];
async function client(){
 let cookie='';
 return async(data)=>{
  const response=await fetch(base+'/api/state',{method:data?'POST':'GET',headers:{'Content-Type':'application/json',Origin:base,...(cookie?{Cookie:cookie}:{})},...(data?{body:JSON.stringify(data)}:{})});
  const set=response.headers.get('set-cookie');if(set)cookie=set.split(';')[0];
  return {status:response.status,body:await response.json()};
 };
}
try{
 const a=await client(),b=await client();
 let r=await a();assert.equal(r.status,200);assert.equal(r.body.connected,true);console.log('PASS database connection');
 const phone='099'+String(Math.floor(Math.random()*10000000)).padStart(7,'0');const password=randomBytes(18).toString('hex');
 r=await a({action:'register',phone,password,name:'QA disposable A',province:'Hà Nội'});assert.equal(r.status,200,JSON.stringify(r.body));ids.push(r.body.user.id);
 r=await b({action:'register',phone:'098'+phone.slice(3),password,name:'QA disposable B',province:'Hà Nội'});assert.equal(r.status,200,JSON.stringify(r.body));ids.push(r.body.user.id);console.log('PASS registration and session cookies');
 r=await a({action:'save',data:{notes:[{id:1,text:'QA timeline',time:42}],history:[{id:1,title:'QA paper book',seconds:123}],startDate:'2000-01-01'}});assert.equal(r.status,200);
 r=await a();assert.equal(r.body.user.data.notes[0].time,42);assert.notEqual(r.body.user.data.startDate,'2000-01-01');console.log('PASS persistent notes/history and protected enrollment date');
 r=await a({action:'presence',activity:'QA reading'});assert.equal(r.status,200);
 r=await a({action:'seat',seat:15});assert.equal(r.status,200,JSON.stringify(r.body));r=await b({action:'seat',seat:15});assert.equal(r.status,409);console.log('PASS atomic shared seat reservation');
 r=await a({action:'admin',operation:'zoom',memberId:ids[1],day:'2026-11-22'});assert.equal(r.status,403);console.log('PASS admin authorization');
 await sql`UPDATE reading_members SET role='admin' WHERE id=${ids[0]}`;
 r=await b({action:'submit',kind:'reflection',text:'QA disposable reflection'});assert.equal(r.status,200,JSON.stringify(r.body));
 r=await a();const submission=r.body.content.find(c=>c.kind==='reflection'&&c.data.memberId===ids[1]);assert.ok(submission);
 for(let i=0;i<2;i++){r=await a({action:'admin',operation:'approve',id:submission.id});assert.equal(r.status,200,JSON.stringify(r.body));}
 r=await b();assert.equal(r.body.points.filter(p=>p.member_id===ids[1]).reduce((s,p)=>s+p.points,0),1);console.log('PASS submission approval and duplicate award prevention');
 r=await a({action:'logout'});assert.equal(r.status,200);r=await a();assert.equal(r.body.user,null);
 r=await a({action:'login',phone,password});assert.equal(r.status,200,JSON.stringify(r.body));console.log('PASS logout/login');
}finally{
 for(const id of ids){await sql`DELETE FROM reading_content WHERE data->>'memberId'=${id}`;await sql`DELETE FROM reading_members WHERE id=${id}`;}
 console.log('Removed only disposable QA accounts and their records');
}
