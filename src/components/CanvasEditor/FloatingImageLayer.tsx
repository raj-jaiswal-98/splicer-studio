import React, { useEffect, useRef } from 'react';
import { ImageOverlay } from '../../context/PosterContext';

interface FloatingImageLayerProps {
  overlay: ImageOverlay;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  displayScale: number; // to convert virtual poster coords to screen coords
  sliceTextScaleX: number;
  sliceTextScaleY: number;
  sliceTextOffsetX: number;
  sliceTextOffsetY: number;
  interactionMode: string;
  draggingId: string | null;
}

export const FloatingImageLayer: React.FC<FloatingImageLayerProps> = ({ 
  overlay, 
  isSelected, 
  onMouseDown,
  displayScale,
  sliceTextScaleX,
  sliceTextScaleY,
  sliceTextOffsetX,
  sliceTextOffsetY,
  interactionMode,
  draggingId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !overlay.imageBitmap) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution to match the actual image bitmap
    canvas.width = overlay.imageBitmap.width;
    canvas.height = overlay.imageBitmap.height;

    // Draw the image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(overlay.imageBitmap, 0, 0);
  }, [overlay.imageBitmap]);

  // Convert virtual coordinates to screen coordinates (similar to text overlays)
  const screenX = ((overlay.x * sliceTextScaleX) + sliceTextOffsetX) * displayScale;
  const screenY = ((overlay.y * sliceTextScaleY) + sliceTextOffsetY) * displayScale;

  // We must apply the overlay's scale and rotation.
  // We also scale down the physical width of the image to match the view zoom/display scale.
  // A scale of 1 means 1 poster pixel = 1 image pixel.
  const basePhysicalWidth = overlay.imageBitmap.width * sliceTextScaleX * displayScale;
  const basePhysicalHeight = overlay.imageBitmap.height * sliceTextScaleY * displayScale;

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${basePhysicalWidth}px`,
        height: `${basePhysicalHeight}px`,
        transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg) scale(${overlay.scale})`,
        opacity: overlay.opacity,
        zIndex: overlay.zIndex,
        cursor: interactionMode === 'text' ? (draggingId === overlay.id ? 'grabbing' : 'grab') : 'inherit',
        userSelect: 'none',
        outline: isSelected ? '4px dashed var(--text-color)' : 'none',
        outlineOffset: '4px',
        boxShadow: isSelected ? '0 0 0 8px rgba(255, 0, 255, 0.3)' : 'none'
      }}
    />
  );
};
