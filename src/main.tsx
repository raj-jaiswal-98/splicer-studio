import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { PosterProvider } from './context/PosterContext';

console.log("[main] Bootstrapping React Application...");

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PosterProvider>
      <App />
    </PosterProvider>
  </React.StrictMode>,
);
