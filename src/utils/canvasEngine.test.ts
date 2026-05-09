import { describe, it, expect } from 'vitest';
import { calculateSlices, PAPER_DIMENSIONS_300DPI } from './canvasEngine';

describe('canvasEngine', () => {
  it('should correctly calculate slices for a 2x2 grid without bleed', () => {
    const result = calculateSlices(1000, 1000, 2, 2, 'A4', 0);

    expect(result.targetWidth).toBe(PAPER_DIMENSIONS_300DPI['A4'].width);
    expect(result.targetHeight).toBe(PAPER_DIMENSIONS_300DPI['A4'].height);
    expect(result.slices).toHaveLength(4);

    // Top-left slice
    expect(result.slices[0].col).toBe(0);
    expect(result.slices[0].row).toBe(0);
    expect(result.slices[0].localX).toBe(0);
    expect(result.slices[0].localY).toBe(0);
    expect(result.slices[0].localW).toBe(2480 * 2); // default stretch
    expect(result.slices[0].localH).toBe(3508 * 2); // default stretch
  });

  it('should apply bleed margins correctly', () => {
    // 1mm bleed = 11.81 pixels
    const bleedMm = 1;
    const bleedPx = 11.81;
    const result = calculateSlices(1000, 1000, 2, 2, 'A4', bleedMm);

    // The second column slice (col=1) should have its localX offset by +bleedPx
    expect(result.slices[1].localX).toBeCloseTo(-2480 + bleedPx);
  });
});
