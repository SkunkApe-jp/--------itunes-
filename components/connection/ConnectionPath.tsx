import React from 'react';
import { Position, ToolMode } from '../../types';

interface ConnectionPathProps {
  start: Position;
  end: Position;
  isSelected: boolean;
  onSelect: (e: React.PointerEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  toolMode: ToolMode;
  isSpacePressed: boolean;
  marker: string;
}

export const ConnectionPath: React.FC<ConnectionPathProps> = ({
  start, end, isSelected, onSelect, onContextMenu, toolMode, isSpacePressed, marker
}) => {
  const d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

  return (
    <g
      className="connection-path group"
      onPointerDown={(e) => { 
        if (toolMode === ToolMode.PAN || isSpacePressed) return;
        e.stopPropagation(); 
        onSelect(e); 
      }}
      onContextMenu={onContextMenu}
      style={{ cursor: toolMode === ToolMode.PAN || isSpacePressed ? 'inherit' : 'pointer', pointerEvents: 'auto' }}
    >
      {/* Invisible wider path for better hit detection */}
      <path
        d={d}
        stroke="transparent"
        strokeWidth="60"
        fill="none"
      />

      {/* Visible line */}
      <path
        d={d}
        stroke="var(--text-main)"
        strokeOpacity={isSelected ? 0.9 : 0.35}
        strokeWidth={isSelected ? "3" : "2.25"}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={`url(#${marker})`}
        className="transition-opacity duration-200 group-hover:opacity-70"
        fill="none"
      />
    </g>
  );
};