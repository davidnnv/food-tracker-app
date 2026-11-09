import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import { fmt, todayKey } from '../lib/dates.js';
import { bmi } from '../lib/nutrition.js';
import { WeightLine } from '../components/charts.jsx';
import { CountUp, listItem } from '../components/ui.jsx';
import { Field } from '../components/AddFood.jsx';
import Icon from '../components/Icon.jsx';

const rise = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } } };

function bmiBand(v) {
  if (v < 18.5) return 'under';
  if (v < 25) return 'normal';
  if (v < 30) return 'over';
  return 'obese';
}

export default function Progress() {
  const { data, t, lang, saveWeight, removeWeight, toast } = useStore();
  const [date, setDate] = useState(todayKey());
  const [kg, setKg] = useState(data.weights.at(-1)?.kg ?? data.profile.weightKg ?? '');
  const [err, setErr] = useState('');
  const w = data.weights;
  const current = w.at(-1)?.kg;
  const start = w[0]?.kg;
  const change = current != null && start != null ? Math.round((current - start) * 10) / 10 : null;
  const b = bmi(current ?? Number(data.profile.weightKg), Number(data.profile.heightCm));

  const submit = (e) => {
    e.preventDefault();
    const v = Number(String(kg).replace(',', '.'));
    if (!(v >= 30 && v <= 300)) { setErr(t('errWeight')); return; }
    setErr('');
    saveWeight(date, Math.round(v * 10) / 10);
    toast(t('weightSaved'));
  };

  // Position of the BMI marker on a 15–35 scale.
  const bmiPos = b ? Math.min(100, Math.max(0, ((b - 15) / 20) * 100)) : 0;

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.07 } } }}>
      <motion.header className="page-head" variants={rise}><h1 className="page-title">{t('progress')}</h1></motion.header>

      <motion.div className="stat-row" variants={rise}>
        <div className="stat"><span className="stat-label">{t('currentWeight')}</span>
          <span className="stat-value">{current != null ? <><CountUp value={current} decimals={1} /> <small>kg</small></> : '—'}</span></div>
        <div className="stat"><span className="stat-label">{t('startWeight')}</span>
          <span className="stat-value">{start != null ? <><span className="num">{start}</span> <small>kg</small></> : '—'}</span></div>
        <div className="stat"><span className="stat-label">{t('change')}</span>
          <span className={`stat-value ${change < 0 ? 'is-down' : change > 0 ? 'is-up' : ''}`}>{change != null ? <>{change > 0 ? '+' : ''}<CountUp value={change} decimals={1} /> <small>kg</small></> : '—'}</span></div>
      </motion.div>

      <div className="progress-grid">
        <motion.section className="card" variants={rise} aria-labelledby="w-h">
          <h2 id="w-h" className="card-title">{t('weightLog')}</h2>
          {w.length ? <WeightLine points={w} labelFor={(k) => fmt(k, lang, { day: 'numeric', month: 'short' })} /> : <p className="empty-note">{t('noWeights')}</p>}
        </motion.section>

        <div className="stack">
          <motion.form className="card form" variants={rise} onSubmit={submit} noValidate aria-labelledby="lw-h">
            <h2 id="lw-h" className="card-title">{t('logWeight')}</h2>
            <div className="form-grid">
              <Field id="w-kg" label={`${t('weight')} (kg)`} error={err}>
                <input id="w-kg" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} />
              </Field>
              <Field id="w-date" label={t('date')}>
                <input id="w-date" type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value || todayKey())} />
              </Field>
            </div>
            <button type="submit" className="btn btn-primary btn-block"><Icon name="check" size={16} /> {t('save')}</button>
          </motion.form>

          {b && (
            <motion.section className="card" variants={rise} aria-labelledby="bmi-h">
              <div className="card-head">
                <h2 id="bmi-h" className="card-title">{t('bmi')}</h2>
                <span className="bmi-val"><CountUp value={b} decimals={1} /></span>
              </div>
              <div className="bmi-scale" aria-hidden="true">
                <span style={{ flex: 3.5 }} /><span style={{ flex: 6.5 }} /><span style={{ flex: 5 }} /><span style={{ flex: 5 }} />
                <motion.i initial={{ left: '0%' }} animate={{ left: `${bmiPos}%` }} transition={{ type: 'spring', stiffness: 90, damping: 15, delay: 0.3 }} />
              </div>
              <div className="bmi-ticks" aria-hidden="true"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>35</span></div>
              <p className="muted">{t('bmi_' + bmiBand(b))}</p>
            </motion.section>
          )}
        </div>
      </div>

      {w.length > 0 && (
        <motion.section className="card" variants={rise} aria-labelledby="hist-h">
          <h2 id="hist-h" className="card-title">{t('history')}</h2>
          <ul className="history">
            <AnimatePresence initial={false}>
              {[...w].reverse().map((x, i, arr) => {
                const prev = arr[i + 1];
                const d = prev ? Math.round((x.kg - prev.kg) * 10) / 10 : null;
                return (
                  <motion.li key={x.date} {...listItem}>
                    <div className="history-row">
                      <span>{fmt(x.date, lang, { weekday: 'short', day: 'numeric', month: 'long' })}</span>
                      <span className="num"><b>{x.kg}</b> kg</span>
                      <span className={`delta ${d < 0 ? 'is-down' : d > 0 ? 'is-up' : ''}`}>{d == null ? '' : `${d > 0 ? '+' : ''}${d}`}</span>
                      <button type="button" className="icon-btn ghost" onClick={() => removeWeight(x.date)} aria-label={`${t('delete')} ${x.date}`}><Icon name="trash" size={16} /></button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </motion.section>
      )}
    </motion.div>
  );
}
