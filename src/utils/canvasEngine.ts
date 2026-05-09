import { ImageFitMode } from '../context/PosterContext';

export type PaperSize = 'A3' | 'A4' | 'A5' | 'A6' | 'Letter' | 'Legal' | 'Tabloid';

export const PAPER_DIMENSIONS_300DPI = {
  'A3': { width: 3508, height: 4960 },
  'A4': { width: 2480, height: 3508 },
  'A5': { width: 1748, height: 2480 },
  'A6': { width: 1240, height: 1748 },
  'Letter': { width: 2550, height: 3300 },
  'Legal': { width: 2550, height: 4200 },
  'Tabloid': { width: 3300, height: 5100 },
};

export const calculateSlices = (
  imageWidth: number,
  imageHeight: number,
  gridCols: number,
  gridRows: number,
  paperSize: PaperSize,
  bleedMm: number,
  imageFit: ImageFitMode = 'stretch',
  imageZoom: number = 1,
  imagePan: { x: number; y: number } = { x: 0, y: 0 }
) => {
  const pixelsPerMm = 11.81;
  const bleedPixels = bleedMm * pixelsPerMm;

  const targetWidth = PAPER_DIMENSIONS_300DPI[paperSize].width;
  const targetHeight = PAPER_DIMENSIONS_300DPI[paperSize].height;

  const posterWidth = gridCols * targetWidth;
  const posterHeight = gridRows * targetHeight;

  let scaleX = posterWidth / imageWidth;
  let scaleY = posterHeight / imageHeight;
  let drawX = 0;
  let drawY = 0;

  if (imageFit === 'contain' || imageFit === 'contain-blur') {
    const scale = Math.min(posterWidth / imageWidth, posterHeight / imageHeight);
    scaleX = scale;
    scaleY = scale;
    drawX = (posterWidth - imageWidth * scale) / 2;
    drawY = (posterHeight - imageHeight * scale) / 2;
  } else if (imageFit === 'cover') {
    const scale = Math.max(posterWidth / imageWidth, posterHeight / imageHeight);
    scaleX = scale;
    scaleY = scale;
    drawX = (posterWidth - imageWidth * scale) / 2;
    drawY = (posterHeight - imageHeight * scale) / 2;
  } else if (imageFit === 'fit-width') {
    const scale = posterWidth / imageWidth;
    scaleX = scale;
    scaleY = scale;
    drawX = 0;
    drawY = (posterHeight - imageHeight * scale) / 2;
  } else if (imageFit === 'fit-height') {
    const scale = posterHeight / imageHeight;
    scaleX = scale;
    scaleY = scale;
    drawX = (posterWidth - imageWidth * scale) / 2;
    drawY = 0;
  }

  // Apply Image Pan and Zoom
  const prevWidth = imageWidth * scaleX;
  const prevHeight = imageHeight * scaleY;
  
  scaleX *= imageZoom;
  scaleY *= imageZoom;
  
  const newWidth = imageWidth * scaleX;
  const newHeight = imageHeight * scaleY;
  
  // Center the zoom relative to the original fit bounding box
  drawX -= (newWidth - prevWidth) / 2;
  drawY -= (newHeight - prevHeight) / 2;
  
  drawX += imagePan.x;
  drawY += imagePan.y;

  let bgScaleX = scaleX;
  let bgScaleY = scaleY;
  let bgDrawX = drawX;
  let bgDrawY = drawY;

  if (imageFit === 'contain-blur') {
    // Add a 10% overflow buffer to prevent the white blur vignette at the edges
    const overflowFactor = 1.1;
    const scale = Math.max(posterWidth / imageWidth, posterHeight / imageHeight) * overflowFactor;
    bgScaleX = scale;
    bgScaleY = scale;
    bgDrawX = (posterWidth - imageWidth * scale) / 2;
    bgDrawY = (posterHeight - imageHeight * scale) / 2;
  }

  const slices = [];

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      // The viewport this piece of paper represents in the virtual poster
      const viewportX = col * targetWidth;
      const viewportY = row * targetHeight;

      // To handle bleed, we effectively "expand" the viewport window slightly,
      // which means the image is drawn shifted in the opposite direction.
      let bx = 0;
      let by = 0;
      if (col > 0) bx -= bleedPixels;
      if (row > 0) by -= bleedPixels;

      // Calculate where the image should be drawn relative to this specific canvas slice
      const localX = (drawX - viewportX) - bx;
      const localY = (drawY - viewportY) - by;
      const localW = imageWidth * scaleX;
      const localH = imageHeight * scaleY;

      // Background coordinates for contain-blur
      const bgLocalX = (bgDrawX - viewportX) - bx;
      const bgLocalY = (bgDrawY - viewportY) - by;
      const bgLocalW = imageWidth * bgScaleX;
      const bgLocalH = imageHeight * bgScaleY;

      slices.push({
        col,
        row,
        localX,
        localY,
        localW,
        localH,
        bgLocalX,
        bgLocalY,
        bgLocalW,
        bgLocalH,
        // Calculate the scale multiplier for text overlays so they map 1:1 with the source image
        textScaleX: scaleX,
        textScaleY: scaleY,
        textOffsetX: drawX - viewportX - bx,
        textOffsetY: drawY - viewportY - by
      });
    }
  }

  return {
    targetWidth,
    targetHeight,
    slices
  };
};
