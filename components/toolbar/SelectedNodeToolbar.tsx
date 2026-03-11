import React from 'react';
import { WikiNode } from '../../types';
import { FontButton } from './FontButton';
import { ColorButton } from './ColorButton';
import { SizeDropdown } from './SizeDropdown';
import { FormatToolbar } from './FormatToolbar';
import { Droplets, Layers, RotateCcw } from 'lucide-react';

const NEUTRAL_COLORS = [
  'var(--node-text-0)', 'var(--node-text-1)', 'var(--node-text-2)', 'var(--node-text-3)', 'var(--node-text-4)',
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

interface SelectedNodeToolbarProps {
  selectedNode: WikiNode;
  globalFont: 'sans' | 'serif' | 'mono';
  globalColor: string;
  globalBackgroundColor: string;
  globalBlur: boolean;
  globalHeaderGrayLayer: boolean;
  updateSelectedNodes: (updates: Partial<WikiNode>) => void;
  insertMarkdown: (prefix: string, suffix?: string) => void;
}

export const SelectedNodeToolbar: React.FC<SelectedNodeToolbarProps> = ({
  selectedNode, globalFont, globalColor, globalBackgroundColor, globalBlur, globalHeaderGrayLayer, updateSelectedNodes, insertMarkdown
}) => {
  const renderColors = (current: string, field: keyof WikiNode) => (
    <div className="flex items-center gap-1.5 px-1.5">
      {NEUTRAL_COLORS.map(c => <ColorButton key={c} color={c} current={current} onClick={() => updateSelectedNodes({ [field]: c })} />)}
    </div>
  );

  const renderBackgroundColors = (
      current: string, 
      blurValue: boolean | undefined, 
      defaultBlur: boolean,
      bgKey: keyof WikiNode = 'backgroundColor',
      blurKey: keyof WikiNode = 'blur',
      grayLayerKey?: keyof WikiNode
  ) => {
    const isBlurry = blurValue !== undefined ? blurValue : defaultBlur;
    
    // Determine if Gray Layer is effectively active (for UI feedback)
    // We don't have access to global state here directly for fallback visualization, 
    // but the button toggles the local override.
    const effectiveGrayLayer = grayLayerKey 
        ? (selectedNode[grayLayerKey] !== undefined ? selectedNode[grayLayerKey] : globalHeaderGrayLayer) 
        : false;

    return (
      <div className="flex items-center gap-1.5 px-1.5">
        {BG_COLORS.map(c => <ColorButton key={c} color={c} current={current || globalBackgroundColor} onClick={() => updateSelectedNodes({ [bgKey]: c })} />)}
        
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        
        {/* Restore Defaults (Set to undefined to inherit) */}
        <button
            onClick={() => {
                const updates: Partial<WikiNode> = { 
                    [bgKey]: undefined, 
                    [blurKey]: undefined, 
                    ...(grayLayerKey ? { [grayLayerKey]: undefined } : {})
                };
                updateSelectedNodes(updates);
            }}
            className="w-6 h-6 flex items-center justify-center rounded transition-colors text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10"
            title="Restore Defaults (Inherit Global)"
        >
            <RotateCcw size={12} />
        </button>

        <button
            onClick={() => updateSelectedNodes({ [blurKey]: !isBlurry })}
            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${isBlurry ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'}`}
            title="Toggle Blur Effect"
        >
            <Droplets size={14} />
        </button>
        
        {grayLayerKey && (
            <button
                onClick={() => updateSelectedNodes({ [grayLayerKey]: !effectiveGrayLayer })}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${effectiveGrayLayer ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'}`}
                title={effectiveGrayLayer ? "Disable Gray Layer" : "Enable Gray Layer"}
            >
                <Layers size={14} />
            </button>
        )}
      </div>
    );
  };

  const renderFontSection = (label: string, styleKey: keyof WikiNode, sizeKey: keyof WikiNode | null, colorKey: keyof WikiNode | null, defaultSize: number, sizes: number[]) => {
    const currentStyle = selectedNode[styleKey] as string | undefined;
    const isChild = !!selectedNode.parentId;

    return (
      <div className="flex items-center gap-0.5 glass-panel p-1 animate-in slide-in-from-bottom-2 duration-200 h-9 font-sans">
        <div className="text-[9px] text-zinc-400 dark:text-zinc-500 px-2 font-bold w-24 shrink-0 truncate">{label}</div>
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        
        {/* Inheritance Controls */}
        {isChild && (
           <FontButton 
             font="inherit" 
             current={!currentStyle ? 'inherit' : ''} 
             onClick={() => updateSelectedNodes({ [styleKey]: undefined })} 
             label="Parent" 
           />
        )}
        <FontButton 
          font="global" 
          current={currentStyle === 'global' || (!isChild && !currentStyle) ? 'global' : ''} 
          onClick={() => updateSelectedNodes({ [styleKey]: isChild ? 'global' : undefined })} 
          label="Global" 
        />
        
        {/* Specific Styles */}
        <FontButton font="sans" current={currentStyle || ''} onClick={() => updateSelectedNodes({ [styleKey]: 'sans' })} label="sans" />
        <FontButton font="serif" current={currentStyle || ''} onClick={() => updateSelectedNodes({ [styleKey]: 'serif' })} label="serif" />
        <FontButton font="mono" current={currentStyle || ''} onClick={() => updateSelectedNodes({ [styleKey]: 'mono' })} label="mono" />
        
        {(sizeKey || colorKey) && <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>}
        
        {sizeKey && (
          <SizeDropdown value={(selectedNode[sizeKey] as number) || defaultSize} options={sizes} onChange={(val) => updateSelectedNodes({ [sizeKey]: val })} globalFont={globalFont} label="SIZE" />
        )}
        
        {colorKey && (
          <>
            <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
            {renderColors((selectedNode[colorKey] as string) || globalColor, colorKey)}
          </>
        )}
      </div>
    );
  };

  const renderBackgroundSection = (
      label: string, 
      defaultBlur: boolean, 
      bgKey: keyof WikiNode = 'backgroundColor', 
      blurKey: keyof WikiNode = 'blur',
      grayLayerKey?: keyof WikiNode
  ) => (
    <div className="flex items-center gap-0.5 glass-panel p-1 animate-in slide-in-from-bottom-2 duration-200 h-9 font-sans">
      <div className="text-[9px] text-zinc-400 dark:text-zinc-500 px-2 font-bold w-24 shrink-0 truncate">{label}</div>
      <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
      {renderBackgroundColors(
          (selectedNode[bgKey] as string) || '', 
          selectedNode[blurKey] as boolean, 
          defaultBlur,
          bgKey,
          blurKey,
          grayLayerKey
      )}
    </div>
  );

  const headerSizes = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40, 44, 48, 56, 64, 72, 80, 96, 112, 128, 144, 160];
  const bodySizes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 32, 36, 40, 48, 56, 64, 72];
  const captionSizes = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36];

  // Default blur values per type - inherit from global
  const defaultBlur = globalBlur;

  // Calculate effective gray layer state for Text nodes (FormatToolbar)
  const isGrayLayerActive = selectedNode.headerGrayLayer !== undefined 
      ? selectedNode.headerGrayLayer 
      : globalHeaderGrayLayer;

  return (
    <div className="flex flex-col gap-1 pointer-events-auto">
      <div className="flex items-center gap-1">
        {selectedNode.type === 'text' && (
          <div className="flex flex-col gap-1">
            {renderFontSection("BODY", "bodyFontStyle", "bodyFontSize", "bodyColor", 15, bodySizes)}
            {renderFontSection("HEADER", "headerFontStyle", "headerFontSize", "headerColor", 18, headerSizes)}
            {renderBackgroundSection("HEADER BG", false, 'headerBackgroundColor', 'headerBlur', 'headerGrayLayer')}
            
            <FormatToolbar 
              onInsertMarkdown={insertMarkdown} 
              backgroundColor={selectedNode.backgroundColor}
              onUpdateBackgroundColor={(color) => updateSelectedNodes({ backgroundColor: color })}
              blur={selectedNode.blur !== undefined ? selectedNode.blur : defaultBlur}
              onToggleBlur={() => updateSelectedNodes({ blur: !(selectedNode.blur !== undefined ? selectedNode.blur : defaultBlur) })}
              grayLayer={isGrayLayerActive}
              onToggleGrayLayer={() => updateSelectedNodes({ headerGrayLayer: !isGrayLayerActive })}
              onRestoreDefaults={() => updateSelectedNodes({ backgroundColor: undefined, blur: undefined, headerGrayLayer: undefined, headerBackgroundColor: undefined, headerBlur: undefined })}
            />
          </div>
        )}
        {selectedNode.type === 'title' && (
          <div className="flex flex-col gap-1">
            {renderFontSection("HEADER", "headerFontStyle", "headerFontSize", "headerColor", 18, headerSizes)}
            {renderBackgroundSection("TITLE BG", defaultBlur, 'backgroundColor', 'blur', 'headerGrayLayer')}
          </div>
        )}
        {selectedNode.type === 'image' && (
            <div className="flex flex-col gap-1">
                {renderFontSection("CAPTION", "captionFontStyle", "captionFontSize", "captionColor", 11, captionSizes)}
                {renderBackgroundSection("CAPTION BG", defaultBlur)}
            </div>
        )}
        {selectedNode.type === 'group' && (
          <div className="flex flex-col gap-1">
             {/* 1. Group's Own Header Settings */}
             {renderFontSection("HEADER", "headerFontStyle", "headerFontSize", "headerColor", 18, headerSizes)}
             
             {/* Group's Header Background */}
             {renderBackgroundSection("HEADER BG", false, 'headerBackgroundColor', 'headerBlur', 'headerGrayLayer')}
             
             {/* 2. Inherited Settings for Child Headings */}
             {renderFontSection("GROUP HEADINGS", "fontStyle", "fontSize", "captionColor", 18, headerSizes)}
             
             {/* 3. Inherited Settings for Child Bodies */}
             {renderFontSection("GROUP BODY", "bodyFontStyle", "bodyFontSize", "bodyColor", 15, bodySizes)}

             {/* 4. Background Color & Blur */}
             {renderBackgroundSection("GROUP BG", defaultBlur)}
          </div>
        )}
      </div>
    </div>
  );
};