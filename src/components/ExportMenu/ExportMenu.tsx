import React, { useState } from 'react';
import { exportToZip, exportToPdf, downloadWholeImage } from '../../utils/exportEngine';
import { usePosterContext } from '../../context/PosterContext';

const ExportMenu: React.FC = () => {
  const { imageBitmap, gridCols, gridRows, paperSize, bleedMm, textOverlays, imageFit } = usePosterContext();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExportZip = async () => {
    if (!imageBitmap) return alert('No image loaded!');
    setIsExporting(true);
    setProgress(0);
    try {
      await exportToZip(imageBitmap, gridCols, gridRows, paperSize, bleedMm, textOverlays, imageFit, setProgress);
    } catch (err) {
      console.error(err);
      alert('Failed to export ZIP');
    }
    setIsExporting(false);
  };

  const handleExportPdf = async () => {
    if (!imageBitmap) return alert('No image loaded!');
    setIsExporting(true);
    setProgress(0);
    try {
      await exportToPdf(imageBitmap, gridCols, gridRows, paperSize, bleedMm, textOverlays, imageFit, setProgress);
    } catch (err) {
      console.error(err);
      alert('Failed to export PDF');
    }
    setIsExporting(false);
  };
  
  const handleDownloadWhole = async () => {
    if (!imageBitmap) return alert('No image loaded!');
    setIsExporting(true);
    try {
      await downloadWholeImage(imageBitmap, textOverlays);
    } catch (err) {
      console.error(err);
      alert('Failed to download image');
    }
    setIsExporting(false);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {isExporting && (
        <span style={{ fontWeight: 'bold', marginRight: '1rem', color: '#ff00ff' }}>
          Processing: {Math.round(progress)}%
        </span>
      )}
      <button 
        className="brutalist-button secondary" 
        onClick={handleDownloadWhole}
        disabled={!imageBitmap || isExporting}
      >
        Save Full Image
      </button>
      <button 
        className="brutalist-button secondary" 
        onClick={handleExportZip}
        disabled={!imageBitmap || isExporting}
      >
        Export ZIP
      </button>
      <button 
        className="brutalist-button" 
        onClick={handleExportPdf}
        disabled={!imageBitmap || isExporting}
      >
        Export PDF
      </button>
    </div>
  );
};

export default ExportMenu;
