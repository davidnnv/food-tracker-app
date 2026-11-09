import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import { MEALS, scale } from '../lib/nutrition.js';
import Icon from './Icon.jsx';
import { Segmented, Sheet, Stepper } from './ui.jsx';

const CATS = ['fruit', 'veg', 'grain', 'protein', 'dairy', 'fat', 'sweet', 'meal', 'drink'];
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const slide = {
  initial: (dir) => ({ opacity: 0, x: dir * 28 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir * -28, transition: { duration: 0.16 } }),
};

// Add-food flow: browse/search → pick amount → add. Also "quick add" and "create food".
export default function AddFood({ open, onClose, date, meal: initialMeal }) {
  const { t } = useStore();
  const [step, setStep] = useState({ name: 'browse', dir: 1 });
  const [food, setFood] = useState(null);
  const [meal, setMeal] = useState(initialMeal);
  const [query, setQuery] = useState('');

  useEffect(() => { if (open) { setStep({ name: 'browse', dir: 1 }); setFood(null); setMeal(initialMeal); setQuery(''); } }, [open, initialMeal]);

  const go = (name, dir = 1) => setStep({ name, dir });
  const titles = { browse: t('addTo', { meal: t(meal) }), detail: t('amount'), custom: t('newFood'), quick: t('quickAdd') };

  return (
    <Sheet open={open} onClose={onClose} title={titles[step.name]} wide>
      <AnimatePresence mode="wait" custom={step.dir} initial={false}>
        <motion.div key={step.name} custom={step.dir} variants={slide} initial="initial" animate="animate" exit="exit">
          {step.name === 'browse' && (
            <Browse query={query} setQuery={setQuery} meal={meal} setMeal={setMeal}
              onPick={(f) => { setFood(f); go('detail'); }} onCustom={() => go('custom')} onQuick={() => go('quick')} />
          )}
          {step.name === 'detail' && food && (
            <Detail food={food} date={date} meal={meal} setMeal={setMeal} onBack={() => go('browse', -1)} onDone={onClose} />
          )}
          {step.name === 'custom' && (
            <CustomFood initialName={query} onBack={() => go('browse', -1)} onSaved={(f) => { setFood(f); go('detail'); }} />
          )}
          {step.name === 'quick' && <QuickAdd date={date} meal={meal} onBack={() => go('browse', -1)} onDone={onClose} />}
        </motion.div>
      </AnimatePresence>
    </Sheet>
  );
}

function MealPicker({ meal, setMeal }) {
  const { t } = useStore();
  return <Segmented label={t('meal')} value={meal} onChange={setMeal} options={MEALS.map((m) => ({ value: m, label: t(m) }))} />;
}

