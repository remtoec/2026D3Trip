// Shared renderers and small UI helpers (sheet, toast, clipboard).
import { CATS, PRIORITY, CONFIDENCE, TRIP_DAYS, WEEKDAY, category, drive, fitDays, closedDays, hoursShort, mapsSearch, mapsGo, mapsRoute, travelModes, baseOrigin, primaryBase, base, hotel } from './trip.js';
import { isStarred } from './state.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ICONS = {
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z"/><path d="M9 4v14M15 6v14"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  car: '<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3.5 16h17v2.5h-17zM7.5 19v1.5M16.5 19v1.5M7 13h.01M17 13h.01"/>',
  phone: '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.8" r="2.4"/>',
  train: '<rect x="6" y="3.5" width="12" height="13" rx="3"/><path d="M6 11h12M9 20l-1.5 1.5M15 20l1.5 1.5M9.5 14h.01M14.5 14h.01"/>',
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6 3 3v3M9 11l3-3 3 3 2.5 1M12 8l-1 5"/>',
  nav: '<path d="M3.5 11 20 4l-7 16.5-2.2-7.3L3.5 11Z"/>',
};
export const icon = name =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

const ARROW = '<svg class="sign-arrow" viewBox="0 0 34 18" aria-hidden="true"><path d="M2 9h28M22 2l8 7-8 7"/></svg>';
const LANG = { ja: ['日', 'ja', '日文'], 'zh-TW': ['台', 'tw', '台灣'], 'zh-HK': ['港', 'hk', '香港'], en: ['英', 'en', '英文'] };
const BOOKING = { none: '毋須預約', recommended: '建議預約', required: '要預約' };

export const link = (url, label, cls = '') => url ? `<a ${cls ? `class="${cls}" ` : ''}href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>` : '';

// ---------- Road sign ----------
export function signHTML(d, { link: linkHref = '', linkLabel = '', compact = false } = {}) {
  const s = d.sign || {};
  const place = (cls, zh, en) => `<span class="sign-place ${cls}"><strong>${esc(zh)}</strong>${en ? `<small>${esc(en)}</small>` : ''}</span>`;
  const via = (s.via || []).map(v => `${ARROW}${place('via', v.zh, v.en)}`).join('');
  return `<div class="sign${s.from ? '' : ' is-stay'}${compact ? ' is-compact' : ''}" role="group" aria-label="${d.day}日路線：${esc(s.from || '')}去${esc(s.to || '')}">
    <div class="sign-day"><b>${d.day}</b><span>12月・${WEEKDAY[d.day]}</span></div>
    <div class="sign-route">${s.from ? place('from', s.from, s.fromEn) : ''}${via}${s.from ? ARROW : ''}${place('to', s.to || d.title, s.toEn)}</div>
    <div class="sign-foot">${s.time ? `<span class="sign-time">${esc(s.time)}<small>${esc(s.unit || '小時')}</small></span>` : ''}${s.note ? `<span class="sign-note">${esc(s.note)}</span>` : ''}
      ${linkHref ? `<a class="sign-link" href="${esc(linkHref)}"${/^https?:/.test(linkHref) ? ' target="_blank" rel="noopener"' : ''}>${/^https?:/.test(linkHref) ? icon('nav') : ''}${esc(linkLabel)}</a>` : ''}</div>
  </div>`;
}

// ---------- Small pieces ----------
export function plateHTML(a, baseId) {
  const dv = drive(a, baseId);
  if (!dv.short) return '';
  return `<span class="plate${dv.walk ? ' walk' : ''}" title="${esc(dv.text)}">${esc(dv.short)}${dv.unit ? `<small>${dv.unit}</small>` : ''}</span>`;
}

export function catHTML(a, withTag = true) {
  const c = category(a);
  return `<span class="cat" data-cat="${c}"><i aria-hidden="true">${CATS[c].glyph}</i>${esc(CATS[c].label)}${withTag && a.tag ? `・${esc(a.tag)}` : ''}</span>`;
}

export function stampHTML(id, name = '') {
  const on = isStarred(id);
  return `<button class="stamp-btn" type="button" data-stamp="${esc(id)}" aria-pressed="${on}" aria-label="${on ? '取消想去' : '加入想去'}${name ? '：' + esc(name) : ''}">想去</button>`;
}

