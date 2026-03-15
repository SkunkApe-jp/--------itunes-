import React, { forwardRef, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Wand2 } from 'lucide-react';

interface TextNodeViewProps {
  content: string;
  isEditing: boolean;
  isGenerating?: boolean;
  fontStyle?: 'sans' | 'serif' | 'mono' | 'global';
  fontSize?: number;
  globalFont?: 'sans' | 'serif' | 'mono';
  bodyColor?: string;
  globalColor?: string;
  backgroundColor?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDoubleClick: () => void;
  onExpand: () => void;
  onEditAI: () => void;
  onImageSearch: () => void;
  onImageGen: () => void;
  aiPanel?: React.ReactNode;
  isHovered: boolean;
}

// Custom Markdown Components for Table Styling
const MarkdownTable = ({ node, ...props }: any) => (
  <div className="overflow-x-auto my-4 rounded-lg border border-zinc-200 dark:border-white/10 shadow-sm scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600">
    <table className="min-w-full divide-y divide-zinc-200 dark:divide-white/10" {...props} />
  </div>
);

const MarkdownThead = ({ node, ...props }: any) => (
  <thead className="bg-zinc-50 dark:bg-white/5" {...props} />
);

const MarkdownTbody = ({ node, ...props }: any) => (
  <tbody className="divide-y divide-zinc-200 dark:divide-white/10 bg-transparent" {...props} />
);

const MarkdownTr = ({ node, ...props }: any) => (
  <tr className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-white/5" {...props} />
);

const MarkdownTh = ({ node, ...props }: any) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none whitespace-nowrap" {...props} />
);

const MarkdownTd = ({ node, ...props }: any) => (
  <td className="px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 whitespace-normal leading-relaxed min-w-[120px]" {...props} />
);

