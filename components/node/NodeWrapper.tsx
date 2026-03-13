import React, { forwardRef } from 'react';
import { WikiNode, ToolMode, HandlePosition, ResizeDirection } from '../../types';
import { NodeHandle } from './NodeHandle';
import { ResizeHandles } from './ResizeHandles';

interface NodeWrapperProps {
    node: WikiNode;
    isSelected: boolean;
    toolMode: ToolMode;
    isSpacePressed: boolean;
    onNodeClick: (nodeId: string, e: React.PointerEvent) => void;
    onPointerEnter: (nodeId: string) => void;
    onPointerLeave: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
    onDotDown: (e: React.PointerEvent, nodeId: string, handle: HandlePosition) => void;
    onDotClick: (nodeId: string, handle: HandlePosition) => void;
    onHandleEnter: (nodeId: string, handle: HandlePosition) => void;
    onHandleLeave: () => void;
    onResizeStart: (e: React.PointerEvent, id: string, node: WikiNode, dir: ResizeDirection) => void;
    activeHandle: { nodeId: string, handle: HandlePosition } | null;
    children: React.ReactNode;
    isEditing?: boolean;
    isHovered?: boolean;
    zIndex?: number;
    isInteractive?: boolean;
    x: number;
    y: number;
    globalBackgroundColor?: string;
    globalBlur?: boolean;
}

export const NodeWrapper = forwardRef<HTMLDivElement, NodeWrapperProps>(({
    node, isSelected, toolMode, isSpacePressed,
    onNodeClick, onPointerEnter, onPointerLeave, onMouseEnter, onMouseLeave, onContextMenu,
    onDotDown, onDotClick, onHandleEnter, onHandleLeave, onResizeStart,
    activeHandle, children, isEditing, isHovered, zIndex, isInteractive = true,
    x, y, globalBackgroundColor = 'var(--node-bg-0)', globalBlur = false
}, ref) => {
    
    const isNestedGroup = node.type === 'group' && !!node.parentId;
    const isTitle = node.type === 'title';

    let classes = `absolute flex flex-col group overflow-visible transition-shadow duration-200 ${isSelected ? 'shadow-xl' : ''} ${toolMode === ToolMode.PAN || isSpacePressed || !isInteractive ? 'pointer-events-none' : ''}`;

    if (isNestedGroup || isTitle) {
        classes += ' bg-transparent';
    } else {
        classes += ' glass-panel';
        if (!isSelected) classes += ' hover:shadow-xl';
    }

    const effectiveZIndex = zIndex ?? node.zIndex ?? 1;

    /**
     * VISUAL DESIGN POLICY:
     * 1. Default Blur uses global setting (default false)
     * 2. Glass effect transparency is fixed at ~15% (0.85 opacity) for consistent legibility.
     * 3. Blur radius increased to 36px for more diffusion.
     */
    const isBlurry = node.blur !== undefined ? node.blur : globalBlur;

    let style: React.CSSProperties = {
        left: x,
        top: y,
        width: node.width,
        height: isTitle ? 'auto' : node.height,
        zIndex: effectiveZIndex
    };

    // Override backdrop filter for nested groups/titles manually since we aren't using the glass-panel class fully
    if (isNestedGroup || isTitle) {
        style.backdropFilter = 'none';
        style.WebkitBackdropFilter = 'none';
        style.backgroundColor = 'transparent';
    } else {
        // Resolve background color: Node specific > Global
        const baseColor = node.backgroundColor || globalBackgroundColor;

        if (isBlurry) {
            // Glass effect matching HUD aesthetic (36px blur, ~0.85 opacity)
            // Mix base color to match glass opacity (15% transparency = 0.85 alpha)
            style.backgroundColor = `color-mix(in srgb, ${baseColor}, transparent 15%)`;
            style.backdropFilter = 'blur(15px)';
            style.WebkitBackdropFilter = 'blur(15px)';
        } else {
            // Solid effect - Force opacity 1
            style.backgroundColor = baseColor;
            style.backdropFilter = 'none';
            style.WebkitBackdropFilter = 'none';
        }
    }

    if (node.type === 'image') {
        style.backgroundColor = 'transparent';
        style.backdropFilter = 'none';
        style.WebkitBackdropFilter = 'none';
        style.border = 'none';
    }

    if (isSelected) {
        classes += ' border-transparent';
    } else {
        if (isTitle) {
             classes += ' border-transparent';
        } else {
             classes += ' border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20';
        }
        if (isNestedGroup) {
             classes += ' border border-dashed';
        }
    }

    return (
        <div 
            ref={ref}
            className={classes}
            data-node-id={node.id}
            style={style}
            onPointerDown={(e) => { 
                if (toolMode === ToolMode.PAN || isSpacePressed || !isInteractive) return;
                
                if (node.type === 'group') return;

                e.stopPropagation();
                if (!isEditing) onNodeClick(node.id, e);
            }}
            onPointerEnter={() => isInteractive && onPointerEnter(node.id)}
            onPointerLeave={onPointerLeave}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onDoubleClick={(e) => e.stopPropagation()}
            onContextMenu={onContextMenu}
        >
            {isInteractive && (['top', 'right', 'bottom', 'left'] as HandlePosition[]).map(pos => (
                <NodeHandle 
                    key={pos} 
                    position={pos} 
                    onDown={(e) => onDotDown(e, node.id, pos)} 
                    onClick={() => onDotClick(node.id, pos)}
                    onEnter={() => onHandleEnter(node.id, pos)}
                    onLeave={onHandleLeave}
                    isSelected={activeHandle?.nodeId === node.id && activeHandle?.handle === pos}
                    isHovered={isHovered}
                />
            ))}

            {isSelected && isInteractive && !isSpacePressed && toolMode !== ToolMode.PAN && (
                <ResizeHandles nodeId={node.id} onResizeStart={(e, id, dir) => onResizeStart(e, id, node, dir)} />
            )}
            
            {children}
        </div>
    );
});