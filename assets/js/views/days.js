// 行程: one day at a time. Phone = date pills + swipe; desktop = day detail beside a map of that day.
import { D, TRIP_DAYS, WEEKDAY, day, item, base, stayFor, itemsForDay, fitDays, isEvening, mapsRoute } from '../trip.js';
import { $, esc, signHTML, rowHTML, icon, link, gmapsBtnHTML, naviHTML } from '../ui.js';
import { tripClock, starredIds } from '../state.js';
import { createMap } from '../map.js';
import { go } from '../router.js';

const AIRPORT = [42.7752, 141.6923];
let root = null;
let mapCtl = null;
let current = 13;

function endpoints(n) {
  const prev = stayFor(n - 1);
  const from = n === 13 ? AIRPORT : prev ? prev.coords : null;
  let to = stayFor(n) ? stayFor(n).coords : AIRPORT;
  if (n === 18) to = (item('annupuri') || {}).coords || to;
  return from && to && (from[0] !== to[0] || from[1] !== to[1]) ? [from, to] : null;
}

// Picks for the day plus anything the viewer stamped that fits this day.
function dayItems(n) {
  const picks = itemsForDay(n);
  const ids = new Set(picks.map(a => a.id));
  const stamped = starredIds().map(item).filter(a => a && !ids.has(a.id) && fitDays(a).includes(n));
  return { picks, stamped };
}

function renderPills(clock) {
  return `<div class="day-pills" role="tablist" aria-label="揀日子">${TRIP_DAYS.map(n => `
    <button class="day-pill${clock.phase === 'during' && clock.day === n ? ' is-today' : ''}" role="tab" type="button"
      id="day-tab-${n}" aria-selected="${n === current}" aria-controls="day-panel" tabindex="${n === current ? 0 : -1}" data-day="${n}">
      <b>${n}</b><span>${WEEKDAY[n]}</span>
    </button>`).join('')}</div>`;
}

function renderDay(n) {
  const d = day(n);
  const h = stayFor(n);
  const ends = endpoints(n);
  const { picks, stamped } = dayItems(n);
  const dayList = picks.filter(a => !isEvening(a));
  const nightList = picks.filter(isEvening);
  const b = base(d.base);
  const slot = (title, list) => list.length ? `<div class="slot"><h3>${title}</h3>${list.map(a => rowHTML(a, d.base)).join('')}</div>` : '';
  const more = D.activities.filter(a => a.bases.includes(d.base)).length;
  return `
    ${signHTML(d, ends ? { link: mapsRoute(ends[0], ends[1], (d.sign.via || []).filter(v => v.coords).map(v => v.coords)), linkLabel: '全日路線' } : {})}
    <div class="panel day-stay">
      <div style="flex:1;min-width:200px">
        <div class="small faint">今晚住</div>
        <strong style="font-size:17px">${h ? esc(h.name) : '返港，冇住宿'}</strong>
        <div class="who">${esc(d.pax)}</div>
        ${h ? naviHTML(h.navi) : ''}
      </div>
      ${h ? `<div style="display:flex;gap:8px;flex-wrap:wrap">${gmapsBtnHTML(h, { label: '開車去', cls: 'btn small' })}<a class="btn small ghost" href="#/stays">住宿資料</a></div>` : ''}
    </div>
    <div class="panel" style="display:grid;gap:10px">
      <h2 style="font-size:19px">${esc(d.title)}</h2>
      <p class="day-plan">${esc(d.plan)}</p>
      <p class="day-drive">${esc(d.drive)}</p>
    </div>
    ${slot('日間揀', dayList)}
    ${slot('夜晚揀', nightList)}
    ${slot('你蓋咗印、又啱呢日', stamped)}
    ${!picks.length && !stamped.length ? '<p class="empty">呢日主要係移動同搭機，冇預排景點。</p>' : ''}
    <div class="day-nav">
      <a class="btn ghost" href="#/explore/${esc(d.base)}">${esc(b ? b.name : '')}附近仲有 ${more} 項</a>
    </div>
    <div class="panel">
      <div class="panel-head"><h2>出發前睇路況</h2></div>
      <div class="road-links">${(D.roadLinks || []).map(([label, url]) => link(url, label, 'btn small ghost')).join('')}</div>
      <p class="small muted" style="margin-top:10px">車程係冬季規劃估算，唔係即時導航；大雪或封路以當日資料為準。</p>
    </div>
    <div class="day-nav">
      <button class="btn ghost" type="button" data-step="-1" ${n <= 13 ? 'disabled' : ''}>${icon('left')}${n > 13 ? `${n - 1}日` : ''}</button>
      <button class="btn ghost" type="button" data-step="1" ${n >= 20 ? 'disabled' : ''}>${n < 20 ? `${n + 1}日` : ''}${icon('right')}</button>
    </div>`;
}

function drawMap(n) {
  if (!mapCtl) return;
  const d = day(n);
  const { picks, stamped } = dayItems(n);
  const hotels = [stayFor(n - 1), stayFor(n)].filter(Boolean).map(h => h.id);
  const b = base(d.base);
  mapCtl.setData({
    items: [...picks, ...stamped],
    hotels: [...new Set(hotels)],
    origin: b && !b.hotel ? b.coords : null,
    originLabel: '千歲市區分隊點（約略）',
  });
  mapCtl.invalidate(true);
}

function setDay(n, { push = true } = {}) {
  n = Math.min(20, Math.max(13, Number(n) || 13));
  if (push) { go('days', String(n)); return; }
  current = n;
  $('.days-strip', root).innerHTML = renderPills(tripClock());
  const panel = $('#day-panel', root);
  panel.setAttribute('aria-labelledby', `day-tab-${n}`);
  $('.day-main', root).innerHTML = renderDay(n);
  drawMap(n);
}

export function init(el) {
  root = el;
  el.innerHTML = `
    <div class="view-head"><div><h1>每日行程</h1><p>住宿路線已定；每日揀一兩樣就夠。</p></div></div>
    <div class="days-strip"></div>
    <div class="day-layout" id="day-panel" role="tabpanel">
      <div class="day-main" style="display:grid;gap:14px"></div>
      <div class="day-map"><div class="map-box"></div></div>
    </div>`;
  mapCtl = createMap($('.map-box', el), { label: '當日住宿及景點地圖' });

  el.addEventListener('click', e => {
    const pill = e.target.closest('[data-day]');
    if (pill) setDay(pill.dataset.day);
    const step = e.target.closest('[data-step]');
    if (step) setDay(current + Number(step.dataset.step));
  });
  el.addEventListener('keydown', e => {
    if (!e.target.closest('[data-day]')) return;
    const keys = { ArrowRight: 1, ArrowLeft: -1, Home: 13 - current, End: 20 - current };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const target = Math.min(20, Math.max(13, current + keys[e.key]));
    window.addEventListener('hashchange', () => requestAnimationFrame(() => $(`#day-tab-${target}`, root)?.focus()), { once: true });
    setDay(target);
  });

  // Horizontal swipe on the day content (phones).
  let sx = 0, sy = 0, tracking = false;
  const main = $('.day-main', el);
  main.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; tracking = true; });
  main.addEventListener('pointerup', e => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 45) setDay(current + (dx < 0 ? 1 : -1));
  });
  main.addEventListener('pointercancel', () => { tracking = false; });
}

export function show(route) {
  const clock = tripClock();
  const n = Number(route.param) || (clock.phase === 'during' ? clock.day : 13);
  setDay(n, { push: false });
}

export function onStars() {
  setDay(current, { push: false });
}
