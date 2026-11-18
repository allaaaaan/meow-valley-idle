// game.js — Idle Town (喵喵谷): state, idle loop, camera, rendering, UI.
(function(){
const {C,PAL,hash,bay}=PIX;const {WW,WH,PLOTS,DECOR,RIVER,WALLS,distPoly,riverW}=WORLD;const B=BUILDINGS;const FX_=FX;
const Q=new URLSearchParams(location.search);const REC=Q.has('rec');
if(Q.has('fresh'))localStorage.removeItem('idletown_v1');
// ---------------- config ----------------
const COST=[0,40,140,320,650,1200];         // hidden: shown only as basket fractions
const BUILD_S=[0,12,24,36,50,70];          // seconds per level (demo speed)
const RATE={bakery:.9,fishery:1.1,yarn:.6,inn:.4,hall:.5};
const CATDEF=[
 {id:'mochi',name:'年糕',coat:'white',trait:'爱睡觉',home:'inn',need:null,line:'……呼噜……（年糕翻了个身）'},
 {id:'juzi',name:'橘子',coat:'orange',trait:'贪吃鬼',home:'bakery',need:null,line:'面包！刚出炉的面包在哪里！'},
 {id:'naicha',name:'奶茶',coat:'calico',trait:'社交达人',home:'hall',need:['inn',1],line:'今天又有新朋友路过吗？'},
 {id:'xiaohui',name:'小灰',coat:'grey',trait:'安静的渔夫',home:'fishery',need:['fishery',1],line:'嘘——鱼要上钩了。'},
 {id:'doudou',name:'豆豆',coat:'siamese',trait:'手很巧',home:'yarn',need:['yarn',1],line:'这条围巾送给你，要不要？'},
 {id:'meiqiu',name:'煤球',coat:'black',trait:'好奇心旺盛',home:'hall',need:['hall',2],line:'钟楼顶上能看到整个山谷哦。'},
];
const EVENTS=[
 {k:'bread',cat:'juzi',need:['bakery',1],t:'橘子在面包房门口守了一下午，终于等到刚出炉的第一个面包。'},
 {k:'bread',cat:'juzi',need:['bakery',3],t:'橘子偷吃了窗台上晾着的奶油面包，被抓了个正着。'},
 {k:'fish',cat:'xiaohui',need:['fishery',1],t:'小灰钓到一条比自己还大的鱼，全镇分着吃了。'},
 {k:'yarn',cat:'doudou',coat2:'white',need:['yarn',1],t:'豆豆织了一条很长的围巾，盖在了睡着的年糕身上。'},
 {k:'sleep',cat:'mochi',need:null,t:'年糕找到一块晒得暖暖的石头，睡了整整一个下午。'},
 {k:'sleep',cat:'mochi',need:['inn',5],t:'年糕又爬上了塔楼顶睡觉，没有谁知道它是怎么上去的。'},
 {k:'moon',cat:'meiqiu',need:['hall',2],t:'煤球半夜爬上高处看月亮，一直坐到天亮。'},
 {k:'visitor',cat:'naicha',need:['hall',1],t:'一只陌生的流浪猫路过，奶茶请它喝了水。它说下次还会再来。'},
 {k:'flower',cat:'naicha',need:null,t:'有猫在路边种下了一排小花。你看，就在那儿。',flower:true},
 {k:'rain',cat:'juzi',coat2:'grey',need:null,t:'下了一场小雨，大家挤在屋檐下，听着雨声睡着了。'},
 {k:'music',cat:'doudou',coat2:'calico',need:['hall',3],t:'晚上大家围在广场上唱歌，跑调最厉害的是豆豆。'},
 {k:'firefly',cat:'meiqiu',need:['fishery',2],t:'河边飞来好多萤火虫，煤球追了一整晚，一只都没抓到。'},
 {k:'heart',cat:'xiaohui',coat2:'siamese',need:['inn',2],t:'小灰和豆豆在旅店门口晒太阳，聊了一下午。'},
];
// ---------------- state ----------------
const SAVE='idletown_v1';let S;
function fresh(){const t=Date.now();return {v:1,fish:60,last:t,start:t,skew:0,plots:Object.fromEntries(PLOTS.map(p=>[p.id,{lv:0,job:null}])),flowers:[],todMode:'auto',seen:false};}
try{S=JSON.parse(localStorage.getItem(SAVE))||fresh();}catch(e){S=fresh();}
let vNow=Date.now();                              // virtual clock in record mode
const now=()=>(REC?vNow:Date.now())+S.skew;
function save(){if(REC)return;S.last=now();localStorage.setItem(SAVE,JSON.stringify(S));}
const lv=id=>S.plots[id].lv;
function rate(){let r=.35;for(const p of PLOTS)r+=lv(p.id)*RATE[p.type];return r;}
function cap(){return 260+200*(lv('inn')+lv('hall'))+80*lv('fishery');}
function prosperity(){return PLOTS.reduce((a,p)=>a+lv(p.id),0)+Math.floor(S.flowers.length/2);}
// advance the hidden economy to time T, completing jobs on the way; returns list of completions
function advance(T){const done=[];let t=S.last||T;
 for(let guard=0;guard<50;guard++){let next=null;for(const p of PLOTS){const j=S.plots[p.id].job;if(j&&j.start+j.dur<=T&&(!next||j.start+j.dur<next.end))next={id:p.id,end:j.start+j.dur};}
  const until=next?Math.max(t,next.end):T;S.fish=Math.min(cap(),S.fish+rate()*(until-t)/1000);t=until;
  if(!next)break;const P=S.plots[next.id];P.lv=P.job.to;P.job=null;done.push({id:next.id,lv:P.lv});}
 S.last=T;return done;}
// ---------------- assets ----------------
const ART={};function art(type,L){const k=type+L;if(ART[k])return ART[k];const b=L===0?B.empty():B[type].build(L);const bb=b.s.bbox();
 return ART[k]={cv:b.s.toCanvas(),lit:b.lit.toCanvas(),meta:b.meta,bb,spr:b.s};}
const AX=56,AY=120;                                 // sprite anchor (centre x, ground y)
let terrain=null,terrainP=-1;function getTerrain(){const p=prosperity();if(p!==terrainP){terrainP=p;const s=WORLD.paint(p);terrain=s.toCanvas();}return terrain;}
// water pixels for animation
const WATER=[],FALLS=[];(function(){const cum=[0];for(let i=1;i<RIVER.length;i++)cum.push(cum[i-1]+Math.hypot(RIVER[i][0]-RIVER[i-1][0],RIVER[i][1]-RIVER[i-1][1]));
 for(let y=212;y<WH;y+=1)for(let x=0;x<WW;x++){const [d,i,t]=distPoly(x,y,RIVER);const w=riverW(y);if(d<w-1.5){const s=cum[i]+t*(cum[i+1]-cum[i]);WATER.push([x,y,s,hash(x,y,9)]);}}
 for(let y=150;y<205;y++)for(let x=300;x<313;x++)if(Math.abs(x-306)<5)FALLS.push([x,y]);
 WALLS.forEach((_,i)=>{for(let x=0;x<WW;x++){const y0=WALLS[i]+Math.round(3*Math.sin(x/37+i)+2*Math.sin(x/13+i*2));if(distPoly(x,y0+5,RIVER)[0]<riverW(y0)+1.5)for(let j=0;j<11;j++)FALLS.push([x,y0+j]);}});})();
// ---------------- cats ----------------
const NODES={gate:[180,1004],road:[180,940],brS:[179,884],brN:[178,850],s3b:[178,826],s3t:[176,796],low:[176,782],bakeryS:[100,782],fishS:[232,784],bank:[262,782],
 mid:[173,690],s2b:[170,600],s2t:[168,570],plaza:[168,540],plW:[134,532],plE:[202,536],up:[158,452],s1b:[156,356],s1t:[155,338],innS:[96,338],yarnS:[210,340],
 fieldW:[96,976],fieldE:[250,978],bakeryD:[88,766],fishD:[232,770],innD:[92,322],yarnD:[210,326],hallD:[166,524]};
const EDGES=[['gate','road'],['road','brS'],['brS','brN'],['brN','s3b'],['s3b','s3t'],['s3t','low'],['low','bakeryS'],['low','fishS'],['fishS','bank'],['low','mid'],['mid','s2b'],['s2b','s2t'],['s2t','plaza'],
 ['plaza','plW'],['plaza','plE'],['plaza','up'],['up','s1b'],['s1b','s1t'],['s1t','innS'],['s1t','yarnS'],['road','fieldW'],['road','fieldE'],['bakeryS','bakeryD'],['fishS','fishD'],['innS','innD'],['yarnS','yarnD'],['plaza','hallD']];
const ADJ={};EDGES.forEach(([a,b])=>{(ADJ[a]=ADJ[a]||[]).push(b);(ADJ[b]=ADJ[b]||[]).push(a);});
function route(a,b){const prev={[a]:null},q=[a];while(q.length){const n=q.shift();if(n===b)break;for(const m of ADJ[n]||[])if(!(m in prev)){prev[m]=n;q.push(m);}}const r=[];let n=b;while(n){r.unshift(n);n=prev[n];}return r;}
const DOOR={bakery:'bakeryD',fishery:'fishD',inn:'innD',yarn:'yarnD',hall:'hallD'};
const cats=[];let catId=0;
function catArrived(d){return !d.need||lv(d.need[0])>=d.need[1];}
function spawnCat(d,atGate){const n=atGate?'gate':(lv(d.home)>0?DOOR[d.home]:'plaza');const p=NODES[n];
 cats.push({d,x:p[0]+(hash(catId,1,1)-.5)*6,y:p[1],node:n,path:[],state:'idle',timer:1+hash(catId++,2,2)*3,face:1,f:0,ft:0,pose:'sit',hidden:false,bubble:null});}
function syncCats(atGate){for(const d of CATDEF)if(catArrived(d)&&!cats.find(c=>c.d===d))spawnCat(d,atGate);}
function nightish(){return tod().dark>.45;}
function catThink(c){const home=c.d.home;
 if(nightish()){const tgt=lv('inn')>0?'innD':'plaza';if(c.node!==tgt){c.path=route(c.node,tgt).slice(1);c.state='walk';return;}
  c.state=lv('inn')>0&&hash(c.x|0,1,3)<.7?'inside':'sleep';c.timer=20;return;}
 const r=Math.random();
 if(r<.28&&lv(home)>0&&c.node!==DOOR[home]){c.path=route(c.node,DOOR[home]).slice(1);c.state='walk';return;}
 if(r<.42&&c.node===DOOR[home]&&lv(home)>0){c.state='inside';c.timer=4+Math.random()*7;return;}
 if(r<.75){const keys=Object.keys(NODES).filter(k=>!k.endsWith('D'));const tgt=keys[Math.floor(Math.random()*keys.length)];c.path=route(c.node,tgt).slice(1);c.state='walk';return;}
 c.state=(c.d.id==='mochi'&&Math.random()<.7)?'sleep':'sit';c.timer=3+Math.random()*6;}
function updCat(c,dt){c.ft+=dt;
 if(c.state==='walk'){if(!c.path.length){c.state='idle';c.timer=0;return;}const n=c.path[0],p=NODES[n];const dx=p[0]-c.x,dy=p[1]-c.y,d=Math.hypot(dx,dy);const sp=13*dt;
  if(d<=sp){c.x=p[0];c.y=p[1];c.node=n;c.path.shift();}else{c.x+=dx/d*sp;c.y+=dy/d*sp;if(Math.abs(dx)>.3)c.face=dx>0?1:-1;}
  c.pose='walk';c.f=Math.floor(c.ft*8)%4;c.hidden=false;return;}
 c.timer-=dt;c.hidden=c.state==='inside';c.pose=c.state==='sleep'?'sleep':'sit';c.f=Math.floor(c.ft*(c.state==='sleep'?1.2:1.6))%2;
 if(c.timer<=0)catThink(c);}
// ---------------- time of day ----------------
let todOverride=null;
function tod(){let h;const m=todOverride||S.todMode;if(m==='day')h=12;else if(m==='dusk')h=18.6;else if(m==='night')h=22.5;else{const d=new Date(now());h=d.getHours()+d.getMinutes()/60;}
 let dark=0,dusk=0;if(h>=7&&h<17)dark=0;else if(h>=17&&h<20){dark=(h-17)/3*.85;dusk=1-Math.abs(h-18.3)/1.7;}else if(h>=20||h<5)dark=.85;else{dark=.85*(1-(h-5)/2);dusk=1-Math.abs(h-6)/1;}
 return {h,dark:Math.max(0,Math.min(.85,dark)),dusk:Math.max(0,dusk)};}
// ---------------- canvas & camera ----------------
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const world=document.createElement('canvas');world.width=WW;world.height=WH;const g=world.getContext('2d');
const skyCv=document.createElement('canvas');skyCv.width=WW;skyCv.height=240;const sg=skyCv.getContext('2d');
let VW=390,VH=844,DPR=1;
function resize(){VW=innerWidth;VH=innerHeight;DPR=Math.min(3,devicePixelRatio||1);cv.width=VW*DPR;cv.height=VH*DPR;cv.style.width=VW+'px';cv.style.height=VH+'px';clampCam();}
const cam={x:175,y:560,z:2,vx:0,vy:0};let fly=null;
function zmin(){return Math.max(VW/WW,0.6);} const ZMAX=6;
function clampCam(){cam.z=Math.max(zmin(),Math.min(ZMAX,cam.z));const hw=VW/2/cam.z,hh=VH/2/cam.z;cam.x=hw*2>=WW?WW/2:Math.max(hw,Math.min(WW-hw,cam.x));cam.y=hh*2>=WH?WH/2:Math.max(hh,Math.min(WH-hh,cam.y));}
const toWorld=(sx,sy)=>[cam.x+(sx-VW/2)/cam.z,cam.y+(sy-VH/2)/cam.z];
const toScreen=(wx,wy)=>[(wx-cam.x)*cam.z+VW/2,(wy-cam.y)*cam.z+VH/2];
function flyTo(x,y,z,dur){fly={x0:cam.x,y0:cam.y,z0:cam.z,x,y,z:z||cam.z,t:0,dur:dur||.9};}
// input
const ptrs=new Map();let gest=null,lastMove=[],tapStart=null;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});fly=null;cam.vx=cam.vy=0;startGest();if(ptrs.size===1)tapStart={x:e.clientX,y:e.clientY,t:performance.now(),moved:0};else tapStart=null;hideHint();});
cv.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;const p=ptrs.get(e.pointerId);if(tapStart)tapStart.moved+=Math.hypot(e.clientX-p.x,e.clientY-p.y);p.x=e.clientX;p.y=e.clientY;moveGest();});
const up=e=>{if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);if(tapStart&&ptrs.size===0&&tapStart.moved<10&&performance.now()-tapStart.t<400)onTap(e.clientX,e.clientY);
 else if(ptrs.size===0&&lastMove.length>1){const a=lastMove[0],b=lastMove[lastMove.length-1],dt=(b.t-a.t)/1000;if(dt>0&&dt<.2){cam.vx=-(b.x-a.x)/dt/cam.z;cam.vy=-(b.y-a.y)/dt/cam.z;}}
 tapStart=null;startGest();};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
