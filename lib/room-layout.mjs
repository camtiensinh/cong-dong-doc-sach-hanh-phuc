export const ROOM_STYLES = ['hoi-an','sen-viet','tre-xanh'];
export const DEFAULT_ROOMS = [
 {id:'binh-an',name:'Hiên nhà Bình An',style:'hoi-an',capacity:12,is_open:true},
 {id:'sen-viet',name:'Thư phòng Sen Việt',style:'sen-viet',capacity:16,is_open:true},
 {id:'tre-xanh',name:'Vườn sách Tre Xanh',style:'tre-xanh',capacity:8,is_open:true}
];
export function roomLayout(capacity=12){
 const count=Math.ceil(capacity/4),rows=Math.ceil(count/2);
 const tables=Array.from({length:count},(_,i)=>({x:(count%2&&i===count-1)?0:(i%2?-3.6:3.6),z:(Math.floor(i/2)-(rows-1)/2)*4.5}));
 const seats=tables.flatMap((t,i)=>Array.from({length:Math.min(4,capacity-i*4)},(_,j)=>({id:i*4+j,x:t.x+(j%2?1:-1)*.92,z:t.z+(j<2?-1.35:1.35),angle:j<2?0:Math.PI})));
 return {tables,seats,obstacles:tables.map(t=>({x:t.x,z:t.z,w:4.3,d:2.25}))};
}
export function walkable(x,z,capacity=12){return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<=7.5&&Math.abs(z)<=Math.max(7.5,Math.ceil(capacity/8)*2.25+1)&&!roomLayout(capacity).obstacles.some(o=>Math.abs(x-o.x)<o.w/2&&Math.abs(z-o.z)<o.d/2);}
// Grid A* routes avatars around tables instead of through furniture.
export function findPath(start,end,capacity=12){
 const step=.35,limit=Math.max(22,Math.ceil((Math.ceil(capacity/8)*2.25+1)/.35)),key=(x,z)=>`${x},${z}`,snap=v=>Math.max(-limit,Math.min(limit,Math.round(v/step)));
 const sx=snap(start.x),sz=snap(start.z),ex=snap(end.x),ez=snap(end.z);
 if(!walkable(end.x,end.z,capacity))return [];
 const open=[{x:sx,z:sz,g:0,f:0}],cost=new Map([[key(sx,sz),0]]),parent=new Map(),closed=new Set();let finish;
 for(let i=0;open.length&&i<4000;i++){
  open.sort((a,b)=>a.f-b.f);const n=open.shift(),k=key(n.x,n.z);if(closed.has(k))continue;closed.add(k);
  if(Math.abs(n.x-ex)+Math.abs(n.z-ez)<=1){finish=k;break;}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=n.x+dx,z=n.z+dz,nk=key(x,z),g=n.g+1;
   if(Math.abs(x)>limit||Math.abs(z)>limit||closed.has(nk)||!walkable(x*step,z*step,capacity))continue;
   if(g<(cost.get(nk)??Infinity)){cost.set(nk,g);parent.set(nk,k);open.push({x,z,g,f:g+Math.abs(x-ex)+Math.abs(z-ez)});}
  }
 }
 if(!finish)return [];const path=[{x:end.x,z:end.z}];let k=finish;
 while(k!==key(sx,sz)&&parent.has(k)){const [x,z]=k.split(',').map(Number);path.unshift({x:x*step,z:z*step});k=parent.get(k);}
 return path;
}
