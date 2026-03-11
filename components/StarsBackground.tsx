import React, { useMemo } from 'react';

interface StarsBackgroundProps {
    className?: string;
}

export const StarsBackground: React.FC<StarsBackgroundProps> = ({ className }) => {
    const { layer1, layer2, layer3 } = useMemo(() => {
        const rand = (max: number) => Math.floor(Math.random() * max);
        const makeShadows = (count: number) => {
            return Array.from({ length: count })
                .map(() => `${rand(2000)}px ${rand(2000)}px #FFF`)
                .join(', ');
        };

        return {
            layer1: makeShadows(700),
            layer2: makeShadows(240),
            layer3: makeShadows(120),
        };
    }, []);

    return (
        <div className={className || "pointer-events-none absolute inset-0 overflow-hidden z-0 select-none"}>
            <div
                className="absolute top-0 left-0"
                style={{
                    width: 1,
                    height: 1,
                    background: 'transparent',
                    boxShadow: layer1,
                    animation: 'animStar 50s linear infinite',
                }}
            />
            <div
                className="absolute top-[2000px] left-0"
                style={{
                    width: 1,
                    height: 1,
                    background: 'transparent',
                    boxShadow: layer1,
                    animation: 'animStar 50s linear infinite',
                }}
            />

            <div
                className="absolute top-0 left-0"
                style={{
                    width: 2,
                    height: 2,
                    background: 'transparent',
                    boxShadow: layer2,
                    animation: 'animStar 100s linear infinite',
                }}
            />
            <div
                className="absolute top-[2000px] left-0"
                style={{
                    width: 2,
                    height: 2,
                    background: 'transparent',
                    boxShadow: layer2,
                    animation: 'animStar 100s linear infinite',
                }}
            />

            <div
                className="absolute top-0 left-0"
                style={{
                    width: 3,
                    height: 3,
                    background: 'transparent',
                    boxShadow: layer3,
                    animation: 'animStar 150s linear infinite',
                }}
            />
            <div
                className="absolute top-[2000px] left-0"
                style={{
                    width: 3,
                    height: 3,
                    background: 'transparent',
                    boxShadow: layer3,
                    animation: 'animStar 150s linear infinite',
                }}
            />
        </div>
    );
};
