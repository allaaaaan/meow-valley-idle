const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome'});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.stack));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file:///workspace/idle-town/dist/idle-town.html?fresh');await p.waitForTimeout(800);
const cam0=await p.evaluate(()=>({...GAME.cam}));
await p.mouse.move(200,500);await p.mouse.down();await p.mouse.move(200,300,{steps:8});await p.mouse.up();await p.waitForTimeout(300);
const cam1=await p.evaluate(()=>({...GAME.cam}));
await p.mouse.wheel(0,-400);await p.waitForTimeout(300);const cam2=await p.evaluate(()=>({...GAME.cam}));
// tap on the hall plot: compute screen pos
await p.evaluate(()=>{GAME.cam.x=166;GAME.cam.y=500;GAME.cam.z=2.5;GAME.clampCam();});await p.waitForTimeout(100);
const pos=await p.evaluate(()=>{const r=GAME.plotRect('hall');const c=GAME.cam;return [(166-c.x)*c.z+195,((r.y0+r.y1)/2-c.y)*c.z+422];});
await p.mouse.click(pos[0],pos[1]);await p.waitForTimeout(900);
const open=await p.evaluate(()=>document.getElementById('sheet').classList.contains('open')+' '+document.getElementById('sh-btn').textContent);
await p.click('#sh-btn');await p.waitForTimeout(500);const job=await p.evaluate(()=>JSON.stringify(GAME.S.plots.hall));
await p.screenshot({path:'out/interact_build.png'});
await p.click('#dbg-btn');await p.click('#d-ff');await p.waitForTimeout(1500);const after=await p.evaluate(()=>JSON.stringify(GAME.S.plots.hall)+' cats:'+GAME.cats.length);
await p.screenshot({path:'out/interact_done.png'});
// reload -> persistence
await p.goto('file:///workspace/idle-town/dist/idle-town.html');await p.waitForTimeout(600);const persist=await p.evaluate(()=>GAME.S.plots.hall.lv);
console.log(JSON.stringify({cam0,cam1,cam2,open,job,after,persist,errs},null,1));await b.close();})();
