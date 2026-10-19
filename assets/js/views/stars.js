// 想去清單: this device's stamped items, grouped by base in route order, copyable for the group chat.
import { item, base, fitDays, mapsGo } from '../trip.js';
import { esc, rowHTML, copyText, toast, icon } from '../ui.js';
import { starredIds } from '../state.js';

let root = null;
const ROUTE_BASES = ['sapporo', 'biei', 'furano', 'taiki', 'transfer', 'niseko'];

function groups() {
  const items = starredIds().map(item).filter(Boolean);
  return ROUTE_BASES.map(id => ({ base: base(id), items: items.filter(a => a.bases[0] === id) }))
    .filter(g => g.items.length);
}

function listText() {
  const lines = ['北海道・雪與湯｜我想去'];
  groups().forEach(g => {
    lines.push('', `【${g.base.name}・${g.base.dates}】`);
    g.items.forEach(a => {
      const days = fitDays(a);
      lines.push(`・${a.name}${days.length ? `（啱${days.join('、')}日）` : ''}`, `  ${mapsGo(a)}`);
    });
  });
  lines.push('', location.origin + location.pathname + '#/explore');
  return lines.join('\n');
}

function render() {
  const gs = groups();
  const total = gs.reduce((n, g) => n + g.items.length, 0);
  root.innerHTML = `
    <div class="view-head">
      <div><h1>想去清單</h1><p>喺景點卡撳「想去」印章就會收埋喺度。只存喺呢部機，唔會同其他人同步。</p></div>
      ${total ? `<button class="btn" type="button" data-copy-list>${icon('copy')}複製清單</button>` : ''}
    </div>
    ${total ? `<div class="stamp-book">${gs.map(g => `
      <section class="stamp-group panel">
        <h2>${esc(g.base.name)}<span>${esc(g.base.dates)}</span></h2>
        <ul>${g.items.map(a => `<li>${rowHTML(a, g.base.id)}</li>`).join('')}</ul>
      </section>`).join('')}</div>
      <p class="small muted" style="margin-top:14px">想同朋友夾？撳「複製清單」再貼落group，大家就睇到你揀咗乜。</p>`
    : `<div class="empty">未蓋印。去景點頁，撳卡右上角嘅「想去」印章。<br><a class="btn small" href="#/explore" style="margin-top:12px">去揀景點</a></div>`}`;
}

export function init(el) {
  root = el;
  el.addEventListener('click', async e => {
    if (!e.target.closest('[data-copy-list]')) return;
    const ok = await copyText(listText());
    toast(ok ? `已複製 ${starredIds().length} 項，可以貼落group` : '複製唔到，請再試');
  });
}

export function show() { render(); }
export function onStars() { render(); }
