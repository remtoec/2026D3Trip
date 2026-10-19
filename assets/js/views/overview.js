// 總覽／今日 (#/today).
// Phone: the focus day at a glance (sign, tonight's stay, picks, tomorrow, pre-trip checks).
// ≥700px adds key numbers, the route map, the 8-day board, the event calendar and road links;
// ≥1100px also lazy-loads a snow-history snapshot from weather-data.js.
import { D, TRIP_DAYS, WEEKDAY, day, item, stayFor, itemsForDay, fitDays, closedDays, hoursShort, category, sortItems, mapsRoute, dayPhoto, hotelPhoto } from '../trip.js';
import { esc, icon, link, signHTML, photoCardHTML, photoHTML, heroHTML, gmapsBtnHTML } from '../ui.js';
import { createMap } from '../map.js';
import { tripClock, starredIds, isStarred } from '../state.js';
import { calculate, hk } from '../budget.js';

const AIRPORT = [42.7752, 141.6923];
const WEATHER_SRC = './assets/weather-data.js?v=snow1';
const MAX_ROWS = 6;
const MAX_EVENTS = 10;
const TRIP_START = Date.UTC(2026, 11, 13);
// Nearest JMA station per base. null = no station; never substitute another one (README §8).
const SNOW_STATION = { sapporo: 'sapporo', biei: 'biei', furano: 'furano', taiki: null, transfer: 'chitose', niseko: 'kutchan' };

const mqWide = window.matchMedia('(min-width: 700px)');
const mqDesk = window.matchMedia('(min-width: 1100px)');

const ARROW = '<svg class="ov-arrow" viewBox="0 0 22 12" aria-hidden="true"><path d="M1.5 6h18M14.5 1.5 19.5 6l-5 4.5"/></svg>';
const GOES = '<span class="visually-hidden">去</span>';

let root = null;
let map = null;
let clock = null;
let lastDetail = null;
let weatherPromise = null;

// ---------- Small helpers ----------
// New research fields are optional; never let one odd item break the page.
const fits = a => { try { return fitDays(a); } catch { return []; } };
const closed = a => { try { return closedDays(a); } catch { return []; } };
const dm = n => `${n}/12`;

function rel(n) {
  if (clock.phase === 'during') {
    if (n === clock.day) return '今日';
    if (n === clock.day + 1) return '聽日';
  }
  if (clock.phase === 'before') {
    if (n === 13) return '第一日';
    if (n === 14) return '第二日';
  }
  return `${dm(n)}`;
}

function fmtDays(list) {
  const xs = [...new Set(list)].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < xs.length;) {
    let j = i;
    while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++;
    parts.push(j > i ? `${xs[i]}–${xs[j]}` : `${xs[i]}`);
    i = j + 1;
  }
  return parts.length ? parts.join('、') + '日' : '';
}

// ISO date → index within 13–20 Dec (0–7; may fall outside).
function tripIndex(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return m ? Math.round((Date.UTC(+m[1], +m[2] - 1, +m[3]) - TRIP_START) / 86400000) : null;
}
const isoDM = iso => { const m = /^\d{4}-(\d{2})-(\d{2})/.exec(iso || ''); return m ? `${+m[2]}/${+m[1]}` : ''; };

// Whole-day route in Google Maps: last night's stay (airport on 13th) to tonight's (ski area on 18th,
// airport on 20th), through the sign's via points that carry coords (白金 on 15th, Chitose split on 17th).
function routeHref(n) {
  const from = n === 13 ? AIRPORT : stayFor(n - 1)?.coords;
  let to = n === 20 ? AIRPORT : stayFor(n)?.coords;
  if (n === 18) to = item('annupuri')?.coords || to;
  if (!from || !to) return '';
  const via = (day(n)?.sign?.via || []).filter(v => Array.isArray(v.coords)).map(v => v.coords);
  return mapsRoute(from, to, via);
}

// The day's picks, then anything stamped 想去 that fits the day.
function dayItems(n) {
  const picks = itemsForDay(n);
  const ids = new Set(picks.map(a => a.id));
  const extra = starredIds().map(item).filter(a => a && !ids.has(a.id) && fits(a).includes(n));
  return [...picks, ...sortItems(extra, day(n)?.base)];
}

function stampedFor(n) {
  return starredIds().map(item).filter(a => a && fits(a).includes(n)).length;
}

