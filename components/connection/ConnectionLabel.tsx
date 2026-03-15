import React, { useState, useEffect, useRef } from 'react';
import { Position, ToolMode } from '../../types';
import { X, Check } from 'lucide-react';

interface ConnectionLabelProps {
  id: string;
  start: Position;
  end: Position;
  position?: Position; // Optional override for the label position
  label?: string;
  isSelected: boolean;
  isEditing?: boolean;
  onUpdateLabel: (val: string) => void;
  onCancelEdit?: () => void;
  onDelete: () => void;
  onDeselect: () => void;
  onSelect: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  toolMode: ToolMode;
  isSpacePressed: boolean;
}

export const ConnectionLabel: React.FC<ConnectionLabelProps> = ({
  id, start, end, position, label, isSelected, isEditing: isEditingProp, onUpdateLabel, onCancelEdit, onDelete, onDeselect, onSelect, onContextMenu, toolMode, isSpacePressed
}) => {
  const midX = position ? position.x : (start.x + end.x) / 2;
  const midY = position ? position.y : (start.y + end.y) / 2;
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus and select text when editing starts
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  // Sync with isEditingProp
  useEffect(() => {
    if (isEditingProp) {
      setEditingLabel(label || "");
      setIsEditing(true);
    }
  }, [isEditingProp, label]);

  // Start editing when selection changes to true
  useEffect(() => {
    if (!isSelected) {
      setEditingLabel(null);
      setIsEditing(false);
    }
  }, [isSelected]);

  const submitLabel = (shouldDeselect = true) => {
    if (editingLabel !== null && editingLabel !== label) {
      onUpdateLabel(editingLabel);
    } else {
      onCancelEdit?.();
    }
    setIsEditing(false);
    if (shouldDeselect) onDeselect();
  };

  if (!label && !isSelected) return null;

  return (
    <foreignObject
      x={midX - 60}
      y={midY - 20}
      width={120}
      height={40}
      style={{ overflow: 'visible', pointerEvents: 'none' }}
    >
      <div className="flex justify-center items-center h-full relative" style={{ pointerEvents: 'auto' }}>
        {isEditing ? (
          <div className="flex items-center gap-1 bg-white dark:bg-[#18181b] border border-custom-blue-500/50 p-1 shadow-lg rounded" onPointerDown={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              className="w-20 text-[10px] outline-none bg-transparent text-zinc-900 dark:text-white border-b border-custom-blue-500/30"
              placeholder="Label..."
              value={editingLabel ?? label ?? ""}
              onChange={(e) => setEditingLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitLabel(true);
                if (e.key === 'Escape') { setIsEditing(false); onDeselect(); }
              }}
              onBlur={() => submitLabel(false)}
            />
            <button onPointerDown={(e) => e.preventDefault()} onClick={() => submitLabel(true)} className="text-green-600 dark:text-green-400 hover:bg-green-500/20 p-0.5"><Check size={10} /></button>
            <button onPointerDown={(e) => e.preventDefault()} onClick={onDelete} className="text-red-600 dark:text-red-400 hover:bg-red-500/20 p-0.5"><X size={10} /></button>
          </div>
        ) : (
          <div
            className={`px-2 py-0.5 glass-panel text-[10px] truncate max-w-[100px] select-none cursor-pointer border ${isSelected ? 'border-custom-blue-500/50 bg-custom-blue-500/5' : 'border-zinc-200 dark:border-white/10'} text-zinc-500 dark:text-zinc-400`}
            onPointerDown={(e) => { 
              if (toolMode === ToolMode.PAN || isSpacePressed || e.button !== 0) return;
              e.stopPropagation(); 
              if (isSelected) {
                setEditingLabel(label || "");
                setIsEditing(true);
              } else {
                onSelect(e as any); 
              }
            }}
            onContextMenu={onContextMenu}
          >
            {label || "+"}
          </div>
        )}
      </div>
    </foreignObject>
  );
};