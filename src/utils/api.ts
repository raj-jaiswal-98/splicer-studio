export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
}

export const fetchImgflipMemes = async (): Promise<MemeTemplate[]> => {
  try {
    const response = await fetch('https://api.imgflip.com/get_memes');
    const data = await response.json();
    if (data.success) {
      return data.data.memes;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch memes:", error);
    return [];
  }
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
