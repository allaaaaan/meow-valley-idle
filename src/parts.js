// parts.js — the parts library. Every building is assembled from these, so the look stays consistent.
// Oblique 3/4 view: front face toward the viewer, side face to the right going up-right (depth d -> dx=d, dy=-d/2).
(function(R){
const {Spr,C,hash,bay}=R.PIX;
const W=128,H=128,GY=120;
// materials: f = front ramp [dark,base,light], s = side ramp, m = mortar/seam
const MAT={
 wood:{f:[3,4,5],s:[2,3,3],m:2,tex:'plankH'},
 woodV:{f:[3,4,5],s:[2,3,3],m:2,tex:'plankV'},
 darkwood:{f:[2,3,4],s:[1,2,2],m:1,tex:'plankH'},
 blue:{f:[13,14,15],s:[12,13,13],m:12,tex:'plankH'},
 plaster:{f:[5,6,7],s:[4,5,5],m:5,tex:'plaster'},
 pink:{f:[11,29,7],s:[10,11,11],m:10,tex:'plaster'},
 lilac:{f:[24,25,29],s:[23,24,24],m:23,tex:'plaster'},
 brick:{f:[8,9,10],s:[1,8,8],m:11,tex:'brick'},
 stone:{f:[20,21,22],s:[1,20,20],m:20,tex:'stone'},
 sand:{f:[4,30,7],s:[3,4,4],m:4,tex:'stone'},
 cardboard:{f:[4,5,6],s:[3,4,4],m:3,tex:'card'},
};
const ROOF={red:[8,9,10],blue:[12,13,14],purple:[23,24,25],green:[16,17,18],straw:[3,5,6],shingle:[2,3,4],teal:[16,13,14],gold:[27,26,7],slate:[1,20,21]};
function texel(m,face,x,y,rowOff){const r=face==='s'?m.s:m.f;const h=hash(x,y,7);
 switch(m.tex){
  case 'plankH':{const yy=y+(rowOff||0);if(yy%4===3)return m.m;if(yy%4===0&&face==='f')return h<.6?r[2]:r[1];if(h<.04)return r[0];return r[1];}
  case 'plankV':{if(x%4===3)return m.m;if(x%4===0&&face==='f')return r[2];if(h<.04)return r[0];return r[1];}
  case 'brick':{const yy=y+(rowOff||0);const row=Math.floor(yy/3);if(yy%3===2)return m.m;if((x+(row%2)*3)%6===5)return m.m;const b=hash(Math.floor((x+(row%2)*3)/6),row,3);return b<.2?r[0]:b>.85&&face==='f'?r[2]:r[1];}
  case 'stone':{const yy=y+(rowOff||0);const row=Math.floor(yy/4);if(yy%4===3)return m.m;const off=Math.floor(hash(row,1,9)*6);const bw=6+((row*3)%3);if((x+off)%bw===bw-1)return m.m;if(yy%4===0&&(x+off)%bw===0&&face==='f')return r[2];return hash(Math.floor((x+off)/bw),row,4)<.25?r[0]:r[1];}
  case 'card':{if(y%7===6&&x%5<3)return r[0];return r[1];}
  default:{return r[1];}
 }}
class Bld{
 constructor(){this.s=new Spr(W,H);this.lit=new Spr(W,H);this.meta={lights:[],smoke:[],flags:[],doors:[],lamps:[],spin:null,beacon:null,sleep:null};this.post=[];}
 // ---------------- walls ----------------
 wall(x,yT,w,h,d,m,o){o=o||{};const s=this.s,yB=yT+h-1,dd=d|0;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){let c=texel(m,'f',i+(o.tx||0),j);
   if(j<2&&!o.noAO)c=m.f[0];            // shadow under the eaves
   if(j===h-1)c=m.f[0];                  // ground contact
   if(i===0&&j>1&&m.tex==='plaster')c=m.f[2]; // lit left edge
   s.set(x+i,yT+j,c);}
  for(let i=0;i<dd;i++){const off=Math.floor((i+1)/2);for(let j=0;j<h;j++){let c=texel(m,'s',i,j+off,0);if(j<2&&!o.noAO)c=m.s[0];if(i===dd-1&&j<h)c=m.s[0];s.set(x+w+i,yT+j-off,c);}}
  // corner highlight between faces
  s.vl(x+w,yT,h,m.f[2]===7?m.f[1]:m.f[2]);
  return this;}
 // timber frame over a front face
 timber(x,yT,w,h,col){col=col==null?C.WD0:col;const s=this.s;s.hl(x,yT+1,w,col);s.hl(x,yT+h-2,w,col);s.vl(x,yT+1,h-2,col);s.vl(x+w-1,yT+1,h-2,col);
  for(let i=6;i<w-3;i+=Math.max(6,Math.floor(w/4)))s.vl(x+i,yT+1,h-2,col);return this;}
 // ---------------- roofs ----------------
 // side-gable roof: big lit roof plane facing us, gable triangle on the right side
 roofSide(x,yT,w,d,rh,rc,wm,o){o=o||{};const s=this.s,oh=o.oh==null?2:o.oh;const ry=yT-Math.floor(d/4)-rh;const dx=Math.floor(d/2);
  // gable triangle on the side
  const g=[[x+w,yT+1],[x+w+d,yT+1-Math.floor(d/2)],[x+w+dx,ry]];
  s.poly(g,(px,py)=>texel(wm,'s',px,py));
  // front roof plane
  const P=[[x-oh,yT+2],[x+w+1,yT+2],[x+w+dx+1,ry],[x-oh+dx,ry]];
  const top=ry,bot=yT+2;
  s.poly(P,(px,py)=>{const t=(py-top)/(bot-top+.01);const row=Math.floor((bot-py)/3);const yy=(bot-py)%3;
   const off=(row%2)*2;
   if(py>=bot-1)return rc[0];
   if(yy===0)return rc[0];
   if((px+off)%4===0&&yy===1)return rc[0];
   if(t<.3)return yy===2?rc[2]:rc[2];
   return yy===2?rc[2]:rc[1];});
  // ridge cap + edge boards
  s.line(x-oh+dx,ry,x+w+dx+1,ry,rc[2]);s.line(x-oh+dx,ry-1,x+w+dx,ry-1,rc[1]);
  s.line(x+w+1,yT+2,x+w+dx+1,ry,rc[0]);s.line(x+w+2,yT+2,x+w+dx+2,ry,rc[1]);
  s.line(x+w+dx+2,ry,x+w+d+1,yT+1-Math.floor(d/2),rc[1]);
  this.roofTop=ry-1;return this;}
 // front-gable roof: gable triangle faces us, roof plane on the right
 roofFront(x,yT,w,d,rh,rc,wm,o){o=o||{};const s=this.s,oh=o.oh==null?2:o.oh;const ax=x+(w-1)/2,ay=yT-rh;
  const tri=[[x,yT+1],[x+w,yT+1],[ax+.5,ay+1]];
  s.poly(tri,(px,py)=>{let c=texel(wm,'f',px,py);if(py>=yT-1)c=wm.f[0];return c;});
  // right roof plane
  const P=[[ax+.5,ay],[x+w+oh,yT+2],[x+w+oh+d,yT+2-d/2],[ax+.5+d,ay-d/2]];
  s.poly(P,(px,py)=>{const k=(px-ax);const yy=Math.floor(py+ (px-ax)*.5);const r=yy%3;if(r===0)return rc[0];return (px+Math.floor(yy/3)*2)%5===0?rc[0]:rc[1];});
  // barge boards (thick, lit on the left slope)
  for(let t=0;t<3;t++){s.line(ax,ay+t,x-oh,yT+2+t-1,t===0?rc[2]:t===1?rc[1]:rc[0]);s.line(ax+1,ay+t,x+w+oh,yT+2+t-1,t===0?rc[1]:rc[0]);}
  s.line(ax+.5,ay-1,ax+.5+d,ay-1-d/2,rc[2]);
  this.roofTop=ay-d/2-1;return this;}
 cone(cx,yB,rw,rh,rc,o){o=o||{};const s=this.s;s.poly([[cx-rw,yB],[cx+rw+1,yB],[cx+.5,yB-rh]],(px,py)=>{const t=(px-cx)/rw;const stripe=o.stripe!=null&&Math.floor((px-cx+rw*3+ (py-yB)*0)/3)%2===0;
   let c=t<-.3?rc[2]:t<.35?rc[1]:rc[0];if(stripe)c=o.stripe[t<-.3?2:t<.35?1:0];if(py>=yB-1)c=rc[0];return c;});return this;}
 dome(cx,yB,rx,ry,rc){this.s.ell(cx,yB,rx,ry,(u,v)=>{if(v>0)return -1;const l=-u*.6-v*.7;return l>.45?rc[2]:l>-.2?rc[1]:rc[0];});return this;}
 // flat thatch / plank lid
 thatch(x,y,w,h,rc){const s=this.s;s.rect(x,y,w,h,(i,j)=>{if(j===h-1)return rc[0];const h2=hash(x+i,j,11);return (i%2===0&&h2<.5)?rc[0]:j<2?rc[2]:rc[1];});for(let i=0;i<w;i+=2)s.set(x+i,y+h,rc[0]);return this;}
 awning(x,y,w,h,c1,c2,o){o=o||{};const s=this.s;for(let i=0;i<w;i++){const band=Math.floor(i/3)%2===0;const c=band?c1:c2;for(let j=0;j<h;j++){let cc=c;if(j===0)cc=band?C.WHITE:c2;if(j===h-1&&i%3===1)cc=-1;s.set(x+i,y+j+(o.slope?Math.floor(j*0):0),cc);} s.set(x+i,y+h,i%3===1?(band?c1:c2):-1);}return this;}
 // ---------------- openings ----------------
 window(x,y,w,h,o){o=o||{};const s=this.s,L=this.lit;const fr=o.frame==null?C.WD1:o.frame;
  s.rect(x-1,y-1,w+2,h+2,fr);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(o.round){const u=(i+.5-w/2)/(w/2),v=(j+.5-h/2)/(h/2);if(u*u+v*v>1.05)continue;}
   if(o.arch&&j<2&&(i===0||i===w-1))continue;
   let c=(i+j<3)?C.BL2:(i+j>w+h-4)?C.BL0:C.BL1;const mull=(o.cross!==false)&&(i===Math.floor(w/2)||(h>3&&j===Math.floor(h/2)));
   if(mull)c=fr;s.set(x+i,y+j,c);
   if(!mull)L.glow(x+i,y+j,(i+j<2)?C.WARM:j>h-2?C.ORNG:C.GOLD);}
  if(o.arch){s.set(x-1,y-1,-1);s.set(x+w,y-1,-1);s.set(x,y-1,fr);s.set(x+w-1,y-1,fr);}
  if(o.round){s.set(x-1,y-1,-1);s.set(x+w,y-1,-1);s.set(x-1,y+h,-1);s.set(x+w,y+h,-1);}
  if(!o.noSill&&!o.round){s.hl(x-2,y+h+1,w+4,C.WARM);s.hl(x-2,y+h+2,w+4,C.WD0);}
  if(o.shutters!=null){s.rect(x-4,y-1,2,h+2,o.shutters);s.rect(x+w+2,y-1,2,h+2,o.shutters);s.vl(x-4,y-1,h+2,C.INK);s.vl(x+w+3,y-1,h+2,C.INK);}
  if(o.box)this.flowerBox(x-2,y+h+2,w+4);
  this.meta.lights.push([x,y,w,h]);return this;}
 door(x,y,w,h,o){o=o||{};const s=this.s;const col=o.col||[C.WD0,C.WD1,C.WD2];
  s.rect(x-1,y-1,w+2,h+1,C.INK);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(o.arch&&j<2&&(i===0||i===w-1)&&!(j===1&&w<5))continue;let c=i%3===2?col[0]:(i===0?col[2]:col[1]);if(j===0&&o.arch)c=col[2];s.set(x+i,y+j,c);}
  if(o.arch){s.set(x-1,y-1,-1);s.set(x+w,y-1,-1);s.set(x,y-1,C.INK);s.set(x+w-1,y-1,C.INK);s.set(x-1,y,C.INK);s.set(x+w,y,C.INK);}
  if(o.round){s.ell(x+w/2,y+h,w/2+.3,h,(u,v)=>v<0?(Math.abs(u)>.85?C.INK:C.DEEP):-1);this.lit.ell(x+w/2,y+h,w/2-.7,h-1,(u,v)=>v<0?C.ORNG:-1);}
  else s.set(x+w-2,y+Math.floor(h/2),C.GOLD);
  if(o.win&&!o.round){for(let i=1;i<w-1;i++){s.set(x+i,y+2,C.BL1);this.lit.glow(x+i,y+2,C.GOLD);}}
  if(!o.noStep){s.hl(x-2,y+h,w+4,C.ST2);s.hl(x-2,y+h+1,w+4,C.ST0);}
  this.meta.doors.push([x+w/2,y+h+1]);return this;}
 chimney(x,yB,h,o){o=o||{};const s=this.s;const m=MAT[o.mat||'brick'];
  for(let j=0;j<h;j++)for(let i=0;i<4;i++)s.set(x+i,yB-j,i===3?m.f[0]:texel(m,'f',i,j));
  s.rect(x-1,yB-h-1,6,2,C.ST1);s.hl(x-1,yB-h-1,6,C.ST2);
  this.meta.smoke.push([x+2,yB-h-2]);return this;}
 sign(x,y,icon,o){o=o||{};const s=this.s;// bracket + hanging board
  s.hl(x-1,y,9,C.INK);s.set(x+1,y+1,C.INK);s.set(x+6,y+1,C.INK);
  s.rect(x,y+2,8,7,C.WD2);s.hl(x,y+2,8,C.WD3);s.hl(x,y+8,8,C.WD1);this.icon(x+1,y+3,icon);return this;}
 icon(x,y,k){const s=this.s;const P={
   bread:['.aaaa.','abbbba','abcbcb','.bbbb.'],
   fish:['..a...','.bbbab','bcbbbb','.bbbab'],
   yarn:['.aaa..','abcba.','acbca.','.aaa.d'],
   bed:['a.....','abbbbb','accccc','a....a'],
   bell:['..a...','.bbb..','.bcb..','bbbbb.'],
   heart:['ab.ab.','aaaaa.','.aaa..','..a...']}[k];
  const cm={bread:{a:C.WD0,b:C.ORNG,c:C.CREAM},fish:{a:C.BL0,b:C.BL1,c:C.WHITE},yarn:{a:C.PU0,b:C.PINK,c:C.LPNK,d:C.PU1},bed:{a:C.WD0,b:C.RD1,c:C.WARM},bell:{a:C.WD0,b:C.GOLD,c:C.WARM},heart:{a:C.PINK,b:C.WHITE}}[k];
  P.forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch!=='.')s.set(x+i,y+j,cm[ch]);}));return this;}
 lantern(x,y){const s=this.s;s.set(x+1,y-1,C.INK);s.rect(x,y,3,1,C.WD0);s.rect(x,y+1,3,3,C.GOLD);s.set(x+1,y+2,C.WARM);s.rect(x,y+4,3,1,C.WD0);
  this.lit.glow(x,y+1,C.GOLD);this.lit.glow(x+1,y+1,C.WARM);this.lit.glow(x+2,y+1,C.GOLD);this.lit.glow(x+1,y+2,C.WHITE);this.lit.glow(x,y+2,C.GOLD);this.lit.glow(x+2,y+2,C.ORNG);this.lit.glow(x+1,y+3,C.ORNG);
  this.meta.lamps.push([x+1,y+2]);return this;}
 flagPole(x,yB,h,col){const s=this.s;s.vl(x,yB-h,h,C.WD0);s.set(x,yB-h-1,C.GOLD);this.meta.flags.push({x:x+1,y:yB-h,col:col==null?C.RD1:col});return this;}
 bunting(x0,y0,x1,y1,cols){const s=this.s;const n=Math.max(3,Math.round(Math.hypot(x1-x0,y1-y0)));const sag=Math.min(6,n/8);let px=null,py=null,k=0;
  for(let i=0;i<=n;i++){const t=i/n,x=Math.round(x0+(x1-x0)*t),y=Math.round(y0+(y1-y0)*t+Math.sin(t*Math.PI)*sag);if(px!==null)s.line(px,py,x,y,C.INK);
   if(i%4===2&&i<n-1){const c=cols[(k++)%cols.length];s.set(x-1,y+1,c);s.set(x,y+1,c);s.set(x+1,y+1,c);s.set(x,y+2,c);s.noOL[(y+1)*this.s.w+x-1]=1;}px=x;py=y;}return this;}
 // ---------------- props ----------------
 flowerBox(x,y,w){const s=this.s;s.rect(x,y,w,2,C.WD1);s.hl(x,y,w,C.WD2);for(let i=0;i<w;i++){s.set(x+i,y-1,i%2?C.GR1:C.GR2);if(i%3===1)s.set(x+i,y-2,[C.PINK,C.GOLD,C.LPNK,C.RD2][(x+i)%4]);}return this;}
 pot(x,y,c){const s=this.s;s.rect(x,y,4,3,C.RD1);s.hl(x,y,4,C.RD2);s.ell(x+2,y-1,3,2.4,(u,v)=>v<-.2&&u<0?C.GR2:C.GR1);s.set(x+1,y-3,c==null?C.PINK:c);s.set(x+3,y-2,C.GOLD);return this;}
 bush(x,y,r,f){const s=this.s;s.ell(x,y,r,r*.8,(u,v)=>{const l=-u*.6-v*.8;return l>.4?C.GR3:l>-.25?C.GR2:C.GR1;});if(f!=null)for(let k=0;k<3;k++)s.set(x-r/2+k*r/2,y-r*.4+((k%2)?1:-1),f);return this;}
 barrel(x,y){const s=this.s;s.rect(x,y,5,6,(i,j)=>j===1||j===4?C.ST0:i===0?C.WD3:i===4?C.WD0:C.WD1);s.hl(x+1,y-1,3,C.WD2);return this;}
 crate(x,y,n){const s=this.s;s.rect(x,y,6,5,(i,j)=>(i===0||j===0)?C.WD3:(i===5||j===4)?C.WD0:(i===j||i===5-j+0)?C.WD0:C.WD2);return this;}
 sack(x,y){const s=this.s;s.ell(x+3,y+3,3,3,(u,v)=>-u-v>.5?C.WARM:u+v>.6?C.SAND:C.CREAM);s.set(x+3,y-1,C.WD1);s.hl(x+2,y,3,C.WD1);return this;}
 loaves(x,y,n){const s=this.s;for(let k=0;k<n;k++){const xx=x+k*4;s.rect(xx,y,3,2,C.ORNG);s.set(xx,y,C.WD3);s.set(xx+1,y,C.CREAM);s.set(xx+2,y+1,C.WD1);}return this;}
 fishRack(x,y,w){const s=this.s;s.vl(x,y,9,C.WD1);s.vl(x+w,y,9,C.WD1);s.hl(x-1,y,w+3,C.WD0);for(let i=2;i<w-1;i+=3){s.set(x+i,y+1,C.ST0);s.rect(x+i-1,y+2,3,3,(a,b)=>a===0&&b===0?C.BL2:a===2?C.BL0:C.BL1);s.set(x+i,y+5,C.BL1);s.set(x+i-1,y+6,C.BL0);s.set(x+i+1,y+6,C.BL0);}return this;}
 fence(x,y,w){const s=this.s;for(let i=0;i<w;i++){if(i%3===0){s.vl(x+i,y-4,5,C.WD2);s.set(x+i,y-5,C.WD3);}}s.hl(x,y-3,w,C.WD1);s.hl(x,y-1,w,C.WD1);return this;}
 bench(x,y){const s=this.s;s.hl(x,y,8,C.WD2);s.hl(x,y+1,8,C.WD0);s.vl(x+1,y+2,2,C.WD0);s.vl(x+6,y+2,2,C.WD0);s.hl(x,y-3,8,C.WD1);return this;}
 yarnBall(x,y,c){const s=this.s;s.ell(x,y,2.2,2.2,(u,v)=>-u-v>.6?C.LPNK:(c==null?C.PINK:c));s.set(x,y,C.PU0);return this;}
 cushion(x,y,c){const s=this.s;s.rect(x,y,6,2,c==null?C.RD1:c);s.hl(x+1,y-1,4,c==null?C.RD2:c+1);s.set(x,y+1,C.RD0);return this;}
 stoneBase(x,y,w,h,d){return this.wall(x,y,w,h,d||0,MAT.stone,{noAO:true});}
 stairs(x,y,w,n){const s=this.s;for(let k=0;k<n;k++){s.hl(x-k,y+k*2,w+k*2,C.ST2);s.hl(x-k,y+k*2+1,w+k*2,C.ST0);}return this;}
 // ground shadow drawn under (only empty pixels), never outlined
 finish(o){o=o||{};this.s.outline(0);const s=this.s;const bb=s.bbox();
  // soft grounded shadow under the footprint
  const cx=(bb.x0+bb.x1)/2+3,rx=(bb.x1-bb.x0)/2+3;
  for(let y=GY-3;y<=GY+3;y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const u=(x-cx)/rx,v=(y-GY)/3.2;if(u*u+v*v>1)continue;if(s.get(x,y)<0&&bay(x,y)<.55){s.set(x,y,C.GR0);s.noOL[y*W+x]=1;}}
  this.post.forEach(f=>f(this));return this;}
}
R.PARTS={Bld,MAT,ROOF,W,H,GY,texel};
})(typeof window!=='undefined'?window:globalThis);
