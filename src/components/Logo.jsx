import { useId } from 'react';
import { useStore } from '../lib/store.jsx';

// Mark: a plate seen from above with a bite taken out of it ("залак" = a bite).
export default function Logo({ big = false }) {
  const { t } = useStore();
  const mask = `bite${useId().replace(/:/g, '')}`;
  return (
    <span className={`logo${big ? ' logo-big' : ''}`}>
      <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <mask id={mask}>
            <rect width="32" height="32" fill="#fff" />
            <circle cx="27.5" cy="6.5" r="5.2" fill="#000" />
            <circle cx="30" cy="12" r="3.4" fill="#000" />
          </mask>
        </defs>
        <g mask={`url(#${mask})`}>
          <circle cx="16" cy="16" r="14" fill="var(--accent)" />
          <circle cx="16" cy="16" r="8.5" fill="none" stroke="var(--on-accent)" strokeWidth="2" opacity=".55" />
        </g>
      </svg>
      <span className="logo-word">{t('appName')}</span>
    </span>
  );
}
