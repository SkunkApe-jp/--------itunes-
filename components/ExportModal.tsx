import React, { useState, useEffect, useRef } from 'react';
import { X, Download, FileJson } from 'lucide-react';

interface ExportModalProps {
    onExport: (filename: string) => void;
    onClose: () => void;
    defaultFilename?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onExport, onClose, defaultFilename }) => {
    const [filename, setFilename] = useState(defaultFilename || `iamtired-backup-${new Date().toISOString().slice(0, 10)}`);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 50);
    }, []);

    const handleExport = () => {
        if (filename.trim()) {
            onExport(filename.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-950/20 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200 font-sans" onClick={onClose}>
            <div 
                className="w-[380px] shadow-2xl p-5 flex flex-col gap-4 force-glass" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-3">
                    <h2 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wide">
                        <FileJson size={14} className="text-custom-blue-600 dark:text-custom-blue-400" />
                        Export to JSON
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        Filename
                    </label>
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleExport();
                                if (e.key === 'Escape') onClose();
                            }}
                            className="w-full bg-zinc-100 dark:bg-black/40 border border-transparent focus:border-custom-blue-500 dark:border-white/5 dark:focus:border-custom-blue-500/50 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 rounded-sm pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 pointer-events-none select-none">
                            .json
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 bg-zinc-100/50 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 font-semibold text-xs transition-colors rounded-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex-1 py-2 bg-custom-blue-600 hover:bg-custom-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-custom-blue-500/20 hover:shadow-custom-blue-500/40 rounded-sm"
                    >
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>
        </div>
    );
};