/* Static itinerary UI; no booking or account data is collected. */
(() => {
'use strict';
const D=window.TRIP_DATA, $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const yen=n=>'¥'+Math.round(n).toLocaleString('en-US');
const hk=n=>'HK$'+Math.round(n).toLocaleString('en-US');
const maps=i=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(i.mapQuery||i.name);
const link=(u,t)=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)} ↗</a>`;
const names={stay:'住宿',ski:'雪場',spot:'景點',airport:'機場'}, symbols={stay:'宿',ski:'雪',spot:'景',airport:'機'};
let region='furano',filter='all',query='',page=0,selected=null,route='furano',map=null,layer=null,routeLayer=null,tileErrors=0;
const markerById=new Map(), budgetCache={};
const pageSize=()=>window.matchMedia('(max-width:700px)').matches?2:3;
const filtered=()=>D.items.filter(i=>(region==='all'||i.region===region)&&(filter==='all'||(filter==='stay'?i.kind==='stay':i.kind!=='stay'))&&(!query||[i.name,i.desc,i.note,i.layout||''].join(' ').toLowerCase().includes(query)));
function price(i){return i.high?(i.low?`${yen(i.low)}–${yen(i.high)}`:`≤ ${yen(i.high)}`):'房價待查';}
function setTab(name,focus=false){
 document.querySelectorAll('[data-tab]').forEach(b=>{const active=b.dataset.tab===name;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;if(active&&focus)b.focus();});
 document.querySelectorAll('.tabpanel').forEach(p=>p.hidden=p.id!=='panel-'+name);
 if(name==='map'&&map)requestAnimationFrame(()=>map.invalidateSize());
}
function tabKeyboard(container,selector,activate){
 container.addEventListener('keydown',e=>{const tabs=[...container.querySelectorAll(selector)],idx=tabs.indexOf(e.target);if(idx<0)return;let next=idx;if(e.key==='ArrowRight')next=(idx+1)%tabs.length;else if(e.key==='ArrowLeft')next=(idx+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();activate(tabs[next]);(document.getElementById(tabs[next].id)||tabs[next]).focus();});
}
function setRegion(id){if(!D.regions.some(r=>r.id===id))return;region=id;page=0;selected=null;renderRegion();renderItems();renderMap(true);}
function renderRegion(){
 $('regions').innerHTML=D.regions.map(r=>`<button class="chip" role="tab" id="region-${r.id}" aria-controls="region-results" aria-selected="${r.id===region}" tabindex="${r.id===region?0:-1}" data-region="${r.id}">${esc(r.title)}</button>`).join('');
 const r=D.regions.find(r=>r.id===region);$('region-title').textContent=r.title;$('region-desc').textContent=r.desc;$('region-eyebrow').textContent=r.eyebrow;
 const a=D.items.filter(i=>region==='all'||i.region===region);$('region-count').textContent=`${a.filter(i=>i.kind==='stay').length} 住宿 · ${a.filter(i=>i.kind!=='stay').length} 地點`;
 $('region-results').setAttribute('aria-labelledby','region-'+region);
}
function renderItems(){
 const a=filtered(),size=pageSize(),pages=Math.max(1,Math.ceil(a.length/size));page=Math.min(Math.max(0,page),pages-1);
 $('items').innerHTML=a.slice(page*size,page*size+size).map(i=>`<article class="item-card ${selected===i.id?'selected':''}" data-card="${i.id}"><div class="overline"><span>${names[i.kind]}${i.kind==='stay'?` · ${i.guests} 人比較`:''}</span><span>${i.approx?'約略位置':i.onsen?'天然溫泉':''}</span></div><h3>${esc(i.name)}</h3><div class="small">${esc(i.layout||i.note)}</div><p>${esc(i.desc)}</p>${i.kind==='stay'?`<div class="price">${price(i)} <span class="small muted">／晚・全組目標</span></div>`:''}<div class="item-actions" style="margin-top:9px"><div class="row" style="gap:6px"><button class="chip" data-locate="${i.id}">地圖定位</button><button class="chip" data-detail="${i.id}">詳情</button></div>${link(maps(i),'地圖')}</div></article>`).join('')||'<p class="empty">呢個地區未有符合搜尋嘅地點。試下清除搜尋或轉去「全部地區」。</p>';
 $('results-count').textContent=a.length+' 個';$('page-label').textContent=`${page+1} / ${pages} 頁`;$('prev').disabled=page===0;$('next').disabled=page>=pages-1;
}
function icon(i){return L.divIcon({className:'pin-icon',html:`<span class="pin ${i.kind} ${selected===i.id?'selected':''}">${symbols[i.kind]}</span>`,iconSize:[30,30],iconAnchor:[15,15],popupAnchor:[0,-16]});}
function initMap(){
 if(!window.L){$('map-fallback').textContent='互動地圖未能載入。各卡片嘅「地圖」連結仍可開啟 Google Maps。';$('map').hidden=true;return;}
 map=L.map('map',{scrollWheelZoom:false}).setView([43.25,142.25],8);
 const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'}).addTo(map);
 tiles.on('tileerror',()=>{tileErrors++;$('map-status').textContent='部分底圖未能載入；標記仍可選擇，或使用卡片 Google Maps 連結。';});
 tiles.on('load',()=>{if(!tileErrors)$('map-fallback').hidden=true;});
 layer=L.layerGroup().addTo(map);routeLayer=L.layerGroup().addTo(map);renderMap(true);
}
function fit(points){if(!map||!points.length)return;if(points.length===1)map.setView(points[0],13);else map.fitBounds(L.latLngBounds(points),{padding:[35,35],maxZoom:14});}
function renderMap(zoom=false){
 if(!map)return;layer.clearLayers();routeLayer.clearLayers();markerById.clear();
 const a=filtered();a.forEach(i=>{if(!i.coords)return;const marker=L.marker(i.coords,{icon:icon(i),title:i.name,keyboard:true}).bindTooltip(i.name).bindPopup(`<strong>${esc(i.name)}</strong><div class="popup-note">${esc(i.positionNote)}</div>${i.kind==='stay'?`<div>${price(i)}／晚・全組目標</div>`:''}<button class="popup-btn" data-detail="${i.id}">睇詳情</button> · ${link(maps(i),'Google Maps')}`).addTo(layer);marker.on('click',()=>selectItem(i.id,false));markerById.set(i.id,marker);});
 let points=a.map(i=>i.coords).filter(Boolean);
 if($('show-route').checked){const pts=D.routes[route].routePoints.map(id=>D.items.find(i=>i.id===id)?.coords).filter(Boolean);L.polyline(pts,{color:'#b9683d',weight:3,dashArray:'6 7',opacity:.7}).addTo(routeLayer);points=pts;}
 if(zoom)fit(points);
 if(!tileErrors)$('map-status').textContent=$('show-route').checked?`${D.routes[route].title}：虛線只表示停留次序，並非道路導航；部分位置屬約略標記。`:'撳標記選地點，撳卡片定位；約略位置請用官方地址確認。';
}
function selectItem(id,move=true){const i=D.items.find(i=>i.id===id);if(!i)return;selected=id;const a=filtered(),idx=a.findIndex(i=>i.id===id);if(idx>=0)page=Math.floor(idx/pageSize());renderItems();markerById.forEach((m,k)=>m.setIcon(icon(D.items.find(i=>i.id===k))));if(move&&map&&i.coords){map.setView(i.coords,i.approx?12:14);markerById.get(id)?.openPopup();}if(!map)$('map-status').textContent='互動地圖暫未能使用，可開啟此卡片嘅 Google Maps 連結。';}
function showDetail(id){
 const i=D.items.find(i=>i.id===id);if(!i)return;$('detail-title').textContent=i.name;$('detail-area').textContent=`${D.regions.find(r=>r.id===i.region).title} · ${names[i.kind]}`;
 $('detail-body').innerHTML=`<div class="tagrow"><span class="badge">${names[i.kind]}</span>${i.onsen?'<span class="badge">天然溫泉</span>':''}${i.approx?'<span class="badge orange">約略位置</span>':''}</div>${i.layout?`<p><strong>房型：</strong>${esc(i.layout)}</p>`:''}<p>${esc(i.desc)}</p><p class="note">${esc(i.note)}</p>${i.kind==='stay'?`<div class="dialog-price"><strong>${price(i)}／晚・${i.guests} 人全組目標</strong><div class="small">${esc(i.meal)}</div><div class="small muted">未查指定日期空房或即時房價。四人／六人及餐飲方案要分開報價，另查清潔費與稅項。</div></div>`:''}<p class="small muted">${esc(i.positionNote)}</p><div class="dialog-links">${link(i.url,'官方／房源')}${link(maps(i),'Google Maps')}</div><p class="dialog-source">資料查核：2026.10.12 · ${(i.sources||[]).map(n=>link(D.sources[n][1],D.sources[n][0])).join(' · ')}</p>`;
 $('detail').showModal();
}
function renderRoute(){
 $('route-choices').innerHTML=Object.entries(D.routes).map(([id,r])=>`<button class="route-choice" data-route="${id}" aria-pressed="${id===route}"><div class="eyebrow">${id==='niseko'?'ORIGINAL':id==='furano'?'ALTERNATIVE 01':'ALTERNATIVE 02'}</div><strong>${esc(r.title)}</strong><span>${esc(r.subtitle)}</span></button>`).join('');
 const r=D.routes[route];$('days').innerHTML=r.days.map(d=>`<article class="day"><div class="day-date">${esc(d[0])}<span>DEC・${esc(d[1])}</span></div><div><h3>${esc(d[2])}</h3><p>${esc(d[3])}</p><div class="stay-line">住宿：${esc(d[4])}</div><div class="small muted">${esc(d[5])}</div></div></article>`).join('');
 $('route-summary').innerHTML=`<span class="badge">${route==='niseko'?'原本方案':'二世古替代'}</span><h3>${esc(r.recommended)}</h3><ul>${r.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul><div class="note">夫婦 18 日航班時間未提供。若早機，17 日先分隊住千歲；四人保留車，夫婦接駁另安排。</div><button class="btn" data-jump-region="${r.region}">地圖睇住宿 →</button><button class="btn" data-jump-budget="${route}" style="margin-left:5px">比較預算 →</button>`;
 $('map-route').value=route;$('budget-route').value=route;
}
function changeRoute(id){if(!D.routes[id])return;saveBudget();route=id;renderRoute();loadBudget();renderMap($('show-route').checked);}
function number(id){const n=Number($(id).value);return Number.isFinite(n)?Math.max(0,n):0;}
function saveBudget(){if(!$('night-0'))return;budgetCache[route]={nights:Array.from({length:7},(_,n)=>number('night-'+n)),lift:number('lift'),rental:number('rental'),lesson:number('lesson'),transfer:number('transfer'),fx:number('fx'),early:$('early-flight').checked,coupleHotel:number('couple-hotel')};}
function defaults(){return {nights:[...D.routes[route].nightCosts],lift:D.routes[route].lift,rental:20000,lesson:15000,transfer:0,fx:.05,early:false,coupleHotel:12000};}
function loadBudget(){const b=budgetCache[route]||defaults();$('early-flight').checked=b.early;['lift','rental','lesson','transfer','fx'].forEach(id=>$(id).value=b[id]);$('couple-hotel').value=b.coupleHotel;renderNights(b);renderBudget();}
function renderNights(b){const r=D.routes[route];$('night-rows').innerHTML=b.nights.map((n,i)=>`<tr><td>${13+i}/12</td><td>${esc(r.nightPlaces[i])}</td><td>${i>=5||i===4&&b.early?4:6}</td><td><input class="night-input" id="night-${i}" aria-label="${13+i}日全組住宿日圓" type="number" min="0" step="1000" value="${n}"></td></tr>`).join('');$('couple-night').hidden=!b.early;}
function calculateBudget(b){
 let man=0,couple=0;for(let i=0;i<7;i++){const n=b.nights[i];if(i<5&&!(i===4&&b.early)){man+=n/6;couple+=n/6;}else man+=n/4;}
 if(b.early)couple+=b.coupleHotel/2;
 const ski=b.lift+b.rental+b.lesson;const lodgingTotal=b.nights.reduce((a,n)=>a+n,0)+(b.early?b.coupleHotel:0);
 return {manLodging:man,coupleLodging:couple,manTotal:man+ski,coupleTotal:couple+b.transfer/2,groupTotal:lodgingTotal+4*ski+b.transfer,lodgingTotal,ski};
}
function renderBudget(){saveBudget();const b=budgetCache[route],t=calculateBudget(b);$('budget-result').innerHTML=`<div class="eyebrow">四位男士・每人</div><div class="value">${yen(t.manTotal)}</div><div class="conversion">約 ${hk(t.manTotal*b.fx)}</div><p>七晚住宿 ${yen(t.manLodging)}<br>兩日纜車＋裝備＋課堂預留 ${yen(t.ski)}</p><hr><div class="eyebrow">夫婦・每人</div><div class="value">${yen(t.coupleTotal)}</div><div class="conversion">約 ${hk(t.coupleTotal*b.fx)}</div><p>五晚住宿 ${yen(t.coupleLodging)}<br>接駁 ${yen(b.transfer/2)}（預設未加入）</p><hr><p>全組暫計 ${yen(t.groupTotal)} ≈ ${hk(t.groupTotal*b.fx)}<br>住宿 ${yen(t.lodgingTotal)} · 四人滑雪 ${yen(t.ski*4)}<br>未計航班、租車、油費、高速費、額外餐飲及保險。</p>`;}
function renderInfo(){
 $('info-events').innerHTML=D.events.map(e=>`<article class="card event"><span class="badge ${e.status.includes('未')||e.status.includes('唔')?'orange':''}">${esc(e.status)}</span><h3>${esc(e.name)}</h3><div class="date">${esc(e.date)}</div><p>${esc(e.desc)}</p>${link(D.sources[e.source][1],'官方資料')}</article>`).join('');
 $('sources').innerHTML=D.sources.map(s=>`<li>${link(s[1],s[0])}</li>`).join('');
}
function setInfo(id){document.querySelectorAll('[data-info]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.info===id));b.tabIndex=b.dataset.info===id?0:-1;});['events','prep','sources'].forEach(n=>$('info-'+n).hidden=n!==id);}
function init(){
 const opts=Object.entries(D.routes).map(([id,r])=>`<option value="${id}">${esc(r.title)}</option>`).join('');$('map-route').innerHTML=opts;$('budget-route').innerHTML=opts;
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;if(d.tab)setTab(d.tab);if(d.region)setRegion(d.region);if(d.filter){filter=d.filter;query=$('search').value.toLowerCase().trim();page=0;selected=null;document.querySelectorAll('[data-filter]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));renderItems();renderMap(true);}if(d.locate)selectItem(d.locate);if(d.detail)showDetail(d.detail);if(d.route)changeRoute(d.route);if(d.info)setInfo(d.info);if(d.jumpRegion){setTab('map');filter='all';query='';$('search').value='';document.querySelectorAll('[data-filter]').forEach(t=>t.setAttribute('aria-pressed',String(t.dataset.filter==='all')));setRegion(d.jumpRegion);$('tab-map').focus();}if(d.jumpBudget){changeRoute(d.jumpBudget);setTab('budget');$('tab-budget').focus();}});
 $('search').addEventListener('input',()=>{query=$('search').value.toLowerCase().trim();page=0;selected=null;renderItems();renderMap(true);});
 $('prev').addEventListener('click',()=>{page--;renderItems();});$('next').addEventListener('click',()=>{page++;renderItems();});
 $('fit-map').addEventListener('click',()=>renderMap(true));$('show-route').addEventListener('change',()=>renderMap(true));$('map-route').addEventListener('change',()=>changeRoute($('map-route').value));$('budget-route').addEventListener('change',()=>changeRoute($('budget-route').value));
 $('panel-budget').addEventListener('input',e=>{if(e.target.type==='number')renderBudget();});$('early-flight').addEventListener('change',()=>{saveBudget();renderNights(budgetCache[route]);renderBudget();});$('reset-budget').addEventListener('click',()=>{delete budgetCache[route];loadBudget();});
 $('close-detail').addEventListener('click',()=>$('detail').close());$('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=$('detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('detail').close();}});
 tabKeyboard(document.querySelector('.main-tabs'),'[data-tab]',b=>setTab(b.dataset.tab));tabKeyboard($('regions'),'[data-region]',b=>setRegion(b.dataset.region));tabKeyboard(document.querySelector('.info-tabs'),'[data-info]',b=>setInfo(b.dataset.info));
 let lastSize=pageSize();window.addEventListener('resize',()=>{if(lastSize!==pageSize()){lastSize=pageSize();page=0;renderItems();}});
 renderRegion();renderItems();renderRoute();loadBudget();renderInfo();initMap();
 window.TRIP_APP={calculateBudget,filtered,setRegion,changeRoute,setTab,selectItem,state:()=>({region,filter,page,route,selected})};
}
init();
})();