// ---------- Sections ----------
function statusHTML() {
  let h1, sub;
  if (clock.phase === 'before') {
    h1 = clock.daysToGo === 1 ? '聽日出發' : `仲有 <b class="num">${clock.daysToGo}</b> 日出發`;
    sub = '13/12（日）新千歲機場集合';
  } else if (clock.phase === 'during') {
    h1 = `今日 <b class="num">${dm(clock.day)}</b>（${WEEKDAY[clock.day]}）`;
    sub = `第 <span class="num">${clock.day - 12}</span> 日，全程 8 日`;
  } else {
    h1 = '旅程已完結';
    sub = '13–20/12/2026 北海道自駕';
  }
  return `<div class="ov-status"><h1>${h1}</h1><p>${sub}</p></div>`;
}

function topHTML() {
  const { man, pair } = calculate();
  const money = n => `<small>HK$</small>${hk(n).replace('HK$', '')}`;
  return `<div class="ov-stats">
      <ul aria-label="旅程數字">
        <li><span class="ov-stat-v num">7<small>晚</small></span><span class="ov-stat-l">四位男士住七晚，夫婦住五晚</span></li>
        <li><span class="ov-stat-v num">6${ARROW}<span class="visually-hidden">人出發，</span>4<small>人</small></span><span class="ov-stat-l">六人出發，四人留低滑雪</span></li>
        <li><span class="ov-stat-v num">${money(man)}</span><span class="ov-stat-l">每位男士住宿</span></li>
        <li><span class="ov-stat-v num">${money(pair)}</span><span class="ov-stat-l">夫婦每人住宿</span></li>
      </ul>
      <p class="ov-stats-note">只計住宿，夫婦17晚先按 HK$1,000 預留；機票、租車、油費未計。<a href="#/stays">睇預算</a></p>
    </div>`;
}

function stayHTML(n) {
  const h = stayFor(n);
  const d = day(n);
  const label = clock.phase === 'during' ? '今晚住' : clock.phase === 'before' && n === 13 ? '第一晚住' : `${dm(n)} 晚上`;
  if (!h) {
    return `<div class="ov-stay is-none"><span class="ov-stay-pin" aria-hidden="true">機</span>
      <span class="ov-stay-txt"><span class="ov-label">${label}</span><strong>返香港，唔使住宿</strong><span class="ov-sub">${esc(d?.pax || '')}</span></span></div>`;
  }
  // The name link stretches over the row (住宿頁); the 開車去 button sits above it.
  return `<div class="ov-stay">${photoHTML(hotelPhoto(h), { w: 240, cls: 'ov-stay-ph', alt: h.name, glyph: '宿', cat: 'stay' })}
    <span class="ov-stay-txt">
      <span class="ov-label">${label}</span>
      <a class="ov-stay-link" href="#/stays"><strong>${esc(h.name)}</strong></a>
      <span class="ov-sub"><span>${esc(h.area || '')}</span><span>${esc(h.dates || '')}</span>${d?.pax ? `<span>${esc(d.pax)}</span>` : ''}</span>
    </span>${gmapsBtnHTML(h, { label: '開車去', cls: 'btn small' })}</div>`;
}

function picksHTML(n) {
  const d = day(n);
  const list = dayItems(n);
  const rows = list.slice(0, MAX_ROWS).map(a => {
    const off = closed(a).includes(n);
    return `<li>${photoCardHTML(a, d.base, off ? { sub: `${dm(n)} 休息，揀第二日` } : {})}</li>`;
  }).join('');
  return `<section class="ov-picks" aria-labelledby="ov-picks-h">
    <div class="ov-head"><h2 id="ov-picks-h">${rel(n)}揀邊樣</h2>
      <a class="ov-head-link" href="#/days/${n}">睇全部${list.length > MAX_ROWS ? ` <span class="num">${list.length}</span> 項` : ''}</a></div>
    ${rows ? `<ul class="ov-rows pcards">${rows}</ul>` : '<p class="ov-empty">呢日主要係移動同搭機，冇預排景點。</p>'}
    ${d.plan ? `<p class="ov-plan">${esc(d.plan)}</p>` : ''}
  </section>`;
}

