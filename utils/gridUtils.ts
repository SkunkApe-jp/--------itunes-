import React from 'react';
import { Viewport, Position } from '../types';

export const SNAP_SIZE = 20;

export const snap = (val: number): number => {
    return Math.round(val / SNAP_SIZE) * SNAP_SIZE;
};

import dotPattern from '../src/assets/dotted-pattern.svg';
import dotPatternDark from '../src/assets/dotted-pattern-dark.svg';

interface GridBackgroundOptions {
    viewport: Viewport;
    showGrid: boolean;
    isDarkMode: boolean;
    customBackground?: string | null;
}

export const getGridBackground = ({ viewport, showGrid, isDarkMode, customBackground }: GridBackgroundOptions): React.CSSProperties => {
    const bgSize = 85.5;
    const dotSvg = isDarkMode ? dotPatternDark : dotPattern;

    if (customBackground) {
        if (!showGrid) {
            return {
                backgroundImage: `url("${customBackground}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            };
        }

        return {
            backgroundImage: `url("${dotSvg}"), url("${customBackground}")`,
            backgroundSize: `${bgSize}px ${bgSize}px, cover`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px, center`,
            backgroundRepeat: 'repeat, no-repeat'
        };
    }

    if (!showGrid) return {};

    return {
        backgroundImage: `url("${dotSvg}")`,
        backgroundSize: `${bgSize}px ${bgSize}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        backgroundRepeat: 'repeat'
    };
};