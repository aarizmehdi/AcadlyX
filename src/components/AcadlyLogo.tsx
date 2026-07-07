import React from 'react';

interface AcadlyLogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function AcadlyLogo({ className = 'w-10 h-10', iconOnly = false }: AcadlyLogoProps) {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Custom Designed Acadly Icon without background */}
      <div className={`relative flex-shrink-0 flex items-center justify-center ${className}`}>
        <img src="/favicon.svg" alt="Acadly Logo" className="w-full h-full transform transition-transform duration-300 hover:scale-110" />
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-white dark:via-indigo-100 dark:to-indigo-300 bg-clip-text text-transparent">
            Acadly
          </span>
          <span className="text-[9px] font-mono tracking-widest uppercase text-indigo-600 dark:text-indigo-400 font-extrabold">
            STUDY COMPANION
          </span>
        </div>
      )}
    </div>
  );
}