function nextHTML(n) {
  const d = day(n + 1);
  if (!d) return '';
  const s = d.sign || {};
  return `<a class="ov-next" href="#/days/${d.day}">
    ${photoHTML(dayPhoto(d.day), { w: 240, cls: 'ov-next-ph', glyph: String(d.day) })}
    <span class="ov-next-when"><span class="ov-label">${rel(d.day)}</span><span class="num">${dm(d.day)}</span><span class="ov-wd">（${WEEKDAY[d.day]}）</span></span>
    <span class="ov-next-route">${s.from ? `<span>${esc(s.from)}</span>${ARROW}${GOES}` : ''}<span>${esc(s.to || d.title)}</span></span>
    ${s.time ? `<span class="ov-next-time num">${esc(s.time)}<small>${esc(s.unit || '小時')}</small></span>` : ''}
    ${icon('right')}
  </a>`;
}

function todayHTML() {
  const n = clock.day;
  const d = day(n);
  if (!d) return '';
  return `${stayHTML(n)}
    ${picksHTML(n)}
    ${nextHTML(n)}`;
}

function heroBandHTML() {
  const n = clock.day;
  const d = day(n);
  if (!d) return '';
  const route = routeHref(n);
  const p = dayPhoto(n);
  return heroHTML(p, `${statusHTML()}${signHTML(d, route ? { link: route, linkLabel: '全日路線' } : {})}`, { cls: 'ov-hero', alt: p?.caption || d.title });
}

function boardHTML() {
  const cols = TRIP_DAYS.map(n => {
    const d = day(n);
    if (!d) return '';
    const s = d.sign || {};
    const h = stayFor(n);
    const st = stampedFor(n);
    const focus = n === clock.day && clock.phase !== 'after';
    const tag = focus ? `<em>${clock.phase === 'during' ? '今日' : '出發日'}</em>` : '';
    return `<li><a class="ov-day${focus ? ' is-focus' : ''}" href="#/days/${n}"${focus && clock.phase === 'during' ? ' aria-current="date"' : ''}>
      ${photoHTML(dayPhoto(n), { w: 400, cls: 'ov-day-ph', glyph: String(n) })}
      <span class="ov-day-n"><b class="num">${n}</b><span>星期${WEEKDAY[n]}</span>${tag}</span>
      <span class="ov-day-route">${s.from ? `${esc(s.from)}${ARROW}${GOES}` : ''}${esc(s.to || d.title)}</span>
      ${s.time ? `<span class="ov-day-time num">${esc(s.time)}<small>${esc(s.unit || '小時')}</small></span>` : ''}
      <span class="ov-day-stay">${h ? esc(h.name) : '返港'}</span>
      <span class="ov-day-counts"><span>建議 <b class="num">${d.picks.length}</b></span>${st ? `<span class="is-stamp">想去 <b class="num">${st}</b></span>` : ''}</span>
    </a></li>`;
  }).join('');
  return `<div class="ov-head"><h2 id="ov-board-h">八日路線</h2><a class="ov-head-link" href="#/days">逐日行程</a></div>
    <ol class="ov-board-list">${cols}</ol>`;
}

// ---------- Event calendar ----------
function eventRows() {
  const isEvent = a => category(a) === 'event';
  const dated = a => !!(a.when && a.when.from);
  const pool = D.activities.filter(a => isEvent(a) || dated(a));
  const rank = a => (isEvent(a) ? 0 : 2) + (D.days.some(d => d.picks.includes(a.id)) ? 0 : 1);
  const chosen = [...pool].sort((x, y) => rank(x) - rank(y)).slice(0, MAX_EVENTS);

  const rows = chosen.map(a => {
    const fit = new Set(fits(a));
    const off = new Set(closed(a));
    let run = null; // [start, end] indices clipped to the trip; 'outside' when it misses the trip entirely
    if (dated(a)) {
      const from = tripIndex(a.when.from);
      const to = a.when.to ? tripIndex(a.when.to) : null;
      const s = Math.max(0, from ?? 0);
      const e = Math.min(7, to ?? 7);
      run = s <= e ? [s, e] : 'outside';
    }
    const cells = TRIP_DAYS.map((n, i) => {
      const on = run === null ? fit.has(n) : Array.isArray(run) && i >= run[0] && i <= run[1];
      if (!on) return '';
      if (off.has(n)) return 'closed';
      return fit.has(n) ? 'fit' : 'run';
    });
    const firstFit = cells.indexOf('fit');
    const start = Array.isArray(run) ? run[0] : run === 'outside' ? 99 : Math.max(0, cells.findIndex(Boolean));
    return { a, run, cells, start, firstFit: firstFit < 0 ? 99 : firstFit };
  });
  rows.sort((x, y) => x.start - y.start || x.firstFit - y.firstFit || x.a.name.localeCompare(y.a.name, 'zh-Hant'));
  return { rows, extra: pool.length - chosen.length };
}