function startGest(){const P=[...ptrs.values()];lastMove=[];if(P.length===1)gest={type:'pan',sx:P[0].x,sy:P[0].y,cx:cam.x,cy:cam.y};else if(P.length>=2){const m=[(P[0].x+P[1].x)/2,(P[0].y+P[1].y)/2];gest={type:'pinch',d0:Math.hypot(P[0].x-P[1].x,P[0].y-P[1].y),z0:cam.z,w:toWorld(m[0],m[1])};}else gest=null;}
function moveGest(){const P=[...ptrs.values()];if(!gest)return;if(gest.type==='pan'&&P.length===1){cam.x=gest.cx-(P[0].x-gest.sx)/cam.z;cam.y=gest.cy-(P[0].y-gest.sy)/cam.z;lastMove.push({x:P[0].x,y:P[0].y,t:performance.now()});if(lastMove.length>5)lastMove.shift();}
 else if(gest.type==='pinch'&&P.length>=2){const d=Math.hypot(P[0].x-P[1].x,P[0].y-P[1].y),m=[(P[0].x+P[1].x)/2,(P[0].y+P[1].y)/2];cam.z=Math.max(zmin(),Math.min(ZMAX,gest.z0*d/gest.d0));cam.x=gest.w[0]-(m[0]-VW/2)/cam.z;cam.y=gest.w[1]-(m[1]-VH/2)/cam.z;}
 clampCam();}
