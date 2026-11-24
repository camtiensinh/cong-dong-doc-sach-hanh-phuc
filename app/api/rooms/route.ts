import {readingStats} from '../../../lib/reading-stats';
import {roomDB,roomUser} from '../../../lib/room-db';
import {ROOM_STYLES,walkable,roomLayout} from '../../../lib/room-layout.mjs';
export const runtime='nodejs';
const fail=(error:string,status=400)=>Response.json({error},{status});
export async function GET(req:Request){try{
 const sql=await roomDB(),me=await roomUser(sql);if(!me)return fail('Vui lòng đăng nhập lại.',401);
 const id=new URL(req.url).searchParams.get('room')||'binh-an';
 const profile=new URL(req.url).searchParams.get('profile');
 if(profile){const [reader]=await sql`SELECT name,province,activity,data->'history' AS history,data->'notes' AS notes,data->>'startDate' AS joined, (SELECT coalesce(sum(points),0)::int FROM reading_points WHERE member_id=m.id) AS drops FROM reading_members m WHERE m.id=${profile}`;if(!reader)return fail('Không tìm thấy bạn đọc.',404);const {history,notes,...publicInfo}=reader;return Response.json({...publicInfo,...readingStats(Array.isArray(history)?history:[],Array.isArray(notes)?notes:[])},{headers:{'Cache-Control':'private,no-store'}});}
 const [rooms,people]=await Promise.all([
  sql`SELECT r.*,count(p.member_id)::int AS online FROM reading_rooms r LEFT JOIN reading_room_presence p ON p.room_id=r.id AND p.last_seen>now()-interval '60 seconds' GROUP BY r.id ORDER BY r.id`,
  sql`SELECT p.member_id,p.room_id,p.seat,p.gender,p.color,p.x,p.z,p.pose,m.name FROM reading_room_presence p JOIN reading_members m ON m.id=p.member_id WHERE p.room_id=${id} AND p.last_seen>now()-interval '60 seconds' ORDER BY p.member_id LIMIT 60`
 ]);
 return Response.json({rooms,people},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){console.error('rooms GET',String(e));return fail('Không tải được phòng đọc. Vui lòng thử lại.',503);}}
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&new URL(req.headers.get('origin')!).host!==req.headers.get('host'))return fail('Yêu cầu không hợp lệ.',403);
 const b=await req.json(),sql=await roomDB(),me=await roomUser(sql);if(!me)return fail('Vui lòng đăng nhập lại.',401);
 if(b.action==='admin'){
  if(me.role!=='admin')return fail('Chỉ quản trị viên được quản lý phòng.',403);
  if(b.operation==='delete'){
   const [active]=await sql`SELECT count(*)::int AS n FROM reading_room_presence WHERE room_id=${b.id} AND last_seen>now()-interval '60 seconds'`;
   if(active.n)return fail('Phòng đang có người. Hãy đóng phòng và chờ mọi người rời phòng trước khi xóa.',409);
   if(['binh-an','sen-viet','tre-xanh'].includes(b.id))return fail('Phòng mặc định có thể đóng hoặc sửa, không xóa.');
   await sql`DELETE FROM reading_rooms WHERE id=${b.id}`;
  }else{
   const capacity=Number(b.capacity);if(!ROOM_STYLES.includes(b.style)||!Number.isInteger(capacity)||capacity<4||capacity>60||!b.name?.trim())return fail('Chọn kiểu phòng và giới hạn từ 4 đến 60 chỗ.');
   const id=b.id||crypto.randomUUID();
   const result=await sql`INSERT INTO reading_rooms(id,name,style,capacity,is_open) VALUES(${id},${b.name.trim().slice(0,80)},${b.style},${capacity},${b.is_open!==false}) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,style=EXCLUDED.style,capacity=EXCLUDED.capacity,is_open=EXCLUDED.is_open WHERE NOT EXISTS(SELECT 1 FROM reading_room_presence p WHERE p.room_id=${id} AND p.last_seen>now()-interval '60 seconds' AND (p.seat>=${capacity} OR (SELECT count(*) FROM reading_room_presence WHERE room_id=${id} AND last_seen>now()-interval '60 seconds')>${capacity})) RETURNING id`;
   if(!result.length)return fail('Không thể giảm số chỗ khi phòng còn quá đông hoặc ghế bị loại đang có người.',409);
  }return Response.json({ok:true});
 }
 if(b.action==='leave'){await sql`DELETE FROM reading_room_presence WHERE member_id=${me.id}`;return Response.json({ok:true});}
 if(b.action==='avatar'){
  if(!['male','female'].includes(b.gender)||!/^#[a-f0-9]{6}$/i.test(b.color||''))return fail('Nhân vật không hợp lệ.');
  await sql`UPDATE reading_members SET data=jsonb_set(data,'{avatar}',${JSON.stringify({gender:b.gender,color:b.color})}::jsonb) WHERE id=${me.id}`;
  await sql`UPDATE reading_room_presence SET gender=${b.gender},color=${b.color} WHERE member_id=${me.id}`;
  return Response.json({ok:true});
 }
 const [room]=await sql`SELECT * FROM reading_rooms WHERE id=${b.room}`;if(!room)return fail('Phòng không tồn tại.',404);
 if(b.action==='join'){
  if(!room.is_open)return fail('Phòng đang tạm đóng.',409);
  const result=await sql.transaction([
   sql`SELECT id FROM reading_rooms WHERE id=${b.room} FOR UPDATE`,
   sql`DELETE FROM reading_room_presence WHERE room_id=${b.room} AND last_seen<=now()-interval '60 seconds'`,
   sql`INSERT INTO reading_room_presence(member_id,room_id,gender,color) SELECT ${me.id},id,${me.data?.avatar?.gender||'female'},${me.data?.avatar?.color||'#bd754c'} FROM reading_rooms WHERE id=${b.room} AND is_open=true AND (EXISTS(SELECT 1 FROM reading_room_presence WHERE member_id=${me.id} AND room_id=${b.room}) OR (SELECT count(*) FROM reading_room_presence WHERE room_id=${b.room})<capacity) ON CONFLICT(member_id) DO UPDATE SET room_id=EXCLUDED.room_id,seat=CASE WHEN reading_room_presence.room_id=EXCLUDED.room_id THEN reading_room_presence.seat ELSE NULL END,x=CASE WHEN reading_room_presence.room_id=EXCLUDED.room_id THEN reading_room_presence.x ELSE 0 END,z=CASE WHEN reading_room_presence.room_id=EXCLUDED.room_id THEN reading_room_presence.z ELSE 6.8 END,pose=CASE WHEN reading_room_presence.room_id=EXCLUDED.room_id THEN reading_room_presence.pose ELSE 'standing' END,last_seen=now() RETURNING member_id`
  ]);if(!(result[2] as any[]).length)return fail('Phòng vừa đủ chỗ. Bạn chọn phòng khác nhé.',409);
 }else if(b.action==='seat'){
  if(!Number.isInteger(b.seat)||b.seat<0||b.seat>=room.capacity)return fail('Ghế không hợp lệ.');
  await sql`DELETE FROM reading_room_presence WHERE room_id=${b.room} AND last_seen<=now()-interval '60 seconds'`;
  const rows=await sql`UPDATE reading_room_presence SET seat=${b.seat},pose='walking',last_seen=now() WHERE member_id=${me.id} AND room_id=${b.room} RETURNING member_id`;
  if(!rows.length)return fail('Bạn cần vào phòng trước khi chọn ghế.',409);
 }else if(['move','arrive','stand'].includes(b.action)){
  if(!walkable(b.x,b.z,room.capacity))return fail('Hãy chọn lối đi trong phòng.');
  if(b.action==='arrive'&&b.seated){const [p]=await sql`SELECT seat FROM reading_room_presence WHERE member_id=${me.id} AND room_id=${b.room}`;const target=p?.seat!=null?roomLayout(room.capacity).seats[p.seat]:null;if(!target||Math.hypot(target.x-b.x,target.z-b.z)>.6)return fail('Bạn cần giữ ghế trước khi ngồi.',409);}
  await sql`UPDATE reading_room_presence SET x=${b.x},z=${b.z},pose=${b.action==='move'?'walking':b.action==='arrive'&&b.seated?'sitting':'standing'},seat=CASE WHEN ${b.action==='stand'||b.action==='move'} THEN NULL ELSE seat END,last_seen=now() WHERE member_id=${me.id} AND room_id=${b.room}`;
 }else if(b.action==='heartbeat'){
  const r=await sql`UPDATE reading_room_presence SET last_seen=now() WHERE member_id=${me.id} AND room_id=${b.room} AND last_seen>now()-interval '60 seconds' RETURNING member_id`;
  if(!r.length)return fail('Phiên phòng đã hết hạn. Vào lại phòng để tiếp tục.',410);
 }else return fail('Thao tác không hợp lệ.');
 return Response.json({ok:true});
 }catch(e:any){if(e.code==='23505')return fail('Ghế này đã có người chọn. Bạn chọn ghế khác nhé.',409);console.error('rooms POST',e.code||e.message);return fail('Không thực hiện được. Vui lòng thử lại.',503);}}
