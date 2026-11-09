import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

const niceMax = (v) => {
  const step = v > 3000 ? 1000 : 500;
  return Math.ceil(v / step) * step;
};

// Daily calories as bars against a dashed goal line. Over-goal days use the warning tone.
export function CalorieBars({ days, goal, labels, tooltip }) {
  const [ref, w] = useWidth();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(null);
  const h = 220, padL = 40, padR = 8, padT = 12, padB = 26;
  const max = niceMax(Math.max(goal * 1.15, ...days.map((d) => d.kcal)));
  const y = (v) => padT + (h - padT - padB) * (1 - v / max);
  const slot = (w - padL - padR) / days.length;
  const bw = Math.max(4, Math.min(28, slot * 0.62));
  const ticks = [0, max / 2, max];
  const every = days.length > 14 ? 5 : 1;

  return (
    <div ref={ref} className="chart" onMouseLeave={() => setHover(null)}>
      <svg width={w} height={h} role="img" aria-label={tooltip.aria}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={padL} x2={w - padR} y1={y(v)} y2={y(v)} className="grid" />
            <text x={padL - 8} y={y(v) + 4} textAnchor="end" className="axis">{v.toLocaleString()}</text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = padL + slot * i + (slot - bw) / 2;
          const top = y(d.kcal);
          const status = d.kcal > goal * 1.1 ? 'over' : 'ok';
          return (
            <g key={d.date}>
              {d.kcal > 0 && (
                <motion.path className={`bar-mark is-${status}${hover === i ? ' is-hover' : ''}`}
                  d={`M${x},${y(0)} V${top + 4} Q${x},${top} ${x + 4},${top} H${x + bw - 4} Q${x + bw},${top} ${x + bw},${top + 4} V${y(0)} Z`}
                  initial={reduce ? false : { scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: `0 ${y(0)}px` }}
                  transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.02, ease: [0.2, 0.8, 0.2, 1] }} />
              )}
              {(i % every === 0 || i === days.length - 1) && (
                <text x={x + bw / 2} y={h - 8} textAnchor="middle" className="axis">{labels[i]}</text>
              )}
              <rect x={padL + slot * i} y={padT} width={slot} height={h - padT - padB} fill="transparent"
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}
                aria-label={`${labels[i]}: ${d.kcal} kcal`} onTouchStart={() => setHover(i)} />
            </g>
          );
        })}
        <line x1={padL} x2={w - padR} y1={y(goal)} y2={y(goal)} className="goal-line" />
        <text x={w - padR} y={y(goal) - 6} textAnchor="end" className="axis goal-text">{tooltip.goal} {goal.toLocaleString()}</text>
      </svg>
      {hover !== null && (
        <div className="tip" style={{ left: Math.min(w - 150, Math.max(0, padL + slot * hover + slot / 2 - 70)), top: Math.max(0, y(days[hover].kcal) - 70) }}>
          <strong>{tooltip.date(days[hover].date)}</strong>
          <span><b className="num">{days[hover].kcal.toLocaleString()}</b> kcal</span>
          <span className="muted">P {days[hover].protein} · C {days[hover].carbs} · F {days[hover].fat}</span>
        </div>
      )}
    </div>
  );
}

// Weight over time with a crosshair tooltip.
export function WeightLine({ points, labelFor }) {
  const [ref, w] = useWidth();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(null);
  const h = 220, padL = 40, padR = 14, padT = 14, padB = 26;
  const kg = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kg) - 1), hi = Math.ceil(Math.max(...kg) + 1);
  const t0 = new Date(points[0].date).getTime(), t1 = new Date(points[points.length - 1].date).getTime() || t0 + 1;
  const x = (d) => padL + (w - padL - padR) * (points.length === 1 ? 0.5 : (new Date(d).getTime() - t0) / (t1 - t0));
  const y = (v) => padT + (h - padT - padB) * (1 - (v - lo) / (hi - lo));
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.date)},${y(p.kg)}`).join(' ');
  const area = `${path} L${x(points[points.length - 1].date)},${h - padB} L${x(points[0].date)},${h - padB} Z`;
  const ticks = [lo, (lo + hi) / 2, hi];

  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = (e.touches ? e.touches[0].clientX : e.clientX) - box.left;
    let best = 0;
    points.forEach((p, i) => { if (Math.abs(x(p.date) - px) < Math.abs(x(points[best].date) - px)) best = i; });
    setHover(best);
  };

  return (
    <div ref={ref} className="chart">
      <svg width={w} height={h} onMouseMove={onMove} onTouchMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label="Weight trend">
        <defs>
          <linearGradient id="wfill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".22" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={padL} x2={w - padR} y1={y(v)} y2={y(v)} className="grid" />
            <text x={padL - 8} y={y(v) + 4} textAnchor="end" className="axis">{Math.round(v * 10) / 10}</text>
          </g>
        ))}
        <motion.path d={area} fill="url(#wfill)" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} />
        <motion.path d={path} className="line-mark" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }} />
        <text x={x(points[0].date)} y={h - 8} textAnchor="start" className="axis">{labelFor(points[0].date)}</text>
        {points.length > 1 && <text x={x(points[points.length - 1].date)} y={h - 8} textAnchor="end" className="axis">{labelFor(points[points.length - 1].date)}</text>}
        <circle cx={x(points[points.length - 1].date)} cy={y(kg[kg.length - 1])} r="5" className="end-dot" />
        {hover !== null && (
          <g>
            <line x1={x(points[hover].date)} x2={x(points[hover].date)} y1={padT} y2={h - padB} className="crosshair" />
            <circle cx={x(points[hover].date)} cy={y(points[hover].kg)} r="5.5" className="hover-dot" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="tip" style={{ left: Math.min(w - 120, Math.max(0, x(points[hover].date) - 55)), top: Math.max(0, y(points[hover].kg) - 64) }}>
          <strong>{labelFor(points[hover].date)}</strong>
          <span><b className="num">{points[hover].kg}</b> kg</span>
        </div>
      )}
    </div>
  );
}