cv.addEventListener('wheel',e=>{e.preventDefault();cam.vx=cam.vy=0;const w=toWorld(e.clientX,e.clientY);cam.z=Math.max(zmin(),Math.min(ZMAX,cam.z*Math.exp(-e.deltaY*.0015)));cam.x=w[0]-(e.clientX-VW/2)/cam.z;cam.y=w[1]-(e.clientY-VH/2)/cam.z;clampCam();fly=null;hideHint();},{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());
// ---------------- picking ----------------
function plotArt(p){return art(p.type,lv(p.id));}
function plotRect(p){const P=S.plots[p.id];const a=plotArt(p);let bb=a.bb;if(P.job){const n=art(p.type,P.job.to).bb;bb={x0:Math.min(bb.x0,n.x0),y0:Math.min(bb.y0,n.y0),x1:Math.max(bb.x1,n.x1),y1:Math.max(bb.y1,n.y1)};}
 return {x0:p.x-AX+bb.x0,y0:p.y-AY+bb.y0,x1:p.x-AX+bb.x1,y1:p.y-AY+bb.y1};}
function focusPlot(p,z){const r=plotRect(p);const zz=z||Math.max(cam.z,2.8);flyTo((r.x0+r.x1)/2,(r.y0+r.y1)/2+VH*.2/zz,zz,.7);}
function onTap(sx,sy){const [wx,wy]=toWorld(sx,sy);
 for(const c of cats){if(!c.hidden&&Math.abs(c.x-wx)<9&&wy>c.y-16&&wy<c.y+3){c.bubble={t:3.5,text:c.d.name+'：'+c.d.line};SFX.meow();return;}}
 let hit=null;for(const p of [...PLOTS].sort((a,b)=>b.y-a.y)){const r=plotRect(p);if(wx>=r.x0-3&&wx<=r.x1+3&&wy>=r.y0-3&&wy<=r.y1+4){hit=p;break;}}
 if(hit){openSheet(hit);focusPlot(hit);}else closeSheet();}
// ---------------- particles ----------------
const parts=[];let smokeT=0;
function spawnSmoke(x,y){parts.push({k:'smoke',x,y,vx:2+Math.random()*2,vy:-6-Math.random()*3,life:2.6,age:0});}
function burst(p){const r=plotRect(p);for(let i=0;i<26;i++)parts.push({k:'spark',x:r.x0+Math.random()*(r.x1-r.x0),y:r.y0+Math.random()*(r.y1-r.y0),vx:(Math.random()-.5)*10,vy:-8-Math.random()*10,life:1.4+Math.random()*.6,age:0});
 for(let i=0;i<16;i++)parts.push({k:'dust',x:p.x-30+Math.random()*60,y:p.y-2,vx:(Math.random()-.5)*24,vy:-Math.random()*6,life:1,age:0});}
// ambient creatures
const birds=[],flies=[];for(let i=0;i<26;i++)flies.push({x:Math.random()*WW,y:220+Math.random()*800,p:Math.random()*7});
const butterflies=[[70,520],[262,520],[110,690],[300,940],[110,250],[60,940]].map(([x,y],i)=>({x,y,bx:x,by:y,p:i}));
// ---------------- render ----------------
let T=0,skyKey='';
function drawSky(td){const key=(td.dark>.55?'n':td.dusk>.4?'d':'y');if(key!==skyKey){skyKey=key;sg.clearRect(0,0,WW,240);FX_.sky(sg,WW,240,td,T);}}
function render(dt){T+=dt;const td=tod();drawSky(td);
 // sky dynamic layer on screen later; world:
 g.clearRect(0,0,WW,WH);g.drawImage(getTerrain(),0,0);
 // water shimmer
 const tw=T*14;for(const [x,y,s,h] of WATER){const v=(s*.35-tw+h*9)%9;if(v<0?v+9<.9:v<.9){g.fillStyle=PAL[h<.5?C.BL2:C.WHITE];g.fillRect(x,y,1,1);}}
 for(const [x,y] of FALLS){const v=((y-T*30+x*1.7)%6+6)%6;g.fillStyle=PAL[v<1.5?C.WHITE:v<3.5?C.BL2:C.BL1];g.fillRect(x,y,1,1);}
 // flower patches from events
 for(const f of S.flowers)g.drawImage(FX_.DEC.flowers.cv,f[0]-10,f[1]-6);
 // entities sorted by y
 const P=prosperity();const ents=[];
 for(const d of DECOR){if(P<d.p||!FX_.DEC[d.k])continue;ents.push({y:d.y,draw:()=>{const D=FX_.DEC[d.k];g.drawImage(D.cv,Math.round(d.x-D.w/2),d.y-D.h+1);if(d.k==='fountain'){for(let i=0;i<5;i++){const a=(T*3+i*1.3)%3;FX_.px(g,d.x-3+i*1.5+Math.sin(i)*2,d.y-D.h+2-a*2+a*a*.4,C.BL2);}FX_.px(g,d.x,d.y-D.h-1+Math.sin(T*6),C.WHITE);}}});}
 for(const p of PLOTS)ents.push({y:p.y,draw:()=>drawPlot(p)});
 for(const c of cats)if(!c.hidden)ents.push({y:c.y,draw:()=>{const F=CATS.frames(c.d.coat);const fr=F[c.pose][c.f%F[c.pose].length][c.face>0?0:1];g.fillStyle='rgba(35,73,61,.45)';g.fillRect(Math.round(c.x)-5,Math.round(c.y),11,1);g.drawImage(fr,Math.round(c.x)-11,Math.round(c.y)-15);
  if(c.pose==='sleep'){const zt=(T+c.x)%2;FX_.px(g,c.x+4+zt*2,c.y-13-zt*4,C.WHITE);if(zt>1){FX_.rect(g,c.x+7+zt,c.y-19-zt*3,2,1,C.WHITE);}}}});
 // mochi's special sleeping spot on the inn
 const inn=PLOTS.find(p=>p.id==='inn');const im=art('inn',lv('inn')).meta;
 ents.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
 if(im.sleep&&!S.plots.inn.job){const F=CATS.frames('white');g.drawImage(F.sleep[Math.floor(T*1.2)%2][0],inn.x-AX+im.sleep[0]-11,inn.y-AY+im.sleep[1]-15);const zt=T%2;FX_.px(g,inn.x-AX+im.sleep[0]+5+zt*2,inn.y-AY+im.sleep[1]-12-zt*4,C.WHITE);}
 // smoke + particles
 smokeT+=dt;if(smokeT>.35){smokeT=0;for(const p of PLOTS){if(S.plots[p.id].job||lv(p.id)===0)continue;for(const s of art(p.type,lv(p.id)).meta.smoke)if(Math.random()<.8)spawnSmoke(p.x-AX+s[0],p.y-AY+s[1]);}}
 for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.age+=dt;if(q.age>q.life){parts.splice(i,1);continue;}q.x+=q.vx*dt;q.y+=q.vy*dt;const k=q.age/q.life;
  if(q.k==='smoke'){q.vx+=1.5*dt;const r=k<.3?1:k<.7?2:2;const c=k<.25?C.WHITE:k<.6?C.ST2:C.ST1;FX_.rect(g,q.x,q.y,r,r,c);if(r>1&&k<.6)FX_.px(g,q.x,q.y,C.WHITE);}
  else if(q.k==='spark'){q.vy+=14*dt;FX_.sparkle(g,q.x,q.y,Math.floor(q.age*10));}
  else if(q.k==='dust'){q.vy+=6*dt;FX_.rect(g,q.x,q.y,k<.5?2:1,k<.5?2:1,k<.5?C.SAND:C.WD3);}}
 // birds (day) / butterflies (zoomed in)
 if(td.dark<.4){if(Math.random()<dt*.08&&birds.length<2)birds.push({x:-10,y:40+Math.random()*90,n:3+Math.floor(Math.random()*3)});
  for(let i=birds.length-1;i>=0;i--){const b=birds[i];b.x+=dt*16;if(b.x>WW+30){birds.splice(i,1);continue;}for(let k=0;k<b.n;k++){const bx=b.x-k*6,by=b.y+Math.abs(k-1)*3+Math.sin(T*3+k)*1.5,f=Math.floor(T*6+k)%2;FX_.px(g,bx,by,C.INK);FX_.px(g,bx-1,by-f,C.INK);FX_.px(g,bx+1,by-f,C.INK);FX_.px(g,bx-2,by-1+f,C.INK);FX_.px(g,bx+2,by-1+f,C.INK);}}
  if(cam.z>=2.4)for(const b of butterflies){b.x=b.bx+Math.sin(T*.7+b.p)*14;b.y=b.by-6+Math.sin(T*1.3+b.p*2)*5;const f=Math.floor(T*8+b.p)%2;FX_.px(g,b.x,b.y,C.INK);FX_.px(g,b.x-1,b.y-f,b.p%2?C.PINK:C.GOLD);FX_.px(g,b.x+1,b.y-f,b.p%2?C.PINK:C.GOLD);}}
 // ---- night: darken everything, then lights ----
 if(td.dark>0||td.dusk>0){g.globalCompositeOperation='source-atop';if(td.dusk>0){g.fillStyle=`rgba(255,120,70,${.16*td.dusk})`;g.fillRect(0,0,WW,WH);}
  if(td.dark>0){g.fillStyle=`rgba(16,14,58,${.72*td.dark})`;g.fillRect(0,0,WW,WH);}g.globalCompositeOperation='source-over';}
 const L=Math.min(1,td.dark*1.6);
 if(L>0){g.globalAlpha=L;
  for(const p of PLOTS){if(S.plots[p.id].job)continue;const a=plotArt(p);g.drawImage(a.lit,p.x-AX,p.y-AY);for(const l of a.meta.lamps)halo(p.x-AX+l[0],p.y-AY+l[1],7);for(const w of a.meta.lights)halo(p.x-AX+w[0]+w[2]/2,p.y-AY+w[1]+w[3]/2,5);
   if(a.meta.beacon){const bx=p.x-AX+a.meta.beacon[0],by=p.y-AY+a.meta.beacon[1];const ang=T*1.4;g.globalAlpha=L*.35;g.fillStyle=PAL[C.WARM];g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(ang)*120,by+Math.sin(ang)*14-6);g.lineTo(bx+Math.cos(ang)*120,by+Math.sin(ang)*14+6);g.fill();g.globalAlpha=L;}}
  for(const d of DECOR)if(P>=d.p&&d.k==='lamp'){g.drawImage(FX_.DEC.lamp.lit,d.x-3,d.y-19);halo(d.x,d.y-15,9);}
  for(const f of flies){const fx=f.x+Math.sin(T*.6+f.p)*10,fy=f.y+Math.sin(T*.9+f.p*1.7)*6;if(Math.sin(T*2+f.p*3)>.1)FX_.px(g,fx,fy,C.GOLD);}
  g.globalAlpha=1;}
 // ---- screen ----
 ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle=PAL[td.dark>.55?C.INK:td.dusk>.4?C.PU1:C.BL2];ctx.fillRect(0,0,VW,VH);
 const ox=VW/2-cam.x*cam.z,oy=VH/2-cam.y*cam.z;
 ctx.save();ctx.translate(ox,oy);ctx.scale(cam.z,cam.z);ctx.drawImage(skyCv,0,0);
 // sun/moon + stars + clouds (sky space)
 if(td.dark>.55){for(let i=0;i<40;i++){const tw2=Math.sin(T*2+i*7)>.6;ctx.fillStyle=PAL[tw2?C.WHITE:C.ST1];ctx.fillRect(Math.floor(hash(i,1,4)*WW),Math.floor(hash(i,2,4)*150),1,1);}
  ctx.fillStyle=PAL[C.WARM];ctx.beginPath();ctx.arc(78,52,9,0,7);ctx.fill();ctx.fillStyle=PAL[C.NV];ctx.beginPath();ctx.arc(83,48,8,0,7);ctx.fill();}
 else{const sx=td.dusk>.4?70:250,sy=td.dusk>.4?118:46;ctx.fillStyle=PAL[td.dusk>.4?C.ORNG:C.GOLD];ctx.fillRect(sx-6,sy-6,13,13);ctx.fillRect(sx-8,sy-3,17,7);ctx.fillRect(sx-3,sy-8,7,17);ctx.fillStyle=PAL[C.WARM];ctx.fillRect(sx-4,sy-4,4,3);}
 FX_.CLOUDS.forEach((c,i)=>{const x=((T*(3+i)+i*140)%(WW+60))-40;ctx.globalAlpha=td.dark>.55?.35:1;ctx.drawImage(c.cv,Math.round(x),26+i*30);ctx.globalAlpha=1;});
 ctx.drawImage(world,0,0);ctx.restore();
 // name tags / bubbles (crisp text in screen space; only when zoomed in = more detail)
 ctx.textAlign='center';ctx.textBaseline='middle';
 for(const c of cats){if(c.hidden)continue;const [sx,sy]=toScreen(c.x,c.y-17);
  if(c.bubble){c.bubble.t-=dt;if(c.bubble.t<=0)c.bubble=null;else{bubble(sx,sy-6,c.bubble.text);continue;}}
  if(cam.z>=2.6){ctx.font='600 11px -apple-system,PingFang SC,sans-serif';const w=ctx.measureText(c.d.name).width+10;ctx.fillStyle='rgba(36,26,46,.72)';rr(sx-w/2,sy-8,w,15,7);ctx.fill();ctx.fillStyle='#fff4dc';ctx.fillText(c.d.name,sx,sy);}}
 for(const p of PLOTS){const j=S.plots[p.id].job;if(!j)continue;const r=plotRect(p);const [sx,sy]=toScreen((r.x0+r.x1)/2,r.y0-6);const k=Math.min(1,(now()-j.start)/j.dur);
  ctx.fillStyle='rgba(36,26,46,.8)';rr(sx-26,sy-5,52,10,5);ctx.fill();ctx.fillStyle='#ffd34d';rr(sx-24,sy-3,48*k,6,3);ctx.fill();}
 if(REC&&window.FINGERS)for(const f of window.FINGERS){ctx.fillStyle='rgba(255,255,255,.35)';ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(f[0],f[1],18,0,7);ctx.fill();ctx.stroke();}
}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function bubble(x,y,text){ctx.font='13px -apple-system,PingFang SC,sans-serif';const w=Math.min(240,ctx.measureText(text).width+20);ctx.fillStyle='#fff4dc';ctx.strokeStyle='#241a2e';ctx.lineWidth=2;rr(x-w/2,y-30,w,26,10);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(x-5,y-5);ctx.lineTo(x,y+2);ctx.lineTo(x+5,y-5);ctx.fill();ctx.fillStyle='#241a2e';ctx.fillText(text,x,y-17,w-12);}
const HALO=(()=>{const c=document.createElement('canvas');c.width=c.height=25;const h=c.getContext('2d');for(let y=0;y<25;y++)for(let x=0;x<25;x++){const d=Math.hypot(x-12,y-12)/12;if(d<1&&bay(x,y)<(1-d)*.9){h.fillStyle=d<.35?PAL[C.WARM]:PAL[C.GOLD];h.fillRect(x,y,1,1);}}return c;})();
function halo(x,y,r){g.save();const a=g.globalAlpha;g.globalAlpha=a*.32;g.globalCompositeOperation='lighter';g.drawImage(HALO,Math.round(x-r),Math.round(y-r),r*2+1,r*2+1);g.restore();}
function drawPlot(p){const P=S.plots[p.id];const cur=art(p.type,P.lv);const ox=p.x-AX,oy=p.y-AY;
 if(!P.job){g.drawImage(cur.cv,ox,oy);drawAnim(p,cur,ox,oy);return;}
 const nx=art(p.type,P.job.to);const k=Math.max(0,Math.min(1,(now()-P.job.start)/P.job.dur));
 g.drawImage(cur.cv,ox,oy);
 const bb=nx.bb,top=Math.round(bb.y1-(bb.y1-bb.y0+1)*k);
 if(top<=bb.y1){g.drawImage(nx.cv,0,top,128,bb.y1-top+2,ox,oy+top,128,bb.y1-top+2);}
 FX_.scaffold(g,ox+bb.x0-1,oy+bb.y0-2,ox+bb.x1+1,oy+AY-1,T);
 // dust at the reveal line + worker cat
 if(Math.random()<.5)parts.push({k:'dust',x:ox+bb.x0+Math.random()*(bb.x1-bb.x0),y:oy+top,vx:(Math.random()-.5)*8,vy:-2-Math.random()*4,life:.6,age:0});
 const F=CATS.frames(['orange','grey','white','calico','siamese'][PLOTS.indexOf(p)]);const wy=Math.max(oy+bb.y0+14,Math.min(oy+AY-2,oy+top+6));g.drawImage(F.work[Math.floor(T*4)%2][0],ox+bb.x0-8,wy-15);
 if(Math.floor(T*4)%2&&Math.random()<.4)FX_.sparkle(g,ox+bb.x0+9,wy-9,0);}