function calHTML() {
  const { rows, extra } = eventRows();
  const head = `<div class="ov-head"><h2 id="ov-cal-h">活動日曆</h2><a class="ov-head-link" href="#/explore">去景點頁</a></div>`;
  if (!rows.length) return `${head}<p class="ov-empty">未有節慶或限定日子嘅活動資料。</p>`;
  const focusIdx = clock.phase === 'after' ? -1 : TRIP_DAYS.indexOf(clock.day);
  const label = { fit: '路線經過，啱去', run: '有開，但唔順路', closed: '休息' };
  const anyRun = rows.some(r => r.cells.includes('run'));
  const anyClosed = rows.some(r => r.cells.includes('closed'));
  const anyFallback = rows.some(r => r.run === null);

  const body = rows.map(({ a, run, cells }) => {
    const range = a.when && a.when.from ? `${isoDM(a.when.from)}–${a.when.to ? isoDM(a.when.to) : ''}` : '';
    const hours = hoursShort(a);
    const sub = [range, hours].filter(Boolean).map(t => `<span class="num">${esc(t)}</span>`).join('') || (a.tag ? `<span>${esc(a.tag)}</span>` : '');
    const name = `<th scope="row"><button type="button" class="ov-cal-name" data-detail="${esc(a.id)}">${esc(a.name)}${isStarred(a.id) ? '<span class="ov-dot" title="已加入想去"><span class="visually-hidden">（想去）</span></span>' : ''}</button><span class="ov-cal-sub">${sub}</span></th>`;
    if (run === 'outside') {
      return `<tr data-cat="${category(a)}">${name}<td colspan="8" class="ov-cal-out">旅程期間冇開（${esc(range)}）</td></tr>`;
    }
    const tds = cells.map((c, i) => {
      const cont = c === 'fit' || c === 'run';
      const prev = cells[i - 1], next = cells[i + 1];
      const joinL = cont && (prev === 'fit' || prev === 'run' || (i === 0 && Array.isArray(run) && tripIndex(a.when.from) < 0));
      const joinR = cont && (next === 'fit' || next === 'run' || (i === 7 && Array.isArray(run) && (!a.when.to || tripIndex(a.when.to) > 7)));
      const cls = [c, joinL && 'jl', joinR && 'jr', i === focusIdx && 'is-focus'].filter(Boolean).join(' ');
      return `<td${cls ? ` class="${cls}"` : ''}>${c ? `<i aria-hidden="true">${c === 'closed' ? '休' : ''}</i><span class="visually-hidden">${TRIP_DAYS[i]}日${label[c]}</span>` : ''}</td>`;
    }).join('');
    return `<tr data-cat="${category(a)}">${name}${tds}</tr>`;
  }).join('');

  return `${head}
    <div class="ov-cal-scroll">
      <table class="ov-cal">
        <caption class="visually-hidden">13至20日，各節慶及季節限定活動嘅日子</caption>
        <colgroup><col class="ov-cal-c0">${TRIP_DAYS.map(() => '<col>').join('')}</colgroup>
        <thead><tr><th scope="col"><span class="visually-hidden">活動</span></th>${TRIP_DAYS.map((n, i) => `<th scope="col"${i === focusIdx ? ' class="is-focus"' : ''}><b class="num">${n}</b><span>星期${WEEKDAY[n]}</span></th>`).join('')}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
    <div class="ov-legend">
      <span><i class="fit"></i>路線經過嗰日</span>
      ${anyRun ? '<span><i class="run"></i>活動期間，唔順路</span>' : ''}
      ${anyClosed ? '<span><i class="closed">休</i>休息</span>' : ''}
    </div>
    ${anyFallback || extra > 0 ? `<p class="ov-note">${anyFallback ? '未有官方日期嘅項目，按路線適合日子顯示。' : ''}${extra > 0 ? `另有 <span class="num">${extra}</span> 項季節限定活動喺景點頁。` : ''}</p>` : ''}`;
}

