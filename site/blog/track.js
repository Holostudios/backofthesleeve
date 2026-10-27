/* Back of the Sleeve blog tracker (free, first-party, no cookies, no personal data).
   Logs: pageview, active read time, max scroll depth, 10-band scroll strip, click points (x/y as % of page) and
   outbound clicks (all outbound links are /go/ tracked links). Sent once on page hide to a Netlify Function (Blobs). */
(()=>{const S=document.currentScript,post=S&&S.dataset.post||location.pathname,E="/.netlify/functions/blog-hit";
if(navigator.webdriver||/bot|crawl|spider/i.test(navigator.userAgent))return;
const t0=Date.now();let active=0,last=Date.now(),vis=!document.hidden,max=0;const bands=Array(10).fill(0),clicks=[];
const tick=()=>{const n=Date.now();if(vis&&n-last<30000)active+=n-last;last=n};
["scroll","mousemove","keydown","touchstart"].forEach(e=>addEventListener(e,tick,{passive:true}));
document.addEventListener("visibilitychange",()=>{tick();vis=!document.hidden;if(document.hidden)send()});
setInterval(()=>{tick();const h=document.documentElement,p=Math.min(100,Math.round(100*(h.scrollTop+h.clientHeight)/h.scrollHeight));max=Math.max(max,p);if(vis)bands[Math.min(9,Math.floor((h.scrollTop+h.clientHeight/2)/h.scrollHeight*10))]+=1},1000);
addEventListener("click",e=>{const h=document.documentElement,a=e.target.closest("a");if(clicks.length<40)clicks.push({x:+(100*e.pageX/h.scrollWidth).toFixed(1),y:+(100*e.pageY/h.scrollHeight).toFixed(1),href:a?a.getAttribute("href"):null,yt:a&&a.hasAttribute("data-yt")?1:0})},{capture:true});
document.addEventListener("submit",e=>{if(e.target.dataset.track=="signup")clicks.push({signup:1})},{capture:true});
let sent=false;function send(){if(sent)return;sent=true;const b=JSON.stringify({post,ref:document.referrer.slice(0,200),src:new URLSearchParams(location.search).get("utm_source")||"",ms:active,total:Date.now()-t0,depth:max,bands,clicks,w:innerWidth});navigator.sendBeacon?navigator.sendBeacon(E,b):fetch(E,{method:"POST",body:b,keepalive:true})}
addEventListener("pagehide",send);})();
