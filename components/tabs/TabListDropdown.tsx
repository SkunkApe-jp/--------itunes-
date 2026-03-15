import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import { Tab } from '../../types/tabTypes';

interface TabListDropdownProps {
    tabs: Tab[];
    activeTabId: string;
    onSwitchTab: (tabId: string) => void;
    onReorderTabs: (startIndex: number, endIndex: number) => void;
    onClose: () => void;
    anchorRect?: DOMRect;
    globalFont: 'sans' | 'serif' | 'mono';
}

export const TabListDropdown: React.FC<TabListDropdownProps> = ({ tabs, activeTabId, onSwitchTab, onReorderTabs, onClose, anchorRect, globalFont }) => {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        // Autofocus search on mount
        const timer = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return null;

    const filteredTabs = tabs.filter(tab =>
        tab.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDragStart = (e: React.DragEvent, index: number) => {
        // If searching, find the actual index in the full tabs array
        const actualIndex = tabs.findIndex(t => t.id === filteredTabs[index].id);
        setDraggedIndex(actualIndex);
        e.dataTransfer.effectAllowed = 'move';
        // Add a class for visual feedback during drag
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.4';
        }
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        const actualIndex = tabs.findIndex(t => t.id === filteredTabs[index].id);
        if (draggedIndex === null || draggedIndex === actualIndex) return;
        setDragOverIndex(actualIndex);
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        const actualIndex = tabs.findIndex(t => t.id === filteredTabs[index].id);
        if (draggedIndex !== null && draggedIndex !== actualIndex) {
            onReorderTabs(draggedIndex, actualIndex);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
    };

    return createPortal(
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[100]" onClick={onClose} />

            {/* Dropdown - Portal mounted for perfect blur rendering */}
            <div
                className={`fixed z-[101] w-64 shadow-2xl animate-in fade-in zoom-in-95 duration-100 flex flex-col overflow-hidden border border-[var(--glass-border)] font-sans pointer-events-auto`}
                style={{
                    top: anchorRect ? anchorRect.bottom + 4 : 40,
                    right: window.innerWidth - (anchorRect?.right || 0) + 4,
                    backgroundColor: 'var(--glass-bg)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    transition: 'background-color 0.3s, border-color 0.3s'
                }}
            >
                <div className="p-2.5 border-b border-[var(--glass-border)] flex items-center justify-between bg-zinc-50/50 dark:bg-white/5 shrink-0">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                        Tab Navigation
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200/50 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 font-mono">
                        {tabs.length} TABS
                    </span>
                </div>

                <div className="px-2 py-1.5 bg-black/5 dark:bg-white/5 border-b border-[var(--glass-border)] flex items-center gap-2">
                    <Search size={12} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search tabs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs w-full text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                    />
                </div>

                <div className="max-h-[70vh] overflow-y-auto py-1 scrollbar-hide">
                    {filteredTabs.length > 0 ? (
                        filteredTabs.map((tab, index) => {
                            const actualIndex = tabs.findIndex(t => t.id === tab.id);
                            const isBeingDraggedOver = dragOverIndex === actualIndex;

                            return (
                                <button
                                    key={tab.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={() => setDragOverIndex(null)}
                                    onDragEnd={handleDragEnd}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onClick={() => { onSwitchTab(tab.id); onClose(); }}
                                    className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-all group relative
                                        ${tab.id === activeTabId
                                            ? 'bg-custom-blue-500/10 text-custom-blue-600 dark:text-custom-blue-400 font-semibold'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-100'
                                        }`}
                                >
                                    {isBeingDraggedOver && (
                                        <div className={`absolute left-0 right-0 h-0.5 bg-custom-blue-500 z-10 ${draggedIndex !== null && actualIndex < draggedIndex ? 'top-0' : 'bottom-0'}`} />
                                    )}
                                    <span className={`text-[10px] w-5 shrink-0 transition-colors ${tab.id === activeTabId ? 'text-custom-blue-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                        {(actualIndex + 1).toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-xs truncate flex-1">{tab.title}</span>
                                    {tab.id === activeTabId && (
                                        <span className="text-[10px] text-custom-blue-500 dark:text-custom-blue-400 animate-pulse">●</span>
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-4 py-8 text-center">
                            <Search size={20} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-700 opacity-50" />
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 font-medium italic">No tabs matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
};