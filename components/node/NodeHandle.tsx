import React from 'react';
import { HandlePosition } from '../../types';

interface NodeHandleProps {
  position: HandlePosition;
  onDown: (e: React.PointerEvent) => void;
  onClick: () => void;
  onEnter: () => void;
  onLeave: () => void;
  isSelected?: boolean;
  isHovered?: boolean;
}

export const NodeHandle: React.FC<NodeHandleProps> = ({ position, onDown, onClick, onEnter, onLeave, isSelected, isHovered }) => {
  let style: React.CSSProperties = {};
  // Center the 24px hitbox (12px offset) relative to the edge
  switch (position) {
    case 'top': style = { top: -12, left: '50%', transform: 'translateX(-50%)' }; break;
    case 'bottom': style = { bottom: -12, left: '50%', transform: 'translateX(-50%)' }; break;
    case 'left': style = { left: -12, top: '50%', transform: 'translateY(-50%)' }; break;
    case 'right': style = { right: -12, top: '50%', transform: 'translateY(-50%)' }; break;
  }

  return (
    <div
      className={`absolute w-6 h-6 z-50 cursor-crosshair flex items-center justify-center group/handle`}
      style={style}
      data-handle={position}
      onPointerDown={(e) => { e.stopPropagation(); onDown(e); }}
      onPointerUp={(e) => { 
        onClick(); 
      }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
        <div 
            className={`w-2.5 h-2.5 rounded-full bg-white dark:bg-[#09090b] border transition-all duration-200 
                ${isSelected 
                    ? 'border-custom-blue-500 bg-custom-blue-500 opacity-100 scale-125' 
                    : 'border-zinc-400 dark:border-zinc-500 opacity-0 group-hover/handle:opacity-100 group-hover/handle:bg-custom-blue-500 group-hover/handle:border-custom-blue-500'
                } 
                ${isHovered ? 'opacity-100' : ''}`}
            />
    </div>
  );
};