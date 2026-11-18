/* 喵喵谷 cats — larger, readable pixel cats with clear animation poses.
 * Palette + outline from pix.js. Art is code-drawn only. */
'use strict';
(function(){
const P=window.PIX,C=P.C,Spr=P.Spr;

const SW=40,SH=34,AX=20,AY=32;

const COATS={
  white:  {fur:C.WHITE,dark:C.ST2,belly:C.WARM,ear:C.LPNK,eye:C.GOLD,mark:null},
  orange: {fur:C.ORNG,dark:C.WD2,belly:C.WD3,ear:C.LPNK,eye:C.GOLD,mark:'stripes'},
  black:  {fur:C.DEEP,dark:C.INK,belly:C.ST0,ear:C.LPNK,eye:C.GOLD,mark:null},
  calico: {fur:C.WHITE,dark:C.ORNG,belly:C.WARM,ear:C.LPNK,eye:C.GOLD,mark:'calico'},
  grey:   {fur:C.ST1,dark:C.ST0,belly:C.ST2,ear:C.LPNK,eye:C.GR2,mark:'stripes'},
  siamese:{fur:C.CREAM,dark:C.WD0,belly:C.WARM,ear:C.LPNK,eye:C.BL1,mark:'points'},
  tuxedo: {fur:C.DEEP,dark:C.INK,belly:C.WHITE,ear:C.LPNK,eye:C.GOLD,mark:'tuxedo'},
  builder:{fur:C.WD1,dark:C.WD2,belly:C.SAND,ear:C.LPNK,eye:C.GOLD,mark:'tabby'}
};

const SHAPE={
  default:{head:0,body:0,ear:0,leg:0},
  round:  {head:1,body:1,ear:-1,leg:0},
  slim:   {head:-1,body:-1,ear:1,leg:1},
  sturdy: {head:0,body:1,ear:0,leg:-1}
};

/* ---------- coat helpers ---------- */
function furAt(coat,x,y,base){
  const m=coat.mark;
  if(m==='stripes'){
    if(((x+y*2)&3)===0 && y>2) return coat.dark;
  }
  if(m==='tabby'){
    if(((x+y)&3)===0 && y>3) return coat.dark;
  }
  if(m==='calico'){
    const h=(x*7+y*13)&7;
    if(h===0||h===1) return C.ORNG;
    if(h===2) return C.INK;
  }
  if(m==='points'){
    /* ears / muzzle / paws get dark points later by region */
    return base;
  }
  if(m==='tuxedo'){
    /* body belly is already white; face gets a white muzzle in head() */
    return base;
  }
  return base;
}

/* ---------- silhouette outline (4-neigh, #241a2e) ---------- */
function outline(s){s.outline(C.INK);}

/* Soft oval ground shadow, darker than grass so feet stay readable. */
function shadow(s,cx,cy,rx,ry){
  s.ell(cx,cy,rx,ry,C.INK);
}

/* ---------- parts ---------- */
/* Ears: two tall triangles. dx shifts with pose (squash/stretch). */
function ears(s,hx,hy,coat,shp,dx,dy,foldL,foldR){
  const e=2+shp.ear;
  const ink=C.INK, fur=coat.fur, inn=coat.ear, dark=coat.dark;
  const point=coat.mark==='points'?dark:fur;
  function one(side,fold){
    const x=hx+side*(3+shp.head);
    const y=hy-5+dy+(fold?1:0);
    /* tall triangle, 2px tip */
    s.set(x,y-e-2,ink); s.set(x+side,y-e-1,ink);
    s.set(x,y-e-1,point);
    s.set(x-1,y-e,ink); s.set(x,y-e,point); s.set(x+1,y-e,ink);
    s.set(x-1,y-e+1,point); s.set(x,y-e+1,point); s.set(x+1,y-e+1,inn);
    if(!fold){
      s.set(x,y-e-3,ink);
    }
  }
  one(-1,foldL); one(1,foldR);
}

/* Head: big highlighted eyes, pink triangle nose, w mouth, whiskers. */
function head(s,hx,hy,coat,shp,blink,look,mood,tilt){
  /* mood: 0 smile, 1 open (effort), 2 tight */
  const hr=5+shp.head;
  const fur=coat.fur, dark=coat.dark, belly=coat.belly;
  const faceFur=(coat.mark==='points'||coat.mark==='tuxedo')?belly:fur;
  s.ell(hx,hy+tilt,hr,5,furAt(coat,hx,hy,fur));
  /* cheeks */
  s.ell(hx-5,hy+2,3,3,furAt(coat,hx-5,hy,faceFur));
  s.ell(hx+5,hy+2,3,3,furAt(coat,hx+5,hy,faceFur));
  /* muzzle */
  s.ell(hx,hy+3,4,3,faceFur);
  /* tabby M */
  if(coat.mark==='stripes'||coat.mark==='tabby'){
    s.set(hx-2,hy-3,dark); s.set(hx,hy-4,dark); s.set(hx+2,hy-3,dark);
    s.set(hx-1,hy-2,dark); s.set(hx+1,hy-2,dark);
  }
  /* tuxedo white blaze */
  if(coat.mark==='tuxedo'){
    s.set(hx,hy-2,C.WHITE); s.set(hx,hy-1,C.WHITE);
  }
  /* eyes — rounded, a 2px gap between them, two-pixel highlight, a very clear blink */
  const ey=hy+tilt, exL=hx-4+look, exR=hx+4+look;
  function eyeWhite(ex,half){
    const h=half?3:4, yo=half?0:-1;
    s.set(ex-1,ey+yo,C.WHITE); s.set(ex,ey+yo,C.WHITE); s.set(ex+1,ey+yo,C.WHITE);
    s.rect(ex-2,ey+yo+1,5,h-1,C.WHITE);
    if(!half) s.set(ex-1,ey+yo+h,C.WHITE),s.set(ex,ey+yo+h,C.WHITE),s.set(ex+1,ey+yo+h,C.WHITE);
  }
  if(blink===2){ /* fully closed — thick w-shaped shut line */
    s.hl(exL-2,ey,5,C.INK); s.set(exL-2,ey-1,C.INK); s.set(exL+2,ey-1,C.INK);
    s.hl(exR-2,ey,5,C.INK); s.set(exR-2,ey-1,C.INK); s.set(exR+2,ey-1,C.INK);
  } else if(blink===1){ /* half */
    eyeWhite(exL,true); eyeWhite(exR,true);
    s.hl(exL-1,ey,3,coat.eye); s.hl(exR-1,ey,3,coat.eye);
    s.set(exL,ey,C.INK); s.set(exR,ey,C.INK);
    s.glow(exL+1,ey-1,C.WHITE); s.glow(exR+1,ey-1,C.WHITE);
  } else {
    eyeWhite(exL,false); eyeWhite(exR,false);
    s.rect(exL-1,ey-1,3,3,coat.eye);
    s.rect(exR-1,ey-1,3,3,coat.eye);
    s.set(exL,ey,C.INK); s.set(exR,ey,C.INK);
    s.glow(exL+1,ey-1,C.WHITE); s.glow(exR+1,ey-1,C.WHITE);
    s.glow(exL+1,ey-2,C.WHITE); s.glow(exR+1,ey-2,C.WHITE);
  }
  /* nose + w mouth */
  s.set(hx,hy+3,C.LPNK); s.set(hx-1,hy+3,C.LPNK); s.set(hx+1,hy+3,C.LPNK);
  s.set(hx,hy+4,C.LPNK);
  if(mood===1){
    s.set(hx-1,hy+5,C.INK); s.set(hx,hy+6,C.INK); s.set(hx+1,hy+5,C.INK);
    s.set(hx,hy+5,C.PINK);
  } else if(mood===2){
    s.set(hx-1,hy+5,C.INK); s.set(hx+1,hy+5,C.INK);
  } else {
    s.set(hx-1,hy+5,C.INK); s.set(hx,hy+5,C.INK); s.set(hx+1,hy+5,C.INK);
    s.set(hx-2,hy+4,C.INK); s.set(hx+2,hy+4,C.INK);
  }
  /* long whiskers, glow so the outline doesn't swallow them */
  s.glow(hx-5,hy+3,C.ST2); s.glow(hx-6,hy+2,C.ST2); s.glow(hx-7,hy+2,C.ST2);
  s.glow(hx-5,hy+4,C.ST2); s.glow(hx-6,hy+4,C.ST2); s.glow(hx-7,hy+5,C.ST2);
  s.glow(hx-5,hy+5,C.ST2); s.glow(hx-6,hy+6,C.ST2);
  s.glow(hx+5,hy+3,C.ST2); s.glow(hx+6,hy+2,C.ST2); s.glow(hx+7,hy+2,C.ST2);
  s.glow(hx+5,hy+4,C.ST2); s.glow(hx+6,hy+4,C.ST2); s.glow(hx+7,hy+5,C.ST2);
  s.glow(hx+5,hy+5,C.ST2); s.glow(hx+6,hy+6,C.ST2);
}

/* Body oval; squash > 0 = shorter/wider, < 0 = taller/thinner. */
function body(s,bx,by,coat,shp,squash,lean){
  const w=7+shp.body+Math.max(0,squash);
  const h=6+shp.body-squash;
  const x=bx+lean;
  s.ell(x,by,w,h,furAt(coat,x,by,coat.fur));
  s.ell(x,by+2,Math.max(3,w-2),Math.max(3,h-2),coat.belly);
}

/* Four legs. Each is {x,y,lift,fore}. lift>0 raises the paw. */
function legs(s,bx,by,coat,shp,paws,sit){
  const fur=coat.fur, dark=coat.mark==='points'?coat.dark:fur;
  const paw=coat.mark==='points'?dark:C.LPNK;
  const len=6+shp.leg;
  paws.forEach(p=>{
    const x=bx+p.x, y0=by+3;
    const lift=p.lift|0;
    const y=y0-lift;
    const l=sit?Math.max(2,len-2):len;
    s.vl(x,y,l,furAt(coat,x,y,fur));
    s.vl(x+(p.x>0?1:-1),y,Math.max(2,l-1),furAt(coat,x,y,fur));
    /* paw pad */
    s.set(x,y+l,paw); s.set(x+(p.x>0?1:-1),y+l,paw);
    if(lift>2){
      /* airborne paw tucked slightly */
      s.set(x,y+l-1,paw);
    }
  });
}

/* Tail. base at body rear. curve is a list of {dx,dy} from base. */
function tail(s,bx,by,coat,pts){
  const fur=furAt(coat,bx,by,coat.fur);
  const tip=coat.mark==='points'?coat.dark:fur;
  let x=bx,y=by;
  pts.forEach((p,i)=>{
    x=bx+p.x; y=by+p.y;
    const col=i>pts.length-3?tip:fur;
    s.set(x,y,col); s.set(x,y-1,col);
    if(i===pts.length-1){ s.set(x,y,tip); s.set(x+1,y,tip); }
  });
}

function accessory(s,hx,hy,acc,coat){
  if(acc==='bell'){
    s.rect(hx-1,hy+7,3,3,C.GOLD); s.set(hx,hy+8,C.INK);
  } else if(acc==='bow'){
    s.set(hx-3,hy-1,C.RD1); s.set(hx-2,hy,C.RD1); s.set(hx-4,hy,C.RD1);
    s.set(hx+3,hy-1,C.RD1); s.set(hx+2,hy,C.RD1); s.set(hx+4,hy,C.RD1);
    s.set(hx,hy,C.RD1);
  } else if(acc==='scarf'){
    s.hl(hx-5,hy+6,11,C.RD1);
    s.set(hx+4,hy+7,C.RD1); s.set(hx+5,hy+8,C.RD1); s.set(hx+4,hy+9,C.PINK);
  } else if(acc==='flower'){
    s.set(hx-5,hy-4,C.LPNK); s.set(hx-6,hy-5,C.PINK); s.set(hx-4,hy-5,C.PINK);
    s.set(hx-5,hy-6,C.PINK); s.set(hx-5,hy-5,C.GOLD);
  }
}

/* ねじり鉢巻: white twist, a knot blob, two ribbon tails. */
function hachimaki(s,hx,hy,knotSide,flop){
  /* band around forehead, with a red twist stripe */
  s.hl(hx-6,hy-4,13,C.WHITE);
  s.hl(hx-5,hy-5,11,C.WHITE);
  s.hl(hx-4,hy-3,9,C.WHITE);
  s.hl(hx-3,hy-4,7,C.RD1);
  /* knot blob on the side — a visible bun + two hanging tails */
  const d=knotSide, kx=hx+d*7, ky=hy-4;
  s.rect(kx-1,ky-2,4,4,C.WHITE);
  s.set(kx,ky-1,C.RD1); s.set(kx+1,ky,C.RD1);
  /* tail A */
  s.set(kx+d*3,ky+1+flop,C.WHITE);
  s.set(kx+d*4,ky+2+flop,C.WHITE);
  s.set(kx+d*4,ky+3+flop,C.WHITE);
  s.set(kx+d*3,ky+4+flop,C.WHITE);
  s.set(kx+d*3,ky+2+flop,C.RD1);
  /* tail B, slightly behind/offset */
  s.set(kx+d*2,ky+2+flop,C.WHITE);
  s.set(kx+d*2,ky+3+flop,C.WHITE);
  s.set(kx+d*3,ky+5+flop,C.WHITE);
  s.set(kx+d*1,ky+3+flop,C.ST2);
}

/* Happi vest: indigo with a warm opening so it doesn't melt into brown fur. */
function happi(s,bx,by,lean){
  const x=bx+lean;
  s.rect(x-5,by-2,11,7,C.NV);
  /* opening / lapel */
  s.vl(x,by-1,5,C.GOLD);
  s.set(x-1,by-1,C.RD1); s.set(x+1,by-1,C.RD1);
  /* ties */
  s.set(x-2,by+2,C.RD1); s.set(x+2,by+2,C.RD1);
}

/* Wooden mallet. (hx,hy) is the head center; handle goes toward (tx,ty). */
function mallet(s,hx,hy,tx,ty){
  /* handle */
  const steps=8;
  for(let i=0;i<=steps;i++){
    const t=i/steps;
    const x=Math.round(hx+(tx-hx)*t), y=Math.round(hy+(ty-hy)*t);
    s.set(x,y,C.WD1); s.set(x+1,y,C.WD2);
  }
  /* head — large, readable block with highlight */
  s.rect(hx-3,hy-3,8,6,C.WD2);
  s.hl(hx-3,hy-3,8,C.GOLD);
  s.hl(hx-2,hy-2,6,C.GOLD);
  s.rect(hx-2,hy-1,6,3,C.WD1);
  /* dark steel-ish bands */
  s.set(hx-3,hy,C.INK); s.set(hx+4,hy,C.INK);
}

/* Impact puff baked into the hit frame (plus live particles). */
function puff(s,x,y){
  s.glow(x,y,C.SAND); s.glow(x+2,y-1,C.WHITE); s.glow(x-2,y-1,C.SAND);
  s.glow(x+1,y-3,C.WHITE); s.glow(x-1,y-2,C.ST2);
  s.glow(x+3,y-2,C.GOLD); s.glow(x-3,y,C.ST2);
  s.glow(x,y-4,C.GOLD); s.glow(x+4,y-1,C.WHITE);
  s.glow(x-4,y-3,C.SAND); s.glow(x+2,y+1,C.ST2);
}

function plank(s,x,y){
  s.rect(x,y,12,3,C.WD2);
  s.hl(x,y,12,C.WD1);
  s.set(x+2,y+1,C.WD0); s.set(x+8,y+1,C.WD0);
}

/* ---------- pose builders ---------- */
function baseCat(s,opt){
  const coat=opt.coat, shp=opt.shp, acc=opt.acc;
  const hx=opt.hx, hy=opt.hy, bx=opt.bx, by=opt.by;
  const squash=opt.squash||0, lean=opt.lean||0;
  const blink=opt.blink||0, look=opt.look||0, mood=opt.mood||0, tilt=opt.tilt||0;
  const foldL=!!opt.foldL, foldR=!!opt.foldR;
  const sit=!!opt.sit;
  /* ground shadow is drawn in game.js so the outline stays on the cat */
  /* tail first (behind) unless held high */
  if(!opt.tailFront && opt.tail) tail(s, bx+(opt.tailBaseX|| -6+lean), by+(opt.tailBaseY||0), coat, opt.tail);
  /* back legs then body then front legs so overlap is right */
  if(opt.backPaws) legs(s,bx,by,coat,shp,opt.backPaws,sit);
  body(s,bx,by,coat,shp,squash,lean);
  if(opt.builder) happi(s,bx,by,lean);
  if(opt.frontPaws) legs(s,bx,by,coat,shp,opt.frontPaws,sit);
  if(opt.allPaws) legs(s,bx,by,coat,shp,opt.allPaws,sit);
  ears(s,hx,hy,coat,shp,0,opt.earY||0,foldL,foldR);
  head(s,hx,hy,coat,shp,blink,look,mood,tilt);
  if(opt.builder) hachimaki(s,hx,hy,opt.knotSide||1,opt.knotFlop||0);
  else if(acc) accessory(s,hx,hy,acc,coat);
  if(opt.tailFront && opt.tail) tail(s, bx+(opt.tailBaseX|| -6+lean), by+(opt.tailBaseY||0), coat, opt.tail);
  if(opt.mallet) mallet(s, opt.mallet.hx, opt.mallet.hy, opt.mallet.tx, opt.mallet.ty);
  if(opt.puff) puff(s, opt.puff.x, opt.puff.y);
  if(opt.plank) plank(s, opt.plank.x, opt.plank.y);
  outline(s);
}

function tailS(k, sway, lift){
  /* 8-point tail going left/up, sway shifts the tip, lift raises it */
  const pts=[];
  for(let i=1;i<=8;i++){
    const t=i/8;
    const x=-i*1.1 + sway*t*t;
    const y=-lift*t + Math.sin(t*Math.PI)*-2 + Math.abs(sway)*0.2*t;
    pts.push({x:Math.round(x), y:Math.round(y)});
  }
  return pts;
}

/* Walk: 8 frames, contact / down / passing / up × 2. Clear squash & stride. */
function poseWalk(f,coat,shp,acc,builder){
  const s=new Spr(SW,SH);
  /* body bob: down on 1,5 ; up on 3,7 */
  const bob=[0,3,1,-2, 0,3,1,-2][f];
  const squash=[0,3,1,-2, 0,3,1,-2][f];
  const lean=[1,0,0,-1, 1,0,0,-1][f];
  const hy=11+bob, hx=22, bx=18, by=18+bob;
  /* stride: front-right / hind-left forward on 0-1, opposite on 4-5 */
  /* paws relative to bx: hind L, hind R, fore L, fore R */
  const stride=[
    /*0 contact R*/ {hL:-6,hLl:0, hR:-1,hRl:0, fL:0,fLl:0, fR:6,fRl:0},
    /*1 down R   */ {hL:-5,hLl:0, hR:-2,hRl:0, fL:1,fLl:0, fR:5,fRl:0},
    /*2 passing  */ {hL:-3,hLl:0, hR:-3,hRl:1, fL:2,fLl:2, fR:2,fRl:0},
    /*3 up L     */ {hL:-1,hLl:1, hR:-5,hRl:0, fL:5,fLl:3, fR:0,fRl:0},
    /*4 contact L*/ {hL:-1,hLl:0, hR:-6,hRl:0, fL:6,fLl:0, fR:0,fRl:0},
    /*5 down L   */ {hL:-2,hLl:0, hR:-5,hRl:0, fL:5,fLl:0, fR:1,fRl:0},
    /*6 passing  */ {hL:-3,hLl:1, hR:-3,hRl:0, fL:2,fLl:0, fR:2,fRl:2},
    /*7 up R     */ {hL:-5,hLl:0, hR:-1,hRl:1, fL:0,fLl:0, fR:5,fRl:3}
  ][f];
  const sway=[-3,-1,1,3, 3,1,-1,-3][f];
  const lift=[2,1,3,5, 2,1,3,5][f];
  baseCat(s,{
    coat,shp,acc,builder:false,
    hx,hy,bx,by,squash,lean,
    look: lean>0?1:lean<0?-1:0,
    backPaws:[
      {x:stride.hL,lift:stride.hLl},
      {x:stride.hR,lift:stride.hRl}
    ],
    frontPaws:[
      {x:stride.fL,lift:stride.fLl},
      {x:stride.fR,lift:stride.fRl}
    ],
    tail:tailS(f,sway,lift),
    tailBaseX:-7+lean, tailBaseY:-1
  });
  return s;
}

/* Idle: breathing squash, tail sway, a clear 2-frame blink. */
function poseIdle(f,coat,shp,acc){
  const s=new Spr(SW,SH);
  const squash=[0,-1,-2,-1, 1,2,1,0][f]; /* inhale 1-2, exhale 4-5 */
  const bob=[0,-1,-1,0, 1,1,0,0][f];
  const blink=f===3?1:f===4?2:0;
  const sway=[-3,-2,0,2, 3,2,0,-2][f];
  const hx=20, hy=12+bob, bx=18, by=19+bob;
  baseCat(s,{
    coat,shp,acc,
    hx,hy,bx,by,squash,lean:0,
    blink, look:f>=5&&f<=6?1:0,
    foldL:f===6, foldR:false,
    allPaws:[
      {x:-6,lift:0},{x:-2,lift:0},
      {x:2,lift:0},{x:6,lift:0}
    ],
    tail:tailS(f,sway,3),
    tailBaseX:-8, tailBaseY:-1
  });
  return s;
}

/* Tail flick — big arc so it reads at a glance. */
function poseFlick(f,coat,shp,acc){
  const s=new Spr(SW,SH);
  const sway=[-2,2,6,8, 4,-1][f];
  const lift=[3,6,8,5, 2,3][f];
  const hx=20,hy=12,bx=18,by=19;
  baseCat(s,{
    coat,shp,acc,hx,hy,bx,by,
    look:f>=1&&f<=3?1:0,
    allPaws:[{x:-6,lift:0},{x:-2,lift:0},{x:2,lift:0},{x:6,lift:0}],
    tail:tailS(f,sway,lift),
    tailBaseX:-8,tailBaseY:-1,
    tailFront:f>=2&&f<=4
  });
  return s;
}

function poseSit(f,coat,shp,acc){
  const s=new Spr(SW,SH);
  const blink=f===3?2:f===2?1:0;
  const sway=[-1,1,3,4, 2,-1][f];
  const hx=20,hy=13,bx=19,by=20;
  baseCat(s,{
    coat,shp,acc,hx,hy,bx,by,squash:1,sit:true,
    blink,
    allPaws:[{x:-4,lift:0},{x:0,lift:0},{x:3,lift:2},{x:6,lift:2}],
    tail:tailS(f,sway,5),
    tailBaseX:-5,tailBaseY:2,
    tailFront:true
  });
  return s;
}

function poseStretch(f,coat,shp,acc){
  const s=new Spr(SW,SH);
  /* wind-up, extend, hold, yawn, settle, rest */
  const lean=[0,2,4,4, 2,0][f];
  const squash=[1,0,-3,-2, 0,1][f];
  const hx=20+lean, hy=12+(f===3?1:0), bx=16, by=19;
  baseCat(s,{
    coat,shp,acc,hx,hy,bx,by,squash,lean,
    mood:f===3?1:0, foldL:f>=2&&f<=3, foldR:f>=2&&f<=3,
    allPaws:[
      {x:-6,lift:0},{x:-2,lift:0},
      {x:4+lean,lift:f>=2&&f<=3?1:0},{x:8+lean,lift:f>=2&&f<=3?1:0}
    ],
    tail:tailS(f, f>=2?-4:0, f>=2?1:4),
    tailBaseX:-8,tailBaseY:0
  });
  return s;
}

function poseGroom(f,coat,shp,acc){
  const s=new Spr(SW,SH);
  const hx=20, hy=13, bx=18, by=20;
  const pawUp=f>=1&&f<=6;
  const tilt=pawUp?-1:0;
  baseCat(s,{
    coat,shp,acc,hx,hy,bx,by,squash:1,sit:true,tilt,
    look:-1, mood:pawUp?2:0,
    allPaws:[
      {x:-4,lift:0},{x:0,lift:0},
      {x:pawUp?-2:3,lift:pawUp?7:2},
      {x:6,lift:2}
    ],
    tail:tailS(f,2,4),
    tailBaseX:-6,tailBaseY:2, tailFront:true
  });
  /* paw over face on mid frames — redraw a paw on the cheek */
  if(pawUp){
    s.rect(hx-5,hy,3,3,coat.fur);
    s.set(hx-5,hy+2,C.LPNK); s.set(hx-3,hy+2,C.LPNK);
    outline(s);
  }
  return s;
}

function poseSleep(f,coat,shp,acc){
  const s=new Spr(SW,SH);
  const breath=[0,-1,-2,-1,0,1][f];
  const hx=16, hy=20+breath, bx=20, by=23+breath;
  /* loaves on its side, eyes closed, z later in fx maybe */
  baseCat(s,{
    coat,shp,acc,hx,hy,bx,by,squash:2,lean:2,sit:true,
    blink:2, mood:0, tilt:1,
    allPaws:[
      {x:-3,lift:1},{x:1,lift:1},{x:4,lift:2},{x:7,lift:2}
    ],
    tail:tailS(f,4+breath,1),
    tailBaseX:-2,tailBaseY:2, tailFront:true,
    earY:1, foldL:true, foldR:true
  });
  return s;
}

/* Hammer: 8 frames — ready, wind-up, anticipation hold, swing,
 * HIT + puff, recoil, recover, settle. Mallet and knot always visible. */
function poseHammer(f,coat,shp,acc){
  const s=new Spr(SW,SH);
  const squash=[0,1,2,-2, 3,-1,0,0][f];
  const bob=[0,1,2,-1, 4,0,0,0][f];
  const lean=[0,-1,-2,3, 2,-1,0,0][f];
  const hx=18+lean, hy=11+bob, bx=16, by=18+bob;
  const mood=f===3||f===4?1:f===2||f===5?2:0;
  /* mallet head + handle end per frame — big clear arc */
  const mallets=[
    /*0 ready   */ {hx:32,hy:11, tx:24,ty:17},
    /*1 wind-up */ {hx:28,hy:5,  tx:22,ty:13},
    /*2 anticip */ {hx:16,hy:3,  tx:20,ty:12}, /* HIGH above / just behind the ears */
    /*3 swing   */ {hx:34,hy:12, tx:26,ty:16}, /* out to the right, not through the face */
    /*4 HIT     */ {hx:36,hy:26, tx:26,ty:18}, /* down in front, on the ground */
    /*5 recoil  */ {hx:34,hy:16, tx:26,ty:15},
    /*6 recover */ {hx:32,hy:12, tx:24,ty:17},
    /*7 settle  */ {hx:32,hy:11, tx:24,ty:17}
  ][f];
  /* stance: plant on hit, rear foot back on anticipation */
  const paws=[
    /*0*/ [{x:-6,lift:0},{x:-1,lift:0},{x:3,lift:0},{x:7,lift:0}],
    /*1*/ [{x:-7,lift:0},{x:-1,lift:0},{x:3,lift:0},{x:6,lift:1}],
    /*2*/ [{x:-8,lift:0},{x:-2,lift:0},{x:2,lift:0},{x:5,lift:2}],
    /*3*/ [{x:-5,lift:0},{x:0,lift:0},{x:5,lift:0},{x:9,lift:0}],
    /*4*/ [{x:-6,lift:0},{x:-1,lift:0},{x:4,lift:0},{x:8,lift:0}],
    /*5*/ [{x:-6,lift:0},{x:-1,lift:1},{x:4,lift:1},{x:8,lift:0}],
    /*6*/ [{x:-6,lift:0},{x:-1,lift:0},{x:3,lift:0},{x:7,lift:0}],
    /*7*/ [{x:-6,lift:0},{x:-1,lift:0},{x:3,lift:0},{x:7,lift:0}]
  ][f];
  const knotFlop=[0,0,-1,1, 1,0,0,0][f];
  baseCat(s,{
    coat,shp,acc,builder:true,
    hx,hy,bx,by,squash,lean,
    mood, look:1, blink:0,
    allPaws:paws,
    tail:tailS(f, f===2?2:f===4?-3:0, f===2?5:2),
    tailBaseX:-7+lean, tailBaseY:-1,
    mallet:mallets,
    puff:f===4?{x:36,y:24}:null,
    knotSide:1, knotFlop,
    shadow:true
  });
  return s;
}

function poseCarry(f,coat,shp,acc){
  const s=new Spr(SW,SH);
  const bob=[0,2,1,-1, 0,2,1,-1][f];
  const squash=[0,2,1,-1, 0,2,1,-1][f];
  const lean=1;
  const hx=22, hy=11+bob, bx=18, by=18+bob;
  const stride=[
    {hL:-6,hLl:0,hR:-1,hRl:0,fL:0,fLl:0,fR:6,fRl:0},
    {hL:-5,hLl:0,hR:-2,hRl:0,fL:1,fLl:0,fR:5,fRl:0},
    {hL:-3,hLl:0,hR:-3,hRl:1,fL:2,fLl:2,fR:2,fRl:0},
    {hL:-1,hLl:1,hR:-5,hRl:0,fL:5,fLl:3,fR:0,fRl:0},
    {hL:-1,hLl:0,hR:-6,hRl:0,fL:6,fLl:0,fR:0,fRl:0},
    {hL:-2,hLl:0,hR:-5,hRl:0,fL:5,fLl:0,fR:1,fRl:0},
    {hL:-3,hLl:1,hR:-3,hRl:0,fL:2,fLl:0,fR:2,fRl:2},
    {hL:-5,hLl:0,hR:-1,hRl:1,fL:0,fLl:0,fR:5,fRl:3}
  ][f];
  baseCat(s,{
    coat,shp,acc,builder:true,
    hx,hy,bx,by,squash,lean,
    look:0,
    backPaws:[{x:stride.hL,lift:stride.hLl},{x:stride.hR,lift:stride.hRl}],
    frontPaws:[{x:stride.fL,lift:stride.fLl},{x:stride.fR,lift:stride.fRl}],
    tail:tailS(f,[-2,0,2,3,2,0,-2,-3][f],3),
    tailBaseX:-7, tailBaseY:-1,
    plank:{x:8,y:12+bob},
    knotSide:1, knotFlop:0
  });
  return s;
}

const MAKERS={
  walk:poseWalk, idle:poseIdle, flick:poseFlick, sit:poseSit,
  stretch:poseStretch, groom:poseGroom, sleep:poseSleep,
  hammer:poseHammer, carry:poseCarry
};

const POSES={
  walk:8, idle:8, flick:6, sit:6, stretch:6, groom:8, sleep:6,
  hammer:8, carry:8, work:8
};

function makePose(pose,f,coat,shp,acc){
  const mk=MAKERS[pose]||(pose==='work'?poseHammer:poseIdle);
  const spr=mk(f,coat,shp,acc==='none'?null:acc);
  return [spr.toCanvas(false), spr.toCanvas(true)];
}

const CACHE={};
function frames(kind,acc,shape){
  const key=(kind||'white')+'|'+(acc||'none')+'|'+(shape||'default');
  if(CACHE[key])return CACHE[key];
  const coat=COATS[kind]||COATS.white;
  const shp=SHAPE[shape]||SHAPE.default;
  const all={};
  Object.keys(MAKERS).forEach(p=>{
    const n=POSES[p]||8, arr=[];
    for(let f=0;f<n;f++) arr.push(makePose(p,f,coat,shp,acc));
    all[p]=arr;
  });
  all.work=all.hammer;
  return CACHE[key]=all;
}
function cat(kind,shape,acc){return frames(kind,acc,shape);}

window.CATS={COATS,SHAPE,POSES,cat,frames,AX,AY,SW,SH};
})();
