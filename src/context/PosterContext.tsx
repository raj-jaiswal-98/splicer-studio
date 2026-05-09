import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
export type InteractionMode = 'view' | 'image' | 'text';

export interface ImageMetadata {
  filename: string;
  fileSize?: number; // in bytes
  width: number;
  height: number;
}

export interface ImageOverlay {
  id: string;
  imageBitmap: ImageBitmap;
  metadata: ImageMetadata;
  x: number; // Center X in virtual poster coords
  y: number; // Center Y in virtual poster coords
  scale: number; // Multiplier, default 1
  rotation: number; // Degrees, default 0
  opacity: number; // 0 to 1, default 1
  zIndex: number;
}

export interface Project {
  id: string;
  name: string;
  imageBitmap: ImageBitmap | null;
  imageMetadata: ImageMetadata | null;
  gridCols: number;
  gridRows: number;
  paperSize: PaperSize;
  bleedMm: number;
  textOverlays: TextOverlay[];
  selectedTextId: string | null;
  imageOverlays: ImageOverlay[];
  selectedImageId: string | null;
  imageFit: ImageFitMode;
  preserveRatio: boolean;
  imageZoom: number;
  imagePan: { x: number; y: number };
}

interface PosterContextProps {
  imageBitmap: ImageBitmap | null;
  setImageBitmap: React.Dispatch<React.SetStateAction<ImageBitmap | null>>;
  imageMetadata: ImageMetadata | null;
  setImageMetadata: React.Dispatch<React.SetStateAction<ImageMetadata | null>>;
  gridCols: number;
  setGridCols: React.Dispatch<React.SetStateAction<number>>;
  gridRows: number;
  setGridRows: React.Dispatch<React.SetStateAction<number>>;
  paperSize: PaperSize;
  setPaperSize: React.Dispatch<React.SetStateAction<PaperSize>>;
  bleedMm: number;
  setBleedMm: React.Dispatch<React.SetStateAction<number>>;
  textOverlays: TextOverlay[];
  setTextOverlays: React.Dispatch<React.SetStateAction<TextOverlay[]>>;
  selectedTextId: string | null;
  setSelectedTextId: React.Dispatch<React.SetStateAction<string | null>>;
  imageOverlays: ImageOverlay[];
  setImageOverlays: React.Dispatch<React.SetStateAction<ImageOverlay[]>>;
  selectedImageId: string | null;
  setSelectedImageId: React.Dispatch<React.SetStateAction<string | null>>;
  imageFit: ImageFitMode;
  setImageFit: React.Dispatch<React.SetStateAction<ImageFitMode>>;
  preserveRatio: boolean;
  setPreserveRatio: React.Dispatch<React.SetStateAction<boolean>>;
  imageZoom: number;
  setImageZoom: React.Dispatch<React.SetStateAction<number>>;
  imagePan: { x: number; y: number };
  setImagePan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;

  projects: Project[];
  activeProjectId: string;
  addProject: () => void;
  removeProject: (id: string) => void;
  setActiveProject: (id: string) => void;
  updateProjectName: (id: string, name: string) => void;
  
  interactionMode: InteractionMode;
  setInteractionMode: React.Dispatch<React.SetStateAction<InteractionMode>>;
}

export const PosterContext = createContext<PosterContextProps | undefined>(undefined);

