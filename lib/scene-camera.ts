import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

export function sceneCamera(camera:T.OrthographicCamera,canvas:HTMLCanvasElement,target:T.Vector3,changed:()=>void){
 const orbit=new OrbitControls(camera,canvas);
 orbit.target.copy(target);orbit.enablePan=false;orbit.minZoom=.65;orbit.maxZoom=3;
 orbit.minPolarAngle=.18;orbit.maxPolarAngle=Math.PI*.45;orbit.update();orbit.saveState();
 const toolbar=document.createElement('div');toolbar.className='scene-lens';
 function rotate(amount:number){const offset=camera.position.clone().sub(orbit.target);offset.applyAxisAngle(new T.Vector3(0,1,0),amount);camera.position.copy(orbit.target).add(offset);orbit.update();}
 function zoom(factor:number){camera.zoom=T.MathUtils.clamp(camera.zoom*factor,.65,3);camera.updateProjectionMatrix();changed();}
 for(const [label,symbol,act] of [['Xoay trái','↶',()=>rotate(-.35)],['Xoay phải','↷',()=>rotate(.35)],['Thu nhỏ','−',()=>zoom(.8)],['Phóng to','+',()=>zoom(1.25)],['Toàn cảnh','⛶',()=>orbit.reset()]] as const){const b=document.createElement('button');b.type='button';b.title=label;b.ariaLabel=label;b.textContent=symbol;b.onclick=act;toolbar.append(b);}
 canvas.parentElement?.append(toolbar);orbit.addEventListener('change',changed);return()=>{orbit.dispose();toolbar.remove();};
}
