import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter-tight';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/jetbrains-mono';
import 'lenis/dist/lenis.css';
import { App } from './App.jsx';
import './styles.css';
import { ComingSoon } from './ComingSoon.jsx';
import './coming-soon.css';

// Temporary: set to false to bring the portfolio back.
const COMING_SOON = true;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {COMING_SOON ? <ComingSoon /> : <App />}
  </React.StrictMode>,
);
