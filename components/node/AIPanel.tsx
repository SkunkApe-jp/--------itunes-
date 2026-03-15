import React, { useRef, useEffect } from 'react';
import { Wand2, MessageSquare, Sparkles, X, ArrowRight, LucideIcon, Network } from 'lucide-react';
import { AIPanelMode } from '../../types';

interface AIPanelProps {
    mode: AIPanelMode;
    query: string;
    setQuery: (val: string) => void;
    onSubmit: () => void;
    onClose: () => void;
    globalFont: 'sans' | 'serif' | 'mono';
    position?: 'top' | 'bottom';
}

export const AIPanel: React.FC<AIPanelProps> = ({ 
    mode, 
    query, 
    setQuery, 
    onSubmit, 
    onClose, 
    globalFont,
    position = 'bottom'
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 50);
    }, []);

    const config: Record<AIPanelMode, { 
        icon: LucideIcon, 
        title: string, 
        placeholder: string, 
        color: string, 
        btnBg: string,
        btnHover: string,
        focusBorder: string,
        btnTitle: string, 
        description?: string 
    }> = {
        edit: { 
            icon: Wand2, 
            title: 'AI Edit', 
            placeholder: "How should AI change this? (e.g. 'Make it professional', 'Fix grammar')", 
            color: 'text-amber-500 dark:text-amber-400',
            btnBg: 'bg-amber-600',
            btnHover: 'hover:bg-amber-500',
            focusBorder: 'focus:border-amber-500/50',
            btnTitle: 'Apply AI Edit',
            description: 'Refine or rewrite the existing content based on your instructions.'
        },
        branch: { 
            icon: Network, 
            title: 'AI Branch', 
            placeholder: "What sub-topic should we explore next?", 
            color: 'text-purple-500 dark:text-purple-400',
            btnBg: 'bg-purple-600',
            btnHover: 'hover:bg-purple-500',
            focusBorder: 'focus:border-purple-500/50',
            btnTitle: 'Generate Branch',
            description: 'Create a new connected node to expand on a specific idea.'
        },
        ask: { 
            icon: MessageSquare, 
            title: 'Ask AI', 
            placeholder: "What would you like to know about this image?", 
            color: 'text-red-500 dark:text-red-400',
            btnBg: 'bg-red-600',
            btnHover: 'hover:bg-red-500',
            focusBorder: 'focus:border-red-500/50',
            btnTitle: 'Ask AI',
            description: 'Get insights, details, or explanations about the visual content.'
        },
        expand: { 
            icon: Sparkles, 
            title: 'AI Expand', 
            placeholder: "Add context or leave blank for a general expansion...", 
            color: 'text-custom-blue-500 dark:text-custom-blue-400',
            btnBg: 'bg-custom-blue-600',
            btnHover: 'hover:bg-custom-blue-500',
            focusBorder: 'focus:border-custom-blue-500/50',
            btnTitle: 'Expand with AI',
            description: 'Automatically elaborate on the current text with more depth and detail.'
        },
        'image-gen': { 
            icon: Sparkles, 
            title: 'AI Image', 
            placeholder: "Describe the new image... (e.g. 'A futuristic city at sunset')", 
            color: 'text-emerald-500 dark:text-emerald-400',
            btnBg: 'bg-emerald-600',
            btnHover: 'hover:bg-emerald-500',
            focusBorder: 'focus:border-emerald-500/50',
            btnTitle: 'Generate Image',
            description: 'Generate a completely new image based on your text prompt.'
        }
    };

    const { icon: Icon, title, placeholder, color, btnBg, btnHover, focusBorder, btnTitle, description } = config[mode];

    const posClass = position === 'top' ? 'top-12' : 'bottom-10';

    return (
        <div className={`absolute ${posClass} left-2 right-2 z-[60] animate-in fade-in zoom-in-95 duration-200 font-sans`} onPointerDown={(e) => e.stopPropagation()}>
            <div className="glass-panel p-2 flex flex-col gap-2 shadow-2xl border border-white/20 dark:border-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-between px-1">
                    <span className={`text-[10px] uppercase font-bold ${color} flex items-center gap-1`}>
                        <Icon size={10} /> {title}
                    </span>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                        <X size={12} />
                    </button>
                </div>
                {description && (
                    <p className="text-[9px] text-zinc-500 dark:text-zinc-400 px-1 leading-snug">
                        {description}
                    </p>
                )}
                <div className="flex gap-1">
                    <input
                        ref={inputRef}
                        className={`flex-1 bg-white/50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 outline-none ${focusBorder} placeholder:text-zinc-400 dark:placeholder:text-zinc-600`}
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                    />
                    <button onClick={onSubmit} className={`${btnBg} ${btnHover} text-white p-1.5 transition-colors`} title={btnTitle}>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};