function drawAnim(p,a,ox,oy){const m=a.meta;
 for(const f of m.flags)FX_.flag(g,ox+f.x,oy+f.y,f.col,T+p.x);
 if(m.fire)FX_.fire(g,ox+m.fire[0],oy+m.fire[1],T);
 if(m.spin)FX_.sails(g,ox+m.spin.x,oy+m.spin.y,m.spin.r,T*.9);
 if(m.bell){const sw=Math.round(Math.sin(T*3)*1);FX_.px(g,ox+m.bell[0]+sw,oy+m.bell[1]+4,C.WD0);}
 // lantern flicker
 for(const l of m.lamps){if(Math.sin(T*9+l[0])>.85)FX_.px(g,ox+l[0],oy+l[1],C.WHITE);}}
// ---------------- UI ----------------
const $=s=>document.querySelector(s);
const sheet=$('#sheet');let sheetPlot=null;
function fracWord(f){return f<=.2?'一小把小鱼干':f<=.45?'小半篮小鱼干':f<=.75?'大半篮小鱼干':'满满一篮小鱼干';}
function canBuild(p){const P=S.plots[p.id];const L=P.lv+1;if(L>5)return {ok:false,why:'已经是最高等级啦'};if(P.job)return {ok:false,why:'正在施工…'};
 if(p.type!=='hall'&&lv('hall')<Math.max(1,L-1))return {ok:false,why:`需要先把「钟楼广场」建到 Lv${Math.max(1,L-1)}`};
 const busy=PLOTS.filter(q=>S.plots[q.id].job).length;if(busy>=2)return {ok:false,why:'工匠猫都在忙，等一等'};
 if(S.fish<COST[L])return {ok:false,why:'篮子里的小鱼干还不够，等猫猫们再攒一会儿',wait:true};return {ok:true};}