function Browse({ query, setQuery, meal, setMeal, onPick, onCustom, onQuick }) {
  const { t, lang, data, allFoods, findFood, foodName, toggleFavorite } = useStore();
  const [tab, setTab] = useState(data.recent.length ? 'recent' : 'all');
  const [cat, setCat] = useState(null);

  const list = useMemo(() => {
    const q = norm(query.trim());
    if (q) {
      return allFoods
        .map((f) => {
          const n = [f.name.en, f.name.mk].map(norm);
          const score = n.some((x) => x.startsWith(q)) ? 0 : n.some((x) => x.split(/[\s,(]+/).some((w) => w.startsWith(q))) ? 1 : n.some((x) => x.includes(q)) ? 2 : 9;
          return { f, score };
        })
        .filter((x) => x.score < 9).sort((a, b) => a.score - b.score).map((x) => x.f);
    }
    if (tab === 'recent') return data.recent.map(findFood).filter(Boolean);
    if (tab === 'fav') return data.favorites.map(findFood).filter(Boolean);
    if (tab === 'mine') return data.customFoods;
    return cat ? allFoods.filter((f) => f.category === cat) : allFoods;
  }, [query, tab, cat, allFoods, data, findFood]);

  const empty = { recent: t('emptyRecent'), fav: t('emptyFav'), mine: t('emptyMine') }[tab];

  return (
    <div className="browse">
      <MealPicker meal={meal} setMeal={setMeal} />
      <label className="search">
        <Icon name="search" />
        <input id="food-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchPh')} aria-label={t('search')} autoComplete="off" />
      </label>

      {!query && (
        <>
          <div className="tabs" role="tablist">
            {[['recent', t('recent')], ['fav', t('favorites')], ['mine', t('myFoods')], ['all', t('all')]].map(([k, l]) => (
              <button key={k} role="tab" type="button" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
          {tab === 'all' && (
            <div className="chips" role="group" aria-label={t('all')}>
              {CATS.map((c) => (
                <button key={c} type="button" className={`chip${cat === c ? ' is-on' : ''}`} aria-pressed={cat === c} onClick={() => setCat(cat === c ? null : c)}>{t('cat_' + c)}</button>
              ))}
            </div>
          )}
        </>
      )}

      <ul className="food-list">
        {list.map((f, i) => {
          const fav = data.favorites.includes(f.id);
          return (
            <motion.li key={f.id} className="food-row" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.02 }}>
              <button type="button" className="food-main" onClick={() => onPick(f)}>
                <span className="food-name">{foodName(f)}</span>
                <span className="food-sub">{f.per100.kcal} kcal · {t('per100')}{f.serving ? ` · ${f.serving.label[lang]}` : ''}</span>
              </button>
              <motion.button type="button" className={`icon-btn fav${fav ? ' is-on' : ''}`} onClick={() => toggleFavorite(f.id)}
                aria-label={fav ? t('favRemove') : t('favAdd')} aria-pressed={fav} whileTap={{ scale: 1.35 }}>
                <Icon name="heart" fill={fav ? 'currentColor' : 'none'} />
              </motion.button>
            </motion.li>
          );
        })}
      </ul>

      {list.length === 0 && (
        <p className="empty-note">{query ? t('noResults', { q: query }) : empty}</p>
      )}

      <div className="browse-foot">
        <button type="button" className="btn btn-ghost" onClick={onCustom}><Icon name="plus" size={16} /> {query ? t('createFood', { q: query }) : t('newFood')}</button>
        <button type="button" className="btn btn-ghost" onClick={onQuick}><Icon name="bolt" size={16} /> {t('quickAdd')}</button>
      </div>
    </div>
  );
}

function Detail({ food, date, meal, setMeal, onBack, onDone }) {
  const { t, lang, foodName, addEntry, toast } = useStore();
  const hasServing = !!food.serving;
  const [mode, setMode] = useState(hasServing ? 'serving' : 'grams');
  const [qty, setQty] = useState(hasServing ? 1 : 100);
  const grams = mode === 'serving' ? Math.round(qty * food.serving.g) : qty;
  const n = scale(food.per100, grams || 0);

  const switchMode = (m) => {
    if (m === mode) return;
    setMode(m);
    setQty(m === 'serving' ? Math.max(0.5, Math.round((grams / food.serving.g) * 2) / 2) : grams);
  };

  const add = () => {
    if (!grams) return;
    addEntry(date, meal, food, grams);
    toast(t('added', { meal: t(meal) }));
    onDone();
  };

  return (
    <div className="detail">
      <button type="button" className="text-btn" onClick={onBack}><Icon name="left" size={16} /> {t('back')}</button>
      <h3 className="detail-name">{foodName(food)}</h3>
      <MealPicker meal={meal} setMeal={setMeal} />

      {hasServing && (
        <Segmented label={t('amount')} value={mode} onChange={switchMode}
          options={[{ value: 'serving', label: `${t('servings')} (${food.serving.label[lang]})` }, { value: 'grams', label: t('grams') }]} />
      )}
      <Stepper id="qty" label={t('amount')} value={qty} onChange={setQty} step={mode === 'serving' ? 0.5 : 10} min={0} max={mode === 'serving' ? 20 : 3000}
        unit={mode === 'serving' ? `× ${food.serving.g} g` : 'g'} />

      <div className="detail-nutr">
        <div className="detail-kcal"><motion.span key={n.kcal} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="num">{n.kcal}</motion.span> kcal</div>
        <dl className="nutr-grid">
          {['protein', 'carbs', 'fat'].map((m) => (
            <div key={m} data-macro={m}><dt><span className="macro-key" aria-hidden="true" />{t(m)}</dt><dd className="num">{n[m]} g</dd></div>
          ))}
        </dl>
        <p className="muted small">{grams} g · {food.per100.kcal} kcal {t('per100')}</p>
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={add} disabled={!grams}>{t('addToDiary')}</button>
    </div>
  );
}

function CustomFood({ initialName, onBack, onSaved }) {
  const { t, lang, saveCustomFood, toast } = useStore();
  const [v, setV] = useState({ name: initialName || '', kcal: '', protein: '', carbs: '', fat: '', serving: '' });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const num = (x) => Math.max(0, Number(String(x).replace(',', '.')) || 0);

  const save = (e) => {
    e.preventDefault();
    const er = {};
    if (!v.name.trim()) er.name = t('errFoodName');
    if (!num(v.kcal)) er.kcal = t('errKcal');
    setErr(er);
    if (Object.keys(er).length) return;
    const name = v.name.trim();
    const f = saveCustomFood({
      name: { en: name, mk: name },
      per100: { kcal: num(v.kcal), protein: num(v.protein), carbs: num(v.carbs), fat: num(v.fat), fiber: 0 },
      serving: num(v.serving) ? { g: num(v.serving), label: { en: '1 serving', mk: '1 порција' } } : null,
    });
    toast(t('foodSaved'));
    onSaved(f);
  };

  return (
    <form className="form" onSubmit={save} noValidate>
      <button type="button" className="text-btn" onClick={onBack}><Icon name="left" size={16} /> {t('back')}</button>
      <Field id="cf-name" label={t('foodName')} error={err.name}><input id="cf-name" value={v.name} onChange={set('name')} /></Field>
      <p className="muted small">{t('per100')}</p>
      <div className="form-grid">
        <Field id="cf-kcal" label={`${t('calories')} (kcal)`} error={err.kcal}><input id="cf-kcal" inputMode="decimal" value={v.kcal} onChange={set('kcal')} /></Field>
        <Field id="cf-p" label={`${t('protein')} (g)`}><input id="cf-p" inputMode="decimal" value={v.protein} onChange={set('protein')} /></Field>
        <Field id="cf-c" label={`${t('carbs')} (g)`}><input id="cf-c" inputMode="decimal" value={v.carbs} onChange={set('carbs')} /></Field>
        <Field id="cf-f" label={`${t('fat')} (g)`}><input id="cf-f" inputMode="decimal" value={v.fat} onChange={set('fat')} /></Field>
      </div>
      <Field id="cf-s" label={`${t('serving')} (g)`}><input id="cf-s" inputMode="decimal" value={v.serving} onChange={set('serving')} placeholder={lang === 'mk' ? 'опционално' : 'optional'} /></Field>
      <button type="submit" className="btn btn-primary btn-block">{t('saveFood')}</button>
    </form>
  );
}

function QuickAdd({ date, meal, onBack, onDone }) {
  const { t, addQuick, toast } = useStore();
  const [v, setV] = useState({ name: '', kcal: '', protein: '', carbs: '', fat: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const num = (x) => Math.max(0, Number(String(x).replace(',', '.')) || 0);

  const save = (e) => {
    e.preventDefault();
    if (!num(v.kcal)) { setErr(t('errKcal')); return; }
    addQuick(date, meal, { name: v.name.trim() || t('quickAdd'), kcal: num(v.kcal), protein: num(v.protein), carbs: num(v.carbs), fat: num(v.fat) });
    toast(t('added', { meal: t(meal) }));
    onDone();
  };

  return (
    <form className="form" onSubmit={save} noValidate>
      <button type="button" className="text-btn" onClick={onBack}><Icon name="left" size={16} /> {t('back')}</button>
      <p className="muted">{t('quickAddHint')}</p>
      <Field id="qa-name" label={t('foodName')}><input id="qa-name" value={v.name} onChange={set('name')} /></Field>
      <div className="form-grid">
        <Field id="qa-kcal" label="kcal" error={err}><input id="qa-kcal" inputMode="decimal" value={v.kcal} onChange={set('kcal')} /></Field>
        <Field id="qa-p" label={`${t('protein')} (g)`}><input id="qa-p" inputMode="decimal" value={v.protein} onChange={set('protein')} /></Field>
        <Field id="qa-c" label={`${t('carbs')} (g)`}><input id="qa-c" inputMode="decimal" value={v.carbs} onChange={set('carbs')} /></Field>
        <Field id="qa-f" label={`${t('fat')} (g)`}><input id="qa-f" inputMode="decimal" value={v.fat} onChange={set('fat')} /></Field>
      </div>
      <button type="submit" className="btn btn-primary btn-block">{t('addToDiary')}</button>
    </form>
  );
}

export function Field({ id, label, error, children, hint }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      <AnimatePresence>{error && <motion.p className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{error}</motion.p>}</AnimatePresence>
    </div>
  );
}
