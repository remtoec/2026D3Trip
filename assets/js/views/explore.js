// 景點: base tabs + category chips. Phone = swipe carousel or full map; desktop = list | map | detail.
import { D, CATS, CAT_ORDER, base, item, category, drive, itemsForBase, day, basePhoto } from '../trip.js';
import { $, $$, esc, itemCardHTML, detailHTML, pagerHTML, openSheet, closeSheet, icon, link, heroHTML } from '../ui.js';
import { isStarred, tripClock } from '../state.js';
import { createMap } from '../map.js';
import { go } from '../router.js';

const FILTERS = {
  drive: [['all', '全部'], ['30', '30分鐘內'], ['60', '一小時內'], ['far', '一至兩小時']],
  time: [['all', '全部'], ['day', '日間'], ['evening', '夜晚']],
  booking: [['all', '全部'], ['none', '唔使預約'], ['need', '要／建議預約']],
};
const DEFAULTS = { cat: 'all', drive: 'all', time: 'all', booking: 'all', starred: '' };

let root = null;
let mapCtl = null;
let st = { base: 'taiki', ...DEFAULTS, mode: 'list', page: 0, sel: null };
// Jump the pager to the selected card only when the selection itself changes, not on every render.
let snapToSel = false;
// The base banner only changes with the base; keep its <img> across filter re-renders.
let bannerBase = null;
const mqDesktop = window.matchMedia('(min-width: 1100px)');
const mqPhone = window.matchMedia('(max-width: 699px)');

const pageSize = () => (mqDesktop.matches ? 5 : 6);

function passes(a, skipCat = false) {
  if (!skipCat && st.cat !== 'all' && category(a) !== st.cat) return false;
  const max = drive(a, st.base).max;
  if (st.drive === '30' && max > 30) return false;
  if (st.drive === '60' && max > 60) return false;
  if (st.drive === 'far' && max <= 60) return false;
  if (st.time === 'day' && a.timeOfDay === 'evening') return false;
  if (st.time === 'evening' && !(a.timeOfDay === 'evening' || a.timeOfDay === 'any')) return false;
  if (st.booking === 'none' && (a.booking === 'required' || a.booking === 'recommended')) return false;
  if (st.booking === 'need' && !(a.booking === 'required' || a.booking === 'recommended')) return false;
  if (st.starred && !isStarred(a.id)) return false;
  return true;
}

export function currentItems() {
  return itemsForBase(st.base).filter(a => passes(a));
}

function activeFilterCount() {
  return ['drive', 'time', 'booking'].filter(k => st[k] !== 'all').length + (st.starred ? 1 : 0);
}

function query(over = {}) {
  const next = { ...st, ...over };
  const q = new URLSearchParams();
  Object.keys(DEFAULTS).forEach(k => { if (next[k] && next[k] !== DEFAULTS[k]) q.set(k, next[k]); });
  if (next.mode === 'map') q.set('mode', 'map');
  return q;
}
const navigate = over => go('explore', over.base || st.base, query(over));

function barHTML() {
  const all = itemsForBase(st.base).filter(a => passes(a, true));
  const count = c => all.filter(a => category(a) === c).length;
  return `
    <div class="chips base-tabs" role="tablist" aria-label="住宿基地">${D.bases.map(b => `
      <button class="chip" role="tab" type="button" data-base="${b.id}" aria-selected="${b.id === st.base}" tabindex="${b.id === st.base ? 0 : -1}">${esc(b.name)}</button>`).join('')}
    </div>
    <div class="chips" aria-label="類別">
      <button class="chip" type="button" data-cat-chip="all" aria-pressed="${st.cat === 'all'}">全部 <span class="count">${all.length}</span></button>
      ${CAT_ORDER.filter(c => count(c) || st.cat === c).map(c => `
        <button class="chip" type="button" data-cat="${c}" data-cat-chip="${c}" aria-pressed="${st.cat === c}"><span class="cat-dot" aria-hidden="true"></span>${CATS[c].label} <span class="count">${count(c)}</span></button>`).join('')}
    </div>`;
}

