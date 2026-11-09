import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import { addDays } from '../lib/dates.js';
import { totals } from '../lib/nutrition.js';
import Icon from './Icon.jsx';
import { CountUp, listItem } from './ui.jsx';

const MEAL_ICON = { breakfast: '☀', lunch: '◐', dinner: '☾', snack: '✦' };

export default function MealCard({ meal, date, entries, onAdd, onEdit }) {
  const { t, foodName, data, copyMeal, toast } = useStore();
  const sum = totals(entries);
  const yesterday = (data.entries[addDays(date, -1)] || []).filter((e) => e.meal === meal);

  const copy = () => {
    const n = copyMeal(date, meal);
    if (n) toast(t('copied', { n }));
  };

  return (
    <section className="card meal" data-meal={meal} aria-labelledby={`meal-${meal}`}>
      <header className="meal-head">
        <span className="meal-glyph" aria-hidden="true">{MEAL_ICON[meal]}</span>
        <div className="meal-titles">
          <h2 id={`meal-${meal}`} className="card-title">{t(meal)}</h2>
          <p className="meal-sum">
            {entries.length ? <><CountUp value={Math.round(sum.kcal)} /> kcal · P {Math.round(sum.protein)} · C {Math.round(sum.carbs)} · F {Math.round(sum.fat)}</> : t('emptyMeal')}
          </p>
        </div>
        <motion.button type="button" className="add-btn" onClick={onAdd} aria-label={t('addTo', { meal: t(meal) })} whileTap={{ scale: 0.88, rotate: 90 }}>
          <Icon name="plus" />
        </motion.button>
      </header>

      <ul className="entries">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.li key={e.id} {...listItem} className="entry-wrap">
              <button type="button" className="entry" onClick={() => onEdit(e)}>
                <span className="entry-name">{foodName(e)}</span>
                <span className="entry-meta">{e.grams ? `${e.grams} g` : t('quickAdd')}</span>
                <span className="entry-kcal">{Math.round(e.kcal)}</span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {!entries.length && yesterday.length > 0 && (
        <button type="button" className="text-btn copy-btn" onClick={copy}><Icon name="copy" size={16} /> {t('copyYesterday')} · {yesterday.length}</button>
      )}
    </section>
  );
}
