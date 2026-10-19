// Data + budget consistency check. No dependencies, no browser. Run from the repo root:
//   node tools/check-data.mjs
// Adjust EXPECT when you intentionally add or remove items — never delete data just to pass.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { calculate } from '../assets/js/budget.js';

const EXPECT = { hotels: 5, bases: 6, days: 8, activities: 65, stations: 11, snowRows: 440 };
const CATS = ['sight', 'event', 'activity', 'onsen', 'food', 'stop'];
const PRIORITIES = ['main', 'extra', 'far', 'check'];
const BOOKING = ['none', 'recommended', 'required'];
const TRIP_DAYS = [13, 14, 15, 16, 17, 18, 19, 20];

const context = { window: {} };
vm.createContext(context);
for (const file of ['assets/itinerary-data.js', 'assets/weather-data.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context);
}
const trip = context.window.ITINERARY_DATA;
const weather = context.window.TRIP_WEATHER;

assert.equal(trip.hotels.length, EXPECT.hotels, 'hotel count');
assert.equal(trip.bases.length, EXPECT.bases, 'base count');
assert.equal(trip.days.length, EXPECT.days, 'day count');
assert.equal(trip.activities.length, EXPECT.activities, 'activity count');

// Fixed route: Moving Inn on the 16th, original Sapporo hotel on the 19th.
assert.equal(trip.days.find(d => d.day === 16).hotel, 'moving');
assert.equal(trip.days.find(d => d.day === 19).hotel, 'granbell');
assert.equal(JSON.stringify(trip.route), JSON.stringify(['granbell', 'spoon', 'lavista', 'moving', 'sisumo', 'granbell']), 'route unchanged');

const ids = new Set(trip.activities.map(a => a.id));
assert.equal(ids.size, trip.activities.length, 'duplicate activity id');
for (const day of trip.days) {
  assert(!day.hotel || trip.hotels.some(h => h.id === day.hotel), `day ${day.day} hotel`);
  assert(trip.bases.some(b => b.id === day.base), `day ${day.day} base`);
  assert(day.sign && day.sign.to, `day ${day.day} sign`);
  for (const id of day.picks) assert(ids.has(id), `day ${day.day} pick ${id}`);
}

const perBase = {};
for (const a of trip.activities) {
  const where = `activity ${a.id}`;
  assert(/^[a-z0-9-]+$/.test(a.id), `${where}: id format`);
  assert(a.name && a.desc && a.fit && a.status && a.cost, `${where}: text fields`);
  assert(CATS.includes(a.category), `${where}: category ${a.category}`);
  assert(PRIORITIES.includes(a.priority), `${where}: priority`);
  assert(!a.booking || BOOKING.includes(a.booking), `${where}: booking`);
  assert(a.url.startsWith('https://'), `${where}: official url`);
  assert(a.coords && a.coords.length === 2, `${where}: coords`);
  assert(a.coords[0] > 41 && a.coords[0] < 46, `${where}: lat`);
  assert(a.coords[1] > 139 && a.coords[1] < 146, `${where}: lng`);
  assert(a.bases.length >= 1, `${where}: bases`);
  for (const base of a.bases) {
    assert(trip.bases.some(b => b.id === base), `${where}: base ${base}`);
    assert(a.drive[base], `${where}: drive for ${base}`);
    assert(a.drive[base][0] >= 0, `${where}: drive min`);
    assert(a.drive[base][1] >= a.drive[base][0], `${where}: drive range`);
    assert(a.drive[base][1] <= 120, `${where}: drive max ≤ 120`);
    perBase[base] = (perBase[base] || 0) + 1;
  }
  for (const d of a.days || []) assert(TRIP_DAYS.includes(d), `${where}: day ${d}`);
  for (const d of (a.when && a.when.closedOnTripDays) || []) assert(TRIP_DAYS.includes(d), `${where}: closed day ${d}`);
  for (const s of a.sources || []) assert(s[1].startsWith('https://'), `${where}: source url`);
  for (const t of a.tips || []) assert(t[0], `${where}: tip text`);
  // Display text must not leak schema field names written during research.
  const shown = [a.name, a.hook, a.desc, a.fit, a.status, a.cost, a.positionNote, ...(a.tips || []).map(t => t[0])].join(' ');
  assert(!/closedOnTripDays|confidence|year-round|last-season|unverified|timeOfDay|enRoute/.test(shown), `${where}: field name in display text`);
}
for (const [label, url, base] of trip.excluded.map(e => [e[0], e[2], e[3]])) {
  assert(label && url.startsWith('https://'), `excluded ${label}`);
  assert(!base || trip.bases.some(b => b.id === base), `excluded ${label} base`);
}

// Budget invariants (README §7). Floating point, so compare with a tolerance.
const near = (a, b, msg) => assert(Math.abs(a - b) < 0.01, `${msg}: ${a} vs ${b}`);
const base0 = calculate();
near(base0.group, 4 * base0.man + 2 * base0.pair, 'group = 4 man + 2 pair');
const ski = calculate({ ski: 1000 });
near(ski.group - base0.group, 4000, 'ski +1000 per man → group +4000');
near(ski.pair, base0.pair, 'ski does not change pair');
const two = calculate({ two: true });
near(base0.man - two.man, 102, 'two Spoon cabins → man −102');
near(two.pair, base0.pair, 'two cabins does not change pair');
near(base0.group - two.group, 408, 'two cabins → group −408');
const river = calculate({ river: true });
near(river.riverTotal, 3060, 'river sauna six people');

assert.equal(weather.stations.length, EXPECT.stations);
assert.equal(weather.stations.reduce((n, s) => n + s.days.length, 0), EXPECT.snowRows);

console.log('Data consistency OK', JSON.stringify({ activities: trip.activities.length, perBase, excluded: trip.excluded.length }));
