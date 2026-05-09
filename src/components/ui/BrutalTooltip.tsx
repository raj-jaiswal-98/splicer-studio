import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface BrutalTooltipProps {
  content: string;
}

const BrutalTooltip: React.FC<BrutalTooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center justify-center ml-2"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <Info size={16} className="cursor-pointer text-gray-700 hover:text-black transition-colors" />
      
      {isVisible && (
        <div 
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-sm brutalist-border brutalist-shadow"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
            fontFamily: 'var(--font-main)',
            fontWeight: 700,
            lineHeight: 1.4,
            pointerEvents: 'none',
          }}
        >
          {content}
          {/* Brutalist pointer triangle */}
          <div 
            className="absolute top-full left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid var(--border-color)',
            }}
          />
          <div 
            className="absolute top-full left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              marginTop: '-4px',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid var(--card-bg)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BrutalTooltip;
