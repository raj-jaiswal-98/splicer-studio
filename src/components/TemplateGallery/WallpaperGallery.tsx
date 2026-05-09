import React, { useState, useEffect } from 'react';
import { fetchRedditWallpapers, Wallpaper } from '../../utils/api';
import { usePosterContext } from '../../context/PosterContext';
import { BrutalButton } from '../ui/BrutalButton';
import { Search, Image as ImageIcon } from 'lucide-react';

const TRENDING_TAGS = ['Cyberpunk', 'Nature', 'Minimalist', 'Abstract', 'Space', 'Architecture'];

const WallpaperGallery = () => {
  const { setImageBitmap, setImageMetadata } = usePosterContext();
  
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [afterToken, setAfterToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWallpapers = async (reset: boolean = false, searchQuery: string = activeQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentAfter = reset ? null : afterToken;
      const { wallpapers: newWallpapers, after: newAfter } = await fetchRedditWallpapers(searchQuery, currentAfter);

      setWallpapers(prev => reset ? newWallpapers : [...prev, ...newWallpapers]);
      setAfterToken(newAfter);
    } catch (err: any) {
      console.error('Failed to load wallpapers', err);
      setError('Failed to load wallpapers from Reddit. This can happen due to rate limiting or CORS issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallpapers(true, activeQuery);
  }, [activeQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(query);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    setActiveQuery(tag);
  };

  const handleSelectWallpaper = async (wallpaper: Wallpaper) => {
    try {
      const response = await fetch(wallpaper.url);
      const blob = await response.blob();
      const bitmap = await window.createImageBitmap(blob);
      setImageBitmap(bitmap);
      setImageMetadata({
        filename: wallpaper.title,
        fileSize: blob.size,
        width: bitmap.width,
        height: bitmap.height
      });
    } catch (err) {
      console.error('Failed to load full image:', err);
      alert('Could not load the high-resolution image. This may be due to CORS restrictions on the source image.');
    }
  };

  return (
    <div className="brutalist-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Wallpaper Studio</h2>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            className="brutalist-border"
            placeholder="Search Reddit wallpapers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
          />
          <BrutalButton type="submit">
            <Search size={20} />
          </BrutalButton>
        </form>

        {/* Trending Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {TRENDING_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="brutalist-border"
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                backgroundColor: activeQuery === tag ? 'var(--text-color)' : 'var(--panel-bg)',
                color: activeQuery === tag ? 'var(--bg-color)' : 'var(--text-color)',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {tag}
            </button>
          ))}
          {activeQuery && (
            <button
              onClick={() => handleTagClick('')}
              className="brutalist-border"
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                backgroundColor: '#ff3366',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="brutalist-border" style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--panel-bg)', padding: '0.5rem' }}>
        {error ? (
          <div style={{ padding: '1rem', color: '#ff3366', fontWeight: 'bold', textAlign: 'center' }}>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {wallpapers.map((wp) => (
                <div 
                  key={wp.id}
                  onClick={() => handleSelectWallpaper(wp)}
                  className="brutalist-shadow brutalist-border"
                  style={{ 
                    cursor: 'pointer',
                    overflow: 'hidden',
                    aspectRatio: '2/3',
                    backgroundColor: 'var(--card-bg)',
                    position: 'relative'
                  }}
                  title={wp.title}
                >
                  <img 
                    src={wp.thumbnail} 
                    alt={wp.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            
            {wallpapers.length > 0 && afterToken && (
              <BrutalButton 
                onClick={() => loadWallpapers(false)} 
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </BrutalButton>
            )}

            {loading && wallpapers.length === 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', opacity: 0.5 }}>
                <ImageIcon className="animate-pulse" size={48} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WallpaperGallery;
