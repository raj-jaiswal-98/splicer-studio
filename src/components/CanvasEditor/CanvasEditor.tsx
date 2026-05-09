import React, { useRef, useEffect, useState } from 'react';
import { usePosterContext } from '../../context/PosterContext';
import { calculateSlices } from '../../utils/canvasEngine';
import { TabBar } from '../ui/TabBar';
import { FloatingImageLayer } from './FloatingImageLayer';

const CanvasEditor = () => {
  const { 
    imageBitmap, 
    gridCols, 
    gridRows, 
    paperSize, 
    bleedMm,
    textOverlays,
    setTextOverlays,
    selectedTextId,
    setSelectedTextId,
    imageOverlays,
    setImageOverlays,
    selectedImageId,
    setSelectedImageId,
    imageFit,
    imageZoom,
    setImageZoom,
    imagePan,
    setImagePan,
    interactionMode
  } = usePosterContext();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [viewZoom, setViewZoom] = useState(1);
  const [viewPan, setViewPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Wheel event must be non-passive to prevent browser scroll/zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!imageBitmap) return;
      
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      if (interactionMode === 'view') {
        setViewZoom(prev => Math.max(0.1, Math.min(10, prev * zoomFactor)));
      } else if (interactionMode === 'image') {
        setImageZoom(prev => Math.max(0.1, Math.min(10, prev * zoomFactor)));
      }
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, [imageBitmap, interactionMode, setImageZoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageBitmap) return;
    
    // Deselect text and images if clicking background
    if ((e.target as HTMLElement).tagName === 'CANVAS' || e.target === containerRef.current || e.target === workspaceRef.current) {
      setSelectedTextId(null);
      setSelectedImageId(null);
      if (interactionMode === 'view' || interactionMode === 'image') {
        setIsPanning(true);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageBitmap || !workspaceRef.current) return;

    if (isPanning) {
      if (interactionMode === 'view') {
        setViewPan(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
      } else if (interactionMode === 'image') {
        // Image pan moves the underlying image in virtual poster coordinates
        setImagePan(prev => ({ 
          x: prev.x + e.movementX / (scale * viewZoom), 
          y: prev.y + e.movementY / (scale * viewZoom) 
        }));
      }
    } else if (draggingId && interactionMode === 'text') {
      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      const rawX = e.clientX - workspaceRect.left;
      const rawY = e.clientY - workspaceRect.top;

      // Convert from screen CSS-transformed pixels to virtual canvas layout pixels
      const localX = rawX / viewZoom;
      const localY = rawY / viewZoom;

      // Convert to virtual poster coordinates
      const posterX = localX / scale;
      const posterY = localY / scale;

      // Get slice offsets to reverse-map into image source coordinates
      const { slices } = calculateSlices(imageBitmap.width, imageBitmap.height, gridCols, gridRows, paperSize, bleedMm, imageFit, imageZoom, imagePan);
      const slice = slices[0];
      if (slice) {
        const textX = (posterX - slice.textOffsetX) / slice.textScaleX;
        const textY = (posterY - slice.textOffsetY) / slice.textScaleY;

        if (selectedTextId) {
          setTextOverlays(prev => prev.map(t => 
            t.id === draggingId ? { ...t, x: textX, y: textY } : t
          ));
        } else if (selectedImageId) {
          setImageOverlays(prev => prev.map(t => 
            t.id === draggingId ? { ...t, x: textX, y: textY } : t
          ));
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingId(null);
  };

  useEffect(() => {
    if (!imageBitmap || !canvasRef.current || !containerRef.current) return;

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
      imageFit,
      imageZoom,
      imagePan
    );

    const posterWidth = targetWidth * gridCols;
    const posterHeight = targetHeight * gridRows;

    const containerWidth = containerRef.current.clientWidth;
    const currentScale = containerWidth / posterWidth;
    setScale(currentScale);
    
    canvas.width = posterWidth * currentScale;
    canvas.height = posterHeight * currentScale;

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

  }, [imageBitmap, gridCols, gridRows, paperSize, bleedMm, imageFit, imageZoom, imagePan]);

  return (
    <div className="brutalist-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
      <TabBar />

      <div 
        ref={containerRef}
        style={{ 
          flex: 1, 
          backgroundColor: 'var(--panel-bg)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          cursor: interactionMode === 'view' || interactionMode === 'image' ? (isPanning ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {!imageBitmap ? (
          <div style={{ textAlign: 'center', opacity: 0.5 }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Empty Canvas</p>
            <p>Set a Background image from the top toolbar or select a wallpaper.</p>
          </div>
        ) : (
          <div 
            ref={workspaceRef}
            style={{ 
              position: 'relative',
              transform: `translate(${viewPan.x}px, ${viewPan.y}px) scale(${viewZoom})`,
              transformOrigin: 'center center',
              willChange: 'transform'
            }}
          >
            <canvas 
              ref={canvasRef} 
              className="brutalist-shadow"
              style={{ 
                display: 'block',
                backgroundColor: '#fff'
              }} 
            />
            {(() => {
              const { slices, targetWidth, targetHeight } = calculateSlices(imageBitmap.width, imageBitmap.height, gridCols, gridRows, paperSize, bleedMm, imageFit, imageZoom, imagePan);
              const slice = slices[0];
              if(!slice) return null;
              
              const posterWidth = targetWidth * gridCols;
              const displayScale = containerRef.current!.clientWidth / posterWidth;
              
              return (
                <>
                  {/* Render Image Overlays */}
                  {imageOverlays.map(overlay => (
                    <FloatingImageLayer 
                      key={overlay.id}
                      overlay={overlay}
                      isSelected={selectedImageId === overlay.id}
                      onMouseDown={(e) => {
                        if (interactionMode === 'text') {
                          setDraggingId(overlay.id);
                          setSelectedImageId(overlay.id);
                          setSelectedTextId(null);
                          e.stopPropagation();
                        } else {
                          setSelectedImageId(overlay.id);
                          setSelectedTextId(null);
                        }
                      }}
                      displayScale={displayScale}
                      sliceTextScaleX={slice.textScaleX}
                      sliceTextScaleY={slice.textScaleY}
                      sliceTextOffsetX={slice.textOffsetX}
                      sliceTextOffsetY={slice.textOffsetY}
                      interactionMode={interactionMode}
                      draggingId={draggingId}
                    />
                  ))}
                  
                  {/* Render Text Overlays */}
                  {textOverlays.map(text => {
                    const screenX = ((text.x * slice.textScaleX) + slice.textOffsetX) * displayScale;
                    const screenY = ((text.y * slice.textScaleY) + slice.textOffsetY) * displayScale;
                    const screenFontSize = text.fontSize * slice.textScaleX * displayScale;
                    
                    return (
                      <div
                        key={text.id}
                        onMouseDown={(e) => {
                          if (interactionMode === 'text') {
                            setDraggingId(text.id);
                            setSelectedTextId(text.id);
                            setSelectedImageId(null);
                            e.stopPropagation();
                          } else {
                            setSelectedTextId(text.id);
                            setSelectedImageId(null);
                          }
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
                          cursor: interactionMode === 'text' ? (draggingId === text.id ? 'grabbing' : 'grab') : 'inherit',
                          userSelect: 'none',
                          textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                          padding: '10px',
                          border: selectedTextId === text.id ? '2px dashed var(--text-color)' : '2px dashed transparent',
                          zIndex: 999 // Ensure text is always on top of images
                        }}
                      >
                        {text.text}
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasEditor;
