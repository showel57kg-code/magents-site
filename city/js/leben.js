/* MAGENTS v5 — lebender Kosmos.
   Bühne (stadt.js) + fünf Plüschfiguren, die ohne Zutun laufen, reden und sich umsehen.
   Alles in Weltkoordinaten (Desktop 1440x900, Handy 390x440); eine Schleife (rAF) schreibt nur transform/opacity. */
(function(){
'use strict';
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
const LOOP = 60;          // Sekunden je Durchlauf der kleinen Verhandlung
const STILL_T = 17.5;     // ruhige Variante: eingefrorener Augenblick (Abschluss, alle Blasen da)

/* ---------- Figuren ---------- */
const FIG = {
  scout :{name:'Scout' ,role:'Registry'  ,c:'#2F6FE0',flip:true ,task:"Searches the Registry for the shop that fits your customer's wish — for example a used iPhone 15 in Lisbon."},
  mo    :{name:'Mo'    ,role:'Exchange'  ,c:'#E8503A',flip:false,task:"Speaks for the shop. Bids and counter-bids until there is a contract — or a polite walk-away."},
  ohm   :{name:'Ohm'   ,role:'Inspector' ,c:'#7A45C9',flip:true ,task:"Checks every document and verifies each signed object, so both sides can trust what was agreed."},
  keeper:{name:'Keeper',role:'Bank & escrow',c:'#2BAE8C',flip:true ,task:"Holds the money safe until the hand-over is done. Then it is released — not a minute earlier."},
  dash  :{name:'Dash'  ,role:'Delivery'  ,c:'#8FB10F',flip:true ,task:"Carries the hand-off to the shop or the carrier. Deal done means the parcel moves."}
};
const ORDER = ['scout','mo','keeper','ohm','dash'];

/* ---------- Konfiguration je Bühne ---------- */
const MODES = {
  desktop:{ W:1440,H:900, layers:()=>buildDesktopLayers, hFig:250, yFar:640, yNear:790, sFar:.74, bfs:15, cw:250, cfs:15, tagfs:13, amp:14,
    gate:[150,668], lane:790, s1:330, s2:1040, mHome:1130, m1:520, m2:1230, keeper:[705,652], ohm:[955,652], dyK:1, stampUp:118,
    dash:[[0,300],[9,700],[14,840],[21,840],[27,1000],[31,1380],[34,1380],[44,1380],[60,300]], dashY:818 },
  phone:{ W:390,H:440, layers:()=>buildPhoneLayers, hFig:112, yFar:226, yNear:385, sFar:.7, bfs:12, cw:206, cfs:13, tagfs:11, amp:7,
    gate:[38,236], lane:388, s1:78, s2:78, mHome:252, m1:252, m2:252, dyK:0, stampY:328, keeper:[184,262], ohm:[318,262],
    dash:[[0,30],[9,140],[14,338],[21,338],[27,230],[31,338],[34,338],[44,338],[60,30]], dashY:412 }
};

/* ---------- Wege: [Zeit, x, y, Deckkraft] ---------- */
function tracks(m){
  const L=m.lane, g=m.gate, g2=[g[0]+26,g[1]+44];
  return {
    scout:[[0,g[0],g[1],0],[1.6,g2[0],g2[1],1],[5.5,g2[0],g2[1],1],[9.5,m.s1,L,1],[20.5,m.s1,L,1],[29,m.s2,L,1],[40,m.s2,L,1],[52,g2[0],g2[1],1],[53.5,g[0],g[1],0],[LOOP,g[0],g[1],0]],
    mo:[[0,m.mHome,L,1],[1.5,m.mHome,L,1],[8.8,m.m1,L,1],[20.5,m.m1,L,1],[28.8,m.m2,L,1],[40,m.m2,L,1],[44,m.mHome,L,1],[LOOP,m.mHome,L,1]],
    keeper:[[0,m.keeper[0],m.keeper[1],1],[LOOP,m.keeper[0],m.keeper[1],1]],
    ohm:[[0,m.ohm[0],m.ohm[1],1],[LOOP,m.ohm[0],m.ohm[1],1]],
    dash:m.dash.map(([t,x])=>[t,x,m.dashY,1])
  };
}
/* ---------- Sprechblasen: [von, bis, Figur, Zeilen, Pose, Höhe extra, Art] ---------- */
const TALK = [
  [1.8,5.4 ,'scout',['Hello, MAGENTS!'],'hover',0],
  [2.5,6.5 ,'keeper',['All quiet.','Money is safe.'],'hover',0],
  [2.2,6.2 ,'mo',['Open for deals!'],'hover',0],
  [6.5,10  ,'ohm',['Checking papers…'],'klick',0,null,null,'d'],
  [9.9,19  ,'scout',['Table for four,','Friday, 8 pm?'],'klick',44],
  [12.4,19 ,'mo',['7:30 is free.','Window seat.'],'klick',0],
  [15.5,20 ,'keeper',['Money held here.','Paid when the guest arrives.'],'klick',0,'pink',['Money held here.','Paid when the','guest arrives.']],
  [16.2,20 ,'ohm',['Signed. Verified.'],'klick',0,null,null,'d'],
  [18.4,21.5,'dash',["Parcel's ready."],'hover',0],
  [29.6,40 ,'scout',['Sink fixed','by Monday?'],'hover',44],
  [32,40   ,'mo',['Earliest:','Wednesday.'],'hover',0],
  [42,46.5 ,'keeper',['Zzz… all safe.'],'hover',0],
  [47,52   ,'ohm',['Next, please.'],'rest',0,null,null,'d']
];
const STAMPS = [[15,20,'DEAL','deal','scout','mo'],[35,40,'NO DEAL','nodeal','scout','mo']];

/* ---------- Helfer ---------- */
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const ease=u=>u*u*(3-2*u);
function sample(track,t){
  for(let i=0;i<track.length-1;i++){
    const a=track[i], b=track[i+1];
    if(t>=a[0]&&t<=b[0]){
      const u=b[0]===a[0]?1:ease((t-a[0])/(b[0]-a[0]));
      return {x:a[1]+(b[1]-a[1])*u, y:a[2]+(b[2]-a[2])*u, op:a[3]+(b[3]-a[3])*u};
    }
  }
  const l=track[track.length-1]; return {x:l[1],y:l[2],op:l[3]};
}
function div(cls,parent,html){ const d=document.createElement('div'); if(cls) d.className=cls; if(html!=null) d.innerHTML=html; if(parent) parent.appendChild(d); return d; }

/* ---------- Eine Bühne ---------- */
function Scene(world){
  const m = MODES[world.dataset.mode];
  const W=m.W, H=m.H;
  const tr = tracks(m);
  const reduced=()=>mq.matches;
  let k=1, vis=true, dirty=true;
  const cam={x:0,y:0};
  const ptr={wx:0,wy:0,last:-99,nx:0,ny:0};
  let gyro=null;

  /* Schichten: far / mid / road (Straße), dann Figuren, dann Vordergrund */
  const fore = m.layers()(world).fore;
  const layers={};
  ['far','mid','road'].forEach(n=>{ layers[n]=world.querySelector('.l-'+n); });
  const sunEl = world.querySelector('#sun, #sun-p');
  const figsEl = div('figs',world);
  world.appendChild(fore); layers.fore=fore;
  for(const n in layers){
    const s=layers[n]; s.style.left=(-70/W*100)+'%'; s.style.top=(-40/H*100)+'%'; s.style.width=((W+140)/W*100)+'%'; s.style.height=((H+80)/H*100)+'%';
  }
  const over = div('over',world);
  div('light',world);

  /* Figuren */
  const F={};
  ORDER.forEach((id,i)=>{
    const d=FIG[id];
    const b=document.createElement('button'); b.type='button'; b.className='fig'; b.dataset.fig=id;
    b.setAttribute('aria-label',`${d.name}, ${d.role}. Show what ${d.name} does.`);
    b.setAttribute('aria-expanded','false');
    const box=div('box',b); div('ring',box); const sh=div('sh',box); const tilt=div('tilt',box);
    const imgs={};
    ['rest','hover','klick'].forEach(p=>{
      const im=new Image(); im.alt=''; im.decoding='async'; im.draggable=false;
      im.src=`img/figuren/${id}${p==='rest'?'':'_'+p}.webp`; if(p==='rest') im.className='on'; tilt.appendChild(im); imgs[p]=im;
    });
    figsEl.appendChild(b);
    const tag=div('tag',over,d.name); tag.setAttribute('aria-hidden','true');
    const f=F[id]={id,d,el:b,box,sh,tilt,imgs,tag,pose:'rest',hov:false,phase:Math.random()*6,off:i*1.7,
      x:tr[id][0][1],y:tr[id][0][2],op:1,dir:1,yaw:0,pitch:0,sc:1,blink:-99,blinkNext:1.5+i*1.1};
    b.addEventListener('pointerenter',()=>{f.hov=true;dirty=true});
    b.addEventListener('pointerleave',()=>{f.hov=false;dirty=true});
    b.addEventListener('focus',()=>{f.hov=true;dirty=true});
    b.addEventListener('blur',()=>{f.hov=false;dirty=true});
    b.addEventListener('click',e=>{e.stopPropagation(); toggleCard(id)});
  });

  /* Blasen und Stempel */
  const isPh=world.dataset.mode==='phone';
  const bubs=TALK.filter(t=>!(isPh&&t[8]==='d')).map(t=>{ const el=div('bub'+(t[6]==='pink'?' pink':''),over,((isPh&&t[7])||t[3]).join('<br>')); el.setAttribute('aria-hidden','true'); return {t,el}; });
  const stamps=STAMPS.map(s=>{ const el=div('stamp '+s[3],over,s[2]); el.setAttribute('aria-hidden','true'); return {s,el}; });

  /* Karte mit der Aufgabe */
  const card=div('card',over); card.setAttribute('role','dialog'); card.setAttribute('aria-label','Agent task');
  const cardClose=document.createElement('button'); cardClose.type='button'; cardClose.textContent='×'; cardClose.setAttribute('aria-label','Close'); card.appendChild(cardClose);
  const cardBody=div('',card);
  let open=null, openAt=0;
  function toggleCard(id){ if(open===id) closeCard(true); else openCard(id); }
  function openCard(id){
    if(open) F[open].el.setAttribute('aria-expanded','false');
    open=id; openAt=performance.now(); const d=F[id].d;
    cardBody.innerHTML=`<span class="role" style="--c:${d.c}">${d.role}</span><h3>${d.name}</h3><p>${d.task}</p>`;
    card.classList.add('on'); F[id].el.setAttribute('aria-expanded','true'); dirty=true;
  }
  function closeCard(refocus){
    if(!open) return; const f=F[open]; f.el.setAttribute('aria-expanded','false'); open=null; card.classList.remove('on'); dirty=true;
    if(refocus) f.el.focus({preventScroll:true});
  }
  cardClose.addEventListener('click',e=>{e.stopPropagation();closeCard(true)});
  card.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('click',()=>closeCard(false));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeCard(true); });

  /* Zeigen / Neigen */
  window.addEventListener('pointermove',e=>{
    const r=world.getBoundingClientRect(); if(!r.width) return;
    ptr.wx=(e.clientX-r.left)/r.width*W; ptr.wy=(e.clientY-r.top)/r.height*H;
    ptr.nx=clamp(e.clientX/innerWidth*2-1,-1,1); ptr.ny=clamp(e.clientY/innerHeight*2-1,-1,1); ptr.last=performance.now();
  },{passive:true});
  window.addEventListener('deviceorientation',e=>{ if(e.gamma==null) return; gyro={x:clamp(e.gamma/22,-1,1),y:clamp(((e.beta||50)-50)/30,-1,1)}; },{passive:true});
  if('IntersectionObserver' in window) new IntersectionObserver(es=>{vis=es[0].isIntersecting;}).observe(world);

  /* ---------- ein Bild ---------- */
  let last=performance.now(); const t0=last;
  function frame(now){
    const dt=Math.min(.05,(now-last)/1000); last=now;
    k=world.clientWidth/W;
    if(!k||!vis) return;
    const still=reduced();
    if(still && !dirty) return;
    dirty=false;
    const tt = still ? STILL_T : (now-t0)/1000;
    const T = still ? STILL_T : tt%LOOP;
    const ptrActive = !still && (now-ptr.last)<3500;

    /* Kamera (Parallax): Zeiger/Kippen + langsames Eigenschwingen */
    if(still){ cam.x=cam.y=0; } else {
      let tx=Math.sin(tt/6.5)*.7, ty=Math.sin(tt/8.3+1)*.3;
      if(gyro){ tx+=gyro.x; ty+=gyro.y*.6; } else if(ptrActive){ tx+=ptr.nx; ty+=ptr.ny*.6; }
      cam.x+=(tx-cam.x)*Math.min(1,dt*3); cam.y+=(ty-cam.y)*Math.min(1,dt*3);
    }
    const A=m.amp*k;
    const dep={far:.2,mid:.45,road:.8,fore:1.55};
    for(const n in layers) layers[n].style.transform=`translate3d(${(-cam.x*A*dep[n]).toFixed(2)}px,${(-cam.y*A*dep[n]*.5).toFixed(2)}px,0)`;
    const camF=`translate3d(${(-cam.x*A*.9).toFixed(2)}px,${(-cam.y*A*.45).toFixed(2)}px,0)`;
    figsEl.style.transform=camF; over.style.transform=camF;
    /* Sonne wandert (Tageslicht läuft per CSS) */
    if(sunEl && !still){ const p=(tt%84)/84; sunEl.setAttribute('transform',`translate(${(Math.sin(p*6.283)*40).toFixed(1)},${(Math.cos(p*6.283)*-10).toFixed(1)})`); }

    const legEl=world.parentNode.querySelector('.legend'); const legH=(legEl&&getComputedStyle(legEl).position==='absolute')?legEl.offsetHeight:0;
    /* Figuren */
    ORDER.forEach(id=>{
      const f=F[id], s=sample(tr[id],T), s2=sample(tr[id],(T+.06)%LOOP), s0=sample(tr[id],(T-.06+LOOP)%LOOP);
      let vx=(s2.x-s0.x)/.12, vy=(s2.y-s0.y)/.12;
      if(still || Math.abs(s2.x-s0.x)>300) vx=vy=0;
      const sp=Math.hypot(vx,vy), walking=sp>14;
      f.x=s.x; f.y=s.y; f.op=s.op;
      if(walking){ f.phase+=sp*dt*.14; if(Math.abs(vx)>8) f.dir=vx>0?1:-1; }
      const sc = m.sFar+clamp((s.y-m.yFar)/(m.yNear-m.yFar),-.5,1.6)*(1-m.sFar);
      f.sc=sc;
      const H0=m.hFig;
      const act0=bubs.find(b=>b.t[2]===id&&T>=b.t[0]&&T<=b.t[1]);
      const hop = walking ? Math.abs(Math.sin(f.phase))*H0*.062 : ((!still&&act0)?Math.abs(Math.sin(tt*6.5+f.off))*H0*.014:0);
      const roll = walking ? Math.sin(f.phase)*5.6+f.dir*3 : (still?0:Math.sin(tt/2.3+f.off)*1.7);
      const sway = (walking||still)?0:Math.sin(tt/3.1+f.off*1.3)*H0*.012;
      const breathe = still?1:1+Math.sin(tt*2*Math.PI/3.1+f.off)*.026;
      const squash = walking ? 1-Math.abs(Math.cos(f.phase))*.048 : 1;
      const act=bubs.find(b=>b.t[2]===id&&T>=b.t[0]&&T<=b.t[1]);
      /* Blick: Zeiger, sonst zum Gesprächspartner, sonst geradeaus */
      let yawT=0, pitchT=0;
      if(ptrActive){ yawT=clamp((ptr.wx-s.x)/W*46,-17,17); pitchT=clamp(-(ptr.wy-(s.y-H0*.55*sc))/H*26,-9,9); }
      else if(!still){
        yawT=Math.sin(tt/2.7+f.off*1.9)*7; pitchT=Math.sin(tt/3.9+f.off)*2.5;
        if(act){ const o=(id==='scout'||id==='dash')?'mo':(id==='mo'?'scout':null); if(o) yawT=F[o].x>s.x?11:-11; }
        if(walking) yawT=f.dir*10;
      }
      f.yaw+=(yawT-f.yaw)*Math.min(1,dt*5); f.pitch+=(pitchT-f.pitch)*Math.min(1,dt*5);
      const flip = f.d.flip && f.dir<0 ? -1 : 1;
      const lift = (f.hov||open===id)?H0*.02:0;
      f.tilt.style.transform=`perspective(${(H0*4.2).toFixed(0)}px) translate(${sway.toFixed(2)}px,${(-hop-lift).toFixed(2)}px) rotateY(${(f.yaw*flip).toFixed(2)}deg) rotateX(${f.pitch.toFixed(2)}deg) rotateZ(${roll.toFixed(2)}deg) scale(${flip},${(breathe*squash).toFixed(4)})`;
      f.sh.style.transform=`scale(${(1-hop/H0*4).toFixed(3)},1)`;
      /* Pose */
      let pose='rest';
      if(act) pose=act.t[4];
      if(id==='dash'&&walking&&!act) pose='klick';
      if(!still && !act && !walking){ // kurzer Blickwechsel zwischendurch
        if(tt>f.blinkNext){ f.blink=tt; f.blinkNext=tt+2.8+Math.random()*3.2; }
        if(tt-f.blink<1.6) pose='hover';
      }
      if(open===id) pose='klick'; else if(f.hov) pose='hover';
      if(pose!==f.pose){ f.imgs[f.pose].classList.remove('on'); f.imgs[pose].classList.add('on'); f.pose=pose; }
      /* Platzieren */
      const bw=H0*.95;
      f.box.style.width=bw+'px'; f.box.style.height=H0+'px'; f.box.style.left=(-bw/2)+'px'; f.box.style.top=(-H0)+'px';
      f.el.style.transform=`translate3d(${(s.x*k).toFixed(2)}px,${(s.y*k).toFixed(2)}px,0) scale(${(sc*k).toFixed(4)})`;
      f.el.style.zIndex=Math.round(s.y);
      f.el.style.opacity=f.op.toFixed(2); f.el.style.pointerEvents=f.op<.5?'none':'';
      f.el.tabIndex = f.op<.5?-1:0;
      const tagY=Math.min(s.y*k+5, world.clientHeight-(legH||0)-(f.tag.offsetHeight||20)-3);
      f.tag.style.transform=`translate3d(${(s.x*k).toFixed(1)}px,${tagY.toFixed(1)}px,0) translateX(-50%)`;
      f.tag.style.opacity=f.op.toFixed(2);
    });
    /* Schriftgrößen: mit der Bühne mitwachsen, aber nie unter die lesbare Mindestgröße */
    over.style.setProperty('--bfs',Math.max(m.bfs*.82,m.bfs*k)+'px');
    over.style.setProperty('--tagfs',Math.max(m.tagfs*.85,m.tagfs*k)+'px');
    over.style.setProperty('--cfs',Math.max(m.cfs*.9,m.cfs*Math.min(k,1.3))+'px');
    over.style.setProperty('--cw',m.cw+'px');
    const WW=world.clientWidth;
    bubs.forEach(b=>{
      const [a,z,id,,,dy]=b.t; const f=F[id];
      const on = still ? (a<=STILL_T&&z>=STILL_T) : (T>=a&&T<=z);
      b.el.classList.toggle('on',on && f.op>.6);
      if(!on) return;
      const hh=m.hFig*f.sc*k;
      const headY=f.y*k-hh-12*k-(dy||0)*m.dyK*k;
      const bw=b.el.offsetWidth, cx=f.x*k, left=clamp(cx-bw/2,6,WW-bw-6);
      b.el.style.transform=`translate3d(${left.toFixed(1)}px,${(headY-b.el.offsetHeight).toFixed(1)}px,0)`;
      b.el.style.setProperty('--tail',clamp((cx-left)/bw*100,14,86)+'%');
    });
    stamps.forEach(s=>{
      const [a,z,,,i1,i2]=s.s; const on = still ? (a<=STILL_T&&z>=STILL_T) : (T>=a&&T<=z);
      s.el.classList.toggle('on',on); if(!on) return;
      const f1=F[i1], f2=F[i2]; const cx=(f1.x+f2.x)/2*k, y=(m.stampY!=null?m.stampY:(f1.y-m.hFig*f1.sc-m.stampUp))*k;
      s.el.style.transform=`translate3d(${(cx-s.el.offsetWidth/2).toFixed(1)}px,${(y-s.el.offsetHeight/2).toFixed(1)}px,0) rotate(-8deg)`;
    });
    /* Karte folgt der Figur */
    if(open){
      if(!still && now-openAt>9000){ closeCard(false); } else {
        const f=F[open], cw=card.offsetWidth, ch=card.offsetHeight, hh=m.hFig*f.sc*k;
        let x=f.x*k+hh*.38, y=f.y*k-hh*.9-ch*.2;
        if(x+cw>WW-6) x=f.x*k-hh*.38-cw;
        x=clamp(x,6,WW-cw-6); y=clamp(y,6,world.clientHeight-ch-6);
        card.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      }
    }
  }
  function loop(now){ frame(now); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  if('ResizeObserver' in window) new ResizeObserver(()=>{dirty=true}).observe(world);
  if(mq.addEventListener) mq.addEventListener('change',()=>{dirty=true});
  return {F,world};
}

window.__magents={scenes:[...document.querySelectorAll('.world')].map(Scene),LOOP};
})();
