import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import { ACTIVITY, GOALS, suggestGoals } from '../lib/nutrition.js';
import { Segmented } from '../components/ui.jsx';
import { Field } from '../components/AddFood.jsx';
import Icon from '../components/Icon.jsx';

const rise = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } } };

export default function Settings() {
  const { data, t, prefs, setPref, setProfile, setGoals, account, logout, resetDiary, importData, toast } = useStore();
  const [p, setP] = useState(data.profile);
  const [g, setG] = useState(data.goals);
  const [confirmReset, setConfirmReset] = useState(false);
  const [backup, setBackup] = useState('');
  const fileRef = useRef(null);
  const setPf = (k) => (e) => setP((s) => ({ ...s, [k]: e.target.value }));
  const setGf = (k) => (e) => setG((s) => ({ ...s, [k]: e.target.value }));
  const n = (v) => Math.max(0, Math.round(Number(String(v).replace(',', '.')) || 0));

  const saveProfile = (e) => {
    e.preventDefault();
    setProfile({ ...p, age: n(p.age), heightCm: n(p.heightCm), weightKg: Number(p.weightKg) || '' });
    toast(t('saved'));
  };
  const recalc = () => {
    const s = suggestGoals({ ...p, age: n(p.age), heightCm: n(p.heightCm), weightKg: Number(p.weightKg) });
    if (!s) return;
    const next = { calories: s.calories, protein: s.protein, carbs: s.carbs, fat: s.fat, water: s.water };
    setG(next); setGoals(next); setProfile(p);
    toast(t('recalcDone'));
  };
  const saveGoals = (e) => {
    e.preventDefault();
    setGoals({ calories: n(g.calories) || 2000, protein: n(g.protein), carbs: n(g.carbs), fat: n(g.fat), water: n(g.water) || 2000 });
    toast(t('saved'));
  };

  const doExport = () => setBackup(JSON.stringify(data, null, 2));
  const copyBackup = async () => { try { await navigator.clipboard.writeText(backup); toast(t('copiedJson')); } catch {} };
  const onImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try { importData(JSON.parse(await file.text())); toast(t('imported')); } catch { toast(t('importFailed')); }
  };

  return (
    <motion.div className="settings" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <motion.header className="page-head" variants={rise}>
        <div>
          <h1 className="page-title">{t('settings')}</h1>
          <p className="muted">{account?.email}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={logout}><Icon name="logout" size={16} /> {t('logout')}</button>
      </motion.header>

      <div className="settings-grid">
        <motion.form className="card form" variants={rise} onSubmit={saveProfile} noValidate aria-labelledby="pf-h">
          <h2 id="pf-h" className="card-title">{t('profile')}</h2>
          <Field id="s-name" label={t('name')}><input id="s-name" value={p.name} onChange={setPf('name')} autoComplete="name" /></Field>
          <div className="field"><span className="label">{t('sex')}</span>
            <Segmented label={t('sex')} value={p.sex} onChange={(v) => setP((s) => ({ ...s, sex: v }))} options={[{ value: 'female', label: t('female') }, { value: 'male', label: t('male') }]} /></div>
          <div className="form-grid three">
            <Field id="s-age" label={t('age')}><input id="s-age" inputMode="numeric" value={p.age} onChange={setPf('age')} /></Field>
            <Field id="s-h" label={`${t('height')} (cm)`}><input id="s-h" inputMode="numeric" value={p.heightCm} onChange={setPf('heightCm')} /></Field>
            <Field id="s-w" label={`${t('weight')} (kg)`}><input id="s-w" inputMode="decimal" value={p.weightKg} onChange={setPf('weightKg')} /></Field>
          </div>
          <Field id="s-act" label={t('activity')}>
            <select id="s-act" value={p.activity} onChange={setPf('activity')}>{ACTIVITY.map((a) => <option key={a.id} value={a.id}>{t('act_' + a.id)}</option>)}</select>
          </Field>
          <Field id="s-goal" label={t('goal')}>
            <select id="s-goal" value={p.goal} onChange={setPf('goal')}>{GOALS.map((x) => <option key={x.id} value={x.id}>{t('goal_' + x.id)}</option>)}</select>
          </Field>
          <div className="row-2">
            <button type="button" className="btn btn-ghost" onClick={recalc}><Icon name="sparkle" size={16} /> {t('recalc')}</button>
            <button type="submit" className="btn btn-primary">{t('save')}</button>
          </div>
        </motion.form>

        <motion.form className="card form" variants={rise} onSubmit={saveGoals} noValidate aria-labelledby="gl-h">
          <h2 id="gl-h" className="card-title">{t('targets')}</h2>
          <Field id="g-kcal" label={`${t('calories')} (kcal)`}><input id="g-kcal" inputMode="numeric" value={g.calories} onChange={setGf('calories')} /></Field>
          <div className="form-grid three">
            {['protein', 'carbs', 'fat'].map((m) => (
              <Field key={m} id={`g-${m}`} label={`${t(m)} (g)`}><input id={`g-${m}`} inputMode="numeric" value={g[m]} onChange={setGf(m)} /></Field>
            ))}
          </div>
          <Field id="g-w" label={`${t('water')} (ml)`}><input id="g-w" inputMode="numeric" value={g.water} onChange={setGf('water')} /></Field>
          <p className="muted small">{t('targetsNote')}</p>
          <button type="submit" className="btn btn-primary btn-block">{t('save')}</button>
        </motion.form>

        <motion.section className="card form" variants={rise} aria-labelledby="ap-h">
          <h2 id="ap-h" className="card-title">{t('appearance')}</h2>
          <div className="field"><span className="label">{t('language')}</span>
            <Segmented label={t('language')} value={prefs.lang} onChange={(v) => setPref('lang', v)} options={[{ value: 'mk', label: 'Македонски' }, { value: 'en', label: 'English' }]} /></div>
          <div className="field"><span className="label">{t('theme')}</span>
            <Segmented label={t('theme')} value={prefs.theme} onChange={(v) => setPref('theme', v)}
              options={['system', 'light', 'dark'].map((x) => ({ value: x, label: t('theme_' + x) }))} /></div>
        </motion.section>

        <motion.section className="card form" variants={rise} aria-labelledby="dt-h">
          <h2 id="dt-h" className="card-title">{t('data')}</h2>
          <div className="row-2">
            <button type="button" className="btn btn-ghost" onClick={doExport}>{t('exportData')}</button>
            <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>{t('importData')}</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
          </div>
          <AnimatePresence>
            {backup && (
              <motion.div className="backup" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <p className="small"><b>{t('exportReady')}</b></p>
                <textarea readOnly value={backup} rows={5} onFocus={(e) => e.target.select()} aria-label={t('exportData')} />
                <button type="button" className="btn btn-soft btn-sm" onClick={copyBackup}><Icon name="copy" size={16} /> {t('copyJson')}</button>
              </motion.div>
            )}
          </AnimatePresence>
          {!confirmReset ? (
            <button type="button" className="btn btn-danger-ghost" onClick={() => setConfirmReset(true)}><Icon name="trash" size={16} /> {t('resetData')}</button>
          ) : (
            <motion.div className="confirm" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
              <p>{t('resetConfirm')}</p>
              <div className="row-2">
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(false)}>{t('cancel')}</button>
                <button type="button" className="btn btn-danger" onClick={() => { resetDiary(); setConfirmReset(false); toast(t('resetDone')); }}>{t('confirm')}</button>
              </div>
            </motion.div>
          )}
          <p className="muted small">{t('localNote')}</p>
        </motion.section>

        <motion.section className="card" variants={rise} aria-labelledby="ab-h">
          <h2 id="ab-h" className="card-title">{t('about')}</h2>
          <p className="muted">{t('aboutText')}</p>
        </motion.section>
      </div>
    </motion.div>
  );
}
