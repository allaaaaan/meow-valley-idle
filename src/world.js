// world.js — the valley: layout data + static terrain painter (all code-drawn, palette only).
(function(R){
const {Spr,C,hash,bay}=R.PIX;
const WW=360,WH=1040;
const PLOTS=[
 {id:'inn',type:'inn',x:92,y:318},
 {id:'yarn',type:'yarn',x:210,y:322},
 {id:'hall',type:'hall',x:166,y:520},
 {id:'bakery',type:'bakery',x:88,y:762},
 {id:'fishery',type:'fishery',x:232,y:766},
];
const WALLS=[340,578,808];
const wallY=(i,x)=>WALLS[i]+Math.round(3*Math.sin(x/37+i)+2*Math.sin(x/13+i*2));
const RIVER=[[306,206],[318,280],[322,346],[330,420],[326,500],[320,590],[332,650],[328,720],[310,792],[290,822],[236,852],[160,870],[80,898],[20,925],[-20,940]];
const PATHS=[
 [[180,1040],[180,940],[178,870],[178,825],[176,800],[174,700],[170,610],[168,590],[168,535]], // main road up to the plaza
 [[84,778],[120,782],[176,782],[240,784],[262,782]],                                         // lower street
 [[168,520],[160,450],[156,370],[156,350],[154,336]],                                        // to upper terrace
 [[92,336],[130,338],[156,338],[200,340],[214,338]],                                          // upper street
 [[180,960],[120,970],[70,985]],[[180,960],[250,975],[300,990]]                               // field lanes
];
function distSeg(px,py,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1;let t=((px-a[0])*dx+(py-a[1])*dy)/l2;t=Math.max(0,Math.min(1,t));return [Math.hypot(px-a[0]-dx*t,py-a[1]-dy*t),t];}
function distPoly(px,py,P){let best=1e9,bi=0,bt=0;for(let i=0;i<P.length-1;i++){const [d,t]=distSeg(px,py,P[i],P[i+1]);if(d<best){best=d;bi=i;bt=t;}}return [best,bi,bt];}
function riverW(y){return y<240?7:y<600?9:11;}
function paint(prosper,o){o=o||{};const s=new Spr(WW,WH);const pave=prosper>=10;const plaza=prosper>=4;
 // ---- far mountains
 const ridge=x=>130+Math.round(24*Math.sin(x/53+1)+14*Math.sin(x/23+2)+6*Math.sin(x/9));
 const ridge2=x=>178+Math.round(10*Math.sin(x/41+3)+6*Math.sin(x/17));
 for(let x=0;x<WW;x++){const ry=ridge(x),sl=ridge(x+1)-ridge(x-1);
  for(let y=ry;y<215;y++){const dy=y-ry;let c=sl>0?C.PU2:C.PU1;if(sl>0&&dy>8)c=C.PU1;if(dy>18)c=C.PU0;if(dy<4&&ry<128)c=sl>0?C.WHITE:C.ST2;else if(dy<7&&ry<118)c=sl>0?C.ST2:C.ST1;
   if(dy>=4&&dy<7&&ry<128&&bay(x,y)<.5)c=sl>0?C.PU2:C.PU1;s.set(x,y,c);}}
 // near hills with pines
 for(let x=0;x<WW;x++){const ry=ridge2(x);for(let y=ry;y<230;y++){const dy=y-ry;s.set(x,y,dy<2?C.GR1:(bay(x,y)<.3&&dy<6?C.GR1:C.GR0));}}
 for(let k=0;k<70;k++){const x=Math.floor(hash(k,1,5)*WW),y=ridge2(x)+4+Math.floor(hash(k,2,5)*30);pine(s,x,y,5+Math.floor(hash(k,3,5)*4));}
 // ---- grass base (from y 200): calm low-frequency patches + sparse tufts
 const vn=(x,y,sc,sd)=>{const X=x/sc,Y=y/sc,x0=Math.floor(X),y0=Math.floor(Y),fx=X-x0,fy=Y-y0,sm=t=>t*t*(3-2*t);const a=hash(x0,y0,sd),b=hash(x0+1,y0,sd),c=hash(x0,y0+1,sd),d=hash(x0+1,y0+1,sd);const u=sm(fx),v=sm(fy);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
 for(let y=196;y<WH;y++)for(let x=0;x<WW;x++){if(y<ridge2(x)+18+Math.round(4*Math.sin(x/11)))continue;
  const v=vn(x,y,28,1)*.7+vn(x,y,9,2)*.3;let c=C.GR2;const th=bay(x,y);
  if(v>.68)c=th<(v-.68)*3.2?C.GR3:C.GR2;else if(v<.3)c=th<(.3-v)*3?C.GR1:C.GR2;
  s.set(x,y,c);}
 // terrace bands: lighter front lip above each wall, darker strip at the foot of each wall
 WALLS.forEach((_,i)=>{for(let x=0;x<WW;x++){const y0=wallY(i,x);for(let j=1;j<6;j++)if(bay(x,y0-j)<(6-j)/6)s.set(x,y0-j,C.GR3);for(let j=13;j<22;j++)if(bay(x,y0+j)<(22-j)/14)s.set(x,y0+j,C.GR1);}});
 for(let k=0;k<520;k++){const x=Math.floor(hash(k,9,2)*WW),y=214+Math.floor(hash(k,8,2)*(WH-214));s.set(x,y,C.GR3);s.set(x-1,y-1,C.GR3);s.set(x+1,y-1,C.GR3);s.set(x,y+1,C.GR1);}
 for(let k=0;k<200;k++){const x=Math.floor(hash(k,4,3)*WW),y=215+Math.floor(hash(k,5,3)*(WH-215));const c=[C.WHITE,C.GOLD,C.LPNK,C.PU2][k%4];s.set(x,y,c);s.set(x+2,y+1,c);s.set(x+1,y+3,c);s.set(x,y+1,C.GR1);}
 // ---- top pond + waterfall from the hills
 for(let y=150;y<212;y++)for(let x=296;x<316;x++){const w=6+(y-150)*.05;if(Math.abs(x-306)>w)continue;const t=(y*2+x*3)%7;s.set(x,y,Math.abs(x-306)>w-1.2?C.BL0:t<2?C.WHITE:t<4?C.BL2:C.BL1);}
 s.ell(306,210,16,7,(u,v)=>u*u+v*v>.75?C.SAND:C.BL1);s.ell(306,210,12,4.5,(u,v)=>v<-.4?C.BL2:C.BL1);
 // ---- river
 for(let y=200;y<WH;y++)for(let x=0;x<WW;x++){const [d,i,t]=distPoly(x,y,RIVER);const w=riverW(y);if(d>w+2)continue;
  let c;if(d>w+1)c=C.WD2;else if(d>w)c=C.SAND;else if(d>w-1.5)c=C.BL0;else{c=C.BL1;const h=hash(x,y,6);if(h<.05)c=C.BL2;if((x+y*2)%11===0&&d<w-3)c=C.BL2;}
  s.set(x,y,c);}
 // ---- paths
 const pw=4;PATHS.forEach((P,pi)=>{for(let y=0;y<WH;y++)for(let x=0;x<WW;x++){const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);if(x<Math.min(...xs)-8||x>Math.max(...xs)+8||y<Math.min(...ys)-8||y>Math.max(...ys)+8)continue;
  const [d]=distPoly(x,y,P);const w=pi>=4?2.5:pw;if(d>w+1)continue;
  const onRiver=distPoly(x,y,RIVER)[0]<riverW(y)+1;if(onRiver)continue;
  let c;if(d>w)c=C.WD2;else if(pave&&pi<4){const bx=Math.floor((x+(Math.floor(y/3)%2)*2)/4),by=Math.floor(y/3);c=((y%3===2)||((x+(Math.floor(y/3)%2)*2)%4===3))?C.ST0:(hash(bx,by,3)<.3?C.ST2:C.ST1);}
  else{const h=hash(x,y,4);c=h<.08?C.WD2:h>.9?C.WARM:d>w-1?C.WD3:C.SAND;}
  s.set(x,y,c);}});
 // plaza
 if(plaza){s.ell(168,528,46,18,(u,v,x,y,d)=>{if(d>.92)return C.ST0;const ring=Math.floor(Math.sqrt(d)*7);const a=Math.floor((Math.atan2(v,u)+4)*(4+ring*2));return ((a+ring)%2)?C.ST1:(hash(a,ring,1)<.3?C.ST2:C.ST2);});}
 // ---- terrace walls (stone retaining walls) with stairs where paths cross
 WALLS.forEach((_,i)=>{for(let x=0;x<WW;x++){const y0=wallY(i,x);const stairsAt=[[176,9],[168,9],[155,9]][i];const isStair=Math.abs(x-stairsAt[0]+ (i===0?0:0))<=stairsAt[1]-3;
   const onRiver=distPoly(x,y0+5,RIVER)[0]<riverW(y0)+1.5;
   // lip
   s.set(x,y0-1,C.GR3);
   for(let j=0;j<13;j++){const y=y0+j;let c;
    if(onRiver){const t=(y*3-x+ (j*2))%6;c=Math.abs(x-0)<0?0:(t<2?C.WHITE:t<4?C.BL2:C.BL1);s.set(x,y,c);continue;}
    if(isStair){c=j%3===2?C.ST0:j%3===0?C.ST2:C.ST1;if(Math.abs(x-stairsAt[0])===stairsAt[1]-3)c=C.ST0;s.set(x,y,c);continue;}
    const row=Math.floor(j/4),off=Math.floor(hash(row,i,7)*7)+row*3;const bw=7;
    if(j===0)c=C.ST2;else if(j%4===3||(x+off)%bw===bw-1)c=C.ST0;else c=hash(Math.floor((x+off)/bw),row+i*9,2)<.25?C.ST2:C.ST1;
    if(j===12)c=C.ST0;if(j===1)c=C.ST2;
    if(hash(x,j,i)<.04&&j>1)c=C.GR1;   // moss
    s.set(x,y,c);}
   if(!onRiver&&!isStair)for(let j=13;j<16;j++)if(bay(x,y0+j)<(14-j)/4)s.set(x,y0+j,C.GR1);   // shadow at the foot
   if(onRiver)for(let j=13;j<16;j++)s.set(x,y0+j,(x+j)%3?C.WHITE:C.BL2);}
 });
 // ---- bridge over the river on the main road
 bridge(s,178,866);
 // ---- fields at the bottom
 for(const [fx,fy,fw,fh,crop] of [[22,980,70,40,0],[222,990,90,38,1]])for(let y=fy;y<fy+fh;y++)for(let x=fx;x<fx+fw;x++){
  const row=(y-fy)%5;let c=row<2?C.WD1:row===4?C.WD2:C.WD2;if(row===1&&(x%3)===0)c=crop?C.GOLD:C.GR3;if(row===0&&(x%3)!==2)c=crop?C.ORNG:C.GR2;s.set(x,y,c);}
 return s;}
function pine(s,x,y,h){for(let j=0;j<h;j++){const w=Math.floor((j+1)*.55);for(let i=-w;i<=w;i++)s.set(x+i,y-h+j,i<0?C.GR1:C.GR0);}s.set(x,y-h-1,C.GR1);s.set(x,y,C.WD0);}
function bridge(s,cx,cy){for(let x=-14;x<=14;x++){const arch=Math.round(3*Math.cos(x/14*Math.PI/2));for(let j=-5;j<=4;j++){const y=cy+j-arch;let c=j===-5?C.WD3:j===4?C.WD0:(x+30)%4===0?C.WD1:C.WD2;s.set(cx+x,y,c);}
  if(x%5===0){s.set(cx+x,cy-7-arch,C.WD3);s.set(cx+x,cy-6-arch,C.WD1);}s.set(cx+x,cy-7-arch+(x%5===0?0:1),C.WD1);s.set(cx+x,cy+5-arch,C.INK);s.set(cx+x,cy-8-arch,x%5===0?C.INK:-1);}}
// decor entities: [kind,x,y,minProsperity]
const DECOR=[];
(function(){const add=(k,x,y,p)=>DECOR.push({k,x,y,p:p||0});
 // trees along the edges
 [[18,250],[30,300],[14,420],[40,470],[22,640],[30,700],[12,880],[340,240],[350,560],[345,840],[300,880],[260,450],[110,440],[40,560],[250,620],[120,640],[330,1000],[10,1010],[150,1020],[200,1015]].forEach(([x,y],i)=>add(i%5===2?'cherry':'tree',x,y,i<12?0:6+i));
 [[60,240],[140,250],[250,240],[270,300],[130,410],[220,420],[80,610],[260,700],[140,990]].forEach(([x,y],i)=>add('bush',x,y,i<4?0:3+i));
 [[70,520],[262,520],[110,690],[300,940],[60,940],[230,420],[110,250]].forEach(([x,y],i)=>add('flowers',x,y,2+i*2));
 [[190,470],[146,470],[190,600],[150,600],[196,720],[156,720],[196,900],[160,900]].forEach(([x,y],i)=>add('lamp',x,y,8+Math.floor(i/2)));
 // procedural woods along the edges and between plots, kept clear of paths, river and building plots
 const clear=(x,y)=>{if(distPoly(x,y,RIVER)[0]<riverW(y)+9)return false;for(const P of PATHS)if(distPoly(x,y,P)[0]<9)return false;
  for(const p of PLOTS)if(x>p.x-62&&x<p.x+66&&y>p.y-110&&y<p.y+14)return false;for(const w of WALLS)if(y>w-8&&y<w+20)return false;
  if(Math.hypot((x-168)/56,(y-540)/30)<1)return false;if(y>930&&((x>15&&x<100)||(x>215&&x<320)))return false;if(y<235||y>1035)return false;
  for(const d of DECOR)if(Math.abs(d.x-x)<13&&Math.abs(d.y-y)<9)return false;return true;};
 for(let k=0;k<900&&DECOR.length<150;k++){const edge=hash(k,1,77)<.65;let x=edge?(hash(k,2,77)<.5?4+hash(k,3,77)*46:hash(k,3,77)<.5?338+hash(k,4,77)*22:290+hash(k,4,77)*20):hash(k,5,77)*WW;const y=230+hash(k,6,77)*800;x=Math.round(x);
  if(!clear(x,y))continue;const r=hash(k,7,77);add(r<.08?'cherry':r<.72?'tree':r<.9?'bush':'rock',x,Math.round(y),edge?0:(r<.5?0:Math.floor(hash(k,8,77)*16)));}
 add('gate',180,1012,0);add('rock',290,600,0);add('rock',40,800,0);add('rock',330,300,0);add('sign',196,1000,0);
 add('bench',212,540,5);add('fountain',168,560,14);add('well2',122,520,0);
 add('scarecrow',60,1000,3);add('cart',280,1000,7);
})();
R.WORLD={WW,WH,PLOTS,WALLS,RIVER,PATHS,paint,DECOR,distPoly,riverW};
})(typeof window!=='undefined'?window:globalThis);
