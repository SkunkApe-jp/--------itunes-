import { useState } from 'react';
import { ToolMode, AIConfig } from '../types';

const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
};

export const useAppState = () => {
    const [toolMode, setToolMode] = useState<ToolMode>(ToolMode.SELECT);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [isAutoSave, setIsAutoSave] = useState(true);
    const [showGrid, setShowGrid] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(true);

    // Global Styles
    const [globalHeaderFont, setGlobalHeaderFont] = useState<'sans' | 'serif' | 'mono'>('sans');
    const [globalHeaderFontSize, setGlobalHeaderFontSize] = useState<number>(18);
    const [globalHeaderColor, setGlobalHeaderColor] = useState<string>('var(--node-text-0)');

    const [globalBodyFont, setGlobalBodyFont] = useState<'sans' | 'serif' | 'mono'>('sans');
    const [globalBodyFontSize, setGlobalBodyFontSize] = useState<number>(15);
    const [globalColor, setGlobalColor] = useState<string>('var(--node-text-0)'); // Serves as globalBodyColor

    const [globalCaptionFont, setGlobalCaptionFont] = useState<'sans' | 'serif' | 'mono'>('sans');
    const [globalCaptionFontSize, setGlobalCaptionFontSize] = useState<number>(11);
    const [globalCaptionColor, setGlobalCaptionColor] = useState<string>('var(--node-text-3)');

    // Global Node Styles
    const [globalBackgroundColor, setGlobalBackgroundColor] = useState<string>('var(--node-bg-0)');
    const [globalBlur, setGlobalBlur] = useState<boolean>(false);
    const [globalHeaderGrayLayer, setGlobalHeaderGrayLayer] = useState<boolean>(true);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const cookieTheme = getCookie('theme');
        if (cookieTheme) return cookieTheme === 'dark';
        return true;
    });
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // AI Config & Onboarding State
    const [showSettings, setShowSettings] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [aiConfig, setAiConfig] = useState<AIConfig>({
        provider: 'gemini',
        apiKey: '',
        model: 'gemini-3-flash-preview'
    });

    const [showStars, setShowStars] = useState(false);

    // Custom Background Image
    const [customBackground, setCustomBackground] = useState<string | null>(null);

    return {
        toolMode, setToolMode,
        isSpacePressed, setIsSpacePressed,
        isAutoSave, setIsAutoSave,
        showGrid, setShowGrid,
        snapToGrid, setSnapToGrid,
        showStars, setShowStars,
        globalHeaderFont, setGlobalHeaderFont,
        globalHeaderFontSize, setGlobalHeaderFontSize,
        globalHeaderColor, setGlobalHeaderColor,
        globalBodyFont, setGlobalBodyFont,
        globalBodyFontSize, setGlobalBodyFontSize,
        globalColor, setGlobalColor,
        globalCaptionFont, setGlobalCaptionFont,
        globalCaptionFontSize, setGlobalCaptionFontSize,
        globalCaptionColor, setGlobalCaptionColor,
        globalBackgroundColor, setGlobalBackgroundColor,
        globalBlur, setGlobalBlur,
        globalHeaderGrayLayer, setGlobalHeaderGrayLayer,
        isDarkMode, setIsDarkMode,
        lastSaved, setLastSaved,
        showSettings, setShowSettings,
        showWelcome, setShowWelcome,
        aiConfig, setAiConfig,
        customBackground, setCustomBackground
    };
};