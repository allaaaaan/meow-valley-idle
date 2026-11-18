// fx.js — decor sprites + animated effects (flags, smoke, fire, sails, sparkles, scaffolds, sky, clouds, vignettes).
(function(R){
const {Spr,C,PAL,hash,bay}=R.PIX;
const P=i=>PAL[i];
function px(g,x,y,c){g.fillStyle=P(c);g.fillRect(Math.round(x),Math.round(y),1,1);}
function rect(g,x,y,w,h,c){g.fillStyle=P(c);g.fillRect(Math.round(x),Math.round(y),w,h);}
function line(g,x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;g.fillStyle=P(c);
 for(let n=0;n<400;n++){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
// ---------- decor sprites (anchor bottom-center) ----------
function mk(w,h,fn){const s=new Spr(w,h);const lit=new Spr(w,h);fn(s,lit);s.outline(0);return {cv:s.toCanvas(),lit:lit.toCanvas(),w,h,spr:s};}
const DEC={};
DEC.tree=mk(24,30,(s)=>{s.rect(10,20,4,9,(i)=>i===0?C.WD2:i===3?C.WD0:C.WD1);
 [[12,12,9,8],[7,16,6,5],[17,16,6,5],[12,7,6,5]].forEach(([x,y,rx,ry])=>s.ell(x,y,rx,ry,(u,v,X,Y)=>{const l=-u*.6-v*.8+(hash(X,Y,3)-.5)*.5;return l>.55?C.GR3:l>-.1?C.GR2:l>-.6?C.GR1:C.GR0;}));
 s.set(9,9,C.WHITE);s.set(15,14,C.RD2);s.set(8,17,C.RD2);});
DEC.cherry=mk(24,30,(s)=>{s.rect(10,20,4,9,(i)=>i===0?C.WD2:i===3?C.WD0:C.WD1);s.line(12,20,7,15,C.WD1);
 [[12,12,9,8],[7,16,6,5],[17,16,6,5],[12,7,6,5]].forEach(([x,y,rx,ry])=>s.ell(x,y,rx,ry,(u,v,X,Y)=>{const l=-u*.6-v*.8+(hash(X,Y,4)-.5)*.5;return l>.55?C.WHITE:l>-.1?C.LPNK:l>-.6?C.PINK:C.RD1;}));});
DEC.bush=mk(16,12,(s)=>{s.ell(8,7,7,5,(u,v,X,Y)=>{const l=-u*.6-v*.8+(hash(X,Y,2)-.5)*.4;return l>.4?C.GR3:l>-.3?C.GR2:C.GR1;});s.set(5,5,C.PINK);s.set(10,4,C.WHITE);s.set(12,7,C.PINK);});
DEC.flowers=mk(20,8,(s)=>{for(let k=0;k<14;k++){const x=1+Math.floor(hash(k,1,8)*18),y=2+Math.floor(hash(k,2,8)*5);s.set(x,y+1,C.GR1);s.set(x,y,[C.PINK,C.GOLD,C.WHITE,C.PU2,C.RD2][k%5]);}});
DEC.rock=mk(14,9,(s)=>{s.ell(7,5,6,4,(u,v)=>{const l=-u*.6-v*.8;return l>.4?C.ST2:l>-.3?C.ST1:C.ST0;});s.set(4,6,C.GR1);s.set(5,7,C.GR2);});
DEC.lamp=mk(7,20,(s,l)=>{s.vl(3,6,13,C.ST0);s.hl(2,18,3,C.ST0);s.rect(1,2,5,4,C.GOLD);s.set(2,3,C.WARM);s.hl(1,1,5,C.INK);s.set(3,0,C.INK);s.hl(1,6,5,C.ST0);
 for(let y=2;y<6;y++)for(let x=1;x<6;x++)l.set(x,y,y===3&&x===2?C.WHITE:C.GOLD);});
DEC.bench=mk(12,8,(s)=>{s.hl(1,3,10,C.WD2);s.hl(1,4,10,C.WD0);s.vl(2,5,2,C.WD0);s.vl(9,5,2,C.WD0);s.hl(1,0,10,C.WD1);s.vl(1,1,2,C.WD0);s.vl(10,1,2,C.WD0);});
DEC.sign=mk(14,14,(s)=>{s.vl(6,6,8,C.WD0);s.rect(1,2,12,5,C.WD2);s.hl(1,2,12,C.WD3);s.set(11,4,C.INK);s.set(10,3,C.INK);s.set(10,5,C.INK);s.hl(3,4,6,C.WD0);});
DEC.gate=mk(56,40,(s)=>{for(const x of [6,44]){s.rect(x,8,6,31,(i,j)=>j%4===3?C.ST0:i===0?C.ST2:i===5?C.ST0:C.ST1);s.rect(x-1,6,8,3,C.ST2);}
 s.rect(4,4,48,4,(i,j)=>j===0?C.WD3:j===3?C.WD0:C.WD2);s.poly([[2,5],[54,5],[50,0],[6,0]],(x,y)=>y<2?C.RD2:C.RD1);s.rect(20,9,16,6,C.WD2);s.hl(20,9,16,C.WD3);
 [[23,11,C.INK],[24,11,C.INK],[31,11,C.INK],[32,11,C.INK],[27,12,C.PINK],[28,12,C.PINK]].forEach(([x,y,c])=>s.set(x,y,c));
 s.ell(13,7,1.5,1.5,C.GOLD);s.ell(44,7,1.5,1.5,C.GOLD);
 for(let x=12;x<44;x+=4){s.set(x,9,C.GR2);s.set(x+1,10,C.PINK);}});
DEC.fountain=mk(30,18,(s)=>{s.ell(15,12,14,5,(u,v,x,y,d)=>d>.6?(v<0?C.ST2:C.ST1):C.BL1);s.ell(15,11,9,3,(u,v)=>v<-.3?C.BL2:C.BL1);s.rect(13,4,4,8,(i)=>i===0?C.ST2:i===3?C.ST0:C.ST1);s.ell(15,4,5,2,C.ST2);});
DEC.scarecrow=mk(16,24,(s)=>{s.vl(8,8,15,C.WD1);s.hl(2,11,13,C.WD1);s.rect(5,10,7,7,C.BL1);s.vl(5,10,7,C.BL2);s.ell(8,6,3.5,3.5,C.CREAM);s.poly([[3,4],[13,4],[8,-1]],C.GOLD);s.set(7,6,C.INK);s.set(10,6,C.INK);s.set(2,12,C.GOLD);s.set(14,12,C.GOLD);});
DEC.cart=mk(22,14,(s)=>{s.rect(2,3,16,6,(i,j)=>j===0?C.WD3:j===5?C.WD0:C.WD2);s.ell(6,10,3,3,(u,v,x,y,d)=>d>.4?C.WD0:C.WD1);s.ell(15,10,3,3,(u,v,x,y,d)=>d>.4?C.WD0:C.WD1);s.line(18,5,21,9,C.WD1);
 for(let i=0;i<5;i++)s.ell(5+i*3,2,1.8,1.8,i%2?C.ORNG:C.GOLD);});
// ---------- animated bits ----------
function flag(g,x,y,col,t){const ph=Math.floor(t*6)%3;const shape=[[0,0,0,0,0,0],[0,0,1,1,0,0],[0,1,1,0,0,-1]][ph];
 for(let i=0;i<6;i++){const dy=shape[i];rect(g,x+i,y+dy,1,4,col);px(g,x+i,y+dy,col===C.RD1?C.RD2:col===C.BL1?C.BL2:C.WARM);px(g,x+i,y+dy+4,C.INK);px(g,x+i,y+dy-1,C.INK);}rect(g,x+6,y+shape[5],1,4,C.INK);}
function fire(g,x,y,t){const f=Math.floor(t*10)%4;const h=[5,6,4,6][f];for(let j=0;j<h;j++){const w=Math.max(0,Math.round((h-j)/2));for(let i=-w;i<=w;i++){const c=j<2?C.ORNG:j<h-2?C.GOLD:C.WARM;px(g,x+i+((j>2&&f%2)?1:0),y-j,Math.abs(i)===w?C.RD1:c);}}px(g,x+(f%2?2:-2),y-h-1,C.GOLD);}
function sails(g,cx,cy,r,a){for(let k=0;k<4;k++){const an=a+k*Math.PI/2,ca=Math.cos(an),sa=Math.sin(an);line(g,cx,cy,cx+ca*r,cy+sa*r,C.WD0);
  for(let d=5;d<r;d+=1){const ox=cx+ca*d,oy=cy+sa*d;const nx=-sa,ny=ca;for(let w=1;w<5;w++){px(g,ox+nx*w,oy+ny*w,(d%4===0||w===4)?C.WD1:(w<2?C.WARM:C.CREAM));}}}
 rect(g,cx-1,cy-1,3,3,C.WD0);px(g,cx,cy,C.GOLD);}
function sparkle(g,x,y,f){const s=[[0],[1],[2],[1]][f%4][0];px(g,x,y,C.WHITE);for(let i=1;i<=s+1;i++){px(g,x+i,y,C.GOLD);px(g,x-i,y,C.GOLD);px(g,x,y+i,C.GOLD);px(g,x,y-i,C.GOLD);}}
function scaffold(g,x0,y0,x1,y1,t){// poles + planks + rope; drawn over a construction
 for(let x=x0;x<=x1;x+=Math.max(10,Math.floor((x1-x0)/4))){rect(g,x,y0,1,y1-y0,C.WD1);px(g,x,y0-1,C.WD3);}rect(g,x1,y0,1,y1-y0,C.WD1);
 for(let y=y1-8;y>y0;y-=12){rect(g,x0-2,y,x1-x0+5,2,C.WD2);rect(g,x0-2,y+1,x1-x0+5,1,C.WD0);}
 for(let x=x0;x<x1;x+=12)line(g,x,y1,x+10,Math.max(y0,y1-24),C.WD0);}
function hpx(g,x,y,c){px(g,x,y,c);}
// cloud sprite
function cloudSpr(seed){return mk(34,14,(s)=>{for(let k=0;k<5;k++){const cx=6+k*5+hash(k,seed,1)*3,cy=8-Math.sin(k/4*Math.PI)*3,r=3+hash(k,seed,2)*3;s.ell(cx,cy,r+1,r*.8,(u,v)=>v<-.3?C.WHITE:v<.4?C.WARM:C.BL2);}s.d=s.d.map((c,i)=>c);});}
const CLOUDS=[cloudSpr(1),cloudSpr(2),cloudSpr(3)];
CLOUDS.forEach(c=>{const s=c.spr;for(let i=0;i<s.d.length;i++)if(s.d[i]===0)s.d[i]=C.BL2;c.cv=s.toCanvas();});
// sky: banded gradient within the palette, stepped by time of day
function sky(g,W,H,tod,t){// tod: {dark:0..1, dusk:0..1}
 const day=[C.BL2,C.BL2,C.BL1],dusk=[C.PU1,C.RD2,C.ORNG,C.PEACH],night=[C.INK,C.NV,C.NV,C.PU0];
 const bands=tod.dark>.55?night:tod.dusk>.4?dusk:day;const n=bands.length;
 for(let y=0;y<H;y++){const f=y/H*(n-1);const i=Math.floor(f),fr=f-i;for(let x=0;x<W;x+=1){}
  const c0=bands[i],c1=bands[Math.min(n-1,i+1)];
  for(let x=0;x<W;x++){g.fillStyle=P(bay(x,y)<fr?c1:c0);g.fillRect(x,y,1,1);}}
}
// ---------- diary vignettes ----------
function vignette(kind,cat,coat2){const cv=document.createElement('canvas');cv.width=72;cv.height=44;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
 const nightK=['moon','stars','firefly'].includes(kind),rain=kind==='rain';
 for(let y=0;y<44;y++)for(let x=0;x<72;x++){const f=y/30;let c=nightK?(bay(x,y)<f?C.NV:C.INK):rain?(bay(x,y)<f?C.ST1:C.ST0):(bay(x,y)<f?C.BL2:C.BL1);if(y>=32)c=(hash(x,y,1)<.1)?C.GR1:(y===32?C.GR3:C.GR2);if(nightK&&y>=32)c=y===32?C.GR1:C.GR0;g.fillStyle=P(c);g.fillRect(x,y,1,1);}
 if(nightK){for(let k=0;k<14;k++)px(g,hash(k,1,1)*72,hash(k,2,1)*28,k%3?C.WHITE:C.GOLD);g.fillStyle=P(C.WARM);g.beginPath();g.arc(56,10,6,0,7);g.fill();g.fillStyle=P(C.INK);g.beginPath();g.arc(59,8,5,0,7);g.fill();}
 else if(!rain){g.drawImage(CLOUDS[0].cv,6,3);g.fillStyle=P(C.GOLD);g.fillRect(58,5,7,7);px(g,58,5,C.BL1);px(g,64,5,C.BL1);px(g,58,11,C.BL1);px(g,64,11,C.BL1);}
 const F=R.CATS.frames(cat);let pose=F.sit[0][0];
 if(kind==='sleep')pose=F.sleep[0][0];if(kind==='walk'||kind==='visitor')pose=F.walk[1][0];
 const prop={bread:()=>{rect(g,44,26,9,5,C.WD0);rect(g,45,25,7,4,C.ORNG);rect(g,46,25,3,1,C.CREAM);px(g,49,22,C.WHITE);px(g,50,20,C.WHITE);px(g,48,18,C.WHITE);},
  fish:()=>{rect(g,42,24,10,4,C.BL1);rect(g,43,24,7,1,C.BL2);rect(g,52,23,2,6,C.BL0);px(g,44,25,C.INK);line(g,30,8,40,22,C.WD1);},
  yarn:()=>{g.fillStyle=P(C.PINK);g.beginPath();g.arc(46,27,4,0,7);g.fill();line(g,43,25,49,29,C.LPNK);line(g,46,31,60,33,C.PINK);rect(g,24,21,3,9,C.GOLD);},
  moon:()=>{rect(g,8,8,12,24,C.ST0);rect(g,8,8,12,2,C.ST2);for(let y=12;y<30;y+=4)rect(g,12,y,3,2,C.GOLD);},
  flower:()=>{for(let k=0;k<6;k++){px(g,40+k*4,31,C.GR1);px(g,40+k*4,30,[C.PINK,C.GOLD,C.WHITE][k%3]);}},
  visitor:()=>{},rain:()=>{for(let k=0;k<40;k++)px(g,hash(k,3,2)*72,hash(k,4,2)*30,C.BL2);rect(g,10,18,30,3,C.RD1);rect(g,10,21,30,1,C.RD0);},
  sleep:()=>{px(g,44,14,C.WHITE);rect(g,44,10,3,1,C.WHITE);rect(g,46,8,3,1,C.WHITE);},
  build:()=>{rect(g,44,12,20,20,C.WD2);rect(g,44,12,20,2,C.WD3);line(g,44,12,54,4,C.RD1);line(g,54,4,64,12,C.RD1);rect(g,52,24,4,8,C.WD0);},
  firefly:()=>{for(let k=0;k<7;k++){px(g,30+hash(k,5,1)*40,14+hash(k,6,1)*16,C.GOLD);}},
  music:()=>{rect(g,46,14,1,6,C.INK);rect(g,46,14,3,1,C.INK);rect(g,44,19,3,2,C.INK);rect(g,54,10,1,6,C.INK);rect(g,52,15,3,2,C.INK);},
  heart:()=>{const hp=[[1,0],[2,0],[4,0],[5,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[1,2],[2,2],[3,2],[4,2],[5,2],[2,3],[3,3],[4,3],[3,4]];hp.forEach(([x,y])=>px(g,40+x,12+y,C.PINK));}};
 (prop[kind]||(()=>{}))();
 const ay=32-(R.CATS.AY||21);g.drawImage(pose,kind==='visitor'?28:8,ay);
 if(coat2){g.drawImage(R.CATS.frames(coat2).sit[1][1],kind==='heart'?40:32,ay);}
 return cv;}
R.FX={px,rect,line,DEC,flag,fire,sails,sparkle,scaffold,sky,CLOUDS,vignette,mk};
})(typeof window!=='undefined'?window:globalThis);
