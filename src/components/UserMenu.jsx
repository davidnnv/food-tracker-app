import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import Icon from './Icon.jsx';

const THEMES = ['system', 'light', 'dark'];

export function initials(name = '', email = '') {
  const src = name.trim() || email;
  const parts = src.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

// Avatar button with a dropdown: settings, language, theme, cookies and log out.
export default function UserMenu() {
  const { t, account, data, prefs, setPref, logout, setCookiePanel } = useStore();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const nav = useNavigate();
  const name = data?.profile.name || account?.name || '';

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); wrap.current?.querySelector('.avatar-btn')?.focus(); } };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    setTimeout(() => wrap.current?.querySelector('[role="menuitem"]')?.focus(), 30);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  // Arrow-key navigation between items.
  const onMenuKey = (e) => {
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const items = [...wrap.current.querySelectorAll('[role="menuitem"]')];
    const i = items.indexOf(document.activeElement);
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
  };

  const go = (fn) => () => { setOpen(false); fn(); };
  const nextTheme = THEMES[(THEMES.indexOf(prefs.theme) + 1) % THEMES.length];

  return (
    <div className="user-menu" ref={wrap}>
      <motion.button type="button" className="avatar-btn" aria-haspopup="menu" aria-expanded={open} aria-label={t('openMenu')}
        onClick={() => setOpen(!open)} whileTap={{ scale: 0.92 }}>
        <span className="avatar">{initials(name, account?.email)}</span>
        <span className="avatar-name">{name}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="avatar-caret"><Icon name="down" size={16} /></motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div className="menu" role="menu" aria-label={t('account')} onKeyDown={onMenuKey}
            initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 520, damping: 34 }}>
            <div className="menu-head">
              <span className="avatar avatar-lg">{initials(name, account?.email)}</span>
              <div className="menu-who"><b>{name}</b><span className="muted small">{account?.email}</span></div>
            </div>
            <button type="button" role="menuitem" className="menu-item" onClick={go(() => nav('/settings'))}><Icon name="settings" size={18} /> {t('settings')}</button>
            <button type="button" role="menuitem" className="menu-item" onClick={() => setPref('lang', prefs.lang === 'mk' ? 'en' : 'mk')}>
              <Icon name="globe" size={18} /> {t('switchLang')}
            </button>
            <button type="button" role="menuitem" className="menu-item" onClick={() => setPref('theme', nextTheme)}>
              <Icon name={prefs.theme === 'dark' ? 'moon' : prefs.theme === 'light' ? 'sun' : 'half'} size={18} /> {t('themeToggle')}
              <span className="menu-value">{t('theme_' + prefs.theme)}</span>
            </button>
            <button type="button" role="menuitem" className="menu-item" onClick={go(() => setCookiePanel(true))}><Icon name="cookie" size={18} /> {t('cookieSettings')}</button>
            <div className="menu-sep" />
            <button type="button" role="menuitem" className="menu-item is-danger" onClick={logout}><Icon name="logout" size={18} /> {t('logout')}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
