import React from 'react';
import BrutalTooltip from '../ui/BrutalTooltip';
import ImageMetadataBox from '../ui/ImageMetadataBox';
import { BrutalAccordion } from '../ui/BrutalAccordion';
import { usePosterContext, ImageFitMode } from '../../context/PosterContext';
import { PaperSize, PAPER_DIMENSIONS_300DPI } from '../../utils/canvasEngine';

const ControlPanel = () => {
  const { 
    gridCols, setGridCols, 
    gridRows, setGridRows, 
    paperSize, setPaperSize, 
    bleedMm, setBleedMm,
    imageFit, setImageFit,
    preserveRatio, setPreserveRatio,
    imageBitmap
  } = usePosterContext();

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') return;
    const [cols, rows] = val.split('x').map(Number);
    if (cols && rows) {
      setGridCols(cols);
      setGridRows(rows);
    }
  };

  const getTargetPaperRatio = () => {
    const dim = PAPER_DIMENSIONS_300DPI[paperSize];
    return dim.height / dim.width;
  };

  const handleColsChange = (cols: number) => {
    setGridCols(cols);
    if (preserveRatio && imageBitmap) {
      const imageRatio = imageBitmap.height / imageBitmap.width;
      const paperRatio = getTargetPaperRatio();
      const calcRows = Math.max(1, Math.round((cols * imageRatio) / paperRatio));
      setGridRows(calcRows);
    }
  };

  const handleRowsChange = (rows: number) => {
    setGridRows(rows);
    if (preserveRatio && imageBitmap) {
      const imageRatio = imageBitmap.height / imageBitmap.width;
      const paperRatio = getTargetPaperRatio();
      const calcCols = Math.max(1, Math.round((rows * paperRatio) / imageRatio));
      setGridCols(calcCols);
    }
  };

  let recommended = '';
  if (imageBitmap) {
    const ratio = imageBitmap.width / imageBitmap.height;
    if (ratio > 1.2) recommended = ' (Try Wide 2x1 or 3x2)';
    else if (ratio < 0.8) recommended = ' (Try Tall 1x3 or 2x3)';
    else recommended = ' (Try Square 2x2 or 3x3)';
  }

  const knownPresets = ['1x1', '1x2', '2x1', '2x2', '1x3', '2x3', '3x2', '3x3', '4x4', '5x5'];
  const displayPreset = knownPresets.includes(`${gridCols}x${gridRows}`) ? `${gridCols}x${gridRows}` : 'custom';

  return (
    <div className="brutalist-card" style={{ height: '100%', overflowY: 'auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>Controls</h2>

      <BrutalAccordion title="Layout & Sizing" defaultOpen={true}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ fontWeight: 'bold' }}>Grid Layout Preset {recommended}</label>
            <BrutalTooltip content="Automatically sets Rows and Columns to match standard poster sizes." />
          </div>
          <select 
            className="brutalist-border"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
            onChange={handlePresetChange}
            value={displayPreset}
          >
            <option value="custom" disabled hidden>Custom Grid ({gridCols}x{gridRows})</option>
            <option value="1x1">Single Page (1x1)</option>
            <option value="1x2">Mini Vertical (1x2)</option>
            <option value="2x1">Mini Horizontal (2x1)</option>
            <option value="2x2">Classic Square (2x2)</option>
            <option value="1x3">Door Banner (1x3)</option>
            <option value="2x3">Movie Poster (2x3)</option>
            <option value="3x2">Wide Poster (3x2)</option>
            <option value="3x3">Large Square (3x3)</option>
            <option value="4x4">Massive Wall Art (4x4)</option>
            <option value="5x5">Giant Billboard (5x5)</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem', backgroundColor: 'var(--card-bg)', padding: '0.5rem' }} className="brutalist-border">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={preserveRatio} 
              onChange={(e) => setPreserveRatio(e.target.checked)} 
              style={{ width: '20px', height: '20px' }}
            />
            Auto-adjust to match image shape
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ fontWeight: 'bold' }}>Columns</label>
            <BrutalTooltip content="How many pieces of physical paper to split the image into horizontally." />
          </div>
          <input 
            type="number" 
            className="brutalist-border"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
            value={gridCols} 
            onChange={(e) => handleColsChange(Number(e.target.value))} 
            min="1" max="10" 
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ fontWeight: 'bold' }}>Rows</label>
            <BrutalTooltip content="How many pieces of physical paper to split the image into vertically." />
          </div>
          <input 
            type="number" 
            className="brutalist-border"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
            value={gridRows} 
            onChange={(e) => handleRowsChange(Number(e.target.value))} 
            min="1" max="10" 
          />
        </div>
      </BrutalAccordion>

      <BrutalAccordion title="Image Fit" defaultOpen={false}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ fontWeight: 'bold' }}>Scaling Mode</label>
            <BrutalTooltip content="Determines how the image fits inside the poster grid. Stretch distorts, Cover crops, Contain leaves borders." />
          </div>
          <select 
            className="brutalist-border"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
            value={imageFit}
            onChange={(e) => setImageFit(e.target.value as ImageFitMode)}
          >
            <option value="stretch">Stretch to Fill (Distorts)</option>
            <option value="cover">Cover (Crops overflow)</option>
            <option value="contain">Contain (Leaves borders)</option>
            <option value="contain-blur">Contain + Blur Background</option>
            <option value="fit-width">Fit Width (Crops top/bottom)</option>
            <option value="fit-height">Fit Height (Crops sides)</option>
          </select>
        </div>
      </BrutalAccordion>

      <BrutalAccordion title="Print Settings" defaultOpen={false}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ fontWeight: 'bold' }}>Paper Size</label>
            <BrutalTooltip content="The physical size of the paper you will be printing on." />
          </div>
          <select 
            className="brutalist-border"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value as PaperSize)}
          >
            <option value="A3">A3</option>
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="A6">A6</option>
            <option value="Letter">Letter</option>
            <option value="Legal">Legal</option>
            <option value="Tabloid">Tabloid</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ fontWeight: 'bold' }}>Bleed Margin (mm)</label>
            <BrutalTooltip content="Extra image printed around the edges of each paper. This provides an overlap for cutting and taping so you don't get white lines." />
          </div>
          <input 
            type="range" 
            style={{ width: '100%', marginTop: '0.25rem' }}
            value={bleedMm} 
            onChange={(e) => setBleedMm(Number(e.target.value))} 
            min="0" max="20" step="1"
          />
          <div style={{ textAlign: 'right', fontWeight: 'bold' }}>{bleedMm} mm</div>
        </div>
      </BrutalAccordion>
      
      <ImageMetadataBox />
    </div>
  );
};

export default ControlPanel;
