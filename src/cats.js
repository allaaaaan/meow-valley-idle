// cats.js — code-drawn chibi cats (big eyes with highlights, top-left light), multi-frame.
(function(R){
const {Spr,C}=R.PIX;
const COATS={
 white:{r:[C.ST2,C.WARM,C.WHITE],eye:C.INK},
 orange:{r:[C.WD1,C.ORNG,C.WD3],eye:C.INK,stripes:C.WD2},
 black:{r:[C.DEEP,C.PU0,C.ST0],eye:C.GOLD,line:C.DEEP},
 calico:{r:[C.ST2,C.WARM,C.WHITE],eye:C.INK,patch:true},
 grey:{r:[C.ST0,C.ST1,C.ST2],eye:C.INK,stripes:C.ST0},
 siamese:{r:[C.SAND,C.CREAM,C.WARM],eye:C.BL1,points:C.WD0},
};
function shade(r,u,v){const l=-u*.55-v*.75;return l>.35?r[2]:l>-.45?r[1]:r[0];}
function cat(coat,pose,f){const K=COATS[coat],s=new Spr(23,17),r=K.r;
 const pt=(x,y)=>{if(K.patch){const a=Math.sin(x*.9+y*.4)+Math.cos(y*.8-x*.3);if(a>1.1)return C.ORNG;if(a<-1.2)return C.DEEP;}if(K.stripes&&(x+Math.floor(y/2))%4===0&&y<11)return K.stripes;return null;};
 let hx,hy,eyes='open',tail;
 if(pose==='walk'||pose==='work'){const bob=(f%2===1)?-1:0;const lg=[[-1,1],[0,0],[1,-1],[0,0]][f%4];
  // legs (back pair darker)
  const leg=(x,y,dark)=>{s.rect(x,y,2,3,dark?r[0]:r[1]);s.set(x+1,y+2,dark?r[0]:r[1]);};
  leg(4-lg[1],12+bob*0,1);leg(11-lg[0],12,1);leg(6+lg[0],12,0);leg(13+lg[1],12,0);
  tail=[[4,11+bob],[2,9+bob],[1,6+bob+(f%2)],[2,4+bob+(f%2)]];
  s.ell(8.5,10.5+bob,5.4,3.1,(u,v,x,y)=>pt(x,y)??shade(r,u,v));hx=15;hy=6.8+bob;}
 else if(pose==='sit'){tail=[[5,14],[9,15.3],[14,15],[16,13.5-f]];
  s.ell(10,11,4.6,4.4,(u,v,x,y)=>pt(x,y)??shade(r,u,v));s.rect(11,13,2,3,r[1]);s.rect(14,13,2,3,r[2]);hx=12.5;hy=6.6;}
 else if(pose==='sleep'){tail=[[4,14],[8,15.3],[13,15.3]];
  s.ell(9,12.5,6.8,3.3+(f%2)*.4,(u,v,x,y)=>pt(x,y)??shade(r,u,v));hx=14.5;hy=11;eyes='closed';}
 // tail
 for(let i=0;i<tail.length-1;i++){s.line(tail[i][0],tail[i][1],tail[i+1][0],tail[i+1][1],K.points||r[0]);s.line(tail[i][0]+1,tail[i][1],tail[i+1][0]+1,tail[i+1][1],K.points||r[1]);}
 // head
 const ry=pose==='sleep'?3.8:4.7;const rx=pose==='sleep'?5.2:5.6;
 s.poly([[hx-5.2,hy-1.5],[hx-4.4,hy-6.6],[hx-1.4,hy-3.4]],r[1]);s.poly([[hx+1.6,hy-3.5],[hx+4.2,hy-6.6],[hx+5.2,hy-1.5]],r[0]);
 s.set(hx-3.8,hy-4.2,C.LPNK);s.set(hx+3.6,hy-4.2,C.PINK);
 s.ell(hx,hy,rx,ry,(u,v,x,y)=>{if(K.points&&u*u+v*v<.35&&v>-.2)return K.points;const p=pt(x,y);return p??shade(r,u,v);});
 if(K.points){s.set(hx-3.6,hy-3.4,K.points);s.set(hx+3.3,hy-3.4,K.points);}
 const ex1=Math.round(hx-3.4),ex2=Math.round(hx+1.4),ey=Math.round(hy);
 if(eyes==='open'){const e=K.eye;for(const ex of [ex1,ex2]){s.rect(ex,ey-1,2,3,C.INK);if(e!==C.INK){s.set(ex+1,ey+1,e);s.set(ex,ey+1,e);}s.set(ex,ey-1,C.WHITE);}
  s.set(ex1-1,ey+2,C.LPNK);s.set(ex2+2,ey+2,C.LPNK);}
 else {s.hl(ex1,ey+1,2,C.INK);s.hl(ex2,ey+1,2,C.INK);s.set(ex1-1,ey+2,C.LPNK);}
 s.set(Math.round(hx)-1+(eyes==='open'?1:0),ey+2,C.PINK);
 if(pose==='work'){s.line(hx+2,hy+3,hx+5,hy+(f%2?0:4),C.WD1);s.rect(hx+4,hy+(f%2?-1:3),3,2,C.ST1);}
 s.outline(K.line!=null?C.INK:C.INK);return s;}
const CACHE={};
function frames(coat){if(CACHE[coat])return CACHE[coat];const o={walk:[],sit:[],sleep:[],work:[]};
 for(let f=0;f<4;f++){const sp=cat(coat,'walk',f);o.walk.push([sp.toCanvas(),sp.toCanvas(true)]);}
 for(let f=0;f<2;f++){let sp=cat(coat,'sit',f);o.sit.push([sp.toCanvas(),sp.toCanvas(true)]);sp=cat(coat,'sleep',f);o.sleep.push([sp.toCanvas(),sp.toCanvas(true)]);sp=cat(coat,'work',f);o.work.push([sp.toCanvas(),sp.toCanvas(true)]);}
 return CACHE[coat]=o;}
R.CATS={COATS,cat,frames};
})(typeof window!=='undefined'?window:globalThis);
