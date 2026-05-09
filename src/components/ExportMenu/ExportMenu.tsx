import React, { useState } from 'react';
import { exportToZip, exportToPdf, printPdf, downloadWholeImage } from '../../utils/exportEngine';
import { usePosterContext } from '../../context/PosterContext';
import { Printer } from 'lucide-react';

const ExportMenu: React.FC = () => {
  const { imageBitmap, gridCols, gridRows, paperSize, bleedMm, textOverlays, imageOverlays, imageFit, imageZoom, imagePan } = usePosterContext();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExportZip = async () => {
    if (!imageBitmap) return alert('No image loaded!');
    setIsExporting(true);
    setProgress(0);
    try {
      await exportToZip(imageBitmap, gridCols, gridRows, paperSize, bleedMm, textOverlays, imageOverlays, imageFit, imageZoom, imagePan, setProgress);
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
      await exportToPdf(imageBitmap, gridCols, gridRows, paperSize, bleedMm, textOverlays, imageOverlays, imageFit, imageZoom, imagePan, setProgress);
    } catch (err) {
      console.error(err);
      alert('Failed to export PDF');
    }
    setIsExporting(false);
  };

  const handlePrint = async () => {
    if (!imageBitmap) return alert('No image loaded!');
    setIsExporting(true);
    setProgress(0);
    try {
      await printPdf(imageBitmap, gridCols, gridRows, paperSize, bleedMm, textOverlays, imageOverlays, imageFit, imageZoom, imagePan, setProgress);
    } catch (err) {
      console.error(err);
      alert('Failed to print PDF');
    }
    setIsExporting(false);
  };
  
  const handleDownloadWhole = async () => {
    if (!imageBitmap) return alert('No image loaded!');
    setIsExporting(true);
    try {
      await downloadWholeImage(imageBitmap, textOverlays, imageOverlays);
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
      <button 
        className="brutalist-button" 
        onClick={handlePrint}
        disabled={!imageBitmap || isExporting}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--text-color)', color: 'var(--bg-color)' }}
      >
        <Printer size={16} /> Print
      </button>
    </div>
  );
};

export default ExportMenu;
