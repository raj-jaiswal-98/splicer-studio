import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExportMenu from './ExportMenu';
import { PosterContext } from '../../context/PosterContext';

// Mock the export engine so we don't actually trigger downloads in tests
vi.mock('../../utils/exportEngine', () => ({
  exportToZip: vi.fn(),
  exportToPdf: vi.fn(),
  printPdf: vi.fn(),
  downloadWholeImage: vi.fn()
}));

const mockContextProps: any = {
  imageBitmap: null,
  setImageBitmap: vi.fn(),
  imageMetadata: null,
  setImageMetadata: vi.fn(),
  gridCols: 2,
  setGridCols: vi.fn(),
  gridRows: 2,
  setGridRows: vi.fn(),
  paperSize: 'A4' as any,
  setPaperSize: vi.fn(),
  bleedMm: 5,
  setBleedMm: vi.fn(),
  textOverlays: [],
  setTextOverlays: vi.fn(),
  selectedTextId: null,
  setSelectedTextId: vi.fn(),
  imageOverlays: [],
  setImageOverlays: vi.fn(),
  selectedImageId: null,
  setSelectedImageId: vi.fn(),
  imageFit: 'stretch' as any,
  setImageFit: vi.fn(),
  preserveRatio: false,
  setPreserveRatio: vi.fn(),
  imageZoom: 1,
  setImageZoom: vi.fn(),
  imagePan: { x: 0, y: 0 },
  setImagePan: vi.fn(),
  projects: [],
  activeProjectId: '1',
  addProject: vi.fn(),
  removeProject: vi.fn(),
  setActiveProject: vi.fn(),
  updateProjectName: vi.fn(),
  interactionMode: 'view' as any,
  setInteractionMode: vi.fn()
};

describe('ExportMenu Component', () => {
  it('should render all three export buttons', () => {
    render(
      <PosterContext.Provider value={mockContextProps}>
        <ExportMenu />
      </PosterContext.Provider>
    );
    
    expect(screen.getByText('Save Full Image')).toBeDefined();
    expect(screen.getByText('Export ZIP')).toBeDefined();
    expect(screen.getByText('Export PDF')).toBeDefined();
  });

  it('buttons should be disabled when there is no imageBitmap', () => {
    render(
      <PosterContext.Provider value={mockContextProps}>
        <ExportMenu />
      </PosterContext.Provider>
    );
    
    const saveBtn = screen.getByText('Save Full Image') as HTMLButtonElement;
    const zipBtn = screen.getByText('Export ZIP') as HTMLButtonElement;
    const pdfBtn = screen.getByText('Export PDF') as HTMLButtonElement;
    
    expect(saveBtn.disabled).toBe(true);
    expect(zipBtn.disabled).toBe(true);
    expect(pdfBtn.disabled).toBe(true);
  });

  it('buttons should be enabled when an imageBitmap is provided', () => {
    const contextWithImage = { ...mockContextProps, imageBitmap: {} as ImageBitmap };
    render(
      <PosterContext.Provider value={contextWithImage}>
        <ExportMenu />
      </PosterContext.Provider>
    );
    
    const saveBtn = screen.getByText('Save Full Image') as HTMLButtonElement;
    const zipBtn = screen.getByText('Export ZIP') as HTMLButtonElement;
    const pdfBtn = screen.getByText('Export PDF') as HTMLButtonElement;
    
    expect(saveBtn.disabled).toBe(false);
    expect(zipBtn.disabled).toBe(false);
    expect(pdfBtn.disabled).toBe(false);
  });
});
