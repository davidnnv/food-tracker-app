import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import { Field } from '../components/AddFood.jsx';
import Logo from '../components/Logo.jsx';
import Icon from '../components/Icon.jsx';

export default function Auth() {
  const { t, signup, login, loginDemo, prefs, setPref } = useStore();
  const [mode, setMode] = useState('login');
  const [v, setV] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (mode === 'signup' && !v.name.trim()) er.name = t('errName');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) er.email = t('errEmail');
    if (v.password.length < 6) er.password = t('errPassword');
    setErr(er);
    if (Object.keys(er).length) { document.getElementById(`a-${Object.keys(er)[0]}`)?.focus(); return; }
    setBusy(true);
    try { await (mode === 'signup' ? signup(v) : login(v)); }
    catch (x) { setErr({ form: t(x.message) }); setBusy(false); }
  };

  const demo = async () => { setBusy(true); await loginDemo(); };

  return (
    <div className="auth">
      <aside className="auth-art" aria-hidden="true">
        <div className="auth-art-inner">
          <Logo big />
          <p className="auth-tag">{t('tagline')}</p>
          <PlateArt />
          <ul className="auth-pitch">
            {t('authPitch').map((p, i) => (
              <motion.li key={p} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
                <Icon name="check" size={16} /> {p}
              </motion.li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-top">
          <span className="auth-logo-sm"><Logo /></span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPref('lang', prefs.lang === 'mk' ? 'en' : 'mk')}>
            {prefs.lang === 'mk' ? 'English' : 'Македонски'}
          </button>
        </div>

        <motion.div className="auth-card" layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
          <AnimatePresence mode="wait">
            <motion.h1 key={mode} className="auth-title" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {mode === 'login' ? t('login') : t('signup')}
            </motion.h1>
          </AnimatePresence>

          <form className="form" onSubmit={submit} noValidate>
            <AnimatePresence initial={false}>
              {mode === 'signup' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Field id="a-name" label={t('name')} error={err.name}><input id="a-name" value={v.name} onChange={set('name')} autoComplete="given-name" /></Field>
                </motion.div>
              )}
            </AnimatePresence>
            <Field id="a-email" label={t('email')} error={err.email}><input id="a-email" type="email" value={v.email} onChange={set('email')} autoComplete="email" /></Field>
            <Field id="a-password" label={t('password')} error={err.password}>
              <input id="a-password" type="password" value={v.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </Field>
            <AnimatePresence>{err.form && <motion.p className="form-error" role="alert" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }} exit={{ opacity: 0 }}>{err.form}</motion.p>}</AnimatePresence>
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? t('working') : mode === 'login' ? t('login') : t('signup')}</button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? t('noAccount') : t('haveAccount')}{' '}
            <button type="button" className="text-btn" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr({}); }}>
              {mode === 'login' ? t('signup') : t('login')}
            </button>
          </p>

          <div className="divider"><span>{t('or')}</span></div>
          <button type="button" className="btn btn-soft btn-block" onClick={demo} disabled={busy}><Icon name="sparkle" size={16} /> {t('tryDemo')}</button>
          <p className="muted small center">{t('demoHint')}</p>
        </motion.div>
        <p className="muted small center auth-note">{t('localNote')}</p>
      </main>
    </div>
  );
}

// Decorative: a plate with three macro "portions" orbiting gently.
function PlateArt() {
  return (
    <div className="plate">
      <motion.div className="plate-dish" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }}>
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="86" className="plate-rim" />
          <circle cx="100" cy="100" r="66" className="plate-in" />
          {[['protein', 0, 0.3], ['carbs', 0.32, 0.5], ['fat', 0.84, 0.14]].map(([m, start, len], i) => (
            <motion.circle key={m} cx="100" cy="100" r="50" data-macro={m} className="plate-arc"
              strokeDasharray={`${len * 314} 314`} strokeDashoffset={-start * 314}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: '100px 100px' }} transition={{ delay: 0.4 + i * 0.2 }} />
          ))}
        </svg>
      </motion.div>
      {[['🥑', -38, -30, 0], ['🍓', 120, 10, 0.6], ['🥚', 10, 150, 1.2], ['🍞', 150, 130, 1.8]].map(([e, x, y, d]) => (
        <motion.span key={e} className="plate-food" style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{ opacity: { delay: 0.6 + d * 0.2 }, scale: { delay: 0.6 + d * 0.2, type: 'spring' }, y: { repeat: Infinity, duration: 3.2, delay: d, ease: 'easeInOut' } }}>
          {e}
        </motion.span>
      ))}
    </div>
  );
}
