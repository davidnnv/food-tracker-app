import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useReducedMotion } from 'framer-motion';
import Icon from './Icon.jsx';
import { useStore } from '../lib/store.jsx';

// Number that counts to its new value.
export function CountUp({ value, decimals = 0, className = '' }) {
  const ref = useRef(null);
  const prev = useRef(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const fmt = (v) => Number(v).toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
    if (reduce) { node.textContent = fmt(value); prev.current = value; return; }
    const ctrl = animate(prev.current, value, { duration: 0.8, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => { node.textContent = fmt(v); } });
    prev.current = value;
    return () => ctrl.stop();
  }, [value, decimals, reduce]);
  return <span ref={ref} className={`num ${className}`}>0</span>;
}

// Bottom sheet on phones, centred dialog on wider screens.
export function Sheet({ open, onClose, title, children, wide = false, labelledBy }) {
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    setTimeout(() => panel.current?.querySelector('input, button:not(.sheet-x), [tabindex]')?.focus(), 60);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prevFocus?.focus?.(); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="sheet-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="sheet-backdrop" onClick={onClose} />
          <motion.div
            ref={panel}
            className={`sheet${wide ? ' sheet-wide' : ''}`}
            role="dialog" aria-modal="true" aria-labelledby={labelledBy || 'sheet-title'}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <div className="sheet-grab" aria-hidden="true" />
            <header className="sheet-head">
              <h2 id="sheet-title" className="sheet-title">{title}</h2>
              <button type="button" className="icon-btn sheet-x" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
            </header>
            <div className="sheet-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="toasts" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} className="toast" layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}>
            <span>{t.message}</span>
            {t.action && (
              <button type="button" className="toast-action" onClick={() => { t.action.run(); dismissToast(t.id); }}>{t.action.label}</button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value}
          className={value === o.value ? 'is-on' : ''} onClick={() => onChange(o.value)}>
          {value === o.value && <motion.span layoutId={`seg-${label}`} className="seg-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span className="seg-label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Stepper({ value, onChange, step = 1, min = 0, max = 9999, label, unit, id }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = (v) => {
    const n = Math.min(max, Math.max(min, Number(String(v).replace(',', '.'))));
    if (Number.isFinite(n)) onChange(Math.round(n * 100) / 100); else setText(String(value));
  };
  return (
    <div className="stepper">
      <button type="button" className="icon-btn" onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))} aria-label={`− ${label}`}><Icon name="minus" /></button>
      <label className="stepper-field" htmlFor={id}>
        <input id={id} inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commit(e.currentTarget.value)} aria-label={label} />
        {unit && <span className="stepper-unit">{unit}</span>}
      </label>
      <button type="button" className="icon-btn" onClick={() => onChange(Math.min(max, Math.round((value + step) * 100) / 100))} aria-label={`+ ${label}`}><Icon name="plus" /></button>
    </div>
  );
}

export const page = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

export const listItem = {
  initial: { opacity: 0, height: 0, y: -6 },
  animate: { opacity: 1, height: 'auto', y: 0, transition: { type: 'spring', stiffness: 420, damping: 36 } },
  exit: { opacity: 0, height: 0, x: 40, transition: { duration: 0.22 } },
};
