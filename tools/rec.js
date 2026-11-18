// rec.js — deterministic headless capture of the demo (virtual clock), frames -> MP4
const {chromium}=require('playwright-core');const fs=require('fs');const {execSync}=require('child_process');
const FPS=30,OUT='/workspace/idle-town/out',FR='/tmp/itframes';
(async()=>{fs.rmSync(FR,{recursive:true,force:true});fs.mkdirSync(FR,{recursive:true});
const b=await chromium.launch({executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///workspace/idle-town/index.html?rec&fresh');await p.waitForTimeout(400);
await p.evaluate(()=>{
 const G=GAME;G.setTod('day');window.FINGERS=null;
 const ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;const lerp=(a,b,k)=>a+(b-a)*k;
 // timeline: [duration, fn(k, t, dt)]
 const TL=[];const seg=(d,f,init)=>TL.push({d,f,init});
 const camTween=(d,to,fingers)=>{let fr;seg(d,(k)=>{const e=ease(k);G.cam.x=lerp(fr.x,to.x,e);G.cam.y=lerp(fr.y,to.y,e);G.cam.z=lerp(fr.z,to.z,e);G.clampCam();
   if(fingers==='drag'){const dy=(fr.y-to.y)*G.cam.z;window.FINGERS=k<.98?[[230,420+(e-.5)*Math.max(-300,Math.min(300,dy*.5))]]:null;}
   else if(fingers==='pinch'){const s=60+e*90;window.FINGERS=k<.98?[[195-s*.7,430-s],[195+s*.7,430+s]]:null;}
   else window.FINGERS=null;},()=>{fr={x:G.cam.x,y:G.cam.y,z:G.cam.z};});};
 const wait=(d,f)=>seg(d,f||(()=>{}));
 const plot=id=>G.PLOTS.find(p=>p.id===id);
 const centre=(id,z)=>{const r=G.plotRect(id);return {x:(r.x0+r.x1)/2,y:(r.y0+r.y1)/2+4,z};};
 const buildRun=(id,vidSec,z)=>{
   seg(.9,()=>{window.FINGERS=[[195,792]];},()=>{G.setFish(99999);G.openSheet(plot(id));const c=centre(id,z||3);G.flyTo(c.x,c.y+844*.2/c.z,c.z,.5);});
   seg(vidSec,(k,t,dt)=>{window.FINGERS=null;const j=G.S.plots[id].job;if(j)G.advanceClock(j.dur/vidSec*dt*1000);},()=>{G.build(id);G.closeSheet();const c=centre(id,z||3);G.flyTo(c.x,c.y,c.z,.6);});
   seg(1.5,()=>{});};
 // ---- 1. empty valley overview, drag down to the plaza
 seg(0,()=>{},()=>{G.cam.z=1.08;G.cam.x=180;G.cam.y=400;G.clampCam();G.cap('一座空空的山谷');});
 wait(1.6);
 camTween(2.6,{x:180,y:640,z:1.08},'drag');
 seg(0,()=>{},()=>G.cap('双指放大：看到的就是真实的地块'));
 camTween(2,{x:168,y:500,z:3},'pinch');
 // tap the empty plaza plot
 seg(.7,()=>{window.FINGERS=[[195,430]];},()=>{G.cap('点一下空地，盖第一样东西');});
 seg(0,()=>{},()=>G.cap('点「开工建造」→ 篝火点起来了'));
 buildRun('hall',2.2,3.4);
 seg(0,()=>{},()=>{G.closeSheet();G.cap('几天后…  钟楼广场长大了');G.S.plots.hall.lv=3;G.S.plots.inn.lv=2;G.S.plots.yarn.lv=1;G.S.plots.fishery.lv=1;G.syncCats(false);});
 wait(1.6);
 // ---- 2. bakery: all five levels
 seg(0,()=>{},()=>{G.cap('面包房：一级一级长起来');});
 camTween(1.5,{x:110,y:715,z:3.1},'drag');
 for(let L=1;L<=5;L++){seg(0,()=>{},()=>{G.cap('面包房 Lv'+L+' · '+BUILDINGS.bakery.desc[L-1]);if(L>=4)G.S.plots.hall.lv=Math.max(G.S.plots.hall.lv,L-1);});buildRun('bakery',L===1?1.6:2.0,3.1);}
 // ---- 3. the whole town
 seg(0,()=>{},()=>{G.cap('整个山谷都在慢慢变热闹');G.S.plots.hall.lv=5;G.S.plots.fishery.lv=5;G.S.plots.yarn.lv=4;G.S.plots.inn.lv=5;G.syncCats(false);});
 camTween(2.4,{x:180,y:620,z:1.25},'pinch');
 camTween(3,{x:180,y:330,z:1.25},'drag');
 // ---- 4. night
 seg(0,()=>{},()=>{G.setTod('dusk');G.cap('傍晚…');});
 camTween(2,{x:150,y:330,z:2.6},'pinch');
 seg(0,()=>{},()=>{G.setTod('night');G.cap('天黑了，窗子一盏盏亮起来');});
 wait(1.4);
 camTween(3.2,{x:190,y:740,z:2.4},'drag');
 wait(1.2);
 // ---- 5. away diary
 seg(0,()=>{},()=>{G.cap('离开 3 小时后再打开…');G.setTod('day');});
 wait(1.2);
 seg(0,()=>{},()=>{G.cap('');G.S.last-=3*3600e3;G.returnFlow(true);});
 wait(5.5);
 seg(0,()=>{},()=>{document.getElementById('dy-ok').click();G.cap('篮子满了——接着盖吧');});
 camTween(2.4,{x:170,y:560,z:1.6});
 wait(.6);
 window.__TL=TL;window.__seg=0;window.__t=0;window.__inited=false;
 window.__frame=(dt)=>{const s=TL[window.__seg];if(!s)return false;if(!window.__inited){window.__inited=true;s.init&&s.init();}
  const k=s.d?Math.min(1,window.__t/s.d):1;s.f(k,window.__t,dt);G.advanceClock(dt*1000);G.tick(dt);window.__t+=dt;
  if(window.__t>=s.d){window.__seg++;window.__t=0;window.__inited=false;}return true;};
});
let n=0;while(true){const ok=await p.evaluate(dt=>{let r=window.__frame(dt);while(r&&window.__TL[window.__seg]&&window.__TL[window.__seg].d===0)r=window.__frame(0);return r;},1/FPS);if(!ok)break;
 await p.screenshot({path:`${FR}/f${String(n).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});n++;if(n%150===0)console.log('frame',n);}
await b.close();console.log('frames',n);
execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${FR}/f%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium -movflags +faststart ${OUT}/idle_town_demo.mp4`);
console.log('done');})();
