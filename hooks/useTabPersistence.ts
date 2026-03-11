
import { useRef, useEffect, useCallback } from 'react';
import { ToolMode } from '../types';
import { TabState } from '../types/tabTypes';
import { saveToDB } from '../utils/db';

const AUTO_SAVE_INTERVAL_MS = 30000;

interface UseTabPersistenceProps {
    getTabState: () => TabState;
    loadTabState: (state: TabState) => void;

    globalHeaderFont: 'sans' | 'serif' | 'mono';
    globalHeaderFontSize: number;
    globalHeaderColor: string;

    globalBodyFont: 'sans' | 'serif' | 'mono';
    globalBodyFontSize: number;
    globalColor: string;

    globalCaptionFont: 'sans' | 'serif' | 'mono';
    globalCaptionFontSize: number;
    globalCaptionColor: string;

    globalBackgroundColor: string;
    globalBlur: boolean;
    globalHeaderGrayLayer: boolean;

    isDarkMode: boolean;
    isAutoSave: boolean;
    showGrid: boolean;
    snapToGrid: boolean;
    showStars: boolean;
    customBackground: string | null;
    toolMode: ToolMode;

    setGlobalHeaderFont: (f: 'sans' | 'serif' | 'mono') => void;
    setGlobalHeaderFontSize: (s: number) => void;
    setGlobalHeaderColor: (c: string) => void;

    setGlobalBodyFont: (f: 'sans' | 'serif' | 'mono') => void;
    setGlobalBodyFontSize: (s: number) => void;
    setGlobalColor: (c: string) => void;

    setGlobalCaptionFont: (f: 'sans' | 'serif' | 'mono') => void;
    setGlobalCaptionFontSize: (s: number) => void;
    setGlobalCaptionColor: (c: string) => void;

    setGlobalBackgroundColor: (c: string) => void;
    setGlobalBlur: (b: boolean) => void;
    setGlobalHeaderGrayLayer: (b: boolean) => void;

    setIsDarkMode: (v: boolean) => void;
    setIsAutoSave: (v: boolean) => void;
    setShowGrid: (v: boolean) => void;
    setSnapToGrid: (v: boolean) => void;
    setShowStars: (v: boolean) => void;
    setCustomBackground: (bg: string | null) => void;
    setToolMode: (t: ToolMode) => void;
    setLastSaved: (d: Date) => void;
}

