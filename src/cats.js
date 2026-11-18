// cats.js — code-drawn chibi cats. Big eyes with highlights, INK #241a2e outline,
// game palette only. Varied coats, accessories, shapes, and multi-frame poses.
// No image-generation models.
(function(R){
const {Spr,C}=R.PIX;
const SW=28,SH=22,AX=14,AY=21;
const COATS={
 white:  {r:[C.ST2,C.WARM,C.WHITE], eye:'amber', pattern:'solid'},
 orange: {r:[C.WD1,C.ORNG,C.WD3],  eye:'amber', pattern:'tabby', stripes:C.WD2},
 black:  {r:[C.DEEP,C.PU0,C.ST0],  eye:'gold',  pattern:'solid', line:C.INK},
 calico: {r:[C.ST2,C.WARM,C.WHITE], eye:'amber', pattern:'calico'},
 grey:   {r:[C.ST0,C.ST1,C.ST2],   eye:'green', pattern:'tabby', stripes:C.ST0},
 siamese:{r:[C.SAND,C.CREAM,C.WARM],eye:'blue', pattern:'siamese', points:C.WD0},
 tuxedo: {r:[C.DEEP,C.PU0,C.ST0],  eye:'amber', pattern:'tuxedo'},
 builder:{r:[C.WD1,C.WD3,C.SAND],  eye:'amber', pattern:'tabby', stripes:C.WD2, builder:true}
};
const SHAPE={
 default:{rx:5.5,ry:4.7,body:5.2,leg:3},
 round:  {rx:6.0,ry:5.1,body:5.8,leg:2},
 slim:   {rx:5.0,ry:4.6,body:4.3,leg:3},
 sturdy: {rx:5.6,ry:4.8,body:5.5,leg:3}
};
function shade(r,u,v){const l=-u*.55-v*.75;return l>.35?r[2]:l>-.45?r[1]:r[0];}
function fur(K,x,y,u,v,part){
 const r=K.r;
 if(K.pattern==='calico'){
  const a=Math.sin(x*.9+y*.4)+Math.cos(y*.8-x*.3);
  if(a>1.05)return C.ORNG; if(a<-1.15)return C.DEEP;
 }
 if(K.pattern==='tuxedo'){
  if(part==='muzzle'||part==='chest'||part==='paw')return C.WHITE;
  if(part==='belly'&&v>0.1)return C.WARM;
 }
 if(K.pattern==='siamese'){
  if(part==='ear'||part==='tail'||part==='paw')return K.points;
  if(part==='muzzle'&&v>-.05)return K.points;
 }
 if(K.pattern==='tabby'&&K.stripes&&part!=='muzzle'&&part!=='paw'){
  if((x+Math.floor(y/2))%4===0)return K.stripes;
 }
 return shade(r,u,v);
}
function eyeCol(kind){
 if(kind==='green')return {iris:C.GR3,dark:C.GR1,slit:C.INK};
 if(kind==='blue')return {iris:C.BL1,dark:C.BL0,slit:C.INK};
 if(kind==='gold')return {iris:C.GOLD,dark:C.ORNG,slit:C.INK};
 return {iris:C.GOLD,dark:C.ORNG,slit:C.INK}; // amber
}
function paintEye(s,ex,ey,kind,open){
 const E=eyeCol(kind);
 if(open===0){s.hl(ex,ey+1,3,C.INK);return;}
 // big eye, highlight, vertical slit
 s.rect(ex,ey,3,4,C.INK);
 s.set(ex+1,ey+1,E.iris);s.set(ex+1,ey+2,E.iris);s.set(ex,ey+2,E.dark);
 if(open===2){s.set(ex+1,ey+1,E.slit);s.set(ex+1,ey+2,E.slit);} // full slit
 else {s.set(ex+1,ey+2,E.slit);} // half-blink still shows a slit hint
 s.set(ex,ey,C.WHITE);
}
function accDraw(s,kind,hx,hy,pose){
 if(!kind||kind==='none')return;
 if(kind==='bell'){
  s.hl(hx-3,hy+5,7,C.WD1);
  s.rect(hx-1,hy+6,3,3,C.GOLD);s.set(hx,hy+9,C.GOLD);s.set(hx,hy+7,C.WARM);
 }
 if(kind==='bow'){
  // head bow, slightly off to the left ear
  s.rect(hx-6,hy-6,3,3,C.PINK);s.rect(hx-3,hy-5,2,2,C.LPNK);s.rect(hx-1,hy-6,3,3,C.PINK);
  s.set(hx-4,hy-4,C.WHITE);
 }
 if(kind==='scarf'){
  s.hl(hx-4,hy+5,9,C.BL1);s.rect(hx+3,hy+6,2,5,C.BL0);s.set(hx+4,hy+8,C.BL2);
 }
 if(kind==='flower'){
  s.set(hx-6,hy-6,C.PINK);s.set(hx-5,hy-7,C.GOLD);s.set(hx-4,hy-6,C.PINK);
  s.set(hx-6,hy-5,C.LPNK);s.set(hx-4,hy-5,C.PINK);s.set(hx-5,hy-6,C.WARM);
 }
}
function hachimaki(s,hx,hy){
 // ねじり鉢巻: white twisted band, knot + tails on the right
 s.hl(hx-5,hy-3,11,C.WHITE);
 s.hl(hx-4,hy-2,9,C.WARM);
 s.set(hx-3,hy-3,C.ST2);s.set(hx+2,hy-2,C.ST2); // twist marks
 // knot on the right
 s.rect(hx+5,hy-4,3,3,C.WHITE);s.set(hx+6,hy-3,C.ST2);
 s.line(hx+7,hy-2,hx+9,hy+1,C.WHITE);
 s.line(hx+7,hy-1,hx+8,hy+3,C.WARM);
}
function happi(s,bx,by,flip){
 // short vest, open at the chest
 const col=C.RD1,dark=C.RD0;
 s.rect(bx-5,by-2,4,6,col);s.rect(bx+2,by-2,4,6,col);
 s.vl(bx-5,by-2,6,dark);s.vl(bx+5,by-2,6,dark);
 s.set(bx-3,by,C.GOLD);s.set(bx+3,by,C.GOLD); // simple mon
}
function mallet(s,hx,hy,f,pose){
 // wooden mallet. hammer pose swings it; carry holds it low.
 let mx,my,up=0;
 if(pose==='hammer'){
  const swing=[ -2,-3,0,3,2,0 ][f%6];
  const drop=[ -6,-7,-2,3,1,-3 ][f%6];
  mx=hx+6;my=hy+1+drop;up=swing;
 }else{
  mx=hx+7;my=hy+4;
 }
 s.line(hx+3,hy+3,mx,my,C.WD1);
 s.rect(mx-1+up,my-2,5,4,C.WD2);s.hl(mx-1+up,my-2,5,C.WD3);s.rect(mx+3+up,my-1,1,2,C.WD0);
}
function plank(s,hx,hy,f){
 const bob=f%2?0:-1;
 s.rect(hx-2,hy-1+bob,14,3,C.WD2);s.hl(hx-2,hy-1+bob,14,C.WD3);s.hl(hx-2,hy+1+bob,14,C.WD0);
}
function tailPts(pose,f,bx,by){
 if(pose==='sleep')return [[bx-6,by+1],[bx-2,by+2],[bx+3,by+2],[bx+6,by]];
 if(pose==='sit'||pose==='idle'||pose==='flick'||pose==='groom'){
  const flick=pose==='flick'?[-2,2,4,1][f%4]:Math.sin((f||0)*.9)*1.4;
  return [[bx-5,by],[bx-2,by+2],[bx+2,by+2],[bx+6,by+1-flick]];
 }
 if(pose==='stretch')return [[bx-4,by+1],[bx,by+1],[bx+5,by],[bx+8,by-2+(f%4===2?2:0)]];
 // walk / carry / hammer
 const sway=Math.sin((f||0)/6*Math.PI*2)*3;
 return [[bx-5,by-1],[bx-8,by-3+sway*.3],[bx-10,by-6+sway]];
}
function cat(coat,pose,f,acc,shapeKey){
 const K=COATS[coat]||COATS.orange, sh=SHAPE[shapeKey]||SHAPE.default;
 const s=new Spr(SW,SH),r=K.r;
 f=f||0;
 const builder=!!K.builder;
 acc=builder?'none':(acc||'none');
 let hx,hy,bx,by,eyes=2,legs='stand';
 // ---- pose layout (feet near AY) ----
 if(pose==='walk'||pose==='carry'||pose==='hammer'){
  const bob=(pose==='hammer'?0:((f%2)?-1:0));
  by=14+bob;bx=13;hx=17;hy=7+bob;
  legs='walk';
  if(pose==='hammer'){hx=16;hy=8;bx=13;by=14;}
 }else if(pose==='stretch'){
  // front down, hips up
  const k=f%4;by=14;bx=14;hx=20-(k>=2?1:0);hy=10-(k===1||k===2?3:1);legs='stretch';eyes=k===2?1:2;
 }else if(pose==='groom'){
  by=15;bx=14;hx=16;hy=8;legs='sit';eyes=(f%6)>=4?1:2;
 }else if(pose==='sleep'){
  by=16;bx=12;hx=18;hy=13;eyes=0;legs='sleep';
 }else{
  // sit / idle / flick
  by=15;bx=14;hx=15;hy=7;
  legs='sit';
  if(pose==='idle'){eyes=([2,2,1,0,2,2][f%6]);hy=7+(f%6===1?0:0);}
  if(pose==='flick')eyes=2;
  if(pose==='sit')eyes=([2,2,1,2][f%4]);
 }
 // tail first (behind)
 const tail=tailPts(pose,f,bx,by);
 const tc=K.points||r[0],tc2=K.points||r[1];
 for(let i=0;i<tail.length-1;i++){
  s.line(tail[i][0],tail[i][1],tail[i+1][0],tail[i+1][1],tc);
  s.line(tail[i][0]+1,tail[i][1],tail[i+1][0]+1,tail[i+1][1],tc2);
 }
 // legs / body
 const legC=(dark,x,y,h,paw)=>{
  s.rect(x,y,2,h,dark?r[0]:r[1]);
  s.set(x,y+h-1,fur(K,x,y+h,0,1,'paw'));s.set(x+1,y+h-1,fur(K,x+1,y+h,0,1,'paw'));
 };
 if(legs==='walk'){
  const lg=[[-1,1],[0,0],[1,-1],[1,0],[-1,-1],[0,1]][f%6];
  legC(1,bx-5-lg[1],by+2,sh.leg+1);legC(1,bx+2-lg[0],by+2,sh.leg+1);
  // body
  s.ell(bx,by,sh.body,3.3,(u,v,x,y)=>fur(K,x,y,u,v,v>0.3?'chest':'body'));
  legC(0,bx-3+lg[0],by+2,sh.leg);legC(0,bx+4+lg[1],by+2,sh.leg);
 }else if(legs==='stretch'){
  s.ell(bx-2,by+1,6.2,2.8,(u,v,x,y)=>fur(K,x,y,u,v,'body'));
  s.ell(bx+4,by-1,3.4,3.0,(u,v,x,y)=>fur(K,x,y,u,v,'chest'));
  legC(0,bx-7,by+2,2);legC(0,bx-4,by+2,2);legC(1,bx+4,by+2,sh.leg);legC(1,bx+6,by+2,sh.leg);
 }else if(legs==='sleep'){
  s.ell(bx,by,7.2,3.4+(f%2)*.35,(u,v,x,y)=>fur(K,x,y,u,v,'body'));
 }else{
  // sit
  s.ell(bx,by,4.6,4.5,(u,v,x,y)=>fur(K,x,y,u,v,v>0.25?'chest':'body'));
  s.rect(bx+1,by+3,2,sh.leg,r[1]);s.rect(bx+4,by+3,2,sh.leg,r[2]);
  s.set(bx+1,by+2+sh.leg,fur(K,0,0,0,1,'paw'));s.set(bx+4,by+2+sh.leg,fur(K,0,0,0,1,'paw'));
 }
 if(builder)happi(s,bx,by);
 // ---- head ----
 const earH=4.8,earW=3.2;
 // pointed ears (taller than the original stubs)
 const ear=(sx,sy,dir,col,inner)=>{
  s.poly([[sx,sy+1],[sx+dir*earW,sy+1],[sx+dir*1.2,sy-earH]],col);
  s.poly([[sx+dir*.6,sy],[sx+dir*2.0,sy],[sx+dir*1.2,sy-earH+1.4]],inner);
 };
 ear(hx-3.2,hy-2,-1,fur(K,0,0,-.5,-.7,'ear'),C.LPNK);
 ear(hx+3.2,hy-2, 1,fur(K,0,0, .5,-.7,'ear'),C.PINK);
 // head
 const rx=pose==='sleep'?5.0:sh.rx, ry=pose==='sleep'?3.6:sh.ry;
 s.ell(hx,hy,rx,ry,(u,v,x,y)=>{
  const part=(v>0.25&&Math.abs(u)<0.4)?'muzzle':'head';
  return fur(K,x,y,u,v,part);
 });
 // tabby M
 if(K.pattern==='tabby'){
  s.set(hx-2,hy-3,K.stripes);s.set(hx+2,hy-3,K.stripes);
  s.set(hx-1,hy-2,K.stripes);s.set(hx,hy-2,K.stripes);s.set(hx+1,hy-2,K.stripes);
 }
 // eyes
 const ex1=Math.round(hx-3.2),ex2=Math.round(hx+1.0),ey=Math.round(hy-1);
 if(pose==='sleep'){s.hl(ex1,ey+1,2,C.INK);s.hl(ex2,ey+1,2,C.INK);}
 else{paintEye(s,ex1,ey,K.eye,eyes);paintEye(s,ex2,ey,K.eye,eyes);}
 if(eyes>0){s.set(ex1-1,ey+3,C.LPNK);s.set(ex2+3,ey+3,C.LPNK);}
 // nose + w mouth
 s.set(Math.round(hx)-1,ey+3,C.PINK);s.set(Math.round(hx),ey+3,C.PINK);
 if(eyes>0){s.set(Math.round(hx)-2,ey+4,C.WD0);s.set(Math.round(hx)+1,ey+4,C.WD0);s.set(Math.round(hx)-1,ey+5,C.WD0);}
 // accessories / carpenter kit
 if(builder)hachimaki(s,hx,hy);
 else accDraw(s,acc,hx,hy,pose);
 if(builder&&pose==='hammer')mallet(s,hx,hy,f,pose);
 if(builder&&pose==='carry'){plank(s,hx,hy,f);mallet(s,hx-6,hy+4,0,'carry');}
 if(pose==='groom'){
  // paw up to the face
  const gy=hy+1-(f%6>=2?2:0);
  s.rect(hx+3,gy,2,3,r[1]);s.set(hx+3,gy,fur(K,0,0,0,0,'paw'));
 }
 s.outline(C.INK);
 return s;
}
const CACHE={};
const POSES={walk:6,idle:6,flick:4,sit:4,stretch:4,groom:6,sleep:4,hammer:6,carry:6};
function frames(coat,acc,shape){
 acc=acc||'none';shape=shape||'default';
 if(coat==='builder'){acc='none';shape='sturdy';}
 const key=coat+'|'+acc+'|'+shape;
 if(CACHE[key])return CACHE[key];
 const o={};
 Object.keys(POSES).forEach(p=>{
  o[p]=[];
  for(let i=0;i<POSES[p];i++){
   const sp=cat(coat,p,i,acc,shape);
   o[p].push([sp.toCanvas(),sp.toCanvas(true)]);
  }
 });
 // compat: old 'work' pose
 o.work=o.hammer;
 return CACHE[key]=o;
}
R.CATS={COATS,SHAPE,POSES,cat,frames,AX,AY,SW,SH};
})(typeof window!=='undefined'?window:globalThis);
