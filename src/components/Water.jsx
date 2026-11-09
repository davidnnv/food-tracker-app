import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../lib/store.jsx';
import Icon from './Icon.jsx';
import { CountUp } from './ui.jsx';

const GLASS = 250;

// Water card: a tank that fills with a moving wave, plus glass buttons.
export default function Water({ date }) {
  const { data, setWater, t } = useStore();
  const ml = data.water[date] || 0;
  const goal = data.goals.water || 2000;
  const pct = Math.min(1, ml / goal);
  const glasses = Math.ceil(goal / GLASS);
  const full = Math.floor(ml / GLASS);

  return (
    <section className="card water" aria-labelledby="water-h">
      <div className="water-tank" aria-hidden="true">
        <motion.div className="water-level" initial={false} animate={{ height: `${pct * 100}%` }} transition={{ type: 'spring', stiffness: 80, damping: 16 }}>
          <svg className="wave" viewBox="0 0 120 12" preserveAspectRatio="none"><path d="M0 6 Q15 0 30 6 T60 6 T90 6 T120 6 V12 H0Z" /></svg>
          <svg className="wave wave-2" viewBox="0 0 120 12" preserveAspectRatio="none"><path d="M0 6 Q15 0 30 6 T60 6 T90 6 T120 6 V12 H0Z" /></svg>
        </motion.div>
        <Icon name="drop" size={22} className="water-drop" />
      </div>
      <div className="water-body">
        <div className="water-head">
          <h2 id="water-h" className="card-title">{t('water')}</h2>
          <p className="water-amount"><CountUp value={ml} /> <span className="muted">{t('waterGoal', { n: goal.toLocaleString() })}</span></p>
        </div>
        <div className="glasses">
          {Array.from({ length: glasses }, (_, i) => (
            <button key={i} type="button" className={`glass${i < full ? ' is-full' : ''}`}
              onClick={() => setWater(date, i < full ? i * GLASS : (i + 1) * GLASS)}
              aria-label={`${(i + 1) * GLASS} ml`} aria-pressed={i < full}>
              <AnimatePresence>{i < full && <motion.span className="glass-fill" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }} />}</AnimatePresence>
            </button>
          ))}
        </div>
        <div className="water-actions">
          <button type="button" className="icon-btn ghost" onClick={() => setWater(date, ml - GLASS)} disabled={!ml} aria-label={t('removeGlass')}><Icon name="minus" /></button>
          <button type="button" className="btn btn-soft btn-sm" onClick={() => setWater(date, ml + GLASS)}><Icon name="plus" size={16} /> 250 ml</button>
        </div>
      </div>
    </section>
  );
}
