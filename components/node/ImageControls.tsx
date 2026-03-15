import React from 'react';
import { MoveVertical, AlignCenterVertical, Crop, MousePointer2, X, Maximize2 } from 'lucide-react';

interface ImageControlsProps {
    isRepositioning: boolean;
    zIndex: number;
    fit: 'cover' | 'contain';
    position: string;
    onToggleRepositioning: () => void;
    onUpdateZIndex: (newZ: number) => void;
    onToggleFit: () => void;
    onCyclePosition: () => void;
    onDelete: () => void;
    onFullscreen: () => void;
    globalFont: 'sans' | 'serif' | 'mono';
    isHovered: boolean;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
    isRepositioning, zIndex, fit, position, onToggleRepositioning, onUpdateZIndex, onToggleFit, onCyclePosition, onDelete, onFullscreen, globalFont, isHovered
}) => {
    const btnCommon = "p-1.5 backdrop-blur-sm transition-colors";
    const standardBtn = `${btnCommon} bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-black/5 dark:border-white/10`;
    const activeBtn = `${btnCommon} bg-custom-blue-500 text-white border border-custom-blue-600 shadow-md`;
    const deleteBtn = `${btnCommon} bg-white/80 dark:bg-black/60 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 border border-black/5 dark:border-white/10`;

    return (
        <div className={`absolute top-2 right-2 flex flex-col gap-1 transition-opacity z-10 ${isRepositioning || isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex gap-1">
                <div
                    className={`flex items-center backdrop-blur-sm bg-white/80 dark:bg-black/60 h-[28px] px-1.5 border border-black/5 dark:border-white/10 transition-all hover:bg-white dark:hover:bg-black font-sans`}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mr-1 select-none leading-none">Z</span>
                    <div className="flex items-center">
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); onUpdateZIndex(zIndex - 1); }}
                            className="w-4 h-4 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 dark:text-zinc-500 transition-colors"
                        >
                            <span className="text-[10px] leading-none">-</span>
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
                            className="w-7 bg-transparent text-[11px] font-bold text-zinc-600 dark:text-zinc-400 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center leading-none"
                        />
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); onUpdateZIndex(zIndex + 1); }}
                            className="w-4 h-4 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 dark:text-zinc-500 transition-colors"
                        >
                            <span className="text-[10px] leading-none">+</span>
                        </button>
                    </div>
                </div>

                <button onClick={(e) => { e.stopPropagation(); onToggleRepositioning(); }} className={isRepositioning ? activeBtn : standardBtn} title={isRepositioning ? "Finish Repositioning" : "Crop / Reposition"}>
                    {isRepositioning ? <MousePointer2 size={14} /> : <Crop size={14} />}
                </button>

                {!isRepositioning && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); onToggleFit(); }} className={standardBtn} title="Toggle Fit"><MoveVertical size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onCyclePosition(); }} className={standardBtn} title="Cycle Position"><AlignCenterVertical size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onFullscreen(); }} className={standardBtn} title="Fullscreen"><Maximize2 size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className={deleteBtn} title="Delete Image"><X size={14} /></button>
                    </>
                )}
            </div>
        </div>
    );
};