import React from 'react';
import { WikiNode, Connection, Viewport, Position, ToolMode, HandlePosition } from '../types';
import { WikiNode as WikiNodeComponent } from './WikiNode';
import { ConnectionLayer } from './connection/ConnectionLayer';
import { StarsBackground } from './StarsBackground';
import { getGridBackground } from '../utils/gridUtils';
import { getCursor } from '../utils/cursorUtils';
import { useCanvasInteractions } from '../hooks/useCanvasInteractions';

interface CanvasProps {
  nodes: WikiNode[];
  connections: Connection[];
  viewport: Viewport;
  toolMode: ToolMode;
  isSpacePressed: boolean;
  onViewportChange: (newViewport: Viewport) => void;
  onUpdateNode: (id: string, updates: Partial<WikiNode>) => void;
  onUpdateNodes: (updates: { id: string, updates: Partial<WikiNode> }[]) => void;
  onDeleteNode: (id: string) => void;
  onSelectNode: (id: string) => void;
  onSelectNodes: (ids: string[]) => void;
  onBranchNode: (id: string, text: string) => void;
  onConnectEnd: (sourceId: string, targetId: string, sourceHandle: HandlePosition, targetHandle: HandlePosition) => void;
  onExpandAI: (id: string, title: string, content: string) => void;
  onEditNodeAI: (id: string, content: string, instruction: string) => void;
  onSetImage: (id: string, title: string, mode: 'generate' | 'search') => void;
  onSelectConnection: (id: string) => void;
  onUpdateConnectionLabel: (id: string, label: string) => void;
  onDeleteConnection: (id: string) => void;
  onReparentNode: (nodeId: string, newParentId: string | undefined) => void;
  onBackgroundDoubleClick: (pos: Position) => void;
  registerFormatRef: (ref: any) => void;
  showGrid: boolean;
  snapToGrid: boolean;
  showStars: boolean;
  globalFont: 'sans' | 'serif' | 'mono'; // Body Font
  globalHeaderFont: 'sans' | 'serif' | 'mono';
  globalHeaderFontSize: number;
  globalHeaderColor: string;
  globalBodyFontSize: number;
  globalColor: string; // Body Color
  globalCaptionFont?: 'sans' | 'serif' | 'mono';
  globalCaptionFontSize?: number;
  globalCaptionColor?: string;
  globalBackgroundColor?: string;
  globalBlur?: boolean;
  globalHeaderGrayLayer?: boolean;
  isDarkMode: boolean;
  onPanDraggingChange?: (isDragging: boolean) => void;
  onSelectionDraggingChange?: (isSelecting: boolean) => void;
  customBackground?: string | null;
  onContextMenu: (e: React.MouseEvent | MouseEvent, type: 'canvas' | 'node' | 'connection' | 'selection', targetId?: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes, connections, viewport, toolMode, isSpacePressed,
  onViewportChange, onUpdateNode, onUpdateNodes, onDeleteNode, onSelectNode, onSelectNodes, onBranchNode, onConnectEnd, onExpandAI, onEditNodeAI, onSetImage,
  onSelectConnection, onUpdateConnectionLabel, onDeleteConnection, onReparentNode, onBackgroundDoubleClick, registerFormatRef,
  showGrid, snapToGrid, showStars, globalFont, globalHeaderFont, globalHeaderFontSize, globalHeaderColor, globalBodyFontSize, globalColor,
  globalCaptionFont = 'sans', globalCaptionFontSize = 11, globalCaptionColor,
  globalBackgroundColor = 'var(--node-bg-0)', globalBlur = false, globalHeaderGrayLayer = true,
  isDarkMode, onPanDraggingChange, onSelectionDraggingChange, customBackground,
  onContextMenu
}) => {
  const interactions = useCanvasInteractions({
    nodes, viewport, snapToGrid, toolMode, isSpacePressed,
    onViewportChange,
    onUpdatePosition: (id, pos) => onUpdateNode(id, { position: pos }),
    onUpdatePositions: (updates) => onUpdateNodes(updates.map(u => ({ id: u.id, updates: { position: u.pos } }))),
    onUpdateSize: (id, w, h) => onUpdateNode(id, { width: w, height: h }),
    onSelectNode, onSelectNodes, onSelectConnection,
    onConnectEnd: (sourceId, targetId, sourceHandle, targetHandle) => onConnectEnd(sourceId, targetId, sourceHandle, targetHandle),
    onReparentNode,
    onPanDraggingChange,
    onSelectionDraggingChange
  });

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left - viewport.x) / viewport.scale;
    const y = (e.clientY - rect.top - viewport.y) / viewport.scale;
    onBackgroundDoubleClick({ x, y });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomSensitivity = 0.005;
      const zoomFactor = Math.exp(-e.deltaY * zoomSensitivity);
      const newScale = Math.min(Math.max(viewport.scale * zoomFactor, 0.1), 5);

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const canvasX = (mouseX - viewport.x) / viewport.scale;
      const canvasY = (mouseY - viewport.y) / viewport.scale;

      const newX = mouseX - canvasX * newScale;
      const newY = mouseY - canvasY * newScale;

      onViewportChange({ x: newX, y: newY, scale: newScale });
    } else {
      onViewportChange({ ...viewport, x: viewport.x - e.deltaX, y: viewport.y - e.deltaY });
    }
  };

  const cursor = getCursor({
    isDraggingCanvas: interactions.isDraggingCanvas.current, isDraggingNode: interactions.isDraggingNode.current,
    isDraggingConnection: interactions.isDraggingConnection.current, isResizingNode: interactions.isResizingNode.current,
    isSpacePressed, toolMode, resizeDirection: interactions.resizeDirection.current
  });

  const isSelectionActive = !!interactions.selectionBox;
  const isDraggingNode = !!interactions.activeNodeId;

  return (
    <div
      className={`canvas-container w-full h-full bg-transparent overflow-hidden relative z-10 touch-none transition-colors duration-300 ${(interactions.isConnectionDraggingState || toolMode === ToolMode.PAN || isSpacePressed || isSelectionActive || isDraggingNode) ? 'select-none' : ''}`}
      onPointerDown={interactions.handlePointerDown}
      onPointerMove={interactions.handlePointerMove} onPointerUp={interactions.handlePointerUp} onPointerLeave={interactions.handlePointerUp}
      onWheel={handleWheel} onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => onContextMenu(e, 'canvas')}
      style={{ cursor, ...getGridBackground({ viewport, showGrid, isDarkMode, customBackground }) }}
    >
      {showStars && <StarsBackground />}
      <div className="absolute inset-0 z-10" style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`, transformOrigin: '0 0', width: '100%', height: '100%', willChange: 'transform' }}>
        <div className={toolMode === ToolMode.PAN || isSpacePressed ? 'pointer-events-none' : ''}>
          <ConnectionLayer connections={connections} nodes={nodes} tempConnection={interactions.tempConnection}
            onSelectConnection={onSelectConnection} onUpdateConnectionLabel={onUpdateConnectionLabel} onDeleteConnection={onDeleteConnection}
            onContextMenu={onContextMenu}
            mode="lines" toolMode={toolMode} isSpacePressed={isSpacePressed}
          />
        </div>
        {interactions.multiSelectBounds && (
          <div
            className="absolute border-2 border-dashed border-blue-500/50 rounded-xl pointer-events-none z-0 bg-blue-500/[0.04]"
            style={{
              left: interactions.multiSelectBounds.x,
              top: interactions.multiSelectBounds.y,
              width: interactions.multiSelectBounds.width,
              height: interactions.multiSelectBounds.height,
            }}
          />
        )}
        {nodes.map((node) => (
          <WikiNodeComponent
            key={node.id} node={node} isSelected={!!node.selected}
            allNodes={nodes}
            onUpdate={onUpdateNode}
            onDelete={onDeleteNode} onSelect={onSelectNode}
            onDragStart={(e, id, n) => {
              if (isSpacePressed || toolMode === ToolMode.PAN) return;
              interactions.startNodeDrag(id, n, e);
            }}
            onExpandAI={onExpandAI} onEditAI={onEditNodeAI} onSetImage={onSetImage}
            onResizeStart={(e, id, n, dir) => {
              if (isSpacePressed || toolMode === ToolMode.PAN) return;
              e.stopPropagation();
              interactions.startResize(id, n, dir, e);
            }}
            onBranch={onBranchNode}
            onDotDown={(e, nid, h) => { e.preventDefault(); e.stopPropagation(); interactions.startConnectionDrag(nid, h); }}
            onDotClick={interactions.handleDotClick}
            onNodeClick={interactions.handleNodeClick}
            onPointerEnter={interactions.handleNodePointerEnter}
            onPointerLeave={interactions.handleNodePointerLeave}
            onHandleEnter={interactions.handleHandlePointerEnter}
            onHandleLeave={interactions.handleHandlePointerLeave}
            activeHandle={interactions.clickConnectionStart}
            isFormatActive={node.selected === true} registerFormatRef={registerFormatRef}
            globalFont={globalFont} globalHeaderFont={globalHeaderFont}
            globalHeaderFontSize={globalHeaderFontSize} globalHeaderColor={globalHeaderColor}
            globalBodyFontSize={globalBodyFontSize} globalColor={globalColor}
            globalCaptionFont={globalCaptionFont} globalCaptionFontSize={globalCaptionFontSize} globalCaptionColor={globalCaptionColor}
            globalBackgroundColor={globalBackgroundColor} globalBlur={globalBlur} globalHeaderGrayLayer={globalHeaderGrayLayer}
            toolMode={toolMode} isSpacePressed={isSpacePressed}
            onContextMenu={(e, nodeId) => onContextMenu(e, 'node', nodeId)}
            isInteractive={!interactions.activeNodeId || interactions.activeNodeId === node.id}
          />
        ))}
        <div className={toolMode === ToolMode.PAN || isSpacePressed ? 'pointer-events-none' : ''}>
          <ConnectionLayer connections={connections} nodes={nodes} tempConnection={interactions.tempConnection}
            onSelectConnection={onSelectConnection} onUpdateConnectionLabel={onUpdateConnectionLabel} onDeleteConnection={onDeleteConnection}
            onContextMenu={onContextMenu}
            mode="labels" toolMode={toolMode} isSpacePressed={isSpacePressed}
          />
        </div>
      </div>
      {interactions.selectionBox && (
        <div
          className="absolute border border-blue-500 bg-blue-500/10 pointer-events-none z-[9999]"
          style={{
            left: Math.min(interactions.selectionBox.start.x, interactions.selectionBox.end.x),
            top: Math.min(interactions.selectionBox.start.y, interactions.selectionBox.end.y),
            width: Math.abs(interactions.selectionBox.start.x - interactions.selectionBox.end.x),
            height: Math.abs(interactions.selectionBox.start.y - interactions.selectionBox.end.y),
          }}
        />
      )}
    </div>
  );
};