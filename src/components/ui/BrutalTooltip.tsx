import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface BrutalTooltipProps {
  content: string;
}

const BrutalTooltip: React.FC<BrutalTooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '0.5rem',
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <Info size={16} className="cursor-pointer" style={{ color: 'var(--text-color)', opacity: 0.7 }} />
      
      {isVisible && (
        <div 
          className="brutalist-border brutalist-shadow"
          style={{
            position: 'absolute',
            zIndex: 1000,
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '0.75rem',
            width: '240px',
            padding: '1rem',
            fontSize: '0.875rem',
            backgroundColor: '#ffff00', // Bright Neo-Brutalist Yellow
            color: '#000000',
            fontFamily: 'var(--font-main)',
            fontWeight: 800,
            lineHeight: 1.4,
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          {content}
          {/* Brutalist pointer triangle */}
          <div 
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid var(--text-color)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BrutalTooltip;