export const TextNodeView = forwardRef<HTMLTextAreaElement, TextNodeViewProps>(({
  content, isEditing, isGenerating, fontStyle, fontSize, globalFont = 'sans', bodyColor, globalColor, backgroundColor, onChange, onDoubleClick, onExpand, onEditAI, onImageSearch, onImageGen,
  aiPanel, isHovered
}, ref) => {

  const effectiveFont = (fontStyle && fontStyle !== 'global' ? fontStyle : globalFont);
  const fontClass = effectiveFont === 'serif' ? 'font-serif' : effectiveFont === 'mono' ? 'font-mono' : 'font-sans';

  const lastScrollTimeRef = useRef<number>(0);
  const boundaryReachedRef = useRef<'top' | 'bottom' | null>(null);

  const handleScrollPriority = (e: React.WheelEvent<HTMLElement>) => {
    // 1. Horizontal Scroll Trap
    // Prevent Canvas panning when scrolling horizontally inside a node (e.g. tables, code blocks).
    // This logic traps the event if horizontal movement dominates, ensuring the scroll stays local.
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.stopPropagation();
        return;
    }

    const el = e.currentTarget;
    const isScrollable = el.scrollHeight > el.clientHeight;

    if (!isScrollable) return;

    const isAtTop = el.scrollTop <= 0;
    const isAtBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 1;
    const now = Date.now();

    if (isAtTop && e.deltaY < 0) {
      if (boundaryReachedRef.current !== 'top') {
        boundaryReachedRef.current = 'top';
        lastScrollTimeRef.current = now;
      }
      if (now - lastScrollTimeRef.current < 500) {
        e.stopPropagation();
        return;
      }
    } else if (isAtBottom && e.deltaY > 0) {
      if (boundaryReachedRef.current !== 'bottom') {
        boundaryReachedRef.current = 'bottom';
        lastScrollTimeRef.current = now;
      }
      if (now - lastScrollTimeRef.current < 500) {
        e.stopPropagation();
        return;
      }
    } else {
      boundaryReachedRef.current = null;
    }

    if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
      e.stopPropagation();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        // Get the current line up to the cursor
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineContent = value.substring(lineStart, start);

        // Regex to detect list patterns:
        // Group 1: Indentation (\s*)
        // Group 2: Bullet ([-*+]), Number (\d+\.), or Quote (>)
        const listRegex = /^(\s*)([-*+]|\d+\.|>)\s/;
        const match = lineContent.match(listRegex);

        if (match) {
            const fullMatch = match[0];
            const indent = match[1];
            const marker = match[2];

            // Case 1: Empty list item (User presses enter on an empty bullet line) -> Exit list
            // We check if the trimmed content equals the trimmed marker (ignoring spaces at end)
            if (lineContent.trim() === fullMatch.trim()) {
                e.preventDefault();
                // Remove the list marker from the current line
                const newValue = value.substring(0, lineStart) + value.substring(start);
                
                onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);
                
                // Wait for render to update state, then move cursor to start of line (which is now empty)
                setTimeout(() => {
                    if (textarea) textarea.setSelectionRange(lineStart, lineStart);
                }, 0);
                return;
            }

            // Case 2: Content exists, create next list item
            e.preventDefault();
            
            let nextMarker = marker;
            
            // If numbered list, increment
            if (/^\d+\.$/.test(marker)) {
                const num = parseInt(marker);
                nextMarker = `${num + 1}.`;
            }

            // Construct insertion: Newline + Indent + Marker + Space
            const insertion = `\n${indent}${nextMarker} `;
            const newValue = value.substring(0, start) + insertion + value.substring(end);

            onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);

            // Move cursor to end of new marker
            setTimeout(() => {
                const newCursorPos = start + insertion.length;
                if (textarea) textarea.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        }
    }
  };

  return (
    <div 
      className={`flex-1 overflow-hidden relative flex flex-col transition-colors duration-300 ${fontClass}`}
      style={{ backgroundColor: backgroundColor || 'transparent' }}
    >
      {isEditing ? (
        <textarea
          ref={ref}
          value={content}
          onChange={onChange}
          onWheel={handleScrollPriority}
          onKeyDown={handleKeyDown}
          className={`wiki-textarea flex-1 w-full h-full p-4 resize-none leading-relaxed bg-transparent border-none ${fontClass}`}
          style={{ fontSize: fontSize ? `${fontSize}px` : '15px', color: bodyColor || globalColor || undefined }}
          spellCheck={false}
          onPointerDown={(e) => {
            if (isEditing) e.stopPropagation();
          }}
          onClick={(e) => {
            if (isEditing) e.stopPropagation();
          }}
          onDoubleClick={onDoubleClick}
          placeholder="Write in Markdown..."
        />
      ) : (
        <div
          className="markdown-content flex-1 overflow-y-auto px-4 py-3 select-text cursor-default bg-transparent pb-10"
          style={{ fontSize: fontSize ? `${fontSize}px` : '15px', color: bodyColor || globalColor || undefined }}
          onDoubleClick={onDoubleClick}
          onWheel={handleScrollPriority}
        >
          {content ? (
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    table: MarkdownTable,
                    thead: MarkdownThead,
                    tbody: MarkdownTbody,
                    tr: MarkdownTr,
                    th: MarkdownTh,
                    td: MarkdownTd
                }}
            >
                {content}
            </ReactMarkdown>
          ) : (
            <p className="text-zinc-400 dark:text-zinc-500 italic">Double click to edit...</p>
          )}
        </div>
      )}

      {isGenerating && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-custom-blue-500 border-t-transparent"></div>
            <span className="text-xs text-custom-blue-600 dark:text-custom-blue-400 font-medium animate-pulse">AI Thinking...</span>
          </div>
        </div>
      )}

      {aiPanel}

      {!isEditing && (
        <div className={`absolute bottom-0 left-0 right-0 h-9 border-t border-zinc-200 dark:border-white/10 flex items-center gap-1 px-2 bg-zinc-50/95 dark:bg-[#18181b]/95 backdrop-blur-md shrink-0 font-sans transition-all duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} z-10`}>
          <button onClick={(e) => { e.stopPropagation(); onExpand(); }} className="flex items-center gap-1.5 text-[10px] font-semibold text-custom-blue-600 dark:text-custom-blue-400 hover:bg-custom-blue-500/10 px-2 py-1 transition-colors uppercase tracking-wider"><Sparkles size={11} /> Expand with AI</button>
          <div className="w-px h-3 bg-zinc-300 dark:bg-white/10 mx-1"></div>
          <button onClick={(e) => { e.stopPropagation(); onEditAI(); }} className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 px-2 py-1 transition-colors uppercase tracking-wider"><Wand2 size={11} /> Edit with AI</button>
        </div>
      )}
    </div>
  );
});