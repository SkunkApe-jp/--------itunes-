import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MousePointer, Move, Image as ImageIcon, StickyNote, Upload, Save, Download, RefreshCcw, HardDrive, Grid, Magnet, Sun, Moon, ChevronLeft, ChevronRight, Settings, Sparkles, Star, X } from 'lucide-react';
import { ToolMode } from '../../types';

interface ToolButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-8 h-8 flex items-center justify-center transition-colors ${active
      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
      : 'text-zinc-500 dark:text-zinc-400 hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-100'
      }`}
    title={label}
  >
    {icon}
  </button>
);

interface ToolbarProps {
  onAddNode: (type: 'text' | 'image' | 'title', title: string, content?: string, image?: string) => void;
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;

  // Save/Load Props
  isAutoSave: boolean;
  onToggleAutoSave: () => void;
  onSaveLocal: () => void;
  onLoadLocal: () => void;
  onExportFile: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Grid Props
  showGrid: boolean;
  snapToGrid: boolean;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  showStars: boolean;
  onToggleStars: () => void;

  customBackground: string | null;
  onSetCustomBackground: (img: string | null) => void;

  // Theme
  isDarkMode: boolean;
  onToggleTheme: () => void;

  // Settings / System
  onOpenSettings: () => void;
  onOpenWelcome: () => void;

  children?: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode, toolMode, setToolMode, onZoomIn, onZoomOut,
  isAutoSave, onToggleAutoSave, onSaveLocal, onLoadLocal, onExportFile, onImportFile,
  showGrid, snapToGrid, onToggleGrid, onToggleSnap,
  showStars, onToggleStars,
  customBackground, onSetCustomBackground,
  isDarkMode, onToggleTheme, onOpenSettings, onOpenWelcome,
  children
}) => {
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const saveBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateRect = () => {
      if (showSaveMenu && saveBtnRef.current) {
        setMenuRect(saveBtnRef.current.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [showSaveMenu]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        onAddNode('image', '', undefined, evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImportFile(e);
    setShowSaveMenu(false);
    if (importInputRef.current) importInputRef.current.value = '';
  }

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        onSetCustomBackground(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  const btnClass = "w-8 h-8 flex items-center justify-center transition-colors text-zinc-500 dark:text-zinc-400 hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-100";
  const activeBtnClass = "bg-blue-500/20 text-blue-600 dark:text-blue-400";
  const menuTextClass = "text-zinc-600 dark:text-zinc-400 hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-100 transition-colors";

  // Enhanced glass menu style - using CSS variables for consistency
  const glassMenuClass = "absolute bottom-full left-0 mb-2 w-48 shadow-2xl flex flex-col py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-[200] force-glass pointer-events-auto";
  const containerClass = "relative p-1 flex items-center gap-0.5 h-10 force-glass shadow-sm pointer-events-auto";

  return (
    <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-3 items-start pointer-events-none">
      <div className="pointer-events-auto">{children}</div>

      <div className="pointer-events-auto flex items-end gap-2">
        {/* Always Visible Group */}
        <div className="flex items-center gap-2">
          {/* System / Save Menu + Settings */}
          <div className={containerClass}>
            <button
              ref={saveBtnRef}
              onClick={() => setShowSaveMenu(!showSaveMenu)}
              className={`${showSaveMenu ? 'bg-black/5 text-zinc-900 dark:bg-white/10 dark:text-zinc-100' : ''} ${btnClass}`}
              title="System, Save & Load Menu"
            >
              <Save size={18} />
            </button>

            <button onClick={onOpenSettings} className={btnClass} title="Configure AI Provider & Settings">
              <Settings size={18} />
            </button>

            {showSaveMenu && createPortal(
              <>
                <div className="fixed inset-0 z-[199]" onClick={() => setShowSaveMenu(false)} />
                <div
                  className={`${glassMenuClass} fixed`}
                  style={{
                    bottom: menuRect ? (window.innerHeight - menuRect.top + 8) : 'auto',
                    left: menuRect ? menuRect.left : 'auto',
                    backgroundColor: 'var(--glass-bg)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                  }}
                >
                  <button onClick={onToggleAutoSave} className={`flex items-center justify-between px-3 py-2 text-xs text-left group ${menuTextClass}`} title="Toggle automatic saving">
                    <span className="flex items-center gap-2"><RefreshCcw size={12} /> Auto-Save</span>
                    <div className={`w-2 h-2 ${isAutoSave ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-zinc-300 dark:bg-zinc-600'}`}></div>
                  </button>
                  <div className="h-px bg-zinc-200 dark:bg-white/10 my-1 mx-2"></div>
                  <button onClick={() => { onSaveLocal(); setShowSaveMenu(false); }} className={`flex items-center gap-2 px-3 py-2 text-xs text-left ${menuTextClass}`} title="Save current graph to browser storage"><HardDrive size={12} /> Save to Browser</button>
                  <button onClick={() => { onLoadLocal(); setShowSaveMenu(false); }} className={`flex items-center gap-2 px-3 py-2 text-xs text-left ${menuTextClass}`} title="Load graph from browser storage"><RefreshCcw size={12} /> Load from Browser</button>
                  <div className="h-px bg-zinc-200 dark:bg-white/10 my-1 mx-2"></div>
                  <button onClick={() => { onExportFile(); setShowSaveMenu(false); }} className={`flex items-center gap-2 px-3 py-2 text-xs text-left ${menuTextClass}`} title="Download graph as JSON"><Download size={12} /> Export JSON</button>
                  <button onClick={() => importInputRef.current?.click()} className={`flex items-center gap-2 px-3 py-2 text-xs text-left ${menuTextClass}`} title="Upload JSON graph file"><Upload size={12} /> Import JSON</button>
                  <div className="h-px bg-zinc-200 dark:bg-white/10 my-1 mx-2"></div>
                  <button onClick={() => { onOpenWelcome(); setShowSaveMenu(false); }} className={`flex items-center gap-2 px-3 py-2 text-xs text-left ${menuTextClass}`} title="Show the welcome screen again"><Sparkles size={12} /> Show Welcome Screen</button>
                </div>
              </>,
              document.body
            )}
            <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleImport} />
          </div>

          <div className={`${containerClass}`}>
            <button onClick={() => onAddNode('text', 'Untitled', '')} className={btnClass} title="Create a new Text Node">
              <StickyNote size={18} />
            </button>

            <button onClick={() => onAddNode('title', 'New Title', '')} className={btnClass} title="Create a new Title Node">
              <span className="text-sm font-bold leading-none px-0.5">T</span>
            </button>

            <div className="relative">
              <button onClick={() => fileInputRef.current?.click()} className={btnClass} title="Upload an Image Node">
                <ImageIcon size={18} />
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>
        </div>

        {/* Collapsible Tools (Middle) */}
        {!isCollapsed && (
          <div className={`${containerClass} px-1 py-1 flex items-center gap-0.5 animate-in slide-in-from-left-2 duration-300 fade-in`}>
            <ToolButton active={toolMode === ToolMode.SELECT} onClick={() => setToolMode(ToolMode.SELECT)} icon={<MousePointer size={18} />} label="Select Tool (V) - Click to select, Drag to move" />
            <ToolButton active={toolMode === ToolMode.PAN} onClick={() => setToolMode(ToolMode.PAN)} icon={<Move size={18} />} label="Pan Tool (Space) - Drag to move canvas" />
            <div className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1"></div>

            <button onClick={onToggleGrid} className={`${showGrid ? activeBtnClass : ''} ${btnClass}`} title="Toggle Background Grid"><Grid size={18} /></button>
            {!showGrid && (
              <button onClick={onToggleStars} className={`${showStars ? activeBtnClass : ''} ${btnClass}`} title="Toggle Stars Background"><Star size={18} /></button>
            )}
            <button onClick={() => bgInputRef.current?.click()} className={`${customBackground ? activeBtnClass : ''} ${btnClass}`} title="Set Background Image"><ImageIcon size={18} /></button>
            {customBackground && (
              <button onClick={() => onSetCustomBackground(null)} className={btnClass} title="Remove Background Image"><X size={18} /></button>
            )}
            <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={handleBgUpload} />
            <button onClick={onToggleSnap} className={`${snapToGrid ? activeBtnClass : ''} ${btnClass}`} title="Toggle Snap to Grid"><Magnet size={18} /></button>

            <div className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1"></div>
            <button onClick={onZoomOut} className={`font-mono text-lg ${btnClass}`} title="Zoom Out">-</button>
            <button onClick={onZoomIn} className={`font-mono text-lg ${btnClass}`} title="Zoom In">+</button>

            <div className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1"></div>
            <button onClick={onToggleTheme} className={btnClass} title="Toggle Light/Dark Mode">
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        )}

        {/* Toggle Button (Right Side, Same Height) */}
        <div className={containerClass}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={btnClass}
            title={isCollapsed ? "Expand Toolbar" : "Collapse Toolbar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};