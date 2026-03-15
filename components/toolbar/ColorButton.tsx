import React from 'react';

interface ColorButtonProps {
    color: string;
    current: string;
    onClick: () => void;
}

export const ColorButton: React.FC<ColorButtonProps> = ({ color, current, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-4 h-4 rounded-full transition-all border ${
        current === color 
          ? 'border-custom-blue-500 ring-1 ring-custom-blue-500/50' 
          : 'border-zinc-200 dark:border-white/10 hover:scale-110'
      }`}
      style={{ backgroundColor: color }}
    />
  );
};