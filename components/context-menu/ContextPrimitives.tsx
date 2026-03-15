import React from 'react';

export interface ContextMenuItemProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'danger' | 'ai' | 'standard';
    disabled?: boolean;
    subtitle?: string;
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({ label, icon, onClick, variant = 'standard', disabled, subtitle }) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onClick();
        }}
        disabled={disabled}
        className={`w-full flex items-start gap-3 px-3 py-2 transition-colors text-left
            ${disabled 
                ? 'opacity-30 cursor-not-allowed' 
                : variant === 'danger'
                    ? 'text-red-500 hover:bg-red-500/10' 
                    : variant === 'ai'
                        ? 'text-custom-blue-500 dark:text-custom-blue-400 hover:bg-custom-blue-500/10'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
    >
        <span className={`mt-0.5 shrink-0 ${
            variant === 'danger' ? 'text-red-500' : 
            variant === 'ai' ? 'text-custom-blue-500 dark:text-custom-blue-400' : 
            'text-zinc-400 dark:text-zinc-500'
        }`}>{icon}</span>
        <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium truncate">{label}</span>
            {subtitle && <span className="text-[10px] opacity-70 leading-tight">{subtitle}</span>}
        </div>
    </button>
);

export const ContextMenuSection: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-1">
        {title && (
            <div className="px-3 py-1 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                {title}
            </div>
        )}
        {children}
    </div>
);