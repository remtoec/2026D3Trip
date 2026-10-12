/* Historical station observations, not forecasts or resort snow reports. */
(() => {
'use strict';
const W=window.TRIP_WEATHER,$=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number.isFinite(n)?n.toFixed(1):'未有資料';
const link=(u,t)=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)} ↗</a>`;
let station='furano',period='trip',year='all',metric='depth';
const dateRange=p=>p==='ski'?[18,19]:[13,20];
function stats(id,p='trip',y='all'){
 const s=W.stations.find(s=>s.id===id);if(!s)return null;const [start,end]=dateRange(p);
 const days=s.days.filter(d=>d.day>=start&&d.day<=end&&(y==='all'||d.year===Number(y)));
 const vals=k=>days.map(d=>d[k]).filter(Number.isFinite),mean=a=>a.length?a.reduce((t,n)=>t+n,0)/a.length:null;
 const depths=vals('depth'),snow=vals('snowfall'),high=vals('high'),low=vals('low'),years=y==='all'?W.years:[Number(y)];
 const totals=years.map(y=>{const a=days.filter(d=>d.year===y);return a.length===end-start+1&&a.every(d=>Number.isFinite(d.snowfall))?a.reduce((t,d)=>t+d.snowfall,0):null;}).filter(Number.isFinite);
 return {days,expected:years.length*(end-start+1),depth:mean(depths),depthMin:depths.length?Math.min(...depths):null,depthMax:depths.length?Math.max(...depths):null,depthN:depths.length,covered:depths.filter(n=>n>=1).length,ten:depths.filter(n=>n>=10).length,snowfall:mean(totals),snowfallYears:totals.length,snowfallN:snow.length,snowDays:snow.filter(n=>n>=1).length,high:mean(high),low:mean(low),tempN:Math.min(high.length,low.length),years};
}
const regionStations={niseko:'kutchan',furano:'furano',tomamu:'shimukappu',biei:'biei',asahikawa:'asahikawa',sapporo:'sapporo',onsen:'noboribetsu',chitose:'chitose'};
function itemStation(i){if(i.id==='otaru')return'otaru';if(i.id==='sahoro'||i.id==='sahoro-ski')return'shintoku';if(i.id==='shikanoyu'||i.id==='kokusai')return'koganeyu';return regionStations[i.region];}
function snippet(i){const id=itemStation(i),s=W.stations.find(s=>s.id===id),a=stats(id);if(!s)return'';return `<div class="weather-adjunct"><strong>近年雪景參考 · ${esc(s.name)}站</strong><p>2021–2025 年 12/13–20：平均每日最深積雪 <b>${fmt(a.depth)} cm</b>；有 ≥1 cm 積雪記錄 ${a.covered}/${a.depthN} 日。${a.depthN<a.expected?`有效記錄 ${a.depthN}/${a.expected} 日。`:''}</p><p class="small muted">${esc(s.positionNote)}歷史數字唔係今年預報。</p><button class="chip" data-snow-open="${id}">睇天氣／逐年積雪</button></div>`;}
function regionSnippet(id){if(id==='all')return'<span>新增近年天氣／积雪分頁：用 11 個氣象站比較 2021–2025 年同日期。</span><button class="chip" data-snow-open="furano">比較雪景地區 →</button>'.replace('积','積');const sid=regionStations[id],s=W.stations.find(s=>s.id===sid),a=stats(sid);if(!s)return'';return `<span><strong>近五年同日期：</strong>${esc(s.name)}站平均每日最深積雪 ${fmt(a.depth)} cm · 有 ≥1 cm 記錄 ${a.covered}/${a.depthN} 日 <span class="muted">（附近站，非景點實測）</span></span><button class="chip" data-snow-open="${sid}">天氣／積雪詳情 →</button>`;}
function open(id){if(W.stations.some(s=>s.id===id))station=id;render();if($('detail').open)$('detail').close();window.TRIP_APP?.setTab('snow',true);}
function render(){
 const days=dateRange(period),a=stats(station,period,year),s=W.stations.find(s=>s.id===station);$('snow-year').value=year;$('snow-station').value=station;
 $('snow-sample').textContent=`每年 12/${days[0]}–${days[1]} · ${year==='all'?'5 年':year+' 年'} · 最多 ${a.expected} 日`;
 document.querySelectorAll('[data-snow-period]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.snowPeriod===period)));document.querySelectorAll('[data-snow-metric]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.snowMetric===metric)));
 const captions={depth:'每日最深積雪嘅平均（cm），並非雪場雪道厚度。',snowfall:year==='all'?'每年選定期間新雪合計嘅平均（cm）；唔等於地面雪深。':'選定期間新雪合計（cm）；唔等於地面雪深。',covered:'當日最深積雪 ≥1 cm 嘅記錄日數／有效日數；唔係預測機率。'};
 $('snow-chart-caption').textContent=captions[metric];
 const rows=W.stations.map(s=>({s,a:stats(s.id,period,year)})),maximum=Math.max(1,...rows.map(r=>r.a[metric]??0));
 $('snow-bars').innerHTML=rows.map(({s,a})=>`<button class="snow-bar ${s.id===station?'selected':''}" data-snow-station="${s.id}" aria-pressed="${s.id===station}"><span class="snow-bar-name">${esc(s.title)}<small>${esc(s.name)}站</small></span><span class="snow-bar-track" aria-hidden="true"><i style="width:${(Math.max(0,a[metric]??0)/maximum*100).toFixed(2)}%"></i></span><span class="snow-bar-value">${metric==='covered'?`${a.covered}/${a.depthN} 日`:Number.isFinite(a[metric])?`${fmt(a[metric])} cm`:'未有資料'}</span></button>`).join('');
 $('snow-detail').innerHTML=`<div class="eyebrow" style="margin-top:17px">${year==='all'?'FIVE-YEAR REFERENCE':esc(year)+' REFERENCE'}</div><h3 style="margin:5px 0 12px">${esc(s.title)}・${esc(s.name)}站</h3><p class="small muted">${esc(s.positionNote)}</p><div class="snow-stat-grid"><div><span>平均每日最深積雪</span><strong>${fmt(a.depth)} <small>cm</small></strong></div><div><span>每日最深積雪範圍</span><strong>${a.depthN?`${a.depthMin}–${a.depthMax}`:'—'} <small>cm</small></strong></div><div><span>有 ≥1 cm 積雪記錄</span><strong>${a.covered}/${a.depthN} <small>日</small></strong></div><div><span>有 ≥10 cm 積雪記錄</span><strong>${a.ten}/${a.depthN} <small>日</small></strong></div></div><p class="small">${year==='all'?'每年期間':'期間'}新雪合計${year==='all'?'平均':''}：<b>${fmt(a.snowfall)} cm</b>（${a.snowfallYears} 個完整年份）<br>新雪 ≥1 cm 記錄：${a.snowDays}/${a.snowfallN} 日<br>平均日最高／日最低：${a.tempN?`${fmt(a.high)} / ${fmt(a.low)} °C`:'此站冇氣溫資料'}<br>積雪有效記錄：${a.depthN}/${a.expected} 日；氣溫：${a.tempN}/${a.expected} 日</p><p class="note" style="margin-top:13px">${esc(s.advice)}</p><div class="row" style="margin-top:15px"><button class="chip" data-jump-region="${s.region}">地圖睇住宿</button>${s.coords?link('https://www.google.com/maps/search/?api=1&query='+s.coords.join(','),'觀測站位置'):''}</div><p class="small muted" style="margin-top:10px">${Number.isFinite(s.elevation)?`觀測站海拔約 ${Math.round(s.elevation)} m · `:''}日最高／最低為平均值，唔係極端值。</p><div class="snow-source-links">JMA 原表：${a.years.map(y=>link(s.sources[String(y)],String(y))).join(' · ')}</div>`;
 $('snow-daily-title').textContent=`${s.title}・${s.name}站逐日積雪`;
 const ns=Array.from({length:days[1]-days[0]+1},(_,i)=>days[0]+i);
 $('snow-daily').innerHTML=`<table class="snow-daily-table"><thead><tr><th>年份</th>${ns.map(n=>`<th>12/${n}</th>`).join('')}<th>期間平均</th></tr></thead><tbody>${a.years.map(y=>{const t=stats(station,period,String(y));return `<tr><th>${y}</th>${ns.map(n=>{const d=t.days.find(d=>d.day===n),v=d?.depth,cls=!Number.isFinite(v)?'snow-missing':v>=60?'snow-4':v>=30?'snow-3':v>=10?'snow-2':v>=1?'snow-1':'snow-0';return `<td class="${cls}" title="${y}/12/${n} 最深積雪，原值：${esc(d?.raw.depth||'未有資料')}">${Number.isFinite(v)?v:'—'}</td>`;}).join('')}<td><strong>${fmt(t.depth)}</strong></td></tr>`;}).join('')}</tbody></table>`;
}
function init(){
 $('snow-station').innerHTML=W.stations.map(s=>`<option value="${s.id}">${esc(s.title)} · ${esc(s.name)}站</option>`).join('');
 $('snow-method-sources').innerHTML=`<p class="small">${link(W.methodSource,'JMA 原值符號說明')}</p><ul class="snow-method-list">${W.stations.map(s=>`<li><strong>${esc(s.title)}</strong>：${esc(s.positionNote)}<br>${W.years.map(y=>link(s.sources[String(y)],String(y))).join(' · ')} · ${link('https://www.data.jma.go.jp/stats/etrn/select/prefecture.php?prec_no='+s.prec+'&year=2025&month=12','站點資料')}</li>`).join('')}</ul>`;
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;if(d.snowPeriod){period=d.snowPeriod;render();}if(d.snowMetric){metric=d.snowMetric;render();}if(d.snowStation){station=d.snowStation;render();}if(d.snowOpen)open(d.snowOpen);});
 $('snow-year').addEventListener('change',()=>{year=$('snow-year').value;render();});$('snow-station').addEventListener('change',()=>{station=$('snow-station').value;render();});render();
}
window.TRIP_SNOW={stats,snippet,regionSnippet,open,state:()=>({station,period,year,metric})};
init();
})();