function pcv(id){return $(id).getContext('2d');}
function openSheet(p){sheetPlot=p;sheet.classList.add('open');refreshSheet(true);}
function closeSheet(){sheetPlot=null;sheet.classList.remove('open');}
function refreshSheet(full){const p=sheetPlot;if(!p)return;const P=S.plots[p.id];const T_=B[p.type];const L=P.lv;
 if(full){$('#sh-name').textContent=T_.name;$('#sh-lv').textContent=L?`Lv${L} · ${T_.desc[L-1]}`:'空地';
  $('#sh-line').textContent=L?T_.lines[L-1]:'一块清理好的空地，插着小木桩。这里可以盖'+T_.name+'。';
  drawPrev('#pv-now',p.type,L);if(L<5){drawPrev('#pv-next',p.type,L+1);$('#nx-label').textContent=`下一级：Lv${L+1} ${T_.desc[L]}`;$('#nx-line').textContent=T_.lines[L];$('#nextbox').style.display='';}else{$('#nextbox').style.display='none';}}
 const cb=canBuild(p);const btn=$('#sh-btn');
 if(P.job){const k=Math.min(1,(now()-P.job.start)/P.job.dur);btn.disabled=true;btn.textContent=`施工中… 还要 ${Math.max(0,Math.ceil((P.job.start+P.job.dur-now())/1000))} 秒`;$('#sh-prog').style.width=(k*100)+'%';$('#sh-progw').style.display='';}
 else{$('#sh-progw').style.display='none';btn.disabled=!cb.ok;btn.textContent=L>=5?'已经是最高等级':cb.ok?(L?`升级（约 ${BUILD_S[L+1]} 秒）`:`开工建造（约 ${BUILD_S[1]} 秒）`):(cb.wait?'小鱼干还不够':'暂时不能建');}
 if(L<5){const c=COST[L+1]/cap();$('#sh-cost').innerHTML=`需要：<b>${fracWord(c)}</b>`+(cb.ok||P.job?'':`<br><span class=why>${cb.why}</span>`);$('#costmark').style.left=Math.min(100,c*100)+'%';$('#costfill').style.width=Math.min(100,S.fish/cap()*100)+'%';$('#costbar').style.display='';}
 else{$('#sh-cost').textContent='';$('#costbar').style.display='none';}}
