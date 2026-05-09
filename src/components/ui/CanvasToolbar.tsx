import { ChangeEvent } from 'react';
import { usePosterContext, ImageOverlay } from '../../context/PosterContext';
import { Upload, Type, Move, Image as ImageIcon, MousePointer2, Layers } from 'lucide-react';
import { BrutalButton } from './BrutalButton';

export const CanvasToolbar = () => {
  const { 
    imageBitmap, 
    setImageBitmap, 
    setImageMetadata,
    textOverlays,
    setTextOverlays,
    setSelectedTextId,
    imageOverlays,
    setImageOverlays,
    setSelectedImageId,
    interactionMode,
    setInteractionMode,
    setImageZoom,
    setImagePan
  } = usePosterContext();

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const bitmap = await window.createImageBitmap(file);
      setImageBitmap(bitmap);
      setImageMetadata({
        filename: file.name,
        fileSize: file.size,
        width: bitmap.width,
        height: bitmap.height
      });
      setImageZoom(1);
      setImagePan({ x: 0, y: 0 });
    } catch (err) {
      console.error("[CanvasEditor] Failed to load image", err);
      alert("Could not load image file.");
    }
  };

  const handleAddImageLayer = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imageBitmap) return;

    try {
      const bitmap = await window.createImageBitmap(file);
      const newOverlay: ImageOverlay = {
        id: Math.random().toString(36).substr(2, 9),
        imageBitmap: bitmap,
        metadata: {
          filename: file.name,
          fileSize: file.size,
          width: bitmap.width,
          height: bitmap.height
        },
        x: imageBitmap.width / 2,
        y: imageBitmap.height / 2,
        scale: 1,
        rotation: 0,
        opacity: 1,
        zIndex: imageOverlays.length
      };
      setImageOverlays([...imageOverlays, newOverlay]);
      setSelectedImageId(newOverlay.id);
      setSelectedTextId(null);
      setInteractionMode('text'); // Using text mode for moving floating objects
    } catch (err) {
      console.error("Failed to load overlay image", err);
    }
  };

  const handleAddText = () => {
    if (!imageBitmap) return;
    setInteractionMode('text'); 
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
    setSelectedImageId(null);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {imageBitmap && (
        <div style={{ display: 'flex', backgroundColor: 'var(--panel-bg)', padding: '0.25rem', border: '2px solid var(--text-color)', boxShadow: '2px 2px 0 var(--text-color)', marginRight: '1rem' }}>
          <button 
            onClick={() => setInteractionMode('view')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', backgroundColor: interactionMode === 'view' ? 'var(--text-color)' : 'transparent', color: interactionMode === 'view' ? 'var(--bg-color)' : 'var(--text-color)', fontWeight: 'bold' }}
            title="Pan/Zoom Viewport"
          >
            <Move size={16} /> View
          </button>
          <button 
            onClick={() => setInteractionMode('image')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', backgroundColor: interactionMode === 'image' ? 'var(--text-color)' : 'transparent', color: interactionMode === 'image' ? 'var(--bg-color)' : 'var(--text-color)', fontWeight: 'bold' }}
            title="Pan/Zoom Background"
          >
            <ImageIcon size={16} /> Background
          </button>
          <button 
            onClick={() => setInteractionMode('text')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', backgroundColor: interactionMode === 'text' ? 'var(--text-color)' : 'transparent', color: interactionMode === 'text' ? 'var(--bg-color)' : 'var(--text-color)', fontWeight: 'bold' }}
            title="Move Overlays"
          >
            <MousePointer2 size={16} /> Move
          </button>
        </div>
      )}

      {imageBitmap && (
        <label className="brutalist-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', backgroundColor: 'var(--bg-color)' }}>
          <Layers size={16} />
          Add Image
          <input type="file" accept="image/*" onChange={handleAddImageLayer} style={{ display: 'none' }} />
        </label>
      )}

      {imageBitmap && (
        <BrutalButton style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleAddText}>
          <Type size={16} />
          Add Text
        </BrutalButton>
      )}
      
      <label className="brutalist-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <Upload size={16} />
        {imageBitmap ? 'Change Background' : 'Upload Image'}
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileUpload} 
          style={{ display: 'none' }} 
        />
      </label>
    </div>
  );
};
