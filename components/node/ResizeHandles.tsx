import React from 'react';
import { ResizeDirection } from '../../types';

interface ResizeHandlesProps {
    nodeId: string;
    onResizeStart: (e: React.PointerEvent, id: string, dir: ResizeDirection) => void;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ nodeId, onResizeStart }) => {
    const handleBase = "absolute bg-white dark:bg-zinc-800 border border-custom-blue-600 dark:border-custom-blue-500 z-50 shadow-sm transition-transform hover:scale-125";
    const cornerSize = "w-3.5 h-3.5";

    return (
        <>
            {/* Edges (Invisible larger hit areas) */}
            <div className="absolute -top-1.5 left-0 right-0 h-4 cursor-n-resize z-30" onPointerDown={(e) => onResizeStart(e, nodeId, 'n')} />
            <div className="absolute -bottom-1.5 left-0 right-0 h-4 cursor-s-resize z-30" onPointerDown={(e) => onResizeStart(e, nodeId, 's')} />
            <div className="absolute top-0 -left-1.5 bottom-0 w-4 cursor-w-resize z-30" onPointerDown={(e) => onResizeStart(e, nodeId, 'w')} />
            <div className="absolute top-0 -right-1.5 bottom-0 w-4 cursor-e-resize z-30" onPointerDown={(e) => onResizeStart(e, nodeId, 'e')} />

            {/* Corners (Visible handles) */}
            <div className={`${handleBase} ${cornerSize} cursor-nw-resize`} style={{ top: -6, left: -6 }} onPointerDown={(e) => onResizeStart(e, nodeId, 'nw')} />
            <div className={`${handleBase} ${cornerSize} cursor-ne-resize`} style={{ top: -6, right: -6 }} onPointerDown={(e) => onResizeStart(e, nodeId, 'ne')} />
            <div className={`${handleBase} ${cornerSize} cursor-sw-resize`} style={{ bottom: -6, left: -6 }} onPointerDown={(e) => onResizeStart(e, nodeId, 'sw')} />
            <div className={`${handleBase} ${cornerSize} cursor-se-resize`} style={{ bottom: -6, right: -6 }} onPointerDown={(e) => onResizeStart(e, nodeId, 'se')} />

            {/* Visual Borders for selection */}
            <div className="absolute inset-0 pointer-events-none border-2 border-custom-blue-500/30 z-20"></div>
        </>
    );
};