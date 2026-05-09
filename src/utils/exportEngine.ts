import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { calculateSlices, PaperSize } from './canvasEngine';
import { TextOverlay, ImageFitMode, ImageOverlay } from '../context/PosterContext';

// Utility to create a blob for a specific slice to manage memory effectively
const createSliceBlob = async (
  imageBitmap: ImageBitmap,
  sliceConfig: any,
  targetWidth: number,
  targetHeight: number,
  textOverlays: TextOverlay[],
  imageOverlays: ImageOverlay[],
  imageFit: ImageFitMode
): Promise<Blob> => {
  let canvas: OffscreenCanvas | HTMLCanvasElement;
  let ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(targetWidth, targetHeight);
    ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  } else {
    canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx = canvas.getContext('2d');
  }

  if (!ctx) throw new Error('Could not get canvas context');

  // Fill white background in case of 'contain' where image doesn't fill canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  if (imageFit === 'contain-blur') {
    // Draw blurred "cover" background using precise calculated coordinates
    ctx.filter = 'blur(40px) brightness(0.8)';
    ctx.drawImage(
      imageBitmap, 
      sliceConfig.bgLocalX, 
      sliceConfig.bgLocalY, 
      sliceConfig.bgLocalW, 
      sliceConfig.bgLocalH
    );
    ctx.filter = 'none'; // reset
  }

  // Draw the image using the local coordinates calculated by canvasEngine
  ctx.drawImage(
    imageBitmap,
    sliceConfig.localX,
    sliceConfig.localY,
    sliceConfig.localW,
    sliceConfig.localH
  );

  // Draw floating Image Overlays
  const sortedImageOverlays = [...imageOverlays].sort((a, b) => a.zIndex - b.zIndex);
  sortedImageOverlays.forEach(overlay => {
    ctx!.save();
    
    const sliceX = (overlay.x * sliceConfig.textScaleX) + sliceConfig.textOffsetX;
    const sliceY = (overlay.y * sliceConfig.textScaleY) + sliceConfig.textOffsetY;
    
    ctx!.translate(sliceX, sliceY);
    ctx!.rotate((overlay.rotation * Math.PI) / 180);
    ctx!.scale(overlay.scale * sliceConfig.textScaleX, overlay.scale * sliceConfig.textScaleY);
    ctx!.globalAlpha = overlay.opacity;
    
    const imgWidth = overlay.imageBitmap.width;
    const imgHeight = overlay.imageBitmap.height;
    ctx!.drawImage(
      overlay.imageBitmap,
      -imgWidth / 2,
      -imgHeight / 2,
      imgWidth,
      imgHeight
    );
    
    ctx!.restore();
  });

  // Draw Text Overlays using the pre-calculated text scale and offsets
  textOverlays.forEach(text => {
    const sliceX = (text.x * sliceConfig.textScaleX) + sliceConfig.textOffsetX;
    const sliceY = (text.y * sliceConfig.textScaleY) + sliceConfig.textOffsetY;
    
    // Calculate font style string
    const fontStyle = text.isItalic ? 'italic' : 'normal';
    const fontWeight = text.isBold ? 'bold' : 'normal';
    const fontFamily = text.fontFamily || 'Space Grotesk';
    
    ctx!.font = `${fontStyle} ${fontWeight} ${text.fontSize * sliceConfig.textScaleX}px ${fontFamily}, sans-serif`;
    ctx!.fillStyle = text.color;
    ctx!.textAlign = 'center';
    ctx!.textBaseline = 'middle';
    
    // Brutalist shadow/outline
    ctx!.shadowColor = '#000000';
    ctx!.shadowBlur = 4;
    ctx!.shadowOffsetX = 2;
    ctx!.shadowOffsetY = 2;
    
    ctx!.strokeStyle = '#000';
    ctx!.lineWidth = (text.fontSize * sliceConfig.textScaleX) * 0.05;
    ctx!.strokeText(text.text, sliceX, sliceY);
    ctx!.fillText(text.text, sliceX, sliceY);
  });

  let blob: Blob;
  if (canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas to Blob failed'));
      }, 'image/jpeg', 0.95);
    });
  }

  canvas.width = 0;
  canvas.height = 0;
  
  return blob;
};

