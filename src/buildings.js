// buildings.js — recipes. Each building type has 5 levels assembled from parts.js.
(function(R){
const {C}=R.PIX;const {Bld,MAT,ROOF,GY}=R.PARTS;
ROOF.coral=[8,10,11];ROOF.moss=[16,17,19];
// extra helpers that are building-agnostic
Bld.prototype.cyl=function(cx,yB,r,h,ramp,o){o=o||{};const s=this.s;for(let j=0;j<h;j++)for(let i=-r;i<=r;i++){const t=i/r;let c=t<-.45?ramp[2]:t<.35?ramp[1]:ramp[0];
  if(o.stripes&&Math.floor(j/o.stripes[0])%2===1)c=o.stripes[1][t<-.45?2:t<.35?1:0];if(o.blocks&&(j%4===3||((i+r+(Math.floor(j/4)%2)*3)%6===5)))c=ramp[0];
  s.set(cx+i,yB-j,c);}
 s.ell(cx+.5,yB-h,r+.5,Math.max(1.5,r/3),(u,v)=>v<0?-1:ramp[1]);return this;};
Bld.prototype.deck=function(x,y,w,d){const s=this.s;// plank deck: top surface + front lip + posts
 s.poly([[x,y],[x+w,y],[x+w+d,y-d/2],[x+d,y-d/2]],(px,py)=>((px- (y-py)*2)%3===0)?C.WD1:((px+py)%7===0?C.WD3:C.WD2));
 s.rect(x,y,w,2,(i,j)=>j===0?C.WD3:C.WD0);s.poly([[x+w,y],[x+w+d,y-d/2],[x+w+d,y-d/2+2],[x+w,y+2]],C.WD0);
 for(let i=2;i<w;i+=7)s.rect(x+i,y+2,2,GY-y-1,(a,b)=>a===0?C.WD1:C.WD0);s.rect(x+w+d-2,y-d/2+2,2,GY-y+d/2-4,C.WD0);return this;};
Bld.prototype.ring=function(x,y){const s=this.s;s.ell(x,y,3.5,3.5,(u,v,_x,_y,d)=>d<.25?-2:((Math.atan2(v,u)+3.2)*2|0)%2?C.RD1:C.WHITE);for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++)if(s.get(x+xx,y+yy)===-2)s.set(x+xx,y+yy,C.BL1);return this;};
Bld.prototype.net=function(x,y,w,h){const s=this.s;for(let j=0;j<h;j++)for(let i=0;i<w;i++)if((i+j)%3===0||(i-j+30)%3===0)s.set(x+i,y+j,C.ST2);s.hl(x,y,w,C.WD1);return this;};
Bld.prototype.wheel=function(cx,cy,r){const s=this.s;s.ell(cx,cy,r,r,(u,v,x,y,d)=>d>.6?C.WD1:-1);s.line(cx-r+1,cy,cx+r-1,cy,C.WD0);s.line(cx,cy-r+1,cx,cy+r-1,C.WD0);s.set(cx,cy,C.GOLD);return this;};

const T={};
// ======================= BAKERY 面包房 =======================
T.bakery={name:'面包房',icon:'bread',desc:['路边小摊','木头小屋','红砖面包店','两层烘焙坊','喵喵大烘焙坊'],
 lines:['一张小桌、一把遮阳伞，卖今天唯一的一炉面包。','有了烟囱，整条街都闻得到黄油香。','红砖房、挂着面包招牌，窗台上开满了花。','楼上住着面包师，夜里窗子是暖黄色的。','石窑、彩旗、门口排队的猫，镇上最热闹的地方。'],
 build(L){const b=new Bld(),s=b.s;
  if(L===1){b.wall(44,113,24,7,6,MAT.wood);s.poly([[43,112],[68,112],[74,109],[49,109]],C.WD2);b.loaves(46,110,4);
   s.vl(45,94,19,C.WD1);s.vl(66,94,19,C.WD1);s.vl(71,91,19,C.WD0);
   s.poly([[42,93],[70,93],[76,89],[48,89]],(x,y)=>Math.floor((x-(93-y))/3)%2?C.WARM:C.ORNG);b.awning(42,93,29,4,C.ORNG,C.WARM);
   b.sack(31,112);b.sack(36,114);s.rect(74,110,5,8,C.INK);s.rect(75,111,3,6,C.DEEP);s.set(76,112,C.WHITE);s.set(75,114,C.WHITE);s.set(77,115,C.WHITE);
   b.pot(80,116,C.PINK);}
  if(L===2){b.chimney(60,92,12,{mat:'stone'});b.wall(42,99,28,21,10,MAT.wood);b.roofSide(42,99,28,10,9,ROOF.straw,MAT.wood);
   b.door(52,108,6,11,{arch:true});b.window(62,104,4,4,{shutters:C.GR1});b.window(45,104,4,4,{shutters:C.GR1});b.sign(33,101,'bread');
   b.barrel(73,113);b.sack(36,113);b.loaves(60,117,2);}
  if(L===3){b.chimney(64,86,15);b.wall(38,95,34,25,12,MAT.brick);b.roofSide(38,95,34,12,12,ROOF.red,MAT.brick);
   b.door(51,106,7,13,{arch:true,win:true});b.window(42,102,5,6,{box:true,frame:C.WARM});b.window(62,102,5,6,{box:true,frame:C.WARM});
   b.awning(40,97,9,3,C.RD1,C.WARM);b.awning(60,97,9,3,C.RD1,C.WARM);b.sign(29,99,'bread');b.bench(76,114);b.crate(30,114);b.loaves(31,112,1);b.lantern(59,101);}
  if(L>=4){const X=L===5?40:36;
   b.chimney(X+28,70,15);b.chimney(X+5,72,10);
   b.wall(X,82,38,19,12,MAT.plaster);b.timber(X,82,38,19);b.wall(X,101,38,19,12,MAT.brick,{noAO:false});
   b.roofSide(X,82,38,12,13,ROOF.red,MAT.plaster);
   b.window(X+4,106,10,7,{frame:C.WARM,cross:true});b.awning(X+2,101,14,4,C.ORNG,C.WARM);
   b.door(X+19,104,7,15,{arch:true,win:true});b.window(X+31,107,4,5,{frame:C.WARM});
   [X+5,X+16,X+28].forEach(x=>b.window(x,87,5,6,{box:true,frame:C.WD1}));
   b.lantern(X+16,103);b.lantern(X+27,103);b.sign(X-8,96,'bread');
   if(L===4){b.bench(X+42,114);b.pot(X-6,116);b.barrel(X+52,111);}
   if(L===5){// stone oven annex + decorations
    b.wall(14,106,22,14,6,MAT.stone,{noAO:true});b.dome(25,106,12,10,ROOF.red);b.chimney(29,99,8,{mat:'stone'});
    s.ell(25,115,4,4.5,(u,v)=>v<.6?C.INK:-1);b.lit.ell(25,115.5,3,3.5,(u,v)=>v<.5?(v<-.3?C.GOLD:C.ORNG):-1);s.ell(25,115.5,3,3.5,(u,v)=>v<.5?(v<-.2?C.ORNG:C.RD1):-1);
    b.flagPole(X+44,67,12,C.ORNG);b.bunting(X+7,60,X+44,56,[C.RD1,C.GOLD,C.BL1,C.PINK]);
    s.rect(X+44,110,14,2,C.WD2);s.vl(X+45,112,6,C.WD0);s.vl(X+56,112,6,C.WD0);b.loaves(X+45,108,3);s.rect(X+44,115,14,1,C.WD1);b.loaves(X+45,113,3);
    b.pot(X-4,116,C.GOLD);b.pot(X+61,116,C.PINK);b.bush(10,117,4,C.PINK);}
  }
  return b.finish();}};
// ======================= FISHERY 鱼铺 =======================
T.fishery={name:'鱼铺',icon:'fish',desc:['钓鱼栈桥','高脚渔屋','蓝色鱼铺','两层渔港','灯塔渔港'],
 lines:['一块木栈板、一根鱼竿，小灰最喜欢的地方。','高脚小屋，门口晒满了小鱼干。','蓝色木墙上挂着渔网和救生圈。','二楼有瞭望窗，晚上挂起一串灯笼。','灯塔亮起来以后，夜里的河面也闪闪发光。'],
 build(L){const b=new Bld(),s=b.s;
  if(L===1){b.deck(38,113,34,10);s.rect(48,108,5,5,(i,j)=>i===0?C.ST2:i===4?C.ST0:C.ST1);s.set(49,107,C.BL1);s.set(50,106,C.BL1);s.set(51,107,C.BL0);
   s.rect(58,107,5,2,C.WD2);s.vl(58,109,3,C.WD0);s.vl(62,109,3,C.WD0);s.line(64,108,84,92,C.WD1);for(let k=0;k<12;k+=2)s.set(85+k*.15,93+k*1.6,C.ST2);
   b.crate(36,108);b.fishRack(22,106,12);}
  if(L===2){b.deck(36,112,40,10);b.wall(44,94,24,17,8,MAT.blue);b.roofSide(44,94,24,8,8,ROOF.straw,MAT.blue);b.door(52,100,5,11,{});b.window(61,99,3,3,{noSill:true});
   b.fishRack(20,104,14);b.crate(70,104);s.rect(38,107,4,4,C.ST1);b.lantern(48,98);}
  if(L===3){b.wall(36,112,36,8,12,MAT.stone,{noAO:true});b.wall(36,93,36,19,12,MAT.blue);b.roofSide(36,93,36,12,12,ROOF.coral,MAT.blue);
   b.door(50,99,7,13,{win:true,col:[C.WD0,C.WD1,C.WD2]});b.window(40,99,5,5,{frame:C.WARM});b.window(62,99,5,5,{frame:C.WARM});
   b.net(76,96,7,10);b.ring(44,108-2);b.sign(27,96,'fish');b.crate(76,113);b.crate(83,111);b.barrel(28,113);b.fishRack(10,106,12);b.chimney(62,85,10,{mat:'stone'});}
  if(L>=4){const X=L===5?44:34;
   b.wall(X,112,40,8,12,MAT.stone,{noAO:true});b.wall(X,96,40,16,12,MAT.blue);b.wall(X,78,40,18,12,MAT.plaster,{});
   s.hl(X,95,40,C.BL0);s.hl(X,96,40,C.BL2);
   b.roofSide(X,78,40,12,13,ROOF.coral,MAT.plaster);b.chimney(X+30,68,12,{mat:'stone'});
   b.door(X+16,99,7,13,{win:true});b.window(X+4,101,6,5,{frame:C.WARM});b.window(X+29,101,6,5,{frame:C.WARM});
   b.window(X+5,83,5,6,{frame:C.BL0,shutters:C.BL1});b.window(X+18,82,6,6,{round:true,frame:C.BL0});b.window(X+30,83,5,6,{frame:C.BL0,shutters:C.BL1});
   b.ring(X+12,92);b.net(X+42,96,6,12);b.bunting(X-2,80,X+40,80,[C.RD1,C.WARM,C.BL1]);
   b.lantern(X+14,101);b.lantern(X+25,101);b.crate(X+44,113);b.barrel(X-7,113);
   if(L===5){// lighthouse
    const lx=22;b.cyl(lx,119,6,46,[C.ST0,C.ST1,C.ST2],{stripes:[7,[C.RD0,C.RD1,C.RD2]]});
    s.rect(lx-8,72,17,2,C.WD0);s.hl(lx-8,72,17,C.WD2);for(let i=-7;i<=8;i+=3)s.vl(lx+i,68,4,C.WD0);s.hl(lx-8,68,17,C.WD0);
    s.rect(lx-4,62,9,8,(i,j)=>i===0||i===8?C.INK:(j<2?C.WARM:C.GOLD));for(let i=0;i<9;i++)for(let j=0;j<8;j++)if(i>0&&i<8)b.lit.glow(lx-4+i,62+j,j<3?C.WHITE:C.GOLD);
    b.cone(lx,62,6,9,ROOF.red);s.set(lx,52,C.GOLD);b.window(lx-1,90,2,3,{noSill:true,cross:false});b.door(lx-2,111,4,8,{noStep:true});
    b.meta.beacon=[lx,65];b.flagPole(X+46,63,10,C.BL1);b.fishRack(X+52,104,12);}
  }
  return b.finish();}};
// ======================= YARN 毛线坊 =======================
T.yarn={name:'毛线坊',icon:'yarn',desc:['阳伞织毛线','条纹帐篷','紫色小屋','两层编织坊','风车毛线坊'],
 lines:['一把椅子、一篮毛线，豆豆在伞下慢慢织。','条纹帐篷里堆满了毛线球。','圆窗户的紫色小屋，门口挂着一串毛线。','楼上能看见纺车，晾绳上飘着新织的围巾。','风车转起来，整个镇子的毛线都从这里来。'],
 build(L){const b=new Bld(),s=b.s;
  if(L===1){s.vl(56,92,27,C.WD0);b.cone(56,96,17,9,[C.PU0,C.PU1,C.PU2],{stripe:[C.ST2,C.WARM,C.WHITE]});s.set(56,86,C.GOLD);
   // chair
   s.rect(44,110,9,2,C.WD2);s.vl(44,112,6,C.WD0);s.vl(52,112,6,C.WD0);s.rect(44,102,2,8,C.WD1);s.rect(47,103,2,7,C.WD1);
   s.rect(61,112,10,6,(i,j)=>(i+j)%2?C.WD1:C.WD2);s.hl(61,112,10,C.WD3);b.yarnBall(63,110,C.PINK);b.yarnBall(68,110,C.BL1);b.yarnBall(66,108,C.GOLD);
   s.rect(45,109,3,8,C.PINK);s.vl(45,109,8,C.LPNK);b.yarnBall(76,117,C.GR2);}
  if(L===2){b.cyl(56,119,15,14,[C.PU0,C.PU1,C.PU2]);b.cone(56,105,19,18,[C.PU0,C.PU1,C.PU2],{stripe:[C.ST2,C.WARM,C.WHITE]});b.flagPole(56,87,7,C.PINK);
   s.poly([[51,119],[61,119],[56,106]],C.DEEP);s.line(51,119,56,106,C.LPNK);s.line(61,119,56,106,C.PU2);b.lit.poly([[53,119],[59,119],[56,110]],C.ORNG);b.meta.doors.push([56,120]);
   b.yarnBall(36,117,C.PINK);b.yarnBall(41,118,C.GOLD);b.yarnBall(74,117,C.BL1);b.yarnBall(78,118,C.GR2);b.lantern(44,104);}
  if(L===3){b.chimney(64,86,11,{mat:'stone'});b.wall(38,95,34,25,12,MAT.lilac);b.roofSide(38,95,34,12,12,ROOF.purple,MAT.lilac);
   b.door(51,106,7,13,{arch:true,col:[C.PU0,C.PU1,C.PU2]});b.window(42,101,6,6,{round:true,frame:C.WARM});b.window(62,101,6,6,{round:true,frame:C.WARM});
   b.sign(29,99,'yarn');for(let i=0;i<5;i++){s.vl(41+i*3,97,3,[C.PINK,C.GOLD,C.BL1,C.GR2,C.LPNK][i]);}b.pot(33,116,C.LPNK);b.yarnBall(78,117,C.PINK);b.yarnBall(82,118,C.GOLD);}
  if(L>=4){const X=L===5?46:36;
   b.chimney(X+29,72,12,{mat:'stone'});b.wall(X,101,38,19,12,MAT.lilac);b.wall(X,82,38,19,12,MAT.pink);b.timber(X,82,38,19,C.PU0);
   b.roofSide(X,82,38,12,13,ROOF.purple,MAT.pink);
   b.door(X+16,105,7,14,{arch:true,col:[C.PU0,C.PU1,C.PU2],win:true});b.window(X+4,106,6,6,{round:true,frame:C.WARM});b.window(X+29,106,6,6,{round:true,frame:C.WARM});
   b.window(X+5,86,10,7,{frame:C.WARM,cross:false});b.wheel(X+10,89,3);b.window(X+26,87,5,6,{box:true,frame:C.WARM});
   b.sign(X-8,96,'yarn');b.lantern(X+13,104);
   if(L===4){s.vl(X-14,98,22,C.WD1);s.line(X-14,99,X,90,C.ST2);[[X-12,98,C.PINK],[X-8,96,C.GOLD],[X-4,94,C.BL1]].forEach(([x,y,c])=>s.rect(x,y,3,7,c));b.yarnBall(X+44,117,C.PINK);}
   if(L===5){// windmill tower
    const tx=26;b.cyl(tx,119,9,40,[C.ST0,C.ST1,C.ST2],{blocks:true});b.cone(tx,80,11,13,ROOF.purple);s.set(tx,66,C.GOLD);
    b.door(tx-2,110,5,9,{arch:true,noStep:true});b.window(tx-2,92,3,4,{noSill:true,cross:false});
    b.meta.spin={x:tx,y:84,r:22};b.bunting(tx+6,79,X+5,72,[C.PINK,C.GOLD,C.BL1,C.GR2]);
    s.vl(X+50,98,22,C.WD1);s.line(X+50,99,X+38,90,C.ST2);[[X+46,95,C.PINK],[X+42,93,C.GOLD]].forEach(([x,y,c])=>s.rect(x,y,3,7,c));
    b.yarnBall(X+52,117,C.PINK);b.yarnBall(X+47,118,C.BL1);b.pot(X-6,116,C.LPNK);b.flagPole(X+44,67,10,C.PINK);}
  }
  return b.finish();}};
// ======================= INN 猫猫旅店 =======================
T.inn={name:'猫猫旅店',icon:'bed',desc:['纸箱窝','圆门小木屋','石头旅店','两层旅店','塔楼大旅店'],
 lines:['一只纸箱、一条小毯子，年糕已经睡进去了。','圆圆的门，刚好让一只胖猫挤进去。','石头墙很暖和，门口的长椅总有猫在晒太阳。','二楼阳台摆满了垫子，路过的猫也愿意住下来。','塔楼顶上的那只猫，从来没人知道它什么时候下来。'],
 build(L){const b=new Bld(),s=b.s;
  if(L===1){b.wall(46,107,22,13,9,MAT.cardboard,{noAO:true});s.poly([[46,107],[42,101],[60,101],[63,107]],C.WD3);s.poly([[68,107],[76,98],[78,102],[69,108]],C.WD2);
   s.rect(48,108,18,3,C.RD1);s.hl(48,108,18,C.RD2);s.rect(51,111,2,5,C.RD1);s.rect(59,111,2,4,C.RD1);b.cushion(70,116,C.PU1);s.rect(47,113,5,4,C.WD3);
   s.hl(48,115,3,C.WD1);b.meta.sleep=[57,107];b.yarnBall(36,117,C.PINK);}
  if(L===2){b.wall(42,100,28,20,10,MAT.wood);b.roofSide(42,100,28,10,10,ROOF.green,MAT.wood);b.door(51,108,8,11,{round:true});b.meta.doors.pop();b.meta.doors.push([55,120]);
   b.window(63,105,4,4,{round:true,frame:C.WARM});b.window(45,105,3,4,{frame:C.WARM});b.lantern(48,104);b.bush(36,116,5,C.PINK);b.cushion(74,116);}
  if(L===3){b.chimney(41,88,10,{mat:'stone'});b.wall(38,96,34,24,12,MAT.stone);b.roofSide(38,96,34,12,12,ROOF.green,MAT.stone);
   b.door(51,106,7,13,{arch:true,win:true,col:[C.GR0,C.GR1,C.GR2]});b.window(42,102,5,6,{shutters:C.GR1,frame:C.WARM});b.window(63,102,4,6,{shutters:C.GR1,frame:C.WARM});
   b.sign(29,100,'bed');b.lantern(48,103);b.bench(76,113);b.cushion(77,111,C.PU1);b.bush(32,117,4);}
  if(L>=4){const X=L===5?46:36;
   b.chimney(X+42,74,10,{mat:'stone'});b.wall(X,101,38,19,12,MAT.stone);b.wall(X,82,38,19,12,MAT.plaster);b.timber(X,82,38,19);
   b.roofFront(X,82,38,12,22,ROOF.green,MAT.plaster,{oh:3});b.window(X+16,68,6,6,{round:true,frame:C.WD0});s.vl(X+19,76,6,C.WD0);
   b.door(X+15,104,8,15,{arch:true,win:true,col:[C.GR0,C.GR1,C.GR2]});b.window(X+4,106,6,6,{shutters:C.GR1,frame:C.WARM});b.window(X+29,106,6,6,{shutters:C.GR1,frame:C.WARM});
   [X+4,X+16,X+29].forEach(x=>b.window(x,86,5,6,{frame:C.WD1}));
   // balcony
   s.rect(X-1,95,40,2,C.WD1);s.hl(X-1,95,40,C.WD3);for(let i=0;i<40;i+=3)s.vl(X-1+i,91,4,C.WD2);s.hl(X-1,91,40,C.WD2);
   b.cushion(X+2,93,C.RD1);b.cushion(X+30,93,C.PU1);b.sign(X-8,100,'bed');b.lantern(X+12,103);b.lantern(X+25,103);b.bench(X+42,114);
   if(L===5){const tx=28;b.cyl(tx,119,10,42,[C.ST0,C.ST1,C.ST2],{blocks:true});b.cone(tx,77,13,22,ROOF.green);s.set(tx,54,C.GOLD);b.flagPole(tx,55,9,C.GOLD);
    b.window(tx-2,84,4,6,{arch:true,frame:C.WARM});b.window(tx-2,99,4,5,{frame:C.WARM});b.door(tx-3,109,6,10,{arch:true,noStep:true,col:[C.GR0,C.GR1,C.GR2]});
    b.meta.sleep=[X+30,72];b.bunting(tx+9,82,X+2,83,[C.GOLD,C.RD1,C.GR2,C.PINK]);b.pot(X+56,116,C.PINK);b.bush(10,117,5,C.LPNK);}
  }
  return b.finish();}};
// ======================= TOWN HALL 钟楼广场 =======================
T.hall={name:'钟楼广场',icon:'bell',desc:['篝火','水井和告示板','木头会堂','石头会堂','金铃钟楼'],
 lines:['一圈木头围着篝火，猫猫镇从这里开始。','打了一口井，告示板上贴着第一张寻猫启事。','有了会堂和一口小铃，大家开始在这里开会。','石头会堂挂上了钟，镇子有了自己的时间。','金铃一响，远处的流浪猫都知道这里有个家。'],
 build(L){const b=new Bld(),s=b.s;
  if(L===1){s.ell(58,114,9,3.5,C.ST1);s.ell(58,113.5,6,2.4,C.DEEP);[[44,116],[66,116],[50,110],[64,110]].forEach(([x,y])=>{s.rect(x,y,8,3,(i,j)=>i===0||i===7?C.WD3:j===0?C.WD2:C.WD1);});
   b.meta.lamps.push([58,108]);b.meta.fire=[58,112];b.meta.smoke.push([58,104]);}
  if(L===2){// well
   b.cyl(56,118,9,7,[C.ST0,C.ST1,C.ST2],{blocks:true});s.ell(56.5,111,7,2,C.DEEP);s.vl(48,96,15,C.WD1);s.vl(64,96,15,C.WD1);b.roofFront(46,98,21,6,8,ROOF.shingle,MAT.wood,{oh:1});
   s.hl(48,100,17,C.WD0);s.rect(55,101,3,4,C.WD2);
   // notice board
   s.vl(74,104,15,C.WD0);s.vl(87,104,15,C.WD0);s.rect(73,101,16,10,C.WD1);s.rect(74,102,14,8,C.WD2);s.rect(75,103,4,5,C.WARM);s.rect(80,103,5,4,C.CREAM);s.set(76,104,C.INK);s.set(77,104,C.INK);s.rect(81,104,3,1,C.RD1);s.rect(84,106,3,3,C.LPNK);
   s.ell(38,117,4,2,C.ST1);b.lantern(36,108);s.vl(37,113,4,C.WD0);}
  if(L===3){b.wall(38,96,36,24,8,MAT.woodV);b.roofFront(38,96,36,8,15,ROOF.red,MAT.wood);
   s.rect(54,72,6,7,C.WD1);b.roofFront(53,72,8,3,4,ROOF.red,MAT.wood,{oh:1});s.ell(57,77,2,2,(u,v)=>v<.5?C.GOLD:-1);
   b.door(52,104,9,15,{arch:true,win:true});b.window(42,103,5,6,{frame:C.WARM});b.window(66,103,5,6,{frame:C.WARM});b.window(55,86,4,4,{round:true,frame:C.WARM});
   b.lantern(48,101);b.lantern(63,101);b.bench(80,114);s.ell(30,117,4,2,C.ST1);}
  if(L>=4){const big=L===5;const X=big?24:30,Wd=big?64:52;
   b.wall(X,94,Wd,26,12,MAT.stone);b.roofFront(X,94,Wd,12,big?18:16,ROOF.slate,MAT.sand);
   const cx=X+Wd/2;
   // columns + door
   for(const dx of [-12,-6,4,10])s.rect(cx+dx,100,3,19,(i,j)=>i===0?C.WHITE:i===2?C.ST1:C.ST2);
   b.door(cx-3,103,7,16,{arch:true,col:[C.RD0,C.RD1,C.RD2]});b.window(X+4,102,5,8,{arch:true,frame:C.ST2});b.window(X+Wd-9,102,5,8,{arch:true,frame:C.ST2});
   // clock
   s.ell(cx,86,5,5,C.ST2);s.ell(cx,86,4,4,C.WARM);s.line(cx,86,cx,83,C.INK);s.line(cx,86,cx+2,87,C.INK);s.set(cx,82,C.INK);s.set(cx+4,86,C.INK);s.set(cx-4,86,C.INK);s.set(cx,90,C.INK);
   // banners
   for(const bx of [X+2,X+Wd-6]){s.rect(bx,96,4,10,C.RD1);s.vl(bx,96,10,C.RD2);s.set(bx+1,106,C.RD1);s.set(bx+2,106,C.RD1);s.set(bx+1,100,C.GOLD);s.set(bx+2,100,C.GOLD);}
   b.lantern(cx-9,98);b.lantern(cx+8,98);
   if(!big){b.stairs(cx-6,119,12,0);b.flagPole(cx,76,8,C.RD1);}
   if(big){// bell tower
    const tw=14,tx=cx-7;b.wall(tx,48,tw,28,6,MAT.sand);s.rect(tx+3,52,8,10,C.DEEP);s.ell(tx+7,58,3.5,4,(u,v)=>v<.6?(u<-.2?C.WARM:u<.4?C.GOLD:C.ORNG):-1);s.set(tx+7,62,C.WD0);
    for(let i=0;i<8;i++)b.lit.glow(tx+3+i,52,C.GOLD);
    b.cone(tx+7,49,10,16,ROOF.gold);s.set(tx+7,32,C.GOLD);b.flagPole(tx+7,33,8,C.RD1);b.flagPole(X-5,119,34,C.BL1);b.flagPole(X+Wd+15,119,34,C.BL1);
    b.bunting(X-5,86,tx,64,[C.RD1,C.GOLD,C.WHITE]);b.bunting(tx+tw+5,62,X+Wd+15,86,[C.RD1,C.GOLD,C.WHITE]);
    b.pot(X-6,116,C.GOLD);b.pot(X+Wd+14,116,C.PINK);b.bush(X-10,117,4,C.RD2);b.meta.bell=[tx+7,58];}
  }
  return b.finish();}};
// empty cleared plot
T.empty=function(){const b=new Bld(),s=b.s;s.ell(57,114,24,6,(u,v,x,y)=>((y+Math.floor(x/7))%3===0)?C.WD1:C.WD2);s.ell(57,113,22,4.5,(u,v,x,y)=>((y+Math.floor(x/7))%3===0)?C.WD1:(u*u+v*v<.3?C.SAND:C.WD2));
 [[35,114],[79,114],[44,108],[70,108]].forEach(([x,y])=>{s.vl(x,y-6,7,C.WD1);s.set(x,y-6,C.WD3);});
 s.line(35,109,44,103,C.ST2);s.line(44,103,70,103,C.ST2);s.line(70,103,79,109,C.ST2);
 s.vl(57,104,10,C.WD0);s.rect(52,99,11,6,C.WD2);s.hl(52,99,11,C.WD3);s.set(56,101,C.INK);s.set(57,100,C.INK);s.set(58,101,C.INK);s.set(57,103,C.INK);
 const r=new Bld();r.s=s;s.outline(0);return {s,lit:b.lit,meta:b.meta};};
R.BUILDINGS=T;
})(typeof window!=='undefined'?window:globalThis);