export function daystripHTML(a) {
  const fit = new Set(fitDays(a));
  const closed = new Set(closedDays(a));
  return `<div class="daystrip" aria-label="適合日子：${[...fit].map(d => d + '日').join('、') || '未定'}">${TRIP_DAYS.map(d => {
    const cls = closed.has(d) ? 'closed' : fit.has(d) ? 'fit' : '';
    return `<span class="${cls}" title="${d}日（${WEEKDAY[d]}）${closed.has(d) ? '休息' : fit.has(d) ? '適合' : ''}">${d}</span>`;
  }).join('')}</div>`;
}

function flagsHTML(a) {
  const out = [];
  if (a.priority === 'main') out.push(`<span class="flag ok">${PRIORITY.main}</span>`);
  if (a.priority === 'check') out.push(`<span class="flag warn">${PRIORITY.check}</span>`);
  if (a.booking === 'required') out.push('<span class="flag stamp">要預約</span>');
  else if (a.booking === 'recommended') out.push('<span class="flag">建議預約</span>');
  return out.join('');
}

// ---------- Google Maps (directions from the phone's current location) ----------
const MODE_LABEL = { driving: ['nav', '開車去'], transit: ['train', '公共交通'], walking: ['walk', '行路'] };
const ext = 'target="_blank" rel="noopener"';

// One compact button for cards and hotel lists.
export function gmapsBtnHTML(p, { label = 'Google Maps', cls = 'btn small ghost gmaps' } = {}) {
  return `<a class="${cls}" href="${esc(mapsGo(p))}" ${ext} aria-label="用 Google Maps 導航去${esc(p.name)}">${icon('nav')}${esc(label)}</a>`;
}

// Full block for detail sheets / panels: modes + place page + route from a fixed start.
export function gmapsHTML(p, { from = null, fromLabel = '' } = {}) {
  const modes = p.kind === 'stay' ? ['driving'] : travelModes(p);
  return `<div class="gmaps-block">
    <div class="gmaps-row">${modes.map((m, i) => `<a class="btn small${i ? ' ghost' : ''}" href="${esc(mapsGo(p, m))}" ${ext}>${icon(MODE_LABEL[m][0])}${MODE_LABEL[m][1]}</a>`).join('')}
      <a class="btn small ghost" href="${esc(mapsSearch(p))}" ${ext}>${icon('pin')}地點資料</a>
      ${from && fromLabel ? `<a class="btn small ghost" href="${esc(mapsRoute(from, p.coords && (p.kind === 'stay' || !p.approx) ? p.coords : (p.nameJa || p.name)))}" ${ext}>${icon('car')}${esc(fromLabel)}</a>` : ''}
    </div>
    <p class="gmaps-note">會開 Google Maps，由你而家位置出發；喺 App 入面可以轉開車／公共交通／行路。</p>
  </div>`;
}

// ---------- Item card (carousel / list) ----------
export function itemCardHTML(a, baseId, { selected = false } = {}) {
  const hours = hoursShort(a);
  return `<article class="item${selected ? ' is-selected' : ''}" data-cat="${category(a)}" data-item="${esc(a.id)}">
    <div class="item-top">${catHTML(a)}${stampHTML(a.id, a.name)}</div>
    <h3 class="item-title">${esc(a.name)}${a.nameJa ? `<small lang="ja">${esc(a.nameJa)}</small>` : ''}</h3>
    <p class="item-hook">${esc(a.hook || a.desc)}</p>
    <div class="item-meta">${plateHTML(a, baseId)}${hours ? `<span class="time">${esc(hours)}</span>` : ''}${a.stay ? `<span>玩${esc(a.stay)}</span>` : ''}${flagsHTML(a)}</div>
    ${daystripHTML(a)}
    <div class="item-actions">
      <button class="btn small" type="button" data-detail="${esc(a.id)}">詳情</button>
      <button class="link-btn" type="button" data-locate="${esc(a.id)}">地圖</button>
      ${gmapsBtnHTML(a, { cls: 'btn small ghost gmaps more' })}
    </div>
  </article>`;
}

