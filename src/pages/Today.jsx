import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import { addDays, fmt, todayKey } from '../lib/dates.js';
import { MEALS, totals } from '../lib/nutrition.js';
import { CalorieRing, MacroBars } from '../components/Summary.jsx';
import WeekStrip from '../components/WeekStrip.jsx';
import MealCard from '../components/MealCard.jsx';
import Water from '../components/Water.jsx';
import AddFood from '../components/AddFood.jsx';
import EditEntry from '../components/EditEntry.jsx';
import Icon from '../components/Icon.jsx';
import { CountUp } from '../components/ui.jsx';

function streakOf(entries) {
  let n = 0;
  let k = todayKey();
  if (!(entries[k] || []).length) k = addDays(k, -1); // today not logged yet doesn't break it
  while ((entries[k] || []).length) { n++; k = addDays(k, -1); }
  return n;
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const rise = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } } };

export default function Today() {
  const { data, t, lang, account } = useStore();
  const [params, setParams] = useSearchParams();
  const today = todayKey();
  const date = params.get('d') && params.get('d') <= today ? params.get('d') : today;
  const setDate = (k) => setParams(k === today ? {} : { d: k }, { replace: true });

  const [adding, setAdding] = useState(null);
  const [editing, setEditing] = useState(null);

  const entries = data.entries[date] || [];
  const sum = totals(entries);
  const streak = streakOf(data.entries);
  const isToday = date === today;
  const name = data.profile.name || account?.name || '';

  return (
    <motion.div className="today" variants={stagger} initial="initial" animate="animate">
      <motion.header className="page-head" variants={rise}>
        <div>
          <p className="eyebrow">{fmt(date, lang, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="page-title">{isToday ? t('hello', { name }) : fmt(date, lang, { day: 'numeric', month: 'long' })}</h1>
        </div>
        <div className="head-actions">
          {!isToday && <button type="button" className="btn btn-soft btn-sm" onClick={() => setDate(today)}>{t('backToToday')}</button>}
          {streak > 1 && (
            <span className="streak" title={t('streak', { n: streak })}><Icon name="flame" size={16} /> {t('streak', { n: streak })}</span>
          )}
        </div>
      </motion.header>

      <motion.div variants={rise}><WeekStrip date={date} onChange={setDate} /></motion.div>

      <div className="today-grid">
        <motion.section className="card summary" variants={rise} aria-label={t('calories')}>
          <CalorieRing eaten={sum.kcal} goal={data.goals.calories} />
          <div className="summary-side">
            <dl className="kcal-stats">
              <div><dt>{t('eaten')}</dt><dd><CountUp value={Math.round(sum.kcal)} /></dd></div>
              <div><dt>{t('goalKcal')}</dt><dd className="num">{data.goals.calories.toLocaleString()}</dd></div>
            </dl>
            <MacroBars totals={sum} goals={data.goals} />
          </div>
        </motion.section>

        <motion.div variants={rise} className="water-slot"><Water date={date} /></motion.div>

        <div className="meals">
          {MEALS.map((m) => (
            <motion.div key={m} variants={rise}>
              <MealCard meal={m} date={date} entries={entries.filter((e) => e.meal === m)} onAdd={() => setAdding(m)} onEdit={setEditing} />
            </motion.div>
          ))}
        </div>
      </div>

      <motion.button type="button" className="fab" onClick={() => setAdding(guessMeal())} aria-label={t('addFood')}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.4 }} whileTap={{ scale: 0.9 }}>
        <Icon name="plus" size={26} />
      </motion.button>

      <AddFood open={!!adding} meal={adding || 'breakfast'} date={date} onClose={() => setAdding(null)} />
      <EditEntry entry={editing} date={date} onClose={() => setEditing(null)} />
    </motion.div>
  );
}

function guessMeal() {
  const h = new Date().getHours();
  return h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 21 ? 'dinner' : 'snack';
}
