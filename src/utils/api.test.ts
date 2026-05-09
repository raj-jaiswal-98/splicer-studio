import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchImgflipMemes, fetchPicsumImages } from './api';

// Mock global fetch
globalThis.fetch = vi.fn();

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchImgflipMemes should return an array of memes on success', async () => {
    const mockMemes = [{ id: '1', name: 'Meme 1', url: 'url1', width: 100, height: 100 }];
    (globalThis.fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: true, data: { memes: mockMemes } }),
    });

    const memes = await fetchImgflipMemes();
    expect(memes).toEqual(mockMemes);
    expect(globalThis.fetch).toHaveBeenCalledWith('https://api.imgflip.com/get_memes');
  });

  it('fetchImgflipMemes should return empty array on failure', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));
    const memes = await fetchImgflipMemes();
    expect(memes).toEqual([]);
  });

  it('fetchPicsumImages should return an array of images', async () => {
    const mockImages = [{ id: '1', author: 'Author', width: 100, height: 100, url: 'url', download_url: 'd_url' }];
    (globalThis.fetch as any).mockResolvedValueOnce({
      json: async () => mockImages,
    });

    const images = await fetchPicsumImages(2, 10);
    expect(images).toEqual(mockImages);
    expect(globalThis.fetch).toHaveBeenCalledWith('https://picsum.photos/v2/list?page=2&limit=10');
  });
});
