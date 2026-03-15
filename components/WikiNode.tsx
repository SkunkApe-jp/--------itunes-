import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { WikiNode as WikiNodeType, HandlePosition, ResizeDirection, ToolMode } from '../types';
import { NodeImage } from './node/NodeImage';
import { NodeHeader } from './node/NodeHeader';
import { TextNodeView } from './node/TextNodeView';
import { ImageNodeView } from './node/ImageNodeView';
import { AIPanel } from './node/AIPanel';
import { NodeWrapper } from './node/NodeWrapper';
import { resolveFont, resolveColor, resolveFontSize } from '../utils/fontUtils';
import { getAbsolutePosition } from '../utils/nodeUtils';

interface WikiNodeProps {
  node: WikiNodeType;
  allNodes?: WikiNodeType[];
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<WikiNodeType>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onDragStart: (e: React.PointerEvent, id: string, node: WikiNodeType) => void;
  onResizeStart: (e: React.PointerEvent, id: string, node: WikiNodeType, dir: ResizeDirection) => void;
  onBranch: (sourceId: string, text: string) => void;
  onExpandAI: (id: string, title: string, content: string) => void;
  onEditAI: (id: string, content: string, instruction: string) => void;
  onSetImage: (id: string, title: string, mode: 'generate' | 'search') => void;
  onDotDown: (e: React.PointerEvent, nodeId: string, handle: HandlePosition) => void;
  onDotClick: (nodeId: string, handle: HandlePosition) => void;
  onNodeClick: (nodeId: string, e: React.PointerEvent) => void;
  onPointerEnter: (nodeId: string) => void;
  onPointerLeave: () => void;
  onHandleEnter: (nodeId: string, handle: HandlePosition) => void;
  onHandleLeave: () => void;
  onFullscreen: (nodeId: string) => void;
  activeHandle: { nodeId: string, handle: HandlePosition } | null;
  isFormatActive: boolean;
  registerFormatRef: (ref: any) => void;
  globalFont: 'sans' | 'serif' | 'mono'; // Body Font
  globalHeaderFont: 'sans' | 'serif' | 'mono'; // Header Font
  globalHeaderFontSize?: number;
  globalHeaderColor?: string;
  globalBodyFontSize?: number;
  globalColor: string; // Body Color
  globalCaptionFont?: 'sans' | 'serif' | 'mono';
  globalCaptionFontSize?: number;
  globalCaptionColor?: string;
  globalBackgroundColor?: string;
  globalBlur?: boolean;
  globalHeaderGrayLayer?: boolean;
  toolMode: ToolMode;
  isSpacePressed: boolean;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  parentZIndexOverride?: number;
  isInteractive?: boolean;
}