// ---------- Compact row (days view, stamp book, overview) ----------
export function rowHTML(a, baseId, { sub = '' } = {}) {
  const hours = hoursShort(a);
  const line = sub || [drive(a, baseId).text, hours].filter(Boolean).join('・');
  return `<div class="row-item" data-cat="${category(a)}">
    <button class="row-main" type="button" data-detail="${esc(a.id)}">
      <span class="cat"><i aria-hidden="true">${CATS[category(a)].glyph}</i></span>
      <span><strong>${esc(a.name)}</strong><span class="sub">${esc(line)}</span></span>
      <span class="end">${isStarred(a.id) ? '<span class="flag stamp">想去</span>' : ''}${a.priority === 'main' ? '<span class="flag ok">主推</span>' : ''}</span>
    </button>
    <a class="row-go" href="${esc(mapsGo(a))}" ${ext} aria-label="用 Google Maps 導航去${esc(a.name)}" title="Google Maps 導航">${icon('nav')}</a>
  </div>`;
}

// Car navigation in Japan searches by phone number or Mapcode.
export function naviHTML(n) {
  if (!n || !(n.mapcode || n.tel)) return '';
  return `<div class="navi">
      ${n.mapcode ? `<button class="copy-btn" type="button" data-copy="${esc(n.mapcode)}" data-copy-label="Mapcode">Mapcode <b>${esc(n.mapcode)}</b>${icon('copy')}</button>` : ''}
      ${n.tel ? `<a class="copy-btn" href="tel:${esc(n.tel.replace(/[^\d+]/g, ''))}">電話 <b>${esc(n.tel)}</b></a>` : ''}
    </div>`;
}

// ---------- Detail (sheet body or desktop side panel) ----------
export function detailHTML(a, baseId, { withTitle = false } = {}) {
  const b = primaryBase(a, baseId);
  const conf = CONFIDENCE[a.confidence];
  const fromHotel = a.enRoute && a.enRoute.from ? hotel(a.enRoute.from) : null;
  const origin = fromHotel ? fromHotel.coords : baseOrigin(b);
  const food = a.food ? `<section class="detail-section"><h3>食咩好</h3><dl class="detail-facts">
      ${a.food.dish ? `<dt>招牌</dt><dd>${esc(a.food.dish)}</dd>` : ''}
      ${a.food.price ? `<dt>價錢</dt><dd>${esc(a.food.price)}</dd>` : ''}
      ${a.food.tabelog ? `<dt>食べログ</dt><dd class="num">${esc(a.food.tabelog)}</dd>` : ''}
      ${a.food.queue ? `<dt>排隊</dt><dd>${esc(a.food.queue)}</dd>` : ''}</dl></section>` : '';
  const tips = (a.tips || []).length ? `<section class="detail-section"><h3>過來人貼士</h3><ul class="tips">${a.tips.map(([text, src, url, lang]) => {
      const L = LANG[lang] || ['參', '', '參考'];
      return `<li><span class="lang ${L[1]}" title="${L[2]}來源">${L[0]}</span><span>${esc(text)}<span class="src">${url ? link(url, src) : esc(src)}</span></span></li>`;
    }).join('')}</ul></section>` : '';
  const navi = naviHTML(a.navi);
  const sources = (a.sources || []).map(([label, url]) => link(url, label)).join('');
  return `<article class="detail" data-cat="${category(a)}">
    <div class="item-top">${catHTML(a)}${stampHTML(a.id, a.name)}</div>
    ${withTitle ? `<h2 class="detail-title" tabindex="-1">${esc(a.name)}${a.nameJa ? `<small lang="ja">${esc(a.nameJa)}</small>` : ''}</h2>` : (a.nameJa ? `<p class="faint" lang="ja">${esc(a.nameJa)}</p>` : '')}
    ${a.hook ? `<p class="detail-hook">${esc(a.hook)}</p>` : ''}
    <p>${esc(a.desc)}</p>
    <div class="item-meta">${plateHTML(a, b)}<span>${esc(drive(a, b).text)}${base(b) ? `（由${esc(base(b).name)}）` : ''}</span>${flagsHTML(a)}</div>
    ${gmapsHTML(a, { from: origin, fromLabel: fromHotel ? '由' + (fromHotel.short || fromHotel.name) + '出發' : (base(b) && base(b).hotel ? '由住宿出發' : '') })}
    <section class="detail-section"><h3>邊日啱去</h3>${daystripHTML(a)}
      <div class="daystrip-legend" style="margin-top:6px"><span>深色＝適合</span><span>紅線＝休息</span></div></section>
    <section class="detail-section"><h3>點樣放入行程</h3><p>${esc(a.fit)}</p></section>
    <dl class="detail-facts">
      <dt>開放</dt><dd>${esc(a.status)}</dd>
      ${a.stay ? `<dt>建議停留</dt><dd>${esc(a.stay)}</dd>` : ''}
      <dt>費用</dt><dd>${esc(a.cost)}</dd>
      ${a.booking ? `<dt>預約</dt><dd>${BOOKING[a.booking] || esc(a.booking)}</dd>` : ''}
      <dt>位置</dt><dd>${esc(a.positionNote)}</dd>
    </dl>
    ${food}${tips}${navi}
    <div class="detail-section"><h3>來源</h3><div class="link-list">${link(a.url, '官方資料')}${sources}</div></div>
    <p class="source-meta">${conf ? `<span class="flag ${conf.tone}">${conf.label}</span> ` : ''}資料查核：${esc(a.checked || window.ITINERARY_DATA.updated)}。未代訂，實際場次及營業以官方為準。</p>
  </article>`;
}

