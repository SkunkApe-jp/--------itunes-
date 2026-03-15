
export interface Position {
  x: number;
  y: number;
}

export type AIPanelMode = 'edit' | 'branch' | 'ask' | 'expand' | 'image-gen';

export interface WikiNode {
  id: string;
  type: 'text' | 'image' | 'title' | 'group';
  title: string;
  content: string; // Markdown content
  parentId?: string;
  coverImage?: string; // Base64 or URL
  imageHeight?: number; // In pixels, default 160
  imageFit?: 'cover' | 'contain';
  imagePosition?: string; // e.g. 'center', 'top', 'bottom', etc.
  fontStyle?: 'sans' | 'serif' | 'mono' | 'global';
  fontSize?: number;
  headerFontStyle?: 'sans' | 'serif' | 'mono' | 'global';
  headerFontSize?: number;
  bodyFontStyle?: 'sans' | 'serif' | 'mono' | 'global';
  bodyFontSize?: number;
  captionFontStyle?: 'sans' | 'serif' | 'mono' | 'global';
  captionFontSize?: number;
  headerColor?: string;
  bodyColor?: string;
  captionColor?: string;
  backgroundColor?: string;
  blur?: boolean;
  headerBackgroundColor?: string;
  headerBlur?: boolean;
  headerGrayLayer?: boolean;
  position: Position;
  width: number;
  height: number;
  selected?: boolean;
  isGenerating?: boolean;
  zIndex?: number;
  activeAIPanel?: AIPanelMode;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
  label?: string;
  selected?: boolean;
  isEditing?: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export enum ToolMode {
  SELECT = 'SELECT',
  PAN = 'PAN'
}

export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'openrouter' | 'local' | 'groq';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}