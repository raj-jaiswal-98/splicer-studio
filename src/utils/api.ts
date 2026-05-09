export interface Wallpaper {
  id: string;
  url: string; // The high resolution URL for downloading/canvas
  thumbnail: string; // The low resolution URL for the gallery
  title: string;
  source: 'reddit';
}

export const fetchRedditWallpapers = async (query: string = '', after: string | null = null): Promise<{ wallpapers: Wallpaper[], after: string | null }> => {
  const isDev = import.meta.env.DEV;
  // Use specialized proxies for production deployment
  const API_BASE = isDev ? '/reddit-api' : 'https://api.allorigins.win/raw?url=https://www.reddit.com';
  const IMAGE_PROXY = isDev ? '/reddit-image' : 'https://images.weserv.nl/?url=https://i.redd.it';
  
  let endpoint = '';
  
  if (query) {
    endpoint = `${API_BASE}/r/wallpapers+EarthPorn/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=hot&limit=20`;
  } else {
    endpoint = `${API_BASE}/r/wallpapers/hot.json?limit=20`;
  }

  if (after) {
    endpoint += `&after=${after}`;
  }

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error('Failed to fetch from Reddit. If in production, check CORS or Rate Limits.');

  const data = await response.json();
  const children = data.data.children;
  const newAfter = data.data.after;

  const wallpapers: Wallpaper[] = [];

  for (const child of children) {
    const post = child.data;
    if (post.is_video || !post.url) continue;

    if (post.url.match(/\.(jpeg|jpg|png)$/i) || post.url.includes('i.redd.it')) {
      
      let thumbnail = post.url;
      if (post.preview && post.preview.images && post.preview.images[0].resolutions.length > 0) {
        const resolutions = post.preview.images[0].resolutions;
        const midRes = resolutions[Math.min(2, resolutions.length - 1)];
        thumbnail = midRes.url.replace(/&amp;/g, '&');
      }

      let proxiedUrl = post.url.replace(/&amp;/g, '&');
      if (proxiedUrl.startsWith('https://i.redd.it')) {
        proxiedUrl = proxiedUrl.replace('https://i.redd.it', IMAGE_PROXY);
      } else if (!isDev && proxiedUrl.startsWith('https://')) {
        // For other high-res sources in production, also try proxying
        proxiedUrl = `https://images.weserv.nl/?url=${proxiedUrl}`;
      }

      wallpapers.push({
        id: post.id,
        url: proxiedUrl,
        thumbnail: thumbnail,
        title: post.title || 'Reddit Wallpaper',
        source: 'reddit'
      });
    }
  }

  return { wallpapers, after: newAfter };
};

export interface NasaImage {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
}

export const fetchNasaImages = async (query: string = 'nebula', page: number = 1): Promise<NasaImage[]> => {
  try {
    const response = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page=${page}`);
    const data = await response.json();
    const items = data.collection.items;
    
    return items.map((item: any) => {
      const data = item.data[0];
      const links = item.links[0];
      return {
        id: data.nasa_id,
        url: `https://images.weserv.nl/?url=${encodeURIComponent(item.href.replace('collection.json', 'orig.jpg'))}`,
        thumbnail: links.href,
        title: data.title
      };
    });
  } catch (error) {
    console.error("Failed to fetch NASA images:", error);
    return [];
  }
};

export interface TvMazeImage {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
}

export const fetchTvMazeImages = async (query: string): Promise<TvMazeImage[]> => {
  try {
    const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    return data
      .filter((item: any) => item.show.image)
      .map((item: any) => {
        const show = item.show;
        return {
          id: show.id.toString(),
          url: `https://images.weserv.nl/?url=${encodeURIComponent(show.image.original)}`,
          thumbnail: show.image.medium,
          title: show.name
        };
      });
  } catch (error) {
    console.error("Failed to fetch TVMaze images:", error);
    return [];
  }
};
