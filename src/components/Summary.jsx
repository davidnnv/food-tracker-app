import { motion, useReducedMotion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import { CountUp } from './ui.jsx';
import { MACROS } from '../lib/nutrition.js';

const R = 78;
const C = 2 * Math.PI * R;

// Calorie ring: eaten vs goal. Past the goal, the overflow is drawn in the warning colour.
export function CalorieRing({ eaten, goal }) {
  const { t } = useStore();
  const reduce = useReducedMotion();
  const ratio = goal ? eaten / goal : 0;
  const main = Math.min(1, ratio);
  const overflow = Math.max(0, Math.min(1, ratio - 1));
  const left = Math.round(goal - eaten);
  const isOver = left < 0;
  const tr = reduce ? { duration: 0 } : { duration: 1.1, ease: [0.2, 0.8, 0.2, 1] };

  return (
    <div className="ring" role="img" aria-label={`${t('eaten')} ${Math.round(eaten)} / ${goal} kcal`}>
      <svg viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={R} className="ring-track" />
        <motion.circle cx="100" cy="100" r={R} className="ring-fill"
          strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - main) }} transition={tr} />
        {overflow > 0 && (
          <motion.circle cx="100" cy="100" r={R} className="ring-over"
            strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - overflow) }} transition={{ ...tr, delay: reduce ? 0 : 0.9 }} />
        )}
      </svg>
      <div className="ring-center">
        <span className="ring-label">{isOver ? t('over') : t('remaining')}</span>
        <CountUp value={Math.abs(left)} className={`ring-value${isOver ? ' is-over' : ''}`} />
        <span className="ring-unit">kcal</span>
      </div>
    </div>
  );
}

export function MacroBars({ totals, goals }) {
  const { t } = useStore();
  const reduce = useReducedMotion();
  return (
    <ul className="macros">
      {MACROS.map((m, i) => {
        const val = totals[m];
        const goal = goals[m] || 1;
        const pct = Math.min(100, (val / goal) * 100);
        return (
          <li key={m} className="macro" data-macro={m}>
            <div className="macro-top">
              <span className="macro-name"><span className="macro-key" aria-hidden="true" />{t(m)}</span>
              <span className="macro-val"><CountUp value={Math.round(val)} /> <span className="muted">/ {goal} g</span></span>
            </div>
            <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.round(val)} aria-label={t(m)}>
              <motion.span className={`bar-fill${val > goal * 1.1 ? ' is-over' : ''}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.15 + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
