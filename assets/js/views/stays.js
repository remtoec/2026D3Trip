// 住宿及預算: the fixed hotel route plus the split-group budget (maths in budget.js, unchanged).
import { hotel, mapsSearch } from '../trip.js';
import { $, esc, link, gmapsBtnHTML, naviHTML } from '../ui.js';
import { calculate, hk } from '../budget.js';

let root = null;
const PRICE_ROWS = [
  ['13日・六人', '薄野 Granbell', 2801.43],
  ['14日・六人', 'Spoon Valley', 8874.00],
  ['15日・六人', 'La Vista 富良野', 4043.34],
  ['16日・六人', 'Moving Inn', 11061.29],
  ['17、18日・四人', 'SISUMO 昆布・兩晚', 6273.00],
  ['19日・四人', '薄野 Granbell', 3062.02],
];

function hotelHTML(h) {
  return `<article class="panel hotel${h.id === 'moving' ? ' is-key' : ''}">
    <span class="dates">${esc(h.dates)}</span>
    <h3>${esc(h.name)}</h3>
    <p class="small muted">${esc(h.area)}</p>
    <p style="font-size:14.5px">${esc(h.desc)}</p>
    <dl><dt>床位</dt><dd>${esc(h.beds)}</dd><dt>價格</dt><dd>${esc(h.price)}</dd></dl>
    <p class="callout" style="font-size:13.5px">${esc(h.note)}</p>
    ${naviHTML(h.navi)}
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${gmapsBtnHTML(h, { label: '開車去', cls: 'btn small' })}<a class="btn small ghost" href="${esc(mapsSearch(h))}" target="_blank" rel="noopener">地點資料</a>${link(h.url, '官方資料', 'link-btn')}</div>
  </article>`;
}

const num = id => {
  const n = Number($(id, root).value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

function renderBudget() {
  const t = calculate({
    couple: num('#couple-hotel'), transfer: num('#couple-transfer'), ski: num('#ski-extras'), extras: num('#other-extras'),
    two: $('#spoon-two', root).checked, river: $('#river-six', root).checked,
  });
  $('#budget-out', root).innerHTML = `
    <div class="total"><span>四位男士・每人</span><b>${hk(t.man)}</b><span>七晚住宿＋所填滑雪／活動</span></div>
    <div class="total"><span>夫婦・每人</span><b>${hk(t.pair)}</b><span>五晚住宿，包17日另住一晚</span></div>
    <div class="total group"><span>全組暫計</span><b>${hk(t.group)}</b><span>${t.riverTotal ? `已加六人河畔桑拿 ${hk(t.riverTotal)}。` : ''}未計機票、租車、油費、高速費、餐飲、入浴及附加費。</span></div>`;
}

export function init(el) {
  root = el;
  const order = ['granbell', 'spoon', 'lavista', 'moving', 'sisumo'];
  el.innerHTML = `
    <div class="view-head"><div><h1>住宿及預算</h1><p>住宿照你哋原表，唔改路線。價錢係你提供嘅資料，唔係重新報價，亦未代訂。</p></div></div>
    <div class="stays-layout">
      <section aria-label="住宿">
        <div class="hotel-grid carousel">${order.map(hotel).map(hotelHTML).join('')}</div>
      </section>
      <section class="budget" aria-label="預算">
        <div class="panel">
          <div class="panel-head"><h2>分隊預算計算</h2></div>
          <div class="fields">
            <div class="field"><label for="couple-hotel">夫婦17日住宿・兩人 HK$</label><input id="couple-hotel" type="number" inputmode="numeric" min="0" step="100" value="1000"></div>
            <div class="field"><label for="couple-transfer">夫婦分隊交通・兩人 HK$</label><input id="couple-transfer" type="number" inputmode="numeric" min="0" step="100" value="0"></div>
            <div class="field"><label for="ski-extras">滑雪／裝備／課堂・每位男士 HK$</label><input id="ski-extras" type="number" inputmode="numeric" min="0" step="100" value="0"></div>
            <div class="field"><label for="other-extras">其他活動・全六人總額 HK$</label><input id="other-extras" type="number" inputmode="numeric" min="0" step="100" value="0"></div>
          </div>
          <label class="check"><input id="spoon-two" type="checkbox">Spoon Valley 夫婦一棟、四人一棟分開計</label>
          <label class="check"><input id="river-six" type="checkbox">另預留六人河畔桑拿（¥10,000／人）</label>
          <p class="small muted" style="margin-top:8px">夫婦17日HK$1,000只係預留，唔係報價。填0代表未加入，唔代表免費。河畔桑拿按官網參考價，同房型已包設施要分開確認。</p>
        </div>
        <div class="totals" id="budget-out" aria-live="polite"></div>
        <details class="fold">
          <summary>原住宿費・組內合計</summary>
          <table class="prices"><thead><tr><th>晚數</th><th>住宿</th><th>HK$</th></tr></thead>
            <tbody>${PRICE_ROWS.map(([n, h, v]) => `<tr><td>${n}</td><td>${h}</td><td>${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>`).join('')}</tbody></table>
          <p class="small muted" style="margin-top:10px">沿用 ¥1＝HK$0.051。Moving Inn 係 ¥216,888 六人合計；SISUMO HK$6,273 係四人兩晚總額。SISUMO原表只計四人，所以夫婦17日喺千歲附近分隊另住。</p>
        </details>
      </section>
    </div>`;
  el.addEventListener('input', e => { if (e.target.matches('input')) renderBudget(); });
  el.addEventListener('change', e => { if (e.target.matches('input[type="checkbox"]')) renderBudget(); });
  renderBudget();
}

export function show() {}
