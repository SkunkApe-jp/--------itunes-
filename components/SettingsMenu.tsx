import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AIConfig, AIProvider } from '../types';
import { X, Save, Key, Globe, Cpu, Settings2, ChevronDown } from 'lucide-react';

interface SettingsMenuProps {
    currentConfig: AIConfig;
    onSave: (config: AIConfig) => void;
    onClose: () => void;
    globalFont: 'sans' | 'serif' | 'mono';
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ currentConfig, onSave, onClose, globalFont }) => {
    const [provider, setProvider] = useState<AIProvider>(currentConfig.provider);
    const [apiKey, setApiKey] = useState(currentConfig.apiKey);
    const [baseUrl, setBaseUrl] = useState(currentConfig.baseUrl || '');
    const [model, setModel] = useState(currentConfig.model || '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Reset fields when provider changes to defaults (optional, but helpful)
    useEffect(() => {
        if (provider === currentConfig.provider) {
            setApiKey(currentConfig.apiKey);
            setBaseUrl(currentConfig.baseUrl || '');
            setModel(currentConfig.model || '');
        } else {
            if (provider === 'local') setBaseUrl('http://localhost:11434/v1');
            else if (provider === 'openrouter') setBaseUrl('https://openrouter.ai/api/v1');
            else if (provider === 'groq') setBaseUrl('https://api.groq.com/openai/v1');
            else setBaseUrl('');

            setModel('');
            setApiKey('');
        }
    }, [provider, currentConfig]);

    const handleSave = () => {
        onSave({ provider, apiKey, baseUrl, model });
        onClose();
    };

    const providers: AIProvider[] = ['gemini', 'openai', 'claude', 'openrouter', 'local', 'groq'];

    const rect = buttonRef.current?.getBoundingClientRect();

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/20 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200 font-sans`}>
            <div 
                className="w-[440px] shadow-2xl p-6 flex flex-col gap-6 force-glass" 
                onClick={(e) => e.stopPropagation()}
            >

                <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
                    <h2 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Settings2 size={18} className="text-custom-blue-600" />
                        AI Settings
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Taller container */}
                <div className="flex flex-col gap-6 h-[400px]">
                    {/* Provider Selection - Dropdown Style */}
                    <div className="flex flex-col gap-2 shrink-0">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Select Engine</label>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                ref={buttonRef}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-100/50 dark:bg-white/5 border border-[var(--glass-border)] text-zinc-900 dark:text-zinc-100 transition-all hover:bg-zinc-200/50 dark:hover:bg-white/10"
                            >
                                <span className="text-xs font-semibold capitalize">{provider}</span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} text-zinc-400`} />
                            </button>

                            {isDropdownOpen && createPortal(
                                <>
                                    <div className="fixed inset-0 z-[200]" onClick={() => setIsDropdownOpen(false)} />
                                    <div
                                        className="fixed z-[201] w-[392px] shadow-2xl animate-in fade-in zoom-in-95 duration-100 flex flex-col overflow-hidden py-1 force-glass"
                                        style={{
                                            top: rect ? rect.bottom + 4 : 0,
                                            left: rect ? rect.left : 0,
                                            // Explicit overrides to prevent any external interference
                                            backgroundColor: 'var(--glass-bg)',
                                            backdropFilter: 'blur(16px)',
                                            WebkitBackdropFilter: 'blur(16px)',
                                        }}
                                    >
                                        {providers.map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => {
                                                    setProvider(p);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full px-4 py-2.5 text-left text-xs capitalize transition-colors
                                                    ${provider === p
                                                        ? 'bg-blue-600 text-white font-bold'
                                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-100'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </>,
                                document.body
                            )}
                        </div>
                    </div>

                    <div className="h-px w-full bg-zinc-100 dark:bg-white/5 opacity-50 shrink-0" />

                    {/* Dynamic Form Area */}
                    <div className="flex flex-col gap-5 overflow-y-auto pr-1 custom-scrollbar">
                        {/* API Key */}
                        {provider !== 'local' ? (
                            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Key size={12} /> API Authorization
                                </label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={`Your ${provider} secret key`}
                                    className="w-full bg-zinc-100 dark:bg-black/40 border border-transparent focus:border-custom-blue-500 dark:border-white/5 dark:focus:border-custom-blue-500/50 px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5 opacity-40 select-none animate-in fade-in duration-200">
                                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Key size={12} /> API Authorization
                                </label>
                                <div className="w-full bg-zinc-50 dark:bg-white/[0.02] border border-dashed border-zinc-200 dark:border-white/10 px-3 py-2.5 text-xs text-zinc-400">
                                    Not required for local host
                                </div>
                            </div>
                        )}

                        {/* Base URL */}
                        {(provider === 'local' || provider === 'openrouter' || provider === 'openai' || provider === 'groq') ? (
                            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Globe size={12} /> Endpoint URI
                                </label>
                                <input
                                    type="text"
                                    value={baseUrl}
                                    onChange={(e) => setBaseUrl(e.target.value)}
                                    placeholder={provider === 'local' ? "http://localhost:11434/v1" : provider === 'groq' ? "https://api.groq.com/openai/v1" : "https://api.openai.com/v1"}
                                    className="w-full bg-zinc-100 dark:bg-black/40 border border-transparent focus:border-custom-blue-500 dark:border-white/5 dark:focus:border-custom-blue-500/50 px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5 opacity-40 select-none animate-in fade-in duration-200">
                                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Globe size={12} /> Endpoint URI
                                </label>
                                <div className="w-full bg-zinc-50 dark:bg-white/[0.02] border border-dashed border-zinc-200 dark:border-white/10 px-3 py-2.5 text-xs text-zinc-400">
                                    Using default provider gateway
                                </div>
                            </div>
                        )}

                        {/* Model Name */}
                        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Cpu size={12} /> Active Model
                            </label>
                            <input
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder={
                                    provider === 'gemini' ? 'gemini-1.5-flash' :
                                        provider === 'openai' ? 'gpt-4o' :
                                            provider === 'claude' ? 'claude-3-5-sonnet-latest' :
                                                provider === 'groq' ? 'meta-llama/llama-4-scout-17b-16e-instruct' :
                                                    'llama3'
                                }
                                className="w-full bg-zinc-100 dark:bg-black/40 border border-transparent focus:border-custom-blue-500 dark:border-white/5 dark:focus:border-custom-blue-500/50 px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-white/10">
                    <button
                        onClick={handleSave}
                        className="w-full bg-custom-blue-600 hover:bg-custom-blue-500 text-white font-bold py-3.5 text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-custom-blue-500/20 hover:shadow-custom-blue-500/40"
                    >
                        <Save size={16} /> Deploy Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};