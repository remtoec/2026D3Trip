// Entry: routing, global delegated actions, and the window.FIXED_TRIP console API.
// View contract: each module in ./views exports init(el) (once) and show(route) (every visit),
// and may export hide() and selectItem(id) (desktop explore side panel).
import { D, item, base } from './trip.js';
import { parse, go, VIEWS } from './router.js';
import { $, $$, detailHTML, openSheet, initSheet, initPhotos, toast, copyText, syncStamp } from './ui.js';
import { toggleStar, onStarsChange, starredIds, pruneStars, toggleTheme } from './state.js';
import { calculate } from './budget.js';
import * as today from './views/overview.js';
import * as days from './views/days.js';
import * as explore from './views/explore.js';
import * as stars from './views/stars.js';
import * as stays from './views/stays.js';

const modules = { today, days, explore, stars, stays };
const inited = new Set();
let active = null;
let lastRoute = parse();

export const isDesktop = () => window.matchMedia('(min-width: 1100px)').matches;

function render() {
  // In-page anchors such as the skip link (#app) are not routes; leave the current view alone.
  if (active && location.hash && !location.hash.startsWith('#/')) return;
  const route = parse();
  if (route.view === 'item') {
    // Deep link to one item: open Explore on its base, then the detail.
    const a = item(route.param);
    go('explore', a ? a.bases[0] : '', a ? new URLSearchParams({ sel: a.id }) : null, { replace: true });
    if (a && !isDesktop()) setTimeout(() => showDetail(a.id), 0);
    return;
  }
  if (!VIEWS.includes(route.view)) { go('today', '', null, { replace: true }); return; }
  lastRoute = route;
  if (active && active !== route.view) modules[active].hide?.();
  $$('.view').forEach(v => { v.hidden = v.dataset.view !== route.view; });
  $$('[data-nav]').forEach(a => {
    if (a.dataset.nav === route.view) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const el = $(`#view-${route.view}`);
  if (!inited.has(route.view)) { modules[route.view].init(el); inited.add(route.view); }
  const changedView = active !== route.view;
  active = route.view;
  modules[route.view].show(route);
  if (changedView) window.scrollTo({ top: 0 });
}

export function showDetail(id, baseId) {
  const a = item(id);
  if (!a) return;
  if (active === 'explore' && isDesktop() && explore.selectItem) { explore.selectItem(id, { detail: true }); return; }
  const preferred = baseId || (active === 'explore' ? lastRoute.param : null);
  openSheet(a.name, detailHTML(a, preferred));
}

function updateStarCount() {
  const n = starredIds().length;
  const badge = $('#stars-count');
  badge.hidden = n === 0;
  badge.textContent = String(n);
  const nav = $('.topnav [data-nav="stars"]');
  if (nav) nav.textContent = n ? `想去清單 ${n}` : '想去清單';
}

function init() {
  if (!D) { document.body.insertAdjacentHTML('afterbegin', '<p class="callout">行程資料載入唔到，請重新整理頁面。</p>'); return; }
  pruneStars(new Set(D.activities.map(a => a.id)));
  initSheet();
  initPhotos();
  $('.skip-link').addEventListener('click', e => { e.preventDefault(); $('#app').focus(); });
  $('#data-checked').textContent = D.updated;

  document.addEventListener('click', async e => {
    const t = e.target.closest('[data-stamp],[data-detail],[data-copy]');
    if (!t) return;
    if (t.dataset.stamp) {
      const on = toggleStar(t.dataset.stamp);
      t.classList.remove('just-stamped');
      if (on) { void t.offsetWidth; t.classList.add('just-stamped'); }
      return;
    }
    if (t.dataset.detail) { e.preventDefault(); showDetail(t.dataset.detail); return; }
    if (t.dataset.copy) {
      const ok = await copyText(t.dataset.copy);
      toast(ok ? `已複製${t.dataset.copyLabel || ''}` : '複製唔到，請長按自己揀選');
    }
  });

  onStarsChange((id, on, saved) => {
    syncStamp(id, on);
    updateStarCount();
    if (!saved) toast('呢部機唔可以儲存，重新整理後會唔見');
    modules[active]?.onStars?.(id, on);
  });
  updateStarCount();

  $('#theme-toggle').addEventListener('click', () => {
    const t = toggleTheme();
    toast(t === 'dark' ? '已轉深色' : '已轉淺色');
  });

  // Legacy links: ?area=taiki opened the activities tab on a base.
  const area = new URLSearchParams(location.search).get('area');
  if (area && base(area) && !location.hash) history.replaceState(null, '', location.pathname + location.search + `#/explore/${area}`);

  window.addEventListener('hashchange', render);
  render();

  window.FIXED_TRIP = {
    calculate,
    activities: () => explore.currentItems ? explore.currentItems() : D.activities,
    setBase: id => go('explore', id),
    jumpBase: id => go('explore', id),
    setTab: id => go({ plan: 'days', activities: 'explore' }[id] || id),
    showDetail,
    selectActivity: id => go('item', id),
    state: () => ({ view: active, route: { view: lastRoute.view, param: lastRoute.param, query: Object.fromEntries(lastRoute.query) }, stars: starredIds() }),
  };
}

init();
