'use client';
import {useEffect,useRef,useState} from 'react';
import {sceneCamera} from '../lib/scene-camera';
import * as T from 'three';
import {stages} from '../lib/data';
import {Bird,Sun,Moon,Sunrise,Sprout} from 'lucide-react';

const periods=['Sáng','Trưa','Chiều','Tối'];
function currentPeriod(){const hour=(new Date().getUTCHours()+7)%24;return hour<5||hour>=18?3:hour<11?0:hour<15?1:2;}
function paintGarden(el:HTMLDivElement,period:number,plots:number[],level:number,selected:number){
 const scene=new T.Scene(),renderer=new T.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));el.appendChild(renderer.domElement);
 const camera=new T.OrthographicCamera(-10,10,8,-8,.1,100);
 camera.position.set(10,15,16);camera.lookAt(0,1,0);
 scene.add(new T.HemisphereLight(period===3?0xc0cbea:0xfff0c8,0x74795d,period===3?1.1:1.8));
 const sun=new T.DirectionalLight(period===3?0xa5bbef:period===0?0xffcf8e:period===2?0xffa069:0xfff0ce,period===3?1:2);sun.position.set(-9,14,6);scene.add(sun);
 const shapes={leaf:new T.IcosahedronGeometry(1,1),stone:new T.IcosahedronGeometry(1,0),tube:new T.CylinderGeometry(1,1,1,12),box:new T.BoxGeometry(),cone:new T.ConeGeometry(1,1,8)};
 const groups=new Map<string,{shape:keyof typeof shapes,color:string,matrices:T.Matrix4[]}>();
 let seed=581;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 function put(shape:keyof typeof shapes,color:string,x:number,y:number,z:number,w:number,h:number,d:number,rot=0,tilt=0){
  const key=shape+color;let group=groups.get(key);if(!group){group={shape,color,matrices:[]};groups.set(key,group);}
  group.matrices.push(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(0,rot,tilt)),new T.Vector3(w,h,d)));
 }
 function branch(a:T.Vector3,b:T.Vector3,r:number){const v=b.clone().sub(a),mid=a.clone().lerp(b,.5);put('tube','#755139',mid.x,mid.y,mid.z,r,v.length(),r);groups.get('tube#755139')!.matrices.at(-1)!.compose(mid,new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.normalize()),new T.Vector3(r,a.distanceTo(b),r));}
 function tree(x:number,z:number,size:number,bloom:boolean,fruit=false){
  const v=(a:number,b:number,c:number)=>new T.Vector3(x+a*size,.2+b*size,z+c*size);
  branch(v(0,0,0),v(-.16,1.4,0),.18*size);
  for(let i=0;i<8;i++){const angle=i*2.4,reach=.45+rand()*.5,tip=v(Math.cos(angle)*reach,1.5+rand()*.8,Math.sin(angle)*reach);branch(v(-.16,.9,0),tip,.08*size);
   put('leaf',['#386550','#507e4e','#668e50','#87a25c'][i%4],tip.x,tip.y,tip.z,.9*size,.62*size,.84*size,angle);
   if(bloom||fruit)for(let j=0;j<10;j++){const a=rand()*6.28;put('stone',fruit?'#e89c37':j%2?'#eda89a':'#fbd2af',tip.x+.79*size*Math.cos(a),tip.y+rand()*.38*size,tip.z+.73*size*Math.sin(a),.09*size,.11*size,.09*size);}
  }
 }
 put('tube','#976e48',0,-.5,0,7.1,.85,5.7);put('tube','#829752',0,-.03,0,7.13,.26,5.73);

 put('box','#d8caa2',0,.15,0,10.9,.07,8.8);
 const tones=['#75a965','#9ebd65','#4e967f','#b4a960','#84a8a0'];
 for(let i=0;i<50;i++){
  const col=i%5,row=Math.floor(i/5),x=(col-2)*2.03,z=(row-4.5)*.79;
  put('box',row%2?'#c3a16b':'#b89461',x,.23,z,1.84,.17,.67);put('box','#806044',x,.33,z,1.67,.05,.53);
  if(plots.includes(i)){put('tube','#856044',x,.57,z,.07,.5,.07);put('leaf',tones[col],x,.94,z,.5,.39,.28,i*.7);put('leaf',tones[(col+2)%5],x-.23,.82,z,.25,.26,.23);if(i%3===0)for(let j=0;j<3;j++)put('stone',i%2?'#efba6c':'#eeb4b0',x+(j-1)*.2,1.03,z+.18,.065,.065,.065);}
 }
 tree(-5.6,-3.7,.65,true);tree(5.6,-3.7,.65,false);

 // Flower borders, stepping stones and a small lotus pool.
 for(let i=0;i<32;i++){const x=-5.8+i%16*.77,z=i<16?-4.65:4.65;put('cone','#608351',x,.35,z,.1,.4,.1);put('leaf',['#eab789','#e7a4aa','#d9c76c','#a8bdd0'][i%4],x,.58,z,.17,.13,.15);}
 for(let i=0;i<11;i++){const x=-5+i;put('tube','#b99361',x,.65,-5,.055,1.2,.055);put('leaf','#ddbd80',x,1.27,-5,.1,.09,.1);}for(const y of [.6,1])put('box','#b99361',0,y,-5,10.5,.08,.07);
 for(let i=0;i<12;i++)put('stone','#d4c7aa',-5.9,.22,-3.8+i*.68,.4,.09,.25,i*.3);
 put('leaf','#729d99',4.9,.12,3.9,1.35,.07,.75);for(let i=0;i<9;i++){const a=i*.7;put('stone','#b8b898',4.9+1.25*Math.cos(a),.2,3.9+.7*Math.sin(a),.18,.13,.16);}
 for(let i=0;i<3;i++){put('tube','#78925c',4.3+i*.5,.22,3.9,.18,.025,.16);put('leaf','#edb5bf',4.3+i*.5,.3,3.9,.1,.1,.1);}
 const materials:T.Material[]=[];for(const group of groups.values()){const material=new T.MeshStandardMaterial({color:group.color,roughness:.88});materials.push(material);const m=new T.InstancedMesh(shapes[group.shape],material,group.matrices.length);group.matrices.forEach((matrix,i)=>m.setMatrixAt(i,matrix));scene.add(m);}

 const birds=Array.from({length:2},(_,i)=>{const root=new T.Group();scene.add(root);const material=new T.MeshStandardMaterial({color:i?'#946b4a':'#485d56'});materials.push(material);const body=new T.Mesh(shapes.leaf,material);body.scale.set(.16,.15,.3);root.add(body);const wings=[-1,1].map(side=>{const pivot=new T.Group();root.add(pivot);const wing=new T.Mesh(shapes.leaf,material);wing.position.x=side*.22;wing.scale.set(.32,.045,.19);pivot.add(wing);return pivot});return {root,wings}});
 let frame=0,lastFrame=0;const animate=(ms:number)=>{frame=requestAnimationFrame(animate);if(document.hidden||ms-lastFrame<40)return;lastFrame=ms;const t=ms*.001;birds.forEach((b,i)=>{const a=t*.28+i*Math.PI;b.root.position.set(Math.cos(a)*5,2.4+Math.sin(t*.7+i)*.35,Math.sin(a)*3);b.root.rotation.y=-a;b.wings.forEach((w,j)=>w.rotation.z=Math.sin(t*9+i)*(j?-.65:.65));});renderer.render(scene,camera)};frame=requestAnimationFrame(animate);
 function resize(){const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;const a=w/h,span=Math.max(12,14/a);camera.left=-span*a/2;camera.right=span*a/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();renderer.setSize(w,h);renderer.render(scene,camera);}
 const stopCamera=sceneCamera(camera,renderer.domElement,new T.Vector3(0,1,0),()=>renderer.render(scene,camera));const ro=new ResizeObserver(resize);ro.observe(el);resize();return()=>{cancelAnimationFrame(frame);stopCamera();ro.disconnect();Object.values(shapes).forEach(g=>g.dispose());scene.traverse(o=>{if(o instanceof T.InstancedMesh)o.dispose()});materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
}
export default function Garden({total,user,save,journey}:{total:number,user:any,save:(plots:number[])=>Promise<void>,journey:()=>void}){
 const host=useRef<HTMLDivElement>(null),[period,setPeriod]=useState(currentPeriod),[auto,setAuto]=useState(true),[song,setSong]=useState(false),[plots,setPlots]=useState<number[]>(Array.from({length:Math.min(50,total)},(_,i)=>i)),[selected,setSelected]=useState(0),[weather,setWeather]=useState("clear"),[busy,setBusy]=useState(false),[error,setError]=useState(''),[settings,setSettings]=useState(false);
 useEffect(()=>{if(!settings)return;const close=(e:PointerEvent)=>{const target=e.target as Element;if(!target.closest('.garden-settings')&&!target.closest('.garden-settings-toggle'))setSettings(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[settings]);
 const planted=plots.includes(selected);
 useEffect(()=>setPlots(Array.from({length:Math.min(50,total)},(_,i)=>i)),[total]);const level=4;
 useEffect(()=>{if(auto){setPeriod(currentPeriod());const id=setInterval(()=>setPeriod(currentPeriod()),60000);return()=>clearInterval(id)}},[auto]);
 useEffect(()=>{if(host.current)try{return paintGarden(host.current,period,plots,level,selected)}catch{setError('Thiết bị chưa mở được cảnh 3D. Bạn vẫn có thể gieo hạt.')}},[period,plots,level,selected]);
 useEffect(()=>{if(!song)return;const audio=new AudioContext();audio.resume().catch(()=>setSong(false));function chirp(){if(document.hidden)return;for(let i=0;i<3;i++){const t=audio.currentTime+i*.19,o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(2050+i*150,t);o.frequency.exponentialRampToValueAtTime(3400,t+.065);o.frequency.exponentialRampToValueAtTime(2200,t+.15);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.034,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+.16);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.17);}}chirp();const id=setInterval(chirp,5300);return()=>{clearInterval(id);void audio.close()};},[song]);
 return <section className={'orchard orchard-'+period}><header><small>NÔNG TRẠI HẠNH PHÚC</small><h1>Vườn của {user.name}</h1><div className={"garden-settings "+(settings?"is-open":"")}><label>Ánh sáng <select value={auto?'auto':period} onChange={e=>{setAuto(e.target.value==='auto');if(e.target.value!=='auto')setPeriod(+e.target.value)}}><option value="auto">Theo giờ Việt Nam</option>{periods.map((p,i)=><option key={p} value={i}>{p}</option>)}</select></label><label>Thời tiết <select value={weather} onChange={e=>setWeather(e.target.value)}><option value="clear">Trời trong</option><option value="rain">Mưa nhẹ</option><option value="mist">Sương mờ</option></select></label><button onClick={()=>setSong(!song)} aria-pressed={song}><Bird size={16}/> {song?"Tắt tiếng chim":"Bật tiếng chim"}</button></div></header><button className="garden-settings-toggle" aria-expanded={settings} onClick={()=>setSettings(!settings)}>⚙ Tùy chỉnh</button><div className="orchard-view" ref={host} role="img" aria-label="Vườn cây, cầu gỗ và hồ sen"/><div aria-hidden="true" className={"garden-weather weather-"+weather}/><footer><div className="garden-count"><Sprout size={20}/><b>{total} cây · {Math.min(total,50)}/50 ô</b><span>25 phút đọc = 1 cây miễn phí</span></div><blockquote>“Cuộc đời có 2 bàn tay, một bàn tay để giúp chính mình và một bàn tay để giúp cho người khác.”<cite>Thầy Trần Việt Quân</cite></blockquote>{total>50&&<small>Đang trưng bày 50/{total} cây</small>}</footer></section>
}
