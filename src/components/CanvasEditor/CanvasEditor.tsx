import React, { useRef, useEffect, ChangeEvent, useState } from 'react';
import { usePosterContext } from '../../context/PosterContext';
import { calculateSlices } from '../../utils/canvasEngine';
import { Upload, Type } from 'lucide-react';

const CanvasEditor = () => {
  const { 
    imageBitmap, 
    setImageBitmap, 
    setImageMetadata,
    gridCols, 
    gridRows, 
    paperSize, 
    bleedMm,
    textOverlays,
    setTextOverlays,
    selectedTextId,
    setSelectedTextId,
    imageFit
  } = usePosterContext();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // ... (keep handleFileUpload, handleAddText, etc.) ...
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`[CanvasEditor] File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    try {
      console.log(`[CanvasEditor] Creating ImageBitmap...`);
      const bitmap = await window.createImageBitmap(file);
      console.log(`[CanvasEditor] ImageBitmap created! Resolution: ${bitmap.width}x${bitmap.height}`);
      setImageBitmap(bitmap);
      setImageMetadata({
        filename: file.name,
        fileSize: file.size,
        width: bitmap.width,
        height: bitmap.height
      });
    } catch (err) {
      console.error("[CanvasEditor] Failed to load image", err);
      alert("Could not load image file.");
    }
  };

  const handleAddText = () => {
    if (!imageBitmap) return;
    const newOverlay = {
      id: Math.random().toString(36).substr(2, 9),
      text: "EDIT ME",
      x: imageBitmap.width / 2,
      y: imageBitmap.height / 2,
      fontSize: imageBitmap.width * 0.05,
      color: '#ff00ff',
      fontFamily: 'var(--font-main)',
      isBold: true,
      isItalic: false
    };
    setTextOverlays([...textOverlays, newOverlay]);
    setSelectedTextId(newOverlay.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !imageBitmap || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTextOverlays(prev => prev.map(t => 
      t.id === draggingId ? { ...t, x: x / scale, y: y / scale } : t
    ));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // If we click directly on the container (not on a text overlay), deselect text
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'CANVAS') {
      setSelectedTextId(null);
    }
  };

  useEffect(() => {
    if (!imageBitmap || !canvasRef.current || !containerRef.current) return;

    console.log(`[CanvasEditor] Rendering canvas preview... Grid: ${gridCols}x${gridRows}, Fit: ${imageFit}`);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { slices, targetWidth, targetHeight } = calculateSlices(
      imageBitmap.width,
      imageBitmap.height,
      gridCols,
      gridRows,
      paperSize,
      bleedMm,
      imageFit
    );

    console.log(`[CanvasEditor] Slices calculated. Total slices: ${slices.length}`);

    // The virtual poster pixel dimensions
    const posterWidth = targetWidth * gridCols;
    const posterHeight = targetHeight * gridRows;

    const containerWidth = containerRef.current.clientWidth;
    // Scale the virtual poster to fit inside the container
    const currentScale = containerWidth / posterWidth;
    setScale(currentScale);
    
    canvas.width = posterWidth * currentScale;
    canvas.height = posterHeight * currentScale;

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    slices.forEach((slice) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(slice.col * targetWidth * currentScale, slice.row * targetHeight * currentScale, targetWidth * currentScale, targetHeight * currentScale);
      ctx.clip();
      
      if (imageFit === 'contain-blur') {
        ctx.filter = 'blur(20px) brightness(0.8)';
        ctx.drawImage(
          imageBitmap, 
          (slice.bgLocalX + slice.col * targetWidth) * currentScale, 
          (slice.bgLocalY + slice.row * targetHeight) * currentScale, 
          slice.bgLocalW * currentScale, 
          slice.bgLocalH * currentScale
        );
        ctx.filter = 'none';
      }

      ctx.drawImage(
        imageBitmap, 
        (slice.localX + slice.col * targetWidth) * currentScale, 
        (slice.localY + slice.row * targetHeight) * currentScale, 
        slice.localW * currentScale, 
        slice.localH * currentScale
      );
      
      ctx.strokeStyle = '#ff00ff'; 
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(slice.col * targetWidth * currentScale, slice.row * targetHeight * currentScale, targetWidth * currentScale, targetHeight * currentScale);
      
      ctx.restore();
    });

  }, [imageBitmap, gridCols, gridRows, paperSize, bleedMm, imageFit]);

  return (
    <div className="brutalist-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Canvas Editor</h2>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {imageBitmap && (
            <button className="brutalist-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleAddText}>
              <Type size={20} />
              Add Text
            </button>
          )}
          {!imageBitmap && (
            <label className="brutalist-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Upload size={20} />
              Upload Image
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
              />
            </label>
          )}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="brutalist-border" 
        style={{ 
          flex: 1, 
          backgroundColor: 'var(--panel-bg)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleContainerClick}
      >
        {!imageBitmap ? (
          <p style={{ fontWeight: 'bold', opacity: 0.5 }}>No Image Loaded</p>
        ) : (
          <>
            <canvas 
              ref={canvasRef} 
              className="brutalist-shadow"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                backgroundColor: '#fff'
              }} 
            />
            {/* Render Text Overlays. Note: scale here refers to the scale between the original image and the preview, which requires using the first slice's textScale properties */}
            {(() => {
              // Get the text scale factors
              const { slices, targetWidth, targetHeight } = calculateSlices(imageBitmap.width, imageBitmap.height, gridCols, gridRows, paperSize, bleedMm, imageFit);
              const slice = slices[0];
              if(!slice) return null;
              
              const posterWidth = targetWidth * gridCols;
              const displayScale = containerRef.current!.clientWidth / posterWidth;
              
              return textOverlays.map(text => {
                const screenX = ((text.x * slice.textScaleX) + slice.textOffsetX) * displayScale;
                const screenY = ((text.y * slice.textScaleY) + slice.textOffsetY) * displayScale;
                const screenFontSize = text.fontSize * slice.textScaleX * displayScale;
                
                return (
                  <div
                    key={text.id}
                    onMouseDown={(e) => {
                      setDraggingId(text.id);
                      setSelectedTextId(text.id);
                      e.stopPropagation(); // prevent background deselect
                    }}
                    style={{
                      position: 'absolute',
                      left: `${screenX}px`,
                      top: `${screenY}px`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${screenFontSize}px`,
                      color: text.color,
                      fontFamily: text.fontFamily,
                      fontStyle: text.isItalic ? 'italic' : 'normal',
                      fontWeight: text.isBold ? 'bold' : 'normal',
                      cursor: draggingId === text.id ? 'grabbing' : 'grab',
                      userSelect: 'none',
                      textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                      padding: '10px',
                      border: selectedTextId === text.id ? '2px dashed var(--text-color)' : '2px dashed transparent'
                    }}
                  >
                    {text.text}
                  </div>
                );
              });
            })()}
          </>
        )}
      </div>
    </div>
  );
};

export default CanvasEditor;
