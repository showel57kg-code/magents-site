/* Fable-Stadt (verbatim aus seite_fable_2026-11-06): Palette, Helfer, Gebäude. Figuren/Blasen/Stempel entfallen – übernehmen die 3D-Figuren in leben.js */
const C = {
  ink:'#2B2433', sky:'#D7ECF4', cloud:'#EEF6F9',
  far:'#BFD6DF', farShade:'#AEC8D3',          // distant skyline, muted
  stone:'#EFE4CB', stoneShade:'#D9CBA8', stoneDark:'#C3B38E',
  mag:'#D63C6E', magDeep:'#A82552', magLight:'#F08DAE',
  pave:'#E8DCC2', paveShade:'#D6C8A9', curb:'#C9BB98',
  road:'#6C6677', roadLine:'#F3EBD6',
  white:'#FFFFFF', paper:'#FBF6EC',
  shadow:'rgba(43,36,51,.18)',
  // visitors
  dots:'#FF7A59', muse:'#8F63F0', duet:'#2BB3A3', grok:'#4D4D63', bot:'#5B8DEF',
  // shops
  resto:'#E8503A', restoDark:'#B93A28', plumb:'#3A8FD9', plumbDark:'#2A6AA6', hotel:'#F0B429', hotelDark:'#C58F14',
  deal:'#2E9E6B', nodeal:'#8A8296'
};
const NS='http://www.w3.org/2000/svg';
let uid=0;
function el(tag, attrs={}, children=[]){
  const e=document.createElementNS(NS,tag);
  for(const k in attrs){ if(attrs[k]!==undefined&&attrs[k]!==null) e.setAttribute(k, attrs[k]); }
  for(const c of children){ if(c) e.appendChild(typeof c==='string'?document.createTextNode(c):c); }
  return e;
}
const g=(attrs,ch)=>el('g',attrs,ch);
const rect=(x,y,w,h,fill,rx=0,extra={})=>el('rect',{x,y,width:w,height:h,fill,rx,...extra});
const circle=(cx,cy,r,fill,extra={})=>el('circle',{cx,cy,r,fill,...extra});
const ellipse=(cx,cy,rx,ry,fill,extra={})=>el('ellipse',{cx,cy,rx,ry,fill,...extra});
const path=(d,fill,extra={})=>el('path',{d,fill,...extra});
const poly=(pts,fill,extra={})=>el('polygon',{points:pts,fill,...extra});
function text(x,y,str,{size=14,fill=C.ink,font='Fredoka',weight=600,anchor='middle',ls=0,extra={}}={}){
  return el('text',{x,y,'font-size':size,fill,'font-family':`"${font}",sans-serif`,'font-weight':weight,'text-anchor':anchor,'letter-spacing':ls,...extra},[str]);
}
function shade(a){ return `rgba(43,36,51,${a})`; }
function darken(hex,amt=.18){ // simple darken
  const n=parseInt(hex.slice(1),16); let r=n>>16,gg=(n>>8)&255,b=n&255;
  r=Math.round(r*(1-amt)); gg=Math.round(gg*(1-amt)); b=Math.round(b*(1-amt));
  return '#'+[r,gg,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function lighten(hex,amt=.25){
  const n=parseInt(hex.slice(1),16); let r=n>>16,gg=(n>>8)&255,b=n&255;
  r=Math.round(r+(255-r)*amt); gg=Math.round(gg+(255-gg)*amt); b=Math.round(b+(255-b)*amt);
  return '#'+[r,gg,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}
/* ---------- buildings ---------- (x = left, y = ground line) */
function windows(grp,x,y,w,rows,cols,ww,wh,col,gapx,gapy,startY){
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const wx=x+(w-(cols*ww+(cols-1)*gapx))/2+c*(ww+gapx);
    const wy=startY+r*(wh+gapy);
    grp.appendChild(rect(wx,wy,ww,wh,col,3));
  }
}
function signPlate(grp,cx,cy,label,{w,fill=C.mag,color=C.white,size=18,font='Lilita One',ls=1.5}={}){
  const width=w||label.length*(size*.62)+30;
  grp.appendChild(rect(cx-width/2,cy-size*.85,width,size*1.7,fill,8,{stroke:C.ink,'stroke-width':2.5}));
  grp.appendChild(text(cx,cy+size*.36,label,{size,fill:color,font,weight:400,ls}));
}
function awning(grp,x,y,w,colA,colB,n=6){
  const sw=w/n;
  for(let i=0;i<n;i++){ grp.appendChild(path(`M${x+i*sw},${y} h${sw} l4,22 h-${sw+8} Z`,i%2?colB:colA)); }
  grp.appendChild(rect(x-4,y+18,w+8,6,darken(colA,.25),3));
}

function bank(x,y,w,h){
  const grp=g();
  grp.appendChild(rect(x,y-h,w,h,C.stone));
  grp.appendChild(rect(x+w-26,y-h,26,h,C.stoneShade));
  // steps
  grp.appendChild(rect(x-14,y-10,w+28,10,C.stoneShade));
  grp.appendChild(rect(x-8,y-20,w+16,10,C.stone));
  // columns
  const n=5, cw=20, span=(w-40)/(n-1);
  for(let i=0;i<n;i++){ const cx=x+20+i*span; grp.appendChild(rect(cx-cw/2,y-h+52,cw,h-72,C.white)); grp.appendChild(rect(cx-cw/2,y-h+52,6,h-72,C.stoneShade)); grp.appendChild(rect(cx-cw/2-5,y-h+46,cw+10,10,C.stoneShade,2)); grp.appendChild(rect(cx-cw/2-5,y-30,cw+10,10,C.stoneShade,2)); }
  // entablature + pediment
  grp.appendChild(rect(x-10,y-h+28,w+20,22,C.stone));
  grp.appendChild(rect(x-10,y-h+28,w+20,22,shade(.06)));
  grp.appendChild(poly(`${x-16},${y-h+28} ${x+w/2},${y-h-62} ${x+w+16},${y-h+28}`,C.stoneShade));
  grp.appendChild(poly(`${x-2},${y-h+24} ${x+w/2},${y-h-50} ${x+w+2},${y-h+24}`,C.stone));
  // raspberry band + sign
  grp.appendChild(rect(x-10,y-h+28,w+20,8,C.mag));
  signPlate(grp,x+w/2,y-h+5,'BANK',{size:26});
  // coin on pediment
  grp.appendChild(circle(x+w/2,y-h-14,13,C.hotel,{stroke:C.ink,'stroke-width':2.5}));
  grp.appendChild(text(x+w/2,y-h-8,'$',{size:17,font:'Lilita One',weight:400}));
  // door
  grp.appendChild(rect(x+w/2-22,y-66,44,46,C.magDeep,4));
  grp.appendChild(rect(x+w/2-16,y-60,32,34,C.mag,3));
  // little flag
  return grp;
}
function escrow(x,y,w,h){
  const grp=g();
  grp.appendChild(rect(x,y-h,w,h,C.stoneShade,6));
  grp.appendChild(rect(x+10,y-h+10,w-20,h-10,C.stone,4));
  grp.appendChild(rect(x+w-34,y-h+10,24,h-10,C.stoneShade));
  // vault door
  const cx=x+w/2, cy=y-58, r=46;
  grp.appendChild(circle(cx,cy,r+8,C.stoneDark));
  grp.appendChild(circle(cx,cy,r,C.mag));
  grp.appendChild(circle(cx,cy,r-10,C.magDeep));
  grp.appendChild(circle(cx,cy,r-18,C.mag));
  // spokes
  for(let i=0;i<4;i++){ grp.appendChild(rect(cx-4,cy-28,8,56,C.paper,4,{transform:`rotate(${i*45} ${cx} ${cy})`})); }
  grp.appendChild(circle(cx,cy,9,C.ink));
  grp.appendChild(circle(cx,cy,5,C.paper));
  // roof band
  grp.appendChild(rect(x-6,y-h-10,w+12,16,C.mag,4));
  grp.appendChild(rect(x-6,y-h-10,w+12,16,shade(.08),4));
  signPlate(grp,cx,y-h-30,'ESCROW',{size:24});
  // subtitle plate
  grp.appendChild(rect(cx-78,y-h+22,156,24,C.paper,6,{stroke:C.ink,'stroke-width':2}));
  grp.appendChild(text(cx,y-h+39,'money held until delivered',{size:11.5,weight:800}));
  return grp;
}
function inspector(x,y,w,h){
  const grp=g();
  grp.appendChild(rect(x,y-h,w,h,C.stone));
  grp.appendChild(rect(x+w-22,y-h,22,h,C.stoneShade));
  grp.appendChild(rect(x-6,y-h-8,w+12,14,C.stoneShade,3));
  grp.appendChild(rect(x-6,y-h-8,w+12,6,C.mag,2));
  windows(grp,x,y,w,2,3,22,28,C.sky,14,16,y-h+30);
  // door
  grp.appendChild(rect(x+w/2-18,y-58,36,58,C.magDeep,3));
  grp.appendChild(rect(x+w/2-12,y-52,24,46,C.sky,2));
  // hanging magnifier sign
  const sx=x+w+6, sy=y-h+40;
  grp.appendChild(rect(x+w-2,sy-26,50,6,C.ink,3));
  grp.appendChild(rect(sx+16,sy-22,4,14,C.ink));
  grp.appendChild(circle(sx+18,sy+6,18,C.paper,{stroke:C.ink,'stroke-width':4}));
  grp.appendChild(path(`M${sx+30},${sy+18} l14,14`,null,{stroke:C.ink,'stroke-width':7,'stroke-linecap':'round'}));
  grp.appendChild(path(`M${sx+9},${sy+6} l6,6 l12,-13`,null,{stroke:C.deal,'stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'}));
  signPlate(grp,x+w/2,y-h-24,'INSPECTOR',{size:20});
  return grp;
}
function gate(x,y,w,h){
  const grp=g();
  // two pylons + arch
  grp.appendChild(rect(x,y-h,34,h,C.stoneShade,4));
  grp.appendChild(rect(x+w-34,y-h,34,h,C.stoneShade,4));
  grp.appendChild(rect(x+4,y-h+4,24,h-4,C.stone,3));
  grp.appendChild(rect(x+w-30,y-h+4,24,h-4,C.stone,3));
  grp.appendChild(rect(x-10,y-h-6,w+20,40,C.mag,6));
  grp.appendChild(rect(x-10,y-h-6,w+20,8,C.magDeep,3));
  grp.appendChild(rect(x-10,y-h+26,w+20,8,C.magDeep,3));
  for(let i=0;i<4;i++) grp.appendChild(circle(x+w/2-45+i*30,y-h+42,4,C.magDeep));
  signPlate(grp,x+w/2,y-h+14,'ARRIVALS',{size:20,fill:C.paper,color:C.ink});
  // directory board
  const bx=x+w/2-62, by=y-130;
  grp.appendChild(rect(bx,by,124,96,C.paper,8,{stroke:C.ink,'stroke-width':3}));
  grp.appendChild(rect(bx,by,124,22,C.mag,8));
  grp.appendChild(rect(bx,by+12,124,10,C.mag));
  grp.appendChild(text(bx+62,by+16,'REGISTRY · who sells what',{size:10.5,fill:C.white,weight:800}));
  const rows=[['Restaurant',C.resto],['Plumber',C.plumb],['Hotel',C.hotel],['Florist',C.duet]];
  rows.forEach((r,i)=>{ grp.appendChild(circle(bx+14,by+36+i*16,5,r[1])); grp.appendChild(text(bx+24,by+40+i*16,r[0],{size:11,anchor:'start',weight:700})); grp.appendChild(rect(bx+84,by+32+i*16,28,8,C.paveShade,4)); });
  grp.appendChild(rect(bx+56,by+96,12,34,C.ink,2));
  return grp;
}
function shop(x,y,w,h,{label,col,dark,icon}){
  const grp=g();
  grp.appendChild(rect(x,y-h,w,h,lighten(col,.72)));
  grp.appendChild(rect(x+w-16,y-h,16,h,lighten(col,.55)));
  grp.appendChild(rect(x-4,y-h-8,w+8,12,dark,3));
  windows(grp,x,y,w,1,2,26,26,C.sky,16,0,y-h+22);
  // sign
  grp.appendChild(rect(x+2,y-h+64,w-4,30,col,5,{stroke:C.ink,'stroke-width':2.5}));
  grp.appendChild(text(x+w/2,y-h+85,label,{size:16,fill:C.white,font:'Lilita One',weight:400,ls:1}));
  // awning + window + door
  awning(grp,x+4,y-h+100,w-8,col,C.paper,Math.max(4,Math.round(w/22)));
  grp.appendChild(rect(x+10,y-54,w*.48,54,dark,3));
  grp.appendChild(rect(x+16,y-48,w*.48-12,42,C.sky,2));
  grp.appendChild(rect(x+w-10-w*.3,y-54,w*.3,54,dark,3));
  grp.appendChild(rect(x+w-6-w*.3,y-48,w*.3-8,46,col,2));
  // icon
  const ix=x+w/2, iy=y-h+36;
  if(icon==='fork'){ grp.appendChild(path(`M${ix-10},${iy-12} v22 M${ix-14},${iy-12} v8 M${ix-6},${iy-12} v8 M${ix+8},${iy-12} q6,4 0,14 v10`,null,{stroke:dark,'stroke-width':3,'stroke-linecap':'round',fill:'none'})); }
  if(icon==='wrench'){ grp.appendChild(path(`M${ix-12},${iy+10} l16,-16`,null,{stroke:dark,'stroke-width':6,'stroke-linecap':'round'})); grp.appendChild(circle(ix+8,iy-10,8,dark)); grp.appendChild(circle(ix+10,iy-12,4,lighten(col,.72))); }
  if(icon==='bell'){ grp.appendChild(path(`M${ix-14},${iy+6} a14,14 0 0 1 28,0 Z`,dark)); grp.appendChild(rect(ix-18,iy+6,36,5,dark,2)); grp.appendChild(circle(ix,iy-10,3,dark)); }
  return grp;
}
function cloud(x,y,s=1){
  const grp=g({transform:`translate(${x},${y}) scale(${s})`});
  grp.appendChild(ellipse(0,0,46,18,C.cloud)); grp.appendChild(circle(-18,-10,20,C.cloud)); grp.appendChild(circle(12,-14,24,C.cloud)); grp.appendChild(circle(32,-4,16,C.cloud));
  return grp;
}
function farBuilding(x,y,w,h,col){ const grp=g(); grp.appendChild(rect(x,y-h,w,h,col,2)); return grp; }
function streetSign(x,y,label){
  const grp=g();
  grp.appendChild(rect(x-3,y-120,6,120,C.ink,2));
  grp.appendChild(rect(x-8,y-150,130,30,C.mag,6,{stroke:C.ink,'stroke-width':2.5}));
  grp.appendChild(text(x+57,y-129,label,{size:16,fill:C.white,font:'Lilita One',weight:400,ls:1}));
  return grp;
}
function tree(x,y,s=1){
  const grp=g({transform:`translate(${x},${y}) scale(${s})`});
  grp.appendChild(rect(-5,-30,10,30,'#8E6A4B',2)); grp.appendChild(circle(0,-52,26,'#6DBE7A')); grp.appendChild(circle(-14,-40,16,'#6DBE7A')); grp.appendChild(circle(14,-42,18,'#86CC8E'));
  return grp;
}

/* =================== SCHICHTEN (v5) ===================
   Die Stadt ist in Ebenen geteilt, damit sie sich beim Neigen/Zeigen verschieden schnell bewegt (Parallax):
   far = Himmel+Skyline · mid = Gebäudereihe · road = Straße · fore = Vordergrund. Figuren stehen zwischen road und fore. */
const E = 70; // Überstand links/rechts, damit die Schichten beim Verschieben nie eine Kante zeigen
function layerSvg(W,H,cls){
  return el('svg',{class:'layer '+cls,viewBox:`${-E} ${-40} ${W+2*E} ${H+80}`,preserveAspectRatio:'none','aria-hidden':'true',focusable:'false'});
}
function drifting(c,dx,dur,delay){ // Wolke: sanfte Hin-und-Her-Fahrt (CSS)
  return g({class:'drift',style:`--dx:${dx}px;--dur:${dur}s;--del:${delay}s`},[c]);
}
function buildDesktopLayers(world){
  const W=1440,H=900, ground=610, roadTop=650, roadBot=820;
  const far=layerSvg(W,H,'l-far'), mid=layerSvg(W,H,'l-mid'), road=layerSvg(W,H,'l-road'), fore=layerSvg(W,H,'l-fore');
  // FAR
  far.appendChild(rect(-E,-40,W+2*E,H+80,C.sky));
  far.appendChild(el('circle',{id:'sun',cx:760,cy:120,r:46,fill:'#FFF3C9',opacity:.9}));
  far.appendChild(drifting(cloud(690,150,1.1),90,38,0)); far.appendChild(drifting(cloud(1010,330,.7),-70,44,-12)); far.appendChild(drifting(cloud(1330,120,.8),-110,52,-20));
  far.appendChild(drifting(cloud(120,300,.6),80,47,-30));
  const farB=[[160,90],[230,120],[300,160],[340,90],[420,200],[470,140],[520,110],[600,170],[650,230],[730,150],[780,120],[840,190],[900,140],[960,100],[1010,170],[1080,130],[1140,210],[1200,150],[1260,110],[1300,180],[1370,140],[1420,120],[1480,150]];
  for(let i=-3;i<0;i++) far.appendChild(farBuilding(i*50-40,ground-20,44,100+((i*37)%50),i%2?C.far:C.farShade));
  farB.forEach(([x,h],i)=>far.appendChild(farBuilding(x,ground-20,44,h*.8,i%2?C.far:C.farShade)));
  far.appendChild(rect(-E,ground-30,W+2*E,30,C.farShade));
  // MID
  mid.appendChild(rect(-E,ground,W+2*E,roadTop-ground,C.pave));
  mid.appendChild(rect(-E,roadTop-8,W+2*E,8,C.curb));
  mid.appendChild(gate(30,ground,230,215));
  mid.appendChild(bank(310,ground,260,230));
  mid.appendChild(escrow(610,ground,220,225));
  mid.appendChild(inspector(870,ground,150,205));
  mid.appendChild(shop(1060,ground,130,200,{label:'RESTAURANT',col:C.resto,dark:C.restoDark,icon:'fork'}));
  mid.appendChild(shop(1200,ground,105,215,{label:'PLUMBER',col:C.plumb,dark:C.plumbDark,icon:'wrench'}));
  mid.appendChild(shop(1315,ground,115,190,{label:'HOTEL',col:C.hotel,dark:C.hotelDark,icon:'bell'}));
  mid.appendChild(tree(1040,ground+2,.7));
  // Paket vor dem Prüfer-Büro (Fable), die Lupe gehört jetzt Ohm
  mid.appendChild(rect(965,roadTop-34,34,26,'#C9A06B',3,{stroke:C.ink,'stroke-width':2}));
  mid.appendChild(path(`M965,${roadTop-21} h34 M982,${roadTop-34} v26`,null,{stroke:C.ink,'stroke-width':2}));
  mid.appendChild(streetSign(292,roadTop-2,'MAGENTS ST.'));
  // ROAD
  road.appendChild(rect(-E,roadTop,W+2*E,roadBot-roadTop,C.road));
  for(let x=-70;x<W+E;x+=90) road.appendChild(rect(x+20,roadTop+88,52,6,C.roadLine,3));
  for(let i=0;i<9;i++) road.appendChild(rect(110+i*22,roadTop+14,12,roadBot-roadTop-28,C.roadLine,3));
  road.appendChild(rect(-E,roadBot,W+2*E,H+40-roadBot,C.pave));
  road.appendChild(rect(-E,roadBot,W+2*E,8,C.curb));
  road.appendChild(text(40,roadBot+26,'MAGENTS STREETS',{size:12,fill:'rgba(43,36,51,.55)',weight:800,ls:3,anchor:'start'}));
  // FORE: Blumenkübel und Laternenmast, ragen vor die Figuren
  fore.appendChild(lamp(1405,H-40));
  fore.appendChild(planter(-78,H-34,1)); fore.appendChild(planter(540,H-30,.8));
  world.append(far,mid,road);
  return {fore};
}
function lamp(x,y){
  const grp=g();
  grp.appendChild(rect(x-4,y-210,8,210,C.ink,3)); grp.appendChild(rect(x-34,y-214,40,8,C.ink,3));
  grp.appendChild(circle(x-34,y-200,13,'#FFE9A8',{stroke:C.ink,'stroke-width':3}));
  return grp;
}
function planter(x,y,s){
  const grp=g({transform:`translate(${x},${y}) scale(${s})`});
  grp.appendChild(path('M0,0 h96 l-10,46 h-76 Z',C.mag)); grp.appendChild(rect(-4,-6,104,10,C.magDeep,4));
  [[18,-24,16],[40,-40,20],[66,-28,18],[84,-14,12]].forEach(([cx,cy,r],i)=>grp.appendChild(circle(cx,cy,r,i%2?'#6DBE7A':'#86CC8E')));
  [[28,-58],[56,-62],[78,-40]].forEach(([cx,cy],i)=>grp.appendChild(circle(cx,cy,7,[C.dots,C.hotel,C.muse][i])));
  return grp;
}
function buildPhoneLayers(world){
  const W=390,H=440, ground=200, roadTop=226, roadBot=416;
  const far=layerSvg(W,H,'l-far'), mid=layerSvg(W,H,'l-mid'), road=layerSvg(W,H,'l-road'), fore=layerSvg(W,H,'l-fore');
  far.appendChild(rect(-E,-40,W+2*E,H+80,C.sky));
  far.appendChild(el('circle',{id:'sun-p',cx:70,cy:52,r:20,fill:'#FFF3C9',opacity:.9}));
  far.appendChild(drifting(cloud(70,40,.55),40,30,0)); far.appendChild(drifting(cloud(310,30,.45),-34,36,-10));
  const farB=[[-40,70],[0,70],[30,100],[70,60],[110,120],[150,80],[200,110],[240,70],[280,130],[320,90],[360,110],[400,80]];
  farB.forEach(([x,h],i)=>far.appendChild(farBuilding(x,ground-12,32,h*.7,i%2?C.far:C.farShade)));
  far.appendChild(rect(-E,ground-16,W+2*E,16,C.farShade));
  mid.appendChild(rect(-E,ground,W+2*E,roadTop-ground,C.pave));
  mid.appendChild(rect(-E,roadTop-5,W+2*E,5,C.curb));
  const row=g({transform:`translate(0,${ground}) scale(.44)`});
  row.appendChild(gate(0,0,170,210)); row.appendChild(bank(200,0,200,220)); row.appendChild(escrow(430,0,170,215)); row.appendChild(inspector(630,0,120,200));
  mid.appendChild(row);
  const sh=g({transform:`translate(0,${roadTop-6}) scale(.5)`});
  sh.appendChild(shop(600,0,130,200,{label:'RESTAURANT',col:C.resto,dark:C.restoDark,icon:'fork'}));
  mid.appendChild(sh);
  road.appendChild(rect(-E,roadTop,W+2*E,roadBot-roadTop,C.road));
  for(let x=-50;x<W+E;x+=60) road.appendChild(rect(x+10,roadTop+92,30,4,C.roadLine,2));
  for(let i=0;i<5;i++) road.appendChild(rect(14+i*14,roadTop+8,7,roadBot-roadTop-16,C.roadLine,2));
  road.appendChild(rect(-E,roadBot,W+2*E,H+40-roadBot,C.pave));
  road.appendChild(rect(-E,roadBot,W+2*E,5,C.curb));
  road.appendChild(text(14,roadBot+17,'MAGENTS STREETS',{size:9,fill:'rgba(43,36,51,.55)',weight:800,ls:2,anchor:'start'}));
  fore.appendChild(planter(-44,H-8,.5)); fore.appendChild(planter(330,H-6,.45));
  world.append(far,mid,road);
  return {fore};
}
