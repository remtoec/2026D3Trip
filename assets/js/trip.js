// Data helpers over window.ITINERARY_DATA (loaded by itinerary-data.js before this module runs).
export const D = window.ITINERARY_DATA;

export const TRIP_DAYS = [13, 14, 15, 16, 17, 18, 19, 20];
export const WEEKDAY = { 13: '日', 14: '一', 15: '二', 16: '三', 17: '四', 18: '五', 19: '六', 20: '日' };

// Which trip days each base is relevant to (used when an item has no explicit `days`).
export const BASE_DAYS = {
  sapporo: [13, 19, 20],
  biei: [14, 15],
  furano: [15, 16],
  taiki: [16, 17],
  transfer: [17],
  niseko: [17, 18, 19],
};

export const CATS = {
  sight: { label: '景點', glyph: '景' },
  event: { label: '節慶燈飾', glyph: '節' },
  activity: { label: '活動體驗', glyph: '玩' },
  onsen: { label: '溫泉', glyph: '湯' },
  food: { label: '美食', glyph: '食' },
  stop: { label: '補給', glyph: '停' },
};
export const CAT_ORDER = ['sight', 'event', 'activity', 'onsen', 'food', 'stop'];

export const PRIORITY = { main: '主推', extra: '可加', far: '較遠', check: '要先確認' };
const PRIORITY_RANK = { main: 0, check: 1, extra: 2, far: 3 };

export const CONFIDENCE = {
  confirmed: { label: '今季已確認', tone: 'ok' },
  'last-season': { label: '按上季資料', tone: 'warn' },
  unverified: { label: '待確認', tone: 'warn' },
};

export const hotel = id => D.hotels.find(h => h.id === id);
export const item = id => D.activities.find(a => a.id === id);
export const base = id => D.bases.find(b => b.id === id);
export const day = n => D.days.find(d => d.day === Number(n));

export function baseOrigin(baseId) {
  const b = base(baseId);
  if (!b) return null;
  return b.hotel ? hotel(b.hotel).coords : b.coords;
}

// Older items have no `category`; infer from the tag so they still group sensibly.
export function category(a) {
  if (a.category && CATS[a.category]) return a.category;
  const t = `${a.tag || ''}${a.name || ''}`;
  if (/溫泉|浸湯/.test(t)) return 'onsen';
  if (/燈|亮燈|市集|聖誕/.test(t)) return 'event';
  if (/午餐|美食|甜品|豚丼|拉麵/.test(t)) return 'food';
  if (/補給|短停|道之驛/.test(t)) return 'stop';
  if (/滑雪|桑拿|體驗|雪上|住宿重點|半日/.test(t)) return 'activity';
  return 'sight';
}

export function fitDays(a) {
  if (Array.isArray(a.days) && a.days.length) return a.days.map(Number);
  const set = new Set();
  a.bases.forEach(b => (BASE_DAYS[b] || []).forEach(d => set.add(d)));
  D.days.forEach(d => { if (d.picks.includes(a.id)) set.add(d.day); });
  return [...set].sort((x, y) => x - y);
}

export function closedDays(a) {
  return (a.when && Array.isArray(a.when.closedOnTripDays)) ? a.when.closedOnTripDays.map(Number) : [];
}

export function primaryBase(a, preferred) {
  return preferred && a.bases.includes(preferred) ? preferred : a.bases[0];
}

// Drive info relative to a base. Transfer-day items store the detour off the route.
export function drive(a, baseId) {
  const b = primaryBase(a, baseId);
  const v = a.drive && a.drive[b];
  if (!v) return { text: '', short: '', min: 0, max: 0, walk: false };
  const [min, max] = v;
  // Stops on a drive day (e.g. Obihiro lunch on the way to Moving Inn): time from the base is misleading.
  if (a.enRoute) return { text: `${a.enRoute.label}；離住宿約${min}–${max}分鐘`, short: '途中', min, max, walk: false };
  if (b === 'transfer' && a.leg) {
    if (max === 0) return { text: '就喺路線上', short: '順路', min, max, walk: true };
    return { text: `繞路約${min}–${max}分鐘`, short: `+${min}–${max}`, unit: '分', min, max, walk: false };
  }
  if (max === 0) return { text: '住宿範圍內，毋須開車', short: '就喺度', min, max, walk: true };
  if (max <= 5) return { text: '住宿附近，行過去都得', short: '好近', min, max, walk: true };
  return { text: `單程約${min}–${max}分鐘`, short: `${min}–${max}`, unit: '分', min, max, walk: false };
}

