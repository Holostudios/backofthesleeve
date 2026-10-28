(()=>{"use strict";const D=document,H=D.documentElement,$=(s,r=D)=>r.querySelector(s),$$=(s,r=D)=>[...r.querySelectorAll(s)];
const M=n=>{const e=$('meta[name="'+n+'"]');return e?e.content:""},BASE=M("bots-base"),RM=matchMedia("(prefers-reduced-motion:reduce)").matches;
const ls={g(k){try{return localStorage.getItem(k)}catch(e){return null}},s(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
/* tracking: cookie-free; counts outbound clicks locally, optional beacon endpoint / GoatCounter set in site_config.json */
const hit=(n,u)=>{try{const k="bots_clicks",o=JSON.parse(ls.g(k)||"{}");o[n]=(o[n]||0)+1;ls.s(k,JSON.stringify(o))}catch(e){}
const ep=M("bots-hit");if(ep&&navigator.sendBeacon)navigator.sendBeacon(ep,JSON.stringify({e:n,u:u||"",p:location.pathname,t:Date.now()}));
if(window.goatcounter&&goatcounter.count)goatcounter.count({path:"click/"+n,title:u||n,event:true})};
D.addEventListener("click",e=>{const a=e.target.closest("a[href]");if(!a)return;const h=a.getAttribute("href");if(a.dataset.t||/^https?:/.test(h)&&new URL(h,location).host!==location.host)hit(a.dataset.t||"outbound",h.split("?")[0])},true);
/* layout toggle: scroll | carousel | grid (saved) */
const setL=l=>{H.dataset.layout=l;ls.s("bots_layout",l);$$("[data-layout-set]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.layoutSet===l))};
setL(H.dataset.layout||"grid");$$("[data-layout-set]").forEach(b=>b.addEventListener("click",()=>setL(b.dataset.layoutSet)));
const tgt=()=>$(".secs")||$(".cards[data-carousel]")||$(".cards");
const slide=d=>{const t=tgt();if(t)t.scrollBy({left:d*(t.clientWidth*.9),behavior:RM?"auto":"smooth"})};
$$("[data-slide]").forEach(b=>b.addEventListener("click",()=>slide(+b.dataset.slide)));
D.addEventListener("keydown",e=>{if(H.dataset.layout!=="carousel"||/INPUT|TEXTAREA|SELECT/.test(D.activeElement.tagName))return;if(e.key==="ArrowRight")slide(1);if(e.key==="ArrowLeft")slide(-1)});
/* reveal */
if("IntersectionObserver"in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px"});$$(".rv,.tl").forEach(n=>io.observe(n))}else $$(".rv,.tl").forEach(n=>n.classList.add("in"));
/* scroll: progress, parallax, sticky bar, slide-in */
const pg=$(".prog"),bg=$(".hero .bgi"),st=$(".stick"),si=$(".slide");let tick=0,siShown=false;
const sc=()=>{tick=0;const y=scrollY,h=H.scrollHeight-innerHeight,p=h>0?y/h:0;if(pg)pg.style.transform="scaleX("+p+")";if(bg&&!RM&&y<900)bg.style.transform="translate3d(0,"+(y*.18).toFixed(1)+"px,0)";
if(st){const on=y>500;st.classList.toggle("on",on)}
if(si&&!siShown&&p>.6&&!ls.g("bots_nl_x")){siShown=true;si.hidden=false;requestAnimationFrame(()=>si.classList.add("on"))}};
addEventListener("scroll",()=>{if(!tick)tick=requestAnimationFrame(sc)},{passive:true});sc();
const cl=$(".slide .cl");if(cl)cl.addEventListener("click",()=>{si.classList.remove("on");ls.s("bots_nl_x","1");setTimeout(()=>si.hidden=true,500)});
/* video facade, hover preview, floating mini-player */
const yt=(id,q)=>{const f=D.createElement("iframe");f.src="https://www.youtube-nocookie.com/embed/"+id+"?"+q;f.title="YouTube video player";f.allow="accelerometer; autoplay; encrypted-media; picture-in-picture";f.allowFullscreen=true;f.referrerPolicy="strict-origin-when-cross-origin";return f};
$$(".vplayer[data-vid]").forEach(p=>{const b=$(".play",p);if(!b)return;let pv;
const load=()=>{clearTimeout(pv);const o=$("iframe",p);if(o)o.remove();p.appendChild(yt(p.dataset.vid,"autoplay=1&rel=0&modestbranding=1&playsinline=1"));b.hidden=true;p.dataset.on="1";hit("video_play",p.dataset.vid)};
b.addEventListener("click",load);
if(p.dataset.hover&&matchMedia("(hover:hover) and (pointer:fine)").matches){p.addEventListener("pointerenter",()=>{if(p.dataset.on)return;pv=setTimeout(()=>{const f=yt(p.dataset.vid,"autoplay=1&mute=1&controls=0&loop=1&playlist="+p.dataset.vid+"&playsinline=1&rel=0&modestbranding=1");f.style.pointerEvents="none";f.className="prev";p.appendChild(f)},650)});p.addEventListener("pointerleave",()=>{clearTimeout(pv);if(!p.dataset.on){const f=$("iframe.prev",p);if(f)f.remove()}})}});
const dock=$(".vwrap .vplayer[data-vid]");if(dock&&"IntersectionObserver"in window&&!$(".vwrap").dataset.nodock){let closed=false,dx=0,dy=0;
new IntersectionObserver(([e])=>{if(closed)return;const away=!e.isIntersecting&&e.boundingClientRect.top<0;dock.classList.toggle("docked",away)},{threshold:.15}).observe($(".vwrap"));
const x=D.createElement("button");x.className="x";x.type="button";x.setAttribute("aria-label","Close mini player");x.textContent="\u00d7";const dg=D.createElement("div");dg.className="dg";dg.setAttribute("aria-hidden","true");dock.append(dg,x);
x.addEventListener("click",()=>{closed=true;dock.classList.remove("docked");const f=$("iframe",dock);if(f)f.remove();const b=$(".play",dock);if(b)b.hidden=false;delete dock.dataset.on});
let sx,sy,ox,oy,drag=false;dg.addEventListener("pointerdown",e=>{drag=true;sx=e.clientX;sy=e.clientY;ox=dx;oy=dy;dg.setPointerCapture(e.pointerId);dg.style.cursor="grabbing"});
dg.addEventListener("pointermove",e=>{if(!drag)return;dx=ox+e.clientX-sx;dy=oy+e.clientY-sy;const r=dock.getBoundingClientRect();dock.style.setProperty("--dx",dx+"px");dock.style.setProperty("--dy",dy+"px")});
const up=()=>{drag=false;dg.style.cursor="";const r=dock.getBoundingClientRect(),W=innerWidth,Hh=innerHeight;if(r.left<8)dx+=8-r.left;if(r.right>W-8)dx-=r.right-W+8;if(r.top<70)dy+=70-r.top;if(r.bottom>Hh-8)dy-=r.bottom-Hh+8;dock.style.setProperty("--dx",dx+"px");dock.style.setProperty("--dy",dy+"px")};dg.addEventListener("pointerup",up);dg.addEventListener("pointercancel",up)}
/* search + artist filter */
const si2=$(".srch input"),sr=$(".sres");let idx=null;
if(si2)si2.addEventListener("input",async()=>{const q=si2.value.trim().toLowerCase();if(!q){sr.classList.remove("on");return}
if(!idx){try{idx=await (await fetch(BASE+"/search.json")).json()}catch(e){idx=[]}}
const r=idx.filter(i=>(i.t+" "+i.a+" "+i.d).toLowerCase().includes(q)).slice(0,6);sr.innerHTML=r.length?r.map(i=>'<a href="'+BASE+i.u+'">'+i.t.replace(/</g,"&lt;")+"<small>"+i.a.replace(/</g,"&lt;")+" \u00b7 "+i.k+"</small></a>").join(""):'<a href="'+BASE+'/blog/">No match yet. Browse all stories</a>';sr.classList.add("on")});
D.addEventListener("click",e=>{if(sr&&!e.target.closest(".srch"))sr.classList.remove("on")});
$$(".chips button").forEach(b=>b.addEventListener("click",()=>{const a=b.dataset.artist;$$(".chips button").forEach(x=>x.setAttribute("aria-pressed",x===b));$$(".cards .card[data-artist],.feat[data-artist]").forEach(c=>c.hidden=!(a==="all"||c.dataset.artist===a))}));
/* share */
$$("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{const u=location.href.split("#")[0];try{if(navigator.share&&matchMedia("(pointer:coarse)").matches)await navigator.share({title:D.title,url:u});else{await navigator.clipboard.writeText(u);b.textContent="Link copied"}}catch(e){}hit("share_copy")}));
/* ads (off unless enabled in site_config.json) */
const ac=M("bots-ads");if(ac){H.classList.add("ads-on");const s=D.createElement("script");s.async=true;s.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+ac;s.crossOrigin="anonymous";addEventListener("load",()=>D.head.appendChild(s),{once:true})}
const gc=M("bots-goat");if(gc){addEventListener("load",()=>{const s=D.createElement("script");s.async=true;s.dataset.goatcounter="https://"+gc+".goatcounter.com/count";s.src="https://gc.zgo.at/count.js";D.head.appendChild(s)},{once:true})}
})();
