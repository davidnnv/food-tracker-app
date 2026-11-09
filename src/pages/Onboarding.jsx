import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import { ACTIVITY, GOALS, suggestGoals } from '../lib/nutrition.js';
import { CountUp, Segmented } from '../components/ui.jsx';
import { Field } from '../components/AddFood.jsx';
import Logo from '../components/Logo.jsx';

const slide = {
  initial: (d) => ({ opacity: 0, x: d * 40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] } },
  exit: (d) => ({ opacity: 0, x: d * -40, transition: { duration: 0.18 } }),
};

export default function Onboarding() {
  const { t, data, setProfile, setGoals, finishOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [p, setP] = useState({ ...data.profile, age: data.profile.age || 28, heightCm: data.profile.heightCm || 170, weightKg: data.profile.weightKg || 70 });
  const [err, setErr] = useState({});
  const go = (n) => { setDir(n > step ? 1 : -1); setStep(n); };
  const set = (k) => (e) => setP((s) => ({ ...s, [k]: e.target.value }));
  const s = suggestGoals({ ...p, age: Number(p.age), heightCm: Number(p.heightCm), weightKg: Number(p.weightKg) });

  const next = () => {
    if (step === 0) {
      const er = {};
      if (!(p.age >= 12 && p.age <= 100)) er.age = '12–100';
      if (!(p.heightCm >= 120 && p.heightCm <= 230)) er.heightCm = '120–230 cm';
      if (!(p.weightKg >= 30 && p.weightKg <= 300)) er.weightKg = '30–300 kg';
      setErr(er);
      if (Object.keys(er).length) return;
    }
    go(step + 1);
  };

  const finish = () => {
    setProfile({ ...p, age: Number(p.age), heightCm: Number(p.heightCm), weightKg: Number(p.weightKg) });
    if (s) setGoals({ calories: s.calories, protein: s.protein, carbs: s.carbs, fat: s.fat, water: s.water });
    finishOnboarding();
  };

  return (
    <div className="onboard">
      <header className="onboard-top">
        <Logo />
        {step < 3 && <button type="button" className="text-btn" onClick={finishOnboarding}>{t('skip')}</button>}
      </header>
      <div className="onboard-card">
        {step < 3 && (
          <>
            <p className="eyebrow">{t('obStep', { n: step + 1 })}</p>
            <div className="dots" aria-hidden="true">{[0, 1, 2].map((i) => <motion.span key={i} animate={{ width: i === step ? 28 : 8, opacity: i <= step ? 1 : 0.35 }} />)}</div>
          </>
        )}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={slide} initial="initial" animate="animate" exit="exit" className="onboard-step">
            {step === 0 && (
              <>
                <h1 className="page-title">{t('aboutYou')}</h1>
                <p className="muted">{t('obTitle')}</p>
                <div className="field"><span className="label">{t('sex')}</span>
                  <Segmented label={t('sex')} value={p.sex} onChange={(v) => setP((x) => ({ ...x, sex: v }))} options={[{ value: 'female', label: t('female') }, { value: 'male', label: t('male') }]} /></div>
                <div className="form-grid three">
                  <Field id="o-age" label={t('age')} error={err.age}><input id="o-age" inputMode="numeric" value={p.age} onChange={set('age')} /></Field>
                  <Field id="o-h" label={`${t('height')} (cm)`} error={err.heightCm}><input id="o-h" inputMode="numeric" value={p.heightCm} onChange={set('heightCm')} /></Field>
                  <Field id="o-w" label={`${t('weight')} (kg)`} error={err.weightKg}><input id="o-w" inputMode="decimal" value={p.weightKg} onChange={set('weightKg')} /></Field>
                </div>
              </>
            )}
            {step === 1 && (
              <Choice title={t('activity')} value={p.activity} onChange={(v) => setP((x) => ({ ...x, activity: v }))}
                options={ACTIVITY.map((a) => ({ value: a.id, label: t('act_' + a.id), desc: t(`act_${a.id}_d`) }))} />
            )}
            {step === 2 && (
              <Choice title={t('goal')} value={p.goal} onChange={(v) => setP((x) => ({ ...x, goal: v }))}
                options={GOALS.map((g) => ({ value: g.id, label: t('goal_' + g.id), desc: t(`goal_${g.id}_d`) }))} />
            )}
            {step === 3 && s && (
              <div className="reveal">
                <h1 className="page-title">{t('yourTargets')}</h1>
                <motion.div className="reveal-kcal" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }}>
                  <CountUp value={s.calories} /> <span>kcal</span>
                </motion.div>
                <ul className="reveal-macros">
                  {['protein', 'carbs', 'fat'].map((m, i) => (
                    <motion.li key={m} data-macro={m} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.12 }}>
                      <span className="macro-key" aria-hidden="true" /><span>{t(m)}</span><b className="num">{s[m]} g</b>
                    </motion.li>
                  ))}
                  <motion.li initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.66 }}>
                    <span className="macro-key water-key" aria-hidden="true" /><span>{t('water')}</span><b className="num">{s.water} ml</b>
                  </motion.li>
                </ul>
                <p className="muted small">{t('targetsNote')}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="onboard-nav">
          {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)}>{t('back')}</button>}
          {step < 3 ? <button type="button" className="btn btn-primary" onClick={next}>{t('next')}</button>
            : <button type="button" className="btn btn-primary" onClick={finish}>{t('finish')}</button>}
        </div>
      </div>
    </div>
  );
}

function Choice({ title, value, onChange, options }) {
  return (
    <>
      <h1 className="page-title">{title}</h1>
      <div className="choices" role="radiogroup" aria-label={title}>
        {options.map((o) => (
          <motion.button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={`choice${value === o.value ? ' is-on' : ''}`}
            onClick={() => onChange(o.value)} whileTap={{ scale: 0.98 }}>
            <span className="choice-radio" aria-hidden="true" />
            <span><b>{o.label}</b><span className="muted small">{o.desc}</span></span>
          </motion.button>
        ))}
      </div>
    </>
  );
}
