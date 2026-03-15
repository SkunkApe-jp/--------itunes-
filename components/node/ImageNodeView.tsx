import React, { useRef, useState, useEffect } from 'react';
import { getPosPercentages, cyclePosition } from '../../utils/imagePositionUtils';
import { ImageControls } from './ImageControls';
import { MessageSquare, Sparkles } from 'lucide-react';

interface ImageNodeViewProps {
  image?: string;
  title: string;
  zIndex: number;
  fit?: 'cover' | 'contain';
  position?: string;
  onDelete: () => void;
  onTitleChange: (val: string) => void;
  onUpdateZIndex: (newZ: number) => void;
  onDragStart: (e: React.PointerEvent) => void;
  onUpdateSettings: (fit: 'cover' | 'contain', position: string) => void;
  onFullscreen: () => void;
  globalFont: 'sans' | 'serif' | 'mono';
  captionFontStyle?: 'sans' | 'serif' | 'mono' | 'global';
  captionFontSize?: number;
  captionColor?: string;
  globalColor?: string;
  height: number;
  onAskAI?: () => void;
  onGenerateImage?: () => void;
  aiPanel?: React.ReactNode;
  isHovered: boolean;
  blur?: boolean;
  backgroundColor?: string;
  globalBlur?: boolean;
  globalBackgroundColor?: string;
}

export const ImageNodeView: React.FC<ImageNodeViewProps> = ({
  image, title, zIndex, fit = 'contain', position = 'center', onDelete, onTitleChange, onUpdateZIndex, onDragStart, onUpdateSettings, onFullscreen, globalFont, captionFontStyle, captionFontSize, captionColor, globalColor, height,
  onAskAI, onGenerateImage, aiPanel, isHovered, blur, backgroundColor, globalBlur = false, globalBackgroundColor = 'var(--node-bg-0)'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const effectiveFont = (captionFontStyle && captionFontStyle !== 'global' ? captionFontStyle : globalFont);
  const fontClass = effectiveFont === 'serif' ? 'font-serif' : effectiveFont === 'mono' ? 'font-mono' : 'font-sans';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [localPos, setLocalPos] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number, y: number, posX: number, posY: number } | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [title, captionFontSize]);

  useEffect(() => {
    if (!isRepositioning) setLocalPos(null);
  }, [position, isRepositioning]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    if (isRepositioning) {
      e.stopPropagation(); e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const currentPosString = localPos || position;
      const { x, y } = getPosPercentages(currentPosString);
      dragStartRef.current = { x: e.clientX, y: e.clientY, posX: x, posY: y };
    } else {
      onDragStart(e);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isRepositioning && dragStartRef.current && containerRef.current) {
      e.stopPropagation();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const bounds = containerRef.current.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      const percentChangeX = (deltaX / bounds.width) * 100 * 1.2;
      const percentChangeY = (deltaY / bounds.height) * 100 * 1.2;
      const newX = Math.max(0, Math.min(100, dragStartRef.current.posX - percentChangeX));
      const newY = Math.max(0, Math.min(100, dragStartRef.current.posY - percentChangeY));
      setLocalPos(`${newX.toFixed(1)}% ${newY.toFixed(1)}%`);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isRepositioning && dragStartRef.current) {
      e.stopPropagation();
      if (e.currentTarget.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId);
      dragStartRef.current = null;
      if (localPos) onUpdateSettings(fit, localPos);
    }
  };

  const activePosition = localPos || position;
  
  // Use global defaults if node specific is undefined
  const isBlurry = blur !== undefined ? blur : globalBlur;
  const activeBg = backgroundColor || globalBackgroundColor;

  // Match HUD: 36px blur, ~0.85 opacity (15% transparency)
  const transparency = '15%';
  const blurAmount = '36px';

  const captionStyle: React.CSSProperties = {
      backdropFilter: isBlurry ? `blur(${blurAmount})` : 'none',
      WebkitBackdropFilter: isBlurry ? `blur(${blurAmount})` : 'none',
  };

  let captionClasses = isBlurry 
    ? `glass-panel border-x-0 border-b-0 border-t border-zinc-200 dark:border-white/10 flex items-center py-3 px-4 shrink-0 transition-colors duration-200`
    : `flex items-center py-3 px-4 shrink-0 transition-colors duration-200 border-t border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white`;

  if (isBlurry) {
      if (activeBg) {
          captionStyle.backgroundColor = `color-mix(in srgb, ${activeBg}, transparent ${transparency})`;
      } else {
          // Rely on glass-panel for default bg to match HUD
      }
  } else {
      captionStyle.backgroundColor = activeBg;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div
        ref={containerRef}
        className={`w-full relative overflow-hidden bg-white dark:bg-[#09090b] select-none flex-1 ${isRepositioning ? 'cursor-move' : ''}`}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
      >
        {image ? (
          <img src={image} className="w-full h-full pointer-events-none select-none transition-none absolute inset-0 will-change-[object-position]"
            style={{ objectFit: fit, objectPosition: activePosition }} alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-mono text-xs">NO IMAGE DATA</div>
        )}

        {isRepositioning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10 dark:bg-white/5 border-2 border-custom-blue-500/50 z-20">
            <div className="bg-black/75 text-white text-[10px] px-2 py-1 backdrop-blur-md font-medium shadow-lg">Drag to Reposition</div>
          </div>
        )}

        <ImageControls
          isRepositioning={isRepositioning} fit={fit} position={position}
          zIndex={zIndex} onUpdateZIndex={onUpdateZIndex} globalFont={globalFont}
          onToggleRepositioning={() => setIsRepositioning(!isRepositioning)}
          onToggleFit={() => onUpdateSettings(fit === 'cover' ? 'contain' : 'cover', position)}
          onCyclePosition={() => onUpdateSettings(fit, cyclePosition(position))}
          onDelete={onDelete}
          onFullscreen={onFullscreen}
          isHovered={isHovered}
        />

        {aiPanel}

        <div className={`absolute bottom-0 left-0 right-0 h-9 border-t border-zinc-200 dark:border-white/10 flex items-center gap-1 px-2 bg-zinc-50/95 dark:bg-[#18181b]/95 backdrop-blur-md shrink-0 font-sans transition-all duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} z-10`}>
          <button onClick={(e) => { e.stopPropagation(); onAskAI?.(); }} className="flex items-center gap-1.5 text-[10px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 px-2 py-1 transition-colors uppercase tracking-wider"><MessageSquare size={11} /> Ask AI</button>
          <div className="w-px h-3 bg-zinc-300 dark:bg-white/10 mx-1"></div>
          <button onClick={(e) => { e.stopPropagation(); onGenerateImage?.(); }} className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 transition-colors uppercase tracking-wider"><Sparkles size={11} /> Regenerate</button>
        </div>
      </div>

      <div 
        className={captionClasses}
        style={captionStyle}
      >
        <textarea
          ref={textareaRef}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`w-full font-semibold text-center bg-transparent outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-700 resize-none overflow-hidden block ${fontClass} leading-tight break-words`}
          placeholder="Add a caption..."
          rows={1}
          onPointerDown={(e) => {
            if (document.activeElement === e.currentTarget) {
              e.stopPropagation();
            }
          }}
          style={{ height: 'auto', minHeight: '16px', fontSize: captionFontSize ? `${captionFontSize}px` : '11px', color: captionColor || globalColor || undefined }}
        />
      </div>
    </div>
  );
};