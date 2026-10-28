/* Competitors tab (Back of the Sleeve dashboard): side-by-side ranking against the most similar channels and videos nearly identical to ours.
   Data: competitors/comp_public.json (public YouTube data collected free with yt-dlp) + D.competitor_private (encrypted, our unreleased ideas).
   Also holds the AI analyst panel ("local AI paused" state until Holo resumes the local model). */
(function () {
"use strict";
if (window.CP) return; const CP = window.CP = { ready: false, data: null, err: null };
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fN = x => x == null ? "-" : (x >= 1e6 ? (x / 1e6).toFixed(2) + "M" : x >= 1e4 ? Math.round(x / 1e3) + "K" : x >= 1000 ? (x / 1000).toFixed(1) + "K" : String(Math.round(x * 10) / 10));
const LOCAL = ["localhost", "127.0.0.1", "[::1]", "::1"].indexOf(location.hostname) >= 0;
const CSS = `main{min-width:0}.cp-wrap{display:flex;flex-direction:column;gap:14px;min-width:0;max-width:100%}
.cp-box{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:18px;min-width:0}.cp-box h3{font-size:14.5px;font-weight:650}.cp-box .d{color:var(--muted);font-size:12.5px;margin:2px 0 12px}
.cp-kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}.cp-kpi div{background:var(--panel);padding:14px 16px}.cp-kpi b{display:block;font-size:24px;letter-spacing:-.03em;font-variant-numeric:tabular-nums}.cp-kpi span{color:var(--muted);font-size:12px}
.cp-place{display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 14px}.cp-pl{border:1px solid var(--line);background:#0a0911;border-radius:12px;padding:8px 12px;min-width:130px}.cp-pl b{font-size:20px;font-variant-numeric:tabular-nums}.cp-pl span{display:block;color:var(--muted);font-size:11.5px}
.cp-sort{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px;align-items:center;color:var(--muted);font-size:12px}.cp-sort button,.cp-chip{border:1px solid var(--line);background:#0a0911;color:var(--muted);border-radius:99px;padding:5px 11px;font-size:12px;cursor:pointer}.cp-sort button.on,.cp-chip.on{color:var(--text);border-color:var(--acc);background:#c084fc14}
.cp-g{display:grid;grid-template-columns:120px minmax(0,2.6fr) minmax(0,1.3fr) .8fr .8fr .7fr .6fr .8fr .6fr;gap:10px;align-items:center;padding:10px 4px;border-bottom:1px solid #ffffff0a;font-size:12.5px}.cp-g.h{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.05em;padding:6px 4px}.cp-g.me{background:linear-gradient(90deg,#c084fc18,transparent);border:1px solid #c084fc55;border-radius:12px}.cp-g > *{min-width:0}
.cp-th{width:120px;aspect-ratio:16/9;border-radius:8px;border:1px solid var(--line);object-fit:cover;background:#0a0911;display:block}.cp-t{font-weight:600;font-size:13px;line-height:1.35}.cp-t a{text-decoration:none}.cp-t a:hover{color:var(--acc)}.cp-pt{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}.cp-pt i{font-style:normal;font-size:10.5px;border:1px solid var(--line);border-radius:99px;padding:1px 7px;color:var(--muted)}
.cp-n{font-variant-numeric:tabular-nums}.cp-hi{color:var(--ok)}.cp-lo{color:var(--muted)}.cp-s{display:inline-block;min-width:32px;text-align:center;font-weight:700;font-size:12px;border-radius:99px;padding:2px 8px;border:1px solid #ffffff22}.cp-s.hi{color:#6ee7b7;border-color:#34d39966}.cp-s.md{color:#fcd34d;border-color:#fbbf2466}.cp-s.lo{color:#fda4af;border-color:#fb718566}
.cp-me{font-size:10px;font-weight:800;letter-spacing:.1em;color:#0b0a10;background:var(--acc);border-radius:99px;padding:1px 8px;margin-right:6px}
.cp-lab{display:none;color:var(--muted);font-size:10.5px}
.cp-c{display:grid;grid-template-columns:34px minmax(0,2fr) .9fr .9fr .9fr .7fr .7fr minmax(0,1.6fr) 1fr;gap:10px;align-items:center;padding:9px 4px;border-bottom:1px solid #ffffff0a;font-size:12.5px}.cp-c.h{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.05em}.cp-c > *{min-width:0}.cp-c a{text-decoration:none;font-weight:600}.cp-c a:hover{color:var(--acc)}
.cp-bar{height:6px;background:#ffffff0d;border-radius:99px;overflow:hidden}.cp-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--acc),var(--acc2))}
.cp-in{width:100%;background:#0b0a12;color:var(--text);border:1px solid #2a2540;border-radius:12px;padding:11px 13px;font:inherit;font-size:16px;outline:none}.cp-in:focus{border-color:var(--acc)}
.cp-ai{border:1px dashed #fbbf2466;background:#fbbf2408;border-radius:12px;padding:12px 14px;font-size:13px;margin-bottom:12px}.cp-ai b{color:#fcd34d}.cp-fact{font-size:12.5px;padding:8px 0;border-bottom:1px solid #ffffff0a;color:#d8d3ee}
.cp-sc{overflow-x:auto}
@media(max-width:860px){.cp-g.h,.cp-c.h{display:none}.cp-g{grid-template-columns:96px 1fr 1fr;gap:6px 10px;padding:12px 6px}.cp-g .cp-th{width:96px;grid-row:span 3}.cp-g>.t{grid-column:2/4}.cp-g>.pt{grid-column:2/4}.cp-lab{display:block}.cp-c{grid-template-columns:28px 1fr 1fr;gap:4px 10px;padding:12px 4px}.cp-c>.nm{grid-column:2/4}.cp-c>.pa{grid-column:1/4}}`;
function css() { if (document.getElementById("cp-css")) return; const s = document.createElement("style"); s.id = "cp-css"; s.textContent = CSS; document.head.appendChild(s); }
const tier = n => n == null ? "lo" : n >= 67 ? "hi" : n >= 40 ? "md" : "lo";
const L = s => String(s == null ? "" : s).replace(/\{[A-Z]\}/g, "…");
const ago = d => d == null ? "-" : d < 2 ? "today" : d < 60 ? Math.round(d) + " days ago" : d < 700 ? Math.round(d / 30.4) + " months ago" : "about " + Math.round(d / 365) + " years ago";
const thumb = id => id ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/mqdefault.jpg` : "";
const vlink = id => id ? `https://www.youtube.com/watch?v=${encodeURIComponent(id)}` : "";
let state = { g: 0, sort: "similarity", chan: "all", q: "" };
function groups() { const d = CP.data; if (!d) return []; const priv = (typeof D !== "undefined" && D && D.competitor_private && D.competitor_private.groups) || []; return d.groups.concat(priv); }
function sortRows(rows) {
  const k = state.sort, f = { similarity: r => r.similarity, views: r => r.views, vpd: r => r.vpd, outlier: r => r.outlier, score: r => r.score }[k] || (r => r.similarity);
  return rows.slice().sort((a, b) => (f(b) == null ? -1 : f(b)) - (f(a) == null ? -1 : f(a)));
}
function row(r, me) {
  const t = r.is_ours ? `<span class="cp-me">US</span>` : "";
  const img = r.id ? `<a href="${r.is_ours ? "#" : vlink(r.id)}" ${r.is_ours ? "" : 'target="_blank" rel="noopener"'}><img class="cp-th" loading="lazy" src="${thumb(r.id)}" alt="" onerror="this.style.visibility='hidden'"></a>` : `<div class="cp-th" style="display:grid;place-items:center;color:var(--muted);font-size:11px">no thumbnail yet</div>`;
  const ttl = r.id && !r.is_ours ? `<a href="${vlink(r.id)}" target="_blank" rel="noopener">${esc(r.title)}</a>` : esc(r.title);
  const vpdCls = r.vpd != null && r.vpd >= 50 ? "cp-hi" : "";
  return `<div class="cp-g${me ? " me" : ""}">${img}<div class="t"><div class="cp-t">${t}${ttl}</div><div class="cp-pt pt">${(r.patterns || []).map(p => `<i>${esc(L(p))}</i>`).join("") || '<i>no frame pattern</i>'}</div></div>
  <div><span class="cp-lab">Channel</span>${esc(r.channel || "-")}<div class="muted" style="font-size:11.5px">${r.subs != null ? fN(r.subs) + " subs" : "subs n/a"}</div></div>
  <div class="cp-n"><span class="cp-lab">Views</span>${fN(r.views)}</div><div class="cp-n ${vpdCls}"><span class="cp-lab">Views/day</span>${r.vpd != null ? fN(r.vpd) : "-"}</div>
  <div class="cp-n"><span class="cp-lab">Outlier</span>${r.outlier != null ? (r.outlier > 99 ? "99x+" : r.outlier + "x") : '<span class="muted" title="needs channel history">n/a</span>'}</div><div class="cp-n"><span class="cp-lab">Length</span>${r.min != null ? Math.round(r.min) + " min" : "-"}</div>
  <div class="cp-n"><span class="cp-lab">Uploaded</span>${r.is_ours ? esc(r.upload || "-") : esc(ago(r.age_days))}</div><div><span class="cp-lab">Title score</span><span class="cp-s ${tier(r.score)}">${r.score == null ? "-" : r.score}</span></div></div>`;
}
function head() { return `<div class="cp-g h"><div>Thumbnail</div><div>Title and pattern</div><div>Channel</div><div>Views</div><div>Views/day</div><div>Outlier</div><div>Length</div><div>Uploaded (est.)</div><div>Score</div></div>`; }
function placeChip(label, p) { return `<div class="cp-pl"><b>${p && p.rank ? "#" + p.rank + " <small class=muted>of " + p.of + "</small>" : "-"}</b><span>${label}</span></div>`; }
function groupHtml() {
  const G = groups(); if (!G.length) return '<div class="muted">No comparison groups yet.</div>'; if (state.g >= G.length) state.g = 0; const g = G[state.g];
  const rows = sortRows(g.matches); const all = [g.our].concat(rows);
  const sorts = [["similarity", "Most similar"], ["views", "Views"], ["vpd", "Views/day"], ["outlier", "Outlier"], ["score", "Title score"]];
  return `<div class="seg" id="cpSeg">${G.map((x, i) => `<button class="${i === state.g ? "on" : ""}" data-g="${i}">${esc(x.artist)}${x.our_live ? "" : " (upcoming)"}</button>`).join("")}</div>
  <div class="d">Our title: <b>${esc(g.our_title)}</b>${g.our_live ? "" : " (best honest draft; not published yet)"}. Compared with ${g.n_compared} videos about the same artist, found with free YouTube searches.</div>
  <div class="cp-place">${placeChip("by title score", g.placement.by_title_score)}${placeChip("by views", g.placement.by_views)}${placeChip("by views per day", g.placement.by_views_per_day)}</div>
  <div class="cp-sort"><span>Sort field:</span>${sorts.map(s => `<button data-s="${s[0]}" class="${state.sort === s[0] ? "on" : ""}">${s[1]}</button>`).join("")}</div>
  <div class="cp-sc">${head()}${row(g.our, true)}${rows.map(r => row(r)).join("")}</div>
  <div class="muted" style="font-size:11.5px;margin-top:10px">Outlier = views / that channel's median views (long uploads over 21 days old). Views/day = views / max(age, 7 days). Title score = the Title Lab model (0-100 vs real titles). Our own video is brand new, so views are not comparable yet; the title score is the fair comparison today.</div>`;
}
function chanHtml() {
  const d = CP.data; let cs = d.channels.slice();
  if (state.chan === "small") cs = cs.filter(c => c.subs != null && c.subs < 20000); else if (state.chan === "big") cs = cs.filter(c => c.subs != null && c.subs >= 100000);
  const mx = Math.max.apply(null, d.channels.map(c => c.similarity));
  const me = `<div class="cp-c" style="background:linear-gradient(90deg,#c084fc18,transparent);border:1px solid #c084fc55;border-radius:12px"><div>-</div><div class="nm"><span class="cp-me">US</span><b>Back of the Sleeve</b></div><div class="cp-n"><span class="cp-lab">Subs</span>${d.ours && d.ours.subscribers != null ? fN(d.ours.subscribers) : "-"}</div><div class="cp-n"><span class="cp-lab">Median views</span>-</div><div class="cp-n"><span class="cp-lab">Views/day</span>-</div><div>-</div><div>-</div><div class="pa muted" style="font-size:11.5px">${d.ours && d.ours.videos ? d.ours.videos.length : 0} videos so far</div><div></div></div>`;
  return `<div class="cp-sort" id="cpChan"><span>Show:</span>${[["all", "All similar"], ["small", "Small (under 20K subs)"], ["big", "Big (100K+)"]].map(s => `<button data-c="${s[0]}" class="${state.chan === s[0] ? "on" : ""}">${s[1]}</button>`).join("")}</div>
  <div class="cp-sc"><div class="cp-c h"><div>#</div><div>Channel</div><div>Subs</div><div>Median views</div><div>Median views/day</div><div>Avg length</div><div>Per month</div><div>Winning patterns and best outlier</div><div>Similarity</div></div>${me}
  ${cs.map(c => { const b = c.best && c.best[0]; return `<div class="cp-c"><div class="cp-n muted">${c.rank}</div><div class="nm"><a href="https://www.youtube.com/channel/${encodeURIComponent(c.id)}" target="_blank" rel="noopener">${esc(c.name)}</a></div>
  <div class="cp-n"><span class="cp-lab">Subs</span>${c.subs != null ? fN(c.subs) : "-"}</div><div class="cp-n"><span class="cp-lab">Median views</span>${fN(c.median_views)}</div><div class="cp-n"><span class="cp-lab">Views/day</span>${fN(c.median_vpd)}</div><div class="cp-n"><span class="cp-lab">Length</span>${Math.round(c.avg_min)} min</div><div class="cp-n"><span class="cp-lab">Per month</span>${c.cadence_per_month != null ? c.cadence_per_month : "-"}</div>
  <div class="pa"><div class="cp-pt" style="margin:0 0 4px">${(c.top_patterns || []).map(p => `<i>${esc(L(p.label))} (${p.n})</i>`).join("")}</div>${b ? `<a href="${vlink(b.id)}" target="_blank" rel="noopener" style="font-weight:500;font-size:11.5px">${esc(b.title)}</a> <span class="muted" style="font-size:11.5px">${fN(b.views)} views, ${b.outlier}x median</span>` : ""}</div>
  <div><div class="cp-bar"><i style="width:${Math.round(c.similarity / mx * 100)}%"></i></div><span class="muted" style="font-size:11px">${c.similarity}</span></div></div>`; }).join("")}</div>`;
}
function patternsHtml() {
  const d = CP.data, fr = (d.frames || []).filter(f => f.n >= 30).sort((a, b) => b.lift - a.lift).slice(0, 8);
  if (!fr.length) return '<div class="muted">No pattern data.</div>';
  return `<div class="cp-sc"><table><tr><th>Title frame</th><th>Lift</th><th>95% range</th><th>Videos</th><th>Confidence</th><th>Real example</th></tr>${fr.map(f => `<tr><td>${esc(L(f.label))}</td><td class="cp-n"><b>${f.lift.toFixed(2)}x</b></td><td class="cp-n muted">${f.lo.toFixed(2)} to ${f.hi.toFixed(2)}</td><td class="cp-n">${f.n}</td><td>${esc(f.conf)}</td><td class="muted" style="font-size:12px">${esc(f.example || "")}</td></tr>`).join("")}</table></div>`;
}
function testHtml() { return `<input class="cp-in" id="cpIn" placeholder="Type a title to see where it would rank against this field..." maxlength="140"><div id="cpRes" class="d" style="margin-top:10px"></div>`; }
function doTest(v) {
  const el = document.getElementById("cpRes"); if (!el) return; v = v.trim(); if (!v) { el.innerHTML = ""; return; }
  if (!window.TL) { el.textContent = "Title Lab module not loaded."; return; }
  if (!TL.ready) { el.textContent = "Title model loading..."; TL.ensure(() => doTest(v)); return; }
  const G = groups(); const g = G[state.g] || G[0]; const mine = TL.fullScore(v, "long").score; const field = g ? g.matches.map(m => m.score).filter(x => x != null) : [];
  const better = field.filter(x => x > mine).length; el.innerHTML = `<span class="cp-s ${tier(mine)}">${mine}</span> Title Lab score. Against the ${field.length} near-identical ${g ? esc(g.artist) : ""} videos, it would rank <b>#${better + 1} of ${field.length + 1}</b> on predicted title strength (${better === 0 ? "top of the field" : better + " titles score higher"}).`;
}
let aiState = null;
async function aiStatus() {
  const el = document.getElementById("cpAiState"); if (!el) return;
  if (LOCAL) { try { const r = await fetch("http://127.0.0.1:8791/status"); aiState = await r.json(); } catch (e) { aiState = null; } }
  el.innerHTML = aiState && !aiState.paused ? `<b>Local AI running</b> (model ${esc(aiState.target_model)}).` : `<b>Local AI paused.</b> The local model project is on hold, so nothing is generated. The data store still answers with the best matching facts (no AI), and the title scorer above works. Resume steps are in RUNBOOK_competitors.md.`;
}
function offlineAnswer(q) {
  const d = CP.data; const words = (q.toLowerCase().match(/[a-z0-9']+/g) || []).filter(w => w.length > 2); if (!words.length) return [];
  const docs = [];
  d.channels.forEach(c => docs.push([`${c.name}: ${c.subs != null ? fN(c.subs) + " subs, " : ""}median ${fN(c.median_views)} views/video, ${fN(c.median_vpd)} views/day, ${Math.round(c.avg_min)} min avg, ${c.cadence_per_month}/month. Patterns: ${(c.top_patterns || []).map(p => p.label).join(", ")}.`, c.name]));
  groups().forEach(g => g.matches.forEach(m => docs.push([`"${m.title}" (${m.channel}): ${fN(m.views)} views, ${fN(m.vpd)}/day, ${m.outlier != null ? m.outlier + "x outlier, " : ""}${m.min} min, ${ago(m.age_days)}. Near our ${g.artist} video.`, m.title + " " + g.artist])));
  return docs.map(([t, k]) => [words.reduce((s, w) => s + ((t + " " + k).toLowerCase().includes(w) ? 1 : 0), 0), t]).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, 6).map(x => x[1]);
}
async function ask(q) {
  const out = document.getElementById("cpAns"); if (!q.trim()) return;
  if (aiState && !aiState.paused) { out.textContent = "Thinking..."; try { const r = await (await fetch("http://127.0.0.1:8791/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) })).json(); out.innerHTML = `<div class="cp-fact" style="white-space:pre-wrap">${esc(r.answer || "")}</div>`; return; } catch (e) { out.textContent = "Local AI not reachable."; return; } }
  const f = offlineAnswer(q); out.innerHTML = `<div class="muted" style="font-size:12px;margin-bottom:6px">Local AI is paused. Best matching facts from the data store (no AI used):</div>` + (f.map(x => `<div class="cp-fact">${esc(x)}</div>`).join("") || '<div class="muted">Nothing matched. Try an artist, channel or word from a title.</div>');
}
function render() {
  css(); const head = `<div class="h"><div><h1>Competitors</h1><p>Us vs the most similar music-history channels and the videos closest to ours. Free public data, refreshed daily.</p></div></div>`;
  if (!CP.ready) { load(); return head + `<div class="cp-box"><div class="muted">${CP.err ? "Competitor data could not be loaded: " + esc(CP.err) : "Loading competitor data..."}</div></div>`; }
  const d = CP.data, m = d.meta, nv = groups().reduce((s, g) => s + g.matches.length, 0);
  setTimeout(wire, 0);
  return head + `<div class="cp-wrap"><div class="cp-kpi"><div><b>${d.channels.length}</b><span>similar channels ranked</span></div><div><b>${nv}</b><span>near-identical videos compared</span></div><div><b>${(m.db_videos || 0).toLocaleString()}</b><span>videos in the research database</span></div><div><b>${esc((m.built || "").replace("T", " ").slice(0, 16))}</b><span>last refresh (Pacific)</span></div></div>
  <div class="cp-box"><h3>Where we rank: videos nearly identical to ours</h3><div id="cpGroup">${groupHtml()}</div></div>
  <div class="cp-box"><h3>Test a title against the field</h3><div class="d">Live score from the trained Title Lab model, placed among the videos above.</div>${testHtml()}</div>
  <div class="cp-box"><h3>Most similar channels</h3><div class="d">Ranked by similarity (share of long-form music-story content: story frames, music vocabulary, 8-90 minute documentaries) weighted by audience size.</div><div id="cpChans">${chanHtml()}</div></div>
  <div class="cp-box"><h3>Title patterns that win in this niche</h3><div class="d">Lift = how much more often a title with this frame beats its own channel's median by 2x or more (real data, 95% range shown).</div>${patternsHtml()}</div>
  <div class="cp-box"><h3>AI analyst</h3><div class="cp-ai" id="cpAiState">Checking...</div><input class="cp-in" id="cpQ" placeholder="Ask about competitors, stats or titles (e.g. which channels use story frames?)" maxlength="300"><div id="cpAns" style="margin-top:10px"></div></div>
  <div class="muted" style="font-size:11.5px">${esc(m.source)}. ${esc(m.outlier_def)}</div></div>`;
}
function wire() {
  const gEl = document.getElementById("cpGroup"), cEl = document.getElementById("cpChans"); if (!gEl) return;
  const bindG = () => { gEl.querySelectorAll("[data-g]").forEach(b => b.onclick = () => { state.g = +b.dataset.g; gEl.innerHTML = groupHtml(); bindG(); doTest((document.getElementById("cpIn") || {}).value || ""); }); gEl.querySelectorAll("[data-s]").forEach(b => b.onclick = () => { state.sort = b.dataset.s; gEl.innerHTML = groupHtml(); bindG(); }); };
  const bindC = () => cEl.querySelectorAll("[data-c]").forEach(b => b.onclick = () => { state.chan = b.dataset.c; cEl.innerHTML = chanHtml(); bindC(); }); bindG(); bindC();
  const t = document.getElementById("cpIn"); t.oninput = () => doTest(t.value); const q = document.getElementById("cpQ"); q.onkeydown = e => { if (e.key === "Enter") ask(q.value); }; aiStatus(); if (window.TL && TL.ensure) TL.ensure();
}
function load() {
  if (CP.loading) return; CP.loading = true;
  fetch("competitors/comp_public.json?v=" + Math.floor(Date.now() / 3600000)).then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then(d => { CP.data = d; CP.ready = true; CP.loading = false; try { if (typeof cur !== "undefined" && cur === "Competitors") go("Competitors"); } catch (e) {} }).catch(e => { CP.err = String(e); CP.loading = false; });
}
function register() {
  if (typeof NAV === "undefined" || typeof S === "undefined") return false; S["Competitors"] = render;
  if (!NAV.some(n => n[0] === "Competitors")) { let i = NAV.findIndex(n => n[0] === "Title Lab"); if (i < 0) i = NAV.findIndex(n => n[0] === "Labs"); NAV.splice(i < 0 ? NAV.length : i + 1, 0, ["Competitors", "growth"]); }
  try { if (typeof D !== "undefined" && D && typeof app !== "undefined" && !app.hidden) { const h = decodeURIComponent(location.hash.slice(1)); go(h === "Competitors" ? "Competitors" : cur); } } catch (e) {} return true;
}
if (!register()) { let n = 0; const iv = setInterval(() => { if (register() || ++n > 100) clearInterval(iv); }, 100); }
})();