function drawPrev(id,type,L){const c=$(id),x=c.getContext('2d');const a=art(type,L);x.imageSmoothingEnabled=false;x.clearRect(0,0,c.width,c.height);
 const bb=a.bb,w=bb.x1-bb.x0+1,h=bb.y1-bb.y0+1;const s=Math.max(1,Math.floor(Math.min((c.width-8)/w,(c.height-8)/h)));x.drawImage(a.cv,bb.x0,bb.y0,w,h,Math.round((c.width-w*s)/2),c.height-4-h*s,w*s,h*s);}
$('#sh-btn').onclick=()=>{const p=sheetPlot;if(!p)return;const cb=canBuild(p);if(!cb.ok)return;const P=S.plots[p.id];const L=P.lv+1;S.fish-=COST[L];P.job={to:L,start:now(),dur:BUILD_S[L]*1000};
 parts.push(...Array.from({length:12},()=>({k:'dust',x:p.x-30+Math.random()*60,y:p.y-2,vx:(Math.random()-.5)*20,vy:-Math.random()*8,life:.8,age:0})));SFX.build();save();refreshSheet(true);};
$('#sh-x').onclick=closeSheet;
let toastT=0;function toast(t){const el=$('#toast');el.textContent=t;if(REC){el.classList.add('vis');toastT=3;return;}el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}
function completed(list,quiet){for(const d of list){const p=PLOTS.find(q=>q.id===d.id);const T_=B[p.type];if(!quiet){burst(p);toast(`${T_.name} 升到了 Lv${d.lv}「${T_.desc[d.lv-1]}」`);SFX.done();}}
 const before=cats.length;syncCats(!quiet);if(!quiet&&cats.length>before){const c=cats[cats.length-1];setTimeout(()=>toast(`新居民 ${c.d.name}（${c.d.trait}）搬进了小镇！`),quiet?0:1800);c.path=route('gate','plaza').slice(1);c.state='walk';}
 if(sheetPlot)refreshSheet(true);}
