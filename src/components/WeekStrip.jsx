import { motion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import { addDays, fmt, todayKey, weekOf } from '../lib/dates.js';
import { dayStatus, totals } from '../lib/nutrition.js';
import Icon from './Icon.jsx';

// Week of days with a tiny progress ring each. Arrows move by a week.
export default function WeekStrip({ date, onChange }) {
  const { data, lang, t } = useStore();
  const days = weekOf(date);
  const today = todayKey();

  return (
    <div className="week">
      <button type="button" className="icon-btn" onClick={() => onChange(addDays(date, -7))} aria-label={t('prevDay')}><Icon name="left" /></button>
      <ol className="week-days">
        {days.map((k) => {
          const kcal = totals(data.entries[k]).kcal;
          const st = dayStatus(kcal, data.goals.calories);
          const pct = Math.min(1, kcal / data.goals.calories);
          const sel = k === date;
          const future = k > today;
          return (
            <li key={k}>
              <button type="button" className={`day${sel ? ' is-sel' : ''}${k === today ? ' is-today' : ''}`} disabled={future}
                onClick={() => onChange(k)} aria-pressed={sel} aria-label={`${fmt(k, lang, { weekday: 'long', day: 'numeric', month: 'long' })} — ${t('st_' + st)}`}>
                {sel && <motion.span layoutId="day-pill" className="day-pill" transition={{ type: 'spring', stiffness: 480, damping: 36 }} />}
                <span className="day-name">{fmt(k, lang, { weekday: 'short' }).replace('.', '')}</span>
                <svg className="day-ring" viewBox="0 0 36 36" data-status={st} aria-hidden="true">
                  <circle cx="18" cy="18" r="15" className="day-track" />
                  <circle cx="18" cy="18" r="15" className="day-fill" strokeDasharray={`${pct * 94.25} 94.25`} />
                  <text x="18" y="22.5" textAnchor="middle">{Number(k.slice(8))}</text>
                </svg>
              </button>
            </li>
          );
        })}
      </ol>
      <button type="button" className="icon-btn" onClick={() => onChange(addDays(date, 7) > today ? today : addDays(date, 7))}
        disabled={days[6] >= today} aria-label={t('nextDay')}><Icon name="right" /></button>
    </div>
  );
}
