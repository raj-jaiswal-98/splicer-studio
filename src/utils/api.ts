export interface Wallpaper {
  id: string;
  url: string; // The high resolution URL for downloading/canvas
  thumbnail: string; // The low resolution URL for the gallery
  title: string;
  source: 'reddit';
}

export const fetchRedditWallpapers = async (query: string = '', after: string | null = null): Promise<{ wallpapers: Wallpaper[], after: string | null }> => {
  const isDev = import.meta.env.DEV;
  // Use a public CORS proxy for both API and Images in production
  const API_BASE = isDev ? '/reddit-api' : 'https://corsproxy.io/?https://www.reddit.com';
  const IMAGE_PROXY = isDev ? '/reddit-image' : 'https://corsproxy.io/?https://i.redd.it';
  
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
        proxiedUrl = `https://corsproxy.io/?${proxiedUrl}`;
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

export interface PicsumImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

export const fetchPicsumImages = async (page = 1, limit = 20): Promise<PicsumImage[]> => {
  try {
    const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch Picsum images:", error);
    return [];
  }
};
