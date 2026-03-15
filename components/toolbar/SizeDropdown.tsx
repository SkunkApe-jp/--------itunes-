import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface SizeDropdownProps {
    value: number;
    options: number[];
    onChange: (val: number) => void;
    label?: string;
    globalFont: 'sans' | 'serif' | 'mono';
}

export const SizeDropdown: React.FC<SizeDropdownProps> = ({ value, options, onChange, label, globalFont }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleSelect = (val: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(val);
        setIsOpen(false);
    };

    const rect = buttonRef.current?.getBoundingClientRect();
    const dropdownHeight = 200; // Estimated max height
    const spaceBelow = rect ? window.innerHeight - rect.bottom : 0;
    const showAbove = spaceBelow < dropdownHeight && (rect?.top || 0) > dropdownHeight;

    return (
        <div className="relative inline-block shrink-0">
            <button
                ref={buttonRef}
                onClick={toggle}
                className={`flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-bold text-custom-blue-600 dark:text-custom-blue-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-custom-blue-400 transition-colors rounded hover:bg-black/5 dark:hover:bg-white/5 font-sans h-7 w-10 justify-center shrink-0`}
            >
                <span className="truncate">{value}</span>
                <ChevronDown size={6} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} opacity-50 shrink-0`} />
            </button>

            {isOpen && createPortal(
                <>
                    <div className="fixed inset-0 z-[200]" onClick={() => setIsOpen(false)} />
                    <div
                        className={`fixed z-[201] w-12 shadow-2xl animate-in fade-in ${showAbove ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'} zoom-in-95 duration-100 flex flex-col overflow-hidden border border-[var(--glass-border)] font-sans pointer-events-auto rounded-lg`}
                        style={{
                            top: rect ? (showAbove ? rect.top - Math.min(dropdownHeight, (options.length * 24 + 20)) - 8 : rect.bottom + 4) : 0,
                            left: rect ? rect.left : 0,
                            maxHeight: `${dropdownHeight}px`,
                            backgroundColor: 'var(--glass-bg)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                        }}
                    >
                        {label && (
                            <div className="px-0 py-0.5 border-b border-[var(--glass-border)] bg-zinc-50/50 dark:bg-white/5 shrink-0">
                                <span className="text-[5px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter text-center block leading-tight">
                                    {label}
                                </span>
                            </div>
                        )}
                        <div className="max-h-48 overflow-y-auto py-0.5 scrollbar-hide">
                            {options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={(e) => handleSelect(opt, e)}
                                    className={`w-full px-1 py-1 text-center text-[10px] transition-all
                                        ${opt === value
                                            ? 'bg-custom-blue-500/10 text-custom-blue-600 dark:text-custom-blue-400 font-bold'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-100'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};