function listHTML(list) {
  if (!list.length) {
    return `<div class="empty">呢個範圍未有啱嘅項目。<br><button class="btn small" type="button" data-reset>清除篩選</button></div>`;
  }
  if (mqPhone.matches) {
    return `<div class="carousel" tabindex="0" aria-label="景點卡，左右掃">${list.map(a => itemCardHTML(a, st.base, { selected: a.id === st.sel })).join('')}</div>
      <div class="pager"><span class="pager-count" data-carousel-count>1 / ${list.length}</span>
        <div class="pager-btns"><button type="button" data-slide="-1" aria-label="上一張">${icon('left')}</button><button type="button" data-slide="1" aria-label="下一張">${icon('right')}</button></div></div>`;
  }
  const pages = Math.max(1, Math.ceil(list.length / pageSize()));
  st.page = Math.min(Math.max(0, st.page), pages - 1);
  const slice = list.slice(st.page * pageSize(), (st.page + 1) * pageSize());
  return `<div class="list-grid">${slice.map(a => itemCardHTML(a, st.base, { selected: a.id === st.sel })).join('')}</div>${pagerHTML(st.page, pages)}`;
}

function sideHTML() {
  const a = st.sel && item(st.sel);
  if (!a) return `<div class="panel"><p class="muted">撳卡上面「詳情」或者地圖標記，喺度睇營業時間、預約、過來人貼士同導航。</p></div>`;
  return `<div class="panel">${detailHTML(a, st.base, { withTitle: true })}</div>`;
}

function excludedHTML() {
  const rows = (D.excluded || []).filter(r => !r[3] || r[3] === st.base);
  if (!rows.length) return '';
  return `<details class="not-this-trip"><summary>今次日子唔啱嘅項目（${rows.length}）</summary><ul>${rows.map(([name, note, url]) => `
    <li><strong>${esc(name)}</strong>${esc(note)} ${link(url, '官方資料')}</li>`).join('')}</ul></details>`;
}

function render() {
  const b = base(st.base);
  const list = currentItems();
  if (st.sel && !list.some(a => a.id === st.sel)) st.sel = null;
  if (snapToSel && st.sel && !mqPhone.matches) {
    const i = list.findIndex(a => a.id === st.sel);
    if (i >= 0) st.page = Math.floor(i / pageSize());
  }
  snapToSel = false;
  const showMap = mqDesktop.matches || st.mode === 'map';
  const showList = mqDesktop.matches || st.mode === 'list';
  root.querySelector('.explore-bar').innerHTML = barHTML();
  if (bannerBase !== st.base) {
    bannerBase = st.base;
    const p = basePhoto(st.base);
    root.querySelector('.base-note').innerHTML = heroHTML(p, `<h1>${esc(b.name)}<span class="num">${esc(b.dates)}</span></h1><p>${esc(b.desc)}</p>`,
      { cls: 'base-hero', alt: p?.caption || b.name, w: 1400 });
  }
  const n = activeFilterCount();
  root.querySelector('.explore-tools').innerHTML = `
    <span class="count">${list.length} 項</span>
    <button class="btn small ghost" type="button" data-open-filters>${icon('filter')}篩選${n ? `（${n}）` : ''}</button>
    <div class="seg" role="group" aria-label="顯示方式">
      <button type="button" data-mode="list" aria-pressed="${st.mode === 'list'}">${icon('list')}清單</button>
      <button type="button" data-mode="map" aria-pressed="${st.mode === 'map'}">${icon('map')}地圖</button>
    </div>`;
  const listEl = root.querySelector('.explore-list');
  listEl.hidden = !showList;
  listEl.innerHTML = listHTML(list);
  const mapEl = root.querySelector('.explore-map');
  mapEl.hidden = !showMap;
  root.querySelector('.explore-side').innerHTML = sideHTML();
  root.querySelector('.explore-peek').innerHTML = !mqDesktop.matches && st.sel && st.mode === 'map' ? itemCardHTML(item(st.sel), st.base, { selected: true }) : '';
  root.querySelector('.explore-excluded').innerHTML = excludedHTML();
  if (mapCtl) {
    mapCtl.setData({
      items: list,
      hotels: b.hotel ? [b.hotel] : [],
      origin: b.hotel ? null : b.coords,
      originLabel: '千歲市區分隊點（約略）',
    });
    if (showMap) {
      mapCtl.invalidate(!st.sel);
      if (st.sel) requestAnimationFrame(() => mapCtl.select(st.sel));
    }
  }
  bindCarousel();
}

