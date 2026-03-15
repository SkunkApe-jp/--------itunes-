import React, { useRef, useState } from 'react';
import { ImagePlus, X, MoveVertical, AlignCenterVertical, ArrowUpFromLine, ArrowDownFromLine } from 'lucide-react';

interface NodeImageProps {
  url: string;
  title: string;
  height: number;
  fit: 'cover' | 'contain';
  position?: string;
  onUpdateImage: (url: string | undefined) => void;
  onUpdateSettings: (height: number, fit: 'cover' | 'contain', position: string) => void;
  isHovered?: boolean;
}

export const NodeImage: React.FC<NodeImageProps> = ({ url, title, height, fit, position = 'center', onUpdateImage, onUpdateSettings, isHovered }) => {
  const resizeStartPos = useRef<number>(0);
  const resizeStartHeight = useRef<number>(0);
  const [isResizing, setIsResizing] = useState(false);

  const handleChangeImage = () => {
    const newUrl = prompt("Enter new image URL (or leave empty to remove):", url);
    if (newUrl !== null) onUpdateImage(newUrl || undefined);
  };

  const cyclePosition = () => {
    const sequence = ['center', 'top', 'bottom'];
    const idx = sequence.indexOf(position);
    const next = sequence[(idx + 1) % sequence.length];
    onUpdateSettings(height, fit, next);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId);
    resizeStartPos.current = e.clientY; resizeStartHeight.current = height; setIsResizing(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isResizing) return;
    e.stopPropagation();
    const delta = e.clientY - resizeStartPos.current;
    onUpdateSettings(Math.min(800, Math.max(50, resizeStartHeight.current + delta)), fit, position);
  };

  return (
    <div className="relative w-full shrink-0 bg-zinc-200 dark:bg-[#09090b] group/image border-b border-zinc-200 dark:border-white/10" style={{ height }}>
      <img src={url} alt={title} className="w-full h-full pointer-events-none select-none transition-all duration-300" style={{ objectFit: fit, objectPosition: position }} />
      
      <div className={`absolute top-2 right-2 flex flex-col gap-1 transition-opacity z-10 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); handleChangeImage(); }} className="p-1.5 bg-white/80 dark:bg-black/60 backdrop-blur text-zinc-600 dark:text-zinc-300 hover:text-custom-blue-600 dark:hover:text-custom-blue-400 border border-black/5 dark:border-white/10" title="Change Image"><ImagePlus size={14} /></button>
            
            <button onClick={(e) => {e.stopPropagation(); onUpdateSettings(height, fit === 'cover' ? 'contain' : 'cover', position)}} className="p-1.5 bg-white/80 dark:bg-black/60 backdrop-blur text-zinc-600 dark:text-zinc-300 hover:text-custom-blue-600 dark:hover:text-custom-blue-400 border border-black/5 dark:border-white/10" title={fit === 'cover' ? "Switch to Contain" : "Switch to Cover"}><MoveVertical size={14} /></button>
            
            {fit === 'cover' && (
                <button onClick={(e) => {e.stopPropagation(); cyclePosition()}} className="p-1.5 bg-white/80 dark:bg-black/60 backdrop-blur text-zinc-600 dark:text-zinc-300 hover:text-custom-blue-600 dark:hover:text-custom-blue-400 border border-black/5 dark:border-white/10" title="Cycle Position">
                    {position === 'top' ? <ArrowUpFromLine size={14} /> : position === 'bottom' ? <ArrowDownFromLine size={14} /> : <AlignCenterVertical size={14} />}
                </button>
            )}

            <button onClick={(e) => { e.stopPropagation(); onUpdateImage(undefined); }} className="p-1.5 bg-white/80 dark:bg-black/60 backdrop-blur text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border border-black/5 dark:border-white/10" title="Remove Image"><X size={14} /></button>
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center hover:opacity-100 transition-opacity bg-gradient-to-t from-black/20 dark:from-black/50 to-transparent ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={(e) => { e.stopPropagation(); setIsResizing(false); }}
      >
        <div className="w-8 h-0.5 bg-white/50 dark:bg-white/30"></div>
      </div>
    </div>
  );
};