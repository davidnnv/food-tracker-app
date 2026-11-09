// Small stroke icon set (24×24, 1.8px stroke) so the app has no icon-font dependency.
const P = {
  today: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  insights: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  progress: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  left: <path d="M15 18l-6-6 6-6" />,
  right: <path d="M9 18l6-6-6-6" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>,
  drop: <path d="M12 2.7s6.5 7.1 6.5 11.8A6.5 6.5 0 0 1 5.5 14.5C5.5 9.8 12 2.7 12 2.7z" />,
  flame: <path d="M12 22c4 0 7-2.7 7-6.8 0-4.4-3.6-6.6-4.6-10.7-2.4 1.6-3.4 3.9-3.6 6.1-1-.8-1.7-2-1.8-3.3C7 9 5 11.6 5 15.2 5 19.3 8 22 12 22z" />,
  scale: <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 9a5 5 0 0 1 8 0l-3 3" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></>,
  check: <path d="M20 6L9 17l-5-5" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  table: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 4v16" /></>,
};

export default function Icon({ name, size = 20, className = '', fill = 'none', ...rest }) {
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {P[name]}
    </svg>
  );
}