function bindCarousel() {
  const track = root.querySelector('.carousel');
  if (!track) return;
  const counter = root.querySelector('[data-carousel-count]');
  const total = track.children.length;
  const update = () => {
    const w = track.children[0]?.getBoundingClientRect().width || 1;
    const i = Math.min(total - 1, Math.round(track.scrollLeft / (w + 12)));
    counter.textContent = `${i + 1} / ${total}`;
  };
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  if (st.sel) {
    const card = track.querySelector(`[data-item="${CSS.escape(st.sel)}"]`);
    if (card) track.scrollLeft = card.offsetLeft - 16;
  }
  update();
}

export function selectItem(id, { detail = false } = {}) {
  st.sel = id;
  snapToSel = true;
  render();
  if (mqDesktop.matches) {
    const side = root.querySelector('.explore-side');
    side.scrollTop = 0;
    if (detail) side.querySelector('.detail-title')?.focus();
  }
}

function filtersHTML() {
  const group = (key, title) => `<div class="filter-group"><h3>${title}</h3><div class="chips">${FILTERS[key].map(([v, label]) =>
    `<button class="chip" type="button" data-filter="${key}" data-value="${v}" aria-pressed="${st[key] === v}">${label}</button>`).join('')}</div></div>`;
  return `${group('drive', '單程車程')}${group('time', '時段')}${group('booking', '預約')}
    <div class="filter-group"><h3>想去</h3><div class="chips"><button class="chip" type="button" data-filter="starred" data-value="${st.starred ? '' : '1'}" aria-pressed="${!!st.starred}">只睇蓋咗印嘅</button></div></div>
    <div style="display:flex;gap:10px;justify-content:space-between;margin-top:6px">
      <button class="btn ghost" type="button" data-reset>清除</button>
      <button class="btn" type="button" data-close-filters>睇 ${currentItems().length} 項</button>
    </div>`;
}

