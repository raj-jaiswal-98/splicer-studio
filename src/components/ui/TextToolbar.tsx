import React from 'react';
import { usePosterContext } from '../../context/PosterContext';
import { Trash2, Bold, Italic } from 'lucide-react';
import { BrutalButton } from './BrutalButton';

export const TextToolbar: React.FC = () => {
  const { textOverlays, setTextOverlays, selectedTextId, setSelectedTextId } = usePosterContext();

  if (!selectedTextId) return null;

  const selectedOverlay = textOverlays.find(t => t.id === selectedTextId);
  if (!selectedOverlay) return null;

  const updateOverlay = (changes: Partial<typeof selectedOverlay>) => {
    setTextOverlays(prev => prev.map(t => 
      t.id === selectedTextId ? { ...t, ...changes } : t
    ));
  };

  const handleDelete = () => {
    setTextOverlays(prev => prev.filter(t => t.id !== selectedTextId));
    setSelectedTextId(null);
  };

  return (
    <div 
      className="brutalist-border brutalist-shadow" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        padding: '0.5rem 1rem', 
        backgroundColor: 'var(--panel-bg)',
        flexWrap: 'wrap'
      }}
    >
      <input 
        type="text" 
        className="brutalist-border"
        value={selectedOverlay.text}
        onChange={(e) => updateOverlay({ text: e.target.value })}
        style={{ 
          padding: '0.5rem', 
          backgroundColor: 'var(--card-bg)', 
          color: 'var(--text-color)',
          fontFamily: 'var(--font-main)',
          fontWeight: 'bold'
        }}
        placeholder="Text Content"
      />

      <input 
        type="color" 
        className="brutalist-border"
        value={selectedOverlay.color}
        onChange={(e) => updateOverlay({ color: e.target.value })}
        style={{ 
          width: '40px', 
          height: '40px', 
          padding: '0', 
          cursor: 'pointer' 
        }}
        title="Text Color"
      />

      <select
        className="brutalist-border"
        value={selectedOverlay.fontFamily}
        onChange={(e) => updateOverlay({ fontFamily: e.target.value })}
        style={{ 
          padding: '0.5rem', 
          backgroundColor: 'var(--card-bg)', 
          color: 'var(--text-color)',
          fontFamily: 'var(--font-main)',
          cursor: 'pointer'
        }}
      >
        <option value="var(--font-main)">Space Grotesk</option>
        <option value="Impact, sans-serif">Impact (Meme)</option>
        <option value="Arial, sans-serif">Arial</option>
        <option value="'Times New Roman', serif">Times New Roman</option>
        <option value="'Courier New', monospace">Courier</option>
      </select>

      <button 
        className="brutalist-border"
        onClick={() => updateOverlay({ isBold: !selectedOverlay.isBold })}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          backgroundColor: selectedOverlay.isBold ? 'var(--text-color)' : 'var(--card-bg)',
          color: selectedOverlay.isBold ? 'var(--bg-color)' : 'var(--text-color)',
          cursor: 'pointer'
        }}
        title="Bold"
      >
        <Bold size={18} />
      </button>

      <button 
        className="brutalist-border"
        onClick={() => updateOverlay({ isItalic: !selectedOverlay.isItalic })}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          backgroundColor: selectedOverlay.isItalic ? 'var(--text-color)' : 'var(--card-bg)',
          color: selectedOverlay.isItalic ? 'var(--bg-color)' : 'var(--text-color)',
          cursor: 'pointer'
        }}
        title="Italic"
      >
        <Italic size={18} />
      </button>

      <BrutalButton onClick={handleDelete} style={{ marginLeft: 'auto', backgroundColor: '#ff3366', color: '#fff' }} title="Delete Text">
        <Trash2 size={18} />
      </BrutalButton>
    </div>
  );
};
