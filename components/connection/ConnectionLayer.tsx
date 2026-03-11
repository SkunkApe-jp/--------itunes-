import React from 'react';
import { Connection, WikiNode, Position, HandlePosition, ToolMode } from '../../types';
import { ConnectionPath } from './ConnectionPath';
import { ConnectionLabel } from './ConnectionLabel';
import { getHandlePosition, getLabelPosition } from '../../utils/connectionUtils';

interface ConnectionLayerProps {
  connections: Connection[];
  nodes: WikiNode[];
  tempConnection: { start: Position, end: Position } | null;
  onSelectConnection: (id: string) => void;
  onUpdateConnectionLabel: (id: string, label: string) => void;
  onDeleteConnection: (id: string) => void;
  onContextMenu: (e: React.MouseEvent | MouseEvent, type: 'canvas' | 'node' | 'connection' | 'selection', targetId?: string) => void;
  mode?: 'labels' | 'lines';
  toolMode: ToolMode;
  isSpacePressed: boolean;
}

export const ConnectionLayer: React.FC<ConnectionLayerProps> = ({
  connections, nodes, tempConnection, onSelectConnection, onUpdateConnectionLabel, onDeleteConnection, onContextMenu, mode = 'lines', toolMode, isSpacePressed
}) => {
  const getPosition = (nodeId: string, handle?: HandlePosition): Position => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return getHandlePosition(node, handle || 'top', nodes);
  };

  const getCurvedPathD = (start: Position, end: Position) => {
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

    return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
  };

  const OFF = 50000;

  return (
    <svg 
      className="absolute pointer-events-none overflow-visible" 
      style={{ 
        zIndex: mode === 'labels' ? 1000 : 0,
        top: -OFF,
        left: -OFF,
        width: OFF * 2,
        height: OFF * 2
      }}
    >
      <defs>
        <marker
          id="connection-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-main)" fillOpacity="0.7" />
        </marker>
      </defs>

      {connections.filter(conn => !!conn).map(conn => {
        const start = getPosition(conn.sourceId, conn.sourceHandle);
        const end = getPosition(conn.targetId, conn.targetHandle);
        if (start.x === 0 && start.y === 0) return null;
        if (end.x === 0 && end.y === 0) return null;

        const startOff = { x: start.x + OFF, y: start.y + OFF };
        const endOff = { x: end.x + OFF, y: end.y + OFF };

        if (mode === 'lines') {
          return (
            <ConnectionPath
              key={conn.id}
              start={startOff}
              end={endOff}
              isSelected={!!conn.selected}
              onSelect={() => onSelectConnection(conn.id)}
              onContextMenu={(e) => onContextMenu(e, 'connection', conn.id)}
              toolMode={toolMode}
              isSpacePressed={isSpacePressed}
            />
          );
        } else {
          const labelPos = getLabelPosition(start, end, nodes);
          const labelPosOff = { x: labelPos.x + OFF, y: labelPos.y + OFF };
          
          return (
            <ConnectionLabel
              key={conn.id}
              id={conn.id}
              start={startOff}
              end={endOff}
              position={labelPosOff}
              label={conn.label}
              isSelected={!!conn.selected}
              isEditing={!!conn.isEditing}
              onUpdateLabel={(val) => onUpdateConnectionLabel(conn.id, val)}
              onCancelEdit={() => onUpdateConnectionLabel(conn.id, conn.label || '')}
              onDelete={() => onDeleteConnection(conn.id)}
              onDeselect={() => onSelectConnection('')}
              onSelect={(e) => onSelectConnection(conn.id)}
              onContextMenu={(e) => onContextMenu(e, 'connection', conn.id)}
              toolMode={toolMode}
              isSpacePressed={isSpacePressed}
            />
          );
        }
      })}

      {mode === 'lines' && tempConnection && (
        <path
          d={getCurvedPathD(
            { x: tempConnection.start.x + OFF, y: tempConnection.start.y + OFF },
            { x: tempConnection.end.x + OFF, y: tempConnection.end.y + OFF }
          )}
          stroke="var(--text-main)"
          strokeOpacity={0.25}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6,6"
          markerEnd="url(#connection-arrow)"
          fill="none"
        />
      )}
    </svg>
  );
};