export const exportToZip = async (
  imageBitmap: ImageBitmap,
  gridCols: number,
  gridRows: number,
  paperSize: PaperSize,
  bleedMm: number,
  textOverlays: TextOverlay[],
  imageOverlays: ImageOverlay[],
  imageFit: ImageFitMode,
  imageZoom: number,
  imagePan: { x: number; y: number },
  onProgress?: (progress: number) => void
): Promise<void> => {
  const { slices, targetWidth, targetHeight } = calculateSlices(
    imageBitmap.width,
    imageBitmap.height,
    gridCols,
    gridRows,
    paperSize,
    bleedMm,
    imageFit,
    imageZoom,
    imagePan
  );

  const zip = new JSZip();
  let completed = 0;

  for (const slice of slices) {
    const blob = await createSliceBlob(imageBitmap, slice, targetWidth, targetHeight, textOverlays, imageOverlays, imageFit);
    // Name the file dynamically based on its row and column
    zip.file(`slice_${slice.row + 1}_${slice.col + 1}.jpg`, blob);
    
    completed++;
    if (onProgress) onProgress((completed / slices.length) * 100);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  // Trigger download natively
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'poster_slices.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToPdf = async (
  imageBitmap: ImageBitmap,
  gridCols: number,
  gridRows: number,
  paperSize: PaperSize,
  bleedMm: number,
  textOverlays: TextOverlay[],
  imageOverlays: ImageOverlay[],
  imageFit: ImageFitMode,
  imageZoom: number,
  imagePan: { x: number; y: number },
  onProgress?: (progress: number) => void
): Promise<void> => {
  const { slices, targetWidth, targetHeight } = calculateSlices(
    imageBitmap.width,
    imageBitmap.height,
    gridCols,
    gridRows,
    paperSize,
    bleedMm,
    imageFit,
    imageZoom,
    imagePan
  );

  // Setup jsPDF. By using 'px' as the unit and the exact target dimensions,
  // we ensure the image fills the PDF page flawlessly.
  const pdf = new jsPDF({
    orientation: targetWidth > targetHeight ? 'landscape' : 'portrait',
    unit: 'px',
    format: [targetWidth, targetHeight]
  });

  let completed = 0;

  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i];
    
    // Add a new page for every slice EXCEPT the first one
    if (i > 0) pdf.addPage([targetWidth, targetHeight]);
    
    const blob = await createSliceBlob(imageBitmap, slice, targetWidth, targetHeight, textOverlays, imageOverlays, imageFit);
    
    // Convert blob to Uint8Array which jsPDF can consume natively
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    pdf.addImage(uint8Array, 'JPEG', 0, 0, targetWidth, targetHeight);
    
    completed++;
    if (onProgress) onProgress((completed / slices.length) * 100);
  }

  pdf.save('poster_slices.pdf');
};

export const printPdf = async (
  imageBitmap: ImageBitmap,
  gridCols: number,
  gridRows: number,
  paperSize: PaperSize,
  bleedMm: number,
  textOverlays: TextOverlay[],
  imageOverlays: ImageOverlay[],
  imageFit: ImageFitMode,
  imageZoom: number,
  imagePan: { x: number; y: number },
  onProgress?: (progress: number) => void
): Promise<void> => {
  const { slices, targetWidth, targetHeight } = calculateSlices(
    imageBitmap.width,
    imageBitmap.height,
    gridCols,
    gridRows,
    paperSize,
    bleedMm,
    imageFit,
    imageZoom,
    imagePan
  );

  const pdf = new jsPDF({
    orientation: targetWidth > targetHeight ? 'landscape' : 'portrait',
    unit: 'px',
    format: [targetWidth, targetHeight]
  });

  let completed = 0;

  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i];
    if (i > 0) pdf.addPage([targetWidth, targetHeight]);
    
    const blob = await createSliceBlob(imageBitmap, slice, targetWidth, targetHeight, textOverlays, imageOverlays, imageFit);
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    pdf.addImage(uint8Array, 'JPEG', 0, 0, targetWidth, targetHeight);
    
    completed++;
    if (onProgress) onProgress((completed / slices.length) * 100);
  }

  pdf.autoPrint();
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

export const downloadWholeImage = async (
  imageBitmap: ImageBitmap,
  textOverlays: TextOverlay[],
  imageOverlays: ImageOverlay[]
): Promise<void> => {
  let canvas: OffscreenCanvas | HTMLCanvasElement;
  let ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  } else {
    canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    ctx = canvas.getContext('2d');
  }

  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(imageBitmap, 0, 0);

  // Draw floating Image Overlays
  const sortedImageOverlays = [...imageOverlays].sort((a, b) => a.zIndex - b.zIndex);
  sortedImageOverlays.forEach(overlay => {
    ctx!.save();
    ctx!.translate(overlay.x, overlay.y);
    ctx!.rotate((overlay.rotation * Math.PI) / 180);
    ctx!.scale(overlay.scale, overlay.scale);
    ctx!.globalAlpha = overlay.opacity;
    
    const imgWidth = overlay.imageBitmap.width;
    const imgHeight = overlay.imageBitmap.height;
    ctx!.drawImage(
      overlay.imageBitmap,
      -imgWidth / 2,
      -imgHeight / 2,
      imgWidth,
      imgHeight
    );
    ctx!.restore();
  });

  // Draw Text Overlays
  textOverlays.forEach(text => {
    ctx!.save();
    
    // Calculate font style string
    const fontStyle = text.isItalic ? 'italic' : 'normal';
    const fontWeight = text.isBold ? 'bold' : 'normal';
    const fontFamily = text.fontFamily || 'Space Grotesk';
    
    ctx!.font = `${fontStyle} ${fontWeight} ${text.fontSize}px ${fontFamily}, sans-serif`;
    ctx!.fillStyle = text.color;
    ctx!.textAlign = 'center';
    ctx!.textBaseline = 'middle';
    
    // Add text shadow for visibility (similar to preview)
    ctx!.shadowColor = '#000000';
    ctx!.shadowBlur = 4;
    ctx!.shadowOffsetX = 2;
    ctx!.shadowOffsetY = 2;
    
    ctx!.fillText(text.text, text.x, text.y);
    ctx!.restore();
  });

  let blob: Blob;
  if (canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas to Blob failed'));
      }, 'image/jpeg', 0.95);
    });
  }

  canvas.width = 0;
  canvas.height = 0;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'full_poster_export.jpg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