export const useTabPersistence = ({
    getTabState, loadTabState,
    globalHeaderFont, globalHeaderFontSize, globalHeaderColor,
    globalBodyFont, globalBodyFontSize, globalColor,
    globalCaptionFont, globalCaptionFontSize, globalCaptionColor,
    globalBackgroundColor, globalBlur, globalHeaderGrayLayer,
    isDarkMode, isAutoSave, showGrid, snapToGrid, showStars, customBackground, toolMode,
    setGlobalHeaderFont, setGlobalHeaderFontSize, setGlobalHeaderColor,
    setGlobalBodyFont, setGlobalBodyFontSize, setGlobalColor,
    setGlobalCaptionFont, setGlobalCaptionFontSize, setGlobalCaptionColor,
    setGlobalBackgroundColor, setGlobalBlur, setGlobalHeaderGrayLayer,
    setIsDarkMode, setIsAutoSave, setShowGrid, setSnapToGrid, setShowStars, setCustomBackground, setToolMode, setLastSaved
}: UseTabPersistenceProps) => {

    const getTabStateRef = useRef(getTabState);
    const globalHeaderFontRef = useRef(globalHeaderFont);
    const globalHeaderFontSizeRef = useRef(globalHeaderFontSize);
    const globalHeaderColorRef = useRef(globalHeaderColor);

    const globalBodyFontRef = useRef(globalBodyFont);
    const globalBodyFontSizeRef = useRef(globalBodyFontSize);
    const globalColorRef = useRef(globalColor);

    const globalCaptionFontRef = useRef(globalCaptionFont);
    const globalCaptionFontSizeRef = useRef(globalCaptionFontSize);
    const globalCaptionColorRef = useRef(globalCaptionColor);

    const globalBackgroundColorRef = useRef(globalBackgroundColor);
    const globalBlurRef = useRef(globalBlur);
    const globalHeaderGrayLayerRef = useRef(globalHeaderGrayLayer);

    const isDarkModeRef = useRef(isDarkMode);
    const isAutoSaveRef = useRef(isAutoSave);
    const showGridRef = useRef(showGrid);
    const snapToGridRef = useRef(snapToGrid);
    const showStarsRef = useRef(showStars);
    const customBackgroundRef = useRef(customBackground);
    const toolModeRef = useRef(toolMode);

    const isInitializedRef = useRef(false);

    useEffect(() => { getTabStateRef.current = getTabState; }, [getTabState]);

    useEffect(() => { globalHeaderFontRef.current = globalHeaderFont; }, [globalHeaderFont]);
    useEffect(() => { globalHeaderFontSizeRef.current = globalHeaderFontSize; }, [globalHeaderFontSize]);
    useEffect(() => { globalHeaderColorRef.current = globalHeaderColor; }, [globalHeaderColor]);

    useEffect(() => { globalBodyFontRef.current = globalBodyFont; }, [globalBodyFont]);
    useEffect(() => { globalBodyFontSizeRef.current = globalBodyFontSize; }, [globalBodyFontSize]);
    useEffect(() => { globalColorRef.current = globalColor; }, [globalColor]);

    useEffect(() => { globalCaptionFontRef.current = globalCaptionFont; }, [globalCaptionFont]);
    useEffect(() => { globalCaptionFontSizeRef.current = globalCaptionFontSize; }, [globalCaptionFontSize]);
    useEffect(() => { globalCaptionColorRef.current = globalCaptionColor; }, [globalCaptionColor]);

    useEffect(() => { globalBackgroundColorRef.current = globalBackgroundColor; }, [globalBackgroundColor]);
    useEffect(() => { globalBlurRef.current = globalBlur; }, [globalBlur]);
    useEffect(() => { globalHeaderGrayLayerRef.current = globalHeaderGrayLayer; }, [globalHeaderGrayLayer]);

    useEffect(() => { isDarkModeRef.current = isDarkMode; }, [isDarkMode]);
    useEffect(() => { isAutoSaveRef.current = isAutoSave; }, [isAutoSave]);
    useEffect(() => { showGridRef.current = showGrid; }, [showGrid]);
    useEffect(() => { snapToGridRef.current = snapToGrid; }, [snapToGrid]);
    useEffect(() => { showStarsRef.current = showStars; }, [showStars]);
    useEffect(() => { customBackgroundRef.current = customBackground; }, [customBackground]);
    useEffect(() => { toolModeRef.current = toolMode; }, [toolMode]);

    const markInitialized = useCallback(() => {
        isInitializedRef.current = true;
    }, []);

    const saveData = useCallback(async (toStorage = true) => {
        if (toStorage && !isInitializedRef.current) return null;

        const tabState = getTabStateRef.current();
        const data = {
            version: 3,
            timestamp: Date.now(),
            tabState,
            globalHeaderFont: globalHeaderFontRef.current,
            globalHeaderFontSize: globalHeaderFontSizeRef.current,
            globalHeaderColor: globalHeaderColorRef.current,
            globalBodyFont: globalBodyFontRef.current,
            globalBodyFontSize: globalBodyFontSizeRef.current,
            globalColor: globalColorRef.current,
            globalCaptionFont: globalCaptionFontRef.current,
            globalCaptionFontSize: globalCaptionFontSizeRef.current,
            globalCaptionColor: globalCaptionColorRef.current,
            globalBackgroundColor: globalBackgroundColorRef.current,
            globalBlur: globalBlurRef.current,
            globalHeaderGrayLayer: globalHeaderGrayLayerRef.current,
            isDarkMode: isDarkModeRef.current,
            isAutoSave: isAutoSaveRef.current,
            showGrid: showGridRef.current,
            snapToGrid: snapToGridRef.current,
            showStars: showStarsRef.current,
            customBackground: customBackgroundRef.current,
            toolMode: toolModeRef.current
        };

        if (toStorage) {
            try {
                await saveToDB('iamtired_save', data);
                // Also update cookie for theme persistence before react load
                document.cookie = `theme=${isDarkModeRef.current ? 'dark' : 'light'}; path=/; max-age=31536000`;
                setLastSaved(new Date());
            } catch (e) {
                console.error("Failed to save to DB:", e);
            }
        }
        return data;
    }, [setLastSaved]);

    const loadData = useCallback((data: any) => {
        if (!data) return;

        if (data.version === 1 && data.nodes && data.connections) {
            // Legacy handling
            const legacyTab = {
                id: `tab-legacy-${Date.now()}`,
                title: 'Canvas 1',
                nodes: data.nodes,
                connections: data.connections,
                viewport: data.viewport || { x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 1 }
            };
            loadTabState({ tabs: [legacyTab], activeTabId: legacyTab.id });
        }
        else if ((data.version === 2 || data.version === 3) && data.tabState) {
            loadTabState(data.tabState);
        }

        // Font Loading with fallback
        if (data.globalFont && !data.globalHeaderFont && !data.globalBodyFont) {
            setGlobalHeaderFont(data.globalFont);
            setGlobalBodyFont(data.globalFont);
        } else {
            if (data.globalHeaderFont) setGlobalHeaderFont(data.globalHeaderFont);
            if (data.globalBodyFont) setGlobalBodyFont(data.globalBodyFont);
        }

        if (data.globalHeaderFontSize) setGlobalHeaderFontSize(data.globalHeaderFontSize);
        if (data.globalHeaderColor) setGlobalHeaderColor(data.globalHeaderColor);

        if (data.globalBodyFontSize) setGlobalBodyFontSize(data.globalBodyFontSize);
        if (data.globalColor) setGlobalColor(data.globalColor);

        if (data.globalCaptionFont) setGlobalCaptionFont(data.globalCaptionFont);
        if (data.globalCaptionFontSize) setGlobalCaptionFontSize(data.globalCaptionFontSize);
        if (data.globalCaptionColor) setGlobalCaptionColor(data.globalCaptionColor);

        if (data.globalBackgroundColor) setGlobalBackgroundColor(data.globalBackgroundColor);
        if (data.globalBlur !== undefined) setGlobalBlur(data.globalBlur);
        if (data.globalHeaderGrayLayer !== undefined) setGlobalHeaderGrayLayer(data.globalHeaderGrayLayer);

        if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
        if (data.isAutoSave !== undefined) setIsAutoSave(data.isAutoSave);
        if (data.showGrid !== undefined) setShowGrid(data.showGrid);
        if (data.snapToGrid !== undefined) setSnapToGrid(data.snapToGrid);
        if (data.showStars !== undefined) setShowStars(data.showStars);
        if (data.customBackground !== undefined) setCustomBackground(data.customBackground);
        if (data.toolMode !== undefined) setToolMode(data.toolMode);
        setLastSaved(data.timestamp ? new Date(data.timestamp) : new Date());

        markInitialized();
    }, [loadTabState, setGlobalHeaderFont, setGlobalHeaderFontSize, setGlobalHeaderColor, setGlobalBodyFont, setGlobalBodyFontSize, setGlobalColor, setGlobalCaptionFont, setGlobalCaptionFontSize, setGlobalCaptionColor, setGlobalBackgroundColor, setGlobalBlur, setGlobalHeaderGrayLayer, setIsDarkMode, setIsAutoSave, setShowGrid, setSnapToGrid, setShowStars, setCustomBackground, setToolMode, setLastSaved, markInitialized]);

    useEffect(() => {
        if (!isAutoSave) return;
        const interval = setInterval(() => saveData(true), AUTO_SAVE_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [isAutoSave, saveData]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && isAutoSaveRef.current) {
                saveData(true);
            }
        };
        const handleBeforeUnload = () => {
            if (isAutoSaveRef.current) {
                saveData(true);
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [saveData]);

    return { loadData, saveData, markInitialized };
};
