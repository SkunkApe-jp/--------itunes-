import React, { useRef, useEffect } from 'react';
import { GripVertical, X, GitBranch } from 'lucide-react';

interface NodeHeaderProps {
  title: string;
  isEditing: boolean;
  zIndex: number;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateZIndex: (newZ: number) => void;
  onEnterEdit: (e: React.MouseEvent) => void;
  onExitEdit: () => void;
  onDragStart: (e: React.PointerEvent) => void;
  onDelete: () => void;
  onBranch: (e: React.MouseEvent) => void;
  hasImage: boolean;
  globalFont: 'sans' | 'serif' | 'mono';
  fontStyle?: 'sans' | 'serif' | 'mono' | 'global';
  fontSize?: number;
  headerColor?: string;
  globalColor?: string;
  backgroundColor?: string;
  blur?: boolean;
  headerBlur?: boolean;
  grayLayer?: boolean;
  isHovered: boolean;
  isTitle?: boolean;
  globalBackgroundColor?: string;
  globalBlur?: boolean;
  globalHeaderGrayLayer?: boolean;
}

export const NodeHeader: React.FC<NodeHeaderProps> = ({
  title, isEditing, zIndex, onUpdateTitle, onUpdateZIndex, onEnterEdit, onExitEdit, onDragStart, onDelete, onBranch, globalFont, fontStyle, fontSize, headerColor, globalColor, backgroundColor, blur, headerBlur, grayLayer, isHovered, isTitle,
  globalBackgroundColor = 'var(--node-bg-0)', globalBlur = false, globalHeaderGrayLayer = true
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const effectiveFont = (fontStyle && fontStyle !== 'global' ? fontStyle : globalFont);
  const fontClass = effectiveFont === 'serif' ? 'font-serif' : effectiveFont === 'mono' ? 'font-mono' : 'font-sans';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [title, fontSize]);

  let headerStyle: React.CSSProperties = {
      fontSize: fontSize ? `${fontSize}px` : '18px', 
      lineHeight: '1.2', 
      color: headerColor || globalColor || undefined,
      position: 'relative',
      zIndex: 1
  };

  // Base layout classes
  let baseClasses = '';
  if (isTitle) {
      baseClasses = `relative min-h-[40px] flex items-start px-3 py-2 justify-between cursor-grab active:cursor-grabbing select-none shrink-0 transition-colors rounded-lg border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 overflow-hidden`;
  } else {
      baseClasses = `relative min-h-[48px] border-b border-zinc-200 dark:border-white/10 flex items-start px-3 py-2.5 justify-between cursor-grab active:cursor-grabbing select-none shrink-0 transition-colors overflow-hidden`;
  }

  // Background Style Logic (Overlay)
  const tintStyle: React.CSSProperties = {};
  const transparency = '35%'; // Cleaner, less opaque glass
  const blurAmount = '24px'; // Slightly less blur for sharper look

  // Resolve Effective Settings - headerBlur takes priority over blur for header-only glass
  const activeBg = backgroundColor || globalBackgroundColor;
  const isBlurry = headerBlur !== undefined ? headerBlur : (blur !== undefined ? blur : globalBlur);
  const showGray = grayLayer !== undefined ? grayLayer : globalHeaderGrayLayer;

  // Render Condition:
  // 1. Title Nodes: Always render background (NodeWrapper is transparent)
  // 2. Text/Group Headers: Use headerBlur if set, otherwise fall back to blur behavior
  const shouldRenderBackground = isTitle || !!backgroundColor || headerBlur !== undefined || blur !== undefined;

  if (shouldRenderBackground) {
      if (isBlurry) {
         // Blur effect - use transparency
         tintStyle.backgroundColor = `color-mix(in srgb, ${activeBg}, transparent ${transparency})`;
         tintStyle.backdropFilter = `blur(${blurAmount})`;
         tintStyle.WebkitBackdropFilter = `blur(${blurAmount})`;
      } else {
         // Solid color
         tintStyle.backgroundColor = activeBg;
      }
  }

  return (
    <div
      className={baseClasses}
      onPointerDown={(e) => { 
        onDragStart(e); 
      }}
      onDoubleClick={onEnterEdit}
    >
      {/* 1. Tint/Blur Layer (Background override) */}
      {shouldRenderBackground && (
          <div className="absolute inset-0 pointer-events-none z-0 transition-colors duration-200" style={tintStyle} />
      )}

      {/* 2. Gray Layer Overlay (Sits on top of Background to tint it) */}
      {showGray && (
        <div className="absolute inset-0 bg-zinc-900/[0.06] dark:bg-white/[0.08] pointer-events-none z-0" />
      )}

      {/* 3. Content */}
      <div className="flex items-start gap-2 flex-1 mr-2 pt-0.5 relative z-10">
        {!isTitle && <GripVertical size={16} className="text-zinc-400 dark:text-zinc-600 shrink-0 mt-1" />}
        <textarea
          ref={textareaRef}
          value={title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          disabled={!isEditing}
          className={`font-bold tracking-tight bg-transparent border-none outline-none w-full resize-none overflow-hidden block ${!isEditing ? 'pointer-events-none' : ''} ${fontClass}`}
          style={headerStyle}
          placeholder="Enter title..."
          rows={1}
          onPointerDown={(e) => isEditing && e.stopPropagation()}
        />
      </div>

      <div className="flex items-center gap-1 shrink-0 relative z-10">
        <div
          className={`flex items-center bg-zinc-200/50 dark:bg-white/5 h-[22px] px-1 transition-all duration-200 hover:bg-zinc-200 dark:hover:bg-white/10 mr-1 ${isHovered ? 'opacity-100' : 'opacity-0'} font-sans rounded-sm`}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 mr-0.5 select-none leading-none">Z</span>
          <div className="flex items-center">
            <button
              onPointerDown={(e) => { e.stopPropagation(); onUpdateZIndex(zIndex - 1); }}
              className="w-3 h-3 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-zinc-400 dark:text-zinc-500 transition-colors"
            >
              <span className="text-[9px] font-bold leading-none">-</span>
            </button>
            <input
              type="number"
              value={zIndex.toString()}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  onUpdateZIndex(0);
                } else {
                  const num = parseInt(val);
                  if (!isNaN(num)) onUpdateZIndex(num);
                }
              }}
              className="w-5 bg-transparent text-[10px] font-bold text-zinc-600 dark:text-zinc-400 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center leading-none"
            />
            <button
              onPointerDown={(e) => { e.stopPropagation(); onUpdateZIndex(zIndex + 1); }}
              className="w-3 h-3 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-zinc-400 dark:text-zinc-500 transition-colors"
            >
              <span className="text-[9px] font-bold leading-none">+</span>
            </button>
          </div>
        </div>

        <div 
            className={`flex items-center gap-1 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
            onPointerDown={(e) => e.stopPropagation()}
        >
          <button onMouseDown={onBranch} className="p-1 hover:bg-purple-500/20 text-zinc-400 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-sm" title="Branch Out"><GitBranch size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-1 hover:bg-red-500/20 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-sm"><X size={14} /></button>
        </div>
      </div>
    </div>
  );
};