// basket HUD (no numbers: a basket that fills up)
const hud=$('#basket'),hg=hud.getContext('2d');
function drawHud(){const f=S.fish/cap();hg.imageSmoothingEnabled=false;hg.clearRect(0,0,hud.width,hud.height);const s=new PIX.Spr(32,16);
 s.rect(2,5,20,10,(i,j)=>(i+j)%3===0?C.WD1:j===0?C.WD3:C.WD2);s.hl(1,4,22,C.WD3);s.ell(12,4,10,4,(u,v)=>v<0&&Math.abs(u)>.8?C.WD1:-1);
 const n=Math.round(f*7);for(let i=0;i<n;i++){const x=4+(i%4)*4,y=4-Math.floor(i/4)*2;s.rect(x,y,3,2,C.BL1);s.set(x,y,C.BL2);s.set(x+3,y,C.BL0);}
 if(f>=.99){s.set(26,2,C.GOLD);s.set(27,3,C.GOLD);s.set(25,3,C.GOLD);s.set(26,4,C.GOLD);}s.outline(0);hg.drawImage(s.toCanvas(),0,0,64,32);
 $('#basket-word').textContent=f<.15?'篮子快空了':f<.5?'攒了一些':f<.95?'快装满了':'篮子满啦';}
function dayLabel(){const d=Math.floor((now()-S.start)/86400000)+1;const td=tod();$('#day').textContent=`喵喵谷 · 第${d}天`;$('#clock').textContent=td.dark>.55?'🌙':td.dusk>.4?'🌇':'☀️';}
// ---------------- diary ----------------
function makeDiary(ms,done){const list=[];const mins=Math.round(ms/60000);
 for(const d of done){const p=PLOTS.find(q=>q.id===d.id);list.push({k:'build',cat:'juzi',t:`工匠猫们把「${B[p.type].name}」盖成了「${B[p.type].desc[d.lv-1]}」。`});}
 const pool=EVENTS.filter(e=>(!e.need||lv(e.need[0])>=e.need[1])&&cats.find(c=>c.d.id===e.cat));const n=Math.min(4,1+Math.floor(mins/40));
 const used=new Set();for(let i=0;i<n&&pool.length;i++){let e,g2=0;do{e=pool[Math.floor(Math.random()*pool.length)];}while(used.has(e)&&g2++<20);if(used.has(e))break;used.add(e);list.push(e);
  if(e.flower){const spots=[[60,286],[248,290],[120,480],[220,490],[60,720],[140,730],[270,730],[240,930],[120,930]];const sp=spots.filter(s=>!S.flowers.some(f=>f[0]===s[0]&&f[1]===s[1]));if(sp.length)S.flowers.push(sp[Math.floor(Math.random()*sp.length)]);}}
 return {mins,list};}
