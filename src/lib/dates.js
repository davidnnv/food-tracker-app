// All diary dates are local calendar days as 'YYYY-MM-DD' strings.
const pad = (n) => String(n).padStart(2, '0');

export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const todayKey = () => toKey(new Date());
export const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return toKey(d); };
export const diffDays = (a, b) => Math.round((fromKey(a) - fromKey(b)) / 86400000);

// Monday-first week containing `k`.
export function weekOf(k) {
  const d = fromKey(k);
  const dow = (d.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => addDays(k, i - dow));
}

export function range(fromK, toK) {
  const out = [];
  for (let k = fromK; k <= toK; k = addDays(k, 1)) out.push(k);
  return out;
}

// Macedonian names are built in, because some browsers ship without mk locale data.
const MK = {
  long: ['недела', 'понеделник', 'вторник', 'среда', 'четврток', 'петок', 'сабота'],
  short: ['нед', 'пон', 'вто', 'сре', 'чет', 'пет', 'саб'],
  narrow: ['Н', 'П', 'В', 'С', 'Ч', 'П', 'С'],
  months: ['јануари', 'февруари', 'март', 'април', 'мај', 'јуни', 'јули', 'август', 'септември', 'октомври', 'ноември', 'декември'],
  monthsShort: ['јан', 'фев', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'ное', 'дек'],
};

function fmtMk(d, o = {}) {
  const parts = [];
  if (o.weekday) parts.push(MK[o.weekday][d.getDay()] + (o.day || o.month ? ',' : ''));
  if (o.month === 'numeric') parts.push(`${d.getDate()}.${d.getMonth() + 1}`);
  else {
    if (o.day) parts.push(String(d.getDate()));
    if (o.month === 'long') parts.push(MK.months[d.getMonth()]);
    if (o.month === 'short') parts.push(MK.monthsShort[d.getMonth()]);
  }
  if (o.year) parts.push(String(d.getFullYear()));
  return parts.join(' ');
}

export const fmt = (k, lang, opts) => {
  const d = typeof k === 'string' ? fromKey(k) : k;
  return lang === 'mk' ? fmtMk(d, opts) : d.toLocaleDateString('en-GB', opts);
};
