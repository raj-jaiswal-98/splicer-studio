import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PaperSize } from '../utils/canvasEngine';

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
}

export type ImageFitMode = 'cover' | 'contain' | 'stretch' | 'contain-blur' | 'fit-width' | 'fit-height';

export interface ImageMetadata {
  filename: string;
  fileSize?: number; // in bytes
  width: number;
  height: number;
}

interface PosterContextProps {
  imageBitmap: ImageBitmap | null;
  setImageBitmap: (bitmap: ImageBitmap | null) => void;
  imageMetadata: ImageMetadata | null;
  setImageMetadata: (meta: ImageMetadata | null) => void;
  gridCols: number;
  setGridCols: (cols: number) => void;
  gridRows: number;
  setGridRows: (rows: number) => void;
  paperSize: PaperSize;
  setPaperSize: (size: PaperSize) => void;
  bleedMm: number;
  setBleedMm: (bleed: number) => void;
  textOverlays: TextOverlay[];
  setTextOverlays: React.Dispatch<React.SetStateAction<TextOverlay[]>>;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  imageFit: ImageFitMode;
  setImageFit: (fit: ImageFitMode) => void;
  preserveRatio: boolean;
  setPreserveRatio: (preserve: boolean) => void;
}

export const PosterContext = createContext<PosterContextProps | undefined>(undefined);

export const PosterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [imageBitmap, setImageBitmap] = useState<ImageBitmap | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  
  const getSaved = <T,>(key: string, defaultVal: T): T => {
    const saved = localStorage.getItem(`poster-settings-${key}`);
    return saved !== null ? JSON.parse(saved) : defaultVal;
  };

  const [gridCols, setGridCols] = useState<number>(() => getSaved('gridCols', 2));
  const [gridRows, setGridRows] = useState<number>(() => getSaved('gridRows', 2));
  const [paperSize, setPaperSize] = useState<PaperSize>(() => getSaved('paperSize', 'A4'));
  const [bleedMm, setBleedMm] = useState<number>(() => getSaved('bleedMm', 0));
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [imageFit, setImageFit] = useState<ImageFitMode>(() => getSaved('imageFit', 'cover'));
  const [preserveRatio, setPreserveRatio] = useState<boolean>(() => getSaved('preserveRatio', true));

  useEffect(() => {
    localStorage.setItem('poster-settings-gridCols', JSON.stringify(gridCols));
    localStorage.setItem('poster-settings-gridRows', JSON.stringify(gridRows));
    localStorage.setItem('poster-settings-paperSize', JSON.stringify(paperSize));
    localStorage.setItem('poster-settings-bleedMm', JSON.stringify(bleedMm));
    localStorage.setItem('poster-settings-imageFit', JSON.stringify(imageFit));
    localStorage.setItem('poster-settings-preserveRatio', JSON.stringify(preserveRatio));
  }, [gridCols, gridRows, paperSize, bleedMm, imageFit, preserveRatio]);

  return (
    <PosterContext.Provider
      value={{
        imageBitmap,
        setImageBitmap,
        imageMetadata,
        setImageMetadata,
        gridCols,
        setGridCols,
        gridRows,
        setGridRows,
        paperSize,
        setPaperSize,
        bleedMm,
        setBleedMm,
        textOverlays,
        setTextOverlays,
        selectedTextId,
        setSelectedTextId,
        imageFit,
        setImageFit,
        preserveRatio,
        setPreserveRatio,
      }}
    >
      {children}
    </PosterContext.Provider>
  );
};

export const usePosterContext = () => {
  const context = useContext(PosterContext);
  if (!context) {
    throw new Error('usePosterContext must be used within a PosterProvider');
  }
  return context;
};
