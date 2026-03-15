import React from 'react';

interface FontButtonProps {
    font: string;
    current: string;
    onClick: () => void;
    label: string;
}

export const FontButton: React.FC<FontButtonProps> = ({ font, current, onClick, label }) => {
    const fontClass = font === 'serif' ? 'font-serif' : font === 'mono' ? 'font-mono' : 'font-sans';
    return (
        <button
            onClick={onClick}
            className={`px-1.5 py-0.5 text-[10px] h-7 min-w-[32px] flex items-center justify-center transition-colors rounded ${current === font ? 'text-custom-blue-600 dark:text-custom-blue-400 bg-custom-blue-500/10 font-bold' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'} ${fontClass}`}
        >
            {label}
        </button>
    );
};