import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BrutalAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const BrutalAccordion: React.FC<BrutalAccordionProps> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="brutalist-border" style={{ marginBottom: '1rem', backgroundColor: 'var(--panel-bg)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '0.75rem 1rem',
          backgroundColor: isOpen ? 'var(--card-bg)' : 'transparent',
          color: 'var(--text-color)',
          border: 'none',
          borderBottom: isOpen ? '2px solid var(--border-color)' : 'none',
          fontFamily: 'var(--font-main)',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        {title}
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {isOpen && (
        <div style={{ padding: '1rem' }}>
          {children}
        </div>
      )}
    </div>
  );
};