// ---------- Snow history (desktop only, lazy) ----------
function loadWeather() {
  if (window.TRIP_WEATHER) return Promise.resolve(window.TRIP_WEATHER);
  if (!weatherPromise) {
    weatherPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = WEATHER_SRC;
      s.async = true;
      s.onload = () => (window.TRIP_WEATHER ? resolve(window.TRIP_WEATHER) : reject(new Error('TRIP_WEATHER missing')));
      s.onerror = () => { weatherPromise = null; s.remove(); reject(new Error('weather-data.js failed')); };
      document.head.appendChild(s);
    });
  }
  return weatherPromise;
}

// Average of daily max snow depth, 13–20 Dec, over the snapshot years; non-finite values excluded.
function snowStat(W, sid) {
  const st = (W.stations || []).find(s => s.id === sid);
  if (!st) return null;
  const years = Array.isArray(W.years) && W.years.length ? W.years : [2021, 2022, 2023, 2024, 2025];
  const vals = (st.days || []).filter(d => years.includes(d.year) && d.day >= 13 && d.day <= 20).map(d => d.depth).filter(Number.isFinite);
  return {
    name: st.name,
    avg: vals.length ? vals.reduce((t, v) => t + v, 0) / vals.length : null,
    n: vals.length,
    covered: vals.filter(v => v >= 1).length,
    years,
  };
}

function snowShell(inner) {
  return `<div class="ov-head"><h2 id="ov-snow-h">過往同期積雪</h2><a class="ov-head-link" href="./climate.html">近年積雪詳情</a></div>${inner}`;
}

function snowHTML(W) {
  const rows = D.bases.map(b => {
    const sid = SNOW_STATION[b.id] ?? null;
    const days = D.days.filter(d => d.base === b.id || (b.hotel && d.hotel === b.hotel)).map(d => d.day);
    return { b, days, stat: sid ? snowStat(W, sid) : null };
  });
  const max = Math.max(1, ...rows.map(r => r.stat?.avg ?? 0));
  const years = rows.find(r => r.stat)?.stat.years || [2021, 2025];
  const yr = `${years[0]}–${years[years.length - 1]}`;
  const list = rows.map(({ b, days, stat }) => {
    const focus = clock.phase !== 'after' && days.includes(clock.day);
    const name = `<span class="ov-snow-name"><strong>${esc(b.name)}</strong><small>${stat ? `<span>${esc(stat.name)}站</span>` : ''}<span class="num">${fmtDays(days)}</span></small></span>`;
    if (!stat || !Number.isFinite(stat.avg)) {
      return `<li class="is-none${focus ? ' is-focus' : ''}">${name}<span class="ov-snow-na">${stat ? '未有有效紀錄' : '未有觀測站'}</span></li>`;
    }
    const pct = (stat.avg / max * 100).toFixed(1);
    return `<li${focus ? ' class="is-focus"' : ''}>${name}
      <span class="ov-snow-bar" aria-hidden="true"><i style="width:${pct}%"></i></span>
      <span class="ov-snow-v num">${stat.avg.toFixed(1)}<small>cm</small></span>
      <span class="ov-snow-c">有積雪 <span class="num">${stat.covered}/${stat.n}</span> 日</span></li>`;
  }).join('');
  return snowShell(`<p class="ov-note">${yr} 年 12/13–20 每日最深積雪嘅平均。係過去觀測，<strong>唔係天氣預報</strong>。</p>
    <ul class="ov-snow-list">${list}</ul>
    <p class="ov-src">日本氣象廳（JMA）城鎮觀測站，唔係酒店門口或雪道實測；大樹町冇觀測站，唔用其他站代替。</p>`);
}

function renderSnow() {
  const slot = root.querySelector('[data-slot="snow"]');
  if (!mqDesk.matches) { slot.innerHTML = ''; return; }
  if (window.TRIP_WEATHER) { slot.innerHTML = snowHTML(window.TRIP_WEATHER); return; }
  slot.innerHTML = snowShell('<p class="ov-note" aria-live="polite">載入緊過往積雪紀錄…</p>');
  loadWeather()
    .then(() => { if (root && !root.hidden) renderSnow(); })
    .catch(() => { slot.innerHTML = snowShell('<p class="ov-note">積雪紀錄載入唔到，可以直接去近年積雪頁睇。</p>'); });
}

