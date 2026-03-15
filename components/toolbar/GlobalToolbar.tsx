import React from 'react';
import { FontButton } from './FontButton';
import { ColorButton } from './ColorButton';
import { SizeDropdown } from './SizeDropdown';
import { Droplets, RotateCcw, Layers } from 'lucide-react';

const NEUTRAL_COLORS = [
  'var(--node-text-0)',
  'var(--node-text-1)',
  'var(--node-text-2)',
  'var(--node-text-3)',
  'var(--node-text-4)',
];

const BG_COLORS = [
  'var(--node-bg-0)',
  'var(--node-bg-1)',
  'var(--node-bg-2)',
  'var(--node-bg-3)',
  'var(--node-bg-4)',
  'var(--node-bg-5)',
  'var(--node-bg-6)',
];

const headerSizes = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40, 44, 48, 56, 64, 72];
const bodySizes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 32, 36, 40];
const captionSizes = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36];

interface GlobalToolbarProps {
  globalHeaderFont: 'sans' | 'serif' | 'mono';
  setGlobalHeaderFont: (font: 'sans' | 'serif' | 'mono') => void;
  globalHeaderFontSize: number;
  setGlobalHeaderFontSize: (size: number) => void;
  globalHeaderColor: string;
  setGlobalHeaderColor: (color: string) => void;

  globalBodyFont: 'sans' | 'serif' | 'mono';
  setGlobalBodyFont: (font: 'sans' | 'serif' | 'mono') => void;
  globalBodyFontSize: number;
  setGlobalBodyFontSize: (size: number) => void;
  globalColor: string;
  setGlobalColor: (color: string) => void;

  globalCaptionFont: 'sans' | 'serif' | 'mono';
  setGlobalCaptionFont: (font: 'sans' | 'serif' | 'mono') => void;
  globalCaptionFontSize: number;
  setGlobalCaptionFontSize: (size: number) => void;
  globalCaptionColor: string;
  setGlobalCaptionColor: (color: string) => void;

  globalBackgroundColor: string;
  setGlobalBackgroundColor: (color: string) => void;
  globalBlur: boolean;
  setGlobalBlur: (blur: boolean) => void;
  globalHeaderGrayLayer: boolean;
  setGlobalHeaderGrayLayer: (active: boolean) => void;
}

export const GlobalToolbar: React.FC<GlobalToolbarProps> = ({
  globalHeaderFont, setGlobalHeaderFont, globalHeaderFontSize, setGlobalHeaderFontSize, globalHeaderColor, setGlobalHeaderColor,
  globalBodyFont, setGlobalBodyFont, globalBodyFontSize, setGlobalBodyFontSize, globalColor, setGlobalColor,
  globalCaptionFont, setGlobalCaptionFont, globalCaptionFontSize, setGlobalCaptionFontSize, globalCaptionColor, setGlobalCaptionColor,
  globalBackgroundColor, setGlobalBackgroundColor, globalBlur, setGlobalBlur, globalHeaderGrayLayer, setGlobalHeaderGrayLayer
}) => {

  const renderSection = (
    label: string,
    font: 'sans' | 'serif' | 'mono',
    setFont: (f: 'sans' | 'serif' | 'mono') => void,
    size: number,
    setSize: (s: number) => void,
    color: string,
    setColor: (c: string) => void,
    sizes: number[]
  ) => (
    <div className="flex items-center gap-0.5 glass-panel p-1 animate-in slide-in-from-bottom-2 duration-200 h-9 font-sans">
        <div className="text-[9px] text-zinc-400 dark:text-zinc-500 px-2 font-bold w-28 shrink-0 truncate">{label}</div>
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        <FontButton font="sans" current={font} onClick={() => setFont('sans')} label="sans" />
        <FontButton font="serif" current={font} onClick={() => setFont('serif')} label="serif" />
        <FontButton font="mono" current={font} onClick={() => setFont('mono')} label="mono" />
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        <SizeDropdown value={size} options={sizes} onChange={setSize} globalFont={font} label="SIZE" />
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        <div className="flex items-center gap-1.5 px-1.5">
          {NEUTRAL_COLORS.map(c => (
            <ColorButton key={c} color={c} current={color} onClick={() => setColor(c)} />
          ))}
        </div>
    </div>
  );

  const renderBackgroundSection = () => (
    <div className="flex items-center gap-0.5 glass-panel p-1 animate-in slide-in-from-bottom-2 duration-200 h-9 font-sans">
        <div className="text-[9px] text-zinc-400 dark:text-zinc-500 px-2 font-bold w-28 shrink-0 truncate">GLOBAL BG</div>
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        <div className="flex items-center gap-1.5 px-1.5">
          {BG_COLORS.map(c => (
            <ColorButton key={c} color={c} current={globalBackgroundColor} onClick={() => setGlobalBackgroundColor(c)} />
          ))}
        </div>
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        
        {/* Reset Defaults */}
        <button
            onClick={() => {
                setGlobalBackgroundColor('var(--node-bg-0)');
                setGlobalBlur(false);
                setGlobalHeaderGrayLayer(true);
            }}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10"
            title="Reset to System Defaults"
        >
            <RotateCcw size={14} />
        </button>

        <button
            onClick={() => setGlobalBlur(!globalBlur)}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${globalBlur ? 'bg-custom-blue-500/20 text-custom-blue-600 dark:text-custom-blue-400' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'}`}
            title="Toggle Global Blur"
        >
            <Droplets size={14} />
        </button>

        <button
            onClick={() => setGlobalHeaderGrayLayer(!globalHeaderGrayLayer)}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${globalHeaderGrayLayer ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'}`}
            title={globalHeaderGrayLayer ? "Disable Header Gray Layer" : "Enable Header Gray Layer"}
        >
            <Layers size={14} />
        </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-1 pointer-events-auto">
      {renderSection("GLOBAL BODY", globalBodyFont, setGlobalBodyFont, globalBodyFontSize, setGlobalBodyFontSize, globalColor, setGlobalColor, bodySizes)}
      {renderSection("GLOBAL HEADER", globalHeaderFont, setGlobalHeaderFont, globalHeaderFontSize, setGlobalHeaderFontSize, globalHeaderColor, setGlobalHeaderColor, headerSizes)}
      {renderSection("GLOBAL CAPTION", globalCaptionFont, setGlobalCaptionFont, globalCaptionFontSize, setGlobalCaptionFontSize, globalCaptionColor, setGlobalCaptionColor, captionSizes)}
      {renderBackgroundSection()}
    </div>
  );
};