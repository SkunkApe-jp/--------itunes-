import React from 'react';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Quote, Droplets, RotateCcw, Layers, Strikethrough, Minus } from 'lucide-react';
import { ColorButton } from './ColorButton';

interface FormatToolbarProps {
  onInsertMarkdown: (prefix: string, suffix?: string) => void;
  backgroundColor?: string;
  onUpdateBackgroundColor?: (color: string) => void;
  blur?: boolean;
  onToggleBlur?: () => void;
  grayLayer?: boolean;
  onToggleGrayLayer?: () => void;
  onRestoreDefaults?: () => void;
}

const BG_COLORS = [
  'var(--node-bg-0)',
  'var(--node-bg-1)',
  'var(--node-bg-2)',
  'var(--node-bg-3)',
  'var(--node-bg-4)',
  'var(--node-bg-5)',
  'var(--node-bg-6)',
];

export const FormatToolbar: React.FC<FormatToolbarProps> = ({ 
  onInsertMarkdown, backgroundColor, onUpdateBackgroundColor, blur, onToggleBlur, grayLayer, onToggleGrayLayer, onRestoreDefaults 
}) => {
  const handleMouseDown = (e: React.MouseEvent, prefix: string, suffix: string = '') => {
    e.preventDefault();
    onInsertMarkdown(prefix, suffix);
  };

  const btnClass = "w-7 h-7 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded";

  return (
    <div className="flex items-center gap-0.5 glass-panel p-1 animate-in slide-in-from-bottom-2 duration-200 h-9">
      <button onMouseDown={(e) => handleMouseDown(e, '# ', '')} className={btnClass} title="Heading 1"><Heading1 size={14} /></button>
      <button onMouseDown={(e) => handleMouseDown(e, '## ', '')} className={btnClass} title="Heading 2"><Heading2 size={14} /></button>
      <button onMouseDown={(e) => handleMouseDown(e, '### ', '')} className={btnClass} title="Heading 3"><Heading3 size={14} /></button>
      
      <div className="w-px h-4 bg-zinc-300 dark:bg-white/10 mx-0.5" />
      
      <button onMouseDown={(e) => handleMouseDown(e, '**', '**')} className={btnClass} title="Bold"><Bold size={14} /></button>
      <button onMouseDown={(e) => handleMouseDown(e, '*', '*')} className={btnClass} title="Italic"><Italic size={14} /></button>
      <button onMouseDown={(e) => handleMouseDown(e, '***', '***')} className={btnClass} title="Bold Italic">
        <div className="flex items-center -space-x-1"><Bold size={10} /><Italic size={10} /></div>
      </button>
      <button onMouseDown={(e) => handleMouseDown(e, '~~', '~~')} className={btnClass} title="Strikethrough"><Strikethrough size={14} /></button>
      
      <div className="w-px h-4 bg-zinc-300 dark:bg-white/10 mx-0.5" />
      
      <button onMouseDown={(e) => handleMouseDown(e, '- ', '')} className={btnClass} title="Bullet List (-)"><List size={14} /></button>
      <button onMouseDown={(e) => handleMouseDown(e, '1. ', '')} className={btnClass} title="Numbered List (1.)"><ListOrdered size={14} /></button>
      <button onMouseDown={(e) => handleMouseDown(e, '> ', '')} className={btnClass} title="Quote"><Quote size={14} /></button>
      <button onMouseDown={(e) => handleMouseDown(e, '\n---\n', '')} className={btnClass} title="Horizontal Rule"><Minus size={14} /></button>
      
      {onUpdateBackgroundColor && (
        <>
          <div className="w-px h-4 bg-zinc-300 dark:bg-white/10 mx-0.5" />
          <div className="flex items-center gap-0.5">
            {BG_COLORS.map(c => (
              <ColorButton 
                key={c} 
                color={c} 
                current={backgroundColor || 'var(--node-bg-0)'} 
                onClick={() => onUpdateBackgroundColor(c)} 
              />
            ))}
          </div>
        </>
      )}

      {onToggleBlur && (
        <>
          <div className="w-px h-4 bg-zinc-300 dark:bg-white/10 mx-0.5" />
          
          {onRestoreDefaults && (
            <button
              onClick={onRestoreDefaults}
              className={btnClass}
              title="Restore Defaults"
            >
              <RotateCcw size={14} />
            </button>
          )}

          <button
              onClick={onToggleBlur}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${blur ? 'bg-custom-blue-500/20 text-custom-blue-600 dark:text-custom-blue-400' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'}`}
              title="Toggle Blur"
          >
              <Droplets size={14} />
          </button>

          {onToggleGrayLayer && (
            <button
                onClick={onToggleGrayLayer}
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${grayLayer ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'}`}
                title={grayLayer ? "Disable Header Gray Layer" : "Enable Header Gray Layer"}
            >
                <Layers size={14} />
            </button>
          )}
        </>
      )}
    </div>
  );
};