import React from 'react';
import { Sparkles, Settings2, ArrowRight, Zap, Brain } from 'lucide-react';

interface WelcomeModalProps {
    onConfigure: () => void;
    onContinue: () => void;
    globalFont: 'sans' | 'serif' | 'mono';
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onConfigure, onContinue, globalFont }) => {
    return (
        <div className={`fixed inset-0 z-[110] flex items-center justify-center bg-zinc-950/20 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300 font-sans`}>
            <div 
                className="w-[440px] shadow-2xl overflow-hidden flex flex-col relative bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-zinc-800" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Clean & Minimal */}
                <div className="pt-10 pb-6 px-8 flex flex-col items-center justify-center border-b border-zinc-100 dark:border-white/5 bg-gradient-to-b from-zinc-50/50 to-transparent dark:from-white/5 dark:to-transparent">
                    <div className="w-16 h-16 bg-custom-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-custom-blue-600/20 mb-6 rotate-3">
                        <Brain size={32} className="text-white" />
                    </div>
                    
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
                        iamtired
                    </h1>
                    
                    <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[280px]">
                        The spatial operating system for your mind. Infinite canvas. AI-native.
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-4">
                    {/* Feature Pills */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                         <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 flex flex-col gap-1 hover:border-custom-blue-500/20 transition-colors">
                            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-semibold text-xs">
                                <Zap size={14} className="text-amber-500" /> Fast
                            </div>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Local-first & instant.</p>
                         </div>
                         <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 flex flex-col gap-1 hover:border-purple-500/20 transition-colors">
                            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-semibold text-xs">
                                <Sparkles size={14} className="text-purple-500" /> Smart
                            </div>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Built-in AI assistance.</p>
                         </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfigure}
                            className="w-full py-3 bg-custom-blue-600 hover:bg-custom-blue-500 dark:bg-custom-blue-600 dark:hover:bg-custom-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-custom-blue-600/20 dark:shadow-custom-blue-500/20 text-sm group"
                        >
                            <Settings2 size={16} className="group-hover:rotate-45 transition-transform duration-500" /> 
                            Configure AI Engine
                        </button>

                        <button
                            onClick={onContinue}
                            className="w-full py-3 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                        >
                            Continue without AI <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};