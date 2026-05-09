import React, { useEffect, useState } from 'react';
import { fetchImgflipMemes } from '../../utils/api';
import { usePosterContext } from '../../context/PosterContext';
import { BrutalButton } from '../ui/BrutalButton';

const TemplateGallery = () => {
  const [allMemes, setAllMemes] = useState<any[]>([]);
  const [displayedMemes, setDisplayedMemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { setImageBitmap, setImageMetadata } = usePosterContext();

  useEffect(() => {
    const loadMemes = async () => {
      setLoading(true);
      try {
        const data = await fetchImgflipMemes();
        setAllMemes(data);
        setDisplayedMemes(data.slice(0, 10)); // Get top 10 initially
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadMemes();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (displayedMemes.length < allMemes.length) {
        // Load 10 more
        const nextBatch = allMemes.slice(displayedMemes.length, displayedMemes.length + 10);
        setDisplayedMemes(prev => [...prev, ...nextBatch]);
      }
    }
  };

  const handleSelectTemplate = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const bitmap = await window.createImageBitmap(blob);
      setImageBitmap(bitmap);
      setImageMetadata({
        filename: name,
        fileSize: blob.size,
        width: bitmap.width,
        height: bitmap.height
      });
    } catch (err) {
      console.error("Failed to load template", err);
      alert("Failed to load template image. This might be a CORS issue.");
    }
  };

  return (
    <div className="brutalist-card" style={{ height: '100%', overflowY: 'auto' }} onScroll={handleScroll}>
      <h2 style={{ marginBottom: '1rem' }}>Templates</h2>
      {loading && <p style={{ fontWeight: 'bold' }}>Loading templates...</p>}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {displayedMemes.map((meme) => (
          <div 
            key={meme.id} 
            className="brutalist-border" 
            style={{ padding: '0.25rem', cursor: 'pointer', transition: 'transform 0.1s ease', backgroundColor: 'var(--card-bg)' }} 
            onClick={() => handleSelectTemplate(meme.url, meme.name)}
            title={meme.name}
          >
            <img src={meme.url} alt={meme.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        ))}
      </div>
      {displayedMemes.length > 0 && displayedMemes.length < allMemes.length && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <BrutalButton onClick={() => {
            const nextBatch = allMemes.slice(displayedMemes.length, displayedMemes.length + 10);
            setDisplayedMemes(prev => [...prev, ...nextBatch]);
          }}>Load More</BrutalButton>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
