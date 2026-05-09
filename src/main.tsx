import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { PosterProvider } from './context/PosterContext';
import { StrictMode } from 'react';

console.log("[main] Bootstrapping React Application...");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PosterProvider>
      <App />
    </PosterProvider>
  </StrictMode>,
);
