export interface Wallpaper {
  id: string;
  url: string; // The high resolution URL for downloading/canvas
  thumbnail: string; // The low resolution URL for the gallery
  title: string;
  source: 'reddit';
}

export const fetchRedditWallpapers = async (query: string = '', after: string | null = null): Promise<{ wallpapers: Wallpaper[], after: string | null }> => {
  let endpoint = '';
  
  if (query) {
    // Search within r/wallpapers and r/EarthPorn via Vite proxy
    endpoint = `/reddit-api/r/wallpapers+EarthPorn/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=hot&limit=20`;
  } else {
    // Default hot trending wallpapers via Vite proxy
    endpoint = `/reddit-api/r/wallpapers/hot.json?limit=20`;
  }

  if (after) {
    endpoint += `&after=${after}`;
  }

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error('Failed to fetch from Reddit via Vite Proxy');

  const data = await response.json();
  const children = data.data.children;
  const newAfter = data.data.after;

  const wallpapers: Wallpaper[] = [];

  for (const child of children) {
    const post = child.data;
    if (post.is_video || !post.url) continue;

    // Only accept direct image links
    if (post.url.match(/\.(jpeg|jpg|png)$/i) || post.url.includes('i.redd.it')) {
      
      let thumbnail = post.url;
      if (post.preview && post.preview.images && post.preview.images[0].resolutions.length > 0) {
        const resolutions = post.preview.images[0].resolutions;
        const midRes = resolutions[Math.min(2, resolutions.length - 1)];
        thumbnail = midRes.url.replace(/&amp;/g, '&');
      }

      // Route i.redd.it links through our Vite image proxy so the Canvas can fetch them without CORS
      let proxiedUrl = post.url.replace(/&amp;/g, '&');
      if (proxiedUrl.startsWith('https://i.redd.it')) {
        proxiedUrl = proxiedUrl.replace('https://i.redd.it', '/reddit-image');
      }

      wallpapers.push({
        id: post.id,
        url: proxiedUrl,
        thumbnail: thumbnail, // img tags ignore CORS, so we can keep the direct link for thumbnails
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