export const PosterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getSaved = <T,>(key: string, defaultVal: T): T => {
    const saved = localStorage.getItem(`poster-settings-${key}`);
    return saved !== null ? JSON.parse(saved) : defaultVal;
  };

  const CANVAS_NAMES = [
    'Radiant', 'Neon', 'Brutal', 'Sonic', 'Zenith', 'Void', 'Prism', 'Cyber', 
    'Pulse', 'Flux', 'Spark', 'Nova', 'Echo', 'Rift', 'Gloom', 'Vivid', 
    'Bold', 'Stark', 'Prime', 'Elite', 'Chrome', 'Aura', 'Solar', 'Lunar'
  ];

  const getRandomName = () => {
    return CANVAS_NAMES[Math.floor(Math.random() * CANVAS_NAMES.length)];
  };

  const createDefaultProject = (id: string, name: string): Project => ({
    id,
    name,
    imageBitmap: null,
    imageMetadata: null,
    gridCols: getSaved('gridCols', 2),
    gridRows: getSaved('gridRows', 2),
    paperSize: getSaved('paperSize', 'A4'),
    bleedMm: getSaved('bleedMm', 0),
    textOverlays: [],
    selectedTextId: null,
    imageOverlays: [],
    selectedImageId: null,
    imageFit: getSaved('imageFit', 'cover'),
    preserveRatio: getSaved('preserveRatio', false),
    imageZoom: 1,
    imagePan: { x: 0, y: 0 }
  });

  const [projects, setProjects] = useState<Project[]>(() => [createDefaultProject('default-1', 'Radiant')]);
  const [activeProjectId, setActiveProjectId] = useState<string>('default-1');
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('view');

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const updateActiveProject = (updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, ...updates } : p));
  };

  const addProject = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const newProject = createDefaultProject(id, getRandomName());
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(id);
  };

  const removeProject = (id: string) => {
    if (projects.length <= 1) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      const remaining = projects.filter(p => p.id !== id);
      setActiveProjectId(remaining[remaining.length - 1].id);
    }
  };

  const updateProjectName = (id: string, name: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const applySetStateAction = <T,>(action: React.SetStateAction<T>, currentVal: T): T => {
    return typeof action === 'function' ? (action as (prev: T) => T)(currentVal) : action;
  };

  const imageBitmap = activeProject.imageBitmap;
  const setImageBitmap = (val: React.SetStateAction<ImageBitmap | null>) => updateActiveProject({ imageBitmap: applySetStateAction(val, activeProject.imageBitmap) });
  
  const imageMetadata = activeProject.imageMetadata;
  const setImageMetadata = (val: React.SetStateAction<ImageMetadata | null>) => updateActiveProject({ imageMetadata: applySetStateAction(val, activeProject.imageMetadata) });
  
  const gridCols = activeProject.gridCols;
  const setGridCols = (val: React.SetStateAction<number>) => updateActiveProject({ gridCols: applySetStateAction(val, activeProject.gridCols) });
  
  const gridRows = activeProject.gridRows;
  const setGridRows = (val: React.SetStateAction<number>) => updateActiveProject({ gridRows: applySetStateAction(val, activeProject.gridRows) });
  
  const paperSize = activeProject.paperSize;
  const setPaperSize = (val: React.SetStateAction<PaperSize>) => updateActiveProject({ paperSize: applySetStateAction(val, activeProject.paperSize) });
  
  const bleedMm = activeProject.bleedMm;
  const setBleedMm = (val: React.SetStateAction<number>) => updateActiveProject({ bleedMm: applySetStateAction(val, activeProject.bleedMm) });
  
  const textOverlays = activeProject.textOverlays;
  const setTextOverlays = (val: React.SetStateAction<TextOverlay[]>) => updateActiveProject({ textOverlays: applySetStateAction(val, activeProject.textOverlays) });
  
  const selectedTextId = activeProject.selectedTextId;
  const setSelectedTextId = (val: React.SetStateAction<string | null>) => updateActiveProject({ selectedTextId: applySetStateAction(val, activeProject.selectedTextId) });
  
  const imageOverlays = activeProject.imageOverlays;
  const setImageOverlays = (val: React.SetStateAction<ImageOverlay[]>) => updateActiveProject({ imageOverlays: applySetStateAction(val, activeProject.imageOverlays) });
  
  const selectedImageId = activeProject.selectedImageId;
  const setSelectedImageId = (val: React.SetStateAction<string | null>) => updateActiveProject({ selectedImageId: applySetStateAction(val, activeProject.selectedImageId) });

  const imageFit = activeProject.imageFit;
  const setImageFit = (val: React.SetStateAction<ImageFitMode>) => updateActiveProject({ imageFit: applySetStateAction(val, activeProject.imageFit) });
  
  const preserveRatio = activeProject.preserveRatio;
  const setPreserveRatio = (val: React.SetStateAction<boolean>) => updateActiveProject({ preserveRatio: applySetStateAction(val, activeProject.preserveRatio) });
  
  const imageZoom = activeProject.imageZoom;
  const setImageZoom = (val: React.SetStateAction<number>) => updateActiveProject({ imageZoom: applySetStateAction(val, activeProject.imageZoom) });
  
  const imagePan = activeProject.imagePan;
  const setImagePan = (val: React.SetStateAction<{x: number, y: number}>) => updateActiveProject({ imagePan: applySetStateAction(val, activeProject.imagePan) });

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
        imageBitmap, setImageBitmap,
        imageMetadata, setImageMetadata,
        gridCols, setGridCols,
        gridRows, setGridRows,
        paperSize, setPaperSize,
        bleedMm, setBleedMm,
        textOverlays, setTextOverlays,
        selectedTextId, setSelectedTextId,
        imageOverlays, setImageOverlays,
        selectedImageId, setSelectedImageId,
        imageFit, setImageFit,
        preserveRatio, setPreserveRatio,
        imageZoom, setImageZoom,
        imagePan, setImagePan,
        projects, activeProjectId, addProject, removeProject, setActiveProject: setActiveProjectId, updateProjectName,
        interactionMode, setInteractionMode
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
