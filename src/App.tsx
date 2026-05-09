import React, { useState, useEffect } from 'react';
import './index.css';
import TemplateGallery from './components/TemplateGallery';
import CanvasEditor from './components/CanvasEditor';
import ControlPanel from './components/ControlPanel';
import ExportMenu from './components/ExportMenu';
import { BrutalButton } from './components/ui/BrutalButton';
import { TextToolbar } from './components/ui/TextToolbar';

function App() {
  type Theme = 'light' | 'dark' | 'monokai';
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('poster-splitter-theme');
    return (saved as Theme) || 'light';
  });

  const handleThemeToggle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('monokai');
    else setTheme('light');
  };

  useEffect(() => {
    console.log("[App] Application mounted.");
    return () => console.log("[App] Application unmounted.");
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'monokai');
    if (theme !== 'light') {
      document.documentElement.classList.add(theme);
    }
    localStorage.setItem('poster-splitter-theme', theme);
  }, [theme]);

  const getThemeIcon = () => {
    if (theme === 'light') return '☀️ Light';
    if (theme === 'dark') return '🌙 Dark';
    return '🟣 Monokai';
  };

  return (
    <div className="app-container">
      <header className="app-header brutalist-border brutalist-shadow">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1>Poster Splitter</h1>
          <BrutalButton 
            onClick={handleThemeToggle}
            variant="secondary"
          >
            {getThemeIcon()}
          </BrutalButton>
        </div>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <TextToolbar />
        </div>

        <ExportMenu />
      </header>
      
      <aside className="sidebar-left">
        <TemplateGallery />
      </aside>
      
      <main className="main-content">
        <CanvasEditor />
      </main>
      
      <aside className="sidebar-right">
        <ControlPanel />
      </aside>
    </div>
  );
}

export default App;