function showDiary(D){const el=$('#diary');const h=Math.floor(D.mins/60),m=D.mins%60;$('#dy-away').textContent=`你离开了 ${h?h+' 小时 ':''}${m} 分钟`;const box=$('#dy-list');box.innerHTML='';
 D.list.forEach((e,i)=>{const row=document.createElement('div');row.className='dy-row';row.style.animationDelay=(REC?0:i*.25)+'s';const v=FX_.vignette(e.k,CATDEF.find(c=>c.id===e.cat).coat,e.coat2);v.className='vig';row.appendChild(v);const t=document.createElement('p');t.textContent=e.t;row.appendChild(t);box.appendChild(row);});
 $('#dy-foot').textContent=S.fish>=cap()*.95?'篮子已经装满了小鱼干，快去盖点什么吧。':'篮子里又多了不少小鱼干。';el.classList.add('open');}
$('#dy-ok').onclick=()=>{$('#diary').classList.remove('open');save();};
// ---------------- debug ----------------
$('#dbg-btn').onclick=()=>$('#dbg').classList.toggle('open');
$('#d-ff').onclick=()=>{S.skew+=3600e3;const done=advance(now());completed(done,false);toast('⏩ 时间快进了 1 小时');save();};
$('#d-tod').onclick=()=>{const order=['auto','day','dusk','night'];S.todMode=order[(order.indexOf(S.todMode)+1)%4];skyKey='';$('#d-tod').textContent='🌗 时间：'+{auto:'跟随手机',day:'白天',dusk:'黄昏',night:'夜晚'}[S.todMode];save();};
$('#d-away').onclick=()=>{S.last=now()-3*3600e3;returnFlow(true);};
$('#d-reset').onclick=()=>{if(confirm('重置小镇？')){localStorage.removeItem(SAVE);location.reload();}};
$('#d-tod').textContent='🌗 时间：'+{auto:'跟随手机',day:'白天',dusk:'黄昏',night:'夜晚'}[S.todMode];
function hideHint(){$('#hint').classList.add('gone');}
// ---------------- sound (tiny 8-bit beeps, code generated) ----------------
const SFX=(()=>{let ac=null;const beep=(f,d,type,v)=>{try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g2=ac.createGain();o.type=type||'square';o.frequency.value=f;g2.gain.value=v||.04;g2.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(g2).connect(ac.destination);o.start();o.stop(ac.currentTime+d);}catch(e){}};
 return {meow:()=>{beep(880,.12,'triangle',.06);setTimeout(()=>beep(660,.18,'triangle',.05),90);},build:()=>{beep(220,.08);setTimeout(()=>beep(330,.08),90);},done:()=>{[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.15,'square',.035),i*90));}};})();
// ---------------- loop ----------------
function returnFlow(force){const away=now()-(S.last||now());const done=advance(now());syncCats(false);completed(done,true);
 if(force||away>90e3){const D=makeDiary(away,done);showDiary(D);}save();}
let last=performance.now(),acc=0,uiT=0;
function tick(dt){const done=advance(now());if(done.length)completed(done,false);if(fly){fly.t+=dt;const k=Math.min(1,fly.t/fly.dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;cam.x=fly.x0+(fly.x-fly.x0)*e;cam.y=fly.y0+(fly.y-fly.y0)*e;cam.z=fly.z0+(fly.z-fly.z0)*e;if(k>=1)fly=null;clampCam();}
 else if(!ptrs.size&&(Math.abs(cam.vx)>.5||Math.abs(cam.vy)>.5)){cam.x+=cam.vx*dt;cam.y+=cam.vy*dt;cam.vx*=Math.pow(.04,dt);cam.vy*=Math.pow(.04,dt);clampCam();}
 if(toastT>0){toastT-=dt;if(toastT<=0)$('#toast').classList.remove('vis');}for(const c of cats)updCat(c,dt);render(dt);uiT+=dt;if(uiT>.25){uiT=0;drawHud();dayLabel();if(sheetPlot)refreshSheet(false);}}
function loop(t){requestAnimationFrame(loop);const dt=Math.max(0,Math.min(.05,(t-last)/1000));last=t;try{tick(dt);}catch(e){console.error(e);}}
addEventListener('resize',resize);resize();
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else returnFlow(false);});setInterval(save,5000);
syncCats(false);cats.forEach(c=>{c.timer=Math.random()*2;});
if(!S.seen){S.seen=true;}
returnFlow(false);drawHud();dayLabel();
window.GAME={plotRect:id=>plotRect(PLOTS.find(q=>q.id===id)),cap:t=>{const e=$('#cap');e.textContent=t||'';e.classList.toggle('on',!!t);},focusPlot,S,cam,cats,PLOTS,flyTo,openSheet,closeSheet,tick,advanceClock:ms=>{vNow+=ms;},setTod:m=>{todOverride=m;skyKey='';},build:id=>{const p=PLOTS.find(q=>q.id===id);openSheet(p);$('#sh-btn').click();},
 finish:id=>{const P=S.plots[id];if(P.job)P.job.start-=P.job.dur;},returnFlow,toast,showDiary,makeDiary,save,lv,clampCam,setFish:v=>{S.fish=v;},burst,art,prosperity,syncCats};
if(!REC)requestAnimationFrame(loop);else document.body.classList.add('rec');
})();
