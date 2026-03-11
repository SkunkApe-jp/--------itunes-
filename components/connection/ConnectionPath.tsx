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
}

export const ConnectionPath: React.FC<ConnectionPathProps> = ({
  start, end, isSelected, onSelect, onContextMenu, toolMode, isSpacePressed
}) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const isMostlyHorizontal = absDx >= absDy;
  const dir = isMostlyHorizontal ? Math.sign(dx || 1) : Math.sign(dy || 1);
  const curve = Math.max(60, Math.min(220, (isMostlyHorizontal ? absDx : absDy) * 0.5));

  const c1 = isMostlyHorizontal
    ? { x: start.x + curve * dir, y: start.y }
    : { x: start.x, y: start.y + curve * dir };
  const c2 = isMostlyHorizontal
    ? { x: end.x - curve * dir, y: end.y }
    : { x: end.x, y: end.y - curve * dir };

  const d = `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;

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
        markerEnd="url(#connection-arrow)"
        className="transition-opacity duration-200 group-hover:opacity-70"
        fill="none"
      />
    </g>
  );
};