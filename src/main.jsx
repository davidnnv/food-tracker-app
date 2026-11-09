import React from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import '@fontsource/rubik/cyrillic-500.css';
import '@fontsource/rubik/cyrillic-600.css';
import '@fontsource/rubik/cyrillic-700.css';
import '@fontsource/rubik/latin-500.css';
import '@fontsource/rubik/latin-600.css';
import '@fontsource/rubik/latin-700.css';
import '@fontsource/golos-text/cyrillic-400.css';
import '@fontsource/golos-text/cyrillic-500.css';
import '@fontsource/golos-text/cyrillic-600.css';
import '@fontsource/golos-text/latin-400.css';
import '@fontsource/golos-text/latin-500.css';
import '@fontsource/golos-text/latin-600.css';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>,
);
