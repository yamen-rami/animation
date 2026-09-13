import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import doctorTextureURL from './assets/doctor-clinician.png';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#hospital-canvas');
const fallback = document.querySelector('#webgl-fallback');
const contextProbe = document.createElement('canvas');
const context = contextProbe.getContext('webgl2') || contextProbe.getContext('webgl');

if (!context) {
  document.documentElement.classList.add('no-webgl');
  fallback.hidden = false;
} else {
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.matchMedia('(max-width: 700px)').matches;
const mobile = isMobile();
const scene = new THREE.Scene();
scene.background = new THREE.Color('#d7dfdd');
scene.fog = new THREE.Fog('#d7dfdd', 28, 96);
const camera = new THREE.PerspectiveCamera(mobile ? 61 : 52, innerWidth / innerHeight, .1, 150);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.75));
renderer.shadowMap.enabled = !mobile; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = !mobile; renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;

const colors = { white:0xf3f4ef, wall:0xe4e5df, blue:0x246b86, navy:0x163e51, glass:0x9ab9bb, floor:0xbac1bd, wood:0x987a55, green:0x486d5b, charcoal:0x283d42, metal:0x738386, stone:0xaeb6b2 };
const mat = (color, rough=.75, metal=0) => new THREE.MeshStandardMaterial({ color, roughness:rough, metalness:metal, envMapIntensity: .7 });
const wallMat = mat(colors.wall,.92);
const concrete = mat(colors.stone,.9);
const metal = mat(colors.metal,.25,.86);
const brushedDark = mat(0x31494d,.2,.75);
const glass = new THREE.MeshPhysicalMaterial({ color:colors.glass, roughness:.16, metalness:.08, transparent:true, opacity:.48, transmission:.16, ior:1.42, thickness:.08, side:THREE.DoubleSide, depthWrite:false });
const darkGlass = new THREE.MeshPhysicalMaterial({ color:0x638d90, roughness:.23, metalness:.22, transparent:true, opacity:.5, transmission:.12, ior:1.4, side:THREE.DoubleSide, depthWrite:false });
const glow = (color, intensity=.55) => new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:intensity, roughness:.38 });
const hospital = new THREE.Group(); scene.add(hospital);
const shadow = (mesh) => { mesh.castShadow = !mobile; mesh.receiveShadow = !mobile; return mesh; };
function box(x,y,z,w,h,d,material,group=hospital) { const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material)); m.position.set(x,y,z); group.add(m); return m; }
function plane(x,y,z,w,h,material,rot=[0,0,0],group=hospital){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);m.position.set(x,y,z);m.rotation.set(...rot);group.add(m);return m;}
function cylinder(x,y,z,r,h,material,group=hospital) { const m=shadow(new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,18),material));m.position.set(x,y,z);group.add(m);return m; }
function floorTexture() { const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#bdc4c0';ctx.fillRect(0,0,512,512);ctx.strokeStyle='rgba(52,67,67,.14)';ctx.lineWidth=2;for(let i=0;i<=512;i+=128){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,512);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke();}for(let i=0;i<1800;i++){const a=Math.random()*.045;ctx.fillStyle=`rgba(35,52,51,${a})`;ctx.fillRect(Math.random()*512,Math.random()*512,1,1)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(7,26);t.colorSpace=THREE.SRGBColorSpace;return t; }
const flooring = new THREE.MeshStandardMaterial({ color:0xc2c9c4, map:floorTexture(), roughness:.42, metalness:.08 });
function textCanvas(label, width=512, height=128, size=44, inverse=false) { const c=document.createElement('canvas'); c.width=width;c.height=height;const x=c.getContext('2d');x.fillStyle=inverse?'#1c4656':'#f4f4ef';x.fillRect(0,0,width,height);x.fillStyle=inverse?'#e9f1ee':'#1d5369';x.font=`600 ${size}px Manrope, Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(label,width/2,height/2+2);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide});}
function sign(label,x,y,z,w=3.1,rotation=0){const s=plane(x,y,z,w,.64,textCanvas(label),[0,rotation,0]);return s;}
function plant(x,z,scale=1){const g=new THREE.Group();box(0,.27,0,.62,.54,.62,mat(0x687577,.5,.2),g);for(let i=0;i<7;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.28*scale,10,8),mat(colors.green,.72));leaf.position.set((i%3-1)*.22*scale,.65+(i%2)*.33*scale,(Math.floor(i/3)-.5)*.18*scale);leaf.scale.set(.8,1.65,.65);leaf.rotation.z=(i-3)*.24;g.add(leaf)}g.position.set(x,0,z);hospital.add(g)}

// Exterior: substantial geometry keeps the camera physically outside a hospital.
box(0,-.17,-20,31,.3,110,concrete);
box(-8.8,5,-6,1,10,2,wallMat); box(8.8,5,-6,1,10,2,wallMat); box(0,9.3,-6,18.6,1.4,mat(0xd6dad3,.82));
box(0,10.5,-6.5,20,1.2,mat(colors.white,.75));
for (const x of [-7,-4.7,4.7,7]) plane(x,5.2,-7.03,2.2,7.5,darkGlass);
for (const x of [-8.1,-5.8,-3.5,3.5,5.8,8.1]) box(x,5.1,-7.16,.14,7.8,.18,metal);
box(0,8.75,-7.18,17.8,.16,.2,brushedDark);
for (const x of [-7,-4.7,4.7,7]) plane(x,6.3,-7.2,1.6,.08,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.36}),[0,0,0]);
// The glass doors lead into a real opening: there is no opaque facade hidden behind them.
box(-3.55,2.25,-7.15,2.25,4.5,.15,wallMat);
box(3.55,2.25,-7.15,2.25,4.5,.15,wallMat);
const doorL=plane(-1.17,2.25,-7.27,2.25,4.05,glass);const doorR=plane(1.17,2.25,-7.27,2.25,4.05,glass);
box(-2.4,2.25,-7.25,.12,4.6,brushedDark);box(2.4,2.25,-7.25,.12,4.6,brushedDark); box(0,4.56,-7.27,4.9,.12,brushedDark);
for(const x of [-1.9,-.45,.45,1.9]) box(x,4.72,-7.42,1.18,.08,.06,glow(0xf4f1de,.72));
sign('MEDGAMBIT  CLINICAL CENTER',0,8.45,-7.1,8.4,Math.PI);
for(const x of [-13,-10.5,10.5,13]){plant(x,-9,1.1);}
for(const x of [-4.8,4.8]) {box(x,.75,-10.6,2.3,1.5,.65,mat(colors.wood));box(x,1.57,-10.6,2.46,.16,.75,mat(0xc7b18f));}
// Deep, layered canopy, columns and paving make the entrance read as real architecture.
box(0,7.6,-10.2,12.2,.25,5,mat(0xe8e9e3,.6));box(0,7.3,-10.2,12.6,.12,5.2,brushedDark);
for(const x of [-5.7,5.7]) { cylinder(x,3.7,-10.2,.17,7.4,metal);cylinder(x,.12,-10.2,.34,.16,concrete); }
for(const x of [-4.8,-2.4,0,2.4,4.8]) box(x,7.28,-10.25,.08,.12,4.8,brushedDark);
for(const z of [-28,-22,-16,-10]) plane(0,.005,z,11.2,.04,new THREE.MeshBasicMaterial({color:0xd5d7d1,transparent:true,opacity:.8}),[-Math.PI/2,0,0]);
for(const x of [-13,-10.5,10.5,13]) cylinder(x,.12,-9,.5,.18,concrete);

// Interior lobby, all physically enclosed but open on entrance.
// A central opening joins lobby and hall, keeping the walking route physically clear.
box(-6.7,5,10,4.6,10,.4,wallMat);box(6.7,5,10,4.6,10,.4,wallMat);
box(-9,5,3,.4,10,14,wallMat);box(9,5,3,.4,10,14,wallMat);box(0,10,3,18,.25,14,mat(colors.white,.72));
box(0,-.14,3,18,.25,14,flooring);
// Glass partition, reception and lobby furniture
plane(-4.8,4.5,2,5,7.5,glass,[0,Math.PI/2,0]);box(-3.5,1.25,5.8,5.7,2.5,1,mat(0xd8e0da,.58));box(-3.5,2.55,5.8,5.9,.12,mat(colors.navy,.33,.5));sign('RECEPTION',-3.5,5.4,5.25,2.8,Math.PI);
box(-4.25,3.06,5.38,.84,.55,.08,brushedDark);plane(-4.25,3.08,5.32,.72,.42,new THREE.MeshBasicMaterial({color:0x8ac5cf}),[0,Math.PI,0]);cylinder(-2.45,2.94,5.45,.12,.55,metal);
for(const [x,z] of [[3.3,1.8],[5.4,4.1],[3.3,5.1]]){box(x,.45,z,1.25,.9,1.25,mat(0x718489,.52));box(x,.96,z,1.35,.14,1.35,mat(colors.wood,.55));}
plant(6.7,7.1,1.1); sign('IMAGING   /   CONSULTS   /   EDUCATION',1.7,7.3,8.8,6.4,Math.PI);
// Corridor bends to the right and has clear depth.
box(-6.8,5,17,4.4,10,.3,wallMat);box(6.8,5,17,4.4,10,.3,wallMat);
box(-9,5,18,.3,10,20,wallMat);box(9,5,18,.3,10,20,wallMat);box(0,-.14,18,18,.25,20,flooring);box(0,10,18,18,.25,20,mat(colors.white,.72));
for(let z=12;z<33;z+=4){ box(-8.82,3.2,z,.15,5.5,1.5,mat(0xc3ccc7,.84)); box(8.82,3.2,z,.15,5.5,1.5,mat(0xc3ccc7,.84)); box(-8.64,3.15,z,.035,5.4,1.22,metal); box(8.64,3.15,z,.035,5.4,1.22,metal); }
for(let z=14;z<34;z+=4){box(0,9.7,z,5.2,.1,.12,glow(0xf7f6e9,.56));}
sign('CASE REVIEW  →',-7.82,5.3,15.8,1.5,-Math.PI/2);sign('MEDGAMBIT',7.82,5.3,21,1.5,Math.PI/2);
// Clinical details keep the corridor deliberate, but never cluttered.
for(const z of [13.2,25.2]) { box(7.98,1.12,z,.32,2.24,.26,mat(0xd8e3df,.54));box(7.98,2.06,z,.38,.25,.3,glow(0x88c9cf,.35)); }
for(const z of [18.5,27]) { box(-7.55,.72,z,.82,1.44,.48,mat(0x7b9191,.38,.15));box(-7.55,1.47,z,.92,.1,.55,mat(colors.wood,.5)); }
const cart = new THREE.Group();box(0,.78,0,1.35,.12,.66,metal,cart);box(0,1.65,0,.95,1.55,.12,mat(0xe8ede9,.6),cart);plane(0,1.65,-.07,.76,.68,new THREE.MeshBasicMaterial({color:0x75b7c2}),[0,0,0],cart);for(const x of [-.5,.5])for(const z of [-.2,.2])cylinder(x,.12,z,.07,.18,brushedDark,cart);cart.position.set(6.9,0,29);hospital.add(cart);
// Doctor alcove
box(0,5,38,18,10,.3,wallMat);box(0,-.14,37,18,.25,8,flooring);box(-4.8,3.4,36.7,5.5,4.3,.3,darkGlass);
// A photoreal clinician cutout replaces the prototype figure, composed beside the camera axis.
const doctorTexture = new THREE.TextureLoader().load(doctorTextureURL);doctorTexture.colorSpace=THREE.SRGBColorSpace;
const doctor = plane(3.35,1.5,36.05,1.85,3.0,new THREE.MeshBasicMaterial({map:doctorTexture,transparent:true,alphaTest:.08,side:THREE.DoubleSide,depthWrite:false}),[0,Math.PI,0]);doctor.renderOrder=3;
const doctorShadow = new THREE.Mesh(new THREE.CircleGeometry(.58,32),new THREE.MeshBasicMaterial({color:0x60716e,transparent:true,opacity:.18,depthWrite:false}));doctorShadow.rotation.x=-Math.PI/2;doctorShadow.position.set(3.35,.015,36.15);hospital.add(doctorShadow);
box(4.45,1.15,36.3,3.25,2.3,1.2,mat(0xe2e5df,.6));box(4.45,2.35,36.3,3.42,.12,mat(colors.navy,.3,.5));
const screen=box(-3.25,3.8,36.45,3.3,2.2,.12,brushedDark);const scr=plane(-3.25,3.8,36.38,3.05,1.9,new THREE.MeshBasicMaterial({color:0x78b8c1}),[0,Math.PI,0]);
sign('CONSULTATION  04',-3.25,6.02,36.32,2.7,Math.PI);plant(-7.05,35.3,1.15);

// Layered daylight, warm practicals, and only three shadowed key lights keep the scene architectural rather than game-like.
scene.add(new THREE.HemisphereLight(0xe5efed,0x6d7771,1.85));
const sun=new THREE.DirectionalLight(0xfff1d9,2.15);sun.position.set(-15,18,-18);sun.castShadow=!mobile;sun.shadow.mapSize.set(1536,1536);sun.shadow.camera.left=-18;sun.shadow.camera.right=18;sun.shadow.camera.top=18;sun.shadow.camera.bottom=-18;scene.add(sun);
const entryKey=new THREE.SpotLight(0xfff4df,42,26,.68,.65,1.2);entryKey.position.set(0,8,-12);entryKey.target.position.set(0,0,-6);entryKey.castShadow=!mobile;scene.add(entryKey,entryKey.target);
const lobbyLight=new THREE.PointLight(0xfff8ea,17,22,2);lobbyLight.position.set(-2.5,7,4);scene.add(lobbyLight);
const hallLight=new THREE.PointLight(0xf4f5e9,13,28,2);hallLight.position.set(0,7,20);scene.add(hallLight);
const roomLight=new THREE.SpotLight(0xfff5e9,28,18,.78,.58,1.2);roomLight.position.set(1,8,31);roomLight.target.position.set(3.3,2,35);roomLight.castShadow=!mobile;scene.add(roomLight,roomLight.target);

// The entire shot shares a single centreline. The small offsets only clear the reception desk,
// never create a game-like turn or a discontinuity between rooms.
const path = new THREE.CatmullRomCurve3([new THREE.Vector3(0,1.7,-35),new THREE.Vector3(0,1.7,-24),new THREE.Vector3(0,1.7,-13),new THREE.Vector3(0,1.7,-8.9),new THREE.Vector3(0,1.7,-7.4),new THREE.Vector3(0,1.7,-4.7),new THREE.Vector3(.05,1.7,3),new THREE.Vector3(.12,1.7,11),new THREE.Vector3(.18,1.7,21),new THREE.Vector3(.1,1.7,29.5),new THREE.Vector3(.45,1.7,32.8)],false,'centripetal');
const gaze = new THREE.CatmullRomCurve3([new THREE.Vector3(0,2.35,-12),new THREE.Vector3(0,2.3,-8),new THREE.Vector3(0,2.2,-6),new THREE.Vector3(0,2.15,3),new THREE.Vector3(0,2.1,15),new THREE.Vector3(.45,2.15,25),new THREE.Vector3(1.65,2.38,35)],false,'centripetal');
const state={ p:0, smooth:0, door:0 }; const target=new THREE.Vector3();
function sceneProgress(scroll){ return Math.min(1,Math.max(0,scroll/(document.body.scrollHeight-innerHeight))); }
function pathProgress(p) { const keys=[[0,0],[.2,.19],[.35,.37],[.45,.41],[.55,.55],[.68,.69],[.85,.91],[.95,.985],[1,1]];for(let i=1;i<keys.length;i++){if(p<=keys[i][0]){const [p0,u0]=keys[i-1];const [p1,u1]=keys[i];return THREE.MathUtils.lerp(u0,u1,THREE.MathUtils.smoothstep(p,p0,p1));}}return 1; }
function updateCaptions(p){document.querySelector('[data-caption="arrival"]').classList.toggle('active',p<.16);document.querySelector('[data-caption="entry"]').classList.toggle('active',p>.45&&p<.57);document.querySelector('[data-caption="corridor"]').classList.toggle('active',p>.68&&p<.83);document.querySelector('[data-caption="final"]').classList.toggle('active',p>.95);document.querySelector('.scroll-cue').style.opacity=p>.06?'0':'1';}
function onScroll(){state.p=sceneProgress(scrollY);document.querySelector('.progress span').style.height=`${state.p*100}%`;updateCaptions(state.p);} addEventListener('scroll',onScroll,{passive:true});onScroll();
function render(){requestAnimationFrame(render);const desired=reduced?Math.min(state.p,.12):state.p;state.smooth+= (desired-state.smooth)*.075;const p=state.smooth;const travel=pathProgress(p);const cameraP=path.getPointAt(travel);camera.position.copy(cameraP);target.copy(gaze.getPointAt(Math.min(1,travel+.018)));camera.lookAt(target);const d=THREE.MathUtils.smoothstep(p,.35,.45);doorL.position.x=-1.17-1.25*d;doorR.position.x=1.17+1.25*d;renderer.render(scene,camera);}render();
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  document.documentElement.classList.add('no-webgl');
  fallback.hidden = false;
});
addEventListener('resize',()=>{const compact=isMobile();camera.fov=compact?61:52;camera.aspect=innerWidth/innerHeight;renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,compact?1.25:1.75));});
}
