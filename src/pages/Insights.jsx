import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import { addDays, fmt, range, toKey, todayKey } from '../lib/dates.js';
import { KCAL_PER_G, MACROS, dayStatus, totals } from '../lib/nutrition.js';
import { CalorieBars } from '../components/charts.jsx';
import { CountUp, Segmented } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

const rise = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } } };

export default function Insights() {
  const { data, t, lang, foodName, findFood } = useStore();
  const [span, setSpan] = useState(7);
  const [table, setTable] = useState(false);
  const today = todayKey();
  const goal = data.goals.calories;

  const days = useMemo(() => range(addDays(today, -(span - 1)), today).map((k) => {
    const s = totals(data.entries[k]);
    return { date: k, kcal: Math.round(s.kcal), protein: Math.round(s.protein), carbs: Math.round(s.carbs), fat: Math.round(s.fat) };
  }), [data.entries, span, today]);

  const logged = days.filter((d) => d.kcal > 0);
  const avg = logged.length ? Math.round(logged.reduce((a, d) => a + d.kcal, 0) / logged.length) : 0;
  const onTarget = logged.filter((d) => dayStatus(d.kcal, goal) === 'on').length;

  const split = useMemo(() => {
    const sum = logged.reduce((a, d) => ({ protein: a.protein + d.protein, carbs: a.carbs + d.carbs, fat: a.fat + d.fat }), { protein: 0, carbs: 0, fat: 0 });
    const kcal = MACROS.reduce((a, m) => a + sum[m] * KCAL_PER_G[m], 0) || 1;
    return MACROS.map((m) => ({ m, pct: Math.round((sum[m] * KCAL_PER_G[m] * 100) / kcal), g: logged.length ? Math.round(sum[m] / logged.length) : 0 }));
  }, [logged]);

  const top = useMemo(() => {
    const count = {};
    range(addDays(today, -(span - 1)), today).forEach((k) => (data.entries[k] || []).forEach((e) => {
      const key = e.foodId || foodName(e);
      count[key] = count[key] || { n: 0, entry: e };
      count[key].n++;
    }));
    return Object.values(count).sort((a, b) => b.n - a.n).slice(0, 5);
  }, [data.entries, span, today, foodName]);

  const short = (k) => span > 7 ? fmt(k, lang, { day: 'numeric', month: 'numeric' }) : fmt(k, lang, { weekday: 'short' }).replace('.', '');

  if (!Object.values(data.entries).some((l) => l.length)) {
    return (
      <div className="empty-page">
        <Icon name="insights" size={40} />
        <p>{t('noData')}</p>
        <Link className="btn btn-primary" to="/">{t('addFood')}</Link>
      </div>
    );
  }

  return (
    <motion.div className="insights" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.07 } } }}>
      <motion.header className="page-head" variants={rise}>
        <h1 className="page-title">{t('insights')}</h1>
        <Segmented label="range" value={span} onChange={setSpan} options={[{ value: 7, label: t('last7') }, { value: 30, label: t('last30') }]} />
      </motion.header>

      <motion.div className="stat-row" variants={rise}>
        <div className="stat"><span className="stat-label">{t('avgKcal')}</span><span className="stat-value"><CountUp value={avg} /> <small>kcal</small></span>
          <span className={`stat-delta ${avg > goal * 1.1 ? 'is-over' : ''}`}>{avg ? `${avg - goal > 0 ? '+' : ''}${(avg - goal).toLocaleString()} vs ${t('goalLine').toLowerCase()}` : '—'}</span></div>
        <div className="stat"><span className="stat-label">{t('onTarget')}</span><span className="stat-value"><CountUp value={onTarget} /> <small>/ {logged.length}</small></span>
          <span className="stat-delta">±10–20% {t('goalLine').toLowerCase()}</span></div>
        <div className="stat"><span className="stat-label">{t('loggedDays')}</span><span className="stat-value"><CountUp value={logged.length} /> <small>/ {span}</small></span>
          <span className="stat-delta">{Math.round((logged.length / span) * 100)}%</span></div>
      </motion.div>

      <motion.section className="card" variants={rise} aria-labelledby="ch-kcal">
        <header className="card-head">
          <h2 id="ch-kcal" className="card-title">{t('caloriesByDay')}</h2>
          <div className="legend">
            <span><i className="lg-ok" />{t('st_on')}/{t('st_under')}</span>
            <span><i className="lg-over" />{t('st_over')}</span>
            <span><i className="lg-goal" />{t('goalLine')}</span>
          </div>
        </header>
        <CalorieBars key={span} days={days} goal={goal} labels={days.map((d) => short(d.date))}
          tooltip={{ goal: t('goalLine'), aria: t('caloriesByDay'), date: (k) => fmt(k, lang, { weekday: 'long', day: 'numeric', month: 'long' }) }} />
        <button type="button" className="text-btn" onClick={() => setTable(!table)} aria-expanded={table}><Icon name="table" size={16} /> {table ? t('hideTable') : t('showTable')}</button>
        {table && (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>{t('date')}</th><th>kcal</th><th>{t('protein')}</th><th>{t('carbs')}</th><th>{t('fat')}</th></tr></thead>
              <tbody>{days.map((d) => <tr key={d.date}><td>{fmt(d.date, lang, { weekday: 'short', day: 'numeric', month: 'short' })}</td><td>{d.kcal || '—'}</td><td>{d.protein}</td><td>{d.carbs}</td><td>{d.fat}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </motion.section>

      <div className="insight-grid">
        <motion.section className="card" variants={rise} aria-labelledby="ch-split">
          <h2 id="ch-split" className="card-title">{t('macroSplit')}</h2>
          <div className="split-bar" role="img" aria-label={split.map((s) => `${t(s.m)} ${s.pct}%`).join(', ')}>
            {split.map((s, i) => (
              <motion.span key={s.m} data-macro={s.m} className="split-seg" initial={{ flexGrow: 0 }} animate={{ flexGrow: s.pct || 0.001 }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: [0.2, 0.8, 0.2, 1] }} />
            ))}
          </div>
          <ul className="split-legend">
            {split.map((s) => (
              <li key={s.m} data-macro={s.m}><span className="macro-key" aria-hidden="true" /><span>{t(s.m)}</span><b className="num">{s.pct}%</b><span className="muted">{s.g} g {t('perDay')}</span></li>
            ))}
          </ul>
        </motion.section>

        <motion.section className="card" variants={rise} aria-labelledby="ch-top">
          <h2 id="ch-top" className="card-title">{t('topFoods')}</h2>
          <ol className="top-foods">
            {top.map(({ n, entry }, i) => {
              const f = entry.foodId && findFood(entry.foodId);
              return (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
                  <span className="top-rank">{i + 1}</span>
                  <span className="top-name">{foodName(f || entry)}</span>
                  <span className="top-n">{t('times', { n })}</span>
                  <span className="top-bar" style={{ '--w': `${(n / top[0].n) * 100}%` }} aria-hidden="true" />
                </motion.li>
              );
            })}
          </ol>
        </motion.section>
      </div>

      <motion.div variants={rise}><MonthCalendar /></motion.div>
    </motion.div>
  );
}

function MonthCalendar() {
  const { data, t, lang } = useStore();
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = todayKey();
  const first = toKey(month);
  const lead = (month.getDay() + 6) % 7;
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysIn }, (_, i) => addDays(first, i))];
  const weekdays = Array.from({ length: 7 }, (_, i) => fmt(addDays('2024-01-01', i), lang, { weekday: 'narrow' }));
  const shift = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  const atNow = month.getFullYear() === new Date().getFullYear() && month.getMonth() === new Date().getMonth();

  return (
    <section className="card" aria-labelledby="cal-h">
      <header className="card-head">
        <h2 id="cal-h" className="card-title">{t('calendar')} · {fmt(month, lang, { month: 'long', year: 'numeric' })}</h2>
        <div className="row-gap">
          <button type="button" className="icon-btn" onClick={() => shift(-1)} aria-label={t('prevMonth')}><Icon name="left" /></button>
          <button type="button" className="icon-btn" onClick={() => shift(1)} disabled={atNow} aria-label={t('nextMonth')}><Icon name="right" /></button>
        </div>
      </header>
      <div className="cal">
        {weekdays.map((w, i) => <span key={i} className="cal-wd">{w}</span>)}
        {cells.map((k, i) => {
          if (!k) return <span key={`b${i}`} />;
          const kcal = totals(data.entries[k]).kcal;
          const st = k > today ? 'future' : dayStatus(kcal, data.goals.calories);
          return (
            <Link key={k} to={k > today ? '#' : `/?d=${k}`} className={`cal-day is-${st}${k === today ? ' is-today' : ''}`}
              aria-label={`${fmt(k, lang, { day: 'numeric', month: 'long' })}: ${st === 'future' ? '' : t('st_' + st)}${kcal ? `, ${Math.round(kcal)} kcal` : ''}`}
              style={{ '--d': `${i * 12}ms` }} tabIndex={k > today ? -1 : 0}>
              {Number(k.slice(8))}
            </Link>
          );
        })}
      </div>
      <div className="legend cal-legend">
        {['on', 'under', 'over', 'empty'].map((s) => <span key={s}><i className={`lg-cal is-${s}`} />{t('st_' + s)}</span>)}
      </div>
    </section>
  );
}
