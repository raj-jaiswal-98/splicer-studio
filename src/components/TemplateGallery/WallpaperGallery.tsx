import React, { useState, useEffect } from 'react';
import { fetchRedditWallpapers, fetchNasaImages, Wallpaper } from '../../utils/api';
import { usePosterContext } from '../../context/PosterContext';
import { BrutalButton } from '../ui/BrutalButton';
import { Search, Image as ImageIcon, Globe, Rocket, Layers } from 'lucide-react';

type ImageSource = 'reddit' | 'nasa' | 'picsum';

interface GalleryItem {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
}

const TRENDING_TAGS = ['Cyberpunk', 'Nature', 'Minimalist', 'Abstract', 'Space', 'Architecture'];

const WallpaperGallery = () => {
  const { setImageBitmap, setImageMetadata } = usePosterContext();
  
  const [source, setSource] = useState<ImageSource>('reddit');
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [afterToken, setAfterToken] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async (reset: boolean = false, searchQuery: string = activeQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      let newItems: GalleryItem[] = [];
      let newAfter: string | null = null;
      let currentPage = reset ? 1 : page;

      if (source === 'reddit') {
        const result = await fetchRedditWallpapers(searchQuery, reset ? null : afterToken);
        newItems = result.wallpapers;
        newAfter = result.after;
      } else if (source === 'nasa') {
        const result = await fetchNasaImages(searchQuery || 'nebula', currentPage);
        newItems = result;
        setPage(currentPage + 1);
      } else if (source === 'picsum') {
        const response = await fetch(`https://picsum.photos/v2/list?page=${currentPage}&limit=20`);
        const data = await response.json();
        newItems = data.map((d: any) => ({
          id: d.id,
          url: `https://images.weserv.nl/?url=${encodeURIComponent(d.download_url)}`,
          thumbnail: `https://picsum.photos/id/${d.id}/300/450`,
          title: `by ${d.author}`
        }));
        setPage(currentPage + 1);
      }

      setItems(prev => reset ? newItems : [...prev, ...newItems]);
      setAfterToken(newAfter);
    } catch (err: any) {
      console.error('Failed to load items', err);
      setError('Failed to load from source. This can happen due to rate limiting or CORS issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(true, activeQuery);
  }, [activeQuery, source]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(query);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    setActiveQuery(tag);
  };

  const handleSelectItem = async (item: GalleryItem) => {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const bitmap = await window.createImageBitmap(blob);
      setImageBitmap(bitmap);
      setImageMetadata({
        filename: item.title,
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Asset Gallery</h2>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setSource('reddit')}
              title="Reddit"
              style={{
                padding: '4px',
                backgroundColor: source === 'reddit' ? 'var(--text-color)' : 'transparent',
                color: source === 'reddit' ? 'var(--bg-color)' : 'inherit',
                border: '1px solid var(--text-color)',
                cursor: 'pointer'
              }}
            >
              <Globe size={16} />
            </button>
            <button 
              onClick={() => setSource('nasa')}
              title="NASA"
              style={{
                padding: '4px',
                backgroundColor: source === 'nasa' ? 'var(--text-color)' : 'transparent',
                color: source === 'nasa' ? 'var(--bg-color)' : 'inherit',
                border: '1px solid var(--text-color)',
                cursor: 'pointer'
              }}
            >
              <Rocket size={16} />
            </button>
            <button 
              onClick={() => setSource('picsum')}
              title="Picsum"
              style={{
                padding: '4px',
                backgroundColor: source === 'picsum' ? 'var(--text-color)' : 'transparent',
                color: source === 'picsum' ? 'var(--bg-color)' : 'inherit',
                border: '1px solid var(--text-color)',
                cursor: 'pointer'
              }}
            >
              <Layers size={16} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            className="brutalist-border"
            placeholder={`Search ${source === 'reddit' ? 'Reddit' : source === 'nasa' ? 'NASA' : 'Picsum'}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', fontSize: '0.8rem' }}
          />
          <BrutalButton type="submit">
            <Search size={16} />
          </BrutalButton>
        </form>

        {/* Trending Tags (Only for Reddit/NASA) */}
        {source !== 'picsum' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
            {TRENDING_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                style={{
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  backgroundColor: activeQuery === tag ? 'var(--text-color)' : 'var(--panel-bg)',
                  color: activeQuery === tag ? 'var(--bg-color)' : 'var(--text-color)',
                  border: '1px solid var(--text-color)',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="brutalist-border" style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--panel-bg)', padding: '0.5rem' }}>
        {error ? (
          <div style={{ padding: '1rem', color: '#ff3366', fontWeight: 'bold', textAlign: 'center', fontSize: '0.8rem' }}>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {items.map((item) => (
                <div 
                  key={item.id + Math.random()} // Avoid duplicate keys across sources
                  onClick={() => handleSelectItem(item)}
                  className="brutalist-shadow brutalist-border"
                  style={{ 
                    cursor: 'pointer',
                    overflow: 'hidden',
                    aspectRatio: '2/3',
                    backgroundColor: 'var(--card-bg)',
                    position: 'relative'
                  }}
                  title={item.title}
                >
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  {source === 'nasa' && (
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      backgroundColor: 'rgba(0,0,0,0.7)', 
                      color: '#fff', 
                      fontSize: '0.6rem', 
                      padding: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {items.length > 0 && (source === 'reddit' ? afterToken : true) && (
              <BrutalButton 
                onClick={() => loadItems(false)} 
                style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem' }}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </BrutalButton>
            )}

            {loading && items.length === 0 && (
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
