// Budget maths moved verbatim from the previous itinerary.js. Do not change the constants without
// re-checking README §7: ¥1 = HK$0.051, SISUMO HK$6,273 is the four-person TWO-night total,
// and group = 4 * man + 2 * pair must hold.
export function calculate({ couple = 1000, transfer = 0, ski = 0, extras = 0, two = false, river = false } = {}) {
  const common = (2801.43 + 4043.34 + 216888 * .051) / 6;
  const riverPer = river ? 10000 * .051 : 0;
  const man = common + (two ? 1377 : 1479) + 6273 / 4 + 3062.02 / 4 + ski + extras / 6 + riverPer;
  const pair = common + 1479 + couple / 2 + transfer / 2 + extras / 6 + riverPer;
  return { man, pair, group: 4 * man + 2 * pair, riverTotal: riverPer * 6 };
}

export const hk = n => 'HK$' + Math.round(n).toLocaleString('en-US');