export function init(el) {
  root = el;
  el.innerHTML = `
    <div class="explore-bar"></div>
    <div class="base-note"></div>
    <div class="explore-tools"></div>
    <div class="explore-grid">
      <div class="explore-list"></div>
      <div class="explore-map"><div class="map-box"></div><div class="explore-peek" style="margin-top:12px"></div></div>
      <aside class="explore-side" aria-label="詳情"></aside>
    </div>
    <div class="explore-excluded"></div>
    <p class="small muted" style="margin-top:14px">車程係由所揀基地出發嘅單程冬季估算；地圖虛線只表示住宿次序，唔係導航。部分標記係約略位置，詳情會註明。</p>`;
  mapCtl = createMap(el.querySelector('.map-box'), {
    label: '住宿及附近景點地圖',
    onSelect: id => {
      st.sel = id;
      snapToSel = true;
      if (mqDesktop.matches) render();
      else root.querySelector('.explore-peek').innerHTML = itemCardHTML(item(id), st.base, { selected: true });
    },
  });

  el.addEventListener('click', e => {
    const t = e.target;
    const baseBtn = t.closest('[data-base]');
    if (baseBtn) { st.sel = null; st.page = 0; navigate({ base: baseBtn.dataset.base }); return; }
    const cat = t.closest('[data-cat-chip]');
    if (cat) { st.page = 0; navigate({ cat: cat.dataset.catChip }); return; }
    const mode = t.closest('[data-mode]');
    if (mode) { navigate({ mode: mode.dataset.mode }); return; }
    if (t.closest('[data-open-filters]')) { openSheet('篩選', filtersHTML()); return; }
    if (t.closest('[data-reset]')) { st.page = 0; navigate({ ...DEFAULTS }); return; }
    const pg = t.closest('[data-page]');
    if (pg) {
      const dir = pg.dataset.page;
      st.page += Number(dir);
      render();
      const list = root.querySelector('.explore-list');
      (list.querySelector(`[data-page="${dir}"]:not(:disabled)`) || list.querySelector('[data-page]:not(:disabled)'))?.focus();
      list.scrollIntoView({ block: 'nearest' });
      return;
    }
    const slide = t.closest('[data-slide]');
    if (slide) {
      const track = root.querySelector('.carousel');
      const w = track.children[0].getBoundingClientRect().width + 12;
      track.scrollBy({ left: w * Number(slide.dataset.slide), behavior: 'smooth' });
      return;
    }
    const loc = t.closest('[data-locate]');
    if (loc) {
      st.sel = loc.dataset.locate;
      snapToSel = true;
      if (mqDesktop.matches) render();
      else navigate({ mode: 'map' });
    }
  });

  el.addEventListener('keydown', e => {
    if (!e.target.closest('[data-base]')) return;
    const ids = D.bases.map(b => b.id);
    const i = ids.indexOf(st.base);
    const next = { ArrowRight: (i + 1) % ids.length, ArrowLeft: (i + ids.length - 1) % ids.length, Home: 0, End: ids.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    st.sel = null;
    // The route change re-renders the tabs; focus the new one after that hashchange.
    window.addEventListener('hashchange', () => requestAnimationFrame(() => root.querySelector(`[data-base="${ids[next]}"]`)?.focus()), { once: true });
    navigate({ base: ids[next] });
  });

  // Filter sheet lives in the global dialog.
  document.getElementById('sheet-body').addEventListener('click', e => {
    const f = e.target.closest('[data-filter]');
    if (f) {
      // Update state first so the sheet redraws with the new choice, then sync the URL.
      const key = f.dataset.filter;
      Object.assign(st, { [key]: f.dataset.value, page: 0 });
      const body = document.getElementById('sheet-body');
      body.innerHTML = filtersHTML();
      (body.querySelector(`[data-filter="${key}"][aria-pressed="true"]`) || body.querySelector(`[data-filter="${key}"]`))?.focus();
      navigate({});
      return;
    }
    if (e.target.closest('[data-close-filters]')) closeSheet();
    if (e.target.closest('#sheet-body [data-reset]')) { Object.assign(st, DEFAULTS, { page: 0 }); navigate({}); closeSheet(); }
  });

  [mqDesktop, mqPhone].forEach(mq => mq.addEventListener('change', () => { if (!root.hidden) render(); }));
}

export function show(route) {
  const q = route.query;
  let b = route.param;
  if (!base(b)) {
    const clock = tripClock();
    b = clock.phase === 'during' ? (day(clock.day) || {}).base || 'taiki' : 'taiki';
  }
  if (b !== st.base) { st.sel = null; st.page = 0; }
  st.base = b;
  Object.keys(DEFAULTS).forEach(k => { st[k] = q.get(k) || DEFAULTS[k]; });
  if (!FILTERS.drive.some(([v]) => v === st.drive)) st.drive = 'all';
  if (!FILTERS.time.some(([v]) => v === st.time)) st.time = 'all';
  if (!FILTERS.booking.some(([v]) => v === st.booking)) st.booking = 'all';
  if (st.cat !== 'all' && !CATS[st.cat]) st.cat = 'all';
  st.mode = q.get('mode') === 'map' ? 'map' : 'list';
  if (q.get('sel') && item(q.get('sel'))) { st.sel = q.get('sel'); snapToSel = true; }
  render();
}

export function onStars(id) {
  if (st.starred) render();
  else mapCtl?.refreshStamps();
}
