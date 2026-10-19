// Leaflet controller. The page keeps working (cards, Google Maps links) if Leaflet or tiles fail.
import { D, CATS, category, hotel, mapsGo } from './trip.js';
import { esc } from './ui.js';
import { isStarred } from './state.js';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>';

// Leaflet loads async (index.html flags window.__leaflet on load/error), so a slow or blocked CDN
// never holds up the rest of the page. Maps queue their data until it is ready.
const leafletReady = new Promise(resolve => {
  const done = () => resolve(!!window.L);
  if (window.L || window.__leaflet) { done(); return; }
  const s = document.getElementById('leaflet-js');
  if (!s) { done(); return; }
  s.addEventListener('load', done, { once: true });
  s.addEventListener('error', done, { once: true });
});

export function createMap(box, { onSelect = () => {}, label = '地圖' } = {}) {
  let map = null;
  let layer = null;
  let lineLayer = null;
  let points = [];
  let selected = null;
  const markers = new Map();
  let lastData = null;
  let pendingFit = null;

  box.setAttribute('aria-label', label);
  const waiting = document.createElement('p');
  waiting.className = 'map-fallback';
  waiting.textContent = '地圖載入緊…';
  box.appendChild(waiting);
  const slow = setTimeout(() => { waiting.textContent = '地圖載入得好慢；卡上面嘅 Google Maps 連結可以照用。'; }, 10000);

  leafletReady.then(ok => {
    clearTimeout(slow);
    waiting.remove();
    if (!ok) {
      box.insertAdjacentHTML('beforeend', '<p class="map-fallback">互動地圖未能載入。每張卡都有 Google Maps 連結，可以照用。</p>');
      return;
    }
    build();
    if (lastData) {
      setData(lastData);
      fit(pendingFit ?? 12);
      if (selected) select(selected, { pan: false });
    }
  });

  function build() {
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;inset:0';
    box.appendChild(el);
    map = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    const tiles = L.tileLayer(TILE_URL, { maxZoom: 18, attribution: ATTRIBUTION }).addTo(map);
    let warned = false;
    tiles.on('tileerror', () => {
      if (warned) return;
      warned = true;
      const note = document.createElement('p');
      note.className = 'map-fallback';
      note.style.cssText = 'inset:auto 8px 8px 8px;background:var(--paper);border-radius:10px;padding:8px 12px;z-index:500';
      note.textContent = '部分底圖載入唔到；標記仍然可以撳，或者用 Google Maps 連結。';
      box.appendChild(note);
    });
    layer = L.layerGroup().addTo(map);
    lineLayer = L.layerGroup().addTo(map);
    map.setView([43.0, 142.0], 7);
  }

  function pinIcon(text, { cat = null, stay = false, sel = false, stamped = false } = {}) {
    const style = cat ? ` style="--c:var(--cat-${cat})"` : '';
    const cls = ['map-pin', stay && 'is-stay', sel && 'is-selected', stamped && 'is-stamped'].filter(Boolean).join(' ');
    return L.divIcon({
      className: '',
      html: `<div class="${cls}"${style}><span>${esc(text)}</span></div>`,
      iconSize: [30, 30],
      iconAnchor: stay ? [15, 15] : [15, 34],
      popupAnchor: [0, stay ? -14 : -32],
    });
  }

  // items: activities to pin; hotels: hotel ids to pin; route: draw dashed stay order; origin: extra point (e.g. Chitose split).
  function setData({ items = [], hotels = [], route = false, origin = null, originLabel = '' } = {}) {
    lastData = { items, hotels, route, origin, originLabel };
    if (!map) return;
    layer.clearLayers();
    lineLayer.clearLayers();
    markers.clear();
    points = [];
    hotels.map(hotel).filter(Boolean).forEach(h => {
      L.marker(h.coords, { icon: pinIcon('宿', { stay: true }), title: h.name, keyboard: true })
        .bindTooltip(esc(h.name))
        .bindPopup(`<strong>${esc(h.name)}</strong><br>${esc(h.dates)}${h.approx ? '・約略位置' : ''}<br><a href="${esc(mapsGo(h))}" target="_blank" rel="noopener">Google Maps 開車去</a>`)
        .addTo(layer);
      points.push(h.coords);
    });
    if (origin) {
      L.marker(origin, { icon: pinIcon('集', { stay: true }), title: originLabel }).bindTooltip(esc(originLabel)).addTo(layer);
      points.push(origin);
    }
    items.filter(a => a.coords).forEach(a => {
      const cat = category(a);
      const m = L.marker(a.coords, {
        icon: pinIcon(CATS[cat].glyph, { cat, sel: a.id === selected, stamped: isStarred(a.id) }),
        title: a.name,
        keyboard: true,
        zIndexOffset: a.id === selected ? 1000 : 0,
      })
        .bindTooltip(esc(a.name))
        .bindPopup(`<strong>${esc(a.name)}</strong>${a.approx ? '<br><span class="small">約略位置</span>' : ''}<br><button type="button" data-detail="${esc(a.id)}">睇詳情</button>　<a href="${esc(mapsGo(a))}" target="_blank" rel="noopener">Google Maps</a>`);
      m.on('click', () => onSelect(a.id));
      m.addTo(layer);
      markers.set(a.id, { marker: m, item: a });
      points.push(a.coords);
    });
    if (route) {
      const line = D.route.map(id => hotel(id).coords);
      L.polyline(line, { color: getComputedStyle(document.documentElement).getPropertyValue('--sign').trim() || '#1b5aa6', weight: 3, dashArray: '6 8', opacity: 0.8 }).addTo(lineLayer);
    }
  }

  function fit(maxZoom = 12) {
    if (!map) { pendingFit = maxZoom; return; }
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], Math.min(maxZoom, 12));
    else map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom });
  }

  function select(id, { pan = true } = {}) {
    selected = id;
    if (!map) return;
    markers.forEach(({ marker, item }, key) => {
      const cat = category(item);
      marker.setIcon(pinIcon(CATS[cat].glyph, { cat, sel: key === id, stamped: isStarred(key) }));
      marker.setZIndexOffset(key === id ? 1000 : 0);
    });
    const hit = markers.get(id);
    if (hit && pan) {
      map.setView(hit.item.coords, Math.max(map.getZoom(), hit.item.approx ? 11 : 13), { animate: true });
    }
  }

  function refreshStamps() {
    if (lastData && map) select(selected, { pan: false });
  }

  function invalidate(refit = false) {
    if (!map) { if (refit) pendingFit = 12; return; }
    requestAnimationFrame(() => {
      map.invalidateSize();
      if (refit) fit();
    });
  }

  return { setData, fit, select, invalidate, refreshStamps, get available() { return !!map; } };
}
