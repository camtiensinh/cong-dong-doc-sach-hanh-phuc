'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export default function TheaterWorld({seat,onSeat,wide,name,names,capacity}:{capacity:number;name:string;names:boolean;seat:number|null;onSeat:(seat:number)=>void;wide:boolean}){
 const host=useRef<HTMLDivElement>(null),live=useRef({seat,onSeat,wide,name,names});live.current={seat,onSeat,wide,name,names};
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const el=host.current!;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#101816');el.appendChild(renderer.domElement);const label=document.createElement('span');label.className='theater-person-label';el.appendChild(label);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(48,1,.1,100);
  scene.add(new THREE.HemisphereLight('#c5dfd3','#18211c',2));const light=new THREE.PointLight('#ffe7b0',65,30);light.position.set(0,9,-8);scene.add(light);const fill=new THREE.DirectionalLight('#cbdcf7',2.5);fill.position.set(0,12,15);scene.add(fill);
  const mat=(color:string,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness:.55,metalness});
  const wall=mat('#17212b'),floor=mat('#202630'),gold=mat('#b39a58',.5),cloth=mat('#527565'),black=mat('#090f0d');
  function box(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material,parent:THREE.Object3D=scene){const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(w,h,d)*.16),m);o.position.set(x,y,z);parent.add(o);return o;}
  box(30,.2,35,0,-.2,0,floor);box(30,15,.3,0,6,-12,wall);
  for(const side of [-1,1]){box(.4,15,35,side*13,6,0,wall);for(let z=-10;z<18;z+=4){box(.08,7,.07,side*12.7,5,z,gold);}for(let z=-9;z<=-7;z+=2){box(1.1,4,1,side*9,2,z,black);for(let y=1;y<4;y+=1.2){const speaker=new THREE.Mesh(new THREE.TorusGeometry(.35,.07,8,20),gold);speaker.position.set(side*9,y,z+.51);scene.add(speaker);}}}
  box(17,9.65,.3,0,8.5,-11.4,gold);box(16.65,9.3,.35,0,8.5,-11.2,black);box(19,.35,3,0,0,-9,black);box(18,.035,.06,0,.2,-7.5,gold);
  const targets:THREE.Object3D[]=[],positions:THREE.Vector3[]=[];
  for(let row=0;row<Math.ceil(capacity/10);row++){const z=-2+row*3.1,y=row*.38;box(23,.35,3,0,y-.2,z,floor);for(let col=0;col<10;col++){if(row*10+col>=capacity)continue;const x=(col-4.5)*1.8+(col<5?-.65:.65),id=row*10+col;positions.push(new THREE.Vector3(x,y,z));const chair=new THREE.Group();scene.add(chair);box(1.4,1.25,.45,x,y+1.05,z+.5,cloth,chair);box(1.4,.32,1.1,x,y+.55,z,cloth,chair);for(const dx of [-.8,.8]){box(.16,.7,1.2,x+dx,y+.6,z,black,chair);box(.18,.12,1.2,x+dx,y+1,z,gold,chair);}chair.children.forEach(o=>{o.userData.seat=id;targets.push(o)});}}
  const person=new THREE.Group(),skin=mat('#dcb58c'),hair=mat('#25231d'),shirt=mat('#e4b947');scene.add(person);
  box(.78,.8,.45,0,1.4,0,shirt,person);for(const side of [-1,1]){box(.22,.7,.24,side*.52,1.35,-.1,shirt,person);box(.22,.2,.25,side*.52,1,-.22,skin,person);box(.28,.24,.7,side*.23,.85,-.3,black,person);box(.26,.6,.25,side*.23,.5,-.58,black,person);}const head=new THREE.Mesh(new THREE.SphereGeometry(.29,16,12),skin);head.position.set(0,2.12,0);person.add(head);const cap=new THREE.Mesh(new THREE.SphereGeometry(.3,16,8,0,Math.PI*2,0,Math.PI/2),hair);cap.position.copy(head.position);person.add(cap);
  const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.dampingFactor=.08;orbit.enablePan=false;orbit.minDistance=24;orbit.maxDistance=36;orbit.minPolarAngle=.95;orbit.maxPolarAngle=1.28;orbit.minAzimuthAngle=-.28;orbit.maxAzimuthAngle=.28;orbit.target.set(0,4,-5);camera.position.set(0,12,25);orbit.update();orbit.saveState();const reset=document.createElement('button');reset.className='theater-camera-reset';reset.textContent='↺ Góc ban đầu';reset.setAttribute('aria-label','Đặt lại góc nhìn rạp');reset.onclick=()=>orbit.reset();el.appendChild(reset);let cameraDirty=true;orbit.addEventListener('change',()=>{cameraDirty=true});
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();const click=(e:PointerEvent)=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;const r=el.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(targets)[0];if(hit)live.current.onSeat(hit.object.userData.seat)};renderer.domElement.addEventListener('pointerup',click);
  let last='',frame=0,lastWide=wide;let down={x:0,y:0};const press=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY}};renderer.domElement.addEventListener('pointerdown',press);const draw=()=>{frame=requestAnimationFrame(draw);orbit.update();const {seat,wide,name,names}=live.current;const w=el.clientWidth,h=el.clientHeight,key=[w,h,seat,wide,name,names].join(':');if(last===key&&!cameraDirty||!w||!h||document.hidden)return;last=key;cameraDirty=false;renderer.setSize(w,h);camera.aspect=w/h;if(wide!==lastWide){lastWide=wide;camera.position.set(wide?5:0,wide?15:12,wide?28:25);orbit.update();}camera.updateProjectionMatrix();person.visible=seat!==null;if(seat!==null)person.position.copy(positions[seat]);renderer.render(scene,camera);
  const stage=el.parentElement?.querySelector<HTMLElement>('.theater-stage');
  if(stage){const corners=[[-8,13,-10.95],[8,13,-10.95],[8,4,-10.95],[-8,4,-10.95]].map(v=>new THREE.Vector3(...v as [number,number,number]).project(camera)).map(v=>[(v.x+1)*w/2,(1-v.y)*h/2]);
   const src=[[0,0],[1600,0],[1600,900],[0,900]],a:number[][]=[];src.forEach(([x,y],i)=>{const [u,v]=corners[i];a.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);});
   for(let i=0;i<8;i++){let k=i;for(let j=i+1;j<8;j++)if(Math.abs(a[j][i])>Math.abs(a[k][i]))k=j;[a[i],a[k]]=[a[k],a[i]];const n=a[i][i];for(let j=i;j<9;j++)a[i][j]/=n;for(let r=0;r<8;r++)if(r!==i){const f=a[r][i];for(let j=i;j<9;j++)a[r][j]-=f*a[i][j];}}
   const q=a.map(r=>r[8]);stage.style.setProperty('--screen-transform',`matrix3d(${q[0]},${q[3]},0,${q[6]},${q[1]},${q[4]},0,${q[7]},0,0,1,0,${q[2]},${q[5]},0,1)`);
  }
  label.hidden=seat===null||!names;label.textContent=name;if(seat!==null){const point=positions[seat].clone().add(new THREE.Vector3(0,2.5,0)).project(camera);label.style.left=((point.x+1)/2*w)+'px';label.style.top=((-point.y+1)/2*h)+'px';}};draw();
  return()=>{cancelAnimationFrame(frame);orbit.dispose();reset.remove();renderer.domElement.removeEventListener("pointerdown",press);renderer.domElement.removeEventListener('pointerup',click);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();}});[wall,floor,gold,cloth,black,skin,hair,shirt].forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();label.remove();};
 },[]);
 return <div className="theater-world" ref={host}>{failed&&<p>Chọn chỗ ngồi bằng danh sách ghế bên dưới.</p>}</div>;
}