export const WikiNode = memo(({
  node, allNodes = [], isSelected, onUpdate, onDelete, onSelect, onDragStart, onResizeStart, onBranch, onExpandAI, onEditAI, onSetImage, onDotDown, onDotClick, onNodeClick, onPointerEnter, onPointerLeave, onHandleEnter, onHandleLeave, onFullscreen, activeHandle, isFormatActive, registerFormatRef, globalFont, globalHeaderFont, globalHeaderFontSize = 18, globalHeaderColor, globalBodyFontSize = 15, globalColor,
  globalCaptionFont = 'sans', globalCaptionFontSize = 11, globalCaptionColor,
  globalBackgroundColor = 'var(--node-bg-0)', globalBlur = false, globalHeaderGrayLayer = true,
  toolMode, isSpacePressed,
  onContextMenu, parentZIndexOverride, isInteractive = true
}: WikiNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Header Resize Logic for Text Nodes
  const headerRef = useRef<HTMLDivElement>(null);
  const prevHeaderHeight = useRef<number>(0);

  useEffect(() => {
    // Only apply to 'text' nodes to avoid conflicts with others which might handle sizing differently
    if (!headerRef.current || node.type !== 'text') return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        
        // Initialize prev height if it's 0 (first mount)
        if (prevHeaderHeight.current === 0) {
            prevHeaderHeight.current = height;
            return;
        }

        if (height !== prevHeaderHeight.current) {
            const delta = height - prevHeaderHeight.current;
            // Update node height to accommodate header expansion/contraction
            // This prevents the body text from being pushed out of the fixed-height container
            onUpdate(node.id, { height: node.height + delta });
            prevHeaderHeight.current = height;
        }
      }
    });
    
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, [node.id, node.height, node.type, onUpdate]);

  // --- RESOLVE STYLES ---
  
  // Font Family
  const effectiveHeaderFont = resolveFont(node.headerFontStyle, node, allNodes, globalHeaderFont, globalFont, globalCaptionFont, 'header');
  const effectiveBodyFont = resolveFont(node.bodyFontStyle, node, allNodes, globalHeaderFont, globalFont, globalCaptionFont, 'body');
  const effectiveCaptionFont = resolveFont(node.captionFontStyle, node, allNodes, globalHeaderFont, globalFont, globalCaptionFont, 'caption');
  const effectiveGroupFont = resolveFont(node.bodyFontStyle || node.fontStyle, node, allNodes, globalHeaderFont, globalFont, globalCaptionFont, 'body');

  // Colors
  const effectiveHeaderColor = resolveColor(node.headerColor, node, allNodes, globalColor, globalHeaderColor || globalColor, globalCaptionColor || globalColor, 'header');
  const effectiveBodyColor = resolveColor(node.bodyColor, node, allNodes, globalColor, globalHeaderColor || globalColor, globalCaptionColor || globalColor, 'body');
  const effectiveCaptionColor = resolveColor(node.captionColor, node, allNodes, globalColor, globalHeaderColor || globalColor, globalCaptionColor || globalColor, 'caption');

  // Font Sizes
  const effectiveHeaderSize = resolveFontSize(node.headerFontSize, node, allNodes, globalHeaderFontSize, 'header');
  const effectiveBodySize = resolveFontSize(node.bodyFontSize, node, allNodes, globalBodyFontSize, 'body');
  const effectiveCaptionSize = resolveFontSize(node.captionFontSize, node, allNodes, globalCaptionFontSize, 'caption');

  // Z-Index Constraint
  let parentZ = parentZIndexOverride;
  if (parentZ === undefined && node.parentId) {
      // Calculate effective Z-index recursively for deep nesting support
      let currentZ = -Infinity;
      const ancestors: WikiNodeType[] = [];
      let currId: string | undefined = node.parentId;
      
      // Collect ancestors up to root
      while (currId) {
          const p = allNodes.find(n => n.id === currId);
          if (!p) break;
          ancestors.push(p);
          currId = p.parentId;
      }
      
      // Calculate top-down (Root -> Parent) to ensure correct stacking
      for (let i = ancestors.length - 1; i >= 0; i--) {
          const ancestor = ancestors[i];
          const stored = ancestor.zIndex ?? 1;
          const ancestorParentZ = currentZ;
          
          // Effective Z is max(stored, parentEffective + 1)
          currentZ = Math.max(stored, ancestorParentZ !== -Infinity ? ancestorParentZ + 1 : -Infinity);
      }
      parentZ = currentZ;
  }
  const minZIndex = parentZ !== undefined ? parentZ + 1 : -Infinity;
  const baseZIndex = Math.max(node.zIndex ?? 1, minZIndex);

  // Check if any ancestor is selected to lift this node's Z-Index as well
  const isAncestorFocused = useMemo(() => {
      let current = node;
      while (current.parentId) {
          const parent = allNodes.find(n => n.id === current.parentId);
          if (!parent) break;
          // If parent is selected, the whole group tree lifts up
          if (parent.selected) return true;
          current = parent;
      }
      return false;
  }, [node, allNodes]);

  // Visual Pop-out (Tempo Z-Index)
  // Bring to top if Selected, Editing, OR if an ancestor is focused
  let visualZIndex = baseZIndex;
  if (isSelected || isEditing || isAncestorFocused) {
      visualZIndex += 1000;
  }

  // --- HEADER BG LOGIC ---
  // Only use header specific settings. If undefined, it will be transparent and show the NodeWrapper background.
  const resolvedHeaderBg = node.headerBackgroundColor;
  const resolvedHeaderBlur = node.headerBlur;

  const areControlsVisible = node.type === 'group' ? isSelected : isHovered;
  const absPos = getAbsolutePosition(node, allNodes);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const measuredHeight = Math.ceil(entry.contentRect.height);
        // Only update if discrepancy is significant to avoid loops
        if (Math.abs(measuredHeight - node.height) > 2) {
          onUpdate(node.id, { height: measuredHeight });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [node.id, node.height, onUpdate]);

  useEffect(() => {
    if (isEditing && isFormatActive) registerFormatRef(textareaRef);
  }, [isEditing, isFormatActive, registerFormatRef]);

  useEffect(() => {
    if (!isSelected) { 
      setIsEditing(false); 
      onUpdate(node.id, { activeAIPanel: undefined });
    }
  }, [isSelected]);

  useEffect(() => {
    if (!isInteractive) setIsHovered(false);
  }, [isInteractive]);

  const handleEnterEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(true);
    onSelect(node.id);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleBranchClick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setAiQuery(window.getSelection()?.toString() || "");
    onUpdate(node.id, { activeAIPanel: 'branch' });
  };

  const submitAI = () => {
    if (!aiQuery.trim() && node.activeAIPanel !== 'expand') return;
    const mode = node.activeAIPanel;
    if (mode === 'branch') onBranch(node.id, aiQuery);
    else if (mode === 'ask') onEditAI(node.id, node.content, `Question: ${aiQuery}`);
    else if (mode === 'edit') onEditAI(node.id, node.content, aiQuery);
    else if (mode === 'expand') onEditAI(node.id, node.content, aiQuery || "Expand this content logically.");
    else if (mode === 'image-gen') onEditAI(node.id, node.content, `Generate image: ${aiQuery}`);
    onUpdate(node.id, { activeAIPanel: undefined });
    setAiQuery("");
  };

  const aiPanel = node.activeAIPanel ? (
    <AIPanel 
      mode={node.activeAIPanel} query={aiQuery} setQuery={setAiQuery} onSubmit={submitAI} 
      onClose={() => onUpdate(node.id, { activeAIPanel: undefined })} 
      globalFont={effectiveGroupFont} position={node.activeAIPanel === 'branch' ? 'top' : 'bottom'}
    />
  ) : null;

  const handleContextMenuWrapper = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    onContextMenu(e, node.id);
  };

  const wrapperProps = {
    ref: containerRef, node, isSelected, toolMode, isSpacePressed,
    onNodeClick: (id: string, e: React.PointerEvent) => { if(isInteractive) onNodeClick(id, e); },
    onPointerEnter, onPointerLeave, onContextMenu: handleContextMenuWrapper,
    onDotDown, onDotClick, onHandleEnter, onHandleLeave, onResizeStart: (e: any, id: any, n: any, dir: any) => { onDragStart(e, id, n); onResizeStart(e, id, n, dir); },
    activeHandle, isEditing, onDragStart: (e: any) => onDragStart(e, node.id, node),
    onMouseEnter: () => { if(isInteractive) setIsHovered(true); },
    onMouseLeave: () => setIsHovered(false),
    isHovered: areControlsVisible,
    zIndex: visualZIndex,
    isInteractive,
    x: absPos.x,
    y: absPos.y,
    globalBackgroundColor,
    globalBlur
  };

  if (node.type === 'group') {
    return (
      <NodeWrapper {...wrapperProps} onResizeStart={(e, id, _, dir) => onResizeStart(e, id, node, dir)}>
        <NodeHeader
          title={node.title} isEditing={isEditing} zIndex={baseZIndex}
          onUpdateTitle={(t) => onUpdate(node.id, { title: t })}
          onUpdateZIndex={(z) => onUpdate(node.id, { zIndex: z })}
          onEnterEdit={handleEnterEdit} onExitEdit={() => setIsEditing(false)}
          onDragStart={(e) => onDragStart(e, node.id, node)} onDelete={() => onDelete(node.id)}
          onBranch={handleBranchClick} onFullscreen={() => onFullscreen(node.id)} hasImage={false} globalFont={effectiveHeaderFont}
          fontStyle={node.headerFontStyle} fontSize={effectiveHeaderSize} headerColor={effectiveHeaderColor} globalColor={globalColor}
          backgroundColor={resolvedHeaderBg} blur={node.blur} headerBlur={resolvedHeaderBlur} grayLayer={node.headerGrayLayer}
          isHovered={areControlsVisible}
          globalBackgroundColor={globalBackgroundColor} globalBlur={globalBlur} globalHeaderGrayLayer={globalHeaderGrayLayer}
        />
      </NodeWrapper>
    );
  }

  if (node.type === 'image') {
    return (
      <NodeWrapper {...wrapperProps} onResizeStart={(e, id, _, dir) => onResizeStart(e, id, node, dir)}>
        <ImageNodeView
          image={node.coverImage} title={node.title} zIndex={baseZIndex}
          fit={node.imageFit} position={node.imagePosition} globalFont={effectiveCaptionFont}
          captionFontStyle={node.captionFontStyle} captionFontSize={effectiveCaptionSize}
          captionColor={effectiveCaptionColor} globalColor={globalColor} height={node.height}
          blur={node.blur} backgroundColor={node.backgroundColor}
          globalBlur={globalBlur} globalBackgroundColor={globalBackgroundColor}
          onDelete={() => onDelete(node.id)} onTitleChange={(t) => onUpdate(node.id, { title: t })}
          onUpdateZIndex={(z) => onUpdate(node.id, { zIndex: z })}
          onDragStart={(e) => onDragStart(e, node.id, node)}
          onUpdateSettings={(f, p) => onUpdate(node.id, { imageFit: f, imagePosition: p })}
          onAskAI={() => onUpdate(node.id, { activeAIPanel: 'ask' })}
          onGenerateImage={() => onUpdate(node.id, { activeAIPanel: 'image-gen' })}
          onFullscreen={() => onFullscreen(node.id)}
          aiPanel={node.activeAIPanel !== 'branch' ? aiPanel : null}
          isHovered={areControlsVisible}
        />
        {node.activeAIPanel === 'branch' && aiPanel}
      </NodeWrapper>
    );
  }

  if (node.type === 'title') {
    return (
      <NodeWrapper {...wrapperProps} onResizeStart={(e, id, _, dir) => onResizeStart(e, id, node, dir)}>
        {node.activeAIPanel && <AIPanel mode={node.activeAIPanel} query={aiQuery} setQuery={setAiQuery} onSubmit={submitAI} onClose={() => onUpdate(node.id, { activeAIPanel: undefined })} globalFont={effectiveHeaderFont} position="top" />}
        <NodeHeader
          title={node.title} isEditing={isEditing} zIndex={baseZIndex}
          onUpdateTitle={(t) => onUpdate(node.id, { title: t })}
          onUpdateZIndex={(z) => onUpdate(node.id, { zIndex: z })}
          onEnterEdit={handleEnterEdit} onExitEdit={() => setIsEditing(false)}
          onDragStart={(e) => onDragStart(e, node.id, node)} onDelete={() => onDelete(node.id)}
          onBranch={handleBranchClick} onFullscreen={() => onFullscreen(node.id)} hasImage={false} globalFont={effectiveHeaderFont}
          fontStyle={node.headerFontStyle} fontSize={effectiveHeaderSize} headerColor={effectiveHeaderColor} globalColor={globalColor}
          backgroundColor={node.backgroundColor} blur={node.blur} headerBlur={node.headerBlur} grayLayer={node.headerGrayLayer}
          isHovered={areControlsVisible}
          isTitle={true}
          globalBackgroundColor={globalBackgroundColor} globalBlur={globalBlur} globalHeaderGrayLayer={globalHeaderGrayLayer}
        />
      </NodeWrapper>
    );
  }

  return (
    <NodeWrapper {...wrapperProps} onResizeStart={(e, id, _, dir) => onResizeStart(e, id, node, dir)}>
      {node.coverImage && (
        <NodeImage
          url={node.coverImage} title={node.title} height={node.imageHeight || 160} fit={node.imageFit || 'cover'} position={node.imagePosition}
          onUpdateImage={(url) => onUpdate(node.id, { coverImage: url })}
          onUpdateSettings={(h, f, p) => onUpdate(node.id, { imageHeight: h, imageFit: f, imagePosition: p })}
          isHovered={areControlsVisible}
        />
      )}
      <div ref={headerRef} className="flex-none">
        <NodeHeader
          title={node.title} isEditing={isEditing} zIndex={baseZIndex} hasImage={!!node.coverImage}
          globalFont={effectiveHeaderFont} fontStyle={node.headerFontStyle} fontSize={effectiveHeaderSize} headerColor={effectiveHeaderColor} globalColor={globalColor}
          onUpdateTitle={(t) => onUpdate(node.id, { title: t })} onUpdateZIndex={(z) => onUpdate(node.id, { zIndex: z })}
          onEnterEdit={handleEnterEdit} onExitEdit={() => setIsEditing(false)}
          onDragStart={(e) => onDragStart(e, node.id, node)} onDelete={() => onDelete(node.id)} onBranch={handleBranchClick}
          onFullscreen={() => onFullscreen(node.id)}
          backgroundColor={resolvedHeaderBg} blur={node.blur} headerBlur={resolvedHeaderBlur} grayLayer={node.headerGrayLayer}
          isHovered={areControlsVisible}
          globalBackgroundColor={globalBackgroundColor} globalBlur={globalBlur} globalHeaderGrayLayer={globalHeaderGrayLayer}
        />
      </div>
      <TextNodeView
        ref={textareaRef} content={node.content} isEditing={isEditing} isGenerating={node.isGenerating}
        fontStyle={node.bodyFontStyle} fontSize={effectiveBodySize} globalFont={effectiveBodyFont}
        bodyColor={effectiveBodyColor} globalColor={globalColor}
        onChange={(e) => onUpdate(node.id, { content: e.target.value })}
        onDoubleClick={handleEnterEdit} onExpand={() => onUpdate(node.id, { activeAIPanel: 'expand' })}
        onEditAI={() => onUpdate(node.id, { activeAIPanel: 'edit' })}
        onImageSearch={() => onSetImage(node.id, node.title, 'search')} onImageGen={() => onSetImage(node.id, node.title, 'generate')}
        aiPanel={node.activeAIPanel !== 'branch' ? aiPanel : null}
        isHovered={areControlsVisible}
      />
      {node.activeAIPanel === 'branch' && aiPanel}
    </NodeWrapper>
  );
}, (prev, next) => (
  prev.node === next.node &&
  prev.node.zIndex === next.node.zIndex &&
  prev.isSelected === next.isSelected &&
  prev.activeHandle === next.activeHandle &&
  prev.onNodeClick === next.onNodeClick &&
  prev.isFormatActive === next.isFormatActive &&
  prev.globalFont === next.globalFont &&
  prev.globalHeaderFont === next.globalHeaderFont &&
  prev.globalHeaderFontSize === next.globalHeaderFontSize &&
  prev.globalHeaderColor === next.globalHeaderColor &&
  prev.globalBodyFontSize === next.globalBodyFontSize &&
  prev.globalCaptionFont === next.globalCaptionFont &&
  prev.globalCaptionFontSize === next.globalCaptionFontSize &&
  prev.globalCaptionColor === next.globalCaptionColor &&
  prev.globalBackgroundColor === next.globalBackgroundColor &&
  prev.globalBlur === next.globalBlur &&
  prev.globalHeaderGrayLayer === next.globalHeaderGrayLayer &&
  prev.allNodes === next.allNodes &&
  prev.parentZIndexOverride === next.parentZIndexOverride &&
  prev.isInteractive === next.isInteractive &&
  prev.toolMode === next.toolMode &&
  prev.isSpacePressed === next.isSpacePressed
));