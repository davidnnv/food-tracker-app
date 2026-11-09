import { HashRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { StoreProvider, useStore } from './lib/store.jsx';
import Auth from './pages/Auth.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Today from './pages/Today.jsx';
import Insights from './pages/Insights.jsx';
import Progress from './pages/Progress.jsx';
import Settings from './pages/Settings.jsx';
import Logo from './components/Logo.jsx';
import Icon from './components/Icon.jsx';
import { Toasts, page } from './components/ui.jsx';

const NAV = [
  { to: '/', key: 'today', icon: 'today' },
  { to: '/insights', key: 'insights', icon: 'insights' },
  { to: '/progress', key: 'progress', icon: 'progress' },
  { to: '/settings', key: 'settings', icon: 'settings' },
];

function Shell() {
  const { t } = useStore();
  const location = useLocation();
  return (
    <div className="shell">
      <aside className="sidebar">
        <Logo />
        <nav aria-label="Main">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end className="nav-link">
                  {({ isActive }) => (
                    <>
                      {isActive && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                      <Icon name={n.icon} /><span>{t(n.key)}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="content" id="main">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} variants={page} initial="initial" animate="animate" exit="exit">
            <Routes location={location}>
              <Route path="/" element={<Today />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="tabbar" aria-label="Main">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end className="tab-link">
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="tab-pill" className="tab-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                <Icon name={n.icon} /><span>{t(n.key)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Gate() {
  const { account, data } = useStore();
  let view = 'app';
  if (!account || !data) view = 'auth';
  else if (!data.onboarded) view = 'onboarding';
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {view === 'auth' ? <Auth /> : view === 'onboarding' ? <Onboarding /> : <Shell />}
        </motion.div>
      </AnimatePresence>
      <Toasts />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Gate />
      </HashRouter>
    </StoreProvider>
  );
}
