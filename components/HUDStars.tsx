import React, { useMemo } from 'react';

interface HUDStarsProps {
  show?: boolean;
}

export const HUDStars: React.FC<HUDStarsProps> = ({ show = true }) => {
  // Smaller, denser stars for HUD - positioned only in bottom-right area
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      // Constrain to bottom-right quadrant-ish area
      top: `${70 + Math.random() * 30}%`,
      left: `${70 + Math.random() * 30}%`,
      size: Math.random() * 1.5 + 0.5,
      duration: `${Math.random() * 2 + 2}s`,
      delay: `${Math.random() * 3}s`,
    }));
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[-1] select-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white/30 dark:bg-white/20 rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `hudTwinkle ${star.duration} ease-in-out infinite ${star.delay}`,
          }}
        />
      ))}
    </div>
  );
};

export const HUDStars2: React.FC<HUDStarsProps> = ({ show = true }) => {
  const stars = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      top: `${60 + Math.random() * 40}%`,
      left: `${60 + Math.random() * 40}%`,
      size: Math.random() * 2.5 + 1,
      duration: `${Math.random() * 4 + 4}s`,
      delay: `${Math.random() * 4}s`,
    }));
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[-2] select-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-purple-200/20 dark:bg-purple-100/10 rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `hudTwinkle ${star.duration} ease-in-out infinite ${star.delay}`,
          }}
        />
      ))}
    </div>
  );
};
