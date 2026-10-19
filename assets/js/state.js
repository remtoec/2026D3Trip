// Per-device state: "想去" stamps and theme, kept in localStorage when available.
const STAR_KEY = 'd3jp26.stars.v1';
const THEME_KEY = 'd3jp26.theme';

function read(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    return true;
  } catch { return false; }
}

let stars = new Set();
try { stars = new Set(JSON.parse(read(STAR_KEY) || '[]')); } catch { stars = new Set(); }
const listeners = new Set();

export const isStarred = id => stars.has(id);
export const starredIds = () => [...stars];
export const onStarsChange = fn => listeners.add(fn);

export function toggleStar(id) {
  if (stars.has(id)) stars.delete(id); else stars.add(id);
  const saved = write(STAR_KEY, JSON.stringify([...stars]));
  listeners.forEach(fn => fn(id, stars.has(id), saved));
  return stars.has(id);
}

// Drop ids that no longer exist in the data (e.g. after a research update).
export function pruneStars(validIds) {
  let changed = false;
  stars.forEach(id => { if (!validIds.has(id)) { stars.delete(id); changed = true; } });
  if (changed) write(STAR_KEY, JSON.stringify([...stars]));
}

export function effectiveTheme() {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function toggleTheme() {
  const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  write(THEME_KEY, next);
  return next;
}

// Trip clock in Japan time; `?date=2026-12-16` overrides it for previews.
export function tripClock() {
  const override = new URLSearchParams(location.search).get('date');
  let iso = /^\d{4}-\d{2}-\d{2}$/.test(override || '') ? override : null;
  if (!iso) {
    iso = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }
  const now = Date.parse(iso + 'T00:00:00Z');
  const start = Date.parse('2026-12-13T00:00:00Z');
  const end = Date.parse('2026-12-20T00:00:00Z');
  const daysToGo = Math.round((start - now) / 86400000);
  if (now < start) return { phase: 'before', day: 13, daysToGo, iso };
  if (now > end) return { phase: 'after', day: 20, daysToGo, iso };
  return { phase: 'during', day: 13 + Math.round((now - start) / 86400000), daysToGo: 0, iso };
}
