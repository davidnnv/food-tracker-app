import { useEffect, useState } from 'react';
import { useStore } from '../lib/store.jsx';
import { MEALS, scale } from '../lib/nutrition.js';
import Icon from './Icon.jsx';
import { Segmented, Sheet, Stepper } from './ui.jsx';

export default function EditEntry({ entry, date, onClose }) {
  const { t, foodName, findFood, updateEntry, removeEntry, toast } = useStore();
  const [grams, setGrams] = useState(entry?.grams || 0);
  const [meal, setMeal] = useState(entry?.meal);
  useEffect(() => { if (entry) { setGrams(entry.grams || 0); setMeal(entry.meal); } }, [entry]);

  const food = entry?.foodId && findFood(entry.foodId);
  const n = food && grams ? scale(food.per100, grams) : entry;

  const save = () => { updateEntry(date, entry.id, { grams: food ? grams : null, meal }); toast(t('saved')); onClose(); };
  const del = () => { removeEntry(date, entry.id); onClose(); };

  return (
    <Sheet open={!!entry} onClose={onClose} title={entry ? foodName(entry) : ''}>
      {entry && (
        <div className="detail">
          <Segmented label={t('meal')} value={meal} onChange={setMeal} options={MEALS.map((m) => ({ value: m, label: t(m) }))} />
          {food && <Stepper id="edit-g" label={t('grams')} value={grams} onChange={setGrams} step={10} min={0} max={3000} unit="g" />}
          <div className="detail-nutr">
            <div className="detail-kcal"><span className="num">{Math.round(n.kcal)}</span> kcal</div>
            <dl className="nutr-grid">
              {['protein', 'carbs', 'fat'].map((m) => (
                <div key={m} data-macro={m}><dt><span className="macro-key" aria-hidden="true" />{t(m)}</dt><dd className="num">{Math.round(n[m] * 10) / 10} g</dd></div>
              ))}
            </dl>
          </div>
          <div className="row-2">
            <button type="button" className="btn btn-danger" onClick={del}><Icon name="trash" size={16} /> {t('delete')}</button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={food && !grams}>{t('update')}</button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