export function hoursShort(a) {
  const h = a.when && a.when.hours;
  if (!h) return '';
  return String(h).split(/[；;]/)[0].trim();
}

export function isEvening(a) {
  return a.timeOfDay === 'evening';
}

export function sortItems(list, baseId) {
  return [...list].sort((x, y) =>
    (PRIORITY_RANK[x.priority] ?? 9) - (PRIORITY_RANK[y.priority] ?? 9) ||
    drive(x, baseId).max - drive(y, baseId).max);
}

export function itemsForBase(baseId) {
  return sortItems(D.activities.filter(a => a.bases.includes(baseId)), baseId);
}

export function itemsForDay(n) {
  const d = day(n);
  return d ? d.picks.map(item).filter(Boolean) : [];
}

// ---------- Google Maps links (open the app on phones) ----------
const enc = encodeURIComponent;
const ll = c => `${c[0]},${c[1]}`;

// Best destination for navigation: exact coords when we trust them (and always for our hotels),
// otherwise the Japanese name so Google resolves the real place/entrance.
export function mapsDest(p) {
  if (p.coords && (p.kind === 'stay' || !p.approx)) return ll(p.coords);
  return p.nameJa || p.mapQuery || p.name;
}

// Place page (hours, reviews, photos).
export const mapsSearch = p => `https://www.google.com/maps/search/?api=1&query=${enc(p.nameJa || p.mapQuery || p.name)}`;

// Directions from the phone's current location; mode: driving | transit | walking.
export const mapsGo = (p, mode = 'driving') =>
  `https://www.google.com/maps/dir/?api=1&destination=${enc(mapsDest(p))}&travelmode=${mode}`;

// Directions between fixed points (coords arrays or destination strings), optional waypoints.
export function mapsRoute(from, to, via = []) {
  const s = v => (Array.isArray(v) ? ll(v) : v);
  const parts = [`origin=${enc(s(from))}`, `destination=${enc(s(to))}`, 'travelmode=driving'];
  if (via.length) parts.push(`waypoints=${enc(via.map(s).join('|'))}`);
  return `https://www.google.com/maps/dir/?api=1&${parts.join('&')}`;
}
export const mapsDir = (from, to) => mapsRoute(from, to);

// Transit/walking only make sense in town or for very short hops.
export function travelModes(a) {
  const modes = ['driving'];
  if (a.bases && a.bases.includes('sapporo')) modes.push('transit');
  const near = a.drive && Object.entries(a.drive).some(([b, [, max]]) => max <= 15 || (b === 'sapporo' && max <= 20));
  if (near) modes.push('walking');
  return modes;
}

// Where the group sleeps on the night of day n (null on the 20th).
export function stayFor(n) {
  const d = day(n);
  return d && d.hotel ? hotel(d.hotel) : null;
}

// ---------- Photos (assets/photos.js; keys are activity ids and "hotel:<id>") ----------
const PH = window.TRIP_PHOTOS || {};
// The picture that opens each day and each base; falls back through stay and picks.
const DAY_PHOTO = { 13: 'sapporo-white-illumination', 14: 'kenmary', 15: 'bluepond', 16: 'hotel:moving', 17: 'hotel:sisumo', 18: 'annupuri', 19: 'market', 20: 'royce-chocolate-world' };
const BASE_PHOTO = { sapporo: 'sapporo-white-illumination', biei: 'kenmary', furano: 'ningle', taiki: 'hotel:moving', transfer: 'shikotsuko-short-stop', niseko: 'annupuri' };

export const photo = key => (key && PH[key] && PH[key].src ? PH[key] : null);
export const itemPhoto = a => (a ? photo(a.id) : null);
export const hotelPhoto = h => (h ? photo('hotel:' + h.id) : null);

export function dayPhoto(n) {
  return photo(DAY_PHOTO[n]) || hotelPhoto(stayFor(n)) || itemsForDay(n).map(itemPhoto).find(Boolean) || null;
}

export function basePhoto(id) {
  const b = base(id);
  return photo(BASE_PHOTO[id]) || (b && b.hotel ? hotelPhoto(hotel(b.hotel)) : null) || itemsForBase(id).map(itemPhoto).find(Boolean) || null;
}
