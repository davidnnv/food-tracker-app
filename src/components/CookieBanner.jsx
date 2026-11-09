import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import { COOKIE_LIST } from '../lib/cookies.js';
import { Sheet } from './ui.jsx';

// First-visit banner + a settings panel that can be reopened from the account menu or Settings.
export default function CookieBanner() {
  const { t, consent, setConsent, cookiePanel, setCookiePanel, toast, account, data } = useStore();
  const inApp = !!(account && data?.onboarded);
  const [ready, setReady] = useState(false);
  useEffect(() => { const id = setTimeout(() => setReady(true), 700); return () => clearTimeout(id); }, []);

  const choose = (preferences) => { setConsent({ preferences }); setCookiePanel(false); toast(t('cookieSaved')); };
  const showBanner = ready && !consent && !cookiePanel;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.section className={`cookie-banner${inApp ? '' : ' is-low'}`} role="region" aria-labelledby="ck-title"
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
            <CookieArt />
            <div className="cookie-copy">
              <h2 id="ck-title" className="card-title">{t('cookieTitle')}</h2>
              <p className="muted small">{t('cookieText')}</p>
            </div>
            <div className="cookie-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCookiePanel(true)}>{t('cookieCustomize')}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => choose(false)}>{t('cookieNecessary')}</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => choose(true)}>{t('cookieAccept')}</button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <CookieSettings open={cookiePanel} onClose={() => setCookiePanel(false)} onSave={choose} />
    </>
  );
}

function CookieSettings({ open, onClose, onSave }) {
  const { t, lang, consent } = useStore();
  const [prefs, setPrefs] = useState(consent?.preferences ?? true);
  useEffect(() => { if (open) setPrefs(consent?.preferences ?? true); }, [open, consent]);

  return (
    <Sheet open={open} onClose={onClose} title={t('cookieSettings')}>
      <div className="form">
        <p className="muted small">{t('cookieText')}</p>
        {[
          { id: 'necessary', locked: true, on: true },
          { id: 'preferences', locked: false, on: prefs },
        ].map((g) => (
          <div key={g.id} className="ck-group">
            <div className="ck-row">
              <div>
                <h3 className="ck-name">{t('ck_' + g.id)}</h3>
                <p className="muted small">{t(`ck_${g.id}_d`)}</p>
              </div>
              {g.locked ? <span className="ck-always">{t('alwaysOn')}</span> : (
                <button type="button" role="switch" aria-checked={g.on} aria-label={t('ck_' + g.id)} className={`switch${g.on ? ' is-on' : ''}`} onClick={() => setPrefs(!prefs)}>
                  <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 34 }} />
                </button>
              )}
            </div>
            <ul className="ck-list">
              {COOKIE_LIST.filter((c) => c.group === g.id).map((c) => (
                <li key={c.name}><code>{c.name}</code><span className="muted">{c.life[lang]}</span></li>
              ))}
            </ul>
          </div>
        ))}
        <div className="row-2">
          <button type="button" className="btn btn-ghost" onClick={() => onSave(false)}>{t('cookieNecessary')}</button>
          <button type="button" className="btn btn-primary" onClick={() => onSave(prefs)}>{t('cookieSave')}</button>
        </div>
      </div>
    </Sheet>
  );
}

// A cookie that loses a bite — fits the "Zalak" (a bite) name.
function CookieArt() {
  return (
    <motion.svg className="cookie-art" viewBox="0 0 48 48" aria-hidden="true"
      initial={{ rotate: -30, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}>
      <defs>
        <mask id="ck-bite">
          <rect width="48" height="48" fill="#fff" />
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: 'spring', stiffness: 300, damping: 14 }} style={{ transformOrigin: '42px 8px' }}>
            <circle cx="42" cy="8" r="7" fill="#000" /><circle cx="46" cy="17" r="5" fill="#000" /><circle cx="34" cy="3" r="4.5" fill="#000" />
          </motion.g>
        </mask>
      </defs>
      <g mask="url(#ck-bite)">
        <circle cx="24" cy="24" r="21" className="ck-dough" />
        {[[15, 16], [27, 13], [18, 30], [31, 27], [24, 37], [11, 25], [35, 36]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 ? 2.2 : 2.8} className="ck-chip" />
        ))}
      </g>
    </motion.svg>
  );
}
