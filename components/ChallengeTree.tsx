'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {stages} from '../lib/data';
export default function ChallengeTree({total}:{total:number}){
 const host=useRef<HTMLDivElement>(null),goal=useRef(0),wet=useRef(false);
 const [demo,setDemo]=useState<number|null>(null),[water,setWater]=useState(false);
 const shown=demo??total;goal.current=Math.min(1,shown/480);wet.current=water||demo!==null;
 useEffect(()=>{if(demo===null||demo>=480)return;const id=setTimeout(()=>setDemo(v=>Math.min(480,(v??0)+4)),100);return()=>clearTimeout(id)},[demo]);
 useEffect(()=>{const id=setTimeout(()=>setWater(false),2500);return()=>clearTimeout(id)},[water]);
 useEffect(()=>{const el=host.current;if(!el)return;const r=new T.WebGLRenderer({alpha:true,antialias:true});r.setPixelRatio(Math.min(devicePixelRatio,1.5));el.appendChild(r.domElement);const s=new T.Scene(),c=new T.PerspectiveCamera(38,1,.1,80);c.position.set(7,6,11);c.lookAt(0,2,0);s.add(new T.HemisphereLight(0xfff5da,0x48654c,2.5));const light=new T.DirectionalLight(0xffe0aa,3);light.position.set(-4,8,5);s.add(light);
 const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[];
 function add(g:T.BufferGeometry,color:number,parent:T.Object3D,x=0,y=0,z=0){geometries.push(g);const m=new T.MeshStandardMaterial({color,roughness:.85});materials.push(m);const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o}
 add(new T.CylinderGeometry(3,2.8,.45,48),0x8b6346,s,0,-.25);add(new T.CylinderGeometry(3.02,3.02,.1,48),0x83a569,s);add(new T.CylinderGeometry(1.15,1.25,.13,32),0x68472f,s,0,.09);
 for(let i=0;i<28;i++){const a=i*2.4,d=2+Math.sin(i)*.6;const stone=add(new T.IcosahedronGeometry(.13,1),0xc8b794,s,Math.cos(a)*d,.13,Math.sin(a)*d);stone.scale.set(1.4,.6,1)}
 const tree=new T.Group();tree.position.y=.15;s.add(tree);add(new T.CylinderGeometry(.14,.28,3,12),0x795039,tree,0,1.5);
 for(let i=0;i<3;i++){const a=i*2.094;const root=add(new T.CylinderGeometry(.08,.17,1,8),0x795039,tree,Math.cos(a)*.3,.18,Math.sin(a)*.3);root.rotation.x=Math.cos(a);root.rotation.z=Math.sin(a)}
 const fruits:T.Mesh[]=[];
 for(let i=0;i<11;i++){const a=i*2.399,x=Math.cos(a)*1.05,z=Math.sin(a)*1.05,y=3+Math.sin(i*1.7)*.5;const b=add(new T.CylinderGeometry(.05,.12,1.4,8),0x795039,tree,x/2,2.4,z/2);b.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(x,.9,z).normalize());add(new T.IcosahedronGeometry(.9,2),[0x39794c,0x5d964f,0x79a65b][i%3],tree,x,y,z);for(let j=0;j<3;j++)fruits.push(add(new T.SphereGeometry(.12,10,8),j%2?0xf1bd4d:0xe98d4b,tree,x+Math.cos(j*2+i)*.65,y-.3,z+Math.sin(j*2+i)*.65))}
 const seed=add(new T.SphereGeometry(.16,12,8),0xb78c50,s,0,.2);
 const drops=Array.from({length:28},()=>add(new T.SphereGeometry(.04,6,5),0x91d8ec,s));const sparks=Array.from({length:18},()=>add(new T.OctahedronGeometry(.04),0xffdc78,s));
 let frame=0,last=0,growth=goal.current;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function draw(ms:number){frame=requestAnimationFrame(draw);if(document.hidden||ms-last<33)return;last=ms;const t=ms/1000;growth+=(goal.current-growth)*.04;tree.visible=growth>.005;tree.scale.setScalar(.12+growth*.88);tree.rotation.z=reduced?0:Math.sin(t*.7)*.012;seed.visible=growth<.02;fruits.forEach((f,i)=>{f.visible=growth>.55;f.scale.setScalar(Math.max(0,Math.min(1,(growth-.55)*3-i*.005)))});drops.forEach((d,i)=>{d.visible=wet.current;d.position.set(Math.sin(i*2.4)*.8,4.8-(t*2+i*.19)%4.6,Math.cos(i*2.4)*.8)});sparks.forEach((o,i)=>{o.visible=wet.current;o.position.set(Math.sin(t*.3+i)*2,.3+(t*.4+i*.17)%4,Math.cos(t*.3+i)*2)});r.render(s,c)}
 const resize=()=>{r.setSize(el.clientWidth,el.clientHeight);c.aspect=el.clientWidth/Math.max(1,el.clientHeight);c.position.z=c.aspect<.8?15:11;c.updateProjectionMatrix()};const observer=new ResizeObserver(resize);observer.observe(el);resize();frame=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(frame);observer.disconnect();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());r.dispose();r.domElement.remove()};},[]);
 const stage=[...stages].reverse().find(s=>shown>=s.points);
 return <section className="growth-tree"><header><small>MỖI NGÀY MỘT CHÚT VUN BỒI</small><h2>{stage?.name||'Mảnh đất chờ một hạt mầm'}</h2><p>{shown} giọt · {demo!==null?'Đang xem giả lập':'Cây của bạn'}</p></header><div className="growth-canvas" ref={host} role="img" aria-label="Cây 3D lớn dần trên mảnh đất đến khi trĩu quả"/><p>Gieo mầm thiện lành. Vun bồi ba gốc rễ. Gặt những quả ngọt.</p><progress max={480} value={shown}/><div className="growth-actions"><button className="primary" onClick={()=>setWater(true)}>💧 Tưới cây</button><button className="outline" onClick={()=>setDemo(demo===null?0:null)}>{demo===null?'✨ Giả lập cây lớn lên':'Về cây của tôi'}</button>{demo===480&&<button className="outline" onClick={()=>setDemo(0)}>Xem lại</button>}</div><small>Giả lập và tưới chỉ để trải nghiệm, không thay đổi điểm thật.</small></section>
}
