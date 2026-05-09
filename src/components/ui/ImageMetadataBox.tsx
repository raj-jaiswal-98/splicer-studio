import React from 'react';
import { usePosterContext } from '../../context/PosterContext';

const ImageMetadataBox: React.FC = () => {
  const { imageMetadata, imageBitmap } = usePosterContext();

  console.log('[ImageMetadataBox] Rendering. Metadata:', imageMetadata, 'Bitmap:', !!imageBitmap);

  if (!imageMetadata && !imageBitmap) {
    console.log('[ImageMetadataBox] Both null, rendering null.');
    return null;
  }

  const width = imageMetadata?.width || imageBitmap?.width || 0;
  const height = imageMetadata?.height || imageBitmap?.height || 0;
  const filename = imageMetadata?.filename || 'Unknown (Loaded via Context)';

  const megapixels = ((width * height) / 1000000).toFixed(1);
  const ratio = height > 0 ? (width / height).toFixed(2) : '0';
  
  // Format file size
  let sizeDisplay = 'Unknown Size';
  if (imageMetadata?.fileSize) {
    if (imageMetadata.fileSize > 1024 * 1024) {
      sizeDisplay = `${(imageMetadata.fileSize / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      sizeDisplay = `${(imageMetadata.fileSize / 1024).toFixed(0)} KB`;
    }
  }

  return (
    <div className="brutalist-border" style={{ marginTop: '2rem', backgroundColor: 'var(--panel-bg)', padding: '1rem' }}>
      <h3 style={{ marginBottom: '0.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.25rem' }}>Image Metadata</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>Source:</span>
          <span style={{ wordBreak: 'break-all', textAlign: 'right', maxWidth: '60%' }}>{filename}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>Resolution:</span>
          <span>{width} x {height} px</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>Megapixels:</span>
          <span>{megapixels} MP</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>Aspect Ratio:</span>
          <span>{ratio}:1</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>Memory Size:</span>
          <span>{sizeDisplay}</span>
        </div>
      </div>
    </div>
  );
};

export default ImageMetadataBox;
