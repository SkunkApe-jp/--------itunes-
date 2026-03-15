import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Tab } from '../../types/tabTypes';

interface TabItemProps {
    tab: Tab;
    isActive: boolean;
    canClose: boolean;
    tabCount: number;
    index: number;
    onSwitch: () => void;
    onClose: () => void;
    onRename: (newTitle: string) => void;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    draggedIndex: number | null;
    dragOverIndex: number | null;
}

const MIN_TAB_WIDTH = 120;

export const TabItem: React.FC<TabItemProps> = ({ 
    tab, isActive, canClose, tabCount, index, 
    onSwitch, onClose, onRename, 
    onDragStart, onDragOver, onDragLeave, onDragEnd, onDrop,
    draggedIndex, dragOverIndex 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(tab.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const isBeingDraggedOver = dragOverIndex === index;

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditValue(tab.title);
        setIsEditing(true);
    };

    const handleSubmit = () => {
        const trimmed = editValue.trim();
        if (trimmed && trimmed !== tab.title) onRename(trimmed);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
        else if (e.key === 'Escape') { setEditValue(tab.title); setIsEditing(false); }
    };

    const handleClose = (e: React.MouseEvent) => { e.stopPropagation(); onClose(); };

    // Dynamic width: flex-1 (fill available) when few tabs, min-width when overflow
    const shouldUseFlex = tabCount * MIN_TAB_WIDTH < window.innerWidth - 100;

    return (
        <div
            draggable={!isEditing}
            onClick={onSwitch}
            onDoubleClick={handleDoubleClick}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            className={`group relative h-full flex items-center justify-between gap-1 px-3
        border-r border-zinc-200/50 dark:border-white/5 cursor-pointer select-none transition-all duration-150 shrink-0
        ${isActive ? 'bg-white/80 dark:bg-white/10 text-zinc-900 dark:text-white' : 'bg-zinc-100/50 dark:bg-white/[0.02] text-zinc-500 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/5'}
        ${isBeingDraggedOver ? 'bg-custom-blue-500/5' : ''}`}
            style={{ flex: shouldUseFlex ? '1 1 0%' : '0 0 auto', minWidth: `${MIN_TAB_WIDTH}px` }}
        >
            {isBeingDraggedOver && (
                <div className={`absolute top-0 bottom-0 w-0.5 bg-custom-blue-500 z-10 ${draggedIndex !== null && index < draggedIndex ? 'left-0' : 'right-0'}`} />
            )}
            
            {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-custom-blue-500" />}

            {isEditing ? (
                <input ref={inputRef} type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSubmit} onKeyDown={handleKeyDown} onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-xs font-medium bg-transparent outline-none border-b border-custom-blue-500 text-zinc-900 dark:text-white min-w-0" />
            ) : (
                <span className="flex-1 truncate text-xs font-medium">{tab.title}</span>
            )}

            {canClose && !isEditing && (
                <button onClick={handleClose}
                    className={`shrink-0 p-0.5 transition-opacity ${isActive ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover:opacity-60 hover:!opacity-100'} hover:text-red-500 dark:hover:text-red-400`}>
                    <X size={12} />
                </button>
            )}
        </div>
    );
};