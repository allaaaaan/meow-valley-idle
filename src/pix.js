// pix.js — fixed 32-colour palette + tiny pixel sprite toolkit. Everything in the game is drawn with this.
// Light comes from the top-left. Outline colour is INK #241a2e.
(function(R){
const PAL=['#241a2e','#3b2a40','#5a3b3c','#8a5236','#b9774a','#e0a86a','#f4d39a','#fff4dc',
 '#7a2c3a','#b8434a','#e6735c','#f2a679','#2e3d5c','#3f6b8f','#5fa3c8','#a9e0f0',
 '#23493d','#3b7a45','#69ad4f','#a6d65a','#6b6778','#9a95a3','#cfc8cf','#5d3f6e',
 '#8f5fa3','#c993d6','#ffd34d','#ffa531','#e8577e','#ffb3c8','#d9bfa0','#ffffff'];
const C={INK:0,DEEP:1,WD0:2,WD1:3,WD2:4,WD3:5,CREAM:6,WARM:7,RD0:8,RD1:9,RD2:10,PEACH:11,NV:12,BL0:13,BL1:14,BL2:15,
 GR0:16,GR1:17,GR2:18,GR3:19,ST0:20,ST1:21,ST2:22,PU0:23,PU1:24,PU2:25,GOLD:26,ORNG:27,PINK:28,LPNK:29,SAND:30,WHITE:31};
const RGB=PAL.map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const bay=(x,y)=>BAY[((y&3)<<2)|(x&3)]/16;
function hash(x,y,s){let h=(x*374761393+y*668265263+(s||0)*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296;}
class Spr{
 constructor(w,h){this.w=w;this.h=h;this.d=new Int16Array(w*h).fill(-1);this.noOL=new Uint8Array(w*h);}
 set(x,y,c){x=Math.floor(x);y=Math.floor(y);if(c==null||c<0||x<0||y<0||x>=this.w||y>=this.h)return;this.d[y*this.w+x]=c;}
 get(x,y){x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=this.w||y>=this.h)return -1;return this.d[y*this.w+x];}
 glow(x,y,c){this.set(x,y,c);const i=Math.floor(y)*this.w+Math.floor(x);if(i>=0&&i<this.noOL.length)this.noOL[i]=1;}
 rect(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.set(x+i,y+j,typeof c==='function'?c(i,j,x+i,y+j):c);return this;}
 hl(x,y,w,c){return this.rect(x,y,w,1,c);} vl(x,y,h,c){return this.rect(x,y,1,h,c);}
 line(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
  for(;;){this.set(x0,y0,c);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}return this;}
 ell(cx,cy,rx,ry,c){for(let y=Math.floor(cy-ry-1);y<=Math.ceil(cy+ry+1);y++)for(let x=Math.floor(cx-rx-1);x<=Math.ceil(cx+rx+1);x++){const u=(x+.5-cx)/rx,v=(y+.5-cy)/ry;const d=u*u+v*v;if(d<=1)this.set(x,y,typeof c==='function'?c(u,v,x,y,d):c);}return this;}
 poly(P,c){const ys=P.map(p=>p[1]),xs=P.map(p=>p[0]);for(let y=Math.floor(Math.min(...ys));y<=Math.ceil(Math.max(...ys));y++)for(let x=Math.floor(Math.min(...xs));x<=Math.ceil(Math.max(...xs));x++){
  const px=x+.5,py=y+.5;let ins=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,yi]=P[i],[xj,yj]=P[j];if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))ins=!ins;}
  if(ins)this.set(x,y,typeof c==='function'?c(x,y):c);}return this;}
 // add an INK outline around everything (4-neighbour); skip pixels flagged as glow
 outline(c){c=c==null?0:c;const add=[];for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){if(this.d[y*this.w+x]>=0)continue;
  for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+a,yy=y+b;if(xx<0||yy<0||xx>=this.w||yy>=this.h)continue;const i=yy*this.w+xx;if(this.d[i]>=0&&!this.noOL[i]){add.push(y*this.w+x);break;}}}
  add.forEach(i=>this.d[i]=c);return this;}
 blit(s,ox,oy,flip){for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const c=s.d[y*s.w+x];if(c>=0)this.set(ox+(flip?s.w-1-x:x),oy+y,c);}return this;}
 bbox(){let x0=1e9,y0=1e9,x1=-1,y1=-1;for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++)if(this.d[y*this.w+x]>=0){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}return {x0,y0,x1,y1};}
 toCanvas(flip){const cv=(typeof document!=='undefined')?document.createElement('canvas'):new R.NodeCanvas(this.w,this.h);cv.width=this.w;cv.height=this.h;const g=cv.getContext('2d');const id=g.createImageData(this.w,this.h);
  for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){const c=this.d[y*this.w+(flip?this.w-1-x:x)];if(c<0)continue;const o=(y*this.w+x)*4,v=RGB[c];id.data[o]=v[0];id.data[o+1]=v[1];id.data[o+2]=v[2];id.data[o+3]=255;}
  g.putImageData(id,0,0);cv.spr=this;return cv;}
}
R.PIX={PAL,C,RGB,Spr,bay,hash};
})(typeof window!=='undefined'?window:globalThis);
