import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/landing.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Fade out the boot splash from index.html once React has painted.
const splash = document.getElementById('app-splash');
if (splash) {
  const MIN_VISIBLE_MS = 450; // avoid a jarring flash on fast connections
  const elapsed = performance.now();
  const delay = Math.max(0, MIN_VISIBLE_MS - elapsed);

  window.setTimeout(() => {
    requestAnimationFrame(() => {
      splash.classList.add('is-hidden');
      splash.addEventListener('transitionend', () => splash.remove(), { once: true });
      // Fallback removal in case transitionend never fires (e.g. reduced motion)
      window.setTimeout(() => splash.remove(), 600);
    });
  }, delay);
}
