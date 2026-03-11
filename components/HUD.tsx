import React, { useState } from 'react';

import { ChevronDown, ChevronUp, Info, Keyboard } from 'lucide-react';

interface HUDProps {
  nodeCount: number;
  connectionCount: number;
  wordCount: number;
  zoomScale: number;
  lastSaved: Date | null;
  globalFont: 'sans' | 'serif' | 'mono';
}

const ShortcutRow = ({ label, action }: { label: string, action: string }) => (
  <div className="flex items-center justify-between w-full text-[10px] gap-6 group/row">
    <span className="text-zinc-500 dark:text-zinc-400 group-hover/row:text-zinc-800 dark:group-hover/row:text-zinc-200 transition-colors">{label}</span>
    <span className="font-mono text-[9px] font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100/80 dark:bg-white/5 px-1.5 py-0.5 border border-zinc-200/50 dark:border-white/10 rounded-sm whitespace-nowrap shadow-[0_1px_0_rgba(0,0,0,0.05)] dark:shadow-none">{action}</span>
  </div>
);

export const HUD: React.FC<HUDProps> = ({ nodeCount, connectionCount, wordCount, zoomScale, lastSaved, globalFont }) => {

  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className={`fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3 pointer-events-none font-mono`}>
      {/* System Status Panel - Always Visible */}
      <div className="force-glass p-1.5 pointer-events-auto shadow-2xl w-[180px] flex flex-col animate-in slide-in-from-right-4 duration-500">

        <div className="flex items-center gap-2.5 px-2.5 py-1.5 border-b border-zinc-200/50 dark:border-white/5 mb-1.5">
          <Info size={14} className="text-zinc-500 dark:text-zinc-400" />
          <span className="text-[10px] uppercase tracking-[0.15em] font-black text-zinc-500 dark:text-zinc-400">System Status</span>
        </div>

        <div className="flex flex-col gap-2 px-2 pb-1.5">
          {lastSaved && (
            <div className="flex items-center justify-between gap-2 text-[9px] text-zinc-400 dark:text-zinc-500 w-full pb-1.5">
              <span className="uppercase tracking-wider font-bold opacity-60">Last Sync</span>
              <div className="flex items-center gap-1.5 bg-green-500/10 dark:bg-green-500/5 px-1.5 py-0.5 rounded-full border border-green-500/20">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span className="font-bold">{lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-[9px] text-zinc-400 dark:text-zinc-500 w-full">
            <span className="uppercase tracking-wider font-bold opacity-60">Nodes</span>
            <span className="font-bold text-zinc-600 dark:text-zinc-300">{nodeCount}</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[9px] text-zinc-400 dark:text-zinc-500 w-full">
            <span className="uppercase tracking-wider font-bold opacity-60">Links</span>
            <span className="font-bold text-zinc-600 dark:text-zinc-300">{connectionCount}</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[9px] text-zinc-400 dark:text-zinc-500 w-full">
            <span className="uppercase tracking-wider font-bold opacity-60">Words</span>
            <span className="font-bold text-zinc-600 dark:text-zinc-300">{wordCount}</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[9px] text-zinc-400 dark:text-zinc-500 w-full">
            <span className="uppercase tracking-wider font-bold opacity-60">Zoom</span>
            <span className="font-bold text-zinc-600 dark:text-zinc-300">{Math.round(zoomScale * 100)}%</span>
          </div>

        </div>
      </div>

      {/* Shortcuts Panel - Collapsible */}
      <div className={`force-glass p-1.5 pointer-events-auto transition-all duration-300 shadow-2xl w-[180px] flex flex-col ${isCollapsed ? 'h-10 justify-center' : 'h-auto animate-in slide-in-from-bottom-2'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center justify-between gap-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all w-full px-2.5 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 ${isCollapsed ? '' : 'mb-2 bg-black/5 dark:bg-white/5'}`}
        >
          <div className="flex items-center gap-2.5">
            <Keyboard size={14} className="opacity-70" />
            <span className="text-[10px] uppercase tracking-[0.15em] font-black">Shortcuts</span>
          </div>
          {isCollapsed ? <ChevronUp size={14} className="opacity-50" /> : <ChevronDown size={14} className="opacity-50" />}
        </button>

        {!isCollapsed && (
          <div className="flex flex-col gap-2.5 w-full animate-in slide-in-from-bottom-1 zoom-in-95 duration-200 px-2 pb-2">
            <div className="flex flex-col gap-1.5">
              <ShortcutRow label="Pan Canvas" action="Space" />
              <ShortcutRow label="Zoom View" action="Ctrl+Wheel" />
              <ShortcutRow label="New Node" action="T / DblClk" />
              <ShortcutRow label="Connect" action="Drag Dot" />
              <ShortcutRow label="Save State" action="Ctrl+S" />
              <ShortcutRow label="Delete" action="Del" />
              <ShortcutRow label="Paste" action="Ctrl+V" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};