// ---------- Pre-trip checks & road links ----------
function todoHTML() {
  const todo = D.todo || [];
  if (!todo.length) return '';
  const title = clock.phase === 'before' ? '出發前要確認' : '仲未確認';
  return `<div class="ov-head"><h2 id="ov-todo-h">${title}</h2><span class="ov-count num">${todo.length}</span></div>
    <ul class="ov-todo-list">${todo.map(([t, x]) => `<li><strong>${esc(t)}</strong><span>${esc(x)}</span></li>`).join('')}</ul>`;
}

function roadsHTML() {
  const links = D.roadLinks || [];
  if (!links.length) return '';
  return `<div class="ov-head"><h2 id="ov-roads-h">路況及警報</h2></div>
    <p class="ov-note">落雪天開車前先睇封路、峠道同警報；車程只係冬季估算。</p>
    <ul class="ov-links">${links.map(([label, url]) => `<li>${link(url, label)}</li>`).join('')}</ul>`;
}

// ---------- Map ----------
function mapData() {
  return {
    items: dayItems(clock.day),
    hotels: D.hotels.map(h => h.id),
    route: true,
    origin: AIRPORT,
    originLabel: '新千歲機場（13日集合、20日返港）',
  };
}

function ensureMap() {
  if (!root || root.hidden || !mqWide.matches) return;
  if (!map) map = createMap(root.querySelector('.ov-map-box'), { label: '住宿路線地圖', onSelect: id => map.select(id, { pan: false }) });
  map.setData(mapData());
  map.invalidate(true);
}

// ---------- Render ----------
function slot(name, html) {
  const el = root.querySelector(`[data-slot="${name}"]`);
  el.innerHTML = html;
  el.hidden = !html;
}

function render() {
  clock = tripClock();
  root.querySelector('.ov').classList.toggle('is-before', clock.phase === 'before');
  slot('hero', heroBandHTML());
  slot('top', topHTML());
  slot('today', todayHTML());
  slot('board', boardHTML());
  slot('cal', calHTML());
  slot('todo', todoHTML());
  slot('roads', roadsHTML());
}

// A stamp toggled in the sheet re-renders the row that opened it; put focus back on its replacement.
function restoreFocus() {
  if (!root || root.hidden || !lastDetail) return;
  const a = document.activeElement;
  // At 'close' time focus can still sit on the (now closed) sheet's own button.
  if (a && a !== document.body && document.contains(a) && !a.closest('#sheet')) return;
  root.querySelector(`[data-detail="${CSS.escape(lastDetail)}"]`)?.focus();
}

export function init(el) {
  root = el;
  el.innerHTML = `<div class="ov">
    <header data-slot="hero"></header>
    <div class="ov-top" data-slot="top"></div>
    <div class="ov-main">
      <div class="ov-today" data-slot="today"></div>
      <section class="ov-map" aria-labelledby="ov-map-h">
        <div class="ov-head"><h2 id="ov-map-h">住宿路線</h2><p class="ov-note">虛線只係住宿次序，唔係導航路線</p></div>
        <div class="map-box ov-map-box"></div>
      </section>
    </div>
    <section class="ov-board panel" data-slot="board" aria-labelledby="ov-board-h"></section>
    <div class="ov-more">
      <div class="ov-col">
        <section class="ov-cal-wrap panel" data-slot="cal" aria-labelledby="ov-cal-h"></section>
        <section class="ov-roads panel" data-slot="roads" aria-labelledby="ov-roads-h"></section>
      </div>
      <div class="ov-col">
        <section class="ov-snow panel" data-slot="snow" aria-labelledby="ov-snow-h"></section>
        <section class="ov-todo panel" data-slot="todo" aria-labelledby="ov-todo-h"></section>
      </div>
    </div>
  </div>`;
  el.addEventListener('click', e => {
    const t = e.target.closest('[data-detail]');
    if (t) lastDetail = t.dataset.detail;
  });
  document.getElementById('sheet')?.addEventListener('sheetclosed', restoreFocus);
  mqWide.addEventListener('change', ensureMap);
  mqDesk.addEventListener('change', () => { if (root && !root.hidden) renderSnow(); });
}

export function show() {
  render();
  renderSnow();
  ensureMap();
}

export function onStars() {
  if (!root || root.hidden) return;
  slot('today', todayHTML());
  slot('board', boardHTML());
  slot('cal', calHTML());
  if (map) { map.setData(mapData()); map.refreshStamps(); }
}
