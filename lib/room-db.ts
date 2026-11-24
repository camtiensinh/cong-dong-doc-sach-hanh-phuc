import {neon} from '@neondatabase/serverless';
import {cookies} from 'next/headers';
import {createHash} from 'node:crypto';
import {DEFAULT_ROOMS} from './room-layout.mjs';
let setup:Promise<void>|undefined;
export async function roomDB(){
 if(!process.env.DATABASE_URL)throw Error('DATABASE_NOT_CONFIGURED');
 const sql=neon(process.env.DATABASE_URL);
 if(!setup)setup=(async()=>{
  await sql`CREATE TABLE IF NOT EXISTS reading_rooms (id text PRIMARY KEY,name text NOT NULL,style text NOT NULL,capacity integer NOT NULL CHECK(capacity BETWEEN 4 AND 60),is_open boolean NOT NULL DEFAULT true)`;
  await sql`ALTER TABLE reading_rooms DROP CONSTRAINT IF EXISTS reading_rooms_capacity_check`;
  await sql`ALTER TABLE reading_rooms ADD CONSTRAINT reading_rooms_capacity_check CHECK(capacity BETWEEN 4 AND 60)`;
  await sql`CREATE TABLE IF NOT EXISTS reading_room_presence (member_id text PRIMARY KEY REFERENCES reading_members(id) ON DELETE CASCADE,room_id text NOT NULL REFERENCES reading_rooms(id) ON DELETE CASCADE,seat integer,gender text NOT NULL DEFAULT 'female',color text NOT NULL DEFAULT '#bd754c',x real NOT NULL DEFAULT 0,z real NOT NULL DEFAULT 6.8,pose text NOT NULL DEFAULT 'standing',last_seen timestamptz NOT NULL DEFAULT now(),UNIQUE(room_id,seat))`;
  await sql`CREATE INDEX IF NOT EXISTS reading_room_live_idx ON reading_room_presence(room_id,last_seen)`;
  await sql`CREATE INDEX IF NOT EXISTS reading_sessions_lookup_idx ON reading_sessions(member_id)`;
  await sql.transaction(DEFAULT_ROOMS.map((r:any)=>sql`INSERT INTO reading_rooms VALUES(${r.id},${r.name},${r.style},${r.capacity},true) ON CONFLICT DO NOTHING`));
 })().catch(e=>{setup=undefined;throw e});
 await setup;return sql;
}
export async function roomUser(sql:any){const token=(await cookies()).get('reading_session')?.value;if(!token)return null;return (await sql`SELECT m.id,m.name,m.role,jsonb_build_object('avatar',m.data->'avatar') AS data FROM reading_members m JOIN reading_sessions s ON s.member_id=m.id WHERE s.token=${createHash('sha256').update(token).digest('hex')} AND s.expires>now()`)[0]||null;}