// ---------- Sheet ----------
let sheetReturnFocus = null;
export function openSheet(title, html) {
  const dlg = $('#sheet');
  $('#sheet-title').textContent = title;
  $('#sheet-body').innerHTML = html;
  $('#sheet-body').scrollTop = 0;
  if (!dlg.open) {
    sheetReturnFocus = document.activeElement;
    dlg.showModal();
  }
}
export function closeSheet() {
  const dlg = $('#sheet');
  if (dlg.open) dlg.close();
}
export function initSheet() {
  const dlg = $('#sheet');
  $('#sheet-close').addEventListener('click', closeSheet);
  dlg.addEventListener('click', e => { if (e.target === dlg) closeSheet(); });
  dlg.addEventListener('close', () => {
    document.body.appendChild($('#toast'));
    focusReplacement(sheetReturnFocus);
    dlg.dispatchEvent(new CustomEvent('sheetclosed'));
  });
}

// Views often re-render the button that opened the sheet; refocus its replacement (same data attribute).
function focusReplacement(el) {
  if (!el) return;
  if (document.contains(el)) { el.focus(); return; }
  for (const key of ['detail', 'openFilters', 'locate', 'stamp']) {
    if (!(key in el.dataset)) continue;
    const attr = 'data-' + key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
    const sel = el.dataset[key] ? `[${attr}="${CSS.escape(el.dataset[key])}"]` : `[${attr}]`;
    const hit = [...document.querySelectorAll(sel)].find(n => n.offsetParent !== null);
    if (hit) { hit.focus(); return; }
  }
}

// The modal sheet sits in the top layer and makes the rest of the page inert, so anything the
// user must see or use while it is open (toast, clipboard fallback) has to live inside it.
const layerHost = () => ($('#sheet').open ? $('#sheet') : document.body);

// ---------- Toast & clipboard ----------
let toastTimer = 0;
export function toast(message) {
  const el = $('#toast');
  if (el.parentElement !== layerHost()) layerHost().appendChild(el);
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    layerHost().appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

// Refresh every stamp button for an id after a toggle (cards, sheet and panels show the same item).
export function syncStamp(id, on) {
  $$(`[data-stamp="${CSS.escape(id)}"]`).forEach(btn => {
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', (on ? '取消想去' : '加入想去') + (btn.getAttribute('aria-label').split('：')[1] ? '：' + btn.getAttribute('aria-label').split('：')[1] : ''));
  });
}

export function pagerHTML(page, pages, label = '頁') {
  return `<div class="pager">
    <span class="pager-count" aria-live="polite">${page + 1} / ${pages} ${label}</span>
    <div class="pager-btns">
      <button type="button" data-page="-1" aria-label="上一頁" ${page <= 0 ? 'disabled' : ''}>${icon('left')}</button>
      <button type="button" data-page="1" aria-label="下一頁" ${page >= pages - 1 ? 'disabled' : ''}>${icon('right')}</button>
    </div>
  </div>